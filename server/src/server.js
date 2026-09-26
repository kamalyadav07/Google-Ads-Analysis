const fs = require('fs');
const http = require('http');
const path = require('path');
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { testConnection } = require('./config/db');
const { runMigrations } = require('./db/migrate');
const socketManager = require('./sockets/socketManager');
const googleAds = require('./integrations/googleAds');

const collectRoutes = require('./routes/collectRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const crmRoutes = require('./routes/crmRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();
const server = http.createServer(app);

const PORT = parseInt(process.env.PORT || '5000', 10);
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// 1. Global Middleware
app.use(cors({
  origin: '*', // Allow landing pages from any domain to send beacons
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// 2. Serve Static Tracking SDK
const localTrackerPath = path.join(__dirname, '../public/tracker.js');
const repoTrackerPath = path.join(__dirname, '../../tracker/src/tracker.js');
const trackerPath = fs.existsSync(localTrackerPath) ? localTrackerPath : repoTrackerPath;

app.get('/sdk/tracker.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.sendFile(trackerPath);
});

// 3. Mount API Routes
app.use('/api/v1', collectRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/crm', crmRoutes);
app.use('/api/v1/ai', aiRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const dbStatus = await testConnection();
  res.status(dbStatus.connected ? 200 : 500).json({
    status: dbStatus.connected ? 'healthy' : 'degraded',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// 4. Initialize Real-Time WebSockets
socketManager.initialize(server, CLIENT_URL);

// 5. Background Schedulers
// Scheduled Google Ads sync every hour at minute 0
cron.schedule('0 * * * *', async () => {
  try {
    console.log('[Cron] Running scheduled Google Ads performance sync...');
    await googleAds.syncDailyMetrics();
  } catch (err) {
    console.error('[Cron Error] Google Ads sync failed:', err.message);
  }
});

// 6. Bootstrap Server
async function startServer() {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 Marketing & Landing Page Intelligence Platform');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Run migrations automatically
    await runMigrations();

    server.listen(PORT, () => {
      console.log(`📡 Ingestion & Analytics API: http://localhost:${PORT}`);
      console.log(`📦 Embeddable Tracker SDK:    http://localhost:${PORT}/sdk/tracker.js`);
      console.log(`⚡ WebSocket Stream:          ws://localhost:${PORT}`);
      console.log(`🌐 Ready to receive landing page events and Bitrix24 webhooks`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { app, server };
