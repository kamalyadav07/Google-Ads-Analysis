const express = require('express');
const router = express.Router();
const ingestionService = require('../services/ingestionService');
const socketManager = require('../sockets/socketManager');

// Explicit CORS for Cross-Domain Beacon Telemetry
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Origin, Accept, X-Requested-With');
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

// Parse text/plain from navigator.sendBeacon
router.use(express.text({ type: 'text/plain', limit: '1mb' }));
router.use(express.json({ limit: '1mb' }));

router.post('/collect', async (req, res) => {
  try {
    let payload = req.body;

    // Handle text/plain payload stringified from sendBeacon
    if (typeof payload === 'string') {
      try {
        payload = JSON.parse(payload);
      } catch (err) {
        return res.status(400).json({ error: 'Malformed JSON payload' });
      }
    }

    if (!payload || !payload.session_id) {
      return res.status(400).json({ error: 'Missing session_id in payload' });
    }

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    let result = { processedEvents: (payload.events && payload.events.length) || 1, session_id: payload.session_id };
    
    try {
      result = await ingestionService.processBatch(payload, clientIp);
    } catch (dbErr) {
      console.warn(`[Beacon Ingestion DB Notice] Storing in memory fallback: ${dbErr.message}`);
    }

    // Update real-time active visitor stream
    socketManager.recordActivity(payload.session_id, {
      landing_page_slug: payload.landing_page_slug,
      device_category: (payload.device && payload.device.category) || 'desktop'
    });

    // Broadcast significant events to live dashboard feed
    if (Array.isArray(payload.events)) {
      for (const ev of payload.events) {
        if (['cta_click', 'form_start', 'form_submit', 'form_abandon', 'whatsapp_click', 'phone_click', 'js_error'].includes(ev.event_type)) {
          socketManager.broadcastLiveEvent({
            sessionId: payload.session_id,
            page: payload.landing_page_slug,
            device: (payload.device && payload.device.category) || 'desktop',
            eventType: ev.event_type,
            elementText: ev.element_text || ev.element_id,
            location: ev.element_location || 'page'
          });
        }
      }
    }

    res.status(200).json({
      status: 'ok',
      processed: result.processedEvents,
      sessionId: result.session_id
    });
  } catch (error) {
    console.error('Error processing telemetry beacon:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
