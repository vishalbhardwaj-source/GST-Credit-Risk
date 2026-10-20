import { Cpu, X } from 'lucide-react';

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
          maxWidth: '780px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Cpu size={20} color="#818cf8" />
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>
                ML Resolution Forecaster &amp; Backtest Diagnostics
              </h2>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--navy-muted)', marginTop: '4px' }}>
              Module C Architecture: LightGBM Gradient Boosted Trees trained on 1,200 multi-month synthetic cohort transactions across 6 tax periods (Apr–Sep 2025).
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Core Validation Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--navy-border)', borderRadius: '10px', padding: '14px' }}>
            <span style={{ fontSize: '11px', color: 'var(--navy-muted)', textTransform: 'uppercase', fontWeight: 600 }}>ROC-AUC Metric</span>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#34d399', marginTop: '4px' }}>0.9858</div>
            <span style={{ fontSize: '10px', color: 'var(--navy-muted)' }}>Baseline Logistic: 0.651</span>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--navy-border)', borderRadius: '10px', padding: '14px' }}>
            <span style={{ fontSize: '11px', color: 'var(--navy-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Balanced Accuracy</span>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#a78bfa', marginTop: '4px' }}>91.9%</div>
            <span style={{ fontSize: '10px', color: 'var(--navy-muted)' }}>Plain Accuracy: 95.0%</span>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--navy-border)', borderRadius: '10px', padding: '14px' }}>
            <span style={{ fontSize: '11px', color: 'var(--navy-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Risk Catch Rate</span>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#34d399', marginTop: '4px' }}>87.0%</div>
            <span style={{ fontSize: '10px', color: 'var(--navy-muted)' }}>40 of 46 defaults caught</span>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--navy-border)', borderRadius: '10px', padding: '14px' }}>
            <span style={{ fontSize: '11px', color: 'var(--navy-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Brier Error</span>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#60a5fa', marginTop: '4px' }}>0.0383</div>
            <span style={{ fontSize: '10px', color: 'var(--navy-muted)' }}>Calibrated probability error</span>
          </div>
        </div>

        {/* Confusion Matrix Table */}
        <div style={{ background: 'rgba(0, 0, 0, 0.25)', border: '1px solid var(--navy-border)', borderRadius: '10px', padding: '16px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>
            Held-Out Evaluation Confusion Matrix (N = 240)
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
            *Overall Plain Accuracy: 95.0% ((40 + 188) / 240) | Balanced Accuracy: 91.9% ((87.0% + 96.9%) / 2). High sensitivity on defaulting invoices catches 87.0% of genuine tax risks.
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
