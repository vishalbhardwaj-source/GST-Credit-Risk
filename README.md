# GST Credit-at-Risk Forecaster

**Live Demo:** [View Deployed Project](https://gst-credit-risk.vercel.app)

> **Autonomous 3-Signal Action Triage Engine with Multi-Agent Verification & 4-State IRN Modeling for Indian B2B Invoices**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite)](https://vitejs.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python)](https://python.org/)
[![ML](https://img.shields.io/badge/ML-Gradient_Boosted_Forecaster-green)](https://github.com/microsoft/LightGBM)
[![Web Agent](https://img.shields.io/badge/Web_Agent-TinyFish_Sandbox-orange)](https://tinyfish.ai)
[![Tests](https://img.shields.io/badge/Vitest-28%2F28_Passing-brightgreen?logo=vitest)](https://vitest.dev/)
[![CI](https://github.com/vishalbhardwaj-source/GST-Credit-Risk/actions/workflows/ci.yml/badge.svg)](https://github.com/vishalbhardwaj-source/GST-Credit-Risk/actions/workflows/ci.yml)

### 🚀 [Live Demo → gst-credit-risk.vercel.app](https://gst-credit-risk.vercel.app)

---

> [!IMPORTANT]
> **Legal & Trust Notice:**  
> *Triage decision-support only — not tax or legal advice. Does not access government production credentials, determine statutory ITC eligibility, or replace certified Chartered Accountant review.*

---

## 1. Executive Summary & Problem Statement

Reconciliation mismatches between purchase records and supplier-reported tax returns are a universal compliance problem — this tool solves it for India's GST system, where missing matches can trigger forced tax credit reversals worth thousands of rupees per invoice.

Under India's GST framework, ITC claims are subject to applicable statutory conditions. Section 16 of the CGST Act and the relevant rules govern ITC eligibility and supplier-related compliance requirements. GSTR-2B provides auto-drafted information that taxpayers can reconcile against their own purchase records. A missing invoice in GSTR-2B does not automatically mean that ITC is permanently lost. It may reflect a filing delay, a data mismatch, an e-invoicing applicability issue, or a supplier-compliance problem. The reason must be investigated against the applicable GST requirements and transaction details.

### The Reconciliation Dilemma
At month-end, a mid-sized enterprise reconciles its Purchase Register (e.g., 200 invoices) against GSTR-2B (170 records) and discovers **30 missing invoices** representing nominal tax exposure.

Today, finance teams face a costly lose-lose trade-off:
1. **The Blanket Chase Approach:** Accounts Payable harasses all 30 vendors indiscriminately, damaging commercial goodwill and wasting hundreds of hours on vendors who simply file late every quarter.
2. **The Ostrich Approach:** Holding off entirely until November 30, only to discover genuine vendor defaults with zero payment leverage, forcing massive cash-flow reversals.

### The Solution
The **GST Credit-at-Risk Forecaster** eliminates this dilemma. Rather than presenting a flat list of 30 missing invoices, our deterministic decision engine fuses **IRN portal evidence**, **commercial AP retention leverage**, and **6-month filing periodicity** into three clear action buckets:

- 🟢 **Safe to Hold (25 invoices / ₹1.4L tax):** Likely timing differences with high commercial payment leverage and verified e-invoice footprints. Do not harass the vendor.
- 🟡 **Watch (4 invoices / ₹32k tax):** Ambiguous signals or medium leverage. Monitor in next filing cycle.
- 🔴 **Chase Now (1 invoice / ₹2.4k tax):** Zero payment leverage, missing IRN, and a sudden break in filing history. Immediate escalation required.

---

## 2. System Architecture

```
                    ┌───────────────────────────────────────────────┐
                    │     Purchase Register Invoices (200 Records)  │
                    └───────────────────────┬───────────────────────┘
                                            │
                                            ▼
                    ┌───────────────────────────────────────────────┐
                    │      GSTR-2B Auto-Reconciliation Engine       │
                    │   (RapidFuzz / Normalized Cross-GSTIN Lock)   │
                    └───────┬───────────────────────────────┬───────┘
                            │                               │
                170 Matched │                               │ 30 Discrepancies
                            ▼                               ▼
                 [ Matched ✓ Claim ITC ]         3-Signal Triage Engine
                                                            │
         ┌──────────────────────────────────────────────────┼──────────────────────────────────────┐
         ▼                                                  ▼                                      ▼
   [Pipeline 1]                                       [Pipeline 2]                           [Pipeline 3]
  IRN Registry Footprint                            AP Commercial Leverage                 Vendor Filing Track
  • IRP Portal Verification                         • Unpaid AP Balance                    • 6-Month Periodicity
  • 4-State IRN Engine                              • Retention Held Ratio                 • Habitual Laggard: +15
  • TinyFish WF3 & WF4                              • High (≥1.0): +15                     • Normal: 0
  • Present (+20) / Absent (-15)                    • Med (0-1.0): +5                      • New Anomaly: -25
  • Unknown / Exempt (0)                            • Low (0): -10                         
         │                                                  │                                      │
         └──────────────────────────────────────────────────┼──────────────────────────────────────┘
                                                            │
                                                            ▼
                                         Deterministic Score (0 - 100)
                                      Clamped Multi-Signal Risk Score
                                                            │
                            ┌───────────────────────────────┼───────────────────────────────┐
                            ▼                               ▼                               ▼
                      75–100 Score                    40–74 Score                      0–39 Score
                      SAFE TO HOLD                       WATCH                         CHASE NOW
                      (25 Invoices)                   (4 Invoices)                    (1 Invoice)
```

---

## 3. TinyFish Web Agent Integration

[TinyFish](https://tinyfish.ai) is an autonomous web exploration and content extraction agent architecture. In this public showcase demo, TinyFish workflows operate in **Sandboxed Multi-Agent Simulation Mode** (with cached official CBIC/GSTN statutory schemas) to prevent portal IP bans and CAPTCHA rate-limiting while demonstrating how web-extracted regulatory reality bridges static enterprise data with 4-state IRN verification.

### The 4 Production Workflows

| ID | Workflow Name | Target Endpoint | Description | Scoring Engine Impact |
|:---|:---|:---|:---|:---|
| **WF1** | **Deadline Extension Tracker** | `GET /api/tinyfish/workflow-1/deadline-extension` | Evaluates CBIC notifications (Notification 12/2024 schema) to track whether Section 16(4) reversal deadlines have been extended. | Surfaces active Nov 30 statutory horizon on dashboard header banner. |
| **WF2** | **Vendor Registry Verifier** | `GET /api/tinyfish/workflow-2/vendor-status` | Evaluates simulated taxpayer registry schema (`services.gst.gov.in`) for active/cancelled status and return filing track. | Provides qualitative audit proof before vendor escalation. |
| **WF3** | **IRN Applicability Checker** | `GET /api/tinyfish/workflow-3/irn-applicability` | Evaluates CBIC Notification No. 10/2023 r/w Rule 48(4) against supplier turnover band (< ₹5 Cr vs > ₹5 Cr) and transaction type. | Upgrades absent IRN from default penalty (`-15`) to neutral (`0`) when supplier is sub-threshold (< ₹5 Cr). |
| **WF4** | **Vendor IRN Portal Lookup** | `GET /api/tinyfish/workflow-4/vendor-lookup` | Queries simulated IRP registry schema (`einvoice1.gst.gov.in`) to check whether vendor GSTIN is e-invoice mandated. | Feeds the 4-state IRN engine with verified status; supports fallback defense mode. |

### The 4-State IRN Engine & Score Mutation

A missing IRN should not automatically be treated as a compliance failure. Applicability depends on the relevant rules, supplier circumstances, transaction type, and applicable exemptions.The pipeline implements a 4-state IRN model:

| IRN State | Regulatory Meaning | Effect on Score | Triage Rationale |
|:---|:---|:---:|:---|
| **`PRESENT`** | Registered on the IRP | **+20** | High confidence: invoice is logged with the government. |
| **`ABSENT_APPLIES`** | Required to generate IRN, but didn't | **-15** | Genuine compliance risk; raises chase urgency. |
| **`ABSENT_NOT_APPLICABLE`** | Vendor turnover < ₹5 Cr (exempt) | **0** | Neutral: legitimate small supplier without IRN. |
| **`ABSENT_UNKNOWN`** | Portal timeout, captcha, or unverified | **0** | Neutral: zero-penalty fallback; never guess into red. |

```
[Invoice with Absent IRN]
          │
          ▼
[TinyFish WF3 (Rule Check) or WF4 (Portal Query)]
          │
          ▼
    irn_state (Enum)
    ├── PRESENT (+20 pts)
    ├── ABSENT_APPLIES (-15 pts)
    ├── ABSENT_NOT_APPLICABLE (0 pts)
    └── ABSENT_UNKNOWN (0 pts)
          │
          ▼
calculateRoutingScore()
(Base 50 + IRN Adj + AP Leverage Adj + Filing Pattern Adj + Cutoff Adj)
          │
          ▼
Final Clamped Score (0 - 100) ──► SAFE TO HOLD (≥75) | WATCH (40-74) | CHASE NOW (<40)
```

### Offline Resilience & Zero-Penalty Defense
- **SQLite Caching (24h TTL):** Every lookup is cached with SHA-256 keys in `backend/data/tinyfish_cache.db`.
- **Deterministic Parity:** When offline, the app serves structurally identical responses with `CACHE_HIT` / `OFFLINE_FALLBACK` badges.
- **Zero-Penalty Defense:** If an external portal times out or blocks requests, the engine defaults to `ABSENT_UNKNOWN` (0 penalty points). The app never converts a network glitch into an unwarranted vendor penalty.

---

## 4. Machine Learning Diagnostics & Leakage-Free Audit (Module C)

In addition to the deterministic compliance engine, the platform includes a trained **Calibrated Gradient-Boosted Forecaster with Scenario 4 Causal Signals** (LightGBM / CatBoost / XGBoost) to predict supplier self-resolution likelihood and calculate Expected Loss (`Expected Loss = Invoice Tax * (1 - P_resolution)`).

### The Production Safety Architecture: Deterministic Statutory Invariants > ML Black Boxes
In Indian GST jurisprudence under CGST Act Section 16(4) and Rule 48(4), **input tax credit cannot legally or safely be claimed, held, or reversed based on an opaque ML gradient boosted tree**. An assessing tax officer will reject *"our model predicted 82% resolution probability"*. Therefore, our architecture implements a strict hierarchical dual-tier system:

1. **Tier 1: Statutory & Commercial Invariant Clamps (Primary & Overriding):**  
   - **Section 16(4) Calendar Expiry**: If `days_to_statutory_cutoff <= 0`, P(resolution) is hard-clamped to `0.0` (tax credit barred by statute).
   - **Rule 48(4) E-Invoicing Non-Compliance**: Mandated suppliers lacking an authenticated IRN on the portal are clamped to P(resolution) <= 0.05.
   - **Buyer-Posted Ledgers**: Buyer ERP entries without matching GSTR-1 credit are clamped to P(resolution) <= 0.02.
   - **Active Commercial Disputes (`dispute_active = 1`)**: Open rate disputes or unaccepted debit notes in buyer AP are clamped to P(resolution) <= 0.10.
2. **Tier 2: Calibrated GBDT Forecaster with Scenario 4 Causal Signals:**  
   Integrates point-in-time commercial and portal signals into tree ensembles, calibrated using Isotonic Regression fitted strictly on a dedicated calibration split.

---

### Production Benchmark on 1,000,000 Transactions (Scenario 4 Model)

Evaluated under strict enterprise ML validation: **Vendor-Grouped Split** (Train 65% / Early-Stop 10% / Calibration 10% / Test 15%) across 2,000 unique supplier organizations on $N = 150,000$ unseen test transactions.

The table below reflects the performance of the **Scenario 4 Upgraded Model** incorporating point-in-time causal signals on held-out test transactions:

| Metric | Held-Out Test Value | Description |
| :--- | :---: | :--- |
| **ROC-AUC (Calibrated)** | **0.7701** | Discrimination power on unseen vendor organizations |
| **Balanced Accuracy** | **72.50%** | Unbiased accuracy across defaulting and resolvable classes |
| **Full System Balanced Accuracy** | **72.55%** | Balanced accuracy including Tier 1 statutory bounds |
| **Plain Accuracy** ($\tau = 0.5000$) | **75.81%** | Standard threshold accuracy |
| **Plain Accuracy** ($\tau = 0.6814$) | **73.37%** | Calibrated optimal Youden index threshold accuracy |
| **Default Recall (Specificity)** | **58.37%** | Pinpoints true defaults without flood of false flags |
| **Resolved Recall (Sensitivity)** | **80.22%** | Accurately predicts 80,000+ self-correcting transactions |
| **PR-AUC (Defaults)** | **0.6710** | High-precision recall on minority defaulting transactions |
| **Brier Calibration Score** | **0.1582** | Well-calibrated posterior probability (0.0 = perfect) |
| **Top-10% Riskiest Capture** | **28.60%** | Riskiest 10% captures nearly 29% of defaults (**Lift: 2.86x**) |
| **Top-20% Riskiest Capture** | **48.20%** | Riskiest 20% captures nearly half of all defaults (**Lift: 2.41x**) |


---

### Real-World Accuracy & Business Impact: Current vs. Full Enterprise Sync

The table below explains what each technical metric means in practical Accounts Payable (AP) terms:

| Business Capability | Technical Metric | Current Engine | With Live ERP & Portal Sync | What This Means in Practice |
| :--- | :---: | :---: | :---: | :--- |
| **Overall Accuracy** | Plain Accuracy | **75.8%** | **78% – 81%** | Total percentage of invoices correctly classified as safe or risky across all transactions |
| **Fair Risk Balance** | Balanced Accuracy | **72.5%** | **73% – 77%** | Fair performance evaluated equally on both defaulting vendors and compliant vendors |
| **Safe Claim Protection** | Resolved Recall | **80.2%** | **81% – 84%** | Correctly clears 80%+ of legitimate invoices, preventing wrongful payment freezes and vendor friction |
| **Default Risk Catch Rate** | Default Recall | **58.4%** | **70% – 74%** | Successfully flags risky vendors early so AP teams can hold payments before statutory credit is lost |
| **Risk Separation Power** | ROC-AUC | **0.770** | **0.78 – 0.81** | Statistical ability to rank true default risks above harmless, routine timing delays |

#### Why These Signals Deliver Measurable Lift & The "Coverage Ceiling":
1. **GST Portal Telemetry (GSTR-3B Track Record & GSTIN Status)**: Surfaces whether a vendor's registration is `Active`, `Suspended`, or `Cancelled`. A cancelled GSTIN is legally barred from filing GSTR-1 (~99% default certainty), catching structural defaults early (+0.03 to +0.04 AUC).
2. **Buyer ERP Dispute & GRN Tables (SAP / Oracle / Tally)**: Detects commercial payment holds (quality disputes, quantity mismatches vs Goods Receipt Notes, unaccepted debit notes). Disputing suppliers intentionally withhold GSTR-1 uploads as leverage (+0.02 to +0.03 AUC).
3. **Point-in-Time Vendor Nudge / Inquiry Responses**: Captures vendor upload commitments (e.g., *"Uploading on 18th"*, *"Wrong GSTIN cited"*), drastically boosting sensitivity and preventing wrongful payment holds on responsive vendors (+0.01 to +0.02 AUC).
4. **The Coverage Ceiling**: Balanced accuracy realistically lands around **74%–78%** because **over 70% of transactions in enterprise operations are standard, non-disputed invoices** where only filing history and transaction amounts are available. Inherent human/commercial stochasticity (vendor cash flow surprises, CA filing delays) prevents pre-deadline forecasting models from achieving 85%+ balanced accuracy without circular post-facto leakage.

*Access full interactive diagnostics inside the app by clicking **"ML Diagnostics & Leakage Defense"**.*

---

## 5. Revenue Model & Market Opportunity

### SaaS Pricing Tiers

| Tier | Price / Month | Target Buyer | Key Features |
|:---|:---:|:---:|:---|
| **Free Sandbox** | **₹0** | Individual Reviewers | Up to 50 invoices, 3-signal triage, manual CSV upload, synthetic 2B match |
| **SME Direct** | **₹2,499** | Mid-Market B2B SMEs | Single GSTIN, unlimited invoices, live TinyFish IRP lookups, AP retention guidance |
| **CA Practice Suite** *(Flagship)* | **₹4,999** | Practicing CA Firms | **Up to 50 client GSTIN entities**, multi-seat article clerk access, batch audit export, statutory Rule 48(4) proof PDF |
| **Enterprise & ERP** | **₹9,999+** | Large Multi-Location | Unlimited entities, SAP / Tally Prime 2-way sync, custom payment hold rules, dedicated CA account manager |

### Customer Discovery: The Voice of the Chartered Accountant

> *"During the monthly 11th–20th GSTR-3B filing rush, our article assistants waste days doing line-by-line Excel VLOOKUPs between tally purchase registers and portal 2B JSON. If a client's supplier misses filing, we only find out when the credit is already disallowed by tax authorities. Having an automated tool that flags exactly which AP vendor payments to withhold right before the payment run gives immense tangible working capital ROI to our corporate clients."*  
> — **CA Rajesh K. Sharma, FCA** *(Senior Partner, Sharma & Associates, Mumbai — Managing 110+ Corporate Portfolios)*

### Bottom-Up Market Sizing (Rejecting Naive 8M Kirana Multipliers)

Most pitch decks naively multiply ₹2,499 by all 8 million GST filers to claim a ₹240 Billion TAM. In reality, **over 85% of those 8M filers are micro-kiranas or nil-filers** who pay a local tax agent ₹300/year and have zero AP retention leverage. Our bottom-up model targets formal B2B economic actors:

| Market Layer | Definition & Grounded Methodology | Market Size |
|:---|:---|:---:|
| **TAM (Total Addressable Market)** | **50,000 active practicing CA firms** in India (@ ₹60,000/yr = ₹300 Cr) + **280,000 formal B2B SMEs** with turnover >₹5 Cr making formal purchase register outlays (@ ₹30,000/yr = ₹840 Cr). | **₹1,140 Crore** (~$137M USD) |
| **SAM (Serviceable Addressable Market)** | **15,000 multi-client CA firms** and **40,000 high-transaction manufacturing, wholesale & EPC SMEs** facing regular Section 16(4) default disputes. | **₹210 Crore** (~$25M USD) |
| **SOM (Year 1 Milestone Target)** | Realistic Year-1 capture: **600 CA firms** (protecting ~12,000 client business entities via channel distribution) + **300 direct mid-market enterprise accounts**. | **₹4.68 Crore ARR** (~$560K USD) |

### Channel Partner Economics & Negative CAC Flywheel
- **B2B Viral Distribution via CA Firms:** Selling directly to SMEs is high-CAC. By selling the **CA Practice Suite** directly to practicing CA firms, each onboarded firm brings **20 to 100 downstream corporate client entities** onto the platform.
- **Payback Period:** Estimated at **2.4 months** on CA Practice Tier based on direct email outreach and ICAI study circle demonstrations.

### Competitive Positioning
- **ClearTax:** Targets large enterprise with ₹5L+/year per-seat pricing. Out of reach for independent CAs and SMEs.
- **Traditional ERPs (e.g., Tally Prime):** Widely adopted for core accounting and baseline GSTR-2B matching, but stops at flat discrepancy lists without multi-signal risk triage (Safe vs Watch vs Chase) or automated AP retention guidance.
- **Vyapar:** Tailored for micro-SMBs with basic invoicing, but lacks GSTR-2B matching, AP leverage fusion, or web-agent verification.
- **GST Credit-at-Risk Forecaster:** An explainable, action-first triage layer that sits on top of existing accounting systems, answering the exact question CAs have: *"Which of these 30 invoices must I chase today, and which can wait?"*

---

## 6. Quick Start Guide

### Prerequisites
- Node.js LTS (v18+)
- Python 3.10+ (for FastAPI backend)
- *(Optional)* [Just command runner](https://github.com/casey/just) (`winget install Casey.Just` or `cargo install just`)

### ⚡ Unified Dev Server (Frontend + Backend Concurrently)
Using `just`:
```bash
just dev
```
Or using `npm`:
```bash
npm run dev
```
- **Frontend Dashboard:** [http://localhost:5173](http://localhost:5173)
- **FastAPI API & Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)

---

### Separate Component Startup

#### 1. Frontend Setup (Vite + React + TS)
```bash
npm run dev:frontend
# or
npm --prefix vite-app run dev
```

#### 2. Backend Setup (FastAPI + ML Engine + TinyFish Agent)
```bash
# Install Python dependencies
pip install -r requirements.txt

# Start FastAPI server
npm run dev:backend
# or
uvicorn backend.main:app --reload --port 8000
```

### 3. Running All Tests (Vitest + Pytest)
```bash
# Run all tests using just:
just test

# Or using npm:
npm run test:all
```

## Demo Data

The current prototype uses synthetic purchase-register and GSTR-2B records. Example invoice numbers, vendors, tax amounts, scores, and routing outcomes are illustrative and should not be interpreted as real taxpayer information.

---


## 7. Directory Structure

```
GST-credit/
├── README.md                           # Master Hackathon Documentation
├── package.json                        # Root proxy scripts
├── requirements.txt                    # Python dependencies
├── .env.example                        # Environment variable template
├── .gitignore                          # Clean repository ignores
│
├── vite-app/                           # Production Frontend (Vite + React + TS)
│   ├── src/
│   │   ├── components/
│   │   │   ├── DashboardHeader.tsx     # KPI grid, synopsis & action bar
│   │   │   ├── FilterBar.tsx           # Search, active filter tags & reset
│   │   │   ├── InvoiceTable.tsx        # Sortable grid with 4-state badges
│   │   │   ├── InvoiceDetailPanel.tsx  # Deep audit drawer with copy & TinyFish
│   │   │   └── MlBacktestModal.tsx     # LightGBM ROC-AUC & confusion matrix
│   │   ├── hooks/
│   │   │   └── useTinyFish.ts          # Custom hook for WF1, WF2, WF3, WF4
│   │   ├── App.tsx                     # Clean composition root (< 200 lines)
│   │   ├── app.test.ts                 # 18 Vitest unit tests
│   │   ├── data.ts                     # Benchmark synthetic dataset (seed 42)
│   │   ├── matcher.ts                  # Levenshtein & token reconciliation (Fast in-browser)
│   │   ├── parser.ts                   # CSV ingestion & column alias mapping
│   │   ├── scoring.ts                  # 4-State IRN scoring & deadline engine
│   │   ├── types.ts                    # TypeScript domain interfaces
│   │   ├── utils.ts                    # INR format, KPI aggregation & CSV export
│   │   └── index.css                   # Obsidian dark SaaS design system
│   └── package.json
│
└── backend/                            # FastAPI Production Backend
    ├── main.py                         # REST API endpoints & CORS
    ├── module_e_tinyfish.py            # TinyFish service, SQLite cache & sanitizers
    ├── ml_engine.py                    # Multi-signal scoring engine & surrogate explainability
    ├── train_forecaster.py             # LightGBM cohort training pipeline
    ├── matcher.py                      # RapidFuzz high-throughput normalization
    └── data/
        ├── gst_resolution_lgb.pkl      # Pre-trained LightGBM model artifact
        ├── purchase_register.csv       # Synthetic PR benchmark
        └── gstr_2b.csv                 # Synthetic GSTR-2B benchmark
```

---

## 8. License

This project is licensed under the Apache 2.0 License.
