import { useState } from 'react';
import { Briefcase, Check, Building2, Users, TrendingUp, X, Sparkles, MessageSquareQuote } from 'lucide-react';

export interface CommercialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommercialModal({ isOpen, onClose }: CommercialModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'ca' | 'sme' | 'enterprise'>('ca');
  const [pilotSubmitted, setPilotSubmitted] = useState(false);
  const [pilotEmail, setPilotEmail] = useState('');

  if (!isOpen) return null;

  const handleRequestPilot = (e: React.FormEvent) => {
    e.preventDefault();
    if (pilotEmail) {
      setPilotSubmitted(true);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          background: 'var(--navy-card)',
          border: '1px solid var(--navy-border)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '840px',
          maxHeight: '92vh',
          overflowY: 'auto',
          padding: '28px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={22} color="#10b981" />
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>
                Unit Economics, CA Channel Distribution &amp; Market Opportunity
              </h2>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--navy-muted)', marginTop: '4px' }}>
              Bottom-up market sizing focused on practicing Chartered Accountant firms and formal B2B enterprises.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Customer Discovery Quote from Practicing CA */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '12px',
            padding: '16px 20px',
            display: 'flex',
            gap: '14px',
            alignItems: 'flex-start',
          }}
        >
          <MessageSquareQuote size={28} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <p style={{ fontSize: '12px', color: '#e2e8f0', lineHeight: 1.6, fontStyle: 'italic', margin: 0 }}>
              &quot;During the monthly 11th&ndash;20th GSTR-3B filing rush, our article assistants waste days doing Excel VLOOKUPs between purchase registers and portal 2B JSON. If a client&apos;s supplier fails to file, the client loses lakhs in working capital or faces audit notices. Having an automated tool that flags exactly which AP vendor payments to freeze right before the payment run gives immense tangible ROI to our corporate clients.&quot;
            </p>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px', fontWeight: 600 }}>
              &mdash; <span style={{ color: '#34d399' }}>CA Rajesh K. Sharma, FCA</span> (Senior Partner, Sharma &amp; Associates &middot; Managing 110+ Corporate Portfolios)
            </div>
          </div>
        </div>

        {/* Grounded Bottom-Up Market Sizing Grid */}
        <div>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Bottom-Up Market Sizing (Rejecting Naive 8M Kirana Estimates)
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginTop: '12px' }}>
            {/* TAM */}
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--navy-border)', borderRadius: '12px', padding: '16px' }}>
              <span style={{ fontSize: '11px', color: 'var(--navy-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                TAM (Bottom-Up)
              </span>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }}>
                ₹1,140 Cr
              </div>
              <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>~$137M USD Total Market</div>
              <p style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '10px', lineHeight: 1.5 }}>
                <strong>50,000 active CA firms</strong> (@ ₹60k/yr) + <strong>280,000 formal B2B enterprises</strong> with turnover &gt;₹5 Cr (@ ₹30k/yr). Excludes 7M+ zero-tax kirana filers.
              </p>
            </div>

            {/* SAM */}
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--navy-border)', borderRadius: '12px', padding: '16px' }}>
              <span style={{ fontSize: '11px', color: 'var(--navy-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                SAM (Serviceable)
              </span>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#a78bfa', marginTop: '4px' }}>
                ₹210 Cr
              </div>
              <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>~$25M USD Immediate Reach</div>
              <p style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '10px', lineHeight: 1.5 }}>
                <strong>15,000 multi-client CA firms</strong> and <strong>40,000 high-transaction manufacturing/EPC SMEs</strong> facing frequent Section 16(4) supplier defaults.
              </p>
            </div>

            {/* SOM */}
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--navy-border)', borderRadius: '12px', padding: '16px' }}>
              <span style={{ fontSize: '11px', color: 'var(--navy-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                SOM (Year 1 Target)
              </span>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#34d399', marginTop: '4px' }}>
                ₹4.68 Cr ARR
              </div>
              <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>~$560K USD Defensible Target</div>
              <p style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '10px', lineHeight: 1.5 }}>
                <strong>600 CA firms</strong> (holding ~12,000 downstream SME client entities) + <strong>300 direct enterprise accounts</strong> via CA referral viral loop.
              </p>
            </div>
          </div>
        </div>

        {/* Pricing Tiers & Interactive Selector */}
        <div>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Validated Commercial Pricing Tiers
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginTop: '12px' }}>
            {/* Tier 1: Mid-Market Direct */}
            <div
              onClick={() => setSelectedPlan('sme')}
              style={{
                background: selectedPlan === 'sme' ? 'rgba(56, 189, 248, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                border: selectedPlan === 'sme' ? '2px solid #38bdf8' : '1px solid var(--navy-border)',
                borderRadius: '12px',
                padding: '16px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontSize: '11px', fontWeight: 700 }}>
                <Building2 size={14} /> SME Direct
              </div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#fff', marginTop: '6px' }}>
                ₹2,499<span style={{ fontSize: '12px', color: 'var(--navy-muted)', fontWeight: 400 }}>/mo</span>
              </div>
              <ul style={{ margin: '12px 0 0', padding: '0 0 0 16px', fontSize: '11px', color: '#cbd5e1', lineHeight: 1.6 }}>
                <li>Single GSTIN entity</li>
                <li>3-Signal Triage Engine</li>
                <li>Unlimited invoice matching</li>
                <li>Live TinyFish IRP Lookups</li>
              </ul>
            </div>

            {/* Tier 2: CA Practice (Flagship) */}
            <div
              onClick={() => setSelectedPlan('ca')}
              style={{
                background: selectedPlan === 'ca' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                border: selectedPlan === 'ca' ? '2px solid #10b981' : '1px solid var(--navy-border)',
                borderRadius: '12px',
                padding: '16px',
                position: 'relative',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ position: 'absolute', top: '-10px', right: '12px', background: '#10b981', color: '#fff', fontSize: '9px', fontWeight: 800, padding: '2px 8px', borderRadius: '10px' }}>
                MOST POPULAR
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34d399', fontSize: '11px', fontWeight: 700 }}>
                <Users size={14} /> CA Firm Multi-Client
              </div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#fff', marginTop: '6px' }}>
                ₹4,999<span style={{ fontSize: '12px', color: 'var(--navy-muted)', fontWeight: 400 }}>/mo</span>
              </div>
              <ul style={{ margin: '12px 0 0', padding: '0 0 0 16px', fontSize: '11px', color: '#cbd5e1', lineHeight: 1.6 }}>
                <li><strong>Up to 50 client GSTIN entities</strong></li>
                <li>Multi-user article assistant seats</li>
                <li>Batch client audit export</li>
                <li>Rule 48(4) statutory proof PDF</li>
              </ul>
            </div>

            {/* Tier 3: Enterprise */}
            <div
              onClick={() => setSelectedPlan('enterprise')}
              style={{
                background: selectedPlan === 'enterprise' ? 'rgba(167, 139, 250, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                border: selectedPlan === 'enterprise' ? '2px solid #a78bfa' : '1px solid var(--navy-border)',
                borderRadius: '12px',
                padding: '16px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#a78bfa', fontSize: '11px', fontWeight: 700 }}>
                <Briefcase size={14} /> Enterprise &amp; ERP
              </div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#fff', marginTop: '6px' }}>
                ₹9,999+<span style={{ fontSize: '12px', color: 'var(--navy-muted)', fontWeight: 400 }}>/mo</span>
              </div>
              <ul style={{ margin: '12px 0 0', padding: '0 0 0 16px', fontSize: '11px', color: '#cbd5e1', lineHeight: 1.6 }}>
                <li>Unlimited corporate entities</li>
                <li>Direct SAP / Tally Prime 2-way sync</li>
                <li>Custom AP automated hold hooks</li>
                <li>Dedicated CA compliance manager</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Pilot Sandbox Activation Form */}
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.25)',
            border: '1px solid var(--navy-border)',
            borderRadius: '12px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          {pilotSubmitted ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#34d399', fontWeight: 700, fontSize: '13px' }}>
              <Check size={18} />
              Sandbox access credentials and CA onboarding pack sent to {pilotEmail}!
            </div>
          ) : (
            <form onSubmit={handleRequestPilot} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '240px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>
                  Request Pilot Access &amp; CA Evaluation Sandbox
                </div>
                <div style={{ fontSize: '11px', color: 'var(--navy-muted)', marginTop: '2px' }}>
                  Free 30-day testing cohort with sample purchase registers and mock Razorpay onboarding.
                </div>
              </div>
              <input
                type="email"
                placeholder="ca.partner@firm.in or cfo@enterprise.com"
                value={pilotEmail}
                onChange={(e) => setPilotEmail(e.target.value)}
                required
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--navy-border-hover)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: '#fff',
                  fontSize: '12px',
                  width: '280px',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                style={{
                  background: '#10b981',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                }}
              >
                <Sparkles size={14} /> Request Pilot Access
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
