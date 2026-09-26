# Marketing & Landing Page Intelligence Platform — Technical Design Specification

**Document Version:** 1.0.0  
**Date:** September 25, 2026  
**Status:** Approved & Ready for Implementation Plan  

---

## 1. Executive Summary & Objective

The **Marketing & Landing Page Intelligence Platform** is a centralized, live marketing analytics, visitor behavior, and conversion attribution system designed to bridge the gap between ad spend and closed business revenue.

Rather than isolating Google Ads metrics and Bitrix24 CRM data, this platform stitches together the complete end-to-end journey:
```
Google Ad (Impression & Click)
         ↓
Landing Page (/cctv, /noc, /video-conferencing, /cybersecurity, /data-center, /networking)
         ↓
Visitor Telemetry (Device: Phone / Tablet / Laptop, Geo: City/State, Scroll: 10%-100%, Dwell Time)
         ↓
CTA & Form State Machine (Views, Starts, Field Dwell, Errors, Abandonment, Submissions)
         ↓
Bitrix24 CRM (Raw Leads → Qualified Leads → Opportunities → Proposals → Won Deals → Revenue)
         ↓
Evidence-Based Diagnostic Engine ("Why Leads Aren't Coming" — Attribution to Ads vs Page vs Tech vs Sales)
```

The core principle of this platform is not merely reporting *what* happened, but explaining *where* the funnel broke and providing evidence-backed diagnostics.

---

## 2. System Architecture

The system follows a **Decoupled Modular Architecture** structured into three primary packages:

```
├── tracker/               # Standalone, dependency-free vanilla JS tracking SDK (<6KB gzipped)
│   └── tracker.js         # Served statically via Express (/sdk/tracker.js)
│
├── server/                # High-performance Node.js + Express + MySQL + Socket.IO API
│   ├── config/            # Environment & database connection pool
│   ├── db/                # Pure SQL migrations & schema seeders
│   ├── integrations/      # Google Ads API sync & Bitrix24 CRM webhook handlers
│   ├── services/          # Ingestion pipeline, diagnostic heuristics, Gemini AI analyst
│   ├── routes/            # REST API endpoints (/api/v1/collect, /api/v1/dashboard, etc.)
│   └── sockets/           # Socket.IO real-time active visitor & event broadcaster
│
├── client/                # React (Vite) + Tailwind CSS + Recharts + Lucide Icons SPA
│   ├── src/
│   │   ├── components/    # Reusable UI primitives (MetricCards, Funnels, Tables, Modals)
│   │   ├── dashboards/    # Executive Overview, Live Telemetry, Funnel, Form Waterfall,
│   │   │                  # Device Intelligence, Geo Map, Tech Health, AI Analyst
│   │   ├── context/       # Socket.IO & Analytics State Management
│   │   └── services/      # Axios API client
│   │
└── landing-pages/         # Production-ready demo service pages (/cctv, /noc, /cybersecurity, etc.)
                           # pre-instrumented with tracker.js to test data flow immediately
```

---

## 3. Database Schema (MySQL)

All tables use `utf8mb4` encoding with explicit foreign keys and composite indexes for sub-millisecond query latency.

### 3.1 Advertising Tables
* **`campaigns`**: `id`, `campaign_id` (Google Ads ID), `name`, `status`, `channel_type`, `daily_budget`, `created_at`.
* **`ad_groups`**: `id`, `ad_group_id`, `campaign_id`, `name`, `status`.
* **`ads`**: `id`, `ad_id`, `ad_group_id`, `headline`, `description`, `final_url`.
* **`keywords`**: `id`, `keyword_id`, `ad_group_id`, `keyword_text`, `match_type`.
* **`ad_metrics_daily`**: `id`, `date`, `campaign_id`, `ad_group_id`, `impressions`, `clicks`, `spend`, `cpc`, `ctr`, `conversions`, `cost_per_conversion`. Index: `(date, campaign_id)`.

