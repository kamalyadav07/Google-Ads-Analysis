const { getPool } = require('../config/db');

// City approximation dictionary for common mock/local tests
const GEO_REGIONS = [
  { city: 'Delhi', state: 'Delhi NCR' },
  { city: 'Noida', state: 'Uttar Pradesh' },
  { city: 'Gurgaon', state: 'Haryana' },
  { city: 'Mumbai', state: 'Maharashtra' },
  { city: 'Bengaluru', state: 'Karnataka' },
  { city: 'Hyderabad', state: 'Telangana' },
  { city: 'Pune', state: 'Maharashtra' },
  { city: 'Chennai', state: 'Tamil Nadu' },
  { city: 'Kolkata', state: 'West Bengal' }
];

function approximateGeoFromHeader(ipHeader) {
  // Hash IP or use first segment to deterministically map without storing raw IP
  if (!ipHeader || ipHeader === '127.0.0.1' || ipHeader === '::1') {
    return GEO_REGIONS[0]; // Default to Delhi NCR for local test
  }
  let sum = 0;
  for (let i = 0; i < ipHeader.length; i++) {
    sum += ipHeader.charCodeAt(i);
  }
  return GEO_REGIONS[sum % GEO_REGIONS.length];
}

/**
 * Ingestion Service: High-throughput ingestion of batched visitor telemetry
 */
