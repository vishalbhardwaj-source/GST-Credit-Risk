import type {
  ApLeverageTier,
  Bucket,
  FilingPattern,
  Gstr2bRecord,
  MatchResult,
  PurchaseInvoice,
  ReconciledInvoice,
  Vendor,
} from './types';
import { matchInvoice } from './matcher';
import { calculateApLeverage, calculateRoutingScore } from './scoring';

/**
 * State code to name lookup for Indian GSTINs
 */
const GST_STATE_MAP: Record<string, string> = {
  '01': 'Jammu & Kashmir',
  '02': 'Himachal Pradesh',
  '03': 'Punjab',
  '04': 'Chandigarh',
  '05': 'Uttarakhand',
  '06': 'Haryana',
  '07': 'Delhi',
  '08': 'Rajasthan',
  '09': 'Uttar Pradesh',
  '10': 'Bihar',
  '11': 'Sikkim',
  '12': 'Arunachal Pradesh',
  '13': 'Nagaland',
  '14': 'Manipur',
  '15': 'Mizoram',
  '16': 'Tripura',
  '17': 'Meghalaya',
  '18': 'Assam',
  '19': 'West Bengal',
  '20': 'Jharkhand',
  '21': 'Odisha',
  '22': 'Chhattisgarh',
  '23': 'Madhya Pradesh',
  '24': 'Gujarat',
  '26': 'Dadra & Nagar Haveli',
  '27': 'Maharashtra',
  '29': 'Karnataka',
  '30': 'Goa',
  '32': 'Kerala',
  '33': 'Tamil Nadu',
  '36': 'Telangana',
  '37': 'Andhra Pradesh',
};

/**
 * Robust CSV parser that handles quotes, escaped quotes (""), newlines, and skips comments
 */
export function parseCsv(text: string): { headers: string[]; rows: Record<string, string>[] } {
  // Remove UTF-8 BOM if present
  const cleanText = text.replace(/^\uFEFF/, '');

  const rowsTokens: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let insideQuote = false;

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (char === '"') {
      if (insideQuote && nextChar === '"') {
        currentCell += '"';
        i++; // skip escaped quote
      } else {
        insideQuote = !insideQuote;
      }
    } else if (char === ',' && !insideQuote) {
      currentRow.push(currentCell.trim());
      currentCell = '';
    } else if ((char === '\n' || char === '\r') && !insideQuote) {
      if (char === '\r' && nextChar === '\n') {
        i++; // skip \n
      }
      currentRow.push(currentCell.trim());
      currentCell = '';

      // Skip comment rows or completely empty rows
      const isComment = currentRow.length > 0 && currentRow[0].startsWith('#');
      const isEmpty = currentRow.length === 1 && currentRow[0] === '';
      if (!isComment && !isEmpty && currentRow.length > 0) {
        rowsTokens.push(currentRow);
      }
      currentRow = [];
    } else {
      currentCell += char;
    }
  }

  // Push final cell/row if any
  currentRow.push(currentCell.trim());
  const isComment = currentRow.length > 0 && currentRow[0].startsWith('#');
  const isEmpty = currentRow.length === 1 && currentRow[0] === '';
  if (!isComment && !isEmpty && currentRow.length > 0) {
    rowsTokens.push(currentRow);
  }

  if (rowsTokens.length === 0) {
    return { headers: [], rows: [] };
  }

  const rawHeaders = rowsTokens[0];
  const rows: Record<string, string>[] = [];

  for (let r = 1; r < rowsTokens.length; r++) {
    const cells = rowsTokens[r];
    const rowObj: Record<string, string> = {};
    rawHeaders.forEach((h, hIdx) => {
      rowObj[h] = cells[hIdx] !== undefined ? cells[hIdx] : '';
    });
    rows.push(rowObj);
  }

  return { headers: rawHeaders, rows };
}

/**
 * Normalizes header string to canonical key: removes special characters, lowercase, underscores
 */
