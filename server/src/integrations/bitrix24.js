const { getPool } = require('../config/db');
const socketManager = require('../sockets/socketManager');

class Bitrix24Connector {
  /**
   * Process inbound webhook from Bitrix24
   * Supported events: ONCRMLEADADD, ONCRMLEADUPDATE, ONCRMDEALADD, ONCRMDEALUPDATE
   */
  async handleWebhook(event, data) {
    console.log(`[Bitrix24 Webhook] Received event: ${event}`);
    const pool = getPool();

    switch (event) {
      case 'ONCRMLEADADD':
      case 'ONCRMLEADUPDATE': {
        const leadId = data.ID || data.id || data.lead_id;
        if (!leadId) break;

        const gclid = data.UF_CRM_GCLID || data.gclid || null;
        const sessionId = data.UF_CRM_SESSION_ID || data.session_id || null;
        const service = data.UF_CRM_SERVICE || data.service || 'cctv';
        const status = (data.STATUS_ID || data.status || 'RAW').toUpperCase();

        const mappedStatus = ['QUALIFIED', 'CONVERTED'].includes(status) ? 'QUALIFIED'
          : (['JUNK', 'SPAM', 'FAILED'].includes(status) ? 'JUNK'
          : (['IN_PROCESS', 'CONTACTED'].includes(status) ? 'CONTACTED' : 'RAW'));

        const company = data.COMPANY_TITLE || data.company || 'Enterprise Client';
        const name = data.NAME ? `${data.NAME} ${data.LAST_NAME || ''}`.trim() : 'Lead Contact';
        const phone = data.PHONE || null;

        await pool.query(`
          INSERT INTO \`crm_leads\`
            (\`bitrix_lead_id\`, \`session_id\`, \`gclid\`, \`service_slug\`, \`lead_status\`, \`company_name\`, \`contact_name\`, \`contact_phone\`, \`created_at\`)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
          ON DUPLICATE KEY UPDATE
            \`lead_status\` = VALUES(\`lead_status\`),
            \`session_id\` = COALESCE(VALUES(\`session_id\`), \`session_id\`),
            \`gclid\` = COALESCE(VALUES(\`gclid\`), \`gclid\`),
            \`qualified_at\` = IF(VALUES(\`lead_status\`) = 'QUALIFIED' AND \`qualified_at\` IS NULL, CURRENT_TIMESTAMP, \`qualified_at\`)
        `, [
          `BX-LEAD-${leadId}`,
          sessionId,
          gclid,
          service,
          mappedStatus,
          company,
          name,
          phone
        ]);

        // Attempt stitching to session if gclid was provided
        if (gclid && !sessionId) {
          await this.stitchByGclid(`BX-LEAD-${leadId}`, gclid);
        }

        // Broadcast real-time CRM event
        socketManager.broadcastLiveEvent({
          eventType: 'crm_lead',
          elementText: `Bitrix24 Lead: ${company} (${mappedStatus})`,
          page: service,
          device: 'crm',
          location: 'CRM'
        });

        break;
      }

      case 'ONCRMDEALADD':
      case 'ONCRMDEALUPDATE': {
        const dealId = data.ID || data.id || data.deal_id;
        const leadId = data.LEAD_ID || data.lead_id ? `BX-LEAD-${data.LEAD_ID || data.lead_id}` : null;
        const stageRaw = (data.STAGE_ID || data.stage || 'OPPORTUNITY').toUpperCase();
        const value = parseFloat(data.OPPORTUNITY || data.value || 0);

        let mappedStage = 'OPPORTUNITY';
        if (stageRaw.indexOf('WON') !== -1) mappedStage = 'WON';
        else if (stageRaw.indexOf('LOSE') !== -1 || stageRaw.indexOf('LOST') !== -1) mappedStage = 'LOST';
        else if (stageRaw.indexOf('PROPOSAL') !== -1) mappedStage = 'PROPOSAL';
        else if (stageRaw.indexOf('NEGOTIATION') !== -1) mappedStage = 'NEGOTIATION';

        await pool.query(`
          INSERT INTO \`crm_deals\`
            (\`bitrix_deal_id\`, \`lead_id\`, \`deal_stage\`, \`deal_value\`, \`loss_reason\`, \`created_at\`, \`won_at\`, \`lost_at\`)
          VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, IF(? = 'WON', CURRENT_TIMESTAMP, NULL), IF(? = 'LOST', CURRENT_TIMESTAMP, NULL))
          ON DUPLICATE KEY UPDATE
            \`deal_stage\` = VALUES(\`deal_stage\`),
            \`deal_value\` = VALUES(\`deal_value\`),
            \`won_at\` = IF(VALUES(\`deal_stage\`) = 'WON' AND \`won_at\` IS NULL, CURRENT_TIMESTAMP, \`won_at\`),
            \`lost_at\` = IF(VALUES(\`deal_stage\`) = 'LOST' AND \`lost_at\` IS NULL, CURRENT_TIMESTAMP, \`lost_at\`)
        `, [
          `BX-DEAL-${dealId}`,
          leadId,
          mappedStage,
          value,
          data.LOSS_REASON || null,
          mappedStage,
          mappedStage
        ]);

        socketManager.broadcastLiveEvent({
          eventType: 'crm_deal',
          elementText: `Bitrix24 Deal: Stage ${mappedStage} (₹${value.toLocaleString()})`,
          page: 'crm',
          device: 'crm',
          location: 'CRM'
        });

        break;
      }

      default:
        console.log(`[Bitrix24 Webhook] Unhandled event: ${event}`);
    }
  }

  /**
   * Stitch incoming Bitrix lead back to web session using GCLID
   */
  async stitchByGclid(bitrixLeadId, gclid) {
    const pool = getPool();
    const [rows] = await pool.query('SELECT `session_id` FROM `sessions` WHERE `gclid` = ? ORDER BY `started_at` DESC LIMIT 1', [gclid]);
    if (rows.length > 0) {
      await pool.query('UPDATE `crm_leads` SET `session_id` = ? WHERE `bitrix_lead_id` = ?', [rows[0].session_id, bitrixLeadId]);
      console.log(`[Bitrix24 Connector] Stitched lead ${bitrixLeadId} to session ${rows[0].session_id}`);
    }
  }
}

module.exports = new Bitrix24Connector();
