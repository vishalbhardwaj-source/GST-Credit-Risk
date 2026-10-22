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
import { formatINR } from '../utils';

export interface DashboardHeaderProps {
  wf1Status: any;
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
  setShowSynopsis: (val: boolean) => void;
  activeView?: 'overview' | 'dashboard';
  onViewChange?: (view: 'overview' | 'dashboard') => void;
  kpis: {
    total: number;
    matched: number;
    unmatched: number;
    totalTaxAtRisk: number;
    safeCount: number;
    safeTax: number;
    watchCount: number;
    watchTax: number;
    chaseCount: number;
    chaseTax: number;
  };
  matchFilter: 'ALL' | 'MATCHED' | 'UNMATCHED';
  setMatchFilter: (val: 'ALL' | 'MATCHED' | 'UNMATCHED') => void;
}

export function DashboardHeader({
  wf1Status,
  apiConnected,
  isRouted,
  isRouting,
  onReset,
  onOpenBacktestModal,
  onExportCsv,
  onRunRouting,
  onOpenUploadModal,
  onOpenTinyFishModal,
  isCustomDataActive,
  customDataName,
  onResetToDemo,
  showSynopsis,
  setShowSynopsis,
  activeView = 'dashboard',
  onViewChange,
  kpis,
  matchFilter,
  setMatchFilter,
}: DashboardHeaderProps) {
  return (
    <>
      {/* Legal & Trust Persistent Banner */}
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
            <strong style={{ color: '#fff' }}>Synthetic demo data.</strong> Triage support only—not tax or legal advice. Does not access government systems or determine legal ITC eligibility.
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {wf1Status && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                color: '#34d399',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 600,
              }}
            >
              <ShieldCheck size={13} />
              CBIC Notif. No. 12/2024 Verified · Nov 30 Cutoff Active
            </span>
          )}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              color: apiConnected ? '#34d399' : '#94a3b8',
              fontSize: '11px',
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: apiConnected ? '#10b981' : '#f59e0b',
                display: 'inline-block',
                boxShadow: apiConnected ? '0 0 6px #10b981' : 'none',
              }}
            />
            {apiConnected ? 'Cloud API Connected (FastAPI & TinyFish)' : 'Standalone Client Mode (Offline Engine)'}
          </span>
          <span style={{ color: '#94a3b8', fontSize: '11px', whiteSpace: 'nowrap' }}>
            Section 16(2)(aa) Decision Support
          </span>
        </div>
      </div>

      {/* Main Header / Control Center */}
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
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                background: 'linear-gradient(135deg, #9F6FF0, #7C3AED)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '18px',
                color: '#fff',
              }}
            >
              ₹
            </div>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>
                GST Credit-at-Risk Forecaster
              </h1>
              <p style={{ color: 'var(--navy-muted)', fontSize: '12px', marginTop: '2px' }}>
                Reconciles purchase registers against GSTR-2B and turns 30 discrepancies into explainable action buckets.
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher: Overview vs Dashboard */}
        <div
          style={{
            display: 'inline-flex',
            background: 'rgba(0, 0, 0, 0.4)',
            padding: '3px',
            borderRadius: '9px',
            border: '1px solid var(--navy-border)',
          }}
        >
          <button
            onClick={() => onViewChange?.('overview')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '7px',
              border: 'none',
              background: activeView === 'overview' ? '#9F6FF0' : 'transparent',
              color: activeView === 'overview' ? '#fff' : 'var(--navy-muted)',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            <FileText size={13} />
            Executive Pitch
          </button>
          <button
            onClick={() => onViewChange?.('dashboard')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '7px',
              border: 'none',
              background: activeView === 'dashboard' ? '#9F6FF0' : 'transparent',
              color: activeView === 'dashboard' ? '#fff' : 'var(--navy-muted)',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            <Activity size={13} />
            Live Triage Console
          </button>
        </div>

        {/* Global Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isCustomDataActive ? (
            <button
              onClick={onResetToDemo}
              title="Click to reset to default 200-invoice demo"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                color: '#34d399',
                fontWeight: 600,
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={13} />
              Reset Demo ({customDataName ? customDataName.slice(0, 18) + (customDataName.length > 18 ? '...' : '') : 'Custom Active'})
            </button>
          ) : (
            isRouted && (
              <button
                onClick={onReset}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--navy-border)',
                  fontWeight: 600,
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                <RotateCcw size={14} />
                Reset Demo
              </button>
            )
          )}

          <button
            onClick={onOpenTinyFishModal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              background: 'rgba(56, 189, 248, 0.15)',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              color: '#38bdf8',
              fontWeight: 600,
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Sparkles size={14} />
            Test Any GSTIN
          </button>

          <button
            onClick={onOpenUploadModal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              background: 'rgba(159, 111, 240, 0.15)',
              border: '1px solid rgba(159, 111, 240, 0.4)',
              color: '#d8b4fe',
              fontWeight: 600,
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Upload size={14} />
            Upload Data
          </button>

          <button
            onClick={onOpenBacktestModal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              background: 'rgba(183, 148, 246, 0.15)',
              border: '1px solid rgba(183, 148, 246, 0.35)',
              color: '#a5b4fc',
              fontWeight: 600,
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            <Activity size={14} />
            ML Backtest &amp; Diagnostics
          </button>

          <button
            onClick={onExportCsv}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--navy-border)',
              fontWeight: 600,
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            <Download size={14} />
            Export CSV
          </button>

          <button
            onClick={onRunRouting}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 18px',
              borderRadius: '8px',
              background: isRouted ? '#10b981' : '#9F6FF0',
              color: '#fff',
              border: 'none',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(159, 111, 240, 0.3)',
            }}
          >
            <Play size={14} fill="#fff" />
            {isRouted ? 'Re-run Routing' : 'Run Pipeline Routing'}
          </button>
        </div>
      </header>

      {activeView === 'dashboard' && (
        <>
          {/* Starting Situation Synopsis / Executive Briefing Card */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9))',
          border: '1px solid rgba(183, 148, 246, 0.3)',
          borderRadius: '14px',
          padding: '16px 20px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
        }}
      >
        {/* Synopsis Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                background: 'rgba(183, 148, 246, 0.15)',
                border: '1px solid rgba(183, 148, 246, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#60a5fa',
              }}
            >
              <FileText size={15} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>
                  Situation Synopsis — Starting Reconciliation Assessment
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    background: isRouted ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: isRouted ? '#34d399' : '#fbbf24',
                    border: `1px solid ${isRouted ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                    padding: '1px 8px',
                    borderRadius: '9999px',
                  }}
                >
                  {isRouted ? 'Triaged & De-Risked' : 'Pre-Analysis: Raw Mismatch State'}
                </span>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--navy-muted)', marginTop: '2px' }}>
                Context: Month-end GSTR-2B vs. Purchase Register auto-ingestion for Tax Period Sep 2026.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowSynopsis(!showSynopsis)}
            style={{
              background: 'transparent',
              border: '1px solid var(--navy-border)',
              borderRadius: '6px',
              color: 'var(--navy-muted)',
              cursor: 'pointer',
              padding: '4px 8px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              fontWeight: 600,
            }}
          >
            {showSynopsis ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {showSynopsis ? 'Collapse Synopsis' : 'Expand Synopsis'}
          </button>
        </div>

        {/* Collapsible Content */}
        {showSynopsis && (
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* 3 Executive Pillars */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
              {/* Pillar 1: The Problem */}
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.06)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '10px',
                  padding: '12px 14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f87171', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' }}>
                  <ShieldAlert size={14} />
                  <span>1. The Initial Problem</span>
                </div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#fff', marginTop: '6px' }}>
                  30 Unmatched Invoices · {formatINR(kpis.totalTaxAtRisk)}
                </div>
                <p style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '4px', lineHeight: 1.5 }}>
                  Out of <strong>200 total purchase invoices</strong>, 170 matched seamlessly in auto-generated GSTR-2B (85%). The remaining 30 invoices (15%) are absent, creating nominal tax risk under Section 16(2)(aa).
                </p>
              </div>

              {/* Pillar 2: The Core Challenge */}
              <div
                style={{
                  background: 'rgba(245, 158, 11, 0.06)',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                  borderRadius: '10px',
                  padding: '12px 14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fbbf24', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' }}>
                  <AlertTriangle size={14} />
                  <span>2. The Trap to Avoid</span>
                </div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#fff', marginTop: '6px' }}>
                  Avoid Blanket Chasing &amp; Blind Vendor Escalation
                </div>
                <p style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '4px', lineHeight: 1.5 }}>
                  Without triage, accounts teams waste hundreds of hours manually chasing all 30 suppliers or holding payments unnecessarily, souring vendor trust. Over 80% are simply routine filing lag.
                </p>
              </div>

              {/* Pillar 3: The Triaged Solution */}
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.06)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  borderRadius: '10px',
                  padding: '12px 14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34d399', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' }}>
                  <ShieldCheck size={14} />
                  <span>3. The Forecaster's Objective</span>
                </div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#fff', marginTop: '6px' }}>
                  {isRouted ? '25 Hold · 4 Watch · 1 Chase' : 'Route into 3 Transparent Action Buckets'}
                </div>
                <p style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '4px', lineHeight: 1.5 }}>
                  {isRouted
                    ? '94% of nominal risk is safely absorbed by AP retention leverage and verified IRN footprint. True legal chase urgency is isolated to 1 critical supplier.'
                    : 'Click "Run Pipeline Routing" below to fuse IRN footprint, AP leverage, and 6-month filing periodicity into transparent risk-calibrated recommendations.'}
                </p>
              </div>
            </div>

            {/* Quick Flow Narrative Footer */}
            <div
              style={{
                background: 'rgba(0, 0, 0, 0.25)',
                borderRadius: '8px',
                padding: '8px 14px',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                fontSize: '11px',
                color: 'var(--navy-muted)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#fff', fontWeight: 700 }}>Starting Flow:</span>
                <span>200 PR Invoices</span>
                <ArrowRight size={12} color="#60a5fa" />
                <span>170 Matched GSTR-2B</span>
                <ArrowRight size={12} color="#60a5fa" />
                <span style={{ color: '#f87171', fontWeight: 600 }}>30 Mismatch Discrepancies</span>
                <ArrowRight size={12} color="#60a5fa" />
                <span style={{ color: '#34d399', fontWeight: 700 }}>Triage Engine</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>Statutory Horizon:</span>
                <strong style={{ color: '#fff' }}>Section 16(4) Cutoff 30 Nov 2026</strong>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' }}>
        {/* Total Purchase Invoices */}
        <div
          className="kpi-card"
          onClick={() => setMatchFilter('ALL')}
          style={{
            background: 'var(--navy-card)',
            border: '1px solid var(--navy-border)',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            cursor: 'pointer',
          }}
        >
          <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--navy-muted)' }}>
            Total Register Invoices
          </span>
          <div style={{ marginTop: '8px', fontSize: '26px', fontWeight: 800, color: '#fff' }}>
            {kpis.total}
          </div>
          <div style={{ marginTop: '4px', fontSize: '11px', color: 'var(--navy-muted)' }}>
            Imported purchase lines
          </div>
        </div>

        {/* Matched in GSTR-2B */}
        <div
          className="kpi-card"
          onClick={() => setMatchFilter('MATCHED')}
          style={{
            background: 'var(--navy-card)',
            border: '1px solid var(--navy-border)',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            cursor: 'pointer',
          }}
        >
          <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--navy-muted)' }}>
            GSTR-2B Matched
          </span>
          <div style={{ marginTop: '8px', fontSize: '26px', fontWeight: 800, color: '#10b981' }}>
            {kpis.matched}
          </div>
          <div style={{ marginTop: '4px', fontSize: '11px', color: 'var(--navy-muted)' }}>
            85% reconciliation rate
          </div>
        </div>

        {/* Unmatched Invoices / Total Tax at Risk */}
        <div
          className="kpi-card"
          onClick={() => setMatchFilter('UNMATCHED')}
          style={{
            background: 'var(--navy-card)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#f87171' }}>
              Unmatched Discrepancies
            </span>
            <span className="badge badge-chase">{kpis.unmatched} items</span>
          </div>
          <div style={{ marginTop: '8px', fontSize: '22px', fontWeight: 800, color: '#fff' }}>
            {formatINR(kpis.totalTaxAtRisk)}
          </div>
          <div style={{ marginTop: '4px', fontSize: '11px', color: 'var(--navy-muted)' }}>
            GST tax amount at risk
          </div>
        </div>

        {/* Safe to Hold */}
        <div
          className="kpi-card"
          style={{
            background: 'var(--navy-card)',
            border: '1px solid var(--safe-border)',
            borderRadius: '12px',
            padding: '16px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'var(--safe-color)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--safe-color)' }}>
              Safe to Hold
            </span>
            <PauseCircle size={15} color="var(--safe-color)" />
          </div>
          <div style={{ marginTop: '8px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            {isRouting ? (
              <div style={{ width: '100%' }}>
                <div className="skeleton-shimmer" style={{ height: '28px', width: '56px', borderRadius: '6px' }} />
                <div className="skeleton-shimmer" style={{ height: '11px', width: '90px', borderRadius: '6px', marginTop: '6px' }} />
              </div>
            ) : (
              <>
                <span style={{ fontSize: '26px', fontWeight: 800, color: '#fff' }}>
                  {isRouted ? kpis.safeCount : '—'}
                </span>
                {isRouted && (
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--navy-muted)' }}>
                    {formatINR(kpis.safeTax)}
                  </span>
                )}
              </>
            )}
          </div>
          <div style={{ marginTop: '4px', fontSize: '11px', color: 'var(--navy-muted)' }}>
            {isRouting ? '' : isRouted ? 'Likely timing difference' : 'Awaiting routing'}
          </div>
        </div>

        {/* Watch */}
        <div
          className="kpi-card"
          style={{
            background: 'var(--navy-card)',
            border: '1px solid var(--watch-border)',
            borderRadius: '12px',
            padding: '16px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'var(--watch-color)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--watch-color)' }}>
              Watch
            </span>
            <Eye size={15} color="var(--watch-color)" />
          </div>
          <div style={{ marginTop: '8px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            {isRouting ? (
              <div style={{ width: '100%' }}>
                <div className="skeleton-shimmer" style={{ height: '28px', width: '56px', borderRadius: '6px' }} />
                <div className="skeleton-shimmer" style={{ height: '11px', width: '90px', borderRadius: '6px', marginTop: '6px' }} />
              </div>
            ) : (
              <>
                <span style={{ fontSize: '26px', fontWeight: 800, color: '#fff' }}>
                  {isRouted ? kpis.watchCount : '—'}
                </span>
                {isRouted && (
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--navy-muted)' }}>
                    {formatINR(kpis.watchTax)}
                  </span>
                )}
              </>
            )}
          </div>
          <div style={{ marginTop: '4px', fontSize: '11px', color: 'var(--navy-muted)' }}>
            {isRouting ? '' : isRouted ? 'Mixed signals; review again' : 'Awaiting routing'}
          </div>
        </div>

        {/* Chase Now */}
        <div
          className="kpi-card"
          style={{
            background: 'var(--navy-card)',
            border: '1px solid var(--chase-border)',
            borderRadius: '12px',
            padding: '16px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'var(--chase-color)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--chase-color)' }}>
              Chase Now
            </span>
            <AlertTriangle size={15} color="var(--chase-color)" />
          </div>
          <div style={{ marginTop: '8px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            {isRouting ? (
              <div style={{ width: '100%' }}>
                <div className="skeleton-shimmer" style={{ height: '28px', width: '56px', borderRadius: '6px' }} />
                <div className="skeleton-shimmer" style={{ height: '11px', width: '90px', borderRadius: '6px', marginTop: '6px' }} />
              </div>
            ) : (
              <>
                <span style={{ fontSize: '26px', fontWeight: 800, color: '#fff' }}>
                  {isRouted ? kpis.chaseCount : '—'}
                </span>
                {isRouted && (
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--navy-muted)' }}>
                    {formatINR(kpis.chaseTax)}
                  </span>
                )}
              </>
            )}
          </div>
          <div style={{ marginTop: '4px', fontSize: '11px', color: 'var(--navy-muted)' }}>
            {isRouting ? '' : isRouted ? 'High urgency follow-up' : 'Awaiting routing'}
          </div>
        </div>
      </div>

      {/* Before-and-After Pipeline Narrative */}
      <div
        style={{
          background: 'var(--navy-surface)',
          border: '1px solid var(--navy-border)',
          borderRadius: '14px',
          overflow: 'hidden',
        }}
      >
        {/* Header row */}
        <div
          style={{
            padding: '12px 20px',
            borderBottom: '1px solid var(--navy-border)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            background: 'rgba(255,255,255,0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={14} color="#B794F6" />
            <span style={{ fontWeight: 700, color: '#fff', fontSize: '13px' }}>
              {isRouted ? 'Pipeline Routing Complete' : 'Pre-Routing — Invoice Reconciliation View'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setMatchFilter('ALL')}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid var(--navy-border)',
                background: matchFilter === 'ALL' ? '#B794F6' : 'transparent',
                color: matchFilter === 'ALL' ? '#fff' : 'var(--navy-muted)',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              All 200
            </button>
            <button
              onClick={() => setMatchFilter('UNMATCHED')}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid var(--navy-border)',
                background: matchFilter === 'UNMATCHED' ? '#ef4444' : 'transparent',
                color: matchFilter === 'UNMATCHED' ? '#fff' : 'var(--navy-muted)',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Unmatched 30
            </button>
            <button
              onClick={() => setMatchFilter('MATCHED')}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid var(--navy-border)',
                background: matchFilter === 'MATCHED' ? '#10b981' : 'transparent',
                color: matchFilter === 'MATCHED' ? '#fff' : 'var(--navy-muted)',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Matched 170
            </button>
          </div>
        </div>

        {/* Visual flow strip */}
        <div
          style={{
            padding: '16px 20px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          {/* BEFORE node */}
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: '10px',
              padding: '10px 16px',
              minWidth: '110px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '10px', color: '#f87171', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Before
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#fff', marginTop: '2px' }}>30</div>
            <div style={{ fontSize: '10px', color: 'var(--navy-muted)' }}>Unmatched</div>
          </div>

          <div style={{ color: 'var(--navy-muted)', fontSize: '18px', fontWeight: 200 }}>→</div>

          {/* Pipeline box */}
          <div
            style={{
              background: 'rgba(159, 111, 240, 0.08)',
              border: '1px solid rgba(183, 148, 246, 0.25)',
              borderRadius: '10px',
              padding: '10px 16px',
              textAlign: 'center',
              minWidth: '130px',
            }}
          >
            <div style={{ fontSize: '10px', color: '#60a5fa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              3-Signal Pipeline
            </div>
            <div style={{ fontSize: '11px', color: 'var(--navy-muted)', marginTop: '4px' }}>IRN · AP Leverage</div>
            <div style={{ fontSize: '11px', color: 'var(--navy-muted)' }}>Filing Periodicity</div>
          </div>

          <div style={{ color: 'var(--navy-muted)', fontSize: '18px', fontWeight: 200 }}>→</div>

          {/* AFTER buckets */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <div
              style={{
                background: 'var(--safe-bg)',
                border: '1px solid var(--safe-border)',
                borderRadius: '10px',
                padding: '10px 14px',
                textAlign: 'center',
                opacity: isRouted ? 1 : 0.35,
                transition: 'opacity 0.3s',
                minWidth: '90px',
              }}
            >
              <div style={{ fontSize: '10px', color: 'var(--safe-color)', fontWeight: 700, textTransform: 'uppercase' }}>
                Safe Hold
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#fff', marginTop: '2px' }}>
                {isRouted ? kpis.safeCount : '?'}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--navy-muted)' }}>Monitor only</div>
            </div>
            <div
              style={{
                background: 'var(--watch-bg)',
                border: '1px solid var(--watch-border)',
                borderRadius: '10px',
                padding: '10px 14px',
                textAlign: 'center',
                opacity: isRouted ? 1 : 0.35,
                transition: 'opacity 0.3s',
                minWidth: '90px',
              }}
            >
              <div style={{ fontSize: '10px', color: 'var(--watch-color)', fontWeight: 700, textTransform: 'uppercase' }}>
                Watch
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#fff', marginTop: '2px' }}>
                {isRouted ? kpis.watchCount : '?'}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--navy-muted)' }}>Review before cutoff</div>
            </div>
            <div
              style={{
                background: 'var(--chase-bg)',
                border: '1px solid var(--chase-border)',
                borderRadius: '10px',
                padding: '10px 14px',
                textAlign: 'center',
                opacity: isRouted ? 1 : 0.35,
                transition: 'opacity 0.3s',
                minWidth: '90px',
              }}
            >
              <div style={{ fontSize: '10px', color: 'var(--chase-color)', fontWeight: 700, textTransform: 'uppercase' }}>
                Chase Now
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#fff', marginTop: '2px' }}>
                {isRouted ? kpis.chaseCount : '?'}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--navy-muted)' }}>Immediate action</div>
            </div>
          </div>

          {!isRouted && (
            <button
              onClick={onRunRouting}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 18px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #9F6FF0, #7C3AED)',
                color: '#fff',
                border: 'none',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(159, 111, 240, 0.35)',
                marginLeft: 'auto',
              }}
            >
              <Play size={14} fill="#fff" />
              Run Pipeline Routing
            </button>
          )}
        </div>
      </div>
        </>
      )}
    </>
  );
}
