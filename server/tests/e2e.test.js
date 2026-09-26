const request = require('supertest');
const { app } = require('../src/server');

describe('End-to-End Platform Integration Tests', () => {
  test('serves static tracking SDK at /sdk/tracker.js', async () => {
    const res = await request(app).get('/sdk/tracker.js');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/javascript/);
    expect(res.text).toContain('__TrackIntel');
  });

  test('health check returns healthy or degraded status', async () => {
    const res = await request(app).get('/api/health');
    expect([200, 500]).toContain(res.status);
    expect(res.body).toHaveProperty('status');
  });

  test('validates and rejects malformed payload on /api/v1/collect', async () => {
    const res = await request(app)
      .post('/api/v1/collect')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});
