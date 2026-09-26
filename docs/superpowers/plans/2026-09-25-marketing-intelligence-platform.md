# Marketing & Landing Page Intelligence Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-grade, centralized, live Marketing & Landing Page Intelligence Platform connecting Google Ads, high-fidelity landing-page visitor telemetry, form analytics, Bitrix24 CRM pipeline, evidence-based conversion diagnostics ("Why Leads Aren't Coming"), device-wise intelligence (Phone/Tablet/Laptop), and an AI Analyst.

**Architecture:** Decoupled monorepo containing a zero-dependency vanilla JS tracking SDK (`tracker/`), an Express + MySQL + Socket.IO ingestion & analytics backend (`server/`), a React + Vite + Tailwind CSS executive command center (`client/`), and live pre-instrumented service landing pages (`landing-pages/`).

**Tech Stack:** JavaScript (ESNext / Node.js 18+), Express.js, `mysql2/promise`, Socket.IO, `node-cron`, React 18, Vite, Tailwind CSS, Recharts, Lucide React, Google GenAI SDK (`@google/genai`).

**Spec:** [`docs/superpowers/specs/2026-09-25-marketing-intelligence-platform-design.md`](file:///c:/Users/Kamal/Desktop/Google%20Ads%20Analysis/docs/superpowers/specs/2026-09-25-marketing-intelligence-platform-design.md)

## Global Constraints
- Pure SQL schema migrations with composite indexing on `(session_id)`, `(gclid)`, and `(date, campaign_id)`.
- Zero-dependency client tracking SDK (`< 6 KB` gzipped) using `navigator.sendBeacon` with `fetch(..., { keepalive: true })` fallback.
- No storage of unnecessary personal data (PII) during form field dwell or interaction tracking.
- First-class device classification: `mobile` (Phone), `tablet` (Tablet), and `desktop` (Laptop/Desktop) across live streams and historical funnels.
- Quantitative 5-factor diagnostic engine attributing drop-offs to Advertising, Landing Page, Technical, Lead Quality, or Sales Process.
- Human-crafted UI aesthetic: curated dark/light slate palette, smooth micro-interactions, zero generic AI boilerplate.

---

## File Structure Map

```
├── package.json                         # Root workspace scripts (dev, test, seed, start)
├── tracker/
│   ├── src/
│   │   └── tracker.js                   # Zero-dependency client tracking library
│   └── tests/
│       └── tracker.test.js              # Unit tests for attribution, scroll, and form events
├── server/
│   ├── package.json
│   ├── .env.example
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                    # MySQL connection pool & health checker
│   │   ├── db/
│   │   │   ├── migrations/
│   │   │   │   └── 001_initial_schema.sql # Complete DDL schema
│   │   │   ├── migrate.js               # SQL migration runner
│   │   │   └── seed.js                  # Realistic multi-service test dataset
│   │   ├── services/
│   │   │   ├── ingestionService.js      # Session & event batch processor + geo/device parser
│   │   │   ├── diagnosticEngine.js      # 5-factor bottleneck heuristic calculator
│   │   │   └── aiAnalystService.js      # Grounded Gemini analytics synthesizer
│   │   ├── integrations/
│   │   │   ├── googleAds.js             # Google Ads API sync worker & mock generator
│   │   │   └── bitrix24.js              # Bitrix24 webhook receiver & lead-session stitcher
│   │   ├── routes/
│   │   │   ├── collectRoutes.js         # Beacon ingestion endpoint (/api/v1/collect)
│   │   │   ├── dashboardRoutes.js       # KPI, funnel, device, geo, and landing page metrics
│   │   │   ├── crmRoutes.js             # Bitrix24 webhook and sync endpoints
│   │   │   └── aiRoutes.js              # Conversational AI Analyst endpoint
│   │   ├── sockets/
│   │   │   └── socketManager.js         # Socket.IO active visitor rooms & live event broadcaster
│   │   └── server.js                    # Express app bootstrap, static SDK hosting, & cron jobs
│   └── tests/
│       ├── ingestion.test.js            # Ingestion pipeline tests
│       └── diagnostics.test.js          # Funnel diagnostic engine test cases
├── client/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── index.html
│   └── src/
│       ├── index.css                    # Design system tokens and custom scrollbars
│       ├── context/
│       │   └── AnalyticsContext.jsx     # Live Socket.IO connection & global filter state
│       ├── services/
│       │   └── api.js                   # Axios HTTP client
│       ├── components/
│       │   ├── common/
│       │   │   ├── Header.jsx           # Top navigation with live indicator & date picker
│       │   │   ├── ServiceSelector.jsx  # All / CCTV / NOC / Cyber / VC / Data Center tabs
│       │   │   └── MetricCard.jsx       # Polished metric card with trend badge
│       │   └── dashboard/
│       │       ├── ExecutiveKpis.jsx    # Spend, Leads, CPQL, Revenue, Latency tiles
│       │       ├── LiveTelemetryBar.jsx # Real-time visitors, active pages, device split, event ticker
│       │       ├── ConversionFunnel13.jsx # 13-stage interactive waterfall with drop-off alerts
│       │       ├── DiagnosticRootCauseCard.jsx # "Why Leads Aren't Coming" 5-pillar verdict
│       │       ├── DeviceIntelligenceMatrix.jsx # Phone vs Tablet vs Laptop conversion comparison
│       │       ├── LandingPageStudio.jsx # Service-by-service comparative table & scroll curves
│       │       ├── FormFrictionWaterfall.jsx # Field dwell times & abandonment heatmap
│       │       ├── CampaignIntelligence.jsx # Google Ads campaigns, keywords, and ROAS
│       │       ├── GeoDistribution.jsx  # City performance leaderboard & visual distribution
│       │       ├── TechHealthRadar.jsx  # Core Web Vitals, JS error logs, API error table
│       │       ├── CrmSalesFunnel.jsx   # Bitrix24 lead qualification SLA & deal loss reasons
│       │       └── AiAnalystDrawer.jsx  # Natural language AI query assistant with pre-built prompts
│       └── App.jsx                      # Main dashboard layout
└── landing-pages/
    ├── cctv/index.html                  # Realistic CCTV landing page with tracking & form
    ├── cybersecurity/index.html         # Realistic Cybersecurity landing page with tracking & form
    └── noc/index.html                   # Realistic NOC landing page with tracking & form
```

---

## Task Decomposition

### Task 1: Project Scaffolding & Root Workspace Configuration

**Files:**
- Create: `package.json`
- Create: `.gitignore`
- Create: `README.md`

**Interfaces:**
- Produces: Root orchestration scripts (`npm run dev`, `npm run seed`, `npm test`)

- [ ] **Step 1: Create root package.json with workspace dependencies**
  Configure `concurrently` to run both `server` and `client` together.
- [ ] **Step 2: Create .gitignore**
  Ignore `node_modules`, `.env`, `dist`, `coverage`, and IDE state.
- [ ] **Step 3: Create README.md**
  Document architectural overview, quickstart instructions, and GitHub repo pointer.

---

### Task 2: Tracking SDK (`tracker.js`)

**Files:**
- Create: `tracker/src/tracker.js`
- Create: `tracker/tests/tracker.test.js`

**Interfaces:**
- Produces: `window.__TrackIntel` client tracker. Emits batched JSON payloads to `POST /api/v1/collect`.
- Payload schema: `{ session_id, visitor_token, landing_page, url, referrer, gclid, utm: {...}, device: { type, screen, browser, os }, events: [...] }`

- [ ] **Step 1: Write tracker unit tests in `tracker/tests/tracker.test.js`**
  Verify URL query parameter extraction (`gclid`, `utm_*`), visitor token persistence in `localStorage`, milestone scroll calculation (10/25/50/75/90/100%), CTA element detection, and form lifecycle events.
- [ ] **Step 2: Implement `tracker/src/tracker.js`**
  Implement:
  - Session and visitor token management (UUIDv4 generation, 30-min session timeout).
  - Automated form hidden field injection (`gclid`, `utm_*`, `tracker_session_id`).
  - Milestone scroll listener with throttled `requestAnimationFrame`.
  - Event delegation for CTA clicks (`data-cta`, phone links, WhatsApp).
  - Form state machine: view, start, field dwell, validation error, beforeunload abandonment, submit success/failure.
  - Device detector (`mobile`, `tablet`, `desktop` from user agent and viewport dimensions).
  - Error telemetry: `window.onerror` and `window.onunhandledrejection`.
  - Batching transport using `navigator.sendBeacon` with `fetch(..., { keepalive: true })` fallback.
- [ ] **Step 3: Run tracker tests**
  Verify all unit tests pass.

---

### Task 3: Database Schema & MySQL Migration System

**Files:**
- Create: `server/package.json`
- Create: `server/.env.example`
- Create: `server/src/config/db.js`
- Create: `server/src/db/migrations/001_initial_schema.sql`
- Create: `server/src/db/migrate.js`
- Create: `server/src/db/seed.js`

**Interfaces:**
- Produces: `getPool()` returning `mysql2/promise` connection pool.
- Produces: `runMigrations()` executing all `.sql` files idempotently.
- Produces: `seedDatabase()` populating realistic data across CCTV, NOC, Cybersecurity, VC, Data Center, and Networking.

- [ ] **Step 1: Create `server/package.json` with dependencies**
  Include `express`, `mysql2`, `socket.io`, `cors`, `dotenv`, `node-cron`, `@google/genai`, and dev dependencies (`jest`, `supertest`).
- [ ] **Step 2: Create `server/.env.example`**
  Define `PORT=5000`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `GEMINI_API_KEY`, `BITRIX_WEBHOOK_URL`.
- [ ] **Step 3: Implement `server/src/config/db.js`**
  Create connection pool with reconnection logic and health check query.
- [ ] **Step 4: Write `001_initial_schema.sql`**
  Implement DDL for `campaigns`, `ad_groups`, `ads`, `keywords`, `ad_metrics_daily`, `landing_pages`, `visitors`, `sessions`, `events`, `form_field_events`, `technical_health_logs`, `crm_leads`, `crm_deals`. Add all composite indexes.
- [ ] **Step 5: Implement `server/src/db/migrate.js`**
  Read migration files, track executed migrations in `_migrations` table, and execute pending SQL transactions.
- [ ] **Step 6: Implement `server/src/db/seed.js`**
  Generate 14 days of realistic multi-service data:
  - 12,000+ ad impressions & 1,400+ clicks across 6 campaigns.
  - 1,250 landing page sessions with realistic device split (65% Phone, 28% Laptop, 7% Tablet).
  - Granular scroll milestones, CTA clicks, form starts, field dwell times, and abandonments.
  - Bitrix24 leads with real qualification statuses (`RAW`, `CONTACTED`, `QUALIFIED`, `JUNK`) and deal pipeline stages.
  - Intentional anomalies to showcase diagnostics (e.g. CCTV mobile form validation error spike).

---

### Task 4: Ingestion Pipeline & Real-Time Socket.IO Telemetry

**Files:**
- Create: `server/src/services/ingestionService.js`
- Create: `server/src/routes/collectRoutes.js`
- Create: `server/src/sockets/socketManager.js`
- Create: `server/tests/ingestion.test.js`

**Interfaces:**
- Consumes: Batched payloads at `POST /api/v1/collect`.
- Produces: Inserts into `visitors`, `sessions`, `events`, `form_field_events`, `technical_health_logs`.
- Produces: Emits `live_event`, `visitor_ping`, and `active_count` events via Socket.IO.

- [ ] **Step 1: Write ingestion test in `server/tests/ingestion.test.js`**
  Assert that sending a payload creates a visitor, session, events, and form field entries in MySQL.
- [ ] **Step 2: Implement `ingestionService.js`**
  - Session reconciliation: match existing `session_id` or insert new record with `gclid`, UTMs, and device category.
  - IP-to-Geo approximation (e.g. Delhi NCR, Mumbai, Bengaluru, Hyderabad, Pune, Chennai).
  - Batch insert events into `events` table.
  - Insert field dwell time and abandonment events into `form_field_events`.
  - Log technical errors to `technical_health_logs`.
- [ ] **Step 3: Implement `socketManager.js`**
  Manage connected clients, track active sessions in an in-memory window (e.g. active within last 5 minutes), and broadcast real-time telemetry.
- [ ] **Step 4: Implement `collectRoutes.js`**
  Mount `POST /api/v1/collect` accepting both JSON and text/plain (from `sendBeacon`).

---

### Task 5: External Connectors (Google Ads & Bitrix24 CRM)

**Files:**
- Create: `server/src/integrations/googleAds.js`
- Create: `server/src/integrations/bitrix24.js`
- Create: `server/src/routes/crmRoutes.js`

**Interfaces:**
- Consumes: Bitrix24 webhook payloads at `POST /api/v1/crm/bitrix/webhook`.
- Produces: Stitches incoming Bitrix24 lead to original website session via `gclid` or `tracker_session_id`.
- Produces: Upserts daily Google Ads metrics into `ad_metrics_daily`.

- [ ] **Step 1: Implement `bitrix24.js`**
  Handle `ONCRMLEADADD`, `ONCRMLEADUPDATE`, `ONCRMDEALADD`, `ONCRMDEALUPDATE`.
  Extract `tracker_session_id` or `gclid` from custom fields, calculate `contact_latency_minutes`, and update `crm_leads` and `crm_deals`.
- [ ] **Step 2: Implement `googleAds.js`**
  Create sync worker that fetches campaign, ad group, keyword, spend, and click metrics. Include mock generator for instant testing without API quota limits.
- [ ] **Step 3: Mount routes in `crmRoutes.js`**
  Provide manual trigger `/api/v1/crm/sync` and webhook receiver `/api/v1/crm/bitrix/webhook`.

---

### Task 6: Conversion Diagnostics Engine ("Why Leads Aren't Coming")

**Files:**
- Create: `server/src/services/diagnosticEngine.js`
- Create: `server/tests/diagnostics.test.js`

**Interfaces:**
- Consumes: Aggregated funnel counts from MySQL.
- Produces: `diagnoseFunnel(dateRange, serviceSlug)` returning:
  `{ primary_bottleneck, confidence_score, evidence: { ads, landing_page, technical, lead_quality, sales_crm }, recommendations: [...] }`

- [ ] **Step 1: Write diagnostics test in `server/tests/diagnostics.test.js`**
  Test all 5 failure scenarios:
  1. Low CTR / High CPC / High Bounce -> Advertising issue.
  2. High drop-off at 25% scroll -> Content/Hero issue.
  3. High form starts but low submits + JS error spike -> Technical issue.
  4. High submissions but 70% Junk status -> Lead quality issue.
  5. High qualified leads but 4+ hours contact delay -> Sales SLA issue.
- [ ] **Step 2: Implement `diagnosticEngine.js`**
  Calculate step-by-step drop-offs across the 13 funnel stages. Run heuristic rules to rank and attribute the primary bottleneck with supporting metrics.

---

### Task 7: AI Marketing Analyst Service (Gemini Integration)

**Files:**
- Create: `server/src/services/aiAnalystService.js`
- Create: `server/src/routes/aiRoutes.js`

**Interfaces:**
- Consumes: Natural language query string from client (`POST /api/v1/ai/analyze`).
- Produces: Markdown response grounded in real MySQL funnel stats and diagnostic verdicts.

- [ ] **Step 1: Implement `aiAnalystService.js`**
  Gather current KPI summary, 13-stage funnel metrics, device breakdowns, and diagnostic flags. Inject them into system prompt and query Gemini model (`gemini-2.5-flash` or `gemini-1.5-flash`).
- [ ] **Step 2: Mount `aiRoutes.js`**
  Expose `POST /api/v1/ai/analyze` with error handling and fallback if API key is not configured.

---

### Task 8: Backend Server Entry Point & Dashboard API

**Files:**
- Create: `server/src/routes/dashboardRoutes.js`
- Create: `server/src/server.js`

**Interfaces:**
- Exposes:
  - `GET /api/v1/dashboard/overview` (Executive KPIs)
  - `GET /api/v1/dashboard/funnel` (13-stage conversion waterfall)
  - `GET /api/v1/dashboard/devices` (Phone, Tablet, Laptop matrix & scroll decay)
  - `GET /api/v1/dashboard/landing-pages` (Service page comparison)
  - `GET /api/v1/dashboard/forms` (Field dwell times & abandonment waterfall)
  - `GET /api/v1/dashboard/campaigns` (Google Ads metrics & ROAS)
  - `GET /api/v1/dashboard/geo` (City performance)
  - `GET /api/v1/dashboard/tech-health` (Core Web Vitals & error logs)
  - `GET /api/v1/dashboard/diagnostics` (Automated bottleneck attribution)
  - Serves: `GET /sdk/tracker.js` static bundle.

- [ ] **Step 1: Implement `dashboardRoutes.js`**
  Write SQL aggregation queries for all dashboard views with date filtering and service slug filtering.
- [ ] **Step 2: Implement `server.js`**
  Wire Express, CORS, Socket.IO, static SDK hosting, cron jobs, and graceful shutdown.

---

### Task 9: Frontend Setup & Custom Design System

**Files:**
- Create: `client/package.json`
- Create: `client/vite.config.js`
- Create: `client/tailwind.config.js`
- Create: `client/index.html`
- Create: `client/src/index.css`
- Create: `client/src/context/AnalyticsContext.jsx`
- Create: `client/src/services/api.js`

**Interfaces:**
- Produces: React SPA connected to Express API and Socket.IO server.
- Global Context: `selectedService`, `dateRange`, `liveVisitors`, `liveEvents`, `kpiData`, `isLoading`.

- [ ] **Step 1: Initialize client dependencies**
  Install `react`, `react-dom`, `lucide-react`, `recharts`, `socket.io-client`, `axios`, `clsx`, `tailwind-merge`.
- [ ] **Step 2: Configure Tailwind & Design Tokens in `client/tailwind.config.js` and `client/src/index.css`**
  Create executive dark/light themes, sleek card surfaces, custom scrollbars, and pulse glow indicators.
- [ ] **Step 3: Implement `client/src/context/AnalyticsContext.jsx`**
  Manage Socket.IO connection, real-time event subscriptions, and API fetch state.

---

### Task 10: Executive Overview, Live Telemetry & Conversion Funnel UI

**Files:**
- Create: `client/src/components/common/Header.jsx`
- Create: `client/src/components/common/ServiceSelector.jsx`
- Create: `client/src/components/common/MetricCard.jsx`
- Create: `client/src/components/dashboard/ExecutiveKpis.jsx`
- Create: `client/src/components/dashboard/LiveTelemetryBar.jsx`
- Create: `client/src/components/dashboard/ConversionFunnel13.jsx`

- [ ] **Step 1: Implement `Header.jsx` & `ServiceSelector.jsx`**
  Header with live status ping, date range dropdown, and service tabs (All, CCTV, NOC, Cyber, VC, Data Center, Networking).
- [ ] **Step 2: Implement `ExecutiveKpis.jsx`**
  Display Ad Spend, Clicks, Visitors, Leads, Qualified Leads, Opportunities, Won Revenue, CPL, CPQL, ROAS, and Sales Latency.
- [ ] **Step 3: Implement `LiveTelemetryBar.jsx`**
  Display active visitors counter, service page distribution, live device ratio (Phone/Tablet/Laptop), and scrolling live event ticker.
- [ ] **Step 4: Implement `ConversionFunnel13.jsx`**
  Interactive 13-stage waterfall showing count, stage conversion %, overall conversion %, and highlighted drop-off alert badges.

---

### Task 11: Diagnostics Center & Device Intelligence UI

**Files:**
- Create: `client/src/components/dashboard/DiagnosticRootCauseCard.jsx`
- Create: `client/src/components/dashboard/DeviceIntelligenceMatrix.jsx`

- [ ] **Step 1: Implement `DiagnosticRootCauseCard.jsx`**
  Visual attribution scorecard highlighting detected primary bottleneck and breakdown across the 5 domains (Ads, Landing Page, Tech, Lead Quality, Sales).
- [ ] **Step 2: Implement `DeviceIntelligenceMatrix.jsx`**
  Comparative matrix and chart for Phone vs. Tablet vs. Laptop (Visitors, Bounce Rate, Scroll Depth, Form Starts, Form Submissions, Lead Conversion %, Won Revenue).

---

### Task 12: Landing Page, Form Waterfall, Geo, Ads, CRM & Tech Health UI

**Files:**
- Create: `client/src/components/dashboard/LandingPageStudio.jsx`
- Create: `client/src/components/dashboard/FormFrictionWaterfall.jsx`
- Create: `client/src/components/dashboard/CampaignIntelligence.jsx`
- Create: `client/src/components/dashboard/GeoDistribution.jsx`
- Create: `client/src/components/dashboard/TechHealthRadar.jsx`
- Create: `client/src/components/dashboard/CrmSalesFunnel.jsx`
- Create: `client/src/components/dashboard/AiAnalystDrawer.jsx`
- Create: `client/src/App.jsx`

- [ ] **Step 1: Implement `LandingPageStudio.jsx` & `FormFrictionWaterfall.jsx`**
  Service comparative metrics, scroll depth decay curves (10% to 100%), and field dwell time/abandonment waterfall.
- [ ] **Step 2: Implement `CampaignIntelligence.jsx` & `GeoDistribution.jsx`**
  Google Ads campaign spend vs qualified revenue, search terms, and Indian city performance leaderboard (Delhi NCR, Mumbai, Bengaluru, etc.).
- [ ] **Step 3: Implement `TechHealthRadar.jsx` & `CrmSalesFunnel.jsx`**
  Core Web Vitals gauges, JS error table, Bitrix24 qualification speed SLA, and deal loss reasons.
- [ ] **Step 4: Implement `AiAnalystDrawer.jsx`**
  Slide-out conversational drawer with pre-configured prompts, metric-grounded responses, and streaming feedback.
- [ ] **Step 5: Assemble `App.jsx`**
  Unify all sections into a tabbed, responsive executive dashboard with active view controls.

---

### Task 13: Demo Landing Pages & End-to-End Testing

**Files:**
- Create: `landing-pages/cctv/index.html`
- Create: `landing-pages/cybersecurity/index.html`
- Create: `landing-pages/noc/index.html`
- Create: `server/tests/e2e.test.js`

- [ ] **Step 1: Create realistic demo landing pages**
  Implement responsive landing pages with hero section, service features, scroll depth sections, CTAs ("Get a Quote", "Book a Demo", WhatsApp), and quote request forms. Embed `tracker.js`.
- [ ] **Step 2: Write end-to-end simulation script**
  Simulate visitor journeys: landing on `/cctv`, scrolling to 75%, clicking CTA, filling form, and creating Bitrix24 lead. Verify real-time updates appear on the dashboard via Socket.IO.
- [ ] **Step 3: Run full verification suite**
  Verify backend tests, database migrations, seed data, and frontend build pass with zero errors.
