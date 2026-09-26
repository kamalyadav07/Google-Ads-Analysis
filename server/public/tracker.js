/**
 * Marketing & Landing Page Intelligence SDK (tracker.js)
 * Standalone, zero-dependency client telemetry & conversion state machine.
 * Captures: Attribution (GCLID/UTMs), Scroll Milestones, CTAs, Form Friction,
 * Device Categories (Phone/Tablet/Laptop), Core Web Vitals, and Technical Errors.
 */
(function (window, document) {
  'use strict';

  // Prevent multiple initializations
  if (window.__TrackIntel && window.__TrackIntel.initialized) {
    return;
  }

  // 1. Configuration & Dataset Discovery
  var currentScript = document.currentScript || (function () {
    var scripts = document.getElementsByTagName('script');
    for (var i = 0; i < scripts.length; i++) {
      if (scripts[i].src && scripts[i].src.indexOf('tracker.js') !== -1) {
        return scripts[i];
      }
    }
    return scripts[scripts.length - 1];
  })();

  var config = {
    endpoint: (currentScript && currentScript.getAttribute('data-endpoint')) || '/api/v1/collect',
    service: (currentScript && currentScript.getAttribute('data-service')) || detectServiceSlug(),
    flushIntervalMs: 2500,
    sessionTimeoutMinutes: 30
  };

  function detectServiceSlug() {
    var path = window.location.pathname.toLowerCase();
    var match = path.match(/\/(cctv|noc|video-conferencing|cybersecurity|data-center|networking)/);
    return match ? match[1] : (path.replace(/^\/+|\/+$/g, '') || 'home');
  }

  // 2. Storage & Identity Utilities (UUIDv4)
  function generateUUID() {
    var d = new Date().getTime();
    var d2 = (typeof performance !== 'undefined' && performance.now && (performance.now() * 1000)) || 0;
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16;
      if (d > 0) {
        r = (d + r) % 16 | 0;
        d = Math.floor(d / 16);
      } else {
        r = (d2 + r) % 16 | 0;
        d2 = Math.floor(d2 / 16);
      }
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  function getCookie(name) {
    var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
    return match ? decodeURIComponent(match[3]) : null;
  }

  function setCookie(name, value, days) {
    var expires = '';
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = '; expires=' + date.toUTCString();
    }
    document.cookie = name + '=' + encodeURIComponent(value) + expires + '; path=/; SameSite=Lax';
  }

  // Persistent Visitor Token (30 days)
  var visitorToken = (function () {
    var key = '_ti_vid';
    var vid = null;
    try {
      vid = localStorage.getItem(key);
    } catch (e) {}
    if (!vid) {
      vid = getCookie(key);
    }
    if (!vid) {
      vid = generateUUID();
    }
    try {
      localStorage.setItem(key, vid);
    } catch (e) {}
    setCookie(key, vid, 30);
    return vid;
  })();

  // Rolling Session Management (30 minutes)
  var sessionId = (function () {
    var key = '_ti_sid';
    var timeKey = '_ti_sid_time';
    var sid = null;
    var now = Date.now();
    var lastActive = 0;

    try {
      sid = sessionStorage.getItem(key);
      lastActive = parseInt(sessionStorage.getItem(timeKey) || '0', 10);
    } catch (e) {}

    var isExpired = !lastActive || (now - lastActive > config.sessionTimeoutMinutes * 60 * 1000);
    if (!sid || isExpired) {
      sid = generateUUID();
    }

    try {
      sessionStorage.setItem(key, sid);
      sessionStorage.setItem(timeKey, now.toString());
    } catch (e) {}

    return sid;
  })();

  // Update session touch
  function touchSession() {
    try {
      sessionStorage.setItem('_ti_sid_time', Date.now().toString());
    } catch (e) {}
  }

  // 3. Attribution Extraction
  function getQueryParams() {
    var params = {};
    var search = window.location.search.substring(1);
    if (!search) return params;
    var pairs = search.split('&');
    for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i].split('=');
      var key = decodeURIComponent(pair[0]);
      var val = pair[1] ? decodeURIComponent(pair[1].replace(/\+/g, ' ')) : '';
      params[key] = val;
    }
    return params;
  }

  var qParams = getQueryParams();
  var attribution = {
    gclid: qParams['gclid'] || qParams['wbraid'] || qParams['gbraid'] || '',
    utm_source: qParams['utm_source'] || '',
    utm_medium: qParams['utm_medium'] || '',
    utm_campaign: qParams['utm_campaign'] || '',
    utm_term: qParams['utm_term'] || '',
    utm_content: qParams['utm_content'] || '',
    referrer: document.referrer || ''
  };

  // Cache attribution in sessionStorage for subsequent page navigation
  try {
    if (attribution.gclid) sessionStorage.setItem('_ti_gclid', attribution.gclid);
    else attribution.gclid = sessionStorage.getItem('_ti_gclid') || '';

    if (attribution.utm_campaign) {
      sessionStorage.setItem('_ti_utm', JSON.stringify(attribution));
    } else {
      var cachedUtm = sessionStorage.getItem('_ti_utm');
      if (cachedUtm) {
        var parsed = JSON.parse(cachedUtm);
        attribution.utm_source = attribution.utm_source || parsed.utm_source;
        attribution.utm_medium = attribution.utm_medium || parsed.utm_medium;
        attribution.utm_campaign = attribution.utm_campaign || parsed.utm_campaign;
        attribution.utm_term = attribution.utm_term || parsed.utm_term;
        attribution.utm_content = attribution.utm_content || parsed.utm_content;
      }
    }
  } catch (e) {}

  // 4. Device Classification (Phone vs Tablet vs Laptop/Desktop)
  function getDeviceCategory() {
    var ua = navigator.userAgent || '';
    var width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

    var isTablet = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk)/i.test(ua);
    if (isTablet || (width >= 768 && width <= 1024 && ('ontouchstart' in window || navigator.maxTouchPoints > 0))) {
      return 'tablet';
    }

    var isMobile = /mobile|iphone|ipod|android.*mobile|blackberry|phone|iemobile/i.test(ua);
    if (isMobile || width < 768) {
      return 'mobile'; // Phone
    }

    return 'desktop'; // Laptop / Desktop
  }

  function getBrowserOS() {
    var ua = navigator.userAgent;
    var os = 'Unknown';
    if (ua.indexOf('Win') !== -1) os = 'Windows';
    else if (ua.indexOf('Mac') !== -1) os = 'macOS';
    else if (ua.indexOf('Linux') !== -1) os = 'Linux';
    else if (ua.indexOf('Android') !== -1) os = 'Android';
    else if (ua.indexOf('iPhone') !== -1 || ua.indexOf('iPad') !== -1) os = 'iOS';

    var browser = 'Unknown';
    if (ua.indexOf('Firefox') !== -1) browser = 'Firefox';
    else if (ua.indexOf('SamsungBrowser') !== -1) browser = 'Samsung Internet';
    else if (ua.indexOf('Opera') !== -1 || ua.indexOf('OPR') !== -1) browser = 'Opera';
    else if (ua.indexOf('Edge') !== -1 || ua.indexOf('Edg') !== -1) browser = 'Edge';
    else if (ua.indexOf('Chrome') !== -1) browser = 'Chrome';
    else if (ua.indexOf('Safari') !== -1) browser = 'Safari';

    return { os: os, browser: browser };
  }

  var browserInfo = getBrowserOS();
  var deviceInfo = {
    category: getDeviceCategory(),
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    os: browserInfo.os,
    browser: browserInfo.browser
  };

  // 5. In-Memory Event Queue & Transport
  var eventQueue = [];
  var isFlushing = false;

  function pushEvent(type, data) {
    touchSession();
    eventQueue.push({
      event_type: type,
      element_id: (data && data.element_id) || null,
      element_text: (data && data.element_text) || null,
      element_location: (data && data.element_location) || null,
      metadata: data || {},
      timestamp: new Date().toISOString()
    });

    if (data && data.immediate) {
      flushQueue();
    }
  }

  function flushQueue() {
    if (eventQueue.length === 0 || isFlushing) return;
    isFlushing = true;

    var eventsToSend = eventQueue.slice();
    eventQueue = [];

    var payload = {
      session_id: sessionId,
      visitor_token: visitorToken,
      landing_page_slug: config.service,
      page_url: window.location.href,
      page_title: document.title,
      referrer: attribution.referrer,
      gclid: attribution.gclid,
      utm_source: attribution.utm_source,
      utm_medium: attribution.utm_medium,
      utm_campaign: attribution.utm_campaign,
      utm_term: attribution.utm_term,
      utm_content: attribution.utm_content,
      device: deviceInfo,
      events: eventsToSend
    };

    var payloadStr = JSON.stringify(payload);
    var sent = false;

    if (navigator.sendBeacon) {
      try {
        var blob = new Blob([payloadStr], { type: 'application/json' });
        sent = navigator.sendBeacon(config.endpoint, blob);
      } catch (e) {
        sent = false;
      }
    }

    if (!sent) {
      try {
        fetch(config.endpoint, {
          method: 'POST',
          body: payloadStr,
          headers: { 'Content-Type': 'application/json' },
          keepalive: true
        }).catch(function () {
          // Re-queue on network error
          eventQueue = eventsToSend.concat(eventQueue);
        });
      } catch (e) {
        eventQueue = eventsToSend.concat(eventQueue);
      }
    }

    isFlushing = false;
  }

  // Periodic flush
  setInterval(flushQueue, config.flushIntervalMs);
  window.addEventListener('beforeunload', function () {
    checkFormAbandonment();
    flushQueue();
  });
  window.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') {
      flushQueue();
    }
  });

  // 6. Milestone Scroll Depth Observer (10%, 25%, 50%, 75%, 90%, 100%)
  var scrollMilestones = [10, 25, 50, 75, 90, 100];
  var reachedMilestones = {};
  var maxScrollDepth = 0;
  var scrollTicking = false;

  function evaluateScroll() {
    var docHeight = Math.max(
      document.body.scrollHeight, document.documentElement.scrollHeight,
      document.body.offsetHeight, document.documentElement.offsetHeight,
      document.body.clientHeight, document.documentElement.clientHeight
    );
    var winHeight = window.innerHeight || document.documentElement.clientHeight;
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
    var trackableHeight = docHeight - winHeight;

    var currentPercent = trackableHeight > 0 ? Math.min(100, Math.round(((scrollTop + winHeight) / docHeight) * 100)) : 100;
    if (currentPercent > maxScrollDepth) {
      maxScrollDepth = currentPercent;
    }

    for (var i = 0; i < scrollMilestones.length; i++) {
      var milestone = scrollMilestones[i];
      if (currentPercent >= milestone && !reachedMilestones[milestone]) {
        reachedMilestones[milestone] = true;
        pushEvent('scroll_milestone', {
          milestone: milestone,
          max_scroll: maxScrollDepth,
          element_location: 'scroll_' + milestone
        });
      }
    }
    scrollTicking = false;
  }

  window.addEventListener('scroll', function () {
    if (!scrollTicking) {
      scrollTicking = true;
      if (window.requestAnimationFrame) {
        window.requestAnimationFrame(evaluateScroll);
      } else {
        setTimeout(evaluateScroll, 150);
      }
    }
  }, { passive: true });

  // 7. Automated Hidden Form Field Injection
  function injectHiddenFieldsToForm(form) {
    if (!form || form.getAttribute('data-ti-injected')) return;

    var fields = {
      gclid: attribution.gclid,
      utm_source: attribution.utm_source,
      utm_medium: attribution.utm_medium,
      utm_campaign: attribution.utm_campaign,
      utm_term: attribution.utm_term,
      utm_content: attribution.utm_content,
      tracker_session_id: sessionId,
      tracker_visitor_id: visitorToken,
      tracker_service: config.service
    };

    for (var name in fields) {
      if (fields[name]) {
        var existing = form.querySelector('input[name="' + name + '"]');
        if (!existing) {
          var input = document.createElement('input');
          input.type = 'hidden';
          input.name = name;
          input.value = fields[name];
          form.appendChild(input);
        } else {
          existing.value = fields[name];
        }
      }
    }
    form.setAttribute('data-ti-injected', 'true');
  }

  function scanAndInjectForms() {
    var forms = document.querySelectorAll('form');
    for (var i = 0; i < forms.length; i++) {
      injectHiddenFieldsToForm(forms[i]);
    }
  }

  // 8. CTA & Click Event Delegation
  function findElementLocation(el) {
    var cur = el;
    while (cur && cur !== document.body) {
      var id = (cur.id || '').toLowerCase();
      var cls = (cur.className || '').toString().toLowerCase();
      var tag = cur.tagName.toLowerCase();

      if (id.indexOf('hero') !== -1 || cls.indexOf('hero') !== -1) return 'hero';
      if (id.indexOf('sticky') !== -1 || cls.indexOf('sticky') !== -1 || cls.indexOf('fixed') !== -1) return 'sticky';
      if (id.indexOf('footer') !== -1 || cls.indexOf('footer') !== -1 || tag === 'footer') return 'footer';
      if (id.indexOf('nav') !== -1 || cls.indexOf('nav') !== -1 || tag === 'header' || tag === 'nav') return 'nav';
      if (id.indexOf('pricing') !== -1 || cls.indexOf('pricing') !== -1) return 'pricing';
      cur = cur.parentElement;
    }
    return 'middle';
  }

  document.body.addEventListener('click', function (e) {
    var target = e.target;
    var ctaEl = target.closest('button, a, input[type="submit"], input[type="button"], [data-cta]');
    if (!ctaEl) return;

    var text = (ctaEl.innerText || ctaEl.value || ctaEl.getAttribute('aria-label') || '').trim().substring(0, 80);
    var href = ctaEl.getAttribute('href') || '';
    var explicitCta = ctaEl.getAttribute('data-cta');
    var isPhone = href.indexOf('tel:') === 0;
    var isWhatsApp = href.indexOf('wa.me') !== -1 || href.indexOf('api.whatsapp.com') !== -1 || href.indexOf('whatsapp') !== -1;

    var ctaPatterns = /(book.*demo|get.*quote|talk.*expert|contact|enquire|request.*callback|download|schedule|call.*now|whatsapp)/i;
    var isHighIntentCTA = explicitCta || isPhone || isWhatsApp || ctaPatterns.test(text);

    if (isHighIntentCTA) {
      var eventType = isPhone ? 'phone_click' : (isWhatsApp ? 'whatsapp_click' : 'cta_click');
      var location = findElementLocation(ctaEl);

      pushEvent(eventType, {
        element_id: ctaEl.id || null,
        element_text: text || explicitCta || href,
        element_location: location,
        href: href,
        immediate: true
      });
    }
  }, true);

  // 9. Form Behavioral State Machine (No PII)
  var activeFormState = {
    formId: null,
    started: false,
    focusedField: null,
    fieldStartTime: 0,
    fieldDwellTimes: {},
    errorsDetected: {},
    submitted: false
  };

  function setupFormListeners() {
    var forms = document.querySelectorAll('form');
    for (var i = 0; i < forms.length; i++) {
      bindForm(forms[i]);
    }
  }

  function bindForm(form) {
    if (form.getAttribute('data-ti-bound')) return;
    form.setAttribute('data-ti-bound', 'true');

    var formId = form.id || form.getAttribute('name') || 'form_' + Math.random().toString(36).substr(2, 6);

    // Form View (IntersectionObserver)
    if (window.IntersectionObserver) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !form.getAttribute('data-ti-viewed')) {
            form.setAttribute('data-ti-viewed', 'true');
            pushEvent('form_open', {
              element_id: formId,
              element_location: findElementLocation(form)
            });
            observer.unobserve(form);
          }
        });
      }, { threshold: 0.25 });
      observer.observe(form);
    }

    // Form Field Interaction (focus, blur, input)
    form.addEventListener('focusin', function (e) {
      var field = e.target;
      if (!field || !field.name) return;

      var fieldName = field.name.toLowerCase();

      // Form Start milestone
      if (!activeFormState.started) {
        activeFormState.started = true;
        activeFormState.formId = formId;
        pushEvent('form_start', {
          element_id: formId,
          first_field: fieldName,
          element_location: findElementLocation(form)
        });
      }

      // Track dwell time on current field
      activeFormState.focusedField = fieldName;
      activeFormState.fieldStartTime = Date.now();
    }, true);

    form.addEventListener('focusout', function (e) {
      var field = e.target;
      if (!field || !field.name || activeFormState.focusedField !== field.name.toLowerCase()) return;

      var fieldName = field.name.toLowerCase();
      var duration = Date.now() - activeFormState.fieldStartTime;
      activeFormState.fieldDwellTimes[fieldName] = (activeFormState.fieldDwellTimes[fieldName] || 0) + duration;

      pushEvent('form_field_dwell', {
        element_id: formId,
        field_name: fieldName,
        dwell_ms: duration,
        is_filled: Boolean(field.value && field.value.trim().length > 0)
      });
    }, true);

    // Validation Errors
    form.addEventListener('invalid', function (e) {
      var field = e.target;
      if (!field) return;

      var fieldName = field.name || field.id || 'unnamed_field';
      var validationMsg = field.validationMessage || 'Constraint validation failed';

      activeFormState.errorsDetected[fieldName] = validationMsg;

      pushEvent('form_error', {
        element_id: formId,
        field_name: fieldName,
        error_message: validationMsg,
        element_location: findElementLocation(form)
      });
    }, true);

    // Form Submission
    form.addEventListener('submit', function () {
      activeFormState.submitted = true;
      pushEvent('form_submit', {
        element_id: formId,
        element_location: findElementLocation(form),
        immediate: true
      });
    });
  }

  function checkFormAbandonment() {
    if (activeFormState.started && !activeFormState.submitted && activeFormState.focusedField) {
      pushEvent('form_abandon', {
        element_id: activeFormState.formId,
        abandoned_field: activeFormState.focusedField,
        field_dwell_summary: activeFormState.fieldDwellTimes,
        immediate: true
      });
    }
  }

  // 10. Technical Health & Error Telemetry
  window.addEventListener('error', function (e) {
    pushEvent('js_error', {
      message: (e.message || '').substring(0, 200),
      filename: (e.filename || '').split('/').pop(),
      lineno: e.lineno,
      colno: e.colno,
      stack: (e.error && e.error.stack ? e.error.stack.substring(0, 300) : null),
      immediate: true
    });
  });

  window.addEventListener('unhandledrejection', function (e) {
    var reason = e.reason;
    var msg = (typeof reason === 'object' && reason && reason.message) ? reason.message : String(reason);
    pushEvent('promise_rejection', {
      message: msg.substring(0, 200),
      immediate: true
    });
  });

  // Core Web Vitals (LCP)
  if (window.PerformanceObserver) {
    try {
      var lcpObserver = new PerformanceObserver(function (entryList) {
        var entries = entryList.getEntries();
        var lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          pushEvent('core_web_vitals', {
            metric: 'LCP',
            value_ms: Math.round(lastEntry.startTime)
          });
        }
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) {}
  }

  // 11. Initial Page View Milestone
  window.addEventListener('DOMContentLoaded', function () {
    scanAndInjectForms();
    setupFormListeners();

    // DOM Mutation Observer for dynamically rendered forms (e.g. modals)
    if (window.MutationObserver) {
      var domObserver = new MutationObserver(function () {
        scanAndInjectForms();
        setupFormListeners();
      });
      domObserver.observe(document.body, { childList: true, subtree: true });
    }

    pushEvent('page_view', {
      element_location: 'top',
      max_scroll: 0,
      timing: (window.performance && window.performance.timing) ? {
        load_time: window.performance.timing.loadEventEnd - window.performance.timing.navigationStart
      } : null
    });
  });

  // Public SDK API
  window.__TrackIntel = {
    initialized: true,
    version: '1.0.0',
    getSessionId: function () { return sessionId; },
    getVisitorToken: function () { return visitorToken; },
    trackCustomEvent: function (name, data) { pushEvent(name, data); },
    flush: flushQueue
  };

})(window, document);
