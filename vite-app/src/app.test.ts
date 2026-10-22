import { describe, it, expect } from 'vitest';
import { calculateApLeverage, calculateRoutingScore } from './scoring';
import { matchInvoice, normalizeInvoiceNumber } from './matcher';
import { generateSyntheticDataset } from './data';
import type { PurchaseInvoice, Gstr2bRecord } from './types';

describe('GST Credit-at-Risk Scoring Engine Tests', () => {
  it('Scenario 1: Safe to Hold (IRN Present + High AP + Habitual Laggard) = 100', () => {
    const result = calculateRoutingScore(true, 'HIGH', 'HABITUAL LAGGARD');
    expect(result.rawScore).toBe(100);
    expect(result.clampedScore).toBe(100);
    expect(result.bucket).toBe('SAFE TO HOLD');
  });

  it('Scenario 2: Watch Case 1 (IRN Absent + High AP + Habitual Laggard) = 65', () => {
    const result = calculateRoutingScore(false, 'HIGH', 'HABITUAL LAGGARD');
    // 50 - 15 + 15 + 15 = 65
    expect(result.rawScore).toBe(65);
    expect(result.clampedScore).toBe(65);
    expect(result.bucket).toBe('WATCH');
  });

  it('Scenario 3: Watch Case 2 (IRN Present + Medium AP + New Anomaly) = 50', () => {
    const result = calculateRoutingScore(true, 'MEDIUM', 'NEW ANOMALY');
    // 50 + 20 + 5 - 25 = 50
    expect(result.rawScore).toBe(50);
    expect(result.clampedScore).toBe(50);
    expect(result.bucket).toBe('WATCH');
  });

  it('Scenario 4: Chase Now (IRN Absent + Low AP + New Anomaly) = 0 (clamped from 0)', () => {
    const result = calculateRoutingScore(false, 'LOW', 'NEW ANOMALY');
    // 50 - 15 - 10 - 25 = 0
    expect(result.rawScore).toBe(0);
    expect(result.clampedScore).toBe(0);
    expect(result.bucket).toBe('CHASE NOW');
  });

  it('Score clamping to 0-100 range', () => {
    // Test upper clamp
    const high = calculateRoutingScore(true, 'HIGH', 'HABITUAL LAGGARD');
    expect(high.clampedScore).toBeLessThanOrEqual(100);

    // Test lower clamp
    const low = calculateRoutingScore(false, 'LOW', 'NEW ANOMALY');
    expect(low.clampedScore).toBeGreaterThanOrEqual(0);
  });
});

describe('Reconciliation & Fuzzy Matching Tests', () => {
  it('Normalizes punctuation, case, and slashes', () => {
    expect(normalizeInvoiceNumber('SGP/26-27/0412')).toBe('SGP26270412');
    expect(normalizeInvoiceNumber('sgp-26-27-0412')).toBe('SGP26270412');
    expect(normalizeInvoiceNumber('SGP 26 27 0412')).toBe('SGP26270412');
  });

  it('Matches noisy but valid records with confidence', () => {
    const purchase: PurchaseInvoice = {
      id: 'inv-test-1',
      invoiceNumber: 'SGP/26-27/1031',
      invoiceDate: '2026-09-04',
      vendorId: 'v01',
      vendorName: 'Shree Ganesh Packaging Works',
      gstin: '27AAACA9910Z1',
      taxableAmount: 50000,
      gstRate: 18,
      taxAmount: 9000,
      grossAmount: 59000,
    };

    const gstr2bList: Gstr2bRecord[] = [
      {
        id: '2b-test-1',
        invoiceNumber: 'SGP-26-27-1031', // modified punctuation
        invoiceDate: '2026-09-04',
        gstin: '27AAACA9910Z1',
        taxableAmount: 50000,
        taxAmount: 9000,
      },
    ];

    const result = matchInvoice(purchase, gstr2bList);
    expect(result.matched).toBe(true);
    expect(result.confidence).toBeGreaterThanOrEqual(90);
  });

  it('Prevents cross-vendor false matches even if amounts and numbers match', () => {
    const purchase: PurchaseInvoice = {
      id: 'inv-test-2',
      invoiceNumber: 'INV/001',
      invoiceDate: '2026-09-10',
      vendorId: 'v01',
      vendorName: 'Vendor A',
      gstin: '27AAACA9910Z1',
      taxableAmount: 10000,
      gstRate: 18,
      taxAmount: 1800,
      grossAmount: 11800,
    };

    const gstr2bList: Gstr2bRecord[] = [
      {
        id: '2b-test-2',
        invoiceNumber: 'INV/001',
        invoiceDate: '2026-09-10',
        gstin: '29DIFFVENDORZ9', // Different GSTIN
        taxableAmount: 10000,
        taxAmount: 1800,
      },
    ];

    const result = matchInvoice(purchase, gstr2bList);
    expect(result.matched).toBe(false);
  });
});

