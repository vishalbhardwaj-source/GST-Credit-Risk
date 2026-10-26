import { generateSyntheticDataset } from './data';
import { reconcileDataset, computeKpis, getDaysToStatutoryCutoff } from './utils';
import { calculateRoutingScore } from './scoring';
import { computeInvoiceMlForecast } from './mlForecaster';
import type { Bucket, PipelineSummary, ReconciledInvoice } from './types';

let cachedBaseInvoices: ReconciledInvoice[] | null = null;

function getBaseDemoInvoices(): ReconciledInvoice[] {
  if (!cachedBaseInvoices) {
    const baseData = generateSyntheticDataset(42);
    cachedBaseInvoices = reconcileDataset(baseData);
  }
  return cachedBaseInvoices;
}

export function getFallbackDemoData(
  isRouted: boolean,
  page: number,
  pageSize: number,
  searchQuery: string,
  bucketFilter: 'ALL' | Bucket,
  matchFilter: 'ALL' | 'MATCHED' | 'UNMATCHED',
  irnFilter: 'ALL' | 'PRESENT' | 'ABSENT',
  apFilter: 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW',
  patternFilter: 'ALL' | string,
  sortField: 'taxAmount' | 'score' | 'invoiceDate' | 'vendorName',
  sortDirection: 'asc' | 'desc',
): { invoices: ReconciledInvoice[]; total: number; summary: PipelineSummary } {
  let allInvoices = getBaseDemoInvoices();

  if (isRouted) {
    allInvoices = allInvoices.map((inv) => {
      if (inv.matchResult.matched) return inv;
      const daysToCutoff = getDaysToStatutoryCutoff(inv.invoiceDate);
      const mlForecast = computeInvoiceMlForecast(inv, daysToCutoff);
      const scoreExp = calculateRoutingScore(
        inv.irnRecord.irnPresent,
        inv.leverageTier ?? 'LOW',
        inv.vendor.filingPattern,
        inv.irnApplicability?.status,
        inv.vendorIrnLookup?.irn_state,
        daysToCutoff,
      );
      return {
        ...inv,
        routingBucket: scoreExp.bucket,
        scoreExplanation: scoreExp,
        mlForecast,
        modelDecision: {
          status: 'scored' as const,
          rawBucket: scoreExp.bucket,
          bucket: scoreExp.bucket,
          probability: mlForecast.pResolution,
          source: 'lightgbm' as const,
          reason: scoreExp.reason,
          drivers: [scoreExp.reason],
        },
      };
    });
  }

  const kpis = computeKpis(allInvoices);
  const summary: PipelineSummary = {
    total: kpis.total,
    matched: kpis.matched,
    unmatched: kpis.unmatched,
    totalTaxAtRisk: kpis.totalTaxAtRisk,
    safeCount: isRouted ? kpis.safeCount : 0,
    safeTax: isRouted ? kpis.safeTax : 0,
    watchCount: isRouted ? kpis.watchCount : 0,
    watchTax: isRouted ? kpis.watchTax : 0,
    chaseCount: isRouted ? kpis.chaseCount : 0,
    chaseTax: isRouted ? kpis.chaseTax : 0,
    unscoredCount: isRouted ? 0 : kpis.unmatched,
    reconciliationAvailable: true,
  };

  // Filter
  const filtered = allInvoices.filter((inv) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchNo = inv.invoiceNumber.toLowerCase().includes(q);
      const matchVendor = inv.vendorName.toLowerCase().includes(q);
      const matchGstin = inv.gstin.toLowerCase().includes(q);
      if (!matchNo && !matchVendor && !matchGstin) return false;
    }
    if (matchFilter === 'MATCHED' && !inv.matchResult.matched) return false;
    if (matchFilter === 'UNMATCHED' && inv.matchResult.matched) return false;
    if (bucketFilter !== 'ALL' && inv.routingBucket !== bucketFilter) return false;
    if (irnFilter === 'PRESENT' && !inv.irnRecord.irnPresent) return false;
    if (irnFilter === 'ABSENT' && inv.irnRecord.irnPresent) return false;
    if (apFilter !== 'ALL' && inv.leverageTier !== apFilter) return false;
    if (patternFilter !== 'ALL' && inv.vendor.filingPattern !== patternFilter) return false;
    return true;
  });

  // Sort
  filtered.sort((a, b) => {
    let comparison = 0;
    if (sortField === 'taxAmount') {
      comparison = a.taxAmount - b.taxAmount;
    } else if (sortField === 'score') {
      const scoreA = a.scoreExplanation?.clampedScore ?? (a.modelDecision?.probability ? Math.round(a.modelDecision.probability * 100) : 0);
      const scoreB = b.scoreExplanation?.clampedScore ?? (b.modelDecision?.probability ? Math.round(b.modelDecision.probability * 100) : 0);
      comparison = scoreA - scoreB;
    } else if (sortField === 'invoiceDate') {
      comparison = a.invoiceDate.localeCompare(b.invoiceDate);
    } else if (sortField === 'vendorName') {
      comparison = a.vendorName.localeCompare(b.vendorName);
    }
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const total = filtered.length;
  const offset = page * pageSize;
  const paginated = filtered.slice(offset, offset + pageSize);

  return {
    invoices: paginated,
    total,
    summary,
  };
}
