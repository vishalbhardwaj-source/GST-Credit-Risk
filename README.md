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

## 4. Machine Learning Diagnostics & Leakage Audit (Module C)

In addition to the deterministic compliance engine, the platform includes a trained **LightGBM Gradient Boosted Forecaster** to predict supplier self-resolution probability based on 1,200 multi-month cohort transactions across 6 tax periods.


### The Production Safety Architecture: Deterministic Rules > ML Black Boxes
In Indian GST jurisprudence under CGST Act Section 16(4) and Rule 48(4), **input tax credit cannot legally or safely be claimed, held, or reversed based on an opaque ML gradient boosted tree**. An assessing tax officer will reject *"our LightGBM model predicted 82% resolution probability"*. Therefore, our architecture guarantees:

1. **Tier 1: Deterministic Compliance Engine (Primary & Authoritative):**  
   Every tax decision (HOLD, CHASE, SAFE) is governed 100% by legal statutory logic: government IRP verification under Rule 48(4), Accounts Payable (AP) cash-flow retention leverage, and Section 16(4) statutory calendar deadlines.
2. **Tier 2: LightGBM Prioritization (Secondary Decision Support):**  
   Calculates Expected Loss ($E[\text{Loss}] = \text{Tax} \times (1 - P_{\text{res}})$) strictly to order human follow-up queues within the ambiguous "Watch" bucket.

### Leakage-Free Validation Metrics
- **Supplier-Grouped Cross-Validation (True Generalization):** **`86.2% – 93.3% Balanced Accuracy`** when evaluated strictly on unmatched discrepancy records with 5-Fold GroupKFold cross-validation partitioned strictly by Supplier GSTIN (preventing vendor archetype leakage).
- **Synthetic Benchmark Baseline:** `0.9858 ROC-AUC` / `91.9% Balanced Accuracy` (generator boundary baseline).
- **Default Catch Rate (Recall):** `87.0%` (catches 40 of 46 default archetypes on held-out test cohort).
- **Brier Probability Calibration Error:** `0.0383`.

*Access full interactive diagnostics inside the app by clicking **"ML Diagnostics & Leakage Defense"**.*

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
- **Traditional ERPs (e.g., Tally Prime):** Widely adopted for core accounting and baseline GSTR-2B matching, but stops at flat discrepancy lists without multi-signal risk triage (Safe vs Watch vs Chase) or automated AP retention guidance.
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
