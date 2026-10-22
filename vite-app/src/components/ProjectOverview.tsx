import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Cpu,
  FileCheck,
  Globe,
  PauseCircle,
  Play,
  Scale,
  Sparkles,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import { formatINR } from '../utils';

export interface ProjectOverviewProps {
  onLaunchDemo: () => void;
  onOpenBacktestModal: () => void;
  onSelectQuickDemo?: (scenario: 'safe' | 'chase' | 'tinyfish') => void;
  kpis: {
    total: number;
    matched: number;
    unmatched: number;
    totalTaxAtRisk: number;
    safeCount: number;
    watchCount: number;
    chaseCount: number;
  };
}

export function ProjectOverview({
  onLaunchDemo,
  onOpenBacktestModal,
  onSelectQuickDemo,
  kpis,
}: ProjectOverviewProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '40px' }}>
      {/* Top Hackathon & Statutory Notice Banner */}
      <div
        style={{
          background: 'linear-gradient(90deg, rgba(159, 111, 240, 0.15), rgba(183, 148, 246, 0.15))',
          border: '1px solid rgba(183, 148, 246, 0.3)',
          borderRadius: '12px',
          padding: '12px 20px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              background: '#9F6FF0',
              color: '#fff',
              fontSize: '10px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              padding: '3px 8px',
              borderRadius: '6px',
            }}
          >
            Hackathon Judge Briefing
          </span>
          <span style={{ fontSize: '12px', color: '#cbd5e1' }}>
            Section 16(2)(aa) &amp; Rule 37A Input Tax Credit Triage Engine
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '11px', color: 'var(--navy-muted)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#34d399' }}>
            <CheckCircle2 size={13} /> 28 Unit Tests Passing
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#60a5fa' }}>
            <Globe size={13} /> TinyFish Web Agent Active
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#a5b4fc' }}>
            <Cpu size={13} /> LightGBM ML Diagnostics
          </span>
        </div>
      </div>

      {/* Hero Pitch Section */}
      <div
        style={{
          background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.8) 0%, rgba(9, 14, 23, 0.95) 100%)',
          border: '1px solid var(--navy-border)',
          borderRadius: '20px',
          padding: '44px 36px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-60px',
            right: '-60px',
            width: '260px',
            height: '260px',
            background: 'radial-gradient(circle, rgba(159, 111, 240, 0.2) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: '820px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: '#60a5fa',
                background: 'rgba(183, 148, 246, 0.1)',
                border: '1px solid rgba(183, 148, 246, 0.25)',
                padding: '4px 10px',
                borderRadius: '9999px',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.02em',
              }}
            >
              <Sparkles size={13} />
              AI &amp; Web Agent Decision Support for Indian Tax Tech
            </span>
          </div>

          <h1
            style={{
              fontSize: '36px',
              fontWeight: 900,
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              color: '#fff',
            }}
          >
            Autonomous GST Credit-at-Risk Forecaster
          </h1>

          <p
            style={{
              fontSize: '16px',
              lineHeight: 1.6,
              color: '#94a3b8',
              fontWeight: 400,
            }}
          >
            Under Indian GST law, missing vendor invoices can trigger mandatory tax reversals plus 18% penalty interest by November 30. Instead of forcing accountants to chase all 30 missing suppliers blindly, our 3-signal engine fuses <strong style={{ color: '#fff' }}>IRP portal footprints</strong>, <strong style={{ color: '#fff' }}>commercial AP retention leverage</strong>, and <strong style={{ color: '#fff' }}>6-month filing tracks</strong> to triage discrepancies into explainable, risk-calibrated actions.
          </p>

          {/* Primary Action Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '14px', marginTop: '10px' }}>
            <button
              onClick={onLaunchDemo}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '13px 26px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #9F6FF0, #7C3AED)',
                color: '#fff',
                border: 'none',
                fontWeight: 800,
                fontSize: '14px',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(159, 111, 240, 0.4)',
              }}
            >
              <Play size={16} fill="#fff" />
              Launch Interactive Triage Demo
              <ArrowRight size={16} />
            </button>

            <button
              onClick={onOpenBacktestModal}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--navy-border-hover)',
                color: '#cbd5e1',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              <Activity size={16} color="#818cf8" />
              ML Diagnostics &amp; Leakage Defense
            </button>
          </div>
        </div>

        {/* Quick Numbers Strip */}
        <div
          style={{
            marginTop: '36px',
            paddingTop: '28px',
            borderTop: '1px solid var(--navy-border)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: '16px',
          }}
        >
          <div>
            <span style={{ fontSize: '11px', color: 'var(--navy-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Ingested Invoices
            </span>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
              {kpis.total} Total
            </div>
            <span style={{ fontSize: '11px', color: '#34d399' }}>170 matched in GSTR-2B</span>
          </div>

          <div>
            <span style={{ fontSize: '11px', color: 'var(--navy-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Discrepancies
            </span>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#f87171', marginTop: '4px' }}>
              {kpis.unmatched} Missing
            </div>
            <span style={{ fontSize: '11px', color: 'var(--navy-muted)' }}>{formatINR(kpis.totalTaxAtRisk)} at risk</span>
          </div>

          <div>
            <span style={{ fontSize: '11px', color: 'var(--navy-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Safe to Hold (Absorbed)
            </span>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#34d399', marginTop: '4px' }}>
              25 Invoices
            </div>
            <span style={{ fontSize: '11px', color: 'var(--navy-muted)' }}>94% tax risk protected</span>
          </div>

          <div>
            <span style={{ fontSize: '11px', color: 'var(--navy-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              True Escalation
            </span>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#ef4444', marginTop: '4px' }}>
              1 Vendor
            </div>
            <span style={{ fontSize: '11px', color: 'var(--navy-muted)' }}>Isolated chase priority</span>
          </div>
        </div>
      </div>

      {/* The Problem vs Solution (Why This Exists) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* The Problem */}
        <div
          style={{
            background: 'var(--navy-card)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '16px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171' }}>
            <XCircle size={18} />
            <h3 style={{ fontSize: '15px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              The Broken Status Quo
            </h3>
          </div>
          <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: 1.6 }}>
            Traditional reconciliation engines stop at binary comparison: <em>"Invoice 123 is missing from GSTR-2B"</em>. This dumps 30 unresolved discrepancies on the CFO desk.
          </p>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: 'var(--navy-muted)' }}>
            <li style={{ display: 'flex', gap: '8px' }}>
              <span style={{ color: '#ef4444' }}>✕</span>
              <span><strong>Indiscriminate Supplier Chasing:</strong> Damaging commercial goodwill by calling vendors who always file 20 days late but never default.</span>
            </li>
            <li style={{ display: 'flex', gap: '8px' }}>
              <span style={{ color: '#ef4444' }}>✕</span>
              <span><strong>Zero Payment Leverage Awareness:</strong> Forgetting that Accounts Payable already holds ₹50,000 in retention for that exact supplier.</span>
            </li>
            <li style={{ display: 'flex', gap: '8px' }}>
              <span style={{ color: '#ef4444' }}>✕</span>
              <span><strong>Misreading Absent IRNs:</strong> Penalizing suppliers under the ₹5 Cr turnover threshold who are legally exempt from e-invoicing.</span>
            </li>
          </ul>
        </div>

        {/* The Solution */}
        <div
          style={{
            background: 'var(--navy-card)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '16px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399' }}>
            <CheckCircle2 size={18} />
            <h3 style={{ fontSize: '15px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              The Forecaster's Autonomous Triage
            </h3>
          </div>
          <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: 1.6 }}>
            Our 3-signal architecture automatically cross-references commercial enterprise context with live government portal intelligence to eliminate noise.
          </p>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: '#cbd5e1' }}>
            <li style={{ display: 'flex', gap: '8px' }}>
              <span style={{ color: '#10b981' }}>✓</span>
              <span><strong>25 Safe to Hold:</strong> Verified on IRP + protected by unpaid AP retention. Recommendation: Wait for normal auto-resolution.</span>
            </li>
            <li style={{ display: 'flex', gap: '8px' }}>
              <span style={{ color: '#f59e0b' }}>✓</span>
              <span><strong>4 Watch:</strong> Medium leverage or ambiguous signals. Slated for automated check in next cycle.</span>
            </li>
            <li style={{ display: 'flex', gap: '8px' }}>
              <span style={{ color: '#ef4444' }}>✓</span>
              <span><strong>1 Chase Now:</strong> No IRN, 0 payment leverage, and sudden filing anomaly. Escalation letter drafted instantly.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* The 3 Decision Signals & TinyFish Agent */}
      <div>
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>
            The 3-Signal Decision Architecture
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--navy-muted)', marginTop: '4px' }}>
            Deterministic, explainable scoring (0 to 100) — no opaque black-box hallucination.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {/* Signal 1 */}
          <div
            style={{
              background: 'var(--navy-card)',
              border: '1px solid var(--navy-border)',
              borderRadius: '14px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase' }}>
                Pipeline 1
              </span>
              <FileCheck size={16} color="#60a5fa" />
            </div>
            <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>
              IRN Registry &amp; TinyFish Web Agent
            </h4>
            <p style={{ fontSize: '12px', color: 'var(--navy-muted)', lineHeight: 1.5 }}>
              Checks e-invoice registration on the IRP. Uses TinyFish to explore <strong style={{ color: '#cbd5e1' }}>einvoice1.gst.gov.in</strong> and CBIC Notification 10/2023. If vendor turnover is &lt;₹5 Cr, an absent IRN is recognized as exempt rather than penalized.
            </p>
            <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid var(--navy-border)', fontSize: '11px', color: '#93c5fd' }}>
              Weight: +20 (Present) / -15 (Absent Applies) / 0 (Exempt)
            </div>
          </div>

          {/* Signal 2 */}
          <div
            style={{
              background: 'var(--navy-card)',
              border: '1px solid var(--navy-border)',
              borderRadius: '14px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#34d399', textTransform: 'uppercase' }}>
                Pipeline 2
              </span>
              <Scale size={16} color="#34d399" />
            </div>
            <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>
              AP Commercial Payment Leverage
            </h4>
            <p style={{ fontSize: '12px', color: 'var(--navy-muted)', lineHeight: 1.5 }}>
              Computes the ratio of unpaid invoices + held retention to the at-risk invoice gross value. If the buyer holds &ge;100% of the invoice in pending payments, the company is commercially insulated from statutory default.
            </p>
            <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid var(--navy-border)', fontSize: '11px', color: '#6ee7b7' }}>
              Weight: +15 (High &ge;1.0) / +5 (Medium) / -10 (Low / Paid)
            </div>
          </div>

          {/* Signal 3 */}
          <div
            style={{
              background: 'var(--navy-card)',
              border: '1px solid var(--navy-border)',
              borderRadius: '14px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase' }}>
                Pipeline 3
              </span>
              <TrendingUp size={16} color="#f59e0b" />
            </div>
            <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>
              6-Month Filing Track Record
            </h4>
            <p style={{ fontSize: '12px', color: 'var(--navy-muted)', lineHeight: 1.5 }}>
              Analyzes historical filing timeliness. <em>Habitual Laggards</em> predictably file 20 days late every quarter, so a missing invoice is normal behavior. A <em>New Anomaly</em> by a previously punctual vendor indicates real distress.
            </p>
            <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid var(--navy-border)', fontSize: '11px', color: '#fcd34d' }}>
              Weight: +15 (Habitual Laggard) / 0 (Normal) / -25 (New Anomaly)
            </div>
          </div>
        </div>
      </div>

      {/* Suggested Judge Walkthrough / Demo Beats */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9))',
          border: '1px solid rgba(183, 148, 246, 0.3)',
          borderRadius: '16px',
          padding: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>
              Suggested 3-Minute Demo Walkthrough for Judges
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--navy-muted)', marginTop: '2px' }}>
              Experience the core innovations in 3 quick clicks:
            </p>
          </div>
          <button
            onClick={onLaunchDemo}
            style={{
              background: '#9F6FF0',
              color: '#fff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            Open Full Dashboard <ArrowRight size={14} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
          {/* Demo Beat 1 */}
          <div
            onClick={() => onSelectQuickDemo?.('safe')}
            style={{
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: '12px',
              padding: '16px',
              cursor: 'pointer',
              transition: 'transform 0.15s ease',
            }}
            className="kpi-card"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34d399', fontWeight: 700, fontSize: '12px' }}>
              <PauseCircle size={15} />
              <span>1. Inspect "Safe to Hold" (Score: 100)</span>
            </div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff', marginTop: '8px' }}>
              Shree Ganesh Packaging (`SGP/26-27/0412`)
            </div>
            <p style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '4px', lineHeight: 1.5 }}>
              IRN verified (+20), ₹18,400 AP leverage (+15), habitual laggard (+15). Recommendation: Hold; vendor files reliably every quarter.
            </p>
            <span style={{ fontSize: '11px', color: '#34d399', fontWeight: 700, marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              Inspect Invoice →
            </span>
          </div>

          {/* Demo Beat 2 */}
          <div
            onClick={() => onSelectQuickDemo?.('chase')}
            style={{
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: '12px',
              padding: '16px',
              cursor: 'pointer',
              transition: 'transform 0.15s ease',
            }}
            className="kpi-card"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f87171', fontWeight: 700, fontSize: '12px' }}>
              <AlertTriangle size={15} />
              <span>2. Inspect "Chase Now" (Score: 0)</span>
            </div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff', marginTop: '8px' }}>
              Pioneer Courier (`PCS/26-27/5561`)
            </div>
            <p style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '4px', lineHeight: 1.5 }}>
              Absent IRN (-15), ₹0 leverage (-10), sudden anomaly (-25). Tax at risk: ₹2,400. Immediate escalation required before reversal.
            </p>
            <span style={{ fontSize: '11px', color: '#f87171', fontWeight: 700, marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              Inspect Invoice →
            </span>
          </div>

          {/* Demo Beat 3 */}
          <div
            onClick={() => onSelectQuickDemo?.('tinyfish')}
            style={{
              background: 'rgba(183, 148, 246, 0.08)',
              border: '1px solid rgba(183, 148, 246, 0.25)',
              borderRadius: '12px',
              padding: '16px',
              cursor: 'pointer',
              transition: 'transform 0.15s ease',
            }}
            className="kpi-card"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#60a5fa', fontWeight: 700, fontSize: '12px' }}>
              <Globe size={15} />
              <span>3. Test TinyFish Live Web Agent</span>
            </div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff', marginTop: '8px' }}>
              Live Government Portal Exploration
            </div>
            <p style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '4px', lineHeight: 1.5 }}>
              Click "Check current IRN rules" or query IRP portal for enablement. Toggle simulated timeout to observe Zero-Penalty Defense.
            </p>
            <span style={{ fontSize: '11px', color: '#60a5fa', fontWeight: 700, marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              Test Web Agent →
            </span>
          </div>
        </div>
      </div>

      {/* SaaS Pricing & Market Opportunity Strip */}
      <div
        style={{
          background: 'var(--navy-card)',
          border: '1px solid var(--navy-border)',
          borderRadius: '16px',
          padding: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
        }}
      >
        <div style={{ maxWidth: '600px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#a5b4fc', letterSpacing: '0.04em' }}>
            Commercial Viability &amp; SaaS Economics
          </span>
          <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
            TAM: ₹240B · SAM: ₹24B · Defensible Year 1 SOM: ₹24 Crore
          </h4>
          <p style={{ fontSize: '12px', color: 'var(--navy-muted)', marginTop: '4px', lineHeight: 1.5 }}>
            Targeting ~800,000 businesses with recurring 2B mismatches. A realistic 1% Year 1 capture (~8,000 clients) at ₹2,499/mo generates ₹24 Cr ($2.9M ARR).
          </p>
        </div>

        <button
          onClick={onLaunchDemo}
          style={{
            padding: '12px 24px',
            borderRadius: '10px',
            background: '#10b981',
            color: '#fff',
            border: 'none',
            fontWeight: 800,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            whiteSpace: 'nowrap',
          }}
        >
          <Play size={15} fill="#fff" />
          Enter Live Dashboard
        </button>
      </div>
    </div>
  );
}
