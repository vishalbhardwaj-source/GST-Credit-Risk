# GST Credit-at-Risk Forecaster (Hackathon MVP)

An explainable decision-support dashboard for Indian businesses and Chartered Accountants to triage invoices that appear in the purchase register but are missing from GSTR-2B reconciliation.

> **Legal & Trust Notice:**  
> *Synthetic demo data. Triage support only—not tax or legal advice. Does not access government systems, determine statutory ITC eligibility, or replace professional tax review.*

---

## 1. Quick Start

### Prerequisites
- Node.js LTS (v18+)

### Installation & Run

```bash
cd vite-app
npm install
npm run dev
```

The application will run locally at `http://localhost:5173`.

### Running Automated Test Suite

```bash
cd vite-app
npx vitest run
```

All 11 tests covering scoring rules, clamping, fuzzy matching, cross-vendor isolation, and benchmark dataset metrics pass.

---

## 2. Product Architecture & 3-Signal Decision Engine

Instead of presenting an undifferentiated list of 30 missing invoices, the engine evaluates each discrepancy across three deterministic, transparent pipelines:

```
Purchase Register (200 Invoices) vs GSTR-2B (170 Records)
                     │
                     ▼
       30 Unmatched Invoices Discrepancies
                     │
     ┌───────────────┼───────────────┐
     ▼               ▼               ▼
[Pipeline 1]    [Pipeline 2]    [Pipeline 3]
IRN Footprint   AP Commercial   Filing History
(IRP Registry)    Leverage      (Track Record)
(+20 / -15)     (+15/+5/-10)    (+15/0/-25)
     └───────────────┬───────────────┘
                     ▼
          Deterministic Score (0 - 100)
                     │
      ┌──────────────┼──────────────┐
      ▼              ▼              ▼
75–100 Score   40–74 Score     0–39 Score
SAFE TO HOLD      WATCH        CHASE NOW
(25 Invoices)   (4 Invoices)   (1 Invoice)
```

### Signal Weights:
- **Base Score:** 50
- **Pipeline 1 (IRN Footprint):**
  - IRN Present: `+20` (Proof of e-invoice registration on IRP)
  - IRN Absent: `-15`
- **Pipeline 2 (Accounts Payable Leverage):**
  - High Leverage ($\ge 1.0$): `+15` (Buyer holds sufficient unpaid AP/retention to protect cash flow)
  - Medium Leverage ($0 < \text{ratio} < 1.0$): `+5`
  - Low / Paid Leverage ($= 0$): `-10` (No payment leverage)
- **Pipeline 3 (Vendor Filing Track):**
  - Habitual Laggard: `+15` (Predictable filing delay, routinely reports late but files)
  - Normal / Punctual: `0`
  - New Anomaly: `-25` (Sudden missed cycle or unprecedented delay)
- **Score Clamping:** $0 \le \text{Score} \le 100$.

---

## 3. TinyFish Web Agent Integration

TinyFish is an AI web exploration and content extraction agent used in this project to query official GST/CBIC government portals and retrieve real-time statutory context—such as e-invoicing thresholds, taxpayer enablement, and return deadlines—bridging the gap between static invoice data and dynamic regulatory reality.

### The 4 TinyFish Workflows

| Workflow ID | Name | Endpoint | What it does | How it affects the score |
|---|---|---|---|---|
| **WF1** | Deadline Extension Status | `GET /api/tinyfish/workflow-1/deadline-extension` | Fetches current Section 16(4) ITC cutoff dates from CBIC notifications (e.g., Nov 30 deadline under Notif. No. 12/2024). | Global header status badge; establishes statutory urgency without direct score mutation. |
| **WF2** | Vendor Registry Check | `GET /api/tinyfish/workflow-2/vendor-status` | Searches `services.gst.gov.in` for taxpayer active/cancelled status, legal entity name, and return filing cadence. | Qualitative audit evidence; confirms vendor existence before escalation. |
| **WF3** | IRN Applicability Checker | `GET /api/tinyfish/workflow-3/irn-applicability` | Evaluates CBIC Notification No. 10/2023 r/w Rule 48(4) against supplier turnover band (< ₹5 Cr vs > ₹5 Cr) and transaction type. | Upgrades absent IRN from default penalty (`-15`) to neutral (`0`) when supplier is sub-threshold or ambiguous. |
| **WF4** | Vendor-Specific IRN Portal Lookup | `GET /api/tinyfish/workflow-4/vendor-lookup` | Directly queries `einvoice1.gst.gov.in` to verify whether the vendor's specific GSTIN is enabled on the IRP. Supports simulated portal block/timeout. | Feeds the 4-state IRN engine: `Present` (+20), `Absent, applies` (-15), `Absent, not applicable` (0), or `Absent, unknown` (0). |