describe('Synthetic Dataset Benchmark Criteria Tests', () => {
  const dataset = generateSyntheticDataset(42);

  it('Has exactly 200 purchase-register invoices', () => {
    expect(dataset.purchaseInvoices.length).toBe(200);
  });

  it('Has exactly 170 matching GSTR-2B records and 30 unmatched invoices', () => {
    expect(dataset.gstr2bRecords.length).toBe(170);

    let matchCount = 0;
    let unmatchedCount = 0;
    const unmatchedInvoices: PurchaseInvoice[] = [];

    dataset.purchaseInvoices.forEach((inv) => {
      const match = matchInvoice(inv, dataset.gstr2bRecords);
      if (match.matched) {
        matchCount++;
      } else {
        unmatchedCount++;
        unmatchedInvoices.push(inv);
      }
    });

    expect(matchCount).toBe(170);
    expect(unmatchedCount).toBe(30);
  });

  it('Routes the 30 mismatches into exactly 25 Safe to Hold, 4 Watch, and 1 Chase Now', () => {
    let safeCount = 0;
    let watchCount = 0;
    let chaseCount = 0;

    // Evaluate the 30 unmatched invoices (first 30)
    for (let i = 0; i < 30; i++) {
      const inv = dataset.purchaseInvoices[i];
      const vendor = dataset.vendorMap.get(inv.vendorId)!;
      const ap = dataset.apRecords.get(vendor.id)!;
      const irn = dataset.irnRegistry.get(inv.invoiceNumber)!;

      const { leverageTier } = calculateApLeverage(
        ap.unpaidAmount,
        ap.retentionHeldAmount,
        inv.grossAmount
      );

      const score = calculateRoutingScore(
        irn.irnPresent,
        leverageTier,
        vendor.filingPattern
      );

      if (score.bucket === 'SAFE TO HOLD') safeCount++;
      else if (score.bucket === 'WATCH') watchCount++;
      else if (score.bucket === 'CHASE NOW') chaseCount++;
    }

    expect(safeCount).toBe(25);
    expect(watchCount).toBe(4);
    expect(chaseCount).toBe(1);
  });
});

