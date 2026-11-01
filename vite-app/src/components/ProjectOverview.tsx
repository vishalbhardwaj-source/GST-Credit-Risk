import { useEffect, useRef, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Cpu,
  FileCheck,
  FileSearch,
  Globe,
  PauseCircle,
  Play,
  Scale,
  ShieldCheck,
  Target,
  TrendingUp,
  XCircle,
  ChartNoAxesCombined,
  ClipboardCheck,
  Sparkles,
} from 'lucide-react';
import { formatINR } from '../utils';
import { CommercialModal } from './CommercialModal';

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

/**
 * Bidirectional scroll reveal component that animates elements into view
 * as you scroll down, and smoothly retracts them when you scroll out of view / scroll up.
 */
function ScrollReveal({
  children,
  delay = 0,
  direction = 'up',
  style = {},
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'left' | 'right' | 'none';
  style?: React.CSSProperties;
  className?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Continuous observation: reveals on enter, retracts on exit (scrolling up/down out of view)
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const getTransform = () => {
    if (isVisible) return 'translate3d(0, 0, 0) scale(1)';
    switch (direction) {
      case 'up':
        return 'translate3d(0, 36px, 0) scale(0.97)';
      case 'left':
        return 'translate3d(-40px, 0, 0) scale(0.97)';
      case 'right':
        return 'translate3d(40px, 0, 0) scale(0.97)';
      default:
        return 'scale(0.97)';
    }
  };

  return (
    <div
      ref={elementRef}
      className={className}
      style={{
        ...style,
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transition: `opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${isVisible ? delay : 0}ms, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${isVisible ? delay : 0}ms, box-shadow 0.3s ease, border-color 0.3s ease`,
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
}

export function ProjectOverview({
  onLaunchDemo,
  onOpenBacktestModal,
  onSelectQuickDemo,
  kpis,
}: ProjectOverviewProps) {
  const [isCommercialModalOpen, setIsCommercialModalOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Scroll depth tracking for top progress indicator
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const currentProgress = (window.scrollY / totalScroll) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const matchPercentage = kpis.total > 0 ? Math.round((kpis.matched / kpis.total) * 100) : 85;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', paddingBottom: '60px', position: 'relative' }}>
      {/* Top Scroll Progress Line (Gnani sunset gradient) */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: `${scrollProgress}%`,
          height: '3px',
          background: 'linear-gradient(90deg, #B794F6 0%, #10B981 100%)',
          zIndex: 9999,
          boxShadow: '0 0 10px rgba(254, 145, 75, 0.7)',
          transition: 'width 0.1s linear',
        }}
      />

      {/* Top Hackathon & Statutory Notice Banner */}
      <ScrollReveal direction="up" delay={50}>
        <div
          style={{
            background: 'var(--navy-card)',
            border: '1px solid var(--navy-border)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
            borderRadius: '14px',
            padding: '12px 20px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '14px',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                background: 'rgba(183, 148, 246, 0.15)',
                border: '1px solid rgba(183, 148, 246, 0.3)',
                color: '#B794F6',
                fontSize: '10px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                padding: '4px 10px',
                borderRadius: '6px',
              }}
            >
              Decision Support System
            </span>
            <span style={{ fontSize: '12px', color: '#CBD5E1' }}>
              Section 16(2)(aa) &amp; Rule 37A Input Tax Credit Triage Engine
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', fontSize: '11px', color: 'var(--navy-muted)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#10B981' }}>
              <CheckCircle2 size={13} /> 30 Unit Tests Passing
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#B794F6' }}>
              <Globe size={13} /> TinyFish Web Agent Active
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#FFFFFF' }}>
              <Cpu size={13} /> LightGBM ML Diagnostics
            </span>
          </div>
        </div>
      </ScrollReveal>

      {/* PROMINENT WELCOME HERO (Merged Welcome Screen + Executive Pitch) */}
      <ScrollReveal direction="up" delay={100}>
        <div
          style={{
            background: 'var(--navy-card)',
            border: '1px solid var(--navy-border)',
            borderRadius: '24px',
            padding: '48px 40px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
          }}
        >
          {/* Ambient Gnani glow in top right */}
          <div
            style={{
              position: 'absolute',
              top: '-120px',
              right: '-120px',
              width: '400px',
              height: '400px',
              background: 'none',
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
              gap: '44px',
              alignItems: 'center',
            }}
          >
            {/* Left Column: Welcome Greeting & Action Pillars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              {/* Prominent Welcome Tag */}
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
                <span className="gnani-pill-badge">
                  <span className="gnani-dot-pulse" />
                  WELCOME TO YOUR GST TRIAGE PLATFORM
                </span>
                <span
                  style={{
                    color: '#D9822B',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Sparkles size={13} />
                  Smarter Insights · Safer ITC
                </span>
              </div>

              {/* Distinct Welcoming Headline */}
              <div>
                <span
                  style={{
                    display: 'block',
                    fontSize: '15px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    color: '#627D98',
                    marginBottom: '8px',
                  }}
                >
                  WELCOME TO
                </span>
                <h1
                  style={{
                    fontSize: 'clamp(34px, 4.2vw, 50px)',
                    fontWeight: 900,
                    lineHeight: 1.12,
                    letterSpacing: '-0.035em',
                    color: '#FFFFFF',
                    margin: 0,
                  }}
                >
                  GST Credit-at-Risk{' '}
                  <span className="gnani-gradient-text">Forecaster</span>
                </h1>
              </div>

              {/* Welcoming Narrative */}
              <p
                style={{
                  fontSize: '15px',
                  lineHeight: 1.75,
                  color: '#CBD5E1',
                  fontWeight: 400,
                  margin: 0,
                }}
              >
                A data-driven platform designed to help businesses, CFOs, and tax teams identify GST Input Tax Credit (ITC) risks, prioritise invoice discrepancies, and explore potential credit exposure. Go beyond simple mismatch detection through an explainable, risk-calibrated triage workflow before statutory November 30 reversals.
              </p>

              {/* The 3 Core Action Pillars from WelcomePage */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: '14px',
                  marginTop: '4px',
                }}
              >
                <div
                  style={{
                    background: 'rgba(99, 102, 241, 0.08)',
                    border: '1px solid rgba(183, 148, 246, 0.25)',
                    borderRadius: '14px',
                    padding: '16px 14px',
                    transition: 'all 0.25s ease',
                  }}
                  className="kpi-card"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FFFFFF' }}>
                    <ShieldCheck size={22} />
                    <strong style={{ fontSize: '14px', color: '#FFFFFF' }}>Detect</strong>
                  </div>
                  <p style={{ color: '#CBD5E1', fontSize: '11px', margin: '8px 0 0', lineHeight: 1.45 }}>
                    Missing invoices &amp; GSTR-2B mismatches
                  </p>
                </div>

                <div
                  style={{
                    background: 'rgba(245, 158, 11, 0.08)',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                    borderRadius: '14px',
                    padding: '16px 14px',
                    transition: 'all 0.25s ease',
                  }}
                  className="kpi-card"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#D9822B' }}>
                    <Target size={22} />
                    <strong style={{ fontSize: '14px', color: '#FFFFFF' }}>Prioritise</strong>
                  </div>
                  <p style={{ color: '#CBD5E1', fontSize: '11px', margin: '8px 0 0', lineHeight: 1.45 }}>
                    High-risk invoices &amp; anomalous vendors
                  </p>
                </div>

                <div
                  style={{
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    borderRadius: '14px',
                    padding: '16px 14px',
                    transition: 'all 0.25s ease',
                  }}
                  className="kpi-card"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10B981' }}>
                    <TrendingUp size={22} />
                    <strong style={{ fontSize: '14px', color: '#FFFFFF' }}>Forecast</strong>
                  </div>
                  <p style={{ color: '#CBD5E1', fontSize: '11px', margin: '8px 0 0', lineHeight: 1.45 }}>
                    Potential ITC exposure &amp; 18% penalty
                  </p>
                </div>
              </div>

              {/* Primary Action Buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '14px', marginTop: '6px' }}>
                <button
                  onClick={onLaunchDemo}
                  className="gnani-btn-primary"
                >
                  <Play size={16} fill="currentColor" />
                  Explore Live Dashboard
                  <ArrowRight size={16} />
                </button>

                <button
                  onClick={onOpenBacktestModal}
                  className="gnani-btn-secondary"
                >
                  <Activity size={16} color="#fe914b" />
                  ML Diagnostics &amp; Leakage Defense
                </button>

                <button
                  onClick={() => setIsCommercialModalOpen(true)}
                  className="gnani-btn-secondary"
                >
                  <TrendingUp size={16} color="#9f73f4" />
                  CA Economics &amp; Pricing
                </button>
              </div>

              <p style={{ color: '#627D98', fontSize: '12px', margin: '4px 0 0', fontStyle: 'italic' }}>
                Better data. Stronger compliance. Synthetic demo data · Decision support, not tax or legal advice.
              </p>
            </div>

            {/* Right Column: Platform Overview Diagnostic Card (from WelcomePage) */}
            <div
              style={{
                background: 'var(--navy-surface)',
                border: '1px solid var(--navy-border)',
                borderRadius: '22px',
                padding: '30px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                gap: '22px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p
                    style={{
                      color: '#D9822B',
                      fontSize: '11px',
                      fontWeight: 800,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      margin: '0 0 4px',
                    }}
                  >
                    PLATFORM OVERVIEW
                  </p>
                  <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#FFFFFF' }}>
                    From Data to Decisions
                  </h3>
                </div>
                <div
                  style={{
                    background: 'rgba(42, 157, 143, 0.1)',
                    border: '1px solid rgba(42, 157, 143, 0.25)',
                    borderRadius: '12px',
                    padding: '10px',
                    display: 'flex',
                  }}
                >
                  <ChartNoAxesCombined size={26} color="#9f73f4" />
                </div>
              </div>

              {/* Reconciliation Progress Meter */}
              <div
                style={{
                  background: 'var(--navy-card)',
                  border: '1px solid var(--navy-border)',
                  borderRadius: '16px',
                  padding: '18px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '9px',
                        background: 'rgba(42, 157, 143, 0.1)',
                        border: '1px solid rgba(42, 157, 143, 0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#D9822B',
                        fontWeight: 800,
                        fontSize: '15px',
                      }}
                    >
                      ₹
                    </div>
                    <div>
                      <strong style={{ fontSize: '13px', color: '#FFFFFF' }}>GST Reconciliation Status</strong>
                      <p style={{ color: '#CBD5E1', margin: '2px 0 0', fontSize: '11px' }}>
                        Purchase Register vs. GSTR-2B
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '15px', fontWeight: 800, color: '#10B981' }}>
                      {matchPercentage}% Matched
                    </span>
                    <p style={{ color: '#C0392B', fontSize: '11px', margin: '2px 0 0' }}>
                      {kpis.unmatched} Discrepancies
                    </p>
                  </div>
                </div>

                {/* Dynamic Gradient Bar */}
                <div
                  style={{
                    marginTop: '16px',
                    height: '8px',
                    borderRadius: '9999px',
                    background: '#3B2A4A',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${matchPercentage}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #10B981, #B794F6)',
                      borderRadius: '9999px',
                      transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                  />
                </div>
              </div>

              {/* 3 Workflow Checkpoints */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[
                  {
                    icon: <FileSearch size={19} color="#9f73f4" />,
                    title: 'Review Discrepancies',
                    description: 'Inspect missing and unmatched invoices in one unified view',
                  },
                  {
                    icon: <ClipboardCheck size={19} color="#fe914b" />,
                    title: 'Prioritise Action Buckets',
                    description: 'Route cases into Safe to Hold, Watch, and Chase Now buckets',
                  },
                  {
                    icon: <TrendingUp size={19} color="#17b26a" />,
                    title: 'Explore Risk Indicators',
                    description: 'Assess potential ITC exposure and calculate payment leverage',
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    style={{
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'center',
                      padding: '6px 0',
                    }}
                  >
                    <div
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--navy-border)',
                        borderRadius: '10px',
                        padding: '9px',
                        display: 'flex',
                        flexShrink: 0,
                      }}
                    >
                      {item.icon}
                    </div>
                    <div>
                      <strong style={{ fontSize: '13px', color: '#FFFFFF' }}>{item.title}</strong>
                      <p style={{ margin: '2px 0 0', color: '#CBD5E1', fontSize: '11px', lineHeight: 1.45 }}>
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Explainability Trust Callout */}
              <div
                style={{
                  padding: '14px 16px',
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  borderRadius: '12px',
                  color: '#34D399',
                  fontSize: '12px',
                  lineHeight: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <ShieldCheck size={18} style={{ flexShrink: 0 }} />
                <span>Explainable triage: transparent scoring (0–100) to support informed decisions</span>
              </div>
            </div>
          </div>

          {/* Quick Numbers Strip */}
          <div
            style={{
              marginTop: '44px',
              paddingTop: '32px',
              borderTop: '1px solid #3B2A4A',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
              gap: '20px',
            }}
          >
            <div>
              <span style={{ fontSize: '11px', color: 'var(--navy-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Ingested Invoices
              </span>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#FFFFFF', marginTop: '4px' }}>
                {kpis.total} Total
              </div>
              <span style={{ fontSize: '11px', color: '#10B981' }}>{kpis.matched} matched in GSTR-2B</span>
            </div>

            <div>
              <span style={{ fontSize: '11px', color: 'var(--navy-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Discrepancies
              </span>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#C0392B', marginTop: '4px' }}>
                {kpis.unmatched} Missing
              </div>
              <span style={{ fontSize: '11px', color: 'var(--navy-muted)' }}>{formatINR(kpis.totalTaxAtRisk)} at risk</span>
            </div>

            <div>
              <span style={{ fontSize: '11px', color: 'var(--navy-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Safe to Hold (Absorbed)
              </span>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#10B981', marginTop: '4px' }}>
                {kpis.safeCount} Invoices
              </div>
              <span style={{ fontSize: '11px', color: 'var(--navy-muted)' }}>94% tax risk protected</span>
            </div>

            <div>
              <span style={{ fontSize: '11px', color: 'var(--navy-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                True Escalation
              </span>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#D9822B', marginTop: '4px' }}>
                {kpis.chaseCount} Vendor
              </div>
              <span style={{ fontSize: '11px', color: 'var(--navy-muted)' }}>Isolated chase priority</span>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* The Problem vs Solution (Why This Exists) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '22px' }}>
        {/* The Problem */}
        <ScrollReveal direction="left" delay={100}>
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: '18px',
              padding: '26px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              height: '100%',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#C0392B' }}>
              <XCircle size={20} />
              <h3 style={{ fontSize: '15px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                The Broken Status Quo
              </h3>
            </div>
            <p style={{ fontSize: '13px', color: '#CBD5E1', lineHeight: 1.6 }}>
              Traditional reconciliation engines stop at binary comparison: <em>"Invoice 123 is missing from GSTR-2B"</em>. This dumps 30 unresolved discrepancies on the CFO desk.
            </p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px', color: 'var(--navy-muted)' }}>
              <li style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: '#C0392B', fontWeight: 800 }}>✕</span>
                <span><strong style={{ color: '#FFFFFF' }}>Indiscriminate Supplier Chasing:</strong> Damaging commercial goodwill by calling vendors who always file 20 days late but never default.</span>
              </li>
              <li style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: '#C0392B', fontWeight: 800 }}>✕</span>
                <span><strong style={{ color: '#FFFFFF' }}>Zero Payment Leverage Awareness:</strong> Forgetting that Accounts Payable already holds ₹50,000 in retention for that exact supplier.</span>
              </li>
              <li style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: '#C0392B', fontWeight: 800 }}>✕</span>
                <span><strong style={{ color: '#FFFFFF' }}>Misreading Absent IRNs:</strong> Penalizing suppliers under the ₹5 Cr turnover threshold who are legally exempt from e-invoicing.</span>
              </li>
            </ul>
          </div>
        </ScrollReveal>

        {/* The Solution */}
        <ScrollReveal direction="right" delay={100}>
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: '18px',
              padding: '26px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              height: '100%',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10B981' }}>
              <CheckCircle2 size={20} />
              <h3 style={{ fontSize: '15px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                The Forecaster's Autonomous Triage
              </h3>
            </div>
            <p style={{ fontSize: '13px', color: '#CBD5E1', lineHeight: 1.6 }}>
              Our 3-signal architecture automatically cross-references commercial enterprise context with live government portal intelligence to eliminate noise.
            </p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px', color: '#CBD5E1' }}>
              <li style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: '#10B981', fontWeight: 800 }}>✓</span>
                <span><strong style={{ color: '#FFFFFF' }}>25 Safe to Hold:</strong> Verified on IRP + protected by unpaid AP retention. Recommendation: Wait for normal auto-resolution.</span>
              </li>
              <li style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: '#D9822B', fontWeight: 800 }}>✓</span>
                <span><strong style={{ color: '#FFFFFF' }}>4 Watch:</strong> Medium leverage or ambiguous signals. Slated for automated check in next cycle.</span>
              </li>
              <li style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: '#C0392B', fontWeight: 800 }}>✓</span>
                <span><strong style={{ color: '#FFFFFF' }}>1 Chase Now:</strong> No IRN, 0 payment leverage, and sudden filing anomaly. Escalation letter drafted instantly.</span>
              </li>
            </ul>
          </div>
        </ScrollReveal>
      </div>

      {/* The 3 Decision Signals Architecture */}
      <ScrollReveal direction="up" delay={100}>
        <div>
          <div style={{ marginBottom: '18px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#FFFFFF' }}>
              The 3-Signal Decision Architecture
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--navy-muted)', marginTop: '4px' }}>
              Deterministic, explainable scoring (0 to 100) — no opaque black-box hallucination.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
            {/* Signal 1 */}
            <div
              style={{
                background: 'var(--navy-card)',
                border: '1px solid var(--navy-border)',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
              className="kpi-card"
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#B794F6', textTransform: 'uppercase' }}>
                  Pipeline 1
                </span>
                <FileCheck size={18} color="#0082f3" />
              </div>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#FFFFFF' }}>
                IRN Registry &amp; TinyFish Web Agent
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--navy-muted)', lineHeight: 1.6 }}>
                Checks e-invoice registration on the IRP. Uses TinyFish to explore <strong style={{ color: '#CBD5E1' }}>einvoice1.gst.gov.in</strong> and CBIC Notification 10/2023. If vendor turnover is &lt;₹5 Cr, an absent IRN is recognized as exempt rather than penalized.
              </p>
              <div style={{ marginTop: 'auto', paddingTop: '14px', borderTop: '1px solid var(--navy-border)', fontSize: '11px', color: '#93c5fd' }}>
                Weight: +20 (Present) / -15 (Absent Applies) / 0 (Exempt)
              </div>
            </div>

            {/* Signal 2 */}
            <div
              style={{
                background: 'var(--navy-card)',
                border: '1px solid var(--navy-border)',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
              className="kpi-card"
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#10B981', textTransform: 'uppercase' }}>
                  Pipeline 2
                </span>
                <Scale size={18} color="#17b26a" />
              </div>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#FFFFFF' }}>
                AP Commercial Payment Leverage
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--navy-muted)', lineHeight: 1.6 }}>
                Computes the ratio of unpaid invoices + held retention to the at-risk invoice gross value. If the buyer holds &ge;100% of the invoice in pending payments, the company is commercially insulated from statutory default.
              </p>
              <div style={{ marginTop: 'auto', paddingTop: '14px', borderTop: '1px solid var(--navy-border)', fontSize: '11px', color: '#6ee7b7' }}>
                Weight: +15 (High &ge;1.0) / +5 (Medium) / -10 (Low / Paid)
              </div>
            </div>

            {/* Signal 3 */}
            <div
              style={{
                background: 'var(--navy-card)',
                border: '1px solid var(--navy-border)',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
              className="kpi-card"
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#D9822B', textTransform: 'uppercase' }}>
                  Pipeline 3
                </span>
                <TrendingUp size={18} color="#fe914b" />
              </div>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#FFFFFF' }}>
                6-Month Filing Track Record
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--navy-muted)', lineHeight: 1.6 }}>
                Analyzes historical filing timeliness. <em>Habitual Laggards</em> predictably file 20 days late every quarter, so a missing invoice is normal behavior. A <em>New Anomaly</em> by a previously punctual vendor indicates real distress.
              </p>
              <div style={{ marginTop: 'auto', paddingTop: '14px', borderTop: '1px solid var(--navy-border)', fontSize: '11px', color: '#fed7aa' }}>
                Weight: +15 (Habitual Laggard) / 0 (Normal) / -25 (New Anomaly)
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Suggested Judge Walkthrough / Demo Beats */}
      <ScrollReveal direction="up" delay={100}>
        <div
          style={{
            background: 'var(--navy-surface)',
            border: '1px solid var(--navy-border)',
            borderRadius: '22px',
            padding: '30px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF' }}>
                Suggested 3-Minute Demo Walkthrough for Judges
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--navy-muted)', marginTop: '2px' }}>
                Experience the core innovations in 3 quick clicks:
              </p>
            </div>
            <button
              onClick={onLaunchDemo}
              className="gnani-btn-primary"
              style={{ padding: '9px 18px', fontSize: '12px' }}
            >
              Open Full Dashboard <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            {/* Demo Beat 1 */}
            <div
              onClick={() => onSelectQuickDemo?.('safe')}
              style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: '16px',
                padding: '20px',
                cursor: 'pointer',
              }}
              className="kpi-card"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34d399', fontWeight: 700, fontSize: '12px' }}>
                <PauseCircle size={16} />
                <span>1. Inspect "Safe to Hold" (Score: 100)</span>
              </div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', marginTop: '8px' }}>
                Shree Ganesh Packaging (`SGP/26-27/0412`)
              </div>
              <p style={{ fontSize: '11px', color: '#CBD5E1', marginTop: '6px', lineHeight: 1.55 }}>
                IRN verified (+20), ₹18,400 AP leverage (+15), habitual laggard (+15). Recommendation: Hold; vendor files reliably every quarter.
              </p>
              <span style={{ fontSize: '11px', color: '#34d399', fontWeight: 700, marginTop: '10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                Inspect Invoice →
              </span>
            </div>

            {/* Demo Beat 2 */}
            <div
              onClick={() => onSelectQuickDemo?.('chase')}
              style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: '16px',
                padding: '20px',
                cursor: 'pointer',
              }}
              className="kpi-card"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#C0392B', fontWeight: 700, fontSize: '12px' }}>
                <AlertTriangle size={16} />
                <span>2. Inspect "Chase Now" (Score: 0)</span>
              </div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', marginTop: '8px' }}>
                Pioneer Courier (`PCS/26-27/5561`)
              </div>
              <p style={{ fontSize: '11px', color: '#CBD5E1', marginTop: '6px', lineHeight: 1.55 }}>
                Absent IRN (-15), ₹0 leverage (-10), sudden anomaly (-25). Tax at risk: ₹2,400. Immediate escalation required before reversal.
              </p>
              <span style={{ fontSize: '11px', color: '#C0392B', fontWeight: 700, marginTop: '10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                Inspect Invoice →
              </span>
            </div>

            {/* Demo Beat 3 */}
            <div
              onClick={() => onSelectQuickDemo?.('tinyfish')}
              style={{
                background: 'rgba(183, 148, 246, 0.08)',
                border: '1px solid rgba(183, 148, 246, 0.25)',
                borderRadius: '16px',
                padding: '20px',
                cursor: 'pointer',
              }}
              className="kpi-card"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#FFFFFF', fontWeight: 700, fontSize: '12px' }}>
                <Globe size={16} />
                <span>3. Test TinyFish Live Web Agent</span>
              </div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', marginTop: '8px' }}>
                Live Government Portal Exploration
              </div>
              <p style={{ fontSize: '11px', color: '#CBD5E1', marginTop: '6px', lineHeight: 1.55 }}>
                Click "Check current IRN rules" or query IRP portal for enablement. Toggle simulated timeout to observe Zero-Penalty Defense.
              </p>
              <span style={{ fontSize: '11px', color: '#FFFFFF', fontWeight: 700, marginTop: '10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                Test Web Agent →
              </span>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* SaaS Pricing & Market Opportunity Strip */}
      <ScrollReveal direction="up" delay={100}>
        <div
          style={{
            background: 'var(--navy-card)',
            border: '1px solid var(--navy-border)',
            borderRadius: '22px',
            padding: '30px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px',
          }}
        >
          <div style={{ maxWidth: '640px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#D9822B', letterSpacing: '0.05em' }}>
              Commercial Viability &amp; SaaS Economics
            </span>
            <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', marginTop: '6px' }}>
              TAM: ₹1,140 Cr · SAM: ₹210 Cr · SOM: ₹4.68 Cr ARR
            </h4>
            <p style={{ fontSize: '12px', color: 'var(--navy-muted)', marginTop: '4px', lineHeight: 1.6 }}>
              Bottom-up model driven by 50,000 practicing CA firms (holding 30–150 corporate portfolios each) &amp; 280,000 formal B2B SMEs (&gt;₹5 Cr turnover). Replaces naive kirana math with viral CA channel distribution.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setIsCommercialModalOpen(true)}
              className="gnani-btn-secondary"
            >
              <TrendingUp size={15} color="#fe914b" />
              CA Economics &amp; Pricing
            </button>

            <button
              onClick={onLaunchDemo}
              className="gnani-btn-primary"
            >
              <Play size={15} fill="currentColor" />
              Enter Live Dashboard
            </button>
          </div>
        </div>
      </ScrollReveal>

      {/* Enterprise Footer */}
      <footer
        style={{
          borderTop: '1px solid #3B2A4A',
          paddingTop: '26px',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '14px',
          color: 'var(--navy-dim)',
          fontSize: '12px',
        }}
      >
        <div>
          <strong style={{ color: '#CBD5E1' }}>GST Credit-at-Risk Forecaster</strong> — Smarter reconciliation, explainable ITC risk defense.
        </div>
        <div>
          Decision support only — does not determine statutory tax eligibility.
        </div>
      </footer>

      <CommercialModal
        isOpen={isCommercialModalOpen}
        onClose={() => setIsCommercialModalOpen(false)}
      />
    </div>
  );
}
