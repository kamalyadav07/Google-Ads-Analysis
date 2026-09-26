const diagnosticEngine = require('./diagnosticEngine');

class AiAnalystService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
  }

  async analyzeQuery(userQuery, options = {}) {
    // 1. Fetch current ground-truth metrics and diagnostic state
    const diag = await diagnosticEngine.runDiagnosis(options);

    const contextData = {
      userQuery,
      serviceFilter: options.serviceSlug || 'all',
      dateRange: options.dateRange || 'Last 14 Days',
      primaryBottleneck: diag.primaryLabel,
      severityScore: `${diag.severityScore}/100`,
      verdictTitle: diag.verdictTitle,
      verdictDescription: diag.verdictDescription,
      evidence: diag.evidence,
      domainScores: diag.domainScores,
      recommendations: diag.recommendations
    };

    // 2. If Gemini API Key is available, call the Gemini model
    if (this.apiKey) {
      try {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(this.apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
You are the Chief Marketing & Conversion Intelligence Analyst for an enterprise IT infrastructure company.
Analyze the user's question using ONLY the provided verified metrics and diagnostic findings below.

VERIFIED SYSTEM TELEMETRY & ATTRIBUTION DATA:
${JSON.stringify(contextData, null, 2)}

USER QUESTION:
"${userQuery}"

Provide a crisp, executive-grade analysis formatted in Markdown.
Structure your response as follows:
### 1. Executive Diagnosis & Root Cause
State clearly which part of the funnel is failing (Advertising vs Landing Page vs Technical vs Lead Quality vs CRM/Sales) and why.

### 2. Concrete Evidence
Cite the exact metrics (e.g. scroll drop %, bounce rate %, contact latency in minutes, top friction field) that prove this verdict.

### 3. High-Priority Action Items
List 3 concrete, immediate steps for the marketing or engineering teams to fix this issue.
`;

        const response = await model.generateContent(prompt);

        return {
          response: response.response.text(),
          context: contextData,
          engine: 'gemini-1.5-flash'
        };
      } catch (err) {
        console.warn('[AI Analyst Warning] Gemini call failed, falling back to rule-based analysis:', err.message);
      }
    }

    // 3. Fallback: Rule-grounded deterministic analysis
    return {
      response: this.generateRuleBasedAnalysis(userQuery, contextData),
      context: contextData,
      engine: 'deterministic-heuristic-engine'
    };
  }

  generateRuleBasedAnalysis(query, ctx) {
    const ev = ctx.evidence;
    return `### Executive Diagnosis: ${ctx.primaryBottleneck}
**Verdict:** ${ctx.verdictTitle}  
${ctx.verdictDescription}

---

### Concrete Evidence Grounding:
* **Pre-Click Advertising:** Total Spend: ₹${Number(ev.adSpend).toLocaleString()}, Clicks: ${Number(ev.adClicks).toLocaleString()} (CTR: ${(ev.ctr * 100).toFixed(2)}%).
* **Landing Page Behavior:** Bounce Rate: **${ev.bounceRate}%**, 25% Scroll Abandonment: **${ev.scroll25DropPct}%**, CTA Click Rate: **${ev.ctaRate}%**.
* **Form State Machine:** Form Start-to-Submit Drop: **${ev.formStartToSubmitDrop}%** (Top friction on input: \`${ev.topFrictionField || 'requirement'}\`).
* **Technical Health:** Client JS Exceptions: **${ev.totalJsErrors}**, Average LCP: **${ev.avgLcpMs}ms**.
* **CRM Downstream Outcome:** Form Submissions: **${ev.totalLeads}**, Qualification Rate: **${ev.qualificationRate}%**, First Contact SLA: **${ev.avgContactLatencyMin} mins**.

---

### Recommended Action Plan:
${ctx.recommendations.map((rec, i) => `${i + 1}. **Action ${i + 1}:** ${rec}`).join('\n')}
`;
  }
}

module.exports = new AiAnalystService();
