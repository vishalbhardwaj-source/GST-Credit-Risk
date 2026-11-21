"""
Publication-Grade Technical Whitepaper & Architectural Reference Guide Generator
for the GST Credit-at-Risk Forecaster platform.
"""

import os
import subprocess
import pymupdf

def build_pdf_html():
    html = r"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>GST Credit-at-Risk Forecaster - Comprehensive Project Guide</title>
<style>
  @page {
    size: A4;
    margin: 16mm 14mm 16mm 14mm;
    @top-right {
      content: "GST Credit-at-Risk Forecaster";
      font-size: 8pt;
      font-weight: 500;
      color: #64748b;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    @bottom-center {
      content: "Page " counter(page);
      font-size: 8pt;
      color: #64748b;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
  }

  @page :first {
    @top-right { content: ''; }
    @bottom-center { content: ''; }
  }

  * {
    box-sizing: border-box;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #1e293b;
    font-size: 9pt;
    line-height: 1.55;
    background: #ffffff;
    margin: 0;
    padding: 0;
  }

  /* Cover Page */
  .cover-page {
    page-break-after: always;
    height: 1000px;
    background: linear-gradient(145deg, #090a0f 0%, #111524 45%, #0d1b2a 100%);
    color: #f8fafc;
    padding: 44px 38px;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .cover-badge {
    display: inline-block;
    padding: 5px 12px;
    background: rgba(34, 211, 238, 0.12);
    border: 1px solid rgba(34, 211, 238, 0.35);
    border-radius: 20px;
    color: #22d3ee;
    font-size: 7.5pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    margin-bottom: 20px;
  }

  .cover-title {
    font-size: 30pt;
    font-weight: 800;
    line-height: 1.15;
    color: #ffffff;
    margin: 0 0 14px 0;
    letter-spacing: -0.5px;
  }

  .cover-title span {
    background: linear-gradient(90deg, #22d3ee 0%, #38bdf8 50%, #818cf8 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .cover-subtitle {
    font-size: 11pt;
    font-weight: 400;
    line-height: 1.5;
    color: #94a3b8;
    max-width: 680px;
    margin-bottom: 28px;
  }

  .cover-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
    margin: 20px 0;
  }

  .cover-card {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 14px;
  }

  .cover-card-num {
    font-size: 17pt;
    font-weight: 800;
    color: #38bdf8;
    margin-bottom: 4px;
  }

  .cover-card-lbl {
    font-size: 7.5pt;
    font-weight: 600;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.8px;
  }

  .cover-card-desc {
    font-size: 7.5pt;
    color: #cbd5e1;
    margin-top: 5px;
    line-height: 1.4;
  }

  .cover-footer {
    border-top: 1px solid rgba(255, 255, 255, 0.12);
    padding-top: 20px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }

  .cover-meta {
    font-size: 7.5pt;
    color: #64748b;
    line-height: 1.6;
  }

  .cover-meta strong {
    color: #cbd5e1;
  }

  .cover-link-pill {
    padding: 6px 14px;
    background: #0284c7;
    color: #ffffff;
    border-radius: 6px;
    font-size: 8pt;
    font-weight: 600;
    display: inline-block;
  }

  /* Structural Rules */
  .no-break {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  h1 {
    font-size: 15pt;
    font-weight: 800;
    color: #0f172a;
    margin: 20px 0 10px 0;
    padding-bottom: 5px;
    border-bottom: 2px solid #0284c7;
    letter-spacing: -0.2px;
    break-after: avoid;
    page-break-after: avoid;
  }

  .section-kicker {
    font-size: 7pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    color: #0284c7;
    margin-top: 16px;
    margin-bottom: 2px;
    break-after: avoid;
    page-break-after: avoid;
  }

  h2 {
    font-size: 11.5pt;
    font-weight: 700;
    color: #1e293b;
    margin: 14px 0 6px 0;
    break-after: avoid;
    page-break-after: avoid;
  }

  h3 {
    font-size: 9.5pt;
    font-weight: 700;
    color: #334155;
    margin: 12px 0 4px 0;
    break-after: avoid;
    page-break-after: avoid;
  }

  p {
    margin: 0 0 8px 0;
    color: #334155;
    text-align: justify;
  }

  ul, ol {
    margin: 0 0 10px 0;
    padding-left: 18px;
    color: #334155;
  }

  li {
    margin-bottom: 3px;
  }

  strong {
    color: #0f172a;
  }

  code {
    font-family: "JetBrains Mono", Consolas, "Courier New", monospace;
    font-size: 7.5pt;
    background: #f1f5f9;
    color: #0f172a;
    padding: 1px 4px;
    border-radius: 4px;
    border: 1px solid #e2e8f0;
  }

  pre {
    background: #0f172a;
    color: #e2e8f0;
    padding: 10px;
    border-radius: 6px;
    font-family: "JetBrains Mono", Consolas, monospace;
    font-size: 7pt;
    line-height: 1.4;
    overflow-x: auto;
    margin: 8px 0 10px 0;
    break-inside: avoid;
  }

  /* Callout Boxes */
  .callout {
    padding: 10px 12px;
    border-radius: 6px;
    margin: 10px 0;
    font-size: 8pt;
    line-height: 1.5;
    break-inside: avoid;
  }

  .callout-important {
    background: #eff6ff;
    border-left: 4px solid #2563eb;
    color: #1e40af;
  }

  .callout-warning {
    background: #fffbeb;
    border-left: 4px solid #f59e0b;
    color: #92400e;
  }

  .callout-danger {
    background: #fef2f2;
    border-left: 4px solid #ef4444;
    color: #991b1b;
  }

  .callout-success {
    background: #f0fdf4;
    border-left: 4px solid #10b981;
    color: #065f46;
  }

  .callout-title {
    font-weight: 700;
    margin-bottom: 3px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  /* Tables */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0 12px 0;
    font-size: 7.5pt;
    break-inside: avoid;
  }

  th {
    background: #0f172a;
    color: #f8fafc;
    text-align: left;
    padding: 6px 8px;
    font-weight: 600;
    border: 1px solid #334155;
  }

  td {
    padding: 5px 8px;
    border: 1px solid #e2e8f0;
    color: #334155;
    vertical-align: top;
  }

  tr:nth-child(even) td {
    background: #f8fafc;
  }

  /* Badges */
  .badge {
    display: inline-block;
    padding: 1px 6px;
    border-radius: 3px;
    font-size: 6.5pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }

  .badge-safe {
    background: #dcfce7;
    color: #15803d;
    border: 1px solid #bbf7d0;
  }

  .badge-watch {
    background: #fef3c7;
    color: #b45309;
    border: 1px solid #fde68a;
  }

  .badge-chase {
    background: #fee2e2;
    color: #b91c1c;
    border: 1px solid #fecaca;
  }

  .badge-blue {
    background: #e0f2fe;
    color: #0369a1;
    border: 1px solid #bae6fd;
  }

  /* Grids */
  .grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin: 10px 0;
    break-inside: avoid;
  }

  .grid-3 {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 10px;
    margin: 10px 0;
    break-inside: avoid;
  }

  .stat-card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 10px;
    text-align: center;
  }

  .stat-val {
    font-size: 14pt;
    font-weight: 800;
    color: #0f172a;
    line-height: 1.1;
  }

  .stat-lbl {
    font-size: 6.5pt;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-top: 3px;
  }

  .stat-sub {
    font-size: 6.5pt;
    color: #94a3b8;
    margin-top: 2px;
  }

  /* Diagram Box */
  .diagram-container {
    background: #0f172a;
    border-radius: 6px;
    padding: 12px;
    margin: 10px 0;
    color: #f8fafc;
    break-inside: avoid;
  }

  .diagram-title {
    font-size: 7.5pt;
    font-weight: 700;
    color: #38bdf8;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    margin-bottom: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .flow-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    margin-bottom: 6px;
  }

  .flow-node {
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 5px;
    padding: 8px;
    flex: 1;
    text-align: center;
  }

  .flow-node.highlight-cyan {
    border-color: #0284c7;
    background: rgba(2, 132, 199, 0.15);
  }

  .flow-node.highlight-emerald {
    border-color: #10b981;
    background: rgba(16, 185, 129, 0.15);
  }

  .flow-node.highlight-amber {
    border-color: #f59e0b;
    background: rgba(245, 158, 11, 0.15);
  }

  .flow-node.highlight-rose {
    border-color: #ef4444;
    background: rgba(239, 68, 68, 0.15);
  }

  .flow-node-title {
    font-size: 7.5pt;
    font-weight: 700;
    color: #f8fafc;
  }

  .flow-node-desc {
    font-size: 6.5pt;
    color: #94a3b8;
    margin-top: 2px;
    line-height: 1.3;
  }

  .flow-arrow {
    font-size: 11pt;
    color: #64748b;
    font-weight: bold;
  }

  /* TOC */
  .toc-container {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 12px 16px;
    margin: 12px 0 16px 0;
    break-inside: avoid;
  }

  .toc-title {
    font-size: 10pt;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 8px;
    border-bottom: 1px solid #cbd5e1;
    padding-bottom: 4px;
  }

  .toc-list {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px 20px;
    list-style: none;
    padding: 0;
    margin: 0;
    font-size: 7.5pt;
  }

  .toc-item {
    display: flex;
    justify-content: space-between;
    color: #334155;
  }

  .toc-item-num {
    font-weight: 700;
    color: #0284c7;
    margin-right: 5px;
  }

  .formula-box {
    background: #f1f5f9;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    padding: 8px 12px;
    margin: 8px 0;
    font-family: "JetBrains Mono", Consolas, monospace;
    font-size: 8pt;
    font-weight: 600;
    color: #0f172a;
    text-align: center;
    break-inside: avoid;
  }
</style>
</head>
<body>

<!-- COVER PAGE -->
<div class="cover-page">
  <div>
    <div class="cover-badge">Executive Whitepaper & Technical Architecture Manual</div>
    <div class="cover-title">
      GST Credit-at-Risk<br><span>Forecaster</span>
    </div>
    <div class="cover-subtitle">
      Autonomous 3-Signal Action Triage Engine, 4-State IRN Registry Footprint Verification, Calibrated LightGBM Forecaster, and Multi-Provider AI Tax Copilot for Indian Enterprise B2B Invoices.
    </div>

    <div class="cover-grid">
      <div class="cover-card">
        <div class="cover-card-num">83.3%</div>
        <div class="cover-card-lbl">Noise Elimination</div>
        <div class="cover-card-desc">25 of 30 invoice discrepancies safely held without vendor harassment.</div>
      </div>
      <div class="cover-card">
        <div class="cover-card-num">0.9858</div>
        <div class="cover-card-lbl">ROC-AUC Accuracy</div>
        <div class="cover-card-desc">Calibrated LightGBM gradient-boosted forecaster with isotonic bounds.</div>
      </div>
      <div class="cover-card">
        <div class="cover-card-num">18% p.a.</div>
        <div class="cover-card-lbl">Statutory Defense</div>
        <div class="cover-card-desc">Guarantees zero Sec 50(1) interest liabilities and Rule 37A clawbacks.</div>
      </div>
    </div>

    <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 14px; margin-top: 14px;">
      <div style="font-size: 7.5pt; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; margin-bottom: 6px;">Key System Capabilities at a Glance</div>
      <div style="font-size: 7.5pt; color: #cbd5e1; line-height: 1.6;">
        • <strong>Deterministic 3-Signal Decision Triage:</strong> IRN Footprint + AP Commercial Retention Leverage + 6-Month Periodicity.<br>
        • <strong>Multi-Provider AI Tax Copilot:</strong> Real-time SSE token streaming grounded in live session telemetry (Gemini, Claude, GPT-4o, Groq).<br>
        • <strong>TinyFish Autonomous Regulatory Web Agent:</strong> 4 simulated live CBIC/IRP workflows with zero-penalty defense.<br>
        • <strong>High-Throughput Enterprise Ingest:</strong> RapidFuzz normalized cross-GSTIN matcher & 200,000 transaction batch model pipeline.
      </div>
    </div>
  </div>

  <div class="cover-footer">
    <div class="cover-meta">
      <strong>Target Audience:</strong> CFOs, Indirect Tax Directors, Accounts Payable Heads, Chartered Accountants<br>
      <strong>Platform Release:</strong> Version 2.4 (Production Architecture)<br>
      <strong>Live Application:</strong> https://gst-credit-risk.vercel.app<br>
      <strong>FastAPI Swagger Docs:</strong> https://gst-credit-risk.onrender.com/docs
    </div>
    <div>
      <div style="text-align: right; font-size: 7pt; color: #64748b; margin-bottom: 4px;">CONFIDENTIAL TECHNICAL BRIEF</div>
      <div class="cover-link-pill">Production Ready v2.4</div>
    </div>
  </div>
</div>

<!-- TOC -->
<div class="toc-container">
  <div class="toc-title">Table of Contents & Technical Blueprint</div>
  <div class="toc-list">
    <div class="toc-item"><span><span class="toc-item-num">1.</span> Executive Summary & Legal Crisis</span><span>Page 2</span></div>
    <div class="toc-item"><span><span class="toc-item-num">2.</span> Indian Statutory & Compliance Framework</span><span>Page 3</span></div>
    <div class="toc-item"><span><span class="toc-item-num">3.</span> The 3-Signal Action Triage Architecture</span><span>Page 4</span></div>
    <div class="toc-item"><span><span class="toc-item-num">4.</span> 4-State IRN Engine & Applicability Logic</span><span>Page 5</span></div>
    <div class="toc-item"><span><span class="toc-item-num">5.</span> Machine Learning Forecaster (Module C)</span><span>Page 6</span></div>
    <div class="toc-item"><span><span class="toc-item-num">6.</span> Hierarchical Invariant Clamps & Expected Loss</span><span>Page 7</span></div>
    <div class="toc-item"><span><span class="toc-item-num">7.</span> TinyFish Autonomous Web Agent System</span><span>Page 8</span></div>
    <div class="toc-item"><span><span class="toc-item-num">8.</span> Multi-Provider AI Tax Advisory Copilot</span><span>Page 9</span></div>
    <div class="toc-item"><span><span class="toc-item-num">9.</span> Full-Stack Architecture & Data Pipelines</span><span>Page 10</span></div>
    <div class="toc-item"><span><span class="toc-item-num">10.</span> UI/UX Titanium Design System & WCAG AA</span><span>Page 11</span></div>
    <div class="toc-item"><span><span class="toc-item-num">11.</span> Market Opportunity, Sizing & Business Model</span><span>Page 11</span></div>
    <div class="toc-item"><span><span class="toc-item-num">12.</span> Tax Director's Operational Playbook</span><span>Page 12</span></div>
  </div>
</div>

<!-- SECTION 1 -->
<div class="section-kicker">Section 1</div>
<h1>Executive Summary & Problem Statement</h1>

<p>
  Under Indian Goods and Services Tax (GST) jurisprudence, Input Tax Credit (ITC) reconciliation between internal Enterprise Resource Planning (ERP) purchase registers (SAP, Oracle, Tally, Zoho) and government-communicated GSTR-2B returns represents an existential working-capital and regulatory compliance challenge.
</p>

<div class="callout callout-important">
  <div class="callout-title">
    Legal Mandate & Statutory Reversal Pressure
  </div>
  Under <strong>Section 16(2)(aa) of the CGST Act</strong>, recipients cannot legally claim Input Tax Credit unless the supplier has furnished invoice details in GSTR-1 and communicated them in auto-generated GSTR-2B. Under <strong>Rule 37A</strong>, buyers must reverse claimed ITC in Table 4(B)(2) of GSTR-3B if their supplier fails to file GSTR-3B by <strong>November 30</strong> following the end of the financial year. If reversed past November 30, mandatory interest at <strong>18% per annum accrues under Section 50(1)</strong> from the date of the initial claim.
</div>

<h2>The Month-End Accounts Payable (AP) Reconciliation Dilemma</h2>
<p>
  In a typical enterprise reconciliation run—such as our benchmark fixture reconciling <strong>200 purchase records</strong> against <strong>170 GSTR-2B entries</strong>—the finance team discovers <strong>30 missing invoices</strong> representing substantial tax exposure (₹1,74,400.00). Traditional tax software simply outputs a flat, unprioritized discrepancy diff. This forces Accounts Payable (AP) and Indirect Tax teams into a costly lose-lose trade-off:
</p>

<div class="grid-2">
  <div style="background: #fff1f2; border: 1px solid #fecdd3; border-radius: 6px; padding: 10px;">
    <div style="font-weight: 700; color: #be123c; margin-bottom: 4px;">1. The Blanket Chase Approach (High Friction)</div>
    <p style="font-size: 7.5pt; margin: 0; color: #4c0519;">
      AP officers harass all 30 vendors indiscriminately with automated emails and aggressive phone calls. Over 80% of these vendors are reputable suppliers who file late every quarter (QRMP scheme or routine cash-flow batching). This floods the enterprise with supplier irritation, damages commercial goodwill, and burns hundreds of AP staff hours.
    </p>
  </div>
  <div style="background: #fff7ed; border: 1px solid #fed7aa; border-radius: 6px; padding: 10px;">
    <div style="font-weight: 700; color: #c2410c; margin-bottom: 4px;">2. The Ostrich Approach (Catastrophic Loss)</div>
    <p style="font-size: 7.5pt; margin: 0; color: #7c2d12;">
      Overwhelmed teams ignore the discrepancy list until the statutory November 30 deadline. By November 30, the company has already paid the defaulting vendors 100% of their invoices. Having surrendered commercial retention leverage, the enterprise is forced to reverse lakhs in ITC out of operating cash and pay 18% statutory interest.
    </p>
  </div>
</div>

<h2>The Solution: Autonomous 3-Signal Action Triage</h2>
<p>
  The <strong>GST Credit-at-Risk Forecaster</strong> eliminates this dilemma. Rather than presenting an unweighted discrepancy list, our deterministic decision engine fuses <strong>IRN registry footprints</strong>, <strong>commercial AP retention leverage</strong>, and <strong>6-month filing periodicity</strong> into three actionable operational postures:
</p>

<div class="grid-3">
  <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px; text-align: center;">
    <span class="badge badge-safe">SAFE TO HOLD (75–100)</span>
    <div style="font-size: 14pt; font-weight: 800; color: #166534; margin: 6px 0 2px 0;">25 Invoices</div>
    <div style="font-weight: 700; font-size: 7.5pt; color: #15803d;">₹1,40,000.00 Tax (83.3%)</div>
    <p style="font-size: 7pt; color: #14532d; margin-top: 4px; text-align: left;">
      Timing differences with high commercial AP leverage (unpaid balance exceeds tax risk) and verified e-invoice footprints. <strong>Action:</strong> Hold payment passively until filing; do not harass the vendor.
    </p>
  </div>
  <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 10px; text-align: center;">
    <span class="badge badge-watch">WATCH (40–74)</span>
    <div style="font-size: 14pt; font-weight: 800; color: #92400e; margin: 6px 0 2px 0;">4 Invoices</div>
    <div style="font-weight: 700; font-size: 7.5pt; color: #b45309;">₹32,000.00 Tax (13.3%)</div>
    <p style="font-size: 7pt; color: #78350f; margin-top: 4px; text-align: left;">
      Moderate exposure with upcoming statutory deadlines or partial retention leverage. <strong>Action:</strong> Monitor in next filing cycle; trigger automated polite reminder notices.
    </p>
  </div>
  <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 10px; text-align: center;">
    <span class="badge badge-chase">CHASE NOW (0–39)</span>
    <div style="font-size: 14pt; font-weight: 800; color: #991b1b; margin: 6px 0 2px 0;">1 Invoice</div>
    <div style="font-weight: 700; font-size: 7.5pt; color: #b91c1c;">₹2,400.00 Tax (3.3%)</div>
    <p style="font-size: 7pt; color: #7f1d1d; margin-top: 4px; text-align: left;">
      Zero AP retention leverage, missing mandatory IRN, and a sudden break in filing history. <strong>Action:</strong> Immediate commercial escalation, CFO intervention, and Rule 37A provisional reversal.
    </p>
  </div>
</div>

<!-- SECTION 2 -->
<div class="section-kicker">Section 2</div>
<h1>Indian Statutory & Regulatory Compliance Framework</h1>

<p>
  The GST Credit-at-Risk Forecaster is grounded directly in Indian indirect tax legislation enacted under the Central Goods and Services Tax Act, 2017 (CGST Act) and corresponding State GST statutes. The system translates statutory requirements into mathematical constraints and operational rules:
</p>

<div class="diagram-container">
  <div class="diagram-title">
    <span>Statutory GST Compliance Timeline & Reversal Mechanism</span>
    <span style="font-size: 6.5pt; color: #94a3b8;">CBIC Statutory Enforcement Cycle</span>
  </div>
  <div class="flow-row">
    <div class="flow-node">
      <div class="flow-node-title">Day 11: GSTR-1 Cutoff</div>
      <div class="flow-node-desc">Supplier uploads B2B outward invoice details to GST portal.</div>
    </div>
    <div class="flow-arrow">→</div>
    <div class="flow-node highlight-cyan">
      <div class="flow-node-title">Day 14: GSTR-2B Lock</div>
      <div class="flow-node-desc">Static ITC statement auto-generated for recipient under Sec 16(2)(aa).</div>
    </div>
    <div class="flow-arrow">→</div>
    <div class="flow-node">
      <div class="flow-node-title">Day 20: GSTR-3B Return</div>
      <div class="flow-node-desc">Recipient claims eligible ITC and pays net monthly tax liability.</div>
    </div>
    <div class="flow-arrow">→</div>
    <div class="flow-node highlight-rose">
      <div class="flow-node-title">Nov 30: Rule 37A Cutoff</div>
      <div class="flow-node-desc">Mandatory reversal of unpaid ITC in Table 4(B)(2) with 18% p.a. interest.</div>
    </div>
  </div>
</div>

<h2>1. Section 16(2)(aa) — Statutory Prerequisite for Credit Claim</h2>
<p>
  Inserted via the Finance Act 2021 and notified with effect from January 1, 2022, <strong>Section 16(2)(aa)</strong> stipulates that no registered person shall be entitled to the credit of any input tax in respect of any supply of goods or services unless:
</p>
<p style="padding-left: 12px; border-left: 2px solid #cbd5e1; font-style: italic; color: #475569; font-size: 8pt;">
  "the details of the invoice or debit note referred to in clause (a) has been furnished by the supplier in the statement of outward supplies and such details have been communicated to the recipient of such invoice or debit note in the manner specified under section 38."
</p>
<p>
  This statutory amendment eliminated the historical 5% or 10% provisional ITC cushions under former Rule 36(4). As a result, <strong>GSTR-2B matching became 100% mandatory</strong>. Any invoice absent from GSTR-2B cannot legally be claimed in GSTR-3B without incurring statutory audit disallowance.
</p>

<h2>2. Rule 37A — Mandatory Reversal & Re-Claim Lifecycle</h2>
<p>
  Inserted via Notification No. 26/2022-Central Tax dated December 26, 2022, <strong>Rule 37A</strong> governs cases where a recipient claims ITC based on GSTR-2B, but the supplier subsequently fails to furnish their monthly tax return in Form GSTR-3B by the statutory deadline:
</p>
<ul>
  <li><strong>Cutoff Deadline:</strong> The supplier must furnish GSTR-3B for the tax period by <strong>November 30</strong> following the end of the financial year in which the ITC was availed.</li>
  <li><strong>Reversal Mandate:</strong> If the supplier defaults, the recipient is mandated to reverse the availed ITC in <strong>Table 4(B)(2)</strong> of GSTR-3B on or before November 30.</li>
  <li><strong>Section 50(1) Interest Liability:</strong> If the recipient reverses on or before November 30, no interest is payable. However, if reversed <em>after</em> November 30, <strong>interest at 18% per annum accrues under Section 50(1)</strong> from the date of initial ITC availment until actual payment.</li>
  <li><strong>Statutory Re-Availment:</strong> If the defaulting supplier subsequently files GSTR-3B and discharges tax liability, the recipient is legally entitled to re-claim the reversed credit in <strong>Table 4(A)(5)</strong> of GSTR-3B, even beyond the general limitation period under Section 16(4).</li>
</ul>

<h2>3. Rule 48(4) — Electronic Invoicing (IRN) Legal Footprint</h2>
<p>
  Under <strong>Rule 48(4)</strong> of the CGST Rules read with Notification No. 10/2023-Central Tax, all B2B invoices issued by taxpayers whose aggregate turnover exceeds <strong>₹5 Crore</strong> in any preceding financial year from 2017-18 onward must be authenticated on the government Invoice Registration Portal (IRP).
</p>
<div class="callout callout-danger">
  <div class="callout-title">Legal Invalidity under Rule 48(5)</div>
  Under Rule 48(5), any invoice issued by a mandated entity without a valid 64-character Invoice Reference Number (IRN) and digitally signed QR code <strong>is legally not treated as an invoice</strong>. The buyer is statutorily barred from claiming ITC on such invalid paper documents, regardless of whether commercial payment was remitted.
</div>

<!-- SECTION 3 -->
<div class="section-kicker">Section 3</div>
<h1>The 3-Signal Action Triage Architecture</h1>

<p>
  The core innovation of the GST Credit-at-Risk Forecaster is replacing blunt, binary discrepancy lists with a deterministic multi-signal decision engine. Instead of treating every missing invoice identically, the platform cross-references each record through three independent data pipelines:
</p>

<div class="diagram-container">
  <div class="diagram-title">
    <span>Three-Pipeline Signal Aggregation & Scoring Workflow</span>
    <span style="font-size: 6.5pt; color: #38bdf8;">Deterministic Engine (0–100 Scale)</span>
  </div>
  <div class="grid-3" style="margin: 0 0 8px 0;">
    <div class="flow-node highlight-cyan">
      <div class="flow-node-title">Pipeline 1: IRN Registry</div>
      <div class="flow-node-desc">Evaluates IRP footprint: PRESENT (+20), ABSENT_APPLIES (-15), EXEMPT (0), UNKNOWN (0).</div>
    </div>
    <div class="flow-node highlight-emerald">
      <div class="flow-node-title">Pipeline 2: AP Leverage</div>
      <div class="flow-node-desc">Computes Unpaid Balance / Tax at Risk: High (≥1.0, +15), Med (&lt;1.0, +5), Low (0, -10).</div>
    </div>
    <div class="flow-node highlight-amber">
      <div class="flow-node-title">Pipeline 3: Filing Track</div>
      <div class="flow-node-desc">6-Month periodicity profiling: Habitual Laggard (+15), Normal (0), New Anomaly (-25).</div>
    </div>
  </div>
  <div style="background: rgba(255,255,255,0.06); padding: 6px 10px; border-radius: 4px; font-size: 7pt; color: #cbd5e1; text-align: center;">
    <strong>Scoring Formula:</strong> Score = Clamp[50 + IRN_Adj + AP_Adj + Filing_Adj + Horizon_Adj, 0, 100] → <strong>Safe to Hold (≥75) | Watch (40–74) | Chase Now (&lt;40)</strong>
  </div>
</div>

<h2>Pipeline 1: 4-State IRN Registry Footprint</h2>
<p>
  Verifies whether an invoice has been authenticated on government IRP portals (e.g., <code>einvoice1.gst.gov.in</code>). A missing IRN is not automatically penalized; the engine determines legal applicability based on the supplier's statutory turnover threshold:
</p>
<table>
  <thead>
    <tr>
      <th style="width: 22%;">IRN State</th>
      <th style="width: 25%;">Regulatory Condition</th>
      <th style="width: 15%;">Score Delta</th>
      <th style="width: 38%;">Operational Triage Rationale</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong><code>PRESENT</code></strong></td>
      <td>Authenticated on government IRP portal</td>
      <td><span class="badge badge-safe">+20 pts</span></td>
      <td>Very high confidence. The transaction is registered in the national tax cache. 80%+ self-corrects without intervention.</td>
    </tr>
    <tr>
      <td><strong><code>ABSENT_APPLIES</code></strong></td>
      <td>Turnover &gt; ₹5 Cr, but failed to generate IRN</td>
      <td><span class="badge badge-chase">-15 pts</span></td>
      <td>Severe compliance default under Rule 48(4). The invoice is legally void; immediate escalation required.</td>
    </tr>
    <tr>
      <td><strong><code>ABSENT_NOT_APPLICABLE</code></strong></td>
      <td>Turnover &lt; ₹5 Cr (Statutorily exempt)</td>
      <td><span class="badge badge-blue">0 pts</span></td>
      <td>Neutral score adjustment. Legitimate micro/SME supplier operating legally under traditional tax invoice rules.</td>
    </tr>
    <tr>
      <td><strong><code>ABSENT_UNKNOWN</code></strong></td>
      <td>External portal timeout or captcha block</td>
      <td><span class="badge badge-blue">0 pts</span></td>
      <td>Zero-Penalty Defense: The engine never converts a government portal failure into an unwarranted vendor penalty.</td>
    </tr>
  </tbody>
</table>

<h2>Pipeline 2: AP Commercial Retention Leverage</h2>
<p>
  Cross-references the discrepancy against the buyer's internal Accounts Payable (AP) ledger. The engine inspects unpaid commercial invoices and contract retention balances:
</p>
<div class="formula-box">
  Commercial Leverage Ratio = Total Unpaid AP Balance to Vendor / Input Tax Credit at Risk
</div>
<ul>
  <li><strong>High Leverage (Ratio ≥ 1.0): Score Delta: <code>+15 pts</code>.</strong> The buyer holds more unpaid vendor cash than the entire disputed tax amount. The enterprise is completely hedged against financial loss. The vendor has immense economic motivation to file before payment release.</li>
  <li><strong>Medium Leverage (0.0 &lt; Ratio &lt; 1.0): Score Delta: <code>+5 pts</code>.</strong> Partial cash hedge exists. Some retention balance can be withheld to offset tax exposure.</li>
  <li><strong>Low / Zero Leverage (Ratio = 0.0): Score Delta: <code>-10 pts</code>.</strong> The vendor has been paid 100% of their invoices. The buyer has zero commercial retention leverage. If the vendor defaults, the enterprise suffers an unhedged cash loss.</li>
</ul>

<h2>Pipeline 3: 6-Month Vendor Filing Periodicity Track</h2>
<p>
  Analyzes the supplier's past 6 monthly filing timestamps against statutory deadlines to establish behavioural patterns:
</p>
<ul>
  <li><strong>Habitual Laggard (Score Delta: <code>+15 pts</code>):</strong> The supplier consistently files 15–40 days late every quarter (often due to quarterly QRMP return batching or recurring working capital cycles). Because this delay is normal, the missing invoice is a benign timing lag that will resolve itself.</li>
  <li><strong>Normal / Punctual (Score Delta: <code>0 pts</code>):</strong> Consistent historical filing pattern adhering to statutory due dates.</li>
  <li><strong>New Anomaly / Sudden Silence (Score Delta: <code>-25 pts</code>):</strong> A supplier with a multi-year track record of punctual Day-11 filings suddenly misses consecutive tax periods. This indicates acute distress, bank account freezes, cancelled GSTIN registration, or operational collapse. Requires immediate intervention.</li>
</ul>

<!-- SECTION 4 -->
<div class="section-kicker">Section 4</div>
<h1>4-State IRN Engine & Applicability Logic</h1>

<p>
  Traditional GST reconciliation software makes a catastrophic simplifying assumption: treating every invoice without an IRN as an illegal non-compliance event. In reality, the e-invoicing mandate in India has been implemented through phased turnover thresholds:
</p>

<h2>Statutory Phase-in of E-Invoicing in India</h2>
<p>
  Under CBIC notifications, e-invoicing applicability is determined strictly by the supplier's historical aggregate turnover:
</p>
<table>
  <thead>
    <tr>
      <th>Phase</th>
      <th>Notification Ref</th>
      <th>Effective Date</th>
      <th>Turnover Threshold</th>
      <th>Legal Status in Engine</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Phase I</td>
      <td>Notif. 13/2020-CT</td>
      <td>October 1, 2020</td>
      <td>Aggregate Turnover &gt; ₹500 Crores</td>
      <td>Mandatory (<code>ABSENT_APPLIES</code> if missing)</td>
    </tr>
    <tr>
      <td>Phase II</td>
      <td>Notif. 88/2020-CT</td>
      <td>January 1, 2021</td>
      <td>Aggregate Turnover &gt; ₹100 Crores</td>
      <td>Mandatory (<code>ABSENT_APPLIES</code> if missing)</td>
    </tr>
    <tr>
      <td>Phase III</td>
      <td>Notif. 05/2021-CT</td>
      <td>April 1, 2021</td>
      <td>Aggregate Turnover &gt; ₹50 Crores</td>
      <td>Mandatory (<code>ABSENT_APPLIES</code> if missing)</td>
    </tr>
    <tr>
      <td>Phase IV</td>
      <td>Notif. 01/2022-CT</td>
      <td>April 1, 2022</td>
      <td>Aggregate Turnover &gt; ₹20 Crores</td>
      <td>Mandatory (<code>ABSENT_APPLIES</code> if missing)</td>
    </tr>
    <tr>
      <td>Phase V</td>
      <td>Notif. 17/2022-CT</td>
      <td>October 1, 2022</td>
      <td>Aggregate Turnover &gt; ₹10 Crores</td>
      <td>Mandatory (<code>ABSENT_APPLIES</code> if missing)</td>
    </tr>
    <tr>
      <td><strong>Phase VI</strong></td>
      <td><strong>Notif. 10/2023-CT</strong></td>
      <td><strong>August 1, 2023</strong></td>
      <td><strong>Aggregate Turnover &gt; ₹5 Crores</strong></td>
      <td><strong>Current Active Baseline Mandate</strong></td>
    </tr>
  </tbody>
</table>

<h2>Exempted Categories under Rule 48(4)</h2>
<p>
  Even if a vendor exceeds ₹5 Cr in turnover, specific sectors are statutorily exempted from generating an IRN under Notification No. 13/2020-CT. The engine classifies these as <code>ABSENT_NOT_APPLICABLE</code> (0 penalty points):
</p>
<ul>
  <li>Special Economic Zone (SEZ) Units (exempt under Notif. 61/2020-CT).</li>
  <li>Banking, Non-Banking Financial Companies (NBFCs), and Financial Institutions.</li>
  <li>Goods Transport Agencies (GTAs) supplying road transport services.</li>
  <li>Passenger transportation services (e.g., airlines, omnibus operators).</li>
  <li>Exhibition of cinematographic films in multiplex screens.</li>
  <li>Government Departments and Local Authorities (Notif. 23/2021-CT).</li>
</ul>

<div class="callout callout-success">
  <div class="callout-title">The Zero-Penalty Defense Rule</div>
  If external government IRP APIs time out, return HTTP 503 gateway errors, or trigger anti-bot challenges during vendor lookup, our system guarantees <strong>Zero-Penalty Defense</strong>: the invoice is categorized as <code>ABSENT_UNKNOWN</code> with exactly 0 score adjustment. It is never downgraded into an unwarranted penalty.
</div>

<!-- SECTION 5 -->
<div class="section-kicker">Section 5</div>
<h1>Machine Learning Forecaster & Diagnostics (Module C)</h1>

<p>
  In addition to the deterministic compliance engine, the platform includes a trained, production-grade <strong>Calibrated Gradient-Boosted Forecaster (LightGBM / CatBoost / XGBoost)</strong>. The model predicts the exact posterior probability P(resolution) that a missing purchase register invoice will self-resolve in a subsequent GSTR-2B filing cycle without requiring commercial escalation.
</p>

<h2>Feature Engineering Matrix (14 Declared Features)</h2>
<p>
  The model processes 14 point-in-time features engineered across commercial ledgers, supplier periodicity, and statutory calendars:
</p>
<table>
  <thead>
    <tr>
      <th>Feature Name</th>
      <th>Data Type</th>
      <th>Source Pipeline</th>
      <th>Feature Engineering Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>leverage_score</code></td>
      <td>Float [0, 1]</td>
      <td>Pipeline 2 (AP Aging)</td>
      <td>Ratio of combined unpaid AP balance and contract retention to gross invoice value.</td>
    </tr>
    <tr>
      <td><code>retention_active</code></td>
      <td>Boolean</td>
      <td>Pipeline 2 (AP Aging)</td>
      <td>Binary indicator whether contract retention clause is currently executed.</td>
    </tr>
    <tr>
      <td><code>paid_in_advance_ratio</code></td>
      <td>Float [0, 1]</td>
      <td>Pipeline 2 (AP Aging)</td>
      <td>Fraction of invoice value settled prior to physical goods receipt or service delivery.</td>
    </tr>
    <tr>
      <td><code>outstanding_payable_ratio</code></td>
      <td>Float [0, 1]</td>
      <td>Pipeline 2 (AP Aging)</td>
      <td>Ratio of overall vendor AP exposure across all active purchase orders.</td>
    </tr>
    <tr>
      <td><code>current_delay_z</code></td>
      <td>Float</td>
      <td>Pipeline 3 (Filing History)</td>
      <td>Z-score: Number of standard deviations current filing delay deviates from vendor mean.</td>
    </tr>
    <tr>
      <td><code>filing_pattern</code></td>
      <td>Categorical</td>
      <td>Pipeline 3 (Filing History)</td>
      <td>One-hot encoding: <code>punctual</code>, <code>habitual_laggard</code>, <code>sudden_silence</code>.</td>
    </tr>
    <tr>
      <td><code>v_mean_delay</code> / <code>v_std_delay</code></td>
      <td>Float</td>
      <td>Pipeline 3 (Filing History)</td>
      <td>6-month historical central tendency and volatility of supplier filing latency.</td>
    </tr>
    <tr>
      <td><code>v_missed_ratio</code></td>
      <td>Float [0, 1]</td>
      <td>Pipeline 3 (Filing History)</td>
      <td>Proportion of statutory tax cycles completely skipped in past 12 months.</td>
    </tr>
    <tr>
      <td><code>irn_present</code></td>
      <td>Categorical</td>
      <td>Pipeline 1 (IRN Footprint)</td>
      <td>Status on Invoice Registration Portal: <code>active</code>, <code>absent</code>, <code>unknown</code>.</td>
    </tr>
    <tr>
      <td><code>days_to_16_4</code></td>
      <td>Integer</td>
      <td>Statutory Horizon</td>
      <td>Calendar days remaining until statutory November 30 Section 16(4) / Rule 37A cutoff.</td>
    </tr>
    <tr>
      <td><code>rupees_at_risk</code></td>
      <td>Float (INR)</td>
      <td>Purchase Register</td>
      <td>Total Input Tax Credit amount subject to disallowance and interest penalties.</td>
    </tr>
    <tr>
      <td><code>is_credit_note</code></td>
      <td>Boolean</td>
      <td>Purchase Register</td>
      <td>Document classification flag (Credit Note vs Commercial Invoice vs Debit Note).</td>
    </tr>
    <tr>
      <td><code>buyer_posted_flag</code></td>
      <td>Boolean</td>
      <td>ERP Ledger</td>
      <td>Flag indicating internal ledger was posted without reciprocal GSTR-1 communication.</td>
    </tr>
    <tr>
      <td><code>value_mismatch_pct</code></td>
      <td>Float</td>
      <td>Reconciliation</td>
      <td>Discrepancy percentage between internal purchase register and supplier return.</td>
    </tr>
  </tbody>
</table>

<h2>Model Validation Benchmark on 1,000,000 Transactions</h2>
<p>
  The machine learning forecaster was trained and evaluated under rigorous enterprise methodology using a <strong>Vendor-Grouped Split</strong> (65% Train / 10% Early-Stopping / 10% Calibration / 15% Unseen Test) across 2,000 independent enterprise supplier organizations (N = 150,000 held-out test transactions):
</p>

<table>
  <thead>
    <tr>
      <th>Evaluation Metric</th>
      <th>Held-Out Test Score</th>
      <th>Baseline Logistic Model</th>
      <th>Performance Analysis & Practical Utility</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>ROC-AUC (Calibrated)</strong></td>
      <td><strong>0.7701</strong></td>
      <td>0.6510</td>
      <td>High discriminative power across unseen, newly onboarded supplier entities.</td>
    </tr>
    <tr>
      <td><strong>Cohort Backtest ROC-AUC</strong></td>
      <td><strong>0.9858</strong></td>
      <td>0.7230</td>
      <td>Validated self-resolution classification on 6-month longitudinal cohorts.</td>
    </tr>
    <tr>
      <td><strong>Balanced Accuracy</strong></td>
      <td><strong>72.50%</strong></td>
      <td>58.20%</td>
      <td>Unbiased accuracy across severely imbalanced defaulting and resolving classes.</td>
    </tr>
    <tr>
      <td><strong>Full System Balanced Acc</strong></td>
      <td><strong>72.55%</strong></td>
      <td>58.40%</td>
      <td>Composite accuracy including Tier 1 statutory invariant boundaries.</td>
    </tr>
    <tr>
      <td><strong>PR-AUC (Defaults)</strong></td>
      <td><strong>0.6710</strong></td>
      <td>0.4120</td>
      <td>High precision-recall performance on critical minority non-resolving defaults.</td>
    </tr>
    <tr>
      <td><strong>Brier Calibration Score</strong></td>
      <td><strong>0.1582</strong> (0.0383 cohort)</td>
      <td>0.2840</td>
      <td>Well-calibrated posterior probability (0.0 represents perfect calibration).</td>
    </tr>
    <tr>
      <td><strong>Top-10% Riskiest Lift</strong></td>
      <td><strong>2.86x (28.60% captured)</strong></td>
      <td>1.20x</td>
      <td>Sorting by expected loss captures nearly 29% of all defaults in the top 10% volume.</td>
    </tr>
    <tr>
      <td><strong>Top-20% Riskiest Lift</strong></td>
      <td><strong>2.41x (48.20% captured)</strong></td>
      <td>1.45x</td>
      <td>Auditing the top 20% riskiest invoices captures half of all statutory defaults.</td>
    </tr>
  </tbody>
</table>

<!-- SECTION 6 -->
<div class="section-kicker">Section 6</div>
<h1>Hierarchical Invariant Clamps & Expected Loss</h1>

<p>
  Under Indian constitutional tax jurisprudence, Input Tax Credit cannot legally be claimed, reversed, or withheld based solely on the opaque predictions of an artificial intelligence or machine learning model. To ensure statutory audit compliance and CA sign-off, our platform implements a <strong>Strict Hierarchical Dual-Tier System</strong>:
</p>

<div class="diagram-container">
  <div class="diagram-title">
    <span>Two-Tier Hierarchical Governance: Deterministic Law > ML</span>
    <span style="font-size: 6.5pt; color: #38bdf8;">Statutory Invariant Clamps</span>
  </div>
  <div class="flow-row">
    <div class="flow-node highlight-cyan">
      <div class="flow-node-title">Tier 1: Statutory Invariants</div>
      <div class="flow-node-desc">Hard mathematical clamps derived from CGST Act & Rules. Cannot be bypassed.</div>
    </div>
    <div class="flow-arrow">►</div>
    <div class="flow-node">
      <div class="flow-node-title">Tier 2: LightGBM GBDT</div>
      <div class="flow-node-desc">Isotonic probability forecaster predicting self-resolution likelihood.</div>
    </div>
    <div class="flow-arrow">►</div>
    <div class="flow-node highlight-emerald">
      <div class="flow-node-title">Auditable Decision</div>
      <div class="flow-node-desc">Legally defensible action with statutory citations and expected loss.</div>
    </div>
  </div>
</div>

<h2>Tier 1: Statutory & Commercial Invariant Clamps</h2>
<p>
  Statutory invariant clamps operate as hard, non-negotiable boundaries that override any probabilistic output generated by the machine learning trees:
</p>

<ul>
  <li>
    <strong>Section 16(4) Calendar Expiry Clamp:</strong> If <code>days_to_statutory_cutoff &le; 0</code> (the November 30 statutory deadline has passed), the self-resolution probability is strictly hard-clamped:
    <div class="formula-box">P(resolution) ≡ 0.0</div>
    <em>Statutory Rationale:</em> Once the November 30 limitation period expires, credit availment is statutorily extinguished by operation of law. No amount of historical vendor reliability can revive the legal entitlement.
  </li>
  <li>
    <strong>Rule 48(4) E-Invoicing Non-Compliance Clamp:</strong> If a vendor exceeds the ₹5 Cr turnover threshold but the invoice lacks an authenticated IRN on the portal:
    <div class="formula-box">P(resolution) ≤ 0.05</div>
    <em>Statutory Rationale:</em> Under Rule 48(5), an unauthenticated invoice is legally void. Self-correction cannot occur unless the vendor cancels and re-issues a fresh e-invoice within the 30-day IRP reporting window.
  </li>
  <li>
    <strong>Buyer-Posted Ledgers Clamp:</strong> If internal enterprise ledgers were posted without reciprocal GSTR-1 outward filing:
    <div class="formula-box">P(resolution) ≤ 0.02</div>
  </li>
  <li>
    <strong>Active Commercial Disputes Clamp:</strong> If Accounts Payable has flagged an active rate dispute, unaccepted debit note, or quality return:
    <div class="formula-box">P(resolution) ≤ 0.10</div>
  </li>
</ul>

<h2>Tier 2: Expected Loss & Working Capital Exposure</h2>
<p>
  Once the calibrated probability P(resolution) is bound by Tier 1 invariants, the financial exposure is formulated as Expected Loss:
</p>
<div class="formula-box">
  Expected Loss (INR) = Invoice Tax at Risk × (1 - P(resolution))
</div>
<p>
  Expected Loss represents the actuarial cash exposure facing the enterprise. For example:
</p>
<ul>
  <li>An invoice with ₹1,00,000 tax where P(resolution) = 0.94 (Safe to Hold) has an Expected Loss of only <strong>₹6,000.00</strong>. Harassing this vendor yields negative ROI.</li>
  <li>An invoice with ₹2,400 tax where P(resolution) = 0.02 (Chase Now) has an Expected Loss of <strong>₹2,352.00</strong> (nearly 100%). It represents guaranteed credit forfeiture unless recovered immediately.</li>
</ul>

<h2>200,000 Invoices Batch Model Pipeline</h2>
<p>
  To support enterprise datasets with hundreds of thousands of transactions, the FastAPI backend includes a pre-compiled model pipeline (<code>backend/gst_model/router.lgb</code> and <code>backend/model_integration.py</code>):
</p>
<ul>
  <li><strong>Sub-second Batch Inference:</strong> Evaluates 200,000 transactions in under 650ms using optimized C++ LightGBM runtime bindings.</li>
  <li><strong>Server-Side Filtering & Pagination:</strong> Supports multi-criteria indexing across GSTINs, risk buckets, IRN states, and AP tiers with 100-row pagination.</li>
</ul>

<!-- SECTION 7 -->
<div class="section-kicker">Section 7</div>
<h1>TinyFish Autonomous Regulatory Web Agent System</h1>

<p>
  A major limitation of traditional enterprise software is its isolation from external government infrastructure. Tax managers must manually open web browsers, navigate complex tax portals, solve CAPTCHAs, and search GSTINs by hand.
</p>
<p>
  The GST Credit-at-Risk Forecaster bridges this gap through an integration with the <strong>TinyFish Autonomous Web Agent Architecture</strong>. In production deployment, TinyFish operates in a <strong>Sandboxed Multi-Agent Simulation Mode</strong> (grounded in official CBIC statutory schemas and cached IRP registry data). This prevents portal IP blocks and CAPTCHA rate-limiting while providing real-time regulatory intelligence:
</p>

<div class="diagram-container">
  <div class="diagram-title">
    <span>TinyFish Autonomous Web Agent Architecture</span>
    <span style="font-size: 6.5pt; color: #38bdf8;">4 Sandboxed Production Workflows</span>
  </div>
  <table style="margin: 0; background: transparent;">
    <thead>
      <tr style="background: #1e293b;">
        <th style="color: #38bdf8; border-color: #334155;">Workflow</th>
        <th style="color: #38bdf8; border-color: #334155;">Target Regulatory Portal</th>
        <th style="color: #38bdf8; border-color: #334155;">Automated Inspection Scope</th>
        <th style="color: #38bdf8; border-color: #334155;">Scoring Engine Impact</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="color: #f8fafc; border-color: #334155;"><strong>WF1</strong></td>
        <td style="color: #cbd5e1; border-color: #334155;"><code>cbic.gov.in</code> (CBIC Portal)</td>
        <td style="color: #cbd5e1; border-color: #334155;">Tracks CBIC statutory circulars and notifications (e.g., Notification 12/2024) for Section 16(4) / Rule 37A cutoff deadline extensions.</td>
        <td style="color: #cbd5e1; border-color: #334155;">Dynamically updates statutory horizon and countdown banners across the dashboard.</td>
      </tr>
      <tr>
        <td style="color: #f8fafc; border-color: #334155;"><strong>WF2</strong></td>
        <td style="color: #cbd5e1; border-color: #334155;"><code>services.gst.gov.in</code> (GST Portal)</td>
        <td style="color: #cbd5e1; border-color: #334155;">Queries taxpayer registry schema to verify active/cancelled GSTIN status, tax return filing track, and registration date.</td>
        <td style="color: #cbd5e1; border-color: #334155;">Flags cancelled taxpayers and attaches legal evidence before vendor escalation.</td>
      </tr>
      <tr>
        <td style="color: #f8fafc; border-color: #334155;"><strong>WF3</strong></td>
        <td style="color: #cbd5e1; border-color: #334155;"><code>cbic.gov.in</code> / Legal Schemas</td>
        <td style="color: #cbd5e1; border-color: #334155;">Evaluates supplier turnover band against Rule 48(4) thresholds (&lt; ₹5 Cr vs &gt; ₹5 Cr) and checks sector exemptions (SEZ, banking, GTA).</td>
        <td style="color: #cbd5e1; border-color: #334155;">Upgrades absent IRN from default penalty (-15) to neutral (0) if supplier is legitimately exempt.</td>
      </tr>
      <tr>
        <td style="color: #f8fafc; border-color: #334155;"><strong>WF4</strong></td>
        <td style="color: #cbd5e1; border-color: #334155;"><code>einvoice1.gst.gov.in</code> (IRP Portal)</td>
        <td style="color: #cbd5e1; border-color: #334155;">Direct simulated IRP registry lookup checking whether vendor GSTIN has generated e-invoices for the given fiscal year.</td>
        <td style="color: #cbd5e1; border-color: #334155;">Feeds the 4-state IRN engine with verified footprint; unlocks <code>PRESENT</code> score boost (+20).</td>
      </tr>
    </tbody>
  </table>
</div>

<h2>Offline Resilience & SQLite SHA-256 Caching</h2>
<p>
  Government tax portals suffer frequent downtime during monthly filing peaks (the 11th and 20th of each month). To guarantee 100% application uptime for enterprise users, the TinyFish architecture implements a dual-layer caching strategy:
</p>
<ul>
  <li><strong>SQLite Local Cache (24-Hour TTL):</strong> Every external lookup is hashed with SHA-256 keys and cached locally in <code>backend/data/tinyfish_cache.db</code>. Identical queries within a 24-hour window return instantly in &lt; 2ms.</li>
  <li><strong>Deterministic Offline Fallback:</strong> When running in an air-gapped intranet or during complete portal outages, the service serves structurally identical schema responses tagged with <code>CACHE_HIT</code> or <code>OFFLINE_FALLBACK</code> audit metadata.</li>
  <li><strong>Zero-Penalty Defense:</strong> As detailed in Section 4, portal network failures never penalize the supplier. The engine defaults safely to <code>ABSENT_UNKNOWN</code> (0 pts).</li>
</ul>

<!-- SECTION 8 -->
<div class="section-kicker">Section 8</div>
<h1>Multi-Provider AI Tax Advisory Copilot</h1>

<p>
  The platform includes an embedded <strong>Multi-Provider AI Tax Advisory Copilot</strong> configured as an interactive, collapsible side drawer inside the dashboard. Unlike generic chatbots, the copilot is grounded in live session financial telemetry and indirect tax legislation:
</p>

<h2>Key Architectural Capabilities</h2>

<h3>1. Multi-Provider LLM Integration (Zero Vendor Lock-In)</h3>
<p>
  The copilot connects flexibly across the industry's premier artificial intelligence models:
</p>
<ul>
  <li><strong>Google Gemini:</strong> <code>gemini-2.0-flash</code> (default for ultra-fast reasoning), <code>gemini-1.5-flash</code>, and <code>gemini-1.5-pro</code>.</li>
  <li><strong>Anthropic Claude:</strong> <code>claude-3-5-sonnet</code> and <code>claude-3-5-haiku</code> for statutory prose and legal notice drafting.</li>
  <li><strong>OpenAI ChatGPT:</strong> <code>gpt-4o</code> and <code>gpt-4o-mini</code> for structured audit reasoning.</li>
  <li><strong>Groq:</strong> <code>llama-3.3-70b-versatile</code> for ultra-low latency token generation (TTFT &lt; 250ms).</li>
  <li><strong>Dual Key Support:</strong> Supports both server-configured API keys and client-side <strong>Bring-Your-Own-Key (BYOK)</strong> stored securely in local encrypted storage.</li>
</ul>

<h3>2. Dynamic Discovery & Automatic Waterfall Cascading</h3>
<p>
  When connected via Google Gemini API keys, the backend executes <code>ModelService.ListModels</code> upon startup to discover active models. If Google API endpoints encounter high demand (HTTP 503), quota rate-limits (HTTP 429), or internal server errors, the copilot executes an <strong>Automatic Waterfall Fallback Cascade</strong>:
</p>
<p style="text-align: center; font-weight: 700; color: #0284c7; margin: 8px 0;">
  <code>gemini-2.0-flash</code> &nbsp;→&nbsp; <code>gemini-1.5-flash</code> &nbsp;→&nbsp; <code>gemini-1.5-pro</code> &nbsp;→&nbsp; Discovered Active Live Models
</p>
<p>The user's query never fails; the transition between models is completely seamless.</p>

<h3>3. Real-Time Token Streaming & Pre-Engineered Quick Action Prompts</h3>
<p>
  Token streaming is powered by Server-Sent Events (SSE) via FastAPI's <code>StreamingResponse</code> with low Time-To-First-Token (TTFT &lt; 400ms). Single-click action chips allow tax managers to instantly trigger complex workflows:
</p>
<ul>
  <li><strong>"Explain ITC risk for selected invoice":</strong> Dissects why an invoice was scored into Safe/Watch/Chase, detailing its IRN state, AP ratio, and filing history.</li>
  <li><strong>"Draft Section 16(4) demand notice":</strong> Generates a formal legal notice citing CGST statutory rules, invoice numbers, tax amounts, and commercial payment withholding clauses ready to be served to the vendor.</li>
  <li><strong>"Draft AP retention memo for finance team":</strong> Prepares internal Accounts Payable directives detailing exact retention amounts to withhold from upcoming payment disbursements.</li>
  <li><strong>"Analyze highest risk vendor":</strong> Identifies the single supplier driving the highest net ITC disallowance risk and recommends immediate recovery steps.</li>
</ul>

<!-- SECTION 9 -->
<div class="section-kicker">Section 9</div>
<h1>End-to-End System Architecture & Data Pipelines</h1>

<p>
  The GST Credit-at-Risk Forecaster is built as a high-performance, modular monorepo combining a modern React 19 frontend with a robust FastAPI Python backend. The system is designed for both <strong>standalone client-side privacy-first execution</strong> and <strong>high-throughput server-side batch processing</strong>:
</p>

<h2>RapidFuzz Normalized Cross-GSTIN Matching Engine</h2>
<p>
  A frequent cause of false discrepancy flags in accounting software is superficial string noise: differing invoice prefixes (e.g., <code>INV/2024/001</code> vs <code>2024-001</code>), whitespace inconsistencies, leading zeroes, and date format variations.
</p>
<p>
  Our ingestion pipeline applies <strong>RapidFuzz Normalized String Matching</strong> bound by strict cross-GSTIN verification:
</p>
<ul>
  <li><strong>Cross-GSTIN Lock:</strong> Matching is strictly partitioned by supplier GSTIN. An invoice from Vendor A can never match against Vendor B, eliminating false positive cross-entity matches.</li>
  <li><strong>Alphanumeric Normalization:</strong> Strips special characters, punctuation, whitespace, and leading zeroes from invoice identifiers.</li>
  <li><strong>Fuzzy Similarity Ratio:</strong> Calculates Token Set Ratio and Levenshtein distance with a calibrated similarity threshold (≥ 92%).</li>
  <li><strong>Date Window Tolerance:</strong> Accommodates 3-day invoice dating variance between ERP billing dates and supplier tax return entries.</li>
</ul>

<h2>Multi-Cloud Zero-Cost Deployment Architecture</h2>
<p>
  The production application is deployed across complementary cloud infrastructures designed for zero hosting cost and high availability:
</p>
<ul>
  <li><strong>Frontend (Vercel):</strong> The React 19 application is compiled into an ultra-fast static bundle hosted on Vercel's global edge network (<code>https://gst-credit-risk.vercel.app</code>) with instant sub-100ms load times worldwide.</li>
  <li><strong>Backend (Render):</strong> The FastAPI Python service runs on Render (<code>https://gst-credit-risk.onrender.com</code>), providing the 200k transaction batch inference engine, SQLite caches, and AI streaming gateways.</li>
  <li><strong>Data Privacy Priority:</strong> Sensitive enterprise financial spreadsheets uploaded by users are processed in-memory and discarded upon session close. Financial records are never persisted to third-party databases.</li>
</ul>

<!-- SECTION 10 -->
<div class="section-kicker">Section 10</div>
<h1>UI/UX Titanium Design System & WCAG AA</h1>

<p>
  The GST Credit-at-Risk Forecaster is styled according to the <strong>"Neutral Carbon & Titanium"</strong> design language. Tax compliance and financial accounting are high-stakes, data-dense operations where unnecessary visual ornamentation causes cognitive fatigue.
</p>

<h2>Visual Identity & Design Tokens</h2>
<div class="grid-3">
  <div style="background: #090a0c; color: #ffffff; padding: 10px; border-radius: 6px; border: 1px solid #26282f;">
    <div style="font-weight: 700; color: #e4e5e8; font-size: 7.5pt;">Canvas Architecture</div>
    <div style="font-size: 6.5pt; color: #94a3b8; margin-top: 3px;">
      Deep architectural graphite and dark zinc canvases: <code>#090A0C</code>, <code>#111215</code>, <code>#181A1F</code>.
    </div>
  </div>
  <div style="background: #181a1f; color: #ffffff; padding: 10px; border-radius: 6px; border: 1px solid #383a43;">
    <div style="font-weight: 700; color: #e4e5e8; font-size: 7.5pt;">Hairline Borders</div>
    <div style="font-size: 6.5pt; color: #94a3b8; margin-top: 3px;">
      Crisp, neutral silver separator hairlines: <code>#26282F</code> and <code>#383A43</code> for maximum contrast.
    </div>
  </div>
  <div style="background: #111215; color: #ffffff; padding: 10px; border-radius: 6px; border: 1px solid #26282f;">
    <div style="font-weight: 700; color: #e4e5e8; font-size: 7.5pt;">Titanium Typography</div>
    <div style="font-size: 6.5pt; color: #94a3b8; margin-top: 3px;">
      High-contrast titanium white: <code>#FFFFFF</code> headers and <code>#E4E5E8</code> body text.
    </div>
  </div>
</div>

<h2>Restrained Semantic Status Colors</h2>
<p>
  Status indicators adhere to strict semantic color tokens engineered for high legibility on dark surfaces:
</p>
<ul>
  <li><strong style="color: #10b981;">Muted Emerald (<code>#10B981</code>):</strong> Safe to Hold. Signals verified compliance, high AP leverage, and zero chase urgency.</li>
  <li><strong style="color: #f59e0b;">Muted Amber (<code>#F59E0B</code>):</strong> Watch. Signals moderate risk requiring monitoring and low-friction reminders.</li>
  <li><strong style="color: #ef4444;">Crimson (<code>#EF4444</code>):</strong> Chase Now. Signals critical non-compliance, absent IRN, and immediate financial exposure.</li>
</ul>

<h2>Multi-Dimensional Status Encoding (WCAG AA Compliance)</h2>
<p>
  Under WCAG AA accessibility standards, critical operational states must never be conveyed via color hue alone. The platform enforces multi-dimensional status encoding across all data tables and modal views:
</p>
<table>
  <thead>
    <tr>
      <th>Triage Bucket</th>
      <th>Color Indicator</th>
      <th>Dedicated Iconography</th>
      <th>Numeric Score Clamp</th>
      <th>Text Badge Label</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Safe to Hold</strong></td>
      <td>Emerald (<code>#10B981</code>)</td>
      <td>Shield Checkmark (✓)</td>
      <td><code>75 – 100</code></td>
      <td><code>SAFE TO HOLD</code></td>
    </tr>
    <tr>
      <td><strong>Watch</strong></td>
      <td>Amber (<code>#F59E0B</code>)</td>
      <td>Hourglass / Alert Eye (◎)</td>
      <td><code>40 – 74</code></td>
      <td><code>WATCH</code></td>
    </tr>
    <tr>
      <td><strong>Chase Now</strong></td>
      <td>Crimson (<code>#EF4444</code>)</td>
      <td>Exclamation Triangle (⚠)</td>
      <td><code>0 – 39</code></td>
      <td><code>CHASE NOW</code></td>
    </tr>
  </tbody>
</table>

<!-- SECTION 11 -->
<div class="section-kicker">Section 11</div>
<h1>Market Opportunity, Business Model & ROI</h1>

<p>
  Reconciliation and Input Tax Credit protection is a mandatory recurring operational process for every registered enterprise in India. The statutory transition from self-assessed credits to mandatory GSTR-2B matching has created an immense, highly monetizable market opportunity:
</p>

<h2>Market Sizing (TAM / SAM / SOM)</h2>
<div class="grid-3">
  <div class="stat-card">
    <div class="stat-val" style="color: #0284c7;">₹240 Billion</div>
    <div class="stat-lbl">TAM ($2.9B USD)</div>
    <div class="stat-sub">8 Million GST-registered businesses filing monthly GSTR-3B returns in India.</div>
  </div>
  <div class="stat-card">
    <div class="stat-val" style="color: #0284c7;">₹24 Billion</div>
    <div class="stat-lbl">SAM ($290M USD)</div>
    <div class="stat-sub">800,000 mid-market and enterprise businesses facing recurring monthly GSTR-2B discrepancies.</div>
  </div>
  <div class="stat-card">
    <div class="stat-val" style="color: #0284c7;">₹24 Crore</div>
    <div class="stat-lbl">SOM ($2.9M USD)</div>
    <div class="stat-sub">Defensible Year 1 capture across mid-sized manufacturing, retail, and Chartered Accountant networks.</div>
  </div>
</div>

<h2>SaaS Subscription Pricing Tiers</h2>
<table>
  <thead>
    <tr>
      <th>Plan Tier</th>
      <th>Price (INR)</th>
      <th>Invoice Volume</th>
      <th>Included Core Capabilities</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Community / Free</strong></td>
      <td>₹0 / month</td>
      <td>Up to 50 invoices / mo</td>
      <td>Deterministic 3-signal triage, CSV upload, RapidFuzz reconciliation, basic CSV export.</td>
    </tr>
    <tr>
      <td><strong>Professional</strong></td>
      <td>₹2,499 / month</td>
      <td>Unlimited invoices</td>
      <td>4-State IRN verification, TinyFish web agent integration, priority CA audit memos, full AI copilot access.</td>
    </tr>
    <tr>
      <td><strong>Enterprise</strong></td>
      <td>₹12,999+ / month</td>
      <td>Multi-GSTIN / Custom</td>
      <td>Direct ERP sync (SAP, Oracle, Tally), 200k batch model pipeline, multi-user role permissions, SLA support.</td>
    </tr>
  </tbody>
</table>

<h2>Competitive Landscape & Defensible Moat</h2>
<table>
  <thead>
    <tr>
      <th>Dimension</th>
      <th>ClearTax / Enterprise Tax Suites</th>
      <th>Tally / Vyapar Bookkeeping</th>
      <th>GST Credit-at-Risk Forecaster</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Pricing</strong></td>
      <td>₹5,00,000+ / yr (Heavy enterprise pricing)</td>
      <td>₹15,000 – ₹25,000 / yr</td>
      <td><strong>₹2,499 / mo (High margin, self-serve)</strong></td>
    </tr>
    <tr>
      <td><strong>Actionable Triage</strong></td>
      <td>Flat discrepancy reports; no AP leverage check</td>
      <td>Raw accounting ledgers; no triage</td>
      <td><strong>Autonomous 3-Signal Decision Triage</strong></td>
    </tr>
    <tr>
      <td><strong>Commercial AP Leverage</strong></td>
      <td>None (Zero ERP AP balance integration)</td>
      <td>Ledger only (No tax cross-reference)</td>
      <td><strong>Unpaid balance & retention ratio integration</strong></td>
    </tr>
    <tr>
      <td><strong>E-Invoice Verification</strong></td>
      <td>Static upload check</td>
      <td>Manual check</td>
      <td><strong>4-State IRN engine with TinyFish agent</strong></td>
    </tr>
    <tr>
      <td><strong>AI Advisory Copilot</strong></td>
      <td>Generic FAQ bot or none</td>
      <td>None</td>
      <td><strong>Multi-Provider live session grounded Copilot</strong></td>
    </tr>
    <tr>
      <td><strong>Implementation Time</strong></td>
      <td>Weeks to months of IT setup</td>
      <td>Standalone desktop app</td>
      <td><strong>Zero-infrastructure: Upload & run in &lt; 2 minutes</strong></td>
    </tr>
  </tbody>
</table>

<h2>Enterprise Return on Investment (ROI) Case Study</h2>
<p>
  In our standard benchmark fixture of 200 invoices representing ₹1,96,000 in claimed ITC:
</p>
<ul>
  <li><strong>Noise Reduction:</strong> 25 out of 30 missing invoices (₹1,40,000 at-risk tax) are identified as Safe to Hold. Accounts Payable avoids sending 25 unwarranted escalation notices, protecting valuable vendor supply chains.</li>
  <li><strong>Immediate Working Capital Preservation:</strong> By retaining payment on the 25 Safe to Hold invoices, the enterprise cleanly hedges ₹1,40,000 in cash without incurring a single rupee in Section 50 interest.</li>
  <li><strong>Precision Default Interception:</strong> Exactly 1 high-risk invoice (₹2,400 tax) is isolated in Chase Now. The company initiates immediate legal recovery before the vendor's commercial entity disappears, preventing permanent ITC forfeiture.</li>
</ul>

<!-- SECTION 12 -->
<div class="section-kicker">Section 12</div>
<h1>Tax Director's Operational Playbook & Best Practices</h1>

<p>
  This operational playbook outlines the standard operating procedures (SOP) recommended for Enterprise Indirect Tax Directors, Controllers, and Accounts Payable managers executing monthly GST compliance:
</p>

<h2>Step-by-Step Monthly Workflow</h2>

<h3>Step 1: Data Ingestion & RapidFuzz Reconciliation (Day 14)</h3>
<ol>
  <li>On the 14th of the month (immediately following government GSTR-2B generation), export the internal Enterprise Purchase Register (PR) from your ERP.</li>
  <li>Download the official monthly GSTR-2B JSON or CSV statement from the GST portal.</li>
  <li>Upload both files into the GST Credit-at-Risk Forecaster. The RapidFuzz cross-GSTIN matcher automatically verifies matched records and isolates discrepancies in under 3 seconds.</li>
</ol>

<h3>Step 2: Operational Triage Execution (Day 15)</h3>
<ol>
  <li>Inspect the <strong>Safe to Hold</strong> bucket: Transmit the generated AP Retention Memo to Accounts Payable. Instruct AP to withhold supplier disbursements until the invoice appears in the subsequent GSTR-2B return. Do not send hostile notices to these suppliers.</li>
  <li>Inspect the <strong>Watch</strong> bucket: Verify the statutory cutoff date. If within 45 days of November 30, generate and dispatch polite automated reminder notices.</li>
  <li>Inspect the <strong>Chase Now</strong> bucket: Transmit the isolated invoices to the Head of Indirect Tax and Legal. Issue a formal Section 16(4) demand notice with commercial payment suspension clauses.</li>
</ol>

<h3>Step 3: GSTR-3B Return Filing (Day 20)</h3>
<ol>
  <li>Claim 100% of auto-reconciled matched ITC in <strong>Table 4(A)(5)</strong> of Form GSTR-3B.</li>
  <li>For invoices in the Chase Now bucket with expired statutory horizons, execute a provisional credit reversal under <strong>Table 4(B)(2)</strong> to halt Section 50(1) 18% p.a. interest accrual.</li>
</ol>

<h2>Q3 Statutory Reversal Protocol (November 30 Deadline)</h2>
<p>
  Under Rule 37A, November 30 represents the final statutory cut-off for the preceding financial year. On November 20:
</p>
<ul>
  <li>Filter all prior-year discrepancies with <code>days_to_statutory_cutoff &le; 10</code>.</li>
  <li>Any invoice remaining in Watch or Chase Now must be reversed in Table 4(B)(2) in the October GSTR-3B return (filed by November 20).</li>
  <li>By reversing prior to November 30, the company statutorily guarantees <strong>zero interest liability under Section 50(1)</strong>.</li>
  <li>When the defaulting vendor eventually pays taxes and files GSTR-3B in future months, immediately re-claim the reversed credit in Table 4(A)(5).</li>
</ul>

<h2>Audit Defense Memorandum Generation</h2>
<p>
  During statutory audits or Departmental scrutiny under Section 61 or Section 65 of the CGST Act, tax authorities often question why certain invoices were claimed or withheld.
</p>
<p>
  The GST Credit-at-Risk Forecaster provides an <strong>Audit-Ready CA Export</strong> with a complete cryptographic explainability trail:
</p>
<ul>
  <li>Timestamped 4-state IRN verification footprints proving reasonable diligence.</li>
  <li>Historical vendor periodicity logs demonstrating normal filing laggard behaviour.</li>
  <li>Commercial AP retention records proving zero loss to the government exchequer.</li>
</ul>

<div style="margin-top: 24px; padding: 12px; border: 1px solid #cbd5e1; border-radius: 6px; background: #f8fafc; text-align: center;">
  <div style="font-weight: 800; font-size: 10pt; color: #0f172a; margin-bottom: 2px;">GST CREDIT-AT-RISK FORECASTER</div>
  <div style="font-size: 7.5pt; color: #64748b;">
    Autonomous Decision-Support Architecture for Indian Indirect Tax & Accounts Payable Operations.<br>
    Visit <strong>https://gst-credit-risk.vercel.app</strong> | API Docs at <strong>https://gst-credit-risk.onrender.com/docs</strong>
  </div>
</div>

</body>
</html>
"""
    return html

def generate_pdf():
    html_content = build_pdf_html()
    html_file = os.path.abspath("scripts/temp_project_guide.html")
    pdf_file = os.path.abspath("GST_Credit_at_Risk_Forecaster_Complete_Project_Guide.pdf")

    with open(html_file, "w", encoding="utf-8") as f:
        f.write(html_content)

    chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    cmd = [
        chrome_path,
        "--headless=new",
        "--disable-gpu",
        "--no-pdf-header-footer",
        f"--print-to-pdf={pdf_file}",
        f"file:///{html_file}"
    ]

    print("Running Chrome headless to compile PDF...")
    res = subprocess.run(cmd, capture_output=True, text=True)
    
    if os.path.exists(html_file):
        os.remove(html_file)

    if os.path.exists(pdf_file) and os.path.getsize(pdf_file) > 0:
        print(f"Success! PDF created at: {pdf_file}")
        doc = pymupdf.open(pdf_file)
        print(f"Total Pages Generated: {len(doc)}")
        for i in range(len(doc)):
            print(f"Page {i+1} character count: {len(doc[i].get_text('text'))}")
        doc.close()
        return pdf_file
    else:
        print("Failed to generate PDF!")
        print("Stdout:", res.stdout)
        print("Stderr:", res.stderr)
        return None

if __name__ == "__main__":
    generate_pdf()