class IngestionService {
  async processBatch(payload, clientIp = '') {
    if (!payload || !payload.session_id || !payload.visitor_token) {
      throw new Error('Invalid payload: session_id and visitor_token are required.');
    }

    const pool = getPool();
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      const {
        session_id,
        visitor_token,
        landing_page_slug = 'cctv',
        referrer = '',
        gclid = null,
        utm_source = null,
        utm_medium = null,
        utm_campaign = null,
        utm_term = null,
        utm_content = null,
        device = {},
        events = []
      } = payload;

      const geo = approximateGeoFromHeader(clientIp);

      // 1. Upsert Visitor
      const deviceCategory = (device.category && ['mobile', 'tablet', 'desktop'].includes(device.category))
        ? device.category
        : 'desktop';

      await conn.query(`
        INSERT INTO \`visitors\`
          (\`visitor_token\`, \`device_category\`, \`browser\`, \`os\`, \`screen_width\`, \`screen_height\`, \`city\`, \`state\`, \`country\`)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'India')
        ON DUPLICATE KEY UPDATE
          \`last_seen_at\` = CURRENT_TIMESTAMP,
          \`device_category\` = VALUES(\`device_category\`),
          \`browser\` = VALUES(\`browser\`),
          \`os\` = VALUES(\`os\`),
          \`screen_width\` = VALUES(\`screen_width\`),
          \`screen_height\` = VALUES(\`screen_height\`)
      `, [
        visitor_token,
        deviceCategory,
        device.browser || 'Unknown',
        device.os || 'Unknown',
        device.screenWidth || null,
        device.screenHeight || null,
        geo.city,
        geo.state
      ]);

      const [vRows] = await conn.query('SELECT `id` FROM `visitors` WHERE `visitor_token` = ?', [visitor_token]);
      const visitorDbId = vRows[0] ? vRows[0].id : null;

      // 2. Calculate Session aggregates from events in batch
      let batchMaxScroll = 0;
      let hasCtaOrForm = false;

      for (const ev of events) {
        if (ev.event_type === 'scroll_milestone' && ev.metadata && ev.metadata.milestone) {
          if (ev.metadata.milestone > batchMaxScroll) batchMaxScroll = ev.metadata.milestone;
        }
        if (['cta_click', 'whatsapp_click', 'phone_click', 'form_start', 'form_submit'].includes(ev.event_type)) {
          hasCtaOrForm = true;
        }
      }

      // Upsert Session
      await conn.query(`
        INSERT INTO \`sessions\`
          (\`session_id\`, \`visitor_id\`, \`landing_page_slug\`, \`referrer\`, \`gclid\`, \`utm_source\`, \`utm_medium\`, \`utm_campaign\`, \`utm_term\`, \`utm_content\`, \`max_scroll_depth\`, \`is_engaged\`, \`is_bounce\`)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          \`max_scroll_depth\` = GREATEST(\`max_scroll_depth\`, VALUES(\`max_scroll_depth\`)),
          \`is_engaged\` = IF(VALUES(\`is_engaged\`) = 1 OR \`is_engaged\` = 1, 1, 0),
          \`is_bounce\` = IF(VALUES(\`max_scroll_depth\`) >= 50 OR VALUES(\`is_engaged\`) = 1, 0, \`is_bounce\`),
          \`duration_seconds\` = TIMESTAMPDIFF(SECOND, \`started_at\`, CURRENT_TIMESTAMP)
      `, [
        session_id,
        visitorDbId,
        landing_page_slug,
        referrer ? referrer.substring(0, 500) : null,
        gclid ? gclid.substring(0, 255) : null,
        utm_source,
        utm_medium,
        utm_campaign,
        utm_term,
        utm_content,
        batchMaxScroll,
        (batchMaxScroll >= 50 || hasCtaOrForm) ? 1 : 0,
        (batchMaxScroll >= 50 || hasCtaOrForm) ? 0 : 1
      ]);

      // 3. Insert Events in Bulk
      for (const ev of events) {
        const metadataJson = ev.metadata ? JSON.stringify(ev.metadata) : null;
        await conn.query(`
          INSERT INTO \`events\` 
            (\`session_id\`, \`event_type\`, \`element_id\`, \`element_text\`, \`element_location\`, \`metadata\`, \`created_at\`)
          VALUES (?, ?, ?, ?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP))
        `, [
          session_id,
          ev.event_type,
          ev.element_id || null,
          ev.element_text || null,
          ev.element_location || 'middle',
          metadataJson,
          ev.timestamp ? new Date(ev.timestamp) : null
        ]);

        // Form field event logging
        if (ev.event_type === 'form_field_dwell' && ev.metadata) {
          await conn.query(`
            INSERT INTO \`form_field_events\`
              (\`session_id\`, \`form_id\`, \`field_name\`, \`dwell_time_ms\`, \`was_abandoned\`)
            VALUES (?, ?, ?, ?, 0)
          `, [
            session_id,
            ev.element_id || 'form',
            ev.metadata.field_name || 'unnamed',
            ev.metadata.dwell_ms || 0
          ]);
        } else if (ev.event_type === 'form_error' && ev.metadata) {
          await conn.query(`
            INSERT INTO \`form_field_events\`
              (\`session_id\`, \`form_id\`, \`field_name\`, \`error_type\`, \`was_abandoned\`)
            VALUES (?, ?, ?, ?, 0)
          `, [
            session_id,
            ev.element_id || 'form',
            ev.metadata.field_name || 'unnamed',
            ev.metadata.error_message || 'validation_error'
          ]);
        } else if (ev.event_type === 'form_abandon' && ev.metadata) {
          await conn.query(`
            INSERT INTO \`form_field_events\`
              (\`session_id\`, \`form_id\`, \`field_name\`, \`was_abandoned\`)
            VALUES (?, ?, ?, 1)
          `, [
            session_id,
            ev.element_id || 'form',
            ev.metadata.abandoned_field || 'unknown'
          ]);
        }

        // Technical errors
        if (['js_error', 'promise_rejection', 'core_web_vitals'].includes(ev.event_type)) {
          await conn.query(`
            INSERT INTO \`technical_health_logs\`
              (\`session_id\`, \`error_type\`, \`message\`, \`stack_snippet\`, \`page_url\`, \`lcp_ms\`)
            VALUES (?, ?, ?, ?, ?, ?)
          `, [
            session_id,
            ev.event_type,
            ev.metadata ? (ev.metadata.message || ev.event_type) : ev.event_type,
            ev.metadata ? ev.metadata.stack : null,
            payload.page_url || null,
            (ev.event_type === 'core_web_vitals' && ev.metadata) ? ev.metadata.value_ms : null
          ]);
        }
      }

      await conn.commit();
      return { success: true, processedEvents: events.length, session_id };
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }
}

module.exports = new IngestionService();
