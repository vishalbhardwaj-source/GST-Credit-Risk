import { Cpu, X, AlertTriangle, ShieldCheck, Layers, GitBranch } from 'lucide-react';

export interface MlBacktestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MlBacktestModal({ isOpen, onClose }: MlBacktestModalProps) {
  if (!isOpen) return null;

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
          maxWidth: '820px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Cpu size={20} color="#818cf8" />
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>
                Module C: LightGBM Backtest &amp; Scientific Leakage Audit
              </h2>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--navy-muted)', marginTop: '4px' }}>
              Probabilistic Self-Resolution Forecaster evaluated on 1,200 multi-month transactions across 6 tax periods.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scientific Integrity & Leakage Reality Check */}
        <div
          style={{
            background: 'rgba(234, 179, 8, 0.08)',
            border: '1px solid rgba(234, 179, 8, 0.25)',
            borderRadius: '12px',
            padding: '14px 16px',
            fontSize: '11px',
            color: '#fef08a',
            lineHeight: 1.6,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '12px', color: '#facc15', marginBottom: '6px' }}>
            <AlertTriangle size={15} />
            Scientific Evaluation Disclosure: Synthetic Generator Overfitting vs. Real-World Tax Data
          </div>
          <p style={{ margin: 0 }}>
            <strong>Why 0.9858 ROC-AUC is an artifact of synthetic data:</strong> In any synthetic benchmark (<code>training_cohort.csv</code>), transactions are generated from parametric rules (e.g. archetype median lags and recovery rates). A tree-based model naturally learns those generative rules with near-zero loss. In professional machine learning, presenting 0.9858 on synthetic data as proof of real-world perfection is invalid due to synthetic generator leakage.
          </p>
          <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(234, 179, 8, 0.2)', color: '#e2e8f0' }}>
            <strong>Our Leakage-Controlled Validation:</strong> When evaluated strictly on unmatched discrepancy records with <strong>5-Fold GroupKFold cross-validation partitioned strictly by Supplier GSTIN</strong> (preventing vendor archetype leakage), balanced accuracy settles at a realistic <strong>86.2% – 93.3%</strong>, proving true out-of-supplier generalization beyond the 61.3% base rate.
          </div>
        </div>

        {/* Dual-Tier Safety Architecture Notice */}
        <div
          style={{
            background: 'rgba(56, 189, 248, 0.08)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: '12px',
            padding: '14px 16px',
            fontSize: '11px',
            color: '#bae6fd',
            lineHeight: 1.6,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '12px', color: '#38bdf8', marginBottom: '6px' }}>
            <ShieldCheck size={15} />
            Why Legal Tax Decisions Must Be Deterministic (Not Black-Box ML)
          </div>
          <p style={{ margin: 0 }}>
            Under Indian GST law (CGST Act Sec 16(4) and Rule 48(4)), input tax credit cannot legally or ethically be withheld or reversed based on an opaque ML gradient boosted tree. An assessing tax officer will reject &quot;our LightGBM tree predicted 82% probability&quot;.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
            <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <strong style={{ color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Layers size={13} /> Tier 1: Deterministic Compliance Engine (Primary)
              </strong>
              <div style={{ fontSize: '10.5px', color: '#94a3b8', marginTop: '4px' }}>
                100% legally auditable statutory logic: Governed by Rule 48(4) IRN existence, AP retention cash leverage, and Section 16(4) statutory calendar cutoffs.
              </div>
            </div>
            <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <strong style={{ color: '#818cf8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <GitBranch size={13} /> Tier 2: LightGBM Worklist Prioritization (Secondary)
              </strong>
              <div style={{ fontSize: '10.5px', color: '#94a3b8', marginTop: '4px' }}>
                Calculates Expected Loss (E[Loss] = Tax &times; (1 &minus; P_res)) strictly to sort human investigation priority within the ambiguous &quot;Watch&quot; bucket.
              </div>
            </div>
          </div>
        </div>

        {/* Core Validation Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--navy-border)', borderRadius: '10px', padding: '14px' }}>
            <span style={{ fontSize: '10px', color: 'var(--navy-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Synthetic Benchmark</span>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>0.9858 AUC</div>
            <span style={{ fontSize: '10px', color: '#94a3b8' }}>*Parametric Generator Artifact</span>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--navy-border)', borderRadius: '10px', padding: '14px' }}>
            <span style={{ fontSize: '10px', color: 'var(--navy-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Grouped-CV Accuracy</span>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#34d399', marginTop: '4px' }}>86.2% – 93.3%</div>
            <span style={{ fontSize: '10px', color: '#94a3b8' }}>Supplier-Partitioned (Leakage Free)</span>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--navy-border)', borderRadius: '10px', padding: '14px' }}>
            <span style={{ fontSize: '10px', color: 'var(--navy-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Default Catch Rate</span>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#a78bfa', marginTop: '4px' }}>87.0%</div>
            <span style={{ fontSize: '10px', color: '#94a3b8' }}>40 of 46 defaults detected</span>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--navy-border)', borderRadius: '10px', padding: '14px' }}>
            <span style={{ fontSize: '10px', color: 'var(--navy-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Primary Compliance</span>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }}>100% Rules</div>
            <span style={{ fontSize: '10px', color: '#94a3b8' }}>Deterministic Statutory Audit</span>
          </div>
        </div>

        {/* Confusion Matrix Table */}
        <div style={{ background: 'rgba(0, 0, 0, 0.25)', border: '1px solid var(--navy-border)', borderRadius: '10px', padding: '16px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>
            Held-Out Test Cohort Confusion Matrix (N = 240)
          </span>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '12px', fontSize: '12px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--navy-border)', color: 'var(--navy-muted)', textAlign: 'left' }}>
                <th style={{ padding: '8px' }}>Actual \ Predicted</th>
                <th style={{ padding: '8px' }}>Pred: Non-Resolved (Risk)</th>
                <th style={{ padding: '8px' }}>Pred: Resolved (Self-Correct)</th>
                <th style={{ padding: '8px' }}>Class Accuracy</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <td style={{ padding: '8px', fontWeight: 600, color: '#f87171' }}>Actual: Non-Resolved (46)</td>
                <td style={{ padding: '8px', color: '#34d399', fontWeight: 700 }}>40 (True Neg)</td>
                <td style={{ padding: '8px', color: '#f59e0b' }}>6 (False Pos)</td>
                <td style={{ padding: '8px', color: 'var(--navy-muted)' }}>87.0%</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontWeight: 600, color: '#34d399' }}>Actual: Resolved (194)</td>
                <td style={{ padding: '8px', color: '#f87171' }}>6 (False Neg)</td>
                <td style={{ padding: '8px', color: '#34d399', fontWeight: 700 }}>188 (True Pos)</td>
                <td style={{ padding: '8px', color: 'var(--navy-muted)' }}>96.9%</td>
              </tr>
            </tbody>
          </table>
          <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--navy-muted)' }}>
            *Evaluated on unseen held-out period transactions. High sensitivity on defaulting invoices catches 87.0% of genuine tax exposure without contaminating the primary rule-based compliance pipeline.
          </div>
        </div>

        {/* Feature Importance Gain Breakdown */}
        <div style={{ background: 'rgba(0, 0, 0, 0.25)', border: '1px solid var(--navy-border)', borderRadius: '10px', padding: '16px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>
            LightGBM Feature Importance (Total Gain Ranking)
          </span>
          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { name: 'Supplier Historical Filing Lag Median', gain: '5,411.8', pct: 100 },
              { name: 'On-Time Filing Ratio (6-Month Cohort)', gain: '1,623.7', pct: 30 },
              { name: 'Invoice Tax Amount Log Scale', gain: '546.7', pct: 10 },
              { name: 'Days Remaining to Statutory Cutoff', gain: '546.6', pct: 10 },
              { name: 'Routine Timing Lag Flag', gain: '309.7', pct: 6 },
              { name: 'Historical Recovery Rate', gain: '20.1', pct: 1 },
            ].map((f) => (
              <div key={f.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '2px' }}>
                  <span style={{ color: '#cbd5e1' }}>{f.name}</span>
                  <span style={{ fontFamily: 'monospace', color: '#818cf8', fontWeight: 600 }}>{f.gain} gain</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${f.pct}%`, height: '100%', background: 'linear-gradient(90deg, #B794F6, #B794F6)', borderRadius: '3px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            onClick={onClose}
            style={{
              background: '#9F6FF0',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontWeight: 600,
              fontSize: '12px',
              padding: '8px 16px',
              cursor: 'pointer',
            }}
          >
            Close Diagnostics
          </button>
        </div>
      </div>
    </div>
  );
}
