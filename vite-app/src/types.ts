// Data types for GST Credit-at-Risk Forecaster

export type Bucket = 'SAFE TO HOLD' | 'WATCH' | 'CHASE NOW';

export type ApLeverageTier = 'HIGH' | 'MEDIUM' | 'LOW';

export type FilingPattern = 'HABITUAL LAGGARD' | 'NORMAL/PUNCTUAL' | 'NEW ANOMALY' | 'INSUFFICIENT HISTORY';

export interface FilingCycle {
  period: string; // e.g. "Apr 2026"
  dueDate: string; // e.g. "2026-05-11"
  filingDate: string | null; // e.g. "2026-05-28" or null if missed
  delayDays: number;
  missed: boolean;
}

export interface Vendor {
  id: string;
  name: string;
  gstin: string; // Synthetic GSTIN
  city: string;
  state: string;
  filingPattern: FilingPattern;
  filingCycles: FilingCycle[];
  medianFilingDelayDays?: number;
  onTimeFilingRatio?: number;
  historicalRecoveryRate?: number;
  isQrmp?: boolean;
}

export interface PurchaseInvoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string; // YYYY-MM-DD
  vendorId: string;
  vendorName: string;
  gstin: string;
  taxableAmount: number;
  gstRate: number; // e.g. 18 for 18%
  taxAmount: number; // Rupee tax at risk
  grossAmount: number;
}

export interface Gstr2bRecord {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  gstin: string;
  taxableAmount: number;
  taxAmount: number;
}

export interface ApVendorRecord {
  vendorId: string;
  unpaidAmount: number;
  overdueAmount: number;
  retentionHeldAmount: number;
  isPaid: boolean;
}

// Four-State IRN Model:
// - 'PRESENT': Registered on the IRP -> Pushes toward "wait" (+20 pts)
// - 'ABSENT_APPLIES': Should exist, doesn't -> Raises risk (-15 pts)
// - 'ABSENT_NOT_APPLICABLE': Vendor is exempt / sub-5Cr -> Neutral (0 pts)
// - 'ABSENT_UNKNOWN': Couldn't determine or lookup unverified -> Neutral, labeled "unknown" (0 pts)
export type IrnState = 'PRESENT' | 'ABSENT_APPLIES' | 'ABSENT_NOT_APPLICABLE' | 'ABSENT_UNKNOWN';

export interface IrnRecord {
  invoiceNumber: string;
  gstin: string;
  irnPresent: boolean;
  irnRef: string | null;
  irnState?: IrnState;
}

export interface VendorIrnLookupResult {
  workflow: string;
  gstin: string;
  legal_name: string;
  trade_name: string;
  einvoice_enabled: boolean | null; // true, false, or null if unknown/blocked
  irn_state: IrnState;
  score_adjustment: number;
  status_label: string; // "Present" | "Absent, applies" | "Absent, not applicable" | "Absent, unknown"
  source_snippet: string;
  source_url: string;
  checked_at: string;
  checked_at_human: string;
  cache_status: string; // "CACHE_HIT (TTL 24h)" | "LIVE_FETCH" | "FETCH_FAILED_UNKNOWN"
  is_failure_fallback: boolean;
  why_this_label: string; // Plain sentence explaining the label
}

export interface MatchResult {
  matched: boolean;
  confidence: number; // 0 - 100%
  matchedRecord?: Gstr2bRecord;
  explanation: string;
}

export interface ScoreExplanation {
  baseScore: number;
  irnAdjustment: number;
  apAdjustment: number;
  filingAdjustment: number;
  cutoffAdjustment?: number;
  rawScore: number;
  clampedScore: number;
  bucket: Bucket;
  reason: string;
}

export interface IrnApplicabilityResult {
  workflow: string;
  gstin: string;
  supplier_name: string;
  invoice_date: string;
  transaction_type: string;
  turnover_band: string;
  status: 'LIKELY_APPLICABLE' | 'APPLICABILITY_UNCLEAR' | 'LIKELY_NOT_APPLICABLE';
  irn_signal_adjustment: number;
  summary: string;
  rule_citation: string;
  source_links: Array<{ title: string; url: string; authority: string }>;
  checked_at: string;
  cache_status: string;
}

export interface ReconciledInvoice extends PurchaseInvoice {
  matchResult: MatchResult;
  irnRecord: IrnRecord;
  apRecord: ApVendorRecord;
  vendor: Vendor;
  leverageRatio: number;
  leverageTier: ApLeverageTier;
  scoreExplanation?: ScoreExplanation;
  routingBucket?: Bucket;
  irnApplicability?: IrnApplicabilityResult;
  vendorIrnLookup?: VendorIrnLookupResult;
  whyThisLabel?: string;
  mlForecast?: import('./mlForecaster').MlForecastResult;
}

