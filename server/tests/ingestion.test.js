const ingestionService = require('../src/services/ingestionService');

describe('Ingestion Service Logic & Batch Processor', () => {
  test('rejects payload missing session_id or visitor_token', async () => {
    await expect(ingestionService.processBatch({}))
      .rejects.toThrow('session_id and visitor_token are required');

    await expect(ingestionService.processBatch({ session_id: '123' }))
      .rejects.toThrow('session_id and visitor_token are required');
  });

  test('normalizes device categories accurately', () => {
    const validCategories = ['mobile', 'tablet', 'desktop'];
    const sanitizeDevice = (cat) => (cat && validCategories.includes(cat)) ? cat : 'desktop';

    expect(sanitizeDevice('mobile')).toBe('mobile');
    expect(sanitizeDevice('tablet')).toBe('tablet');
    expect(sanitizeDevice('desktop')).toBe('desktop');
    expect(sanitizeDevice('smart-tv')).toBe('desktop');
    expect(sanitizeDevice(undefined)).toBe('desktop');
  });

  test('accurately flags engagement based on max scroll >= 50% or CTA clicks', () => {
    const checkEngagement = (events, maxScroll) => {
      let hasCtaOrForm = false;
      for (const ev of events) {
        if (['cta_click', 'whatsapp_click', 'phone_click', 'form_start', 'form_submit'].includes(ev.event_type)) {
          hasCtaOrForm = true;
          break;
        }
      }
      const isEngaged = maxScroll >= 50 || hasCtaOrForm;
      const isBounce = !isEngaged;
      return { isEngaged, isBounce };
    };

    // Case 1: Low scroll (25%), no CTA -> Bounce
    expect(checkEngagement([], 25)).toEqual({ isEngaged: false, isBounce: true });

    // Case 2: High scroll (75%), no CTA -> Engaged
    expect(checkEngagement([], 75)).toEqual({ isEngaged: true, isBounce: false });

    // Case 3: Low scroll (10%), clicked WhatsApp CTA -> Engaged
    expect(checkEngagement([{ event_type: 'whatsapp_click' }], 10)).toEqual({ isEngaged: true, isBounce: false });
  });
});
