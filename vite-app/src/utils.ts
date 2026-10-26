import type { ReconciledInvoice } from './types';
import { matchInvoice } from './matcher';
import { calculateApLeverage } from './scoring';
import { generateSyntheticDataset } from './data';

export type SyntheticDataset = ReturnType<typeof generateSyntheticDataset>;

export function reconcileDataset(baseData: SyntheticDataset): ReconciledInvoice[] {
  return baseData.purchaseInvoices.map((inv): ReconciledInvoice => {
    const matchResult = matchInvoice(inv, baseData.gstr2bRecords);
    const vendor = baseData.vendorMap.get(inv.vendorId)!;
    const apRecord = baseData.apRecords.get(vendor.id)!;
    const irnRecord = baseData.irnRegistry.get(inv.invoiceNumber)!;
    if (apRecord.unpaidAmount === null || apRecord.retentionHeldAmount === null) {
      throw new Error(`Synthetic demo AP data is incomplete for vendor ${vendor.id}.`);
    }

    const { leverageRatio, leverageTier } = calculateApLeverage(
      apRecord.unpaidAmount,
      apRecord.retentionHeldAmount,
      inv.grossAmount
    );

    return {
      ...inv,
      matchResult,
      irnRecord,
      apRecord,
      vendor,
      leverageRatio,
      leverageTier,
    };
  });
}

export function computeKpis(enrichedInvoices: ReconciledInvoice[]) {
  const total = enrichedInvoices.length;
  const matched = enrichedInvoices.filter((i) => i.matchResult.matched).length;
  const unmatched = total - matched;
  const unmatchedInvoices = enrichedInvoices.filter((i) => !i.matchResult.matched);
  const totalTaxAtRisk = unmatchedInvoices.reduce((sum, i) => sum + i.taxAmount, 0);

  const safeInvoices = unmatchedInvoices.filter((i) => i.routingBucket === 'SAFE TO HOLD');
  const watchInvoices = unmatchedInvoices.filter((i) => i.routingBucket === 'WATCH');
  const chaseInvoices = unmatchedInvoices.filter((i) => i.routingBucket === 'CHASE NOW');

  return {
    total,
    matched,
    unmatched,
    totalTaxAtRisk,
    safeCount: safeInvoices.length,
    safeTax: safeInvoices.reduce((sum, i) => sum + i.taxAmount, 0),
    watchCount: watchInvoices.length,
    watchTax: watchInvoices.reduce((sum, i) => sum + i.taxAmount, 0),
    chaseCount: chaseInvoices.length,
    chaseTax: chaseInvoices.reduce((sum, i) => sum + i.taxAmount, 0),
  };
}

// Format INR currency
export function formatINR(val: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val);
}

/**
 * Calculates days remaining until the Section 16(4) statutory cutoff (Nov 30).
 * Relative to the active filing horizon (Nov 30, 2026).
 */
export function getDaysToStatutoryCutoff(_invoiceDateStr?: string, referenceDateStr = '2026-10-22'): number {
  const cutoffDate = new Date('2026-11-30');
  const refDate = referenceDateStr ? new Date(referenceDateStr) : new Date();
  const diffTime = cutoffDate.getTime() - refDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

export function exportInvoicesToCsv(invoices: ReconciledInvoice[]): void {
  const headers = [
    'Invoice No',
    'Invoice Date',
    'Vendor Name',
    'Vendor GSTIN',
    'Taxable Amount (INR)',
    'GST Rate %',
    'GST Amount at Risk (INR)',
    'Gross Amount (INR)',
    'GSTR-2B Matched',
    'IRN Status',
    'AP Leverage',
    'Filing Pattern',
    'Model Probability',
    'Model Bucket',
    'Model Source',
    'Decision Reason',
  ];

  const rows = invoices.map((inv) => [
    inv.invoiceNumber,
    inv.invoiceDate,
    inv.vendorName,
    inv.gstin,
    inv.taxableAmount,
    inv.gstRate,
    inv.taxAmount,
    inv.grossAmount,
    inv.matchResult.matched ? 'Yes' : 'No',
    inv.irnRecord.available === false ? '-to-be-populated-' : inv.irnRecord.irnPresent ? 'Present' : 'Absent',
    inv.leverageTier ?? '-to-be-populated-',
    inv.vendor.filingPattern,
    inv.modelDecision?.probability === undefined ? 'NOT SCORED' : inv.modelDecision.probability,
    inv.routingBucket ?? 'NOT SCORED',
    inv.modelDecision?.source ?? '-to-be-populated-',
    inv.modelDecision?.reason ?? inv.matchResult.explanation,
  ]);

  const source = invoices[0]?.modelDecision?.source === 'lightgbm'
    ? 'Synthetic demo predictions are in-sample; not real-world validated.'
    : 'Uploaded data is not model-scored when required inputs are unavailable.';
  const csvContent =
    `# GST CREDIT-AT-RISK FORECASTER AUDIT EXPORT\n# ${source} Triage support only; not tax or legal advice.\n` +
    [headers.join(','), ...rows.map((e) => e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `gst-credit-at-risk-export-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
