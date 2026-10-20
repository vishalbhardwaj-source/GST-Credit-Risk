# Social Media Post — GST Credit-at-Risk Forecaster
## Ready-to-publish draft (Twitter/X + LinkedIn)

---

## Twitter/X Version (≤280 characters per tweet — use as a thread)

**Tweet 1 (hook):**
```
30 missing invoices. 5 seconds. 3 buckets. 🧾

We built an AI triage engine for Indian CAs — so they stop harassing vendors who just file late, and start chasing the ones who actually won't.
```

**Tweet 2 (how it works):**
```
Every GSTR-2B mismatch gets scored on 3 signals:

🔵 IRN Footprint — did the vendor register on the e-invoice portal?
🟣 AP Leverage — do you still owe them money?
🟠 Filing History — late every month, or suddenly gone silent?

Score → Chase Now / Watch / Safe to Hold
```

**Tweet 3 (TinyFish):**
```
Powered by @TinyFishAI web agents that hit live govt portals in real-time:

→ CBIC deadline tracker (Section 16(4) cutoff)
→ GST taxpayer registry check
→ IRN applicability (₹5 Cr threshold rule)
→ IRP vendor portal lookup

With a Zero-Penalty Defense if the portal times out 🛡️
```

**Tweet 4 (tech stack):**
```
Under the hood:
• React 19 + Vite + TypeScript
• FastAPI + Python backend
• LightGBM (0.986 AUC) trained on 1,200 GST cohorts
• 18/18 unit tests ✅
• 4-state IRN model grounded in CBIC Notification 10/2023

[link to repo]
```

---

## LinkedIn Version (longer form — copy and paste directly)

```
🧾 We built a GST reconciliation triage engine for Indian Chartered Accountants — and I want to show you why it's different.

THE PROBLEM
Every month, finance teams reconcile their Purchase Register against GSTR-2B (India's government auto-populated tax credit statement). When invoices are missing, the typical reaction is either:
(a) Chase all 30 vendors aggressively and damage supplier relationships, or
(b) Wait until November 30 and discover you have zero leverage with the ones who actually defaulted.

Both approaches are expensive. There's a smarter way.

THE SOLUTION: GST Credit-at-Risk Forecaster
Instead of a flat list of 30 missing invoices, our 3-signal engine instantly routes each discrepancy into three buckets:

🟢 Safe to Hold (25 invoices) — IRN verified, you hold unpaid AP, vendor files late every quarter. Don't harass them. The credit will appear.

🟡 Watch (4 invoices) — Mixed signals. Hold payment and verify IRN before the filing deadline.

🔴 Chase Now (1 invoice) — Missing IRN, zero payment leverage, sudden break in 6-month filing history. Escalate immediately.

HOW IT WORKS
Three deterministic signals feed a scoring engine (0–100):
• Pipeline 1 (IRN Footprint): TinyFish queries einvoice1.gst.gov.in — 4 states: Present (+20), Absent-Applies (-15), Absent-Exempt (0), Unknown-0
• Pipeline 2 (AP Leverage): Unpaid invoices + retention held ÷ invoice value → HIGH/MEDIUM/LOW tier
• Pipeline 3 (Filing History): 6-month periodicity analysis — Habitual Laggard vs New Anomaly

POWERED BY TINYFISH AI
4 live web agent workflows hit official government portals:
→ CBIC for Section 16(4) statutory deadline status
→ GST portal for taxpayer registry verification
→ IRP for IRN applicability (₹5 Cr threshold under CBIC Notification 10/2023)
→ einvoice1.gst.gov.in for vendor-specific portal lookup

With a built-in Zero-Penalty Defense: if a portal times out or blocks the request, we default to "Unknown" (zero penalty) instead of silently punishing an unverified vendor.

THE STACK
• Frontend: React 19 + Vite + TypeScript
• Backend: FastAPI + Python + RapidFuzz + LightGBM (0.986 AUC, trained on 1,200-row cohort)
• 18/18 unit tests across 4 test suites
• Full offline fallbacks — the demo never breaks

This solves a real problem for ~50,000 CA firms and 8 million GST-registered businesses in India.

[GitHub link] | Live demo: [Vercel URL]

#GST #IndiaFintech #CharteredAccountant #TinyFishAI #Hackathon #OpenSource
```

---

## Quick tips for maximum engagement

1. **Record a 15-second GIF/video** of the routing animation (Run Pipeline → 25/4/1 split appearing) and attach it to the first tweet or LinkedIn post. Visual = 3–4x more reach.

2. **Tag @TinyFishAI** — they may retweet, which gets you visibility with the hackathon judges.

3. **Post timing:** 9–10 AM IST on a weekday. GST/CA Twitter is most active Tuesday–Thursday mornings.

4. **LinkedIn tip:** The first 2 lines of your LinkedIn post are shown before "See more". Make them count — the hook about "30 invoices → 3 buckets → 5 seconds" is already written for this.
