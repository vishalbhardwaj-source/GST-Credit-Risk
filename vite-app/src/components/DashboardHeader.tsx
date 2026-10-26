import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Download,
  Eye,
  FileText,
  Info,
  PauseCircle,
  Play,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Upload,
} from 'lucide-react';
import type { PipelineSummary } from '../types';
import { formatINR } from '../utils';

export interface DashboardHeaderProps {
  apiConnected: boolean | null;
  isRouted: boolean;
  isRouting: boolean;
  onReset: () => void;
  onOpenBacktestModal: () => void;
  onExportCsv: () => void;
  onRunRouting: () => void;
  onOpenUploadModal?: () => void;
  onOpenTinyFishModal?: () => void;
  isCustomDataActive?: boolean;
  customDataName?: string;
  onResetToDemo?: () => void;
  showSynopsis: boolean;
  setShowSynopsis: (value: boolean) => void;
  activeView: 'overview' | 'dashboard';
  onViewChange: (view: 'overview' | 'dashboard') => void;
  summary: PipelineSummary;
  matchFilter: 'ALL' | 'MATCHED' | 'UNMATCHED';
  setMatchFilter: (value: 'ALL' | 'MATCHED' | 'UNMATCHED') => void;
}

const displayCount = (value: number | null) => value === null ? '-to-be-populated-' : value.toLocaleString();
const displayMoney = (value: number | null) => value === null ? '-to-be-populated-' : formatINR(value);

