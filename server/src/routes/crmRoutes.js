const express = require('express');
const router = express.Router();
const bitrix24 = require('../integrations/bitrix24');
const googleAds = require('../integrations/googleAds');

/**
 * Inbound webhook from Bitrix24
 */
router.post('/bitrix/webhook', async (req, res) => {
  try {
    const event = req.body.event || req.query.event || 'ONCRMLEADADD';
    const data = req.body.data ? req.body.data.FIELDS || req.body.data : req.body;

    await bitrix24.handleWebhook(event, data);
    res.status(200).json({ status: 'success', received: event });
  } catch (error) {
    console.error('Bitrix24 webhook processing error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Simulation endpoint for manual testing of real-time Bitrix lead & deal creation
 */
router.post('/simulate-lead', async (req, res) => {
  try {
    const {
      service = 'cctv',
      company = 'Delhi Logistics Pvt Ltd',
      name = 'Rajesh Sharma',
      phone = '+91 9811223344',
      status = 'QUALIFIED',
      gclid = null,
      session_id = null
    } = req.body;

    const fakeLeadId = Math.floor(Math.random() * 90000) + 10000;
    await bitrix24.handleWebhook('ONCRMLEADADD', {
      ID: fakeLeadId,
      UF_CRM_GCLID: gclid,
      UF_CRM_SESSION_ID: session_id,
      UF_CRM_SERVICE: service,
      STATUS_ID: status,
      COMPANY_TITLE: company,
      NAME: name,
      PHONE: phone
    });

    res.status(200).json({
      status: 'simulated',
      bitrix_lead_id: `BX-LEAD-${fakeLeadId}`,
      service,
      company
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Manual trigger for Google Ads synchronization
 */
router.post('/sync-ads', async (req, res) => {
  try {
    const result = await googleAds.syncDailyMetrics(req.body.date);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
