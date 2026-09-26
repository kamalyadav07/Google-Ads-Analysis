# Marketing & Landing Page Intelligence Platform

[![Repository](https://img.shields.io/badge/GitHub-Google--Ads--Analysis-blue)](https://github.com/kamalyadav07/Google-Ads-Analysis.git)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange)](https://www.mysql.com)
[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC)](https://tailwindcss.com)

A centralized, live marketing analytics, visitor behavior, and conversion attribution platform. Connects **Google Ads + Landing Pages + Visitor Behavior + Form Friction + Bitrix24 CRM** to help stakeholders pinpoint exactly where the conversion funnel breaks and provide concrete evidence for why leads aren't coming.

---

## 🎯 What This System Solves

Most teams look at Google Ads metrics separately and CRM leads separately. When leads decrease, teams often jump to assumptions: *"Google Ads isn't working"* or *"The website isn't converting."*

This platform provides **5-Pillar Attribution Evidence**:
1. **Advertising Problem**: Low CTR, poor search intent, high CPC, irrelevant search themes.
2. **Landing Page Experience Problem**: Poor above-the-fold messaging, weak CTA contrast, 10–25% scroll abandonment.
3. **Technical Problem**: JavaScript exceptions, broken validation scripts, form submission 500 errors, slow Core Web Vitals.
4. **Lead Quality Problem**: High raw submissions but low qualification rate, spam leads, or junk status.
5. **CRM / Sales Process Problem**: Delayed first-contact latency (SLA > 120 mins), poor follow-up, deal stall in proposal stage.

---

## 🏗️ Architecture

```
                  GOOGLE ADS
                      │
                      ▼
               Google Ads API / Sync
                      │
                      ▼
LANDING PAGES ──►  EXPRESS BACKEND  ◄──  BITRIX24 CRM
 (tracker.js)   (Ingestion & Sockets)     (Webhook Sync)
                      │
                      ▼
                 MYSQL DB
                      │
        ┌─────────────┴─────────────┐
        ▼                           ▼
  13-Stage Funnel            5-Pillar Diagnostics
  & Device Analytics         ("Why Leads Aren't Coming")
        │                           │
        └─────────────┬─────────────┘
                      ▼
               REACT DASHBOARD
        (Live Telemetry, Funnels & AI Analyst)
```

---

## 🚀 Quickstart

### Prerequisites
- Node.js 18+ & npm
- Running MySQL instance (local or remote)

### 1. Installation
```bash
# Clone the repository
git clone https://github.com/kamalyadav07/Google-Ads-Analysis.git
cd Google-Ads-Analysis

# Install all dependencies (root, server, and client)
npm run install:all
```

### 2. Environment Configuration
Copy `server/.env.example` to `server/.env` and update your MySQL credentials:
```env
PORT=5000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=marketing_intelligence
GEMINI_API_KEY=your_gemini_api_key_optional
```

### 3. Database Migration & Realistic Seed Data
```bash
# Run SQL schema migrations
npm run migrate

# Populate 14 days of realistic multi-service test data (CCTV, NOC, Cyber, VC, etc.)
npm run seed
```

### 4. Run Development Servers
```bash
npm run dev
```
- **Backend API & WebSockets:** `http://localhost:5000`
- **Frontend Dashboard:** `http://localhost:5173`
- **Tracking SDK Endpoint:** `http://localhost:5000/sdk/tracker.js`

---

## 📦 Monorepo Structure

* **`tracker/`**: Lightweight vanilla JavaScript SDK (`< 6 KB` gzipped). Emits scroll depths (10–100%), CTA clicks, form state machine events, device category (Phone/Tablet/Laptop), and JS errors via `navigator.sendBeacon`.
* **`server/`**: Express + MySQL + Socket.IO API server handling beacon ingestion, real-time broadcasts, Bitrix24 webhook receiver, Google Ads sync, and the 5-pillar diagnostic heuristics engine.
* **`client/`**: React 18 + Vite + Tailwind CSS executive command center with 13-stage interactive funnel, real-time visitor telemetry, device matrix, form friction waterfall, and conversational AI Analyst.
* **`landing-pages/`**: Ready-to-use service landing pages (`/cctv`, `/noc`, `/cybersecurity`) pre-wired with `tracker.js`.
