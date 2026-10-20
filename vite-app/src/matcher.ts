import type { Gstr2bRecord, MatchResult, PurchaseInvoice } from './types';

/**
 * Normalizes an invoice number:
 * Removes spaces, hyphens, slashes, and common punctuation; turns to uppercase.
 */
export function normalizeInvoiceNumber(invNum: string): string {
  return invNum
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

/**
 * Computes Levenshtein edit distance between two strings
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

/**
 * Reconcile a single purchase invoice against a list of candidate GSTR-2B records
 */
export function matchInvoice(
  purchase: PurchaseInvoice,
  gstr2bRecords: Gstr2bRecord[]
): MatchResult {
  // CRITICAL: We NEVER match records with different GSTINs. That prevents cross-vendor false positives.
  const vendorGstr2b = gstr2bRecords.filter(
    (g) => g.gstin.trim().toUpperCase() === purchase.gstin.trim().toUpperCase()
  );

  if (vendorGstr2b.length === 0) {
    return {
      matched: false,
      confidence: 0,
      explanation: 'No GSTR-2B records found for supplier GSTIN',
    };
  }

  const normPurchaseNo = normalizeInvoiceNumber(purchase.invoiceNumber);

  // 1. Try exact normalized invoice number match + tax tolerance
  for (const record of vendorGstr2b) {
    const normRecordNo = normalizeInvoiceNumber(record.invoiceNumber);
    const taxDiff = Math.abs(record.taxAmount - purchase.taxAmount);

    if (normPurchaseNo === normRecordNo && taxDiff <= 1) {
      const isExactString = purchase.invoiceNumber === record.invoiceNumber;
      return {
        matched: true,
        confidence: isExactString ? 100 : 96,
        matchedRecord: record,
        explanation: isExactString
          ? 'Exact invoice number, GSTIN, and tax amount match'
          : `Normalized invoice number match (${purchase.invoiceNumber} vs ${record.invoiceNumber})`,
      };
    }
  }

  // 2. Try fuzzy invoice number matching (edit distance <= 2) with matching or near tax amount
  let bestCandidate: Gstr2bRecord | null = null;
  let bestConfidence = 0;
  let bestExplanation = '';

  for (const record of vendorGstr2b) {
    const normRecordNo = normalizeInvoiceNumber(record.invoiceNumber);
    const dist = levenshteinDistance(normPurchaseNo, normRecordNo);
    const taxDiff = Math.abs(record.taxAmount - purchase.taxAmount);

    // If edit distance is 1 or 2 and tax is identical, valid noisy match
    if (dist <= 2 && taxDiff <= 2) {
      const maxLen = Math.max(normPurchaseNo.length, normRecordNo.length);
      const similarity = Math.round(((maxLen - dist) / maxLen) * 100);
      const confidence = Math.max(70, Math.min(94, similarity));

      if (confidence > bestConfidence) {
        bestConfidence = confidence;
        bestCandidate = record;
        bestExplanation = `Fuzzy matched with edit distance ${dist} on invoice number (${purchase.invoiceNumber} ~ ${record.invoiceNumber})`;
      }
    }
  }

  if (bestCandidate && bestConfidence >= 70) {
    return {
      matched: true,
      confidence: bestConfidence,
      matchedRecord: bestCandidate,
      explanation: bestExplanation,
    };
  }

  return {
    matched: false,
    confidence: 0,
    explanation: 'No matching invoice found in GSTR-2B',
  };
}
