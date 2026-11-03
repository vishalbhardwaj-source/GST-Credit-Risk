# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are Enterprise Tax Directors, Heads of Indirect Tax, and Accounts Payable (AP) teams in Indian mid-market and enterprise organizations. They operate under monthly reconciliation pressures, comparing internal ERP purchase ledgers (SAP, Oracle, Tally) against government-reported GSTR-2B returns to protect Input Tax Credit (ITC) and prevent statutory Rule 37A reversals and interest penalties.

## Product Purpose

The GST Credit-at-Risk Forecaster transforms high-friction monthly invoice reconciliation from a blunt discrepancy list into an autonomous, risk-weighted decision workflow. It eliminates the traditional month-end AP dilemma—either indiscriminately chasing hundreds of vendors or waiting until the November 30 deadline when leverage is lost—by providing deterministic operational triage buckets: Safe to Hold, Watch, and Chase Now. Success is measured by zero unhedged ITC loss, minimized vendor relationship friction, and full compliance with Indian GST statutory deadlines.

## Positioning

Unlike traditional accounting tools that stop at fuzzy line-item matching and generic reconciliation diffs, this system combines deterministic 3-signal triage (4-state IRN registry verification, AP commercial retention leverage, and 6-month vendor periodicity) with a calibrated LightGBM machine learning forecaster and an in-drawer Multi-Provider AI Tax Copilot (Gemini, Claude, GPT-4o, Groq). It directly informs CFOs and AP teams whether unpaid commercial balances sufficiently cover tax risk, enabling precise cash retention rather than premature vendor harassment.

## Operating Context

- **Statutory Milestones:** Monthly GSTR-1 vendor filing (11th), GSTR-3B tax payment (20th), auto-generation of GSTR-2B (14th), and the critical statutory cutoff of November 30 following the financial year-end under Rule 37A.
- **Legal Mandates:** Section 16(2)(aa) of the CGST Act (ITC dependent on GSTR-2B communication), Rule 37A (mandatory ITC reversal with 18% p.a. interest under Section 50(1) if supplier defaults on GSTR-3B), and Rule 48(4) (mandatory 64-character IRN and signed QR code for vendors with turnover > ₹5 Cr).
- **Environment & Inputs:** Heavy CSV/XLSX enterprise purchase ledgers reconciled against JSON/CSV GSTR-2B downloads; high-stakes vendor relationships where unwarranted commercial escalation damages supply chains.

## Capabilities and Constraints

- **Core Capabilities:**
  - Normalized cross-GSTIN and RapidFuzz invoice matching engine.
  - 4-State IRN registry footprint analysis (`Present` [+20], `Absent` [-15], `Exempt` [0], `Unknown` [0]).
  - AP Commercial Retention Leverage computation (`Unpaid Balance / Tax at Risk`: High [≥1.0, +15], Medium [<1.0, +5], Low [0, -10]).
  - 6-Month Vendor Filing Periodicity tracking (Habitual Laggard [+15], Normal [0], New Anomaly [-25]).
  - Calibrated LightGBM Forecaster (Module C) with hierarchical invariant bounds yielding an calibrated 0–100 score.
  - Operational 3-bucket triage: Safe to Hold (75–100), Watch (40–74), Chase Now (0–39).
  - Multi-provider AI Tax Copilot streaming real-time SSE responses grounded in live telemetry and regulatory citations.
  - TinyFish Web Agent integration for automated external compliance and portal checks.
  - One-click executive PowerPoint presentation export (`generate_ppt.py`).
- **Constraints & Boundaries:**
  - Strict compliance boundary: Does not access private government tax portal credentials, determine statutory legal ITC eligibility, or replace formal statutory audit review by a certified Chartered Accountant.
  - Local/client-side processing priority with fast client-side scoring and optional FastAPI backend support.

## Brand Commitments

- **Visual Identity:** "Electric Lavender" dark interface—deep dark violet/navy canvases (`#170D24`, `#23172F`), vibrant lavender accents (`#B794F6`), and unmistakable semantic status indicators: Emerald (`#10B981`) for Safe to Hold, Amber (`#F59E0B`) for Watch, and Crimson (`#EF4444`) for Chase Now.
- **Typography & Precision:** High-legibility sans-serif (`Inter`) paired with monospace (`JetBrains Mono`) for all financial and statutory identifiers (GSTIN, IRN, HSN, invoice numbers).
- **Tone & Voice:** Authoritative, disciplined, compliance-sound, and operational. No speculative financial claims.

## Evidence on Hand

- Production-grade codebase with 32 passing Vitest frontend unit tests and 11 passing Pytest backend tests.
- Reference documentation and benchmark datasets: `gst-credit-at-risk-export-2026-10-19.csv`, `GST_Credit_at_Risk_Forecaster_Reference.pdf`, and `MODEL-INTEGRATION.md`.
- Live deployment active at `gst-credit-risk.vercel.app` and API running on Render.

## Product Principles

1. **Action Over Discrepancy:** Never present a raw mismatch without a decisive operational posture (Hold, Watch, Chase).
2. **Leverage Before Escalation:** Verify commercial AP retention leverage before escalating; never jeopardize vendor goodwill when unpaid balances safely hedge tax risk.
3. **Deterministic Explainability:** Machine learning scores and AI copilot insights must always be bound by deterministic invariant clamps, clear rule citations (CGST Act, Rule 37A, Rule 48(4)), and auditable logs.
4. **Frictionless Data Privacy:** Provide instant, browser-based parsing and analysis without requiring sensitive enterprise financial ledgers to be permanently stored on external third-party databases.

## Accessibility & Inclusion

- Adherence to WCAG AA contrast standards on dark background surfaces.
- Multi-dimensional status encoding: Triage categories (Safe, Watch, Chase) must be distinguishable via iconography, numeric scoring, and explicit badges, never color hue alone.
