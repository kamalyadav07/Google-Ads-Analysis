const express = require('express');
const router = express.Router();
const aiAnalystService = require('../services/aiAnalystService');

router.post('/analyze', async (req, res) => {
  try {
    const { query = 'What is the biggest conversion bottleneck across our landing pages?', serviceSlug = 'all', dateRange = '14d' } = req.body;
    const result = await aiAnalystService.analyzeQuery(query, { serviceSlug, dateRange });
    res.status(200).json(result);
  } catch (error) {
    console.error('AI Analyst route error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