### Offline Resilience

Network calls to public tax portals can encounter HTTP 429 rate limits, captchas, or downtime during high-volume tax filing periods. To guarantee that presentations and hackathon demos never fail:
- All 4 workflows implement **deterministic client- and backend fallbacks** that are structurally identical to live responses.
- Responses are cached locally in SQLite (`tinyfish_cache.db`) with a **24-hour TTL** and transparent `CACHE_HIT` / `LIVE_FETCH` indicators.
- When simulated failure is enabled or portal scraping fails, the system executes a **Zero-Penalty Defense**: status defaults to `Absent, unknown` with **0 penalty points**, ensuring an unverified check never converts into an unwarranted false alarm.

### How TinyFish Mutates the Score

TinyFish results feed directly into the deterministic 3-signal routing pipeline without relying on non-deterministic LLM score assignments:

```
[Invoice Selected with Absent IRN]
                 │
                 ▼
[TinyFish WF3 (Rule Check) or WF4 (Portal Query)]
                 │
                 ▼
          irn_state (Enum)
    ┌────────────┼───────────────────────────┐
    ▼            ▼                           ▼
 PRESENT    ABSENT_APPLIES    ABSENT_NOT_APPLICABLE / ABSENT_UNKNOWN
 (+20 pts)    (-15 pts)                     (0 pts)
    │            │                           │
    └────────────┼───────────────────────────┘
                 ▼
     calculateRoutingScore()
 (Base 50 + IRN Adj + AP Adj + Filing Adj)
                 │
                 ▼
    Final Clamped Score (0 - 100)
    ┌────────────┼────────────┐
    ▼            ▼            ▼
 ≥ 75 pts     40–74 pts    < 40 pts
SAFE TO HOLD    WATCH      CHASE NOW
```

---

## 4. Demo Script (7 Minutes)

| Time | Demo Beat | Action in App | What the Judge Learns |
|---|---|---|---|
| **0:00–0:40** | **The Problem** | Open dashboard in initial raw state. | 200 purchase invoices, 170 matched in GSTR-2B, 30 discrepancies. A flat list gives no triage priority. |
| **0:40–1:30** | **Run Routing** | Click **"Run Pipeline Routing"**. | 30 discrepancies route instantly to **25 Safe to Hold**, **4 Watch**, **1 Chase Now**. Tax at risk tallied in real time. |
| **1:30–2:20** | **Inspect Safe to Hold** | Click `SGP/26-27/0412` (Score: 100). | IRN verified (+20), ₹18,400 AP leverage (+15), habitual laggard (+15). Recommendation: no vendor harassment — credit appears naturally. |
| **2:20–3:10** | **Inspect Chase Now** | Filter → `Chase Now`, click `PCS/26-27/5561` (Score: 0). | Missing IRN (−15), ₹0 leverage (−10), sudden anomaly (−25). Tax at risk: ₹2,400. Immediate escalation required. |
| **3:10–4:15** | **TinyFish IRN Rule Checker** | Open any Watch invoice → expand Pipeline 1 → click **"Check current IRN rules"**. | TinyFish fetches live CBIC / GSTN sources, returns `LIKELY_NOT_APPLICABLE` or `APPLICABILITY_UNCLEAR`, adjusts IRN signal from −15 to 0. Shows source link + checked-at timestamp. |
| **4:15–5:20** | **TinyFish Vendor Portal Lookup** | In same drawer → click **"Lookup Vendor on IRP Portal"**. | WF4 queries `einvoice1.gst.gov.in`. 4-state badge appears: `Present / Absent, applies / Absent, not applicable / Absent, unknown`. Badge in Pipeline 1 header updates live. Score recalculates. |
| **5:20–5:50** | **Failure-State Defense** | Tick **"Simulate portal captcha / timeout"** → click Lookup again. | Result: `PORTAL BLOCK` badge, state = `Absent, unknown`, score adj = 0. App **never** fails silently into red. |
| **5:50–6:30** | **Fuzzy Matching & Search** | Type a vendor name with punctuation noise in the search box. | Robust normalisation, cross-vendor false-positive prevention demonstrated. |
| **6:30–7:00** | **Audit Export & Reset** | Click **"Export CSV"**, then **"Reset Demo"**. | Clean CSV audit trail; state resets deterministically to the fixture 25/4/1 counts. |

