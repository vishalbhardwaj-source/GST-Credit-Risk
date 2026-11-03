import { useState } from 'react';
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
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showPipelineFlow, setShowPipelineFlow] = useState(false);
  return (
    <>
      {/* Legal & Trust Persistent Banner */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--navy-border)',
          borderRadius: '10px',
          padding: '10px 16px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          fontSize: '12px',
          color: 'var(--navy-muted)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Info size={16} color="var(--accent-primary)" />
          <span>
            <strong style={{ color: 'var(--navy-heading)' }}>Synthetic demo data.</strong> Triage support only—not tax or legal advice. Does not access government systems or determine legal ITC eligibility.
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {wf1Status && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                color: 'var(--safe-light)',
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
              color: apiConnected ? 'var(--safe-light)' : 'var(--navy-dim)',
              fontSize: '11px',
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: apiConnected ? 'var(--safe-color)' : 'var(--watch-color)',
                display: 'inline-block',
                boxShadow: apiConnected ? '0 0 6px #10b981' : 'none',
              }}
            />
            {apiConnected ? 'Cloud API Connected (FastAPI & TinyFish)' : 'Standalone Client Mode (Offline Engine)'}
          </span>
          <span style={{ color: 'var(--navy-dim)', fontSize: '11px', whiteSpace: 'nowrap' }}>
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
                background: 'linear-gradient(135deg, #B794F6 0%, #9F6FF0 100%)',
                border: 'none',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '18px',
                color: 'var(--navy-heading)',
              }}
            >
              ₹
            </div>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--navy-heading)' }}>
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
            background: 'rgba(255, 255, 255, 0.05)',
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
              background: activeView === 'overview' ? 'var(--surface-card)' : 'transparent',
              color: activeView === 'overview' ? '#FFFFFF' : 'var(--navy-muted)',
              boxShadow: activeView === 'overview' ? '0 2px 8px rgba(0,0,0,0.4)' : 'none',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            <FileText size={13} />
            Executive Pitch &amp; Overview
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
              background: activeView === 'dashboard' ? 'var(--surface-card)' : 'transparent',
              color: activeView === 'dashboard' ? '#FFFFFF' : 'var(--navy-muted)',
              boxShadow: activeView === 'dashboard' ? '0 2px 8px rgba(0,0,0,0.4)' : 'none',
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
              onClick={() => setShowResetConfirm(true)}
              title="Click to reset to default 200-invoice demo"
              aria-label="Reset custom data to default demo records"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                color: 'var(--safe-light)',
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
                  color: 'var(--navy-text)',
                  fontWeight: 600,
                  fontSize: '12px',
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(16, 42, 67, 0.05)',
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
              color: 'var(--accent-cyan)',
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
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: 'var(--navy-text)',
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
              background: 'rgba(159, 115, 244, 0.12)',
              border: '1px solid rgba(159, 115, 244, 0.3)',
              color: 'var(--accent-primary)',
              fontWeight: 600,
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            <Activity size={14} />
            ML Diagnostics &amp; Audit
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
              color: 'var(--navy-text)',
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
              padding: '11px 22px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: 'var(--navy-heading)',
              border: 'none',
              fontWeight: 800,
              fontSize: '13px',
              letterSpacing: '0.01em',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(16, 185, 129, 0.35)',
              transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <Play size={14} fill="var(--navy-heading)" />
            {isRouted ? 'Re-run Routing' : 'Run Pipeline Routing'}
          </button>
        </div>
      </header>

      {activeView === 'dashboard' && (
        <>
          {/* Starting Situation Synopsis / Executive Briefing Card */}
      <div
        style={{
          background: 'var(--navy-surface)',
          border: '1px solid var(--navy-border)',
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
                background: 'rgba(159, 115, 244, 0.12)',
                border: '1px solid rgba(159, 115, 244, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-cyan)',
              }}
            >
              <FileText size={15} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--navy-heading)', letterSpacing: '-0.01em' }}>
                  {isRouted ? 'Situation Synopsis — Triage & Reconciliation Assessment' : 'Situation Synopsis — Starting Ingestion Assessment'}
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    background: isRouted ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                    color: isRouted ? 'var(--safe-light)' : 'var(--accent-primary)',
                    border: `1px solid ${isRouted ? 'rgba(16, 185, 129, 0.3)' : 'rgba(99, 102, 241, 0.3)'}`,
                    padding: '1px 8px',
                    borderRadius: '9999px',
                  }}
                >
                  {isRouted ? 'Triaged & De-Risked' : 'Pre-Pipeline: Ingestion Ready'}
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
              {/* Pillar 1: Ingestion / Problem */}
              <div
                style={{
                  background: isRouted ? 'rgba(239, 68, 68, 0.06)' : 'rgba(99, 102, 241, 0.06)',
                  border: `1px solid ${isRouted ? 'rgba(239, 68, 68, 0.2)' : 'rgba(99, 102, 241, 0.2)'}`,
                  borderRadius: '10px',
                  padding: '12px 14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: isRouted ? 'var(--chase-light)' : 'var(--accent-cyan)', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' }}>
                  <ShieldAlert size={14} />
                  <span>{isRouted ? '1. The Identified Problem' : '1. Ingested Purchase Register'}</span>
                </div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--navy-heading)', marginTop: '6px' }}>
                  {isRouted ? `${kpis.unmatched} Unmatched Invoices · ${formatINR(kpis.totalTaxAtRisk)}` : `${kpis.total} Purchase Invoices Ingested`}
                </div>
                <p style={{ fontSize: '11px', color: 'var(--navy-text)', marginTop: '4px', lineHeight: 1.5 }}>
                  {isRouted ? (
                    <>
                      Out of <strong>{kpis.total} total purchase invoices</strong>, {kpis.matched} matched seamlessly in auto-generated GSTR-2B ({Math.round((kpis.matched / (kpis.total || 1)) * 100)}%). The remaining {kpis.unmatched} invoices are absent, creating nominal tax risk under Section 16(2)(aa).
                      {/* Confirmation Modal for Resetting Custom Data */}
      {showResetConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-confirm-title"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(5, 10, 24, 0.82)',
            backdropFilter: 'blur(6px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setShowResetConfirm(false)}
        >
          <div
            style={{
              background: 'var(--navy-card)',
              border: '1px solid var(--navy-border)',
              borderRadius: '14px',
              maxWidth: '460px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--chase-color)',
                }}
              >
                <RotateCcw size={18} />
              </div>
              <h3 id="reset-confirm-title" style={{ fontSize: '16px', fontWeight: 700, color: 'var(--navy-heading)', margin: 0 }}>
                Discard Custom Dataset?
              </h3>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--navy-muted)', lineHeight: 1.5, margin: 0 }}>
              You currently have custom enterprise data loaded ({customDataName || 'Custom Active'}). Reverting to synthetic demo records will discard your active session analysis.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
              <button
                onClick={() => setShowResetConfirm(false)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '7px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--navy-border)',
                  color: 'var(--navy-text)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Keep Custom Data
              </button>
              <button
                onClick={() => {
                  setShowResetConfirm(false);
                  onResetToDemo?.();
                }}
                style={{
                  padding: '8px 14px',
                  borderRadius: '7px',
                  background: 'var(--chase-color)',
                  border: 'none',
                  color: 'var(--navy-heading)',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 10px rgba(239, 68, 68, 0.3)',
                }}
              >
                Confirm Revert
              </button>
            </div>
          </div>
        </div>
      )}
    </>
                  ) : (
                    <>
                      Total of <strong>{kpis.total} purchase invoices</strong> loaded from the internal Purchase Register for Tax Period Sep 2026. Automated GSTR-2B matching and multi-signal triage have not been executed yet.
                    </>
                  )}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--watch-light)', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' }}>
                  <AlertTriangle size={14} />
                  <span>{isRouted ? '2. The Trap to Avoid' : '2. Next Pipeline Step'}</span>
                </div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--navy-heading)', marginTop: '6px' }}>
                  {isRouted ? 'Avoid Blanket Chasing & Blind Vendor Escalation' : 'Execute Automated 2B Match & Triage'}
                </div>
                <p style={{ fontSize: '11px', color: 'var(--navy-text)', marginTop: '4px', lineHeight: 1.5 }}>
                  {isRouted
                    ? `Without triage, accounts teams waste hundreds of hours manually chasing all ${kpis.unmatched} suppliers or holding payments unnecessarily, souring vendor trust. Over 80% are simply routine filing lag.`
                    : 'Run the end-to-end reconciliation pipeline to compare purchase records against the GST portal 2B snapshot, identify discrepancies, and isolate high-risk suppliers.'}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--safe-light)', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' }}>
                  <ShieldCheck size={14} />
                  <span>3. The Forecaster's Objective</span>
                </div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--navy-heading)', marginTop: '6px' }}>
                  {isRouted ? '25 Hold · 4 Watch · 1 Chase' : 'Route into 3 Transparent Action Buckets'}
                </div>
                <p style={{ fontSize: '11px', color: 'var(--navy-text)', marginTop: '4px', lineHeight: 1.5 }}>
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
                border: '1px solid var(--navy-border)',
                borderRadius: '8px',
                padding: '8px 14px',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                fontSize: '11px',
                color: 'var(--navy-text)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: 'var(--navy-heading)', fontWeight: 700 }}>Starting Flow:</span>
                <span style={{ color: 'var(--navy-text)', fontWeight: 600 }}>{kpis.total} PR Invoices</span>
                <ArrowRight size={12} color="var(--accent-primary)" />
                {isRouted ? (
                  <>
                    <span style={{ color: 'var(--navy-muted)', fontWeight: 600 }}>{kpis.matched} Matched GSTR-2B</span>
                    <ArrowRight size={12} color="var(--accent-primary)" />
                    <span style={{ color: 'var(--chase-light)', fontWeight: 600 }}>{kpis.unmatched} Mismatch Discrepancies</span>
                    <ArrowRight size={12} color="var(--accent-primary)" />
                    <span style={{ color: 'var(--navy-heading)', fontWeight: 700 }}>Triage Engine</span>
                  </>
                ) : (
                  <>
                    <span style={{ color: 'var(--navy-muted)' }}>Awaiting Pipeline Execution</span>
                    <ArrowRight size={12} color="var(--accent-primary)" />
                    <span style={{ color: 'var(--navy-heading)', fontWeight: 600 }}>Cross-Match & Triage Engine</span>
                  </>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: 'var(--navy-muted)' }}>Statutory Horizon:</span>
                <strong style={{ color: 'var(--navy-heading)', fontWeight: 700 }}>Section 16(4) Cutoff 30 Nov 2026</strong>
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
          onClick={() => isRouted && setMatchFilter('ALL')}
          style={{
            background: 'var(--navy-card)',
            border: '1px solid var(--navy-border)',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            cursor: isRouted ? 'pointer' : 'default',
          }}
        >
          <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--navy-muted)' }}>
            Total Register Invoices
          </span>
          <div style={{ marginTop: '8px', fontSize: '26px', fontWeight: 800, color: 'var(--navy-heading)' }}>
            {kpis.total}
          </div>
          <div style={{ marginTop: '4px', fontSize: '11px', color: 'var(--navy-muted)', fontWeight: 500 }}>
            Imported purchase lines
          </div>
        </div>

        {/* Matched in GSTR-2B */}
        <div
          className="kpi-card"
          onClick={() => isRouted && setMatchFilter('MATCHED')}
          style={{
            background: 'var(--navy-card)',
            border: '1px solid var(--navy-border)',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            cursor: isRouted ? 'pointer' : 'default',
          }}
        >
          <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--navy-muted)' }}>
            GSTR-2B Matched
          </span>
          <div style={{ marginTop: '8px', fontSize: '26px', fontWeight: 800, color: isRouted ? 'var(--safe-light)' : 'var(--navy-muted)' }}>
            {isRouted ? kpis.matched : '—'}
          </div>
          <div style={{ marginTop: '4px', fontSize: '11px', color: 'var(--navy-muted)', fontWeight: 500 }}>
            {isRouted ? `${Math.round((kpis.matched / (kpis.total || 1)) * 100)}% reconciliation rate` : 'Awaiting pipeline'}
          </div>
        </div>

        {/* Unmatched Invoices / Total Tax at Risk */}
        <div
          className="kpi-card"
          onClick={() => isRouted && setMatchFilter('UNMATCHED')}
          style={{
            background: 'var(--navy-card)',
            border: isRouted ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--navy-border)',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            cursor: isRouted ? 'pointer' : 'default',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: isRouted ? 'var(--chase-light)' : 'var(--navy-muted)' }}>
              Unmatched Discrepancies
            </span>
            {isRouted ? (
              <span className="badge badge-chase">{kpis.unmatched} items</span>
            ) : (
              <span className="badge badge-neutral" style={{ opacity: 0.6 }}>Awaiting</span>
            )}
          </div>
          <div style={{ marginTop: '8px', fontSize: isRouted ? '22px' : '26px', fontWeight: 800, color: isRouted ? '#FFFFFF' : 'var(--navy-muted)' }}>
            {isRouted ? formatINR(kpis.totalTaxAtRisk) : '—'}
          </div>
          <div style={{ marginTop: '4px', fontSize: '11px', color: 'var(--navy-muted)', fontWeight: 500 }}>
            {isRouted ? 'GST tax amount at risk' : 'Awaiting pipeline'}
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
                <span style={{ fontSize: '26px', fontWeight: 800, color: 'var(--navy-heading)' }}>
                  {isRouted ? kpis.safeCount : '—'}
                </span>
                {isRouted && (
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--navy-muted)' }}>
                    {formatINR(kpis.safeTax)}
                  </span>
                )}
              </>
            )}
          </div>
          <div style={{ marginTop: '4px', fontSize: '11px', color: 'var(--navy-muted)', fontWeight: 500 }}>
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
                <span style={{ fontSize: '26px', fontWeight: 800, color: 'var(--navy-heading)' }}>
                  {isRouted ? kpis.watchCount : '—'}
                </span>
                {isRouted && (
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--navy-muted)' }}>
                    {formatINR(kpis.watchTax)}
                  </span>
                )}
              </>
            )}
          </div>
          <div style={{ marginTop: '4px', fontSize: '11px', color: 'var(--navy-muted)', fontWeight: 500 }}>
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
                <span style={{ fontSize: '26px', fontWeight: 800, color: 'var(--navy-heading)' }}>
                  {isRouted ? kpis.chaseCount : '—'}
                </span>
                {isRouted && (
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--chase-light)' }}>
                    {formatINR(kpis.chaseTax)}
                  </span>
                )}
              </>
            )}
          </div>
          <div style={{ marginTop: '4px', fontSize: '11px', color: 'var(--navy-muted)', fontWeight: 500 }}>
            {isRouting ? '' : isRouted ? 'High urgency follow-up' : 'Awaiting routing'}
          </div>
        </div>
      </div>

      {/* Before-and-After Pipeline Narrative Toggle */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-4px' }}>
        <button
          onClick={() => setShowPipelineFlow(!showPipelineFlow)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--accent-blue)',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 8px',
          }}
        >
          {showPipelineFlow ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          {showPipelineFlow ? 'Hide 3-Signal Pipeline Diagram' : 'View 3-Signal Pipeline Diagram'}
        </button>
      </div>

      {showPipelineFlow && (
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
            <Sparkles size={14} color="var(--accent-primary)" />
            <span style={{ fontWeight: 700, color: 'var(--navy-heading)', fontSize: '13px' }}>
              {isRouted ? 'Pipeline Routing Complete — Reconciled View' : 'Pre-Pipeline — Purchase Register View'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setMatchFilter('ALL')}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                background: matchFilter === 'ALL' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
                color: matchFilter === 'ALL' ? 'var(--surface-panel)' : 'var(--navy-muted)',
                border: '1px solid var(--navy-border)',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              All {kpis.total}
            </button>
            {isRouted && (
              <>
                <button
                  onClick={() => setMatchFilter('UNMATCHED')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: matchFilter === 'UNMATCHED' ? 'var(--chase-color)' : 'rgba(255,255,255,0.05)',
                    color: matchFilter === 'UNMATCHED' ? '#fff' : 'var(--navy-muted)',
                    border: '1px solid var(--navy-border)',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Unmatched {kpis.unmatched}
                </button>
                <button
                  onClick={() => setMatchFilter('MATCHED')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: matchFilter === 'MATCHED' ? 'var(--safe-color)' : 'rgba(255,255,255,0.05)',
                    color: matchFilter === 'MATCHED' ? '#fff' : 'var(--navy-muted)',
                    border: '1px solid var(--navy-border)',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Matched {kpis.matched}
                </button>
              </>
            )}
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
              background: isRouted ? 'rgba(239, 68, 68, 0.08)' : 'rgba(99, 102, 241, 0.08)',
              border: isRouted ? '1px solid rgba(239, 68, 68, 0.25)' : '1px solid rgba(99, 102, 241, 0.25)',
              borderRadius: '10px',
              padding: '10px 16px',
              minWidth: '110px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '10px', color: isRouted ? 'var(--chase-light)' : 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {isRouted ? 'Before' : 'Input'}
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--navy-heading)', marginTop: '2px' }}>
              {isRouted ? kpis.unmatched : kpis.total}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--navy-muted)', fontWeight: 600 }}>
              {isRouted ? 'Unmatched' : 'PR Invoices'}
            </div>
          </div>

          <div style={{ color: '#2A9D8F', fontSize: '18px', fontWeight: 700 }}>→</div>

          {/* Pipeline box */}
          <div
            style={{
              background: 'rgba(159, 111, 240, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              padding: '10px 16px',
              textAlign: 'center',
              minWidth: '130px',
            }}
          >
            <div style={{ fontSize: '10px', color: 'var(--navy-heading)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              3-Signal Pipeline
            </div>
            <div style={{ fontSize: '11px', color: 'var(--navy-text)', marginTop: '4px', fontWeight: 600 }}>IRN • AP Leverage</div>
            <div style={{ fontSize: '11px', color: 'var(--navy-text)', fontWeight: 600 }}>Filing Periodicity</div>
          </div>

          <div style={{ color: '#2A9D8F', fontSize: '18px', fontWeight: 700 }}>→</div>

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
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--navy-heading)', marginTop: '2px' }}>
                {isRouted ? kpis.safeCount : '?'}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--navy-muted)', fontWeight: 600 }}>Monitor only</div>
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
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--navy-heading)', marginTop: '2px' }}>
                {isRouted ? kpis.watchCount : '?'}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--navy-muted)', fontWeight: 600 }}>Review before cutoff</div>
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
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--navy-heading)', marginTop: '2px' }}>
                {isRouted ? kpis.chaseCount : '?'}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--chase-light)', fontWeight: 600 }}>Immediate action</div>
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
                background: '#102A43',
                color: 'var(--navy-heading)',
                border: 'none',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(255, 255, 255, 0.15)',
                marginLeft: 'auto',
              }}
            >
              <Play size={14} fill="var(--navy-heading)" />
              Run Pipeline Routing
            </button>
          )}
        </div>
      </div>
      )}
        </>
      )}
    </>
  );
}
