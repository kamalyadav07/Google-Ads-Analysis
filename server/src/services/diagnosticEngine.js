const { getPool } = require('../config/db');

class DiagnosticEngine {
  /**
   * Run full heuristic diagnosis across the 5 conversion failure domains
   * @param {Object} options - { startDate, endDate, serviceSlug, deviceCategory }
   */
  async runDiagnosis(options = {}) {
    const pool = getPool();
    const { startDate, endDate, serviceSlug, deviceCategory } = options;

    let dateFilter = '';
    const dateParams = [];
    if (startDate && endDate) {
      dateFilter = 'AND `started_at` BETWEEN ? AND ?';
      dateParams.push(`${startDate} 00:00:00`, `${endDate} 23:59:59`);
    }

    let serviceFilter = '';
    const serviceParams = [];
    if (serviceSlug && serviceSlug !== 'all') {
      serviceFilter = 'AND `landing_page_slug` = ?';
      serviceParams.push(serviceSlug);
    }

    let deviceFilter = '';
    const deviceParams = [];
    if (deviceCategory && deviceCategory !== 'all') {
      deviceFilter = 'AND v.`device_category` = ?';
      deviceParams.push(deviceCategory);
    }

    // 1. Gather Advertising Metrics
    const [adRows] = await pool.query(`
      SELECT 
        COALESCE(SUM(\`impressions\`), 0) AS total_impressions,
        COALESCE(SUM(\`clicks\`), 0) AS total_clicks,
        COALESCE(SUM(\`spend\`), 0) AS total_spend,
        COALESCE(AVG(\`ctr\`), 0) AS avg_ctr,
        COALESCE(AVG(\`cpc\`), 0) AS avg_cpc
      FROM \`ad_metrics_daily\`
      WHERE 1=1
    `);
    const adData = adRows[0] || {};

    // 2. Gather Session & Behavioral Metrics
    const [sessionRows] = await pool.query(`
      SELECT 
        COUNT(s.id) AS total_sessions,
        COALESCE(SUM(s.is_bounce), 0) AS total_bounces,
        COALESCE(SUM(s.is_engaged), 0) AS total_engaged,
        COALESCE(AVG(s.duration_seconds), 0) AS avg_duration,
        COALESCE(AVG(s.max_scroll_depth), 0) AS avg_scroll_depth
      FROM \`sessions\` s
      LEFT JOIN \`visitors\` v ON s.visitor_id = v.id
      WHERE 1=1 ${dateFilter} ${serviceFilter} ${deviceFilter}
    `, [...dateParams, ...serviceParams, ...deviceParams]);
    const sessData = sessionRows[0] || {};
    const totalSessions = parseInt(sessData.total_sessions || 0, 10);
    const bounceRate = totalSessions > 0 ? (sessData.total_bounces / totalSessions) * 100 : 0;
    const engagementRate = totalSessions > 0 ? (sessData.total_engaged / totalSessions) * 100 : 0;

    // 3. Scroll Depth Milestones
    const [scrollRows] = await pool.query(`
      SELECT 
        element_location, 
        COUNT(DISTINCT session_id) AS reached_count
      FROM \`events\`
      WHERE event_type = 'scroll_milestone'
      GROUP BY element_location
    `);
    const scrollMap = {};
    for (const r of scrollRows) {
      scrollMap[r.element_location] = r.reached_count;
    }
    const reached25 = scrollMap['scroll_25'] || 0;
    const reached50 = scrollMap['scroll_50'] || 0;
    const reached75 = scrollMap['scroll_75'] || 0;
    const scroll25DropPct = totalSessions > 0 ? ((totalSessions - reached25) / totalSessions) * 100 : 0;

    // 4. CTA and Form Funnel
    const [eventCountRows] = await pool.query(`
      SELECT 
        event_type, 
        COUNT(DISTINCT session_id) AS unique_sessions
      FROM \`events\`
      WHERE 1=1
      GROUP BY event_type
    `);
    const eventCounts = {};
    for (const r of eventCountRows) {
      eventCounts[r.event_type] = r.unique_sessions;
    }
    const ctaClicks = (eventCounts['cta_click'] || 0) + (eventCounts['whatsapp_click'] || 0) + (eventCounts['phone_click'] || 0);
    const ctaRate = totalSessions > 0 ? (ctaClicks / totalSessions) * 100 : 0;
    const formStarts = eventCounts['form_start'] || 0;
    const formSubmissions = eventCounts['form_submit'] || 0;
    const formStartToSubmitDrop = formStarts > 0 ? ((formStarts - formSubmissions) / formStarts) * 100 : 0;

    // 5. Form Field Friction & Validation Errors
    const [fieldErrors] = await pool.query(`
      SELECT 
        field_name, 
        COUNT(*) AS err_count,
        COALESCE(AVG(dwell_time_ms), 0) AS avg_dwell
      FROM \`form_field_events\`
      WHERE error_type IS NOT NULL OR was_abandoned = 1
      GROUP BY field_name
      ORDER BY err_count DESC
      LIMIT 3
    `);
    const topFrictionField = fieldErrors[0] || null;

    // 6. Technical Health
    const [techRows] = await pool.query(`
      SELECT 
        COUNT(*) AS total_errors,
        COALESCE(AVG(lcp_ms), 0) AS avg_lcp
      FROM \`technical_health_logs\`
    `);
    const techData = techRows[0] || {};
    const totalJsErrors = parseInt(techData.total_errors || 0, 10);
    const avgLcp = Math.round(techData.avg_lcp || 0);

    // 7. CRM Lead Quality & Sales Latency
    const [crmRows] = await pool.query(`
      SELECT 
        COUNT(*) AS total_leads,
        COALESCE(SUM(CASE WHEN lead_status = 'QUALIFIED' THEN 1 ELSE 0 END), 0) AS qualified_leads,
        COALESCE(SUM(CASE WHEN lead_status = 'JUNK' THEN 1 ELSE 0 END), 0) AS junk_leads,
        COALESCE(AVG(contact_latency_minutes), 0) AS avg_contact_latency
      FROM \`crm_leads\`
      WHERE 1=1 ${serviceSlug && serviceSlug !== 'all' ? 'AND service_slug = ?' : ''}
    `, serviceSlug && serviceSlug !== 'all' ? [serviceSlug] : []);
    const crmData = crmRows[0] || {};
    const totalLeads = parseInt(crmData.total_leads || 0, 10);
    const qualifiedLeads = parseInt(crmData.qualified_leads || 0, 10);
    const junkLeads = parseInt(crmData.junk_leads || 0, 10);
    const qualificationRate = totalLeads > 0 ? (qualifiedLeads / totalLeads) * 100 : 0;
    const junkRate = totalLeads > 0 ? (junkLeads / totalLeads) * 100 : 0;
    const avgLatencyMin = Math.round(crmData.avg_contact_latency || 0);

    // 8. CRM Deals / Revenue
    const [dealRows] = await pool.query(`
      SELECT 
        COUNT(*) AS total_deals,
        COALESCE(SUM(CASE WHEN deal_stage = 'WON' THEN 1 ELSE 0 END), 0) AS won_deals,
        COALESCE(SUM(CASE WHEN deal_stage = 'WON' THEN deal_value ELSE 0 END), 0) AS won_revenue
      FROM \`crm_deals\`
    `);
    const dealData = dealRows[0] || {};

    // ========================================================
    // SCORING HEURISTICS ACROSS 5 FAILURE DOMAINS (0 - 100)
    // ========================================================

    // Domain 1: Advertising Problem
    let adScore = 0;
    if (adData.avg_ctr < 0.02) adScore += 30;
    if (bounceRate > 65) adScore += 35;
    if (engagementRate < 25) adScore += 35;

    // Domain 2: Landing Page Problem
    let pageScore = 0;
    if (scroll25DropPct > 45) pageScore += 35;
    if (ctaRate < 3.5) pageScore += 35;
    if (sessData.avg_duration < 25) pageScore += 30;

    // Domain 3: Technical Problem
    let techScore = 0;
    if (totalJsErrors > 15) techScore += 40;
    if (avgLcp > 4000) techScore += 30;
    if (totalSessions > 50 && formSubmissions === 0 && formStarts > 10) techScore += 30;

    // Domain 4: Lead Quality Problem
    let leadQualityScore = 0;
    if (totalLeads >= 10 && qualificationRate < 25) leadQualityScore += 50;
    if (junkRate > 25) leadQualityScore += 50;

    // Domain 5: CRM / Sales Process Problem
    let salesScore = 0;
    if (avgLatencyMin > 90) salesScore += 50;
    if (qualifiedLeads >= 10 && dealData.won_deals === 0) salesScore += 50;

    // Form Specific Friction Check
    let formFrictionScore = 0;
    if (formStarts >= 10 && formStartToSubmitDrop > 75) {
      formFrictionScore = Math.min(100, Math.round(formStartToSubmitDrop));
    }

    // Determine Primary Bottleneck
    const scores = [
      { domain: 'ADVERTISING', label: 'Advertising & Traffic Targeting', score: adScore },
      { domain: 'LANDING_PAGE', label: 'Landing Page Messaging & Content', score: pageScore },
      { domain: 'FORM_FRICTION', label: 'Form Input Friction & Abandonment', score: formFrictionScore },
      { domain: 'TECHNICAL', label: 'Technical Stability & Core Web Vitals', score: techScore },
      { domain: 'LEAD_QUALITY', label: 'Lead Relevance & Qualification', score: leadQualityScore },
      { domain: 'SALES_CRM', label: 'Sales Response Time & Follow-up SLA', score: salesScore }
    ];

    scores.sort((a, b) => b.score - a.score);
    const primary = scores[0];

    // Build Evidence Summary and Recommendations
    let verdictTitle = '';
    let verdictDescription = '';
    const recommendations = [];

    if (primary.domain === 'FORM_FRICTION') {
      verdictTitle = 'Critical Bottleneck: Form Start ──► Submission Failure';
      verdictDescription = `${formStartToSubmitDrop.toFixed(1)}% of visitors who started the quote form abandoned before submitting. Significant friction detected on the "${topFrictionField ? topFrictionField.field_name : 'requirement'}" input.`;
      recommendations.push(`Shorten form fields on mobile devices. Consider 2-step micro-forms.`);
      recommendations.push(`Review validation rules on "${topFrictionField ? topFrictionField.field_name : 'requirement'}" — average dwell time is ${Math.round((topFrictionField ? topFrictionField.avg_dwell : 25000) / 1000)} seconds.`);
      recommendations.push(`Add autofill and phone number auto-masking.`);
    } else if (primary.domain === 'ADVERTISING') {
      verdictTitle = 'Critical Bottleneck: Ad Traffic Intent & Search Themes';
      verdictDescription = `High bounce rate (${bounceRate.toFixed(1)}%) combined with low page engagement (${engagementRate.toFixed(1)}%) indicates visitors are not finding what the ad creative promised.`;
      recommendations.push(`Audit negative keywords to filter out non-commercial search intent.`);
      recommendations.push(`Ensure the landing page headline verbatim mirrors the ad creative headline.`);
      recommendations.push(`Review location targeting exclusions.`);
    } else if (primary.domain === 'LANDING_PAGE') {
      verdictTitle = 'Critical Bottleneck: Above-The-Fold Drop-off';
      verdictDescription = `${scroll25DropPct.toFixed(1)}% of visitors leave before reaching 25% of the page. CTA click rate is only ${ctaRate.toFixed(1)}%.`;
      recommendations.push(`Strengthen above-the-fold value proposition and enterprise credentials.`);
      recommendations.push(`Add a sticky high-contrast CTA bar (WhatsApp / Get Quote) on mobile viewports.`);
      recommendations.push(`Place trusted client logos within the hero section.`);
    } else if (primary.domain === 'TECHNICAL') {
      verdictTitle = 'Critical Bottleneck: Technical Errors & Performance Latency';
      verdictDescription = `${totalJsErrors} client-side JavaScript errors detected. Average Largest Contentful Paint (LCP) is ${avgLcp}ms.`;
      recommendations.push(`Inspect browser console errors related to dataset / form binding.`);
      recommendations.push(`Optimize hero image assets to bring LCP under 2,500ms.`);
    } else if (primary.domain === 'LEAD_QUALITY') {
      verdictTitle = 'Critical Bottleneck: High Volume / Low Qualification';
      verdictDescription = `Only ${qualificationRate.toFixed(1)}% of submitted leads meet qualification criteria. ${junkRate.toFixed(1)}% marked as junk/spam in Bitrix24.`;
      recommendations.push(`Add a company size or budget requirement dropdown to qualify intent upfront.`);
      recommendations.push(`Exclude B2C and residential keywords from Google Ads campaigns.`);
    } else {
      verdictTitle = 'Critical Bottleneck: Sales Contact Latency SLA';
      verdictDescription = `Average first sales contact takes ${avgLatencyMin} minutes from lead submission. Leads are going cold before first outreach.`;
      recommendations.push(`Configure instant Bitrix24 WhatsApp / SMS notifications for newly assigned leads.`);
      recommendations.push(`Establish a maximum 30-minute first-response SLA for inbound commercial inquiries.`);
    }

    return {
      primaryBottleneck: primary.domain,
      primaryLabel: primary.label,
      severityScore: primary.score,
      verdictTitle,
      verdictDescription,
      domainScores: scores,
      evidence: {
        adSpend: adData.total_spend,
        adClicks: adData.total_clicks,
        ctr: parseFloat(adData.avg_ctr.toFixed(4)),
        bounceRate: parseFloat(bounceRate.toFixed(1)),
        engagementRate: parseFloat(engagementRate.toFixed(1)),
        scroll25DropPct: parseFloat(scroll25DropPct.toFixed(1)),
        ctaRate: parseFloat(ctaRate.toFixed(1)),
        formStartToSubmitDrop: parseFloat(formStartToSubmitDrop.toFixed(1)),
        topFrictionField: topFrictionField ? topFrictionField.field_name : null,
        totalJsErrors,
        avgLcpMs: avgLcp,
        totalLeads,
        qualificationRate: parseFloat(qualificationRate.toFixed(1)),
        avgContactLatencyMin: avgLatencyMin
      },
      recommendations
    };
  }
}

module.exports = new DiagnosticEngine();
