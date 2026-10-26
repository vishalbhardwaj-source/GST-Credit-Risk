import { AlertTriangle, X } from 'lucide-react';
import type { ReconciledInvoice } from '../types';
import { formatINR } from '../utils';

export interface InvoiceDetailPanelProps {
  invoice: ReconciledInvoice | null;
  isRouted: boolean;
  onClose: () => void;
}

const placeholder = '-to-be-populated-';

export function InvoiceDetailPanel({ invoice, isRouted, onClose }: InvoiceDetailPanelProps) {
  if (!invoice) return null;
  const decision = invoice.modelDecision;
  const detailStyle = {
    background: 'rgba(0,0,0,0.2)',
    padding: '8px 10px',
    borderRadius: 6,
  } as const;

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section className="modal-content" role="dialog" aria-modal="true" aria-labelledby="invoice-detail-title" onClick={(event) => event.stopPropagation()}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, padding: '20px 24px', borderBottom: '1px solid var(--navy-border)', background: 'var(--navy-card)', position: 'sticky', top: 0, zIndex: 10 }}>
          <div>
            <span className={`badge ${invoice.matchResult.available !== false && invoice.matchResult.matched ? 'badge-safe' : decision?.status === 'not_scored' ? 'badge-neutral' : invoice.routingBucket === 'CHASE NOW' ? 'badge-chase' : invoice.routingBucket === 'WATCH' ? 'badge-watch' : 'badge-safe'}`}>
              {invoice.matchResult.available !== false && invoice.matchResult.matched
                ? 'MATCHED IN GSTR-2B'
                : decision?.status === 'not_scored'
                  ? 'NOT SCORED'
                  : invoice.routingBucket ?? (isRouted ? 'NO MODEL DECISION' : 'PIPELINE PENDING')}
            </span>
            <h2 id="invoice-detail-title" style={{ margin: '8px 0 2px', color: '#fff', fontSize: 18, fontFamily: 'monospace' }}>{invoice.invoiceNumber}</h2>
            <div style={{ color: 'var(--navy-muted)', fontSize: 12, marginTop: 4 }}>
              {invoice.vendorName} <span>·</span> <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{invoice.gstin}</span>
            </div>
          </div>
          <button type="button" aria-label="Close invoice details" onClick={onClose}><X size={18} /></button>
        </header>

        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <section style={{ background: 'var(--navy-card)', border: '1px solid var(--navy-border)', borderRadius: 12, padding: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, textAlign: 'center' }}>
            <div>
              <span style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--navy-muted)', fontWeight: 700 }}>GST Tax Amount</span>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#f87171', marginTop: 2 }}>{formatINR(invoice.taxAmount)}</div>
              <span style={{ fontSize: 10, color: 'var(--navy-muted)' }}>{invoice.matchResult.matched ? 'Matched in GSTR-2B' : 'Invoice tax amount'}</span>
            </div>
            <div style={{ borderLeft: '1px solid var(--navy-border)', borderRight: '1px solid var(--navy-border)' }}>
              <span style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--navy-muted)', fontWeight: 700 }}>Taxable Value</span>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginTop: 2 }}>{formatINR(invoice.taxableAmount)}</div>
              <span style={{ fontSize: 10, color: 'var(--navy-muted)' }}>GST rate: {invoice.gstRate}%</span>
            </div>
            <div>
              <span style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--navy-muted)', fontWeight: 700 }}>Gross Total</span>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginTop: 2 }}>{formatINR(invoice.grossAmount)}</div>
              <span style={{ fontSize: 10, color: 'var(--navy-muted)' }}>Dated {invoice.invoiceDate || placeholder}</span>
            </div>
          </section>

          <section style={{ background: 'var(--navy-card)', border: '1px solid var(--navy-border)', borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', color: 'var(--navy-muted)' }}>Purchase Register Invoice Info</span>
              <span style={{ fontSize: 10, color: '#60a5fa', background: 'rgba(183,148,246,.1)', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>Record: {invoice.id}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, fontSize: 12 }}>
              {[
                ['Invoice Number', invoice.invoiceNumber],
                ['Invoice Date', invoice.invoiceDate || placeholder],
                ['Supplier / GSTIN', invoice.gstin],
                ['GSTR-1 reported', invoice.gstr1Reported == null ? placeholder : invoice.gstr1Reported ? 'Yes' : 'No'],
                ['GSTR-2B match', invoice.matchResult.available === false ? placeholder : invoice.matchResult.matched ? 'Matched' : 'Not matched'],
                ['IRN status', invoice.irnRecord.available === false ? placeholder : invoice.irnRecord.irnPresent ? 'Present' : 'Absent'],
              ].map(([label, value]) => (
                <div key={label} style={detailStyle}>
                  <div style={{ fontSize: 10, color: 'var(--navy-muted)' }}>{label}</div>
                  <div style={{ fontWeight: 700, color: '#fff', marginTop: 2, overflowWrap: 'anywhere' }}>{value}</div>
                </div>
              ))}
            </div>
          </section>

          <section style={{ background: 'var(--navy-card)', border: '1px solid var(--navy-border)', borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', color: 'var(--navy-muted)', marginBottom: 12 }}>Supplier Context</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, fontSize: 12 }}>
              {[
                ['AP outstanding', invoice.apRecord.unpaidAmount === null ? placeholder : formatINR(invoice.apRecord.unpaidAmount)],
                ['Retention held', invoice.apRecord.retentionHeldAmount === null ? placeholder : formatINR(invoice.apRecord.retentionHeldAmount)],
                ['AP leverage', invoice.leverageRatio === null ? placeholder : `${invoice.leverageTier} · ${invoice.leverageRatio.toFixed(2)}x`],
                ['Filing pattern', invoice.vendor.filingPattern || placeholder],
                ['Filing cycles', invoice.vendor.filingCycles.length ? invoice.vendor.filingCycles.map((cycle) => `${cycle.period}: ${cycle.delayDays}d`).join(' · ') : placeholder],
              ].map(([label, value]) => (
                <div key={label} style={detailStyle}>
                  <div style={{ fontSize: 10, color: 'var(--navy-muted)' }}>{label}</div>
                  <div style={{ fontWeight: 700, color: '#fff', marginTop: 2, overflowWrap: 'anywhere' }}>{value}</div>
                </div>
              ))}
            </div>
          </section>

          <section style={{ padding: 16, borderRadius: 12, border: '1px solid var(--navy-border)', background: 'var(--navy-card)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: 13 }}>Model decision</h3>
              {decision?.status === 'not_scored' && <span className="badge badge-neutral">Not scored</span>}
            </div>
            {decision?.status === 'scored' ? (
              <>
                {invoice.matchResult.available !== false && invoice.matchResult.matched && (
                  <p style={{ color: '#94a3b8', fontSize: 11 }}>Informational only: this invoice is already matched in the uploaded GSTR-2B.</p>
                )}
                <p style={{ color: '#cbd5e1', fontSize: 12, lineHeight: 1.5 }}>
                  {decision.source} · Raw model bucket: {decision.rawBucket} · P(later GSTR-2B appearance): {((decision.probability ?? 0) * 100).toFixed(1)}%
                </p>
                <p style={{ color: '#cbd5e1', fontSize: 12 }}>{decision.reason}</p>
                <div style={{ color: '#94a3b8', fontSize: 11 }}>
                  Decision context: {decision.drivers.join(' · ') || placeholder}
                </div>
                {invoice.modelFeatures && (
                  <dl style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 8, fontSize: 11 }}>
                    {Object.entries(invoice.modelFeatures).map(([key, value]) => (
                      <div key={key}><dt style={{ color: '#94a3b8' }}>{key}</dt><dd style={{ margin: 0, color: '#fff' }}>{String(value)}</dd></div>
                    ))}
                  </dl>
                )}
              </>
            ) : (
              <p style={{ display: 'flex', gap: 7, alignItems: 'flex-start', color: '#fcd34d', fontSize: 12, lineHeight: 1.5 }}>
                <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                {decision?.reason ?? 'Pipeline has not run for this invoice.'}
              </p>
            )}
          </section>

          <section style={{ padding: 16, borderRadius: 12, border: '1px solid var(--navy-border)', background: 'var(--navy-card)' }}>
            <h3 style={{ margin: 0, color: '#fff', fontSize: 13 }}>Reconciliation</h3>
            <p style={{ marginBottom: 0, color: '#cbd5e1', fontSize: 12 }}>
              {invoice.matchResult.available === false ? 'No GSTR-2B file was provided; match status is unknown.' : invoice.matchResult.explanation}
            </p>
            {invoice.matchResult.matchedRecord && (
              <div style={{ marginTop: 8, color: '#94a3b8', fontSize: 11 }}>
                Matched record: {invoice.matchResult.matchedRecord.invoiceNumber} · {invoice.matchResult.matchedRecord.invoiceDate}
              </div>
            )}
          </section>

          <p style={{ margin: 0, color: '#94a3b8', fontSize: 10, lineHeight: 1.5 }}>
            Synthetic demo predictions are in-sample. Uploaded invoices are not scored when required model inputs are unavailable. This output is not legal or tax advice.
          </p>
        </div>
      </section>
    </div>
  );
}