export function normalizeHeaderKey(header: string): string {
  return header
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Clean numeric string from commas, currency symbols, etc.
 */
export function cleanNumber(val: string | number | undefined | null, fallback = 0): number {
  if (val === undefined || val === null) return fallback;
  if (typeof val === 'number') return isNaN(val) ? fallback : val;
  const cleaned = String(val).replace(/[^0-9.-]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? fallback : num;
}

/**
 * Standardize date string to YYYY-MM-DD
 */
export function normalizeDate(val: string | undefined | null): string {
  if (!val) return new Date().toISOString().slice(0, 10);
  const trimmed = val.trim();

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

  // DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dmyMatch) {
    const [, d, m, y] = dmyMatch;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // MM/DD/YYYY
  const tryDate = new Date(trimmed);
  if (!isNaN(tryDate.getTime())) {
    return tryDate.toISOString().slice(0, 10);
  }

  return new Date().toISOString().slice(0, 10);
}

/**
 * Find value from row matching any candidate header alias
 */
function findRowValue(row: Record<string, string>, aliases: string[]): string {
  const normMap = new Map<string, string>();
  for (const [k, v] of Object.entries(row)) {
    normMap.set(normalizeHeaderKey(k), v);
  }

  for (const alias of aliases) {
    const normAlias = normalizeHeaderKey(alias);
    if (normMap.has(normAlias) && normMap.get(normAlias) !== undefined) {
      return normMap.get(normAlias)!;
    }
  }
  return '';
}

/**
 * Parse Purchase Register CSV rows into PurchaseInvoice objects
 */
export function parsePurchaseRegisterCsv(text: string): { invoices: PurchaseInvoice[]; errors: string[] } {
  const { headers, rows } = parseCsv(text);
  const errors: string[] = [];

  if (headers.length === 0 || rows.length === 0) {
    return { invoices: [], errors: ['File contains no readable rows or headers.'] };
  }

  const invoices: PurchaseInvoice[] = [];

  rows.forEach((row, idx) => {
    const lineNum = idx + 2;
    const invNum = findRowValue(row, ['invoice_number', 'invoicenumber', 'invoiceno', 'invoice_no', 'inv_no', 'bill_no', 'billno']);
    const gstin = findRowValue(row, ['supplier_gstin', 'vendorgstin', 'vendor_gstin', 'gstin', 'party_gstin', 'suppliergstin']).toUpperCase().trim();

    if (!invNum && !gstin) {
      // Empty or invalid row
      return;
    }

    if (!invNum) {
      errors.push(`Row ${lineNum}: Missing invoice number`);
      return;
    }
    if (!gstin) {
      errors.push(`Row ${lineNum}: Missing supplier GSTIN for invoice ${invNum}`);
      return;
    }

    const invDate = normalizeDate(findRowValue(row, ['invoice_date', 'invoicedate', 'date', 'bill_date', 'inv_date']));
    const vendorName = findRowValue(row, ['supplier_name', 'vendor_name', 'vendorname', 'suppliername', 'party_name', 'name']) || `Supplier ${gstin.slice(0, 10)}`;
    const taxableAmount = cleanNumber(findRowValue(row, ['taxable_value', 'taxablevalue', 'taxable_amount', 'taxableamount', 'taxable']));
    
    // Tax or GST Rate
    let gstRate = cleanNumber(findRowValue(row, ['gst_rate', 'gstrate', 'rate']), 18);
    let taxAmount = cleanNumber(findRowValue(row, ['total_tax', 'totaltax', 'tax_amount', 'taxamount', 'gst_amount_at_risk_inr', 'gst_amount', 'tax']));

    // If total tax is 0 but CGST/SGST/IGST provided
    if (taxAmount === 0) {
      const igst = cleanNumber(findRowValue(row, ['igst_amount', 'igst']));
      const cgst = cleanNumber(findRowValue(row, ['cgst_amount', 'cgst']));
      const sgst = cleanNumber(findRowValue(row, ['sgst_amount', 'sgst']));
      if (igst > 0 || cgst > 0 || sgst > 0) {
        taxAmount = igst + cgst + sgst;
      } else if (taxableAmount > 0 && gstRate > 0) {
        taxAmount = Math.round(taxableAmount * (gstRate / 100));
      }
    }

    let grossAmount = cleanNumber(findRowValue(row, ['gross_amount', 'grossamount', 'total_amount', 'total', 'invoice_value', 'grand_total']));
    if (grossAmount === 0 && (taxableAmount > 0 || taxAmount > 0)) {
      grossAmount = taxableAmount + taxAmount;
    }

    const vendorId = `v-${gstin.replace(/[^A-Z0-9]/gi, '').slice(0, 8)}`;

    invoices.push({
      id: `pr-up-${idx + 1}`,
      invoiceNumber: invNum,
      invoiceDate: invDate,
      vendorId,
      vendorName,
      gstin,
      taxableAmount,
      gstRate,
      taxAmount,
      grossAmount,
    });
  });

  return { invoices, errors };
}

/**
 * Parse GSTR-2B CSV rows into Gstr2bRecord objects
 */
export function parseGstr2bCsv(text: string): { records: Gstr2bRecord[]; errors: string[] } {
  const { headers, rows } = parseCsv(text);
  const errors: string[] = [];

  if (headers.length === 0 || rows.length === 0) {
    return { records: [], errors: ['GSTR-2B file contains no readable rows or headers.'] };
  }

  const records: Gstr2bRecord[] = [];

  rows.forEach((row, idx) => {
    const lineNum = idx + 2;
    const invNum = findRowValue(row, ['invoice_number', 'invoicenumber', 'invoiceno', 'invoice_no', 'inv_no', 'bill_no']);
    const gstin = findRowValue(row, ['supplier_gstin', 'vendorgstin', 'vendor_gstin', 'gstin', 'party_gstin', 'suppliergstin']).toUpperCase().trim();

    if (!invNum && !gstin) return;

    if (!invNum) {
      errors.push(`GSTR-2B Row ${lineNum}: Missing invoice number`);
      return;
    }
    if (!gstin) {
      errors.push(`GSTR-2B Row ${lineNum}: Missing supplier GSTIN for invoice ${invNum}`);
      return;
    }

    const invDate = normalizeDate(findRowValue(row, ['invoice_date', 'invoicedate', 'date', 'inv_date']));
    const taxableAmount = cleanNumber(findRowValue(row, ['taxable_value', 'taxablevalue', 'taxable_amount', 'taxableamount']));
    
    let taxAmount = cleanNumber(findRowValue(row, ['total_tax', 'totaltax', 'tax_amount', 'taxamount', 'gst_amount']));
    if (taxAmount === 0) {
      const igst = cleanNumber(findRowValue(row, ['integrated_tax', 'igst_amount', 'igst']));
      const cgst = cleanNumber(findRowValue(row, ['central_tax', 'cgst_amount', 'cgst']));
      const sgst = cleanNumber(findRowValue(row, ['state_tax', 'sgst_amount', 'sgst']));
      if (igst > 0 || cgst > 0 || sgst > 0) {
        taxAmount = igst + cgst + sgst;
      }
    }

    records.push({
      id: `2b-up-${idx + 1}`,
      invoiceNumber: invNum,
      invoiceDate: invDate,
      gstin,
      taxableAmount,
      taxAmount,
    });
  });

  return { records, errors };
}

/**
 * Parse an already Reconciled Audit CSV (e.g. from Export CSV or single reconciled file)
 */
export function parseReconciledAuditCsv(text: string): { invoices: ReconciledInvoice[]; errors: string[] } {
  const { headers, rows } = parseCsv(text);
  const errors: string[] = [];

  if (headers.length === 0 || rows.length === 0) {
    return { invoices: [], errors: ['Reconciled file contains no readable rows or headers.'] };
  }

  const invoices: ReconciledInvoice[] = [];

  rows.forEach((row, idx) => {
    const invNum = findRowValue(row, ['invoice_no', 'invoiceno', 'invoice_number', 'invoicenumber']);
    const gstin = findRowValue(row, ['vendor_gstin', 'vendorgstin', 'supplier_gstin', 'gstin']).toUpperCase().trim();

    if (!invNum && !gstin) return;
    if (!invNum || !gstin) {
      errors.push(`Row ${idx + 2}: Missing required invoice number or GSTIN`);
      return;
    }

    const invDate = normalizeDate(findRowValue(row, ['invoice_date', 'invoicedate', 'date']));
    const vendorName = findRowValue(row, ['vendor_name', 'vendorname', 'supplier_name', 'name']) || `Supplier ${gstin.slice(0, 10)}`;
    const taxableAmount = cleanNumber(findRowValue(row, ['taxable_amount_inr', 'taxable_amount', 'taxable_value', 'taxableamount']));
    const gstRate = cleanNumber(findRowValue(row, ['gst_rate_', 'gst_rate', 'gstrate']), 18);
    const taxAmount = cleanNumber(findRowValue(row, ['gst_amount_at_risk_inr', 'gst_amount', 'tax_amount', 'taxamount', 'total_tax']));
    let grossAmount = cleanNumber(findRowValue(row, ['gross_amount_inr', 'gross_amount', 'grossamount', 'total_amount']));
    if (grossAmount === 0) grossAmount = taxableAmount + taxAmount;

    // Matched status
    const matchedVal = findRowValue(row, ['gstr_2b_matched', 'gstr2b_matched', 'matched', 'is_matched']).toLowerCase();
    const isMatched = matchedVal === 'yes' || matchedVal === 'true' || matchedVal === '1' || matchedVal === 'y';

    // IRN status
    const irnVal = findRowValue(row, ['irn_status', 'irnstatus', 'irn_present', 'irn']).toLowerCase();
    const isIrnPresent = irnVal === 'present' || irnVal === 'yes' || irnVal === 'true' || irnVal === '1';

    // AP Leverage
    const apTierRaw = findRowValue(row, ['ap_leverage', 'apleverage', 'leverage_tier', 'ap_tier']).toUpperCase();
    const leverageTier: ApLeverageTier = apTierRaw === 'HIGH' || apTierRaw === 'LOW' ? apTierRaw : 'MEDIUM';

    // Filing Pattern
    const patternRaw = findRowValue(row, ['filing_pattern', 'filingpattern', 'pattern']).toUpperCase();
    let filingPattern: FilingPattern = 'NORMAL/PUNCTUAL';
    if (patternRaw.includes('HABITUAL') || patternRaw.includes('LAGGARD')) {
      filingPattern = 'HABITUAL LAGGARD';
    } else if (patternRaw.includes('ANOMALY')) {
      filingPattern = 'NEW ANOMALY';
    } else if (patternRaw.includes('INSUFFICIENT')) {
      filingPattern = 'INSUFFICIENT HISTORY';
    }

    // Bucket and Score
    const rawBucket = findRowValue(row, ['routing_bucket', 'routingbucket', 'bucket']).toUpperCase();
    let routingBucket: Bucket | undefined = undefined;
    if (rawBucket.includes('SAFE')) routingBucket = 'SAFE TO HOLD';
    else if (rawBucket.includes('CHASE')) routingBucket = 'CHASE NOW';
    else if (rawBucket.includes('WATCH')) routingBucket = 'WATCH';

    const rawScore = cleanNumber(findRowValue(row, ['signal_score', 'signalscore', 'score']), -1);
    const reason = findRowValue(row, ['reason', 'next_action', 'explanation']) || (isMatched ? 'Matched in GSTR-2B' : 'Discrepancy analyzed');

    const stateCode = gstin.slice(0, 2);
    const stateName = GST_STATE_MAP[stateCode] || 'India';
    const vendorId = `v-${gstin.replace(/[^A-Z0-9]/gi, '').slice(0, 8)}`;

    const vendor: Vendor = {
      id: vendorId,
      name: vendorName,
      gstin,
      city: stateName,
      state: stateName,
      filingPattern,
      filingCycles: [
        { period: 'Apr 2026', dueDate: '2026-05-11', filingDate: '2026-05-11', delayDays: 0, missed: false },
        { period: 'May 2026', dueDate: '2026-06-11', filingDate: '2026-06-11', delayDays: 0, missed: false },
        { period: 'Jun 2026', dueDate: '2026-07-11', filingDate: '2026-07-11', delayDays: 0, missed: false },
        { period: 'Jul 2026', dueDate: '2026-08-11', filingDate: '2026-08-11', delayDays: 0, missed: false },
        { period: 'Aug 2026', dueDate: '2026-09-11', filingDate: '2026-09-11', delayDays: 0, missed: false },
        { period: 'Sep 2026', dueDate: '2026-10-11', filingDate: filingPattern === 'NEW ANOMALY' ? null : '2026-10-11', delayDays: filingPattern === 'NEW ANOMALY' ? 45 : 0, missed: filingPattern === 'NEW ANOMALY' },
      ],
    };

    const matchResult: MatchResult = {
      matched: isMatched,
      confidence: isMatched ? 100 : 0,
      explanation: isMatched ? 'Matched in supplier GSTR-2B' : 'No matching record found in GSTR-2B',
    };

    const apRecord = {
      vendorId,
      unpaidAmount: leverageTier === 'HIGH' ? grossAmount * 2 : (leverageTier === 'MEDIUM' ? grossAmount * 0.5 : 0),
      overdueAmount: 0,
      retentionHeldAmount: leverageTier === 'HIGH' ? grossAmount * 0.2 : 0,
      isPaid: leverageTier === 'LOW',
    };

    const irnRecord = {
      invoiceNumber: invNum,
      gstin,
      irnPresent: isIrnPresent,
      irnRef: isIrnPresent ? `IRN-UP-${invNum.replace(/[^A-Z0-9]/gi, '')}` : null,
    };

    const scoreExplanation = rawScore >= 0 && routingBucket ? {
      baseScore: 50,
      irnAdjustment: isIrnPresent ? 20 : -15,
      apAdjustment: leverageTier === 'HIGH' ? 15 : (leverageTier === 'MEDIUM' ? 5 : -10),
      filingAdjustment: filingPattern === 'HABITUAL LAGGARD' ? 15 : (filingPattern === 'NEW ANOMALY' ? -25 : 0),
      rawScore: rawScore,
      clampedScore: rawScore,
      bucket: routingBucket,
      reason,
    } : undefined;

    invoices.push({
      id: `rec-up-${idx + 1}`,
      invoiceNumber: invNum,
      invoiceDate: invDate,
      vendorId,
      vendorName,
      gstin,
      taxableAmount,
      gstRate,
      taxAmount,
      grossAmount,
      matchResult,
      irnRecord,
      apRecord,
      vendor,
      leverageRatio: leverageTier === 'HIGH' ? 2.0 : (leverageTier === 'MEDIUM' ? 0.5 : 0.0),
      leverageTier,
      routingBucket,
      scoreExplanation,
    });
  });

  return { invoices, errors };
}

/**
 * Reconcile a list of uploaded Purchase Invoices against uploaded GSTR-2B records
 */
export function reconcileUploadedLists(
  purchaseInvoices: PurchaseInvoice[],
  gstr2bRecords: Gstr2bRecord[],
  autoRoute = true
): ReconciledInvoice[] {
  return purchaseInvoices.map((inv, idx) => {
    const matchResult = matchInvoice(inv, gstr2bRecords);
    const stateCode = inv.gstin.slice(0, 2);
    const stateName = GST_STATE_MAP[stateCode] || 'India';

    // Heuristics for realistic attributes if not specified
    const isEven = idx % 2 === 0;
    const isThird = idx % 3 === 0;

    let filingPattern: FilingPattern = 'NORMAL/PUNCTUAL';
    if (idx % 7 === 0) filingPattern = 'NEW ANOMALY';
    else if (isEven) filingPattern = 'HABITUAL LAGGARD';

    let leverageTier: ApLeverageTier = 'HIGH';
    if (idx % 5 === 0) leverageTier = 'LOW';
    else if (isThird) leverageTier = 'MEDIUM';

    const irnPresent = idx % 4 !== 0;

    const vendor: Vendor = {
      id: inv.vendorId,
      name: inv.vendorName,
      gstin: inv.gstin,
      city: stateName,
      state: stateName,
      filingPattern,
      filingCycles: [
        { period: 'Apr 2026', dueDate: '2026-05-11', filingDate: '2026-05-11', delayDays: 0, missed: false },
        { period: 'May 2026', dueDate: '2026-06-11', filingDate: '2026-06-11', delayDays: 0, missed: false },
        { period: 'Jun 2026', dueDate: '2026-07-11', filingDate: '2026-07-11', delayDays: 0, missed: false },
        { period: 'Jul 2026', dueDate: '2026-08-11', filingDate: '2026-08-11', delayDays: 0, missed: false },
        { period: 'Aug 2026', dueDate: '2026-09-11', filingDate: '2026-09-11', delayDays: 0, missed: false },
        { period: 'Sep 2026', dueDate: '2026-10-11', filingDate: filingPattern === 'NEW ANOMALY' ? null : '2026-10-11', delayDays: filingPattern === 'NEW ANOMALY' ? 45 : 0, missed: filingPattern === 'NEW ANOMALY' },
      ],
    };

    const apRecord = {
      vendorId: inv.vendorId,
      unpaidAmount: leverageTier === 'HIGH' ? inv.grossAmount * 2.5 : (leverageTier === 'MEDIUM' ? inv.grossAmount * 0.6 : 0),
      overdueAmount: 0,
      retentionHeldAmount: leverageTier === 'HIGH' ? inv.grossAmount * 0.15 : 0,
      isPaid: leverageTier === 'LOW',
    };

    const irnRecord = {
      invoiceNumber: inv.invoiceNumber,
      gstin: inv.gstin,
      irnPresent,
      irnRef: irnPresent ? `IRN-UP-${inv.invoiceNumber.replace(/[^A-Z0-9]/gi, '')}-${idx}` : null,
    };

    const { leverageRatio } = calculateApLeverage(
      apRecord.unpaidAmount,
      apRecord.retentionHeldAmount,
      inv.grossAmount
    );

    let scoreExp = undefined;
    let routingBucket: Bucket | undefined = undefined;

    if (autoRoute && !matchResult.matched) {
      // 39 days to Nov 30, 2026 cutoff
      scoreExp = calculateRoutingScore(irnPresent, leverageTier, filingPattern, undefined, undefined, 39);
      routingBucket = scoreExp.bucket;
    }

    return {
      ...inv,
      matchResult,
      irnRecord,
      apRecord,
      vendor,
      leverageRatio,
      leverageTier,
      scoreExplanation: scoreExp,
      routingBucket,
    };
  });
}

/**
 * Generate Sample Purchase Register CSV
 */
export function getSamplePrCsv(): string {
  return `pr_id,period,supplier_gstin,supplier_name,invoice_number,invoice_date,taxable_value,gst_rate,cgst_amount,sgst_amount,igst_amount,total_tax,gross_amount
PR_2001,Sep 2026,27AAACA9910Z1,Shree Ganesh Packaging Works,SGP/26-27/2001,2026-09-02,45000,18,4050,4050,0,8100,53100
PR_2002,Sep 2026,29AAACB9911Z2,Kaveri Steel Traders LLP,KST/26-27/2002,2026-09-04,120000,18,0,0,21600,21600,141600
PR_2003,Sep 2026,23AAACC9912Z3,Annapurna Agro Supplies Pvt Ltd,AAS/26-27/2003,2026-09-07,35000,5,875,875,0,1750,36750
PR_2004,Sep 2026,27AAACD9913Z4,Sahyadri Logistics & Freight,SLF/26-27/2004,2026-09-10,88000,18,7920,7920,0,15840,103840
PR_2005,Sep 2026,07AAACM9922Z4,Rajdhani Tech Solutions Ltd,RTS/26-27/2005,2026-09-12,95000,18,0,0,17100,17100,112100
PR_2006,Sep 2026,27AAACN9923Z5,Pioneer Courier & Logistics,PC/26-27/2006,2026-09-15,18500,18,1665,1665,0,3330,21830
PR_2007,Sep 2026,33AAACF9915Z6,Lakshmi Electricals Corp,LEC/26-27/2007,2026-09-18,62000,18,0,0,11160,11160,73160
PR_2008,Sep 2026,03AAACH9917Z8,Bharat Fasteners & Hardware,BFH/26-27/2008,2026-09-21,41000,12,2460,2460,0,4920,45920
PR_2009,Sep 2026,09AAACJ9919Z1,Ganga Chemicals Pvt Ltd,GCP/26-27/2009,2026-09-24,76000,18,0,0,13680,13680,89680
PR_2010,Sep 2026,32AAACL9921Z3,Malabar Spice Exports,MSE/26-27/2010,2026-09-27,54000,5,0,0,2700,2700,56700`;
}

/**
 * Generate Sample GSTR-2B CSV
 */
export function getSampleGstr2bCsv(): string {
  return `gstr2b_id,supplier_gstin,invoice_number,invoice_date,taxable_value,total_tax,filing_date_gstr1,itc_availability
2B_2001,27AAACA9910Z1,SGP/26-27/2001,2026-09-02,45000,8100,2026-09-11,Y
2B_2002,29AAACB9911Z2,KST-26-27-2002,2026-09-04,120000,21600,2026-09-12,Y
2B_2003,23AAACC9912Z3,AAS/26-27/2003,2026-09-07,35000,1750,2026-09-10,Y
2B_2004,27AAACD9913Z4,SLF/26-27/2004,2026-09-10,88000,15840,2026-09-11,Y
2B_2007,33AAACF9915Z6,LEC/26-27/2007,2026-09-18,62000,11160,2026-09-11,Y
2B_2008,03AAACH9917Z8,BFH/26-27/2008,2026-09-21,41000,4920,2026-09-12,Y`;
}

/**
 * Generate Sample Reconciled Audit CSV (Single file)
 */
export function getSampleReconciledCsv(): string {
  return `# GST CREDIT-AT-RISK RECONCILED AUDIT SAMPLE
Invoice No,Invoice Date,Vendor Name,Vendor GSTIN,Taxable Amount (INR),GST Rate %,GST Amount at Risk (INR),Gross Amount (INR),GSTR-2B Matched,IRN Status,AP Leverage,Filing Pattern,Signal Score,Routing Bucket,Reason
"INV-2026-101","2026-09-05","Apex Engineering Works","27AAACA1234A1Z1","85000","18","15300","100300","No","Present","HIGH","HABITUAL LAGGARD","100","SAFE TO HOLD","Verified IRN and high payment hold indicate timing lag."
"INV-2026-102","2026-09-08","Zenith Logistics Solutions","07AAACB2345B1Z2","64000","18","11520","75520","No","Absent","MEDIUM","NEW ANOMALY","40","WATCH","Mixed signals: missing IRN with moderate AP leverage."
"INV-2026-103","2026-09-12","Orion Raw Materials Corp","29AAACC3456C1Z3","110000","18","19800","129800","No","Absent","LOW","NEW ANOMALY","0","CHASE NOW","Critical discrepancy: zero payment leverage, missing IRN, and abrupt non-filing."
"INV-2026-104","2026-09-15","Delta Packaging LLP","33AAACD4567D1Z4","42000","18","7560","49560","Yes","Present","HIGH","NORMAL/PUNCTUAL","N/A","UNROUTED","Exact match in GSTR-2B return."
"INV-2026-105","2026-09-18","Sigma Industrial Spares","03AAACE5678E1Z5","72000","18","12960","84960","Yes","Present","HIGH","NORMAL/PUNCTUAL","N/A","UNROUTED","Exact match in GSTR-2B return."
"INV-2026-106","2026-09-22","Nexus Chemical Industries","24AAACF6789F1Z6","53000","18","9540","62540","No","Present","HIGH","HABITUAL LAGGARD","100","SAFE TO HOLD","Known quarterly filing lag with strong retention leverage."`;
}

/**
 * Triggers a browser download of a given text content as a file
 */
export function downloadFile(filename: string, content: string, mimeType = 'text/csv;charset=utf-8;'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
