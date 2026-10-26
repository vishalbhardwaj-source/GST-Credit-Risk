import { AlertTriangle, Cpu, X } from 'lucide-react';

export interface MlBacktestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MlBacktestModal({ isOpen, onClose }: MlBacktestModalProps) {
  if (!isOpen) return null;
  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section className="modal-content" role="dialog" aria-modal="true" aria-labelledby="model-notes-title" onClick={(event) => event.stopPropagation()}>
        <header style={{ padding: '20px 24px', borderBottom: '1px solid var(--navy-border)', display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', background: 'linear-gradient(180deg, rgba(159,111,240,.08) 0%, transparent 100%)', position: 'sticky', top: 0, zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Cpu size={20} color="#818cf8" />
            <div>
              <h2 id="model-notes-title" style={{ color: '#fff', fontSize: 18 }}>Model evaluation notes</h2>
              <p style={{ marginTop: 2, color: '#94a3b8', fontSize: 11 }}>Synthetic model diagnostics and validation scope</p>
            </div>
          </div>
          <button type="button" aria-label="Close model notes" onClick={onClose} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid var(--navy-border)', borderRadius: 8, color: 'var(--navy-muted)', cursor: 'pointer', padding: 7, display: 'flex' }}><X size={18} /></button>
        </header>

        <div style={{ margin: 24, padding: 14, borderRadius: 10, border: '1px solid rgba(234,179,8,.25)', background: 'rgba(234,179,8,.08)', color: '#fef08a', fontSize: 12, lineHeight: 1.6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontWeight: 700, marginBottom: 5 }}>
            <AlertTriangle size={15} /> Synthetic evaluation only
          </div>
          The target is synthetic later GSTR-2B appearance, not legal ITC eligibility or payment recovery. The bundled demo corpus was used to train the model, so demo predictions are in-sample. No real-world validation is available.
        </div>

        <div style={{ padding: '0 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10 }}>
          {[
            ['Training rows', '1,400,000'],
            ['Supplier-group holdout rows', '280,546'],
            ['Holdout suppliers', '50'],
            ['Synthetic holdout AUC', '0.7188'],
            ['Synthetic holdout Brier', '0.1758'],
          ].map(([label, value]) => (
            <div key={label} className="kpi-card" style={{ padding: 13, borderRadius: 8, border: '1px solid var(--navy-border)', background: 'var(--navy-card)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: '0 0 auto', height: 2, background: '#9F6FF0' }} />
              <div style={{ color: 'var(--navy-muted)', fontSize: 10, textTransform: 'uppercase' }}>{label}</div>
              <div style={{ color: '#fff', fontSize: 18, fontWeight: 800, marginTop: 5 }}>{value}</div>
            </div>
          ))}
        </div>

        <p style={{ margin: '18px 24px 24px', color: '#cbd5e1', fontSize: 12, lineHeight: 1.6 }}>
          Evaluation used a deterministic supplier-GSTIN-grouped split from synthetic corpora. These metrics describe that synthetic holdout only; they do not establish production performance. Uploaded invoices remain unscored unless every required feature is sourced reliably.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 24px 24px' }}>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,.05)', border: '1px solid var(--navy-border)', borderRadius: 8, padding: '8px 14px', color: '#cbd5e1', fontWeight: 600, cursor: 'pointer' }}>Close</button>
        </div>
      </section>
    </div>
  );
}
