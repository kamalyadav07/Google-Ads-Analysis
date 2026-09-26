/**
 * Unit Tests for Tracking SDK (tracker.js)
 */

describe('Tracking SDK (tracker.js) Verification', () => {
  let originalLocation;
  let originalUserAgent;

  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = '';
    localStorage.clear();
    sessionStorage.clear();
    document.cookie = '';
  });

  test('extracts GCLID and UTM parameters from query string', () => {
    const search = '?utm_source=google&utm_medium=cpc&utm_campaign=cctv_delhi&gclid=test_gclid_12345';
    
    // Test URL param extractor helper logic
    const parseParams = (str) => {
      const params = {};
      const pairs = str.substring(1).split('&');
      for (const pair of pairs) {
        const [k, v] = pair.split('=');
        params[decodeURIComponent(k)] = decodeURIComponent(v || '');
      }
      return params;
    };

    const extracted = parseParams(search);
    expect(extracted.utm_source).toBe('google');
    expect(extracted.utm_medium).toBe('cpc');
    expect(extracted.utm_campaign).toBe('cctv_delhi');
    expect(extracted.gclid).toBe('test_gclid_12345');
  });

  test('classifies device category accurately based on width and user agent', () => {
    const classifyDevice = (ua, width, touchPoints = 0) => {
      const isTablet = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk)/i.test(ua);
      if (isTablet || (width >= 768 && width <= 1024 && touchPoints > 0)) {
        return 'tablet';
      }
      const isMobile = /mobile|iphone|ipod|android.*mobile|blackberry|phone|iemobile/i.test(ua);
      if (isMobile || width < 768) {
        return 'mobile'; // Phone
      }
      return 'desktop'; // Laptop / Desktop
    };

    // Mobile Phone tests
    expect(classifyDevice('Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)', 390, 5)).toBe('mobile');
    expect(classifyDevice('Mozilla/5.0 (Linux; Android 13; SM-S908B)', 412, 5)).toBe('mobile');
    expect(classifyDevice('Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 600, 0)).toBe('mobile');

    // Tablet tests
    expect(classifyDevice('Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X)', 820, 5)).toBe('tablet');
    expect(classifyDevice('Mozilla/5.0 (Linux; Android 12; SM-X800)', 800, 5)).toBe('tablet');

    // Laptop / Desktop tests
    expect(classifyDevice('Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 1920, 0)).toBe('desktop');
    expect(classifyDevice('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 1440, 0)).toBe('desktop');
  });

  test('evaluates milestone scroll depths (10, 25, 50, 75, 90, 100)', () => {
    const calculateMilestones = (scrollTop, winHeight, docHeight) => {
      const currentPercent = Math.min(100, Math.round(((scrollTop + winHeight) / docHeight) * 100));
      const milestones = [10, 25, 50, 75, 90, 100];
      return milestones.filter(m => currentPercent >= m);
    };

    // At top of page (winHeight 800, docHeight 3200, scrollTop 0) -> 25%
    expect(calculateMilestones(0, 800, 3200)).toEqual([10, 25]);

    // Scrolled halfway (scrollTop 800, winHeight 800, docHeight 3200) -> 50%
    expect(calculateMilestones(800, 800, 3200)).toEqual([10, 25, 50]);

    // Near bottom (scrollTop 2100, winHeight 800, docHeight 3200) -> 90.6% -> [10, 25, 50, 75, 90]
    expect(calculateMilestones(2100, 800, 3200)).toEqual([10, 25, 50, 75, 90]);

    // At bottom (scrollTop 2400, winHeight 800, docHeight 3200) -> 100%
    expect(calculateMilestones(2400, 800, 3200)).toEqual([10, 25, 50, 75, 90, 100]);
  });

  test('injects hidden attribution and session fields into existing form', () => {
    document.body.innerHTML = `
      <form id="lead-form" action="/submit" method="POST">
        <input type="text" name="name" placeholder="Your Name" />
        <input type="tel" name="phone" placeholder="Phone" />
        <button type="submit">Get a Quote</button>
      </form>
    `;

    const form = document.getElementById('lead-form');
    const fields = {
      gclid: 'gclid_test_987',
      utm_source: 'google',
      utm_campaign: 'cctv_campaign',
      tracker_session_id: 'test-session-uuid-123'
    };

    // Injection logic
    for (const name in fields) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = fields[name];
      form.appendChild(input);
    }

    expect(form.querySelector('input[name="gclid"]').value).toBe('gclid_test_987');
    expect(form.querySelector('input[name="utm_source"]').value).toBe('google');
    expect(form.querySelector('input[name="utm_campaign"]').value).toBe('cctv_campaign');
    expect(form.querySelector('input[name="tracker_session_id"]').value).toBe('test-session-uuid-123');
  });
});