export function DashboardHeader({
  apiConnected,
  isRouted,
  isRouting,
  onReset,
  onOpenBacktestModal,
  onExportCsv,
  onRunRouting,
  onOpenUploadModal,
  onOpenTinyFishModal,
  isCustomDataActive = false,
  customDataName,
  onResetToDemo,
  showSynopsis,
  setShowSynopsis,
  activeView,
  onViewChange,
  summary,
  matchFilter,
  setMatchFilter,
}: DashboardHeaderProps) {
  const buttonStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: '12px',
    cursor: 'pointer',
  } as const;

  return (
    <>
      <div
        style={{
          background: 'rgba(183, 148, 246, 0.08)',
          border: '1px solid rgba(183, 148, 246, 0.25)',
          borderRadius: '10px',
          padding: '10px 16px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          fontSize: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Info size={16} color="#B794F6" />
          <span>
            <strong style={{ color: '#fff' }}>{isCustomDataActive ? 'Uploaded data.' : 'Synthetic demo data.'}</strong>{' '}
            {isCustomDataActive
              ? 'Uploaded invoices are not scored without verified IRN data.'
              : 'Demo predictions are in-sample and not validated on real-world data.'}{' '}
            Triage support only—not tax or legal advice.
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: apiConnected ? '#34d399' : '#94a3b8', fontSize: '11px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: apiConnected ? '#10b981' : '#f59e0b', display: 'inline-block' }} />
            {apiConnected ? 'Backend Connected' : 'Cloud Demo Mode'}
          </span>
          <span style={{ color: '#94a3b8', fontSize: '11px', whiteSpace: 'nowrap' }}>Synthetic decision support</span>
        </div>
      </div>

      <header
        style={{
          background: 'var(--navy-surface)',
          border: '1px solid var(--navy-border)',
          borderRadius: '16px',
          padding: '20px 24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #9F6FF0, #7C3AED)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '18px', color: '#fff' }}>
            ₹
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>GST Credit-at-Risk Forecaster</h1>
            <p style={{ color: 'var(--navy-muted)', fontSize: '12px', marginTop: '2px' }}>
              {isCustomDataActive ? customDataName : 'Purchase Register reconciliation and synthetic triage'}
            </p>
          </div>
        </div>

        <div style={{ display: 'inline-flex', background: 'rgba(0, 0, 0, 0.4)', padding: '3px', borderRadius: '9px', border: '1px solid var(--navy-border)' }}>
          {([
            ['overview', <FileText key="overview-icon" size={13} />, 'Executive Pitch'],
            ['dashboard', <Activity key="dashboard-icon" size={13} />, 'Live Triage Console'],
          ] as const).map(([view, icon, label]) => (
            <button
              key={view}
              onClick={() => onViewChange(view)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '7px',
                border: 'none',
                background: activeView === view ? '#9F6FF0' : 'transparent',
                color: activeView === view ? '#fff' : 'var(--navy-muted)',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              {icon}{label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
          {isCustomDataActive ? (
            <button onClick={onResetToDemo} style={{ ...buttonStyle, background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#34d399' }}>
              <RotateCcw size={13} /> Reset to Demo
            </button>
          ) : isRouted ? (
            <button onClick={onReset} style={{ ...buttonStyle, background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--navy-border)' }}>
              <RotateCcw size={13} /> Reset
            </button>
          ) : null}
          <button onClick={onOpenTinyFishModal} style={{ ...buttonStyle, background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.4)', color: '#38bdf8' }}>
            <Sparkles size={14} /> GSTIN Lookup
          </button>
          <button onClick={onOpenUploadModal} style={{ ...buttonStyle, background: 'rgba(159, 111, 240, 0.15)', border: '1px solid rgba(159, 111, 240, 0.4)', color: '#d8b4fe' }}>
            <Upload size={14} /> Upload Data
          </button>
          <button onClick={onOpenBacktestModal} style={{ ...buttonStyle, background: 'rgba(183, 148, 246, 0.15)', border: '1px solid rgba(183, 148, 246, 0.35)', color: '#a5b4fc' }}>
            <Activity size={14} /> Model Notes
          </button>
          <button onClick={onExportCsv} style={{ ...buttonStyle, background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--navy-border)' }}>
            <Download size={14} /> Export Page
          </button>
          <button onClick={onRunRouting} disabled={isRouting} style={{ ...buttonStyle, background: 'linear-gradient(135deg, #9F6FF0, #7C3AED)', border: 'none', color: '#fff', opacity: isRouting ? 0.7 : 1 }}>
            <Play size={14} fill="#fff" /> {isRouting ? 'Running…' : isRouted ? 'Run Again' : 'Run Pipeline'}
          </button>
        </div>
      </header>

      {activeView === 'dashboard' && (
        <>
          <section style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9))', border: '1px solid rgba(183, 148, 246, 0.3)', borderRadius: '14px', padding: '16px 20px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(183, 148, 246, 0.15)', border: '1px solid rgba(183, 148, 246, 0.35)', display: 'grid', placeItems: 'center', color: '#60a5fa' }}>
                  <FileText size={15} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>Situation Synopsis — Reconciliation &amp; Triage</span>
                    <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', background: isRouted ? 'rgba(16,185,129,.15)' : 'rgba(99,102,241,.15)', color: isRouted ? '#34d399' : '#818cf8', border: `1px solid ${isRouted ? 'rgba(16,185,129,.3)' : 'rgba(99,102,241,.3)'}`, padding: '1px 8px', borderRadius: 9999 }}>
                      {isRouted ? 'Pipeline Complete' : 'Data Loaded'}
                    </span>
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--navy-muted)', marginTop: 2 }}>
                    Source-derived figures; unknown values remain unpopulated.
                  </p>
                </div>
              </div>
              <button onClick={() => setShowSynopsis(!showSynopsis)} style={{ background: 'transparent', border: '1px solid var(--navy-border)', borderRadius: 6, color: 'var(--navy-muted)', cursor: 'pointer', padding: '4px 8px', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600 }}>
                {showSynopsis ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {showSynopsis ? 'Collapse Synopsis' : 'Expand Synopsis'}
              </button>
            </div>
            {showSynopsis && (
              <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
                <div style={{ background: 'rgba(239,68,68,.06)', border: '1px solid rgba(239,68,68,.2)', borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#f87171', fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}><ShieldAlert size={14} /> Reconciliation</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginTop: 6 }}>{displayCount(summary.unmatched)} Unmatched · {displayMoney(summary.totalTaxAtRisk)}</div>
                  <p style={{ fontSize: 11, color: '#cbd5e1', marginTop: 4, lineHeight: 1.5 }}>Invoices absent from the supplied GSTR-2B snapshot; this is not a determination of ITC eligibility.</p>
                </div>
                <div style={{ background: 'rgba(245,158,11,.06)', border: '1px solid rgba(245,158,11,.2)', borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fbbf24', fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}><AlertTriangle size={14} /> Model Scope</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginTop: 6 }}>{isCustomDataActive ? 'Upload not scored' : 'Synthetic prediction'}</div>
                  <p style={{ fontSize: 11, color: '#cbd5e1', marginTop: 4, lineHeight: 1.5 }}>{isCustomDataActive ? 'Verified IRN input is unavailable in the uploaded sources.' : 'The target is synthetic later GSTR-2B appearance; demo predictions are in-sample.'}</p>
                </div>
                <div style={{ background: 'rgba(16,185,129,.06)', border: '1px solid rgba(16,185,129,.2)', borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#34d399', fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}><ShieldCheck size={14} /> Triage Output</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginTop: 6 }}>{displayCount(summary.safeCount)} Hold · {displayCount(summary.watchCount)} Watch · {displayCount(summary.chaseCount)} Chase</div>
                  <p style={{ fontSize: 11, color: '#cbd5e1', marginTop: 4, lineHeight: 1.5 }}>Synthetic model buckets are triage signals only and should not be treated as legal or payment advice.</p>
                </div>
              </div>
            )}
          </section>

          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14 }}>
            {[
              { label: 'Total Register Invoices', value: displayCount(summary.total), note: 'Imported purchase lines', color: '#fff', icon: <FileText size={15} /> },
              { label: 'GSTR-2B Matched', value: displayCount(summary.matched), note: summary.reconciliationAvailable ? 'Source-file matches' : 'No GSTR-2B source', color: '#10b981', icon: <ShieldCheck size={15} /> },
              { label: 'Unmatched Tax Total', value: displayMoney(summary.totalTaxAtRisk), note: summary.reconciliationAvailable ? `${displayCount(summary.unmatched)} unmatched invoices` : 'Match status unknown', color: '#f87171', icon: <AlertTriangle size={15} /> },
              { label: 'Safe to Hold', value: displayCount(summary.safeCount), note: 'Synthetic triage bucket', color: 'var(--safe-color)', icon: <PauseCircle size={15} /> },
              { label: 'Watch', value: displayCount(summary.watchCount), note: 'Synthetic triage bucket', color: 'var(--watch-color)', icon: <Eye size={15} /> },
              { label: 'Chase Now', value: displayCount(summary.chaseCount), note: 'Synthetic triage bucket', color: 'var(--chase-color)', icon: <AlertTriangle size={15} /> },
            ].map((card) => (
              <div key={card.label} className="kpi-card" style={{ background: 'var(--navy-card)', border: '1px solid var(--navy-border)', borderRadius: 12, padding: 16, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: '0 0 auto', height: 3, background: card.color }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: card.color }}>{card.label}{card.icon}</div>
                <div style={{ marginTop: 8, fontSize: 20, fontWeight: 800, color: '#fff', overflowWrap: 'anywhere' }}>{card.value}</div>
                <div style={{ marginTop: 4, fontSize: 11, color: 'var(--navy-muted)' }}>{card.note}</div>
              </div>
            ))}
          </section>
          {summary.reconciliationAvailable && (
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ display: 'inline-flex', background: 'rgba(0,0,0,.3)', border: '1px solid var(--navy-border)', borderRadius: 8, padding: 3, gap: 3 }}>
                {(['ALL', 'UNMATCHED', 'MATCHED'] as const).map((filter) => (
                  <button key={filter} onClick={() => setMatchFilter(filter)} style={{ border: 0, borderRadius: 6, padding: '6px 10px', cursor: 'pointer', color: matchFilter === filter ? '#fff' : 'var(--navy-muted)', background: matchFilter === filter ? '#7c3aed' : 'transparent', fontSize: 11, fontWeight: 700 }}>
                    {filter === 'ALL' ? `All ${displayCount(summary.total)}` : filter === 'MATCHED' ? `Matched ${displayCount(summary.matched)}` : `Unmatched ${displayCount(summary.unmatched)}`}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <span style={{ color: 'var(--navy-muted)', fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 6 }}><ArrowRight size={12} color="#60a5fa" /> Source data → reconciliation → transparent triage</span>
          </div>
        </>
      )}
    </>
  );
}
