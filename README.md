# GST Credit-at-Risk Forecaster

**Live Demo:** [View Deployed Project] https://gst-credit-risk.vercel.app?_vercel_share=JNmXOG21P9DBkGABptLQI6PnAzn1SzdD

> **Autonomous 3-Signal Action Triage Engine with TinyFish Web Agent & 4-State IRN Verification for Indian B2B Invoices**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite)](https://vitejs.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python)](https://python.org/)
[![LightGBM](https://img.shields.io/badge/ML-LightGBM_0.986_AUC-green)](https://lightgbm.readthedocs.io/)
[![TinyFish AI](https://img.shields.io/badge/Web_Agent-TinyFish_v1-orange)](https://tinyfish.ai)
[![Tests](https://img.shields.io/badge/Vitest-18%2F18_Passing-brightgreen?logo=vitest)](https://vitest.dev/)

---

> [!IMPORTANT]
> **Legal & Trust Notice:**  
> *Synthetic demo data. Triage decision-support only — not tax or legal advice. Does not access government production credentials, determine statutory ITC eligibility, or replace certified Chartered Accountant review.*

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

[TinyFish](https://tinyfish.ai) is an autonomous web exploration and content extraction agent. In this project, TinyFish queries public GST and CBIC portals to retrieve statutory context—such as e-invoicing thresholds, taxpayer enablement, and return deadlines—bridging static enterprise data and dynamic regulatory reality.

### The 4 Production Workflows

| ID | Workflow Name | Target Endpoint | Description | Scoring Engine Impact |
|:---|:---|:---|:---|:---|
| **WF1** | **Deadline Extension Tracker** | `GET /api/tinyfish/workflow-1/deadline-extension` | Queries CBIC notifications (`cbic.gov.in`) to check whether Section 16(4) reversal deadlines have been extended. | Surfaces active Nov 30 statutory horizon on dashboard header banner. |
| **WF2** | **Vendor Registry Verifier** | `GET /api/tinyfish/workflow-2/vendor-status` | Searches `services.gst.gov.in` for taxpayer active/cancelled status, legal entity name, and return filing history. | Provides qualitative audit proof before vendor escalation. |
| **WF3** | **IRN Applicability Checker** | `GET /api/tinyfish/workflow-3/irn-applicability` | Evaluates CBIC Notification No. 10/2023 r/w Rule 48(4) against supplier turnover band (< ₹5 Cr vs > ₹5 Cr) and transaction type. | Upgrades absent IRN from default penalty (`-15`) to neutral (`0`) when supplier is sub-threshold (< ₹5 Cr). |
| **WF4** | **Vendor IRN Portal Lookup** | `GET /api/tinyfish/workflow-4/vendor-lookup` | Directly queries `einvoice1.gst.gov.in` to verify whether the vendor's specific GSTIN is e-invoice enabled on the IRP. | Feeds the 4-state IRN engine with verified portal evidence; supports simulated failure mode. |

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
(Base 50 + IRN Adj + AP Leverage Adj + Filing Pattern Adj)
          │
          ▼
Final Clamped Score (0 - 100) ──► SAFE TO HOLD (≥75) | WATCH (40-74) | CHASE NOW (<40)
```

### Offline Resilience & Zero-Penalty Defense
- **SQLite Caching (24h TTL):** Every lookup is cached with SHA-256 keys in `backend/data/tinyfish_cache.db`.
- **Deterministic Parity:** When offline, the app serves structurally identical responses with `CACHE_HIT` / `OFFLINE_FALLBACK` badges.
- **Zero-Penalty Defense:** If an external portal times out or blocks requests, the engine defaults to `ABSENT_UNKNOWN` (0 penalty points). The app never converts a network glitch into an unwarranted vendor penalty.

---

## 4. Machine Learning Backtest Diagnostics (Module C)

In addition to deterministic rule-based triage, the platform includes a trained **LightGBM Gradient Boosted Forecaster** to predict self-resolution probability based on 1,200 multi-month cohort transactions across 6 tax periods.

> [!NOTE]
> **Deterministic Triage is Primary, ML is Secondary:**  
> The 3-Signal deterministic engine serves as the legally binding compliance triage layer (achieving 100% precision on statutory cutoff and payment leverage). The LightGBM forecaster acts as a calibrated advisory layer for ambiguous "Watch" bucket invoices, estimating expected loss ($E[\text{Loss}] = \text{Tax} \times (1 - P_{\text{res}})$).

### Model Performance Metrics
- **ROC-AUC:** `0.9858` (vs. Baseline Logistic Regression: `0.6510`)
- **Brier Probability Error:** `0.0383` (well-calibrated risk forecast)
- **Held-out Test Cohort:** 240 unseen invoices
- **Overall Plain Accuracy:** `95.0%`
- **Overall Balanced Accuracy:** `91.9%`

### Confusion Matrix (N = 240)
| Actual \ Predicted | Pred: Non-Resolved (High Risk) | Pred: Resolved (Self-Correct) | Accuracy (Recall) |
|:---|:---:|:---:|:---:|
| **Actual Non-Resolved (46)** | **40 (True Negative)** | 6 (False Positive) | **87.0%** (Risk Caught) |
| **Actual Resolved (194)** | 6 (False Negative) | **188 (True Positive)** | **96.9%** (Self-Correct) |
| **Overall Metrics** | **Plain Acc: 95.0%** | **Balanced Acc: 91.9%** | **AUC: 0.9858** |

*Access full diagnostics inside the app by clicking **"ML Backtest & Diagnostics"** in the top navigation.*

---

## 5. Revenue Model & Market Opportunity

### SaaS Pricing Tiers

| Tier | Price / Month | Invoices / Month | Key Features |
|:---|:---:|:---:|:---|
| **Free** | **₹0** | Up to 50 | 3-signal triage, manual CSV upload, 2B match view |
| **Pro** | **₹2,499** | Unlimited | Bulk CSV export, TinyFish live IRN + vendor verification, 4-state IRN model, priority support |
| **Enterprise** | **₹12,999+** | Unlimited (Multi-Entity) | Multi-GSTIN workspace, ERP direct integration (Tally, SAP), custom retention rules, dedicated CA account manager |

These prices are illustrative and have not been established as validated commercial offerings. Actual pricing would depend on infrastructure costs, customer needs, external service costs, and market research.

### Market Sizing Funnel (TAM → SAM → SOM)

| Market Layer | Definition & Methodology | Market Size |
|:---|:---|:---:|
| **TAM (Total Addressable Market)** | All ~8 Million GST-registered businesses filing GSTR-3B monthly in India | **₹240 Billion** (~$2.9B USD) |
| **SAM (Serviceable Addressable Market)** | ~10% of monthly filers (~800,000 businesses) facing recurring GSTR-2B discrepancies | **₹24 Billion** (~$290M USD) |
| **SOM (Serviceable Obtainable Market)** | Realistic 1% capture in Year 1 across mid-sized enterprises and CA practice clients (~8,000 businesses) | **₹24 Crore** (~$2.9M USD) |

*The SOM (₹24 Cr) is the defensible Year-1 milestone in a venture pitch — assuming a realistic blended ARPU of ₹2,499/month across mid-market accounting firms and their downstream SME clients.*

### Competitive Positioning
- **ClearTax:** Targets large enterprise with ₹5L+/year per-seat pricing. Out of reach for independent CAs and SMEs.
- **Tally:** Ubiquitous bookkeeping, but zero reconciliation intelligence — dumps an unprioritized list of mismatches without action guidance.
- **Vyapar:** Tailored for micro-SMBs with basic invoicing, but lacks GSTR-2B matching, AP leverage fusion, or web-agent verification.
- **GST Credit-at-Risk Forecaster:** An explainable, action-first triage layer that sits on top of existing accounting systems, answering the exact question CAs have: *"Which of these 30 invoices must I chase today, and which can wait?"*

---

## 6. Quick Start Guide

### Prerequisites
- Node.js LTS (v18+)
- Python 3.10+ (for FastAPI backend)

### 1. Frontend Setup (Vite + React + TS)
```bash
# Navigate to frontend
cd vite-app

# Install dependencies
npm install

# Run dev server
npm run dev
```
Open **`http://localhost:5173`** in your browser.

### 2. Backend Setup (FastAPI + TinyFish Agent)
```bash
# Install Python dependencies from root or backend
pip install -r requirements.txt

# Start FastAPI server
uvicorn backend.main:app --reload --port 8000
```
API Documentation will be available at **`http://localhost:8000/docs`**.

### 3. Running Unit Tests
```bash
cd vite-app
npx vitest run
```
All **18 unit tests** will execute and pass, verifying scoring rules, fuzzy normalisation, 4-state IRN weights, and fixture invariance.

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
│   │   ├── matcher.ts                  # RapidFuzz invoice reconciliation
│   │   ├── scoring.ts                  # 4-State IRN scoring engine
│   │   ├── types.ts                    # TypeScript domain interfaces
│   │   ├── utils.ts                    # INR format, KPI aggregation & CSV export
│   │   └── index.css                   # Obsidian dark SaaS design system
│   └── package.json
│
└── backend/                            # FastAPI Production Backend
    ├── main.py                         # REST API endpoints & CORS
    ├── module_e_tinyfish.py            # TinyFish service, SQLite cache & sanitizers
    ├── ml_engine.py                    # Multi-signal scoring engine
    ├── train_forecaster.py             # LightGBM cohort training pipeline
    ├── matcher.py                      # RapidFuzz string normalization
    └── data/
        ├── gst_resolution_lgb.pkl      # Pre-trained LightGBM model artifact
        ├── tinyfish_cache.db           # SQLite 24h TTL cache
        ├── purchase_register.csv       # Synthetic PR benchmark
        └── gstr_2b.csv                 # Synthetic GSTR-2B benchmark
```

---

## 8. License

This project is licensed under the Apache 2.0 License.
