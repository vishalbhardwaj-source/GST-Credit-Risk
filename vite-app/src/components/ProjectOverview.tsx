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
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import type { PipelineSummary } from '../types';
import { formatINR } from '../utils';

export interface ProjectOverviewProps {
  onLaunchDemo: () => void;
  onOpenBacktestModal: () => void;
  summary: PipelineSummary;
}

const count = (value: number | null) => value === null ? '-to-be-populated-' : value.toLocaleString();
const money = (value: number | null) => value === null ? '-to-be-populated-' : formatINR(value);

const iconTile = {
  width: 36,
  height: 36,
  borderRadius: 10,
  background: 'linear-gradient(135deg, #9F6FF0, #7C3AED)',
  display: 'grid',
  placeItems: 'center',
  color: '#fff',
} as const;

export function ProjectOverview({ onLaunchDemo, onOpenBacktestModal, summary }: ProjectOverviewProps) {
  return (
    <main style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>
      <section
        style={{
          background: 'linear-gradient(90deg, rgba(159, 111, 240, 0.15), rgba(183, 148, 246, 0.15))',
          border: '1px solid rgba(183, 148, 246, 0.3)',
          borderRadius: 12,
          padding: '12px 20px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ background: '#9F6FF0', color: '#fff', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.05em', padding: '3px 8px', borderRadius: 6 }}>
            GST Triage Overview
          </span>
          <span style={{ fontSize: 12, color: '#cbd5e1' }}>Purchase Register reconciliation and model-assisted review</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 11, color: 'var(--navy-muted)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#34d399' }}><CheckCircle2 size={13} /> Server-side data flow</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#a5b4fc' }}><Cpu size={13} /> Model output disclosed</span>
        </div>
      </section>

      <section
        style={{
          background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.8) 0%, rgba(9, 14, 23, 0.95) 100%)',
          border: '1px solid var(--navy-border)',
          borderRadius: 20,
          padding: '44px 36px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div style={{ position: 'absolute', top: -60, right: -60, width: 260, height: 260, background: 'radial-gradient(circle, rgba(159, 111, 240, 0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 820, display: 'flex', flexDirection: 'column', gap: 18, position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#60a5fa', background: 'rgba(183, 148, 246, 0.1)', border: '1px solid rgba(183, 148, 246, 0.25)', padding: '4px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 700 }}>
              <Sparkles size={13} /> Explainable invoice review for GST workflows
            </span>
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 900, lineHeight: 1.15, letterSpacing: '-0.03em', color: '#fff' }}>
            GST Credit-at-Risk Forecaster
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: '#94a3b8', fontWeight: 400 }}>
            Reconcile Purchase Register invoices against GSTR-2B, then review available GSTR-1, AP-aging, and filing-history signals. The bundled model predicts <strong style={{ color: '#fff' }}>synthetic later GSTR-2B appearance</strong>; it does not determine legal ITC eligibility or payment recovery.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14, marginTop: 10 }}>
            <button onClick={onLaunchDemo} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 26px', borderRadius: 10, background: 'linear-gradient(135deg, #9F6FF0, #7C3AED)', color: '#fff', border: 'none', fontWeight: 800, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 20px rgba(159, 111, 240, 0.4)' }}>
              <Play size={16} fill="#fff" /> Launch Interactive Triage Demo <ArrowRight size={16} />
            </button>
            <button onClick={onOpenBacktestModal} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 20px', borderRadius: 10, background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--navy-border-hover)', color: '#cbd5e1', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              <Activity size={16} color="#818cf8" /> Model Evaluation Notes
            </button>
          </div>
        </div>

        <div style={{ marginTop: 36, paddingTop: 28, borderTop: '1px solid var(--navy-border)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 16 }}>
          <div>
            <span style={{ fontSize: 11, color: 'var(--navy-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Ingested Invoices</span>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginTop: 4 }}>{count(summary.total)} Total</div>
            <span style={{ fontSize: 11, color: '#34d399' }}>{count(summary.matched)} matched in GSTR-2B</span>
          </div>
          <div>
            <span style={{ fontSize: 11, color: 'var(--navy-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Discrepancies</span>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#f87171', marginTop: 4 }}>{count(summary.unmatched)} Unmatched</div>
            <span style={{ fontSize: 11, color: 'var(--navy-muted)' }}>{money(summary.totalTaxAtRisk)} unmatched tax total</span>
          </div>
          <div>
            <span style={{ fontSize: 11, color: 'var(--navy-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Safe to Hold</span>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#34d399', marginTop: 4 }}>{count(summary.safeCount)} Invoices</div>
            <span style={{ fontSize: 11, color: 'var(--navy-muted)' }}>Synthetic model bucket</span>
          </div>
          <div>
            <span style={{ fontSize: 11, color: 'var(--navy-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Chase Now</span>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#ef4444', marginTop: 4 }}>{count(summary.chaseCount)} Invoices</div>
            <span style={{ fontSize: 11, color: 'var(--navy-muted)' }}>Synthetic model bucket</span>
          </div>
        </div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        <article style={{ background: 'var(--navy-card)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f87171' }}><XCircle size={18} /><h3 style={{ fontSize: 15, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.03em' }}>The Reconciliation Challenge</h3></div>
          <p style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6 }}>A binary match result identifies invoices needing review, but does not explain source-data limits or distinguish missing records from confirmed tax outcomes.</p>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, color: 'var(--navy-muted)' }}>
            <li style={{ display: 'flex', gap: 8 }}><span style={{ color: '#ef4444' }}>✕</span><span><strong>Different source files:</strong> Invoice identities and amounts must be reconciled across buyer and supplier records.</span></li>
            <li style={{ display: 'flex', gap: 8 }}><span style={{ color: '#ef4444' }}>✕</span><span><strong>Incomplete signals:</strong> Uploaded files do not provide verified IRN status, so uploads are left unscored.</span></li>
            <li style={{ display: 'flex', gap: 8 }}><span style={{ color: '#ef4444' }}>✕</span><span><strong>Unvalidated predictions:</strong> Synthetic results cannot establish production or legal outcomes.</span></li>
          </ul>
        </article>
        <article style={{ background: 'var(--navy-card)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#34d399' }}><CheckCircle2 size={18} /><h3 style={{ fontSize: 15, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.03em' }}>The Current Workflow</h3></div>
          <p style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6 }}>The app displays source-derived reconciliation and triage output with clear unknown states, rather than inventing missing data.</p>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, color: '#cbd5e1' }}>
            <li style={{ display: 'flex', gap: 8 }}><span style={{ color: '#10b981' }}>✓</span><span><strong>Match:</strong> Compare uploaded Purchase Register rows to GSTR-2B where supplied.</span></li>
            <li style={{ display: 'flex', gap: 8 }}><span style={{ color: '#10b981' }}>✓</span><span><strong>Context:</strong> Display available GSTR-1, AP aging, and filing-history data.</span></li>
            <li style={{ display: 'flex', gap: 8 }}><span style={{ color: '#10b981' }}>✓</span><span><strong>Model:</strong> Run synthetic demo inference; uploaded invoices remain explicitly not scored.</span></li>
          </ul>
        </article>
      </section>

      <section>
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>Available Data Signals</h2>
          <p style={{ fontSize: 13, color: 'var(--navy-muted)', marginTop: 4 }}>The display reflects source files and model outputs; absent sources remain unknown.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {[
            { name: 'Invoice & GSTR-2B Reconciliation', icon: <FileCheck size={16} color="#60a5fa" />, color: '#60a5fa', text: 'Match supplier GSTIN and invoice number across the Purchase Register and GSTR-2B files. Without GSTR-2B, match status stays unknown.' },
            { name: 'AP Aging & Payment Context', icon: <Scale size={16} color="#34d399" />, color: '#34d399', text: 'Show outstanding payable and retention data from the AP-aging source. Missing AP records are not inferred.' },
            { name: 'Filing History', icon: <TrendingUp size={16} color="#f59e0b" />, color: '#f59e0b', text: 'Display supplied filing cycles and delays. Raw uploads are not transformed into model categories.' },
          ].map((signal, index) => (
            <article key={signal.name} style={{ background: 'var(--navy-card)', border: '1px solid var(--navy-border)', borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: signal.color, textTransform: 'uppercase' }}>Signal {index + 1}</span>{signal.icon}
              </div>
              <h4 style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{signal.name}</h4>
              <p style={{ fontSize: 12, color: 'var(--navy-muted)', lineHeight: 1.5 }}>{signal.text}</p>
            </article>
          ))}
          <article style={{ background: 'var(--navy-card)', border: '1px solid var(--navy-border)', borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><span style={{ fontSize: 11, fontWeight: 700, color: '#a5b4fc', textTransform: 'uppercase' }}>Model</span><Cpu size={16} color="#a5b4fc" /></div>
            <h4 style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Synthetic Later GSTR-2B Prediction</h4>
            <p style={{ fontSize: 12, color: 'var(--navy-muted)', lineHeight: 1.5 }}>The bundled model predicts a synthetic target. Demo predictions are in-sample; no real-world validation is available.</p>
          </article>
        </div>
      </section>

      <section style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9))', border: '1px solid rgba(183, 148, 246, 0.3)', borderRadius: 16, padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>Suggested Demo Walkthrough</h3>
            <p style={{ fontSize: 12, color: 'var(--navy-muted)', marginTop: 2 }}>Inspect the available records and their source-backed status.</p>
          </div>
          <button onClick={onLaunchDemo} style={{ background: '#9F6FF0', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>Open Dashboard <ArrowRight size={14} /></button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
          {[
            { title: '1. Review Reconciliation', color: '#34d399', icon: <PauseCircle size={15} />, body: 'Inspect matched and unmatched status alongside the available GSTR-2B source record.' },
            { title: '2. Review Model Notes', color: '#f87171', icon: <AlertTriangle size={15} />, body: 'Understand the synthetic training target and in-sample demo limitations.' },
            { title: '3. Inspect Source Signals', color: '#60a5fa', icon: <Globe size={15} />, body: 'Open invoice details and identify which uploaded fields are present or unavailable.' },
          ].map((step) => (
            <div key={step.title} style={{ background: 'rgba(183, 148, 246, 0.08)', border: '1px solid rgba(183, 148, 246, 0.25)', borderRadius: 12, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: step.color, fontWeight: 700, fontSize: 12 }}>{step.icon}{step.title}</div>
              <p style={{ fontSize: 11, color: '#cbd5e1', marginTop: 8, lineHeight: 1.5 }}>{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ background: 'var(--navy-card)', border: '1px solid var(--navy-border)', borderRadius: 16, padding: 24, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
        <div style={{ maxWidth: 680 }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#a5b4fc', letterSpacing: '.04em' }}>Model &amp; data limitations</span>
          <h4 style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginTop: 4 }}>Synthetic evaluation is not production validation</h4>
          <p style={{ fontSize: 12, color: 'var(--navy-muted)', marginTop: 4, lineHeight: 1.5 }}>Uploads are held temporarily in backend memory. Model scores are not generated for uploaded invoices when required verified features are missing.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#fcd34d', fontSize: 12 }}><ShieldAlert size={16} /> Not tax or legal advice</span>
          <span style={{ ...iconTile, width: 34, height: 34 }}><ShieldCheck size={17} /></span>
        </div>
      </section>
    </main>
  );
}