---

## 5. Test Verification Summary

Run `npx vitest run` inside `vite-app` to verify all **18 unit tests** (11 original + 7 new 4-state IRN tests):

**Scoring & Routing (5 tests)**
- `✓ Safe to Hold (IRN Present + High AP + Habitual Laggard) = 100`
- `✓ Watch: IRN Absent + High AP + Habitual Laggard = 65`
- `✓ Watch: IRN Present + Medium AP + New Anomaly = 50`
- `✓ Chase Now: IRN Absent + Low AP + New Anomaly = 0`
- `✓ Score clamping to 0–100 range`

**Reconciliation & Fuzzy Matching (3 tests)**
- `✓ Normalizes punctuation, case, and slashes`
- `✓ Matches noisy but valid records with confidence ≥ 90`
- `✓ Prevents cross-vendor false matches`

**Synthetic Dataset Benchmark (3 tests)**
- `✓ Exactly 200 purchase-register invoices`
- `✓ Exactly 170 matching GSTR-2B records and 30 unmatched invoices`
- `✓ Routes to exactly 25 Safe to Hold, 4 Watch, and 1 Chase Now`

**4-State IRN Scoring Engine (7 tests)**
- `✓ ABSENT_UNKNOWN → zero IRN penalty; raw score 15 (not 0)`
- `✓ ABSENT_NOT_APPLICABLE → zero IRN penalty; raw score 15`
- `✓ ABSENT_APPLIES → −15 pts; score 0 (CHASE NOW)`
- `✓ PRESENT via explicitIrnState → +20 pts; score 100 (SAFE TO HOLD)`
- `✓ ABSENT_UNKNOWN scores higher than unassessed absent (15 vs 0)`
- `✓ ABSENT_UNKNOWN with HIGH AP + HABITUAL LAGGARD lifts to SAFE TO HOLD (80) vs WATCH (65)`
- `✓ Fixture 25/4/1 counts invariant when no live lookup provided (fixture separation lock)`

---

## 6. Revenue Model

### Freemium Hook

**Free tier unlocks the product for small CA practices immediately** — no credit card required. The paywall triggers only at scale, where the tool saves hours of manual reconciliation work each month.

| Tier | Price / Month | Invoices / Month | Features |
|---|---|---|---|
| **Free** | ₹0 | Up to 50 | 3-signal triage, manual CSV upload, basic routing |
| **Pro** | ₹2,499 | Unlimited | Unlimited invoices, bulk CSV export, TinyFish live IRN + vendor verification, 4-state IRN model, priority support |
| **Enterprise** | ₹12,999+ | Unlimited + multi-entity | Multi-GSTIN workspace, ERP API integration (Tally, SAP), SLA, dedicated onboarding, custom retention rules |

*All prices in INR, billed monthly. Annual plans receive a 20% discount.*

### Total Addressable Market (TAM)

India has approximately **50,000 registered CA firms** (ICAI, 2024) and **8 million GST-registered businesses** filing GSTR-3B monthly. Even targeting the 10% of GST filers that regularly face reconciliation discrepancies yields a serviceable market of ~800,000 businesses. At an average Pro subscription of ₹2,499/month, the India-alone revenue opportunity exceeds **₹24 billion annually** — before accounting for the broader SME accounting software market estimated at USD 1.2 billion by 2027.

### Competitive Positioning

**ClearTax** targets large enterprises with per-seat licensing that frequently exceeds ₹5 lakh/year, placing it out of reach for mid-market CAs and SMEs. **Tally** dominates bookkeeping but provides no AI-driven triage or GSTR-2B reconciliation intelligence — it surfaces the mismatch list but leaves the "what to do next" decision entirely to the accountant. **Vyapar** serves micro-SMBs with basic GST filing but has no reconciliation engine, no IRN-state awareness, and no AP-leverage scoring. This product occupies the gap between Tally's passive reporting and ClearTax's expensive enterprise suite: an **explainable, action-first reconciliation layer** that tells a CA which of the 30 missing invoices to chase today, which to hold, and why — at a price accessible to independent practitioners and mid-size finance teams.

---

> **Legal & Trust Notice:**
> *Synthetic demo data. Triage support only — not tax or legal advice. Does not access government systems, determine statutory ITC eligibility, or replace professional tax review. TAM figures are estimates based on publicly available ICAI and GST Council data.*
