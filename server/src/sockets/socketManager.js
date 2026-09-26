const { Server } = require('socket.io');

class SocketManager {
  constructor() {
    this.io = null;
    // Map of sessionId -> { lastSeen: timestamp, page: string, device: string, city: string }
    this.activeVisitors = new Map();
    this.cleanupInterval = null;
  }

  initialize(httpServer, clientUrl = '*') {
    this.io = new Server(httpServer, {
      cors: {
        origin: clientUrl || '*',
        methods: ['GET', 'POST']
      }
    });

    this.io.on('connection', (socket) => {
      // Send current live stats immediately upon connection
      socket.emit('live_stats', this.getLiveStats());

      socket.on('disconnect', () => {
        // Client disconnected
      });
    });

    // Clean up stale visitors every 10 seconds (inactivity > 5 minutes)
    this.cleanupInterval = setInterval(() => {
      this.purgeStaleVisitors();
    }, 10000);

    console.log('⚡ Socket.IO real-time telemetry engine initialized');
  }

  recordActivity(sessionId, meta = {}) {
    if (!sessionId) return;

    this.activeVisitors.set(sessionId, {
      lastSeen: Date.now(),
      page: meta.landing_page_slug || 'cctv',
      device: meta.device_category || 'desktop',
      city: meta.city || 'Delhi'
    });

    this.emitLiveStats();
  }

  purgeStaleVisitors() {
    const cutoff = Date.now() - 5 * 60 * 1000; // 5 min idle window
    let changed = false;

    for (const [sid, data] of this.activeVisitors.entries()) {
      if (data.lastSeen < cutoff) {
        this.activeVisitors.delete(sid);
        changed = true;
      }
    }

    if (changed) {
      this.emitLiveStats();
    }
  }

  getLiveStats() {
    const total = this.activeVisitors.size;
    const byPage = {
      cctv: 0,
      noc: 0,
      'video-conferencing': 0,
      cybersecurity: 0,
      'data-center': 0,
      networking: 0,
      other: 0
    };
    const byDevice = {
      mobile: 0,
      tablet: 0,
      desktop: 0
    };

    for (const v of this.activeVisitors.values()) {
      if (byPage[v.page] !== undefined) {
        byPage[v.page]++;
      } else {
        byPage.other++;
      }

      if (byDevice[v.device] !== undefined) {
        byDevice[v.device]++;
      } else {
        byDevice.desktop++;
      }
    }

    return {
      activeVisitors: total,
      byPage,
      byDevice,
      timestamp: new Date().toISOString()
    };
  }

  emitLiveStats() {
    if (!this.io) return;
    this.io.emit('live_stats', this.getLiveStats());
  }

  broadcastLiveEvent(event) {
    if (!this.io) return;
    this.io.emit('live_event', {
      ...event,
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = new SocketManager();