### 3.2 Traffic & Session Tables
* **`landing_pages`**: `id`, `slug` (`cctv`, `noc`, `video-conferencing`, `cybersecurity`, `data-center`, `networking`), `title`, `target_cpl`, `is_active`.
* **`visitors`**: `id`, `visitor_token` (UUIDv4), `first_seen_at`, `last_seen_at`, `device_category` (`mobile`, `tablet`, `desktop`), `device_model`, `browser`, `os`, `screen_width`, `screen_height`, `city`, `state`, `country`. Index: `(visitor_token)`.
* **`sessions`**: `id`, `session_id` (UUIDv4), `visitor_id`, `landing_page_id`, `started_at`, `ended_at`, `duration_seconds`, `max_scroll_depth` (0-100), `is_bounce`, `is_engaged`, `referrer`, `gclid`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`. Indexes: `(session_id)`, `(gclid)`, `(started_at, landing_page_id)`.

### 3.3 Behavioral & Form Telemetry
* **`events`**: `id`, `session_id`, `event_type` (`page_view`, `scroll_milestone`, `cta_click`, `form_open`, `form_start`, `form_submit`, `video_interaction`, `whatsapp_click`, `phone_click`), `element_id`, `element_text`, `element_location` (`hero`, `middle`, `sticky`, `footer`), `metadata` (JSON), `created_at`. Index: `(session_id, event_type)`.
* **`form_field_events`**: `id`, `session_id`, `form_id`, `field_name` (`full_name`, `phone`, `company`, `requirement`, etc.), `dwell_time_ms`, `error_type` (validation fail message/code), `was_abandoned` (boolean), `created_at`. Index: `(form_id, field_name, was_abandoned)`.
* **`technical_health_logs`**: `id`, `session_id`, `error_type` (`js_error`, `promise_rejection`, `api_error`, `form_submit_failure`), `message`, `stack_snippet`, `page_url`, `lcp_ms`, `load_time_ms`, `http_status`, `created_at`.

### 3.4 CRM & Revenue Tables (Bitrix24)
* **`crm_leads`**: `id`, `bitrix_lead_id`, `session_id`, `gclid`, `service_slug`, `lead_status` (`RAW`, `CONTACTED`, `JUNK`, `QUALIFIED`), `contact_latency_minutes` (first sales call latency), `created_at`, `qualified_at`. Index: `(bitrix_lead_id)`, `(session_id)`.
* **`crm_deals`**: `id`, `bitrix_deal_id`, `lead_id`, `deal_stage` (`OPPORTUNITY`, `PROPOSAL`, `NEGOTIATION`, `WON`, `LOST`), `deal_value`, `loss_reason`, `won_at`, `lost_at`, `created_at`. Index: `(bitrix_deal_id)`.

---

## 4. The Tracking SDK (`tracker.js`)

The client tracking SDK is completely standalone, lightweight (< 6KB gzipped), and runs passively without impacting First Contentful Paint (FCP) or Core Web Vitals.

### 4.1 Automated Capabilities
1. **Zero-Touch Attribution**: Automatically parses `gclid` and all `utm_*` parameters on URL load. Stores visitor identity in `localStorage` with fallback cookie.
2. **Auto-Inject Hidden Form Fields**: Automatically detects all `<form>` elements and appends:
   ```html
   <input type="hidden" name="gclid" value="...">
   <input type="hidden" name="utm_source" value="...">
   <input type="hidden" name="utm_campaign" value="...">
   <input type="hidden" name="tracker_session_id" value="...">
   ```
3. **Scroll Depth Observer**: Dispatches passive milestone signals at exact points: `10%`, `25%`, `50%`, `75%`, `90%`, and `100%`.
4. **CTA Auto-Capture**: Intercepts any click on elements with `data-cta="..."`, standard CTA button text strings (*"Get a Quote"*, *"Book a Demo"*, *"Talk to Expert"*), and communication channels (`tel:`, WhatsApp).
5. **Form Behavior State Machine**:
   * Form View (via `IntersectionObserver`)
   * Form Start (first focus)
   * Field Dwell Time & Blur
   * Validation Error Capture (HTML5 constraint checks and validation states)
   * Form Abandonment (`beforeunload` beacon tracking the last focused input)
   * Form Submission (success/failure response tracking)
6. **Device & Browser Fingerprint**:
   * Classifies device: Phone (`mobile`), Tablet (`tablet`), Laptop/Desktop (`desktop`).
   * Captures screen resolution (`window.screen.width x height`), browser, and operating system.
7. **Technical Health Listeners**:
   * `window.onerror` and `window.onunhandledrejection`
   * Performance timing (TTFB, DOM load, LCP)
8. **Transport Layer**:
   * `navigator.sendBeacon` with fallback to `fetch(..., { keepalive: true })`.
   * Batching queue flushing every 2 seconds or immediately on high-priority conversion events.

---

## 5. Device-Wise Intelligence & Analytics

The platform treats **Device Breakdown** as a primary dimension across all analytical layers:

1. **Real-Time Live Device Monitoring**:
   * Live visitor counter segmented by device type: Phone, Tablet, Laptop.
   * Real-time stream tagged with device icons, OS, and browser.
2. **Device Conversion Waterfall**:
   * Compares Phone vs. Tablet vs. Laptop across all 13 funnel stages.
   * Exposes device-specific conversion bottlenecks:
     * *Example*: High mobile traffic (70%), but 0.8% form completion due to input friction on mobile keyboards, compared to 3.8% on desktop.
3. **Device Scroll Depth Decay**:
   * Side-by-side decay graphs revealing where mobile visitors drop off (e.g. dropping at 25% due to long hero sections) versus desktop visitors.

---

## 6. Conversion Diagnostics Engine ("Why Leads Aren't Coming")

The diagnostic engine evaluates 5 mutually exclusive failure domains using quantitative data rules:

| Possibility Domain | Monitored Metrics | Threshold / Trigger Condition | Automated Diagnostic Verdict |
| :--- | :--- | :--- | :--- |
| **1. Advertising & Traffic** | CTR, CPC, Bounce Rate, Search Terms | CTR < 1.2% OR Bounce Rate > 75% OR Engagement < 15% | Traffic quality issue: poor search intent, irrelevant keywords, or misleading ad copy. |
| **2. Landing Page Experience** | Scroll Depth, CTA Clicks, Time on Page | 25% Scroll drop > 60% OR CTA Click Rate < 2% | Page structure issue: weak above-the-fold value prop, poor CTA contrast, or lack of social proof. |
| **3. Technical & Dev** | JS Errors, API 500s, LCP, Form Failures | JS Errors > 5/day OR Form Submit Fail > 3% OR LCP > 4.5s | Technical problem: Broken form validation script, slow server response, or API outage. |
| **4. Lead Quality & Spam** | Form Submissions vs. Qualified Leads | Qualified Rate < 15% OR Junk/Spam > 40% | Lead quality issue: Low-intent traffic, incentives attracting non-commercial users, or bot spam. |
| **5. CRM & Sales Process** | Contact Latency, Opp Creation, Loss Reason | Contact Latency > 120 mins OR Opp Rate < 20% | CRM / Sales execution issue: Delayed follow-up SLA, leads going cold before sales outreach. |

---

## 7. AI Analyst (Gemini Integration)

* **Architecture**: The backend aggregates real-time metrics, diagnostic flags, and funnel drops from MySQL and sends them as structured context to the Gemini API (`@google/genai`).
* **Capabilities**:
  * Answers management questions in plain English: *"Why did CCTV leads drop today?"*, *"Which campaign has the best CPQL?"*, *"Is our mobile drop-off technical or content-related?"*.
  * Produces evidence-grounded reports with bulleted root causes and concrete action items.

---

## 8. Real-Time Dashboard (React + Tailwind + Socket.IO)

* **Key Views**:
  1. **Executive Overview**: Spend, Clicks, Visitors, Leads, Qualified Leads, Opportunities, Won Deals, Won Revenue, CPL, CPQL, ROAS.
  2. **Live Command Center**: Pulsating active visitors, service page distribution, device distribution, real-time event feed.
  3. **13-Stage Conversion Funnel**: Interactive waterfall with stage-to-stage conversion % and anomaly alert badges.
  4. **Device Intelligence Matrix**: Phone vs. Tablet vs. Laptop breakdown for visitors, scroll, form starts, leads, and revenue.
  5. **Landing Page Comparative Studio**: Side-by-side metrics for CCTV, NOC, VC, Cybersecurity, Data Center, and Networking.
  6. **Form Friction & Abandonment Waterfall**: Field dwell times, validation error hotspots, and abandonment points.
  7. **Campaign & Keyword Attribution**: Spend vs. Qualified Leads and Revenue per campaign.
  8. **Geographic Distribution**: City performance table & bubble map (Delhi NCR, Mumbai, Bengaluru, Hyderabad, Pune, Chennai, etc.).
  9. **Technical Health Radar**: Core Web Vitals, JS error stack traces, API response latencies.
  10. **Bitrix24 CRM Funnel**: Lead qualification latency, deal pipeline stages, and loss reason analysis.
  11. **AI Analyst Assistant Drawer**: Natural-language conversational panel for instant insights.

---

## 9. Verification & Testing Strategy

1. **Database Schema Verification**: Automated SQL migrations run on startup, verifying table creation and indexes.
2. **SDK Ingestion & Beacon Test**: Instrumented test runner firing synthetic pageviews, scroll events, CTA clicks, form flows, and JS errors to verify MySQL persistence and Socket.IO emission.
3. **Bitrix24 Webhook Simulation**: Synthetic webhook payloads sent to `/api/v1/crm/bitrix/webhook` to verify session stitching via `gclid`.
4. **Google Ads Sync Verification**: Scheduled sync worker running on mock/real credentials with idempotent upserts.
5. **Diagnostic Engine Heuristic Test**: Automated unit tests asserting correct verdict classification across all 5 failure modes.
6. **Frontend UI End-to-End Validation**: Launch frontend and backend concurrently, verify live WebSocket updates, device breakdowns, filter interactions, and AI Analyst responses.
