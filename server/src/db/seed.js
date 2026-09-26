const { getPool, testConnection } = require('../config/db');
const { runMigrations } = require('./migrate');

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, decimals = 2) {
  const str = (Math.random() * (max - min) + min).toFixed(decimals);
  return parseFloat(str);
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seedDatabase() {
  console.log('🌱 Starting comprehensive database seeder...');

  // Ensure migrations have executed
  await runMigrations();

  const pool = getPool();
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    console.log('  🧹 Clearing existing analytical data for clean re-seed...');
    await conn.query('DELETE FROM `crm_deals`');
    await conn.query('DELETE FROM `crm_leads`');
    await conn.query('DELETE FROM `technical_health_logs`');
    await conn.query('DELETE FROM `form_field_events`');
    await conn.query('DELETE FROM `events`');
    await conn.query('DELETE FROM `sessions`');
    await conn.query('DELETE FROM `visitors`');
    await conn.query('DELETE FROM `ad_metrics_daily`');
    await conn.query('DELETE FROM `keywords`');
    await conn.query('DELETE FROM `ads`');
    await conn.query('DELETE FROM `ad_groups`');
    await conn.query('DELETE FROM `campaigns`');

    console.log('  1️⃣ Seeding Google Ads Campaigns, Ad Groups & Keywords...');

    const campaignDefs = [
      {
        id: 'CAMP-CCTV-01',
        name: 'Search - CCTV & Video Surveillance Solutions',
        slug: 'cctv',
        budget: 6500.00,
        adGroups: [
          {
            id: 'AG-CCTV-COMM',
            name: 'Commercial CCTV Systems',
            keywords: ['commercial cctv installation', 'enterprise cctv solutions', 'warehouse security cameras', 'office surveillance systems']
          },
          {
            id: 'AG-CCTV-AI',
            name: 'AI Surveillance & Face Recognition',
            keywords: ['ai cctv security', 'anpr camera installation', 'facial recognition cameras', 'cloud cctv monitoring']
          }
        ]
      },
      {
        id: 'CAMP-NOC-02',
        name: 'Search - 24/7 Network Operations Center (NOC)',
        slug: 'noc',
        budget: 5500.00,
        adGroups: [
          {
            id: 'AG-NOC-MANAGED',
            name: 'Managed NOC Services',
            keywords: ['24x7 noc monitoring services', 'outsourced noc team', 'network infrastructure monitoring', 'server uptime monitoring']
          }
        ]
      },
      {
        id: 'CAMP-CYBER-03',
        name: 'Search - Enterprise Cybersecurity & SOC',
        slug: 'cybersecurity',
        budget: 8000.00,
        adGroups: [
          {
            id: 'AG-CYBER-SOC',
            name: 'Managed SOC & SIEM',
            keywords: ['managed soc services', 'enterprise siem provider', 'endpoint detection and response', 'cybersecurity audit enterprise']
          }
        ]
      },
      {
        id: 'CAMP-VC-04',
        name: 'Search - Boardroom Video Conferencing AV',
        slug: 'video-conferencing',
        budget: 4500.00,
        adGroups: [
          {
            id: 'AG-VC-BOARDROOM',
            name: 'Boardroom AV & Teams Rooms',
            keywords: ['teams room setup', 'zoom room hardware installation', 'boardroom video conferencing', 'wireless presentation systems']
          }
        ]
      },
      {
        id: 'CAMP-DC-05',
        name: 'Search - Data Center Colocation & Hosting',
        slug: 'data-center',
        budget: 6000.00,
        adGroups: [
          {
            id: 'AG-DC-COLO',
            name: 'Tier 3 Rack Space Colocation',
            keywords: ['data center colocation delhi', 'tier 3 server rack rental', 'managed colocation services', 'hybrid cloud hosting']
          }
        ]
      },
      {
        id: 'CAMP-NET-06',
        name: 'Search - Enterprise Networking & Cabling',
        slug: 'networking',
        budget: 3500.00,
        adGroups: [
          {
            id: 'AG-NET-STRUCTURED',
            name: 'Structured Cabling & Fiber',
            keywords: ['structured cabling contractor', 'fiber optic splicing office', 'enterprise switch router setup', 'aruba cisco wireless']
          }
        ]
      }
    ];

    for (const c of campaignDefs) {
      await conn.query(
        'INSERT INTO `campaigns` (`campaign_id`, `name`, `status`, `channel_type`, `daily_budget`) VALUES (?, ?, ?, ?, ?)',
        [c.id, c.name, 'ENABLED', 'SEARCH', c.budget]
      );

      for (const ag of c.adGroups) {
        await conn.query(
          'INSERT INTO `ad_groups` (`ad_group_id`, `campaign_id`, `name`, `status`) VALUES (?, ?, ?, ?)',
          [ag.id, c.id, ag.name, 'ENABLED']
        );

        // Ad creative
        await conn.query(
          'INSERT INTO `ads` (`ad_id`, `ad_group_id`, `headline`, `description`, `final_url`) VALUES (?, ?, ?, ?, ?)',
          [
            `AD-${ag.id}`,
            ag.id,
            `Top Rated ${ag.name} - Instant Quote`,
            `Enterprise SLA, 24/7 Support & Rapid Deployment across Delhi NCR, Mumbai & Bengaluru.`,
            `https://solutions.company.com/${c.slug}`
          ]
        );

        for (const kw of ag.keywords) {
          const kwId = `KW-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
          await conn.query(
            'INSERT INTO `keywords` (`keyword_id`, `ad_group_id`, `keyword_text`, `match_type`) VALUES (?, ?, ?, ?)',
            [kwId, ag.id, kw, 'PHRASE']
          );
        }
      }
    }

    console.log('  2️⃣ Generating 14 Days of Daily Ad Spend, Clicks & Conversions...');
    const now = new Date();
    for (let dayOffset = 13; dayOffset >= 0; dayOffset--) {
      const date = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      for (const c of campaignDefs) {
        for (const ag of c.adGroups) {
          const impressions = randomInt(400, 1100);
          const ctr = randomFloat(0.022, 0.058, 4);
          const clicks = Math.round(impressions * ctr);
          const cpc = randomFloat(35.0, 95.0);
          const spend = Math.round(clicks * cpc);
          const conversions = Math.round(clicks * randomFloat(0.02, 0.07));
          const costPerConv = conversions > 0 ? parseFloat((spend / conversions).toFixed(2)) : 0.0;

          await conn.query(`
            INSERT INTO \`ad_metrics_daily\` 
              (\`date\`, \`campaign_id\`, \`ad_group_id\`, \`impressions\`, \`clicks\`, \`spend\`, \`cpc\`, \`ctr\`, \`conversions\`, \`cost_per_conversion\`)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [date, c.id, ag.id, impressions, clicks, spend, cpc, ctr, conversions, costPerConv]);
        }
      }
    }

    console.log('  3️⃣ Seeding Realistic Visitor Journeys, Sessions & Device Telemetry...');
    const cities = [
      { city: 'Delhi', state: 'Delhi NCR', weight: 35 },
      { city: 'Noida', state: 'Uttar Pradesh', weight: 15 },
      { city: 'Gurgaon', state: 'Haryana', weight: 15 },
      { city: 'Mumbai', state: 'Maharashtra', weight: 15 },
      { city: 'Bengaluru', state: 'Karnataka', weight: 10 },
      { city: 'Hyderabad', state: 'Telangana', weight: 5 },
      { city: 'Pune', state: 'Maharashtra', weight: 5 }
    ];

    const devices = [
      { category: 'mobile', model: 'iPhone 15 / Galaxy S24', width: 393, height: 852, os: 'iOS / Android', browser: 'Safari / Mobile Chrome', weight: 65 },
      { category: 'desktop', model: 'MacBook Pro / ThinkPad', width: 1920, height: 1080, os: 'macOS / Windows 11', browser: 'Chrome / Edge', weight: 28 },
      { category: 'tablet', model: 'iPad Air / Galaxy Tab', width: 820, height: 1180, os: 'iPadOS / Android', browser: 'Safari / Chrome', weight: 7 }
    ];

    let totalSessions = 1150;
    let leadCounter = 1000;
    let dealCounter = 5000;

    for (let i = 0; i < totalSessions; i++) {
      const daysAgo = randomInt(0, 13);
      const sessionDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000 - randomInt(0, 86400) * 1000);
      const sessionDateStr = sessionDate.toISOString().slice(0, 19).replace('T', ' ');

      // Pick city and device weighted
      const cityObj = randomChoice(cities);
      const devRoll = Math.random() * 100;
      const devObj = devRoll < 65 ? devices[0] : (devRoll < 93 ? devices[1] : devices[2]);

      const service = randomChoice(campaignDefs);
      const slug = service.slug;

      const vidToken = `VID-${Math.random().toString(36).substr(2, 9)}-${i}`;
      const sid = `SID-${Math.random().toString(36).substr(2, 9)}-${i}`;
      const gclid = `GCLID-${Math.random().toString(36).substr(2, 12).toUpperCase()}`;

      // Insert visitor
      const [vRes] = await conn.query(`
        INSERT INTO \`visitors\` 
          (\`visitor_token\`, \`first_seen_at\`, \`device_category\`, \`device_model\`, \`browser\`, \`os\`, \`screen_width\`, \`screen_height\`, \`city\`, \`state\`, \`country\`)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'India')
      `, [vidToken, sessionDateStr, devObj.category, devObj.model, devObj.browser, devObj.os, devObj.width, devObj.height, cityObj.city, cityObj.state]);
      const visitorDbId = vRes.insertId;

      // Determine session behavior & funnel progression
      const isBounce = Math.random() < (devObj.category === 'mobile' ? 0.42 : 0.28);
      const isEngaged = !isBounce && (Math.random() < 0.75);
      const durationSeconds = isBounce ? randomInt(4, 14) : (isEngaged ? randomInt(45, 240) : randomInt(15, 45));

      // Scroll depth: desktop reads further, mobile drops off earlier
      let maxScroll = 10;
      if (!isBounce) {
        maxScroll = devObj.category === 'mobile' ? randomChoice([25, 50, 75, 90]) : randomChoice([50, 75, 90, 100]);
      }

      await conn.query(`
        INSERT INTO \`sessions\` 
          (\`session_id\`, \`visitor_id\`, \`landing_page_slug\`, \`started_at\`, \`duration_seconds\`, \`max_scroll_depth\`, \`is_bounce\`, \`is_engaged\`, \`referrer\`, \`gclid\`, \`utm_source\`, \`utm_medium\`, \`utm_campaign\`)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'https://www.google.com/', ?, 'google', 'cpc', ?)
      `, [sid, visitorDbId, slug, sessionDateStr, durationSeconds, maxScroll, isBounce ? 1 : 0, isEngaged ? 1 : 0, gclid, service.name]);

      // Page view event
      await conn.query(`
        INSERT INTO \`events\` (\`session_id\`, \`event_type\`, \`element_location\`, \`created_at\`)
        VALUES (?, 'page_view', 'hero', ?)
      `, [sid, sessionDateStr]);

      // Milestone scroll events
      const milestones = [10, 25, 50, 75, 90, 100].filter(m => m <= maxScroll);
      for (const m of milestones) {
        await conn.query(`
          INSERT INTO \`events\` (\`session_id\`, \`event_type\`, \`element_location\`, \`created_at\`)
          VALUES (?, 'scroll_milestone', ?, ?)
        `, [sid, `scroll_${m}`, sessionDateStr]);
      }

      // CTA Click event
      const clickedCta = isEngaged && (Math.random() < (devObj.category === 'mobile' ? 0.35 : 0.52));
      if (clickedCta) {
        const ctaType = randomChoice(['cta_click', 'whatsapp_click', 'phone_click']);
        const ctaLocation = randomChoice(['hero', 'middle', 'sticky', 'footer']);
        await conn.query(`
          INSERT INTO \`events\` (\`session_id\`, \`event_type\`, \`element_text\`, \`element_location\`, \`created_at\`)
          VALUES (?, ?, 'Get Instant Quote', ?, ?)
        `, [sid, ctaType, ctaLocation, sessionDateStr]);

        // Form Started
        const startedForm = Math.random() < 0.72;
        if (startedForm) {
          await conn.query(`
            INSERT INTO \`events\` (\`session_id\`, \`event_type\`, \`element_location\`, \`created_at\`)
            VALUES (?, 'form_start', ?, ?)
          `, [sid, ctaLocation, sessionDateStr]);

          // Field interactions
          const fields = ['full_name', 'phone', 'company_name', 'requirement'];
          let formSubmitted = false;

          // Mobile friction test case: CCTV mobile users experience validation error on requirement
          const hasMobileFriction = (slug === 'cctv' && devObj.category === 'mobile' && Math.random() < 0.45);

          if (hasMobileFriction) {
            await conn.query(`
              INSERT INTO \`form_field_events\` (\`session_id\`, \`form_id\`, \`field_name\`, \`dwell_time_ms\`, \`error_type\`, \`was_abandoned\`, \`created_at\`)
              VALUES (?, 'quote_form', 'requirement', 38000, 'Min 20 characters required', 1, ?)
            `, [sid, sessionDateStr]);

            await conn.query(`
              INSERT INTO \`events\` (\`session_id\`, \`event_type\`, \`element_text\`, \`created_at\`)
              VALUES (?, 'form_abandon', 'requirement', ?)
            `, [sid, sessionDateStr]);
          } else {
            // Normal progression
            for (const f of fields) {
              await conn.query(`
                INSERT INTO \`form_field_events\` (\`session_id\`, \`form_id\`, \`field_name\`, \`dwell_time_ms\`, \`was_abandoned\`, \`created_at\`)
                VALUES (?, 'quote_form', ?, ?, 0, ?)
              `, [sid, f, randomInt(3500, 18000), sessionDateStr]);
            }
            formSubmitted = Math.random() < (devObj.category === 'mobile' ? 0.38 : 0.68);
          }

          if (formSubmitted) {
            await conn.query(`
              INSERT INTO \`events\` (\`session_id\`, \`event_type\`, \`element_location\`, \`created_at\`)
              VALUES (?, 'form_submit', ?, ?)
            `, [sid, ctaLocation, sessionDateStr]);

            // Create CRM Lead in Bitrix24
            leadCounter++;
            const bitrixLeadId = `BX-LEAD-${leadCounter}`;
            const leadStatus = randomChoice(['QUALIFIED', 'QUALIFIED', 'CONTACTED', 'RAW', 'JUNK']);
            const contactLatency = randomInt(12, 180); // minutes

            await conn.query(`
              INSERT INTO \`crm_leads\` 
                (\`bitrix_lead_id\`, \`session_id\`, \`gclid\`, \`service_slug\`, \`lead_status\`, \`contact_latency_minutes\`, \`company_name\`, \`contact_name\`, \`contact_phone\`, \`created_at\`)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
              bitrixLeadId,
              sid,
              gclid,
              slug,
              leadStatus,
              contactLatency,
              `${cityObj.city} Enterprise Corp #${i}`,
              `Business Leader ${i}`,
              `+91 98${randomInt(10000000, 99999999)}`,
              sessionDateStr
            ]);

            // Progression from Qualified Lead to Deal
            if (leadStatus === 'QUALIFIED' && Math.random() < 0.65) {
              dealCounter++;
              const bitrixDealId = `BX-DEAL-${dealCounter}`;
              const dealStage = randomChoice(['OPPORTUNITY', 'PROPOSAL', 'NEGOTIATION', 'WON', 'WON', 'LOST']);
              const dealValue = randomChoice([45000, 95000, 150000, 280000, 450000, 850000]);
              const lossReason = dealStage === 'LOST' ? randomChoice(['Budget constraints', 'Competitor selected', 'Project postponed']) : null;

              await conn.query(`
                INSERT INTO \`crm_deals\` 
                  (\`bitrix_deal_id\`, \`lead_id\`, \`deal_stage\`, \`deal_value\`, \`loss_reason\`, \`created_at\`, \`won_at\`)
                VALUES (?, ?, ?, ?, ?, ?, ?)
              `, [
                bitrixDealId,
                bitrixLeadId,
                dealStage,
                dealValue,
                lossReason,
                sessionDateStr,
                dealStage === 'WON' ? sessionDateStr : null
              ]);
            }
          }
        }
      }

      // Intermittent Technical Health logs (e.g. JS errors or Slow LCP on mobile)
      if (Math.random() < 0.035) {
        await conn.query(`
          INSERT INTO \`technical_health_logs\` 
            (\`session_id\`, \`error_type\`, \`message\`, \`page_url\`, \`lcp_ms\`, \`load_time_ms\`, \`created_at\`)
          VALUES (?, 'js_error', 'Uncaught TypeError: Cannot read properties of undefined (reading dataset)', ?, ?, ?, ?)
        `, [sid, `https://solutions.company.com/${slug}`, randomInt(2800, 5200), randomInt(1800, 4200), sessionDateStr]);
      }
    }

    await conn.commit();
    console.log(`✅ Seed completed successfully:`);
    console.log(`   - 6 Google Ads Campaigns with 14-day performance history`);
    console.log(`   - ${totalSessions} Visitor Sessions with Phone / Tablet / Laptop telemetry`);
    console.log(`   - Granular scroll milestones, CTA interactions, and form friction events`);
    console.log(`   - Bitrix24 Leads and Closed-Won Revenue`);
  } catch (error) {
    await conn.rollback();
    console.error('❌ Seeder failed:', error);
    throw error;
  } finally {
    conn.release();
  }
}

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { seedDatabase };
