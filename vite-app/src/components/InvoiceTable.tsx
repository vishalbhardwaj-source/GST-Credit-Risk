import { ArrowDown, ArrowUp, ArrowUpDown, ChevronRight, FileSearch } from 'lucide-react';
import type { ReconciledInvoice } from '../types';
import { formatINR } from '../utils';

export interface InvoiceTableProps {
  invoices: ReconciledInvoice[];
  isRouted: boolean;
  sortField: 'taxAmount' | 'score' | 'invoiceDate' | 'vendorName';
  setSortField: (field: 'taxAmount' | 'score' | 'invoiceDate' | 'vendorName') => void;
  sortDirection: 'asc' | 'desc';
  setSortDirection: (dir: 'asc' | 'desc') => void;
  onSelect: (invoice: ReconciledInvoice) => void;
}

export function InvoiceTable({
  invoices,
  isRouted,
  sortField,
  setSortField,
  sortDirection,
  setSortDirection,
  onSelect,
}: InvoiceTableProps) {
  const handleSort = (field: 'taxAmount' | 'score' | 'invoiceDate' | 'vendorName') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'vendorName' ? 'asc' : 'desc');
    }
  };

  const renderSortIcon = (field: 'taxAmount' | 'score' | 'invoiceDate' | 'vendorName') => {
    if (sortField !== field) {
      return <ArrowUpDown size={12} style={{ opacity: 0.35, marginLeft: '4px' }} />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp size={12} style={{ color: 'var(--accent-cyan)', marginLeft: '4px' }} />
    ) : (
      <ArrowDown size={12} style={{ color: 'var(--accent-cyan)', marginLeft: '4px' }} />
    );
  };

  return (
    <div
      style={{
        background: 'var(--navy-surface)',
        border: '1px solid var(--navy-border)',
        borderRadius: '14px',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
      }}
    >
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1050px' }}>
          <thead>
            <tr
              style={{
                background: 'var(--navy-card)',
                borderBottom: '1px solid var(--navy-border)',
                color: 'var(--navy-muted)',
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              <th style={{ padding: '12px 16px', fontWeight: 700 }}>Invoice Details</th>
              <th
                onClick={() => handleSort('vendorName')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSort('vendorName'); } }}
                tabIndex={0}
                role="columnheader"
                aria-sort={sortField === 'vendorName' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                style={{ padding: '12px 16px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                  Vendor &amp; GSTIN {renderSortIcon('vendorName')}
                </div>
              </th>
              <th
                onClick={() => handleSort('invoiceDate')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSort('invoiceDate'); } }}
                tabIndex={0}
                role="columnheader"
                aria-sort={sortField === 'invoiceDate' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                style={{ padding: '12px 16px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                  Date {renderSortIcon('invoiceDate')}
                </div>
              </th>
              <th
                onClick={() => handleSort('taxAmount')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSort('taxAmount'); } }}
                tabIndex={0}
                role="columnheader"
                aria-sort={sortField === 'taxAmount' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right', cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', width: '100%' }}>
                  {isRouted ? 'GST Amount at Risk' : 'GST Tax Amount'} {renderSortIcon('taxAmount')}
                </div>
              </th>
              <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'center' }}>2B Match</th>
              <th style={{ padding: '12px 16px', fontWeight: 700 }}>IRN Status</th>
              <th style={{ padding: '12px 16px', fontWeight: 700 }}>AP Leverage</th>
              <th style={{ padding: '12px 16px', fontWeight: 700 }}>Filing Track</th>
              <th
                onClick={() => handleSort('score')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSort('score'); } }}
                tabIndex={0}
                role="columnheader"
                aria-sort={sortField === 'score' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                style={{ padding: '12px 16px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                  Score {renderSortIcon('score')}
                </div>
              </th>
              <th style={{ padding: '12px 16px', fontWeight: 700 }}>Routing Bucket</th>
              <th style={{ padding: '12px 12px', width: '36px' }}></th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={11} style={{ padding: '64px 24px', textAlign: 'center', color: 'var(--navy-muted)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.04)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--navy-muted)',
                      }}
                    >
                      <FileSearch size={22} />
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--navy-heading)' }}>No matching invoices found</div>
                    <div style={{ fontSize: '12px', maxWidth: '340px' }}>
                      Try adjusting your search query, bucket filter, or reset filters to view all records.
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              invoices.map((inv) => {
                const isMatched = inv.matchResult.matched;
                const score = inv.scoreExplanation?.clampedScore;
                const bucket = inv.routingBucket;

                return (
                  <tr
                    key={inv.id}
                    onClick={() => onSelect(inv)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelect(inv);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`Select invoice ${inv.invoiceNumber} from ${inv.vendorName}`}
                    className="invoice-table-row"
                    style={{
                      borderBottom: '1px solid var(--navy-border)',
                      cursor: 'pointer',
                    }}
                  >
                    {/* Invoice Details */}
                    <td style={{ padding: '12px 16px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: 'var(--accent-blue)' }}>
                      {inv.invoiceNumber}
                    </td>

                    {/* Vendor */}
                    <td style={{ padding: '12px 16px', maxWidth: '220px' }}>
                      <div
                        style={{
                          fontWeight: 600,
                          color: 'var(--navy-heading)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        title={inv.vendorName}
                      >
                        {inv.vendorName}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--navy-muted)', fontWeight: 500, fontFamily: 'JetBrains Mono, monospace' }}>
                        {inv.gstin}
                      </div>
                    </td>

                    {/* Date */}
                    <td style={{ padding: '12px 16px', color: 'var(--navy-muted)', fontSize: '12px', fontWeight: 500 }}>
                      {inv.invoiceDate}
                    </td>

                    {/* GST Tax Amount */}
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: 'var(--navy-heading)' }}>
                      {formatINR(inv.taxAmount)}
                      <div style={{ fontSize: '10px', color: 'var(--navy-muted)', fontWeight: 600 }}>
                        18% on {formatINR(inv.taxableAmount)}
                      </div>
                    </td>

                    {/* 2B Match */}
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      {!isRouted ? (
                        <span className="badge badge-neutral" style={{ opacity: 0.6, fontSize: '11px' }}>
                          —
                        </span>
                      ) : isMatched ? (
                        <span className="badge badge-safe">✓ Matched</span>
                      ) : (
                        <span className="badge badge-chase">✗ Missing</span>
                      )}
                    </td>

                    {/* IRN Status */}
                    <td style={{ padding: '12px 16px' }}>
                      {inv.vendorIrnLookup ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span
                            style={{
                              fontWeight: 700,
                              fontSize: '11px',
                              color:
                                inv.vendorIrnLookup.irn_state === 'PRESENT' ||
                                inv.vendorIrnLookup.irn_state === 'ABSENT_NOT_APPLICABLE'
                                  ? 'var(--safe-light)'
                                  : inv.vendorIrnLookup.irn_state === 'ABSENT_UNKNOWN'
                                  ? '#fbbf24'
                                  : 'var(--chase-light)',
                            }}
                          >
                            {inv.vendorIrnLookup.status_label}
                          </span>
                          <span
                            style={{
                              fontSize: '9px',
                              color: 'var(--accent-cyan)',
                              fontWeight: 700,
                              background: 'rgba(183, 148, 246, 0.15)',
                              padding: '1px 5px',
                              borderRadius: '4px',
                              width: 'fit-content',
                            }}
                          >
                            LIVE
                          </span>
                        </div>
                      ) : inv.irnRecord.irnPresent ? (
                        <span style={{ color: 'var(--safe-light)', fontWeight: 600, fontSize: '12px' }}>● Verified (IRP)</span>
                      ) : (
                        <span style={{ color: 'var(--chase-light)', fontWeight: 600, fontSize: '12px' }}>○ Absent</span>
                      )}
                    </td>

                    {/* AP Leverage */}
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          color:
                            inv.leverageTier === 'HIGH' ? 'var(--accent-cyan)' : inv.leverageTier === 'MEDIUM' ? 'var(--watch-light)' : 'var(--navy-muted)',
                          fontWeight: 700,
                        }}
                      >
                        {inv.leverageTier} ({Math.round(inv.leverageRatio * 100)}%)
                      </span>
                    </td>

                    {/* Filing Track */}
                    <td
                      style={{
                        padding: '12px 16px',
                        fontSize: '11px',
                        color: 'var(--navy-muted)',
                      }}
                    >
                      {inv.vendor.filingPattern}
                    </td>

                    {/* Score */}
                    <td style={{ padding: '12px 16px' }}>
                      {isRouted && score !== undefined ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div
                            style={{
                              width: '38px',
                              height: '5px',
                              background: 'rgba(255,255,255,0.08)',
                              borderRadius: '3px',
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                width: `${score}%`,
                                height: '100%',
                                background:
                                  score >= 75
                                    ? 'var(--safe-color)'
                                    : score >= 40
                                    ? 'var(--watch-color)'
                                    : 'var(--chase-color)',
                                borderRadius: '3px',
                              }}
                            />
                          </div>
                          <span style={{ fontWeight: 800, fontSize: '12px', color: 'var(--navy-heading)' }}>{score}</span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--navy-muted)', fontSize: '11px' }}>—</span>
                      )}
                    </td>

                    {/* Routing Bucket & LightGBM Inference */}
                    <td style={{ padding: '12px 16px' }}>
                      {!isRouted ? (
                        <span className="badge badge-neutral" style={{ opacity: 0.6, fontSize: '11px' }}>
                          Awaiting Pipeline
                        </span>
                      ) : bucket ? (
                        <div>
                          <span
                            className={`badge ${
                              bucket === 'SAFE TO HOLD'
                                ? 'badge-safe'
                                : bucket === 'WATCH'
                                ? 'badge-watch'
                                : 'badge-chase'
                            }`}
                          >
                            {bucket}
                          </span>
                          {inv.mlForecast && (
                            <div style={{ fontSize: '10px', color: 'var(--navy-muted)', marginTop: '4px', fontFamily: 'monospace', fontWeight: 600 }}>
                              ML P(res): <span style={{ color: inv.mlForecast.pResolutionPct >= 70 ? 'var(--safe-light)' : inv.mlForecast.pResolutionPct >= 40 ? '#fbbf24' : 'var(--chase-light)', fontWeight: 800 }}>{inv.mlForecast.pResolutionPct}%</span>
                            </div>
                          )}
                        </div>
                      ) : isMatched ? (
                        <span className="badge badge-safe" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--safe-light)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                          Avail ITC (Matched)
                        </span>
                      ) : (
                        <span className="badge badge-neutral">Raw Mismatch</span>
                      )}
                    </td>

                    {/* Chevron Indicator */}
                    <td style={{ padding: '12px 8px', textAlign: 'center', color: 'var(--navy-muted)' }}>
                      <ChevronRight size={14} style={{ opacity: 0.5 }} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer Summary Strip */}
      <div
        style={{
          padding: '10px 18px',
          background: 'rgba(0, 0, 0, 0.2)',
          borderTop: '1px solid var(--navy-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '11px',
          color: 'var(--navy-muted)',
        }}
      >
        <span>
          Showing <strong style={{ color: 'var(--navy-heading)' }}>{invoices.length}</strong> invoices
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          💡 Tip: Click any row to inspect deep diagnostic audit signals &amp; run TinyFish verifications
        </span>
      </div>
    </div>
  );
}