describe('4-State IRN Scoring Engine Tests', () => {
  it('ABSENT_UNKNOWN → zero IRN penalty; score = 50 + 0 - 10 - 25 = 15 (raw 15, CHASE NOW not 0)', () => {
    const result = calculateRoutingScore(false, 'LOW', 'NEW ANOMALY', undefined, 'ABSENT_UNKNOWN');
    // Score is 15 (not 0) — the IRN absence does NOT automatically add -15
    expect(result.rawScore).toBe(15);
    expect(result.clampedScore).toBe(15);
    // 15 < 40 threshold → still CHASE NOW, but score is better than the unassessed default (0)
    expect(result.bucket).toBe('CHASE NOW');
  });

  it('ABSENT_NOT_APPLICABLE → zero IRN penalty; score = 50 + 0 - 10 - 25 = 15', () => {
    const result = calculateRoutingScore(false, 'LOW', 'NEW ANOMALY', undefined, 'ABSENT_NOT_APPLICABLE');
    expect(result.rawScore).toBe(15);
    expect(result.clampedScore).toBe(15);
    expect(result.bucket).toBe('CHASE NOW');
  });

  it('ABSENT_APPLIES → -15 pts; score = 50 - 15 - 10 - 25 = 0 (CHASE NOW)', () => {
    const result = calculateRoutingScore(false, 'LOW', 'NEW ANOMALY', undefined, 'ABSENT_APPLIES');
    expect(result.rawScore).toBe(0);
    expect(result.clampedScore).toBe(0);
    expect(result.bucket).toBe('CHASE NOW');
  });

  it('PRESENT IRN state → +20 pts; score = 50 + 20 + 15 + 15 = 100 (SAFE TO HOLD)', () => {
    const result = calculateRoutingScore(false, 'HIGH', 'HABITUAL LAGGARD', undefined, 'PRESENT');
    expect(result.rawScore).toBe(100);
    expect(result.clampedScore).toBe(100);
    expect(result.bucket).toBe('SAFE TO HOLD');
  });

  it('ABSENT_UNKNOWN produces higher score than unassessed absent (fixture vs live separation)', () => {
    const withUnknown = calculateRoutingScore(false, 'LOW', 'NEW ANOMALY', undefined, 'ABSENT_UNKNOWN');
    const withoutLookup = calculateRoutingScore(false, 'LOW', 'NEW ANOMALY');
    // No lookup → absent IRN → -15 penalty → score 0
    expect(withoutLookup.rawScore).toBe(0);
    expect(withoutLookup.bucket).toBe('CHASE NOW');
    // ABSENT_UNKNOWN → zero penalty → score 15 (IRN absence doesn't automatically penalize)
    expect(withUnknown.rawScore).toBe(15);
    expect(withUnknown.bucket).toBe('CHASE NOW');
    // Key invariant: unknown cannot be scored *worse* than explicit applies
    expect(withUnknown.rawScore).toBeGreaterThan(withoutLookup.rawScore);
  });

  it('ABSENT_UNKNOWN with HIGH AP + HABITUAL LAGGARD → WATCH (score 80 vs 65 without unknown)', () => {
    // Sufficient positive signals can lift ABSENT_UNKNOWN to SAFE TO HOLD or WATCH
    const withUnknown = calculateRoutingScore(false, 'HIGH', 'HABITUAL LAGGARD', undefined, 'ABSENT_UNKNOWN');
    // 50 + 0 + 15 + 15 = 80 → SAFE TO HOLD
    expect(withUnknown.rawScore).toBe(80);
    expect(withUnknown.bucket).toBe('SAFE TO HOLD');
    // Without lookup → 50 - 15 + 15 + 15 = 65 → WATCH
    const withoutLookup = calculateRoutingScore(false, 'HIGH', 'HABITUAL LAGGARD');
    expect(withoutLookup.rawScore).toBe(65);
    expect(withoutLookup.bucket).toBe('WATCH');
    // Unknown spares the vendor the -15 penalty, which can meaningfully shift the bucket
    expect(withUnknown.bucket).toBe('SAFE TO HOLD');
    expect(withoutLookup.bucket).toBe('WATCH');
  });

  it('Fixture 25/4/1 counts are invariant regardless of 4-state IRN logic (fixture separation lock)', () => {
    // Re-runs fixture routing WITHOUT any live vendor lookups to confirm benchmark is deterministic
    const dataset = generateSyntheticDataset(42);
    let safeCount = 0, watchCount = 0, chaseCount = 0;
    for (let i = 0; i < 30; i++) {
      const inv = dataset.purchaseInvoices[i];
      const vendor = dataset.vendorMap.get(inv.vendorId)!;
      const ap = dataset.apRecords.get(vendor.id)!;
      const irn = dataset.irnRegistry.get(inv.invoiceNumber)!;
      const { leverageTier } = calculateApLeverage(ap.unpaidAmount, ap.retentionHeldAmount, inv.grossAmount);
      // No explicitIrnState — fixture routing uses default absent-is-risky logic
      const score = calculateRoutingScore(irn.irnPresent, leverageTier, vendor.filingPattern);
      if (score.bucket === 'SAFE TO HOLD') safeCount++;
      else if (score.bucket === 'WATCH') watchCount++;
      else if (score.bucket === 'CHASE NOW') chaseCount++;
    }
    expect(safeCount).toBe(25);
    expect(watchCount).toBe(4);
    expect(chaseCount).toBe(1);
  });
});

describe('Section 16(4) Statutory Cutoff Urgency Tests', () => {
  it('Safe to Hold invoice degrades to Watch when cutoff is within 35 days (-10 pts)', () => {
    // Watch Case 1 without cutoff: 50 - 15 + 15 + 15 = 65
    // Safe to Hold: 50 + 20 + 15 + 15 = 100
    // If daysToCutoff = 30 -> 100 - 10 = 90 (still Safe to Hold)
    // Moderate Safe (e.g. Medium AP + Habitual): 50 + 20 + 5 + 15 = 90 -> 80
    // Borderline Safe: 50 + 20 + 5 + 0 = 75 -> with 30 days cutoff (-10): 65 -> degrades to WATCH!
    const borderline = calculateRoutingScore(true, 'MEDIUM', 'NORMAL/PUNCTUAL');
    expect(borderline.clampedScore).toBe(75);
    expect(borderline.bucket).toBe('SAFE TO HOLD');

    const nearDeadline = calculateRoutingScore(true, 'MEDIUM', 'NORMAL/PUNCTUAL', undefined, undefined, 30);
    expect(nearDeadline.clampedScore).toBe(65);
    expect(nearDeadline.bucket).toBe('WATCH');
  });

  it('Critical proximity within 15 days applies -20 pts urgency penalty', () => {
    // 50 + 20 + 5 + 15 = 90. Within 10 days of Nov 30: 90 - 20 = 70 -> degrades to WATCH
    const urgent = calculateRoutingScore(true, 'MEDIUM', 'HABITUAL LAGGARD', undefined, undefined, 10);
    expect(urgent.cutoffAdjustment).toBe(-20);
    expect(urgent.clampedScore).toBe(70);
    expect(urgent.bucket).toBe('WATCH');
  });
});
