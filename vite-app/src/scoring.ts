import type {
  ApLeverageTier,
  Bucket,
  FilingPattern,
  IrnState,
  ScoreExplanation,
} from './types';

export function calculateApLeverage(
  unpaidAmount: number,
  retentionHeldAmount: number,
  invoiceGrossAmount: number
): { leverageRatio: number; leverageTier: ApLeverageTier } {
  const denominator = Math.max(invoiceGrossAmount, 1);
  const leverageRatio = (unpaidAmount + retentionHeldAmount) / denominator;

  let leverageTier: ApLeverageTier = 'LOW';
  if (leverageRatio >= 1.0) {
    leverageTier = 'HIGH';
  } else if (leverageRatio > 0) {
    leverageTier = 'MEDIUM';
  } else {
    leverageTier = 'LOW';
  }

  return { leverageRatio, leverageTier };
}

/**
 * Deterministic Self-Correction Signal Score Engine with 4-State IRN:
 *
 * IRN State               Meaning                   Effect on Score
 * - 'PRESENT'             Registered on IRP         +20 (Pushes toward "wait")
 * - 'ABSENT_APPLIES'      Should exist, doesn't     -15 (Raises risk)
 * - 'ABSENT_NOT_APPLICABLE' Vendor is exempt (<₹5Cr)  0 (Neutral)
 * - 'ABSENT_UNKNOWN'      Couldn't determine / fail   0 (Neutral, labeled "unknown")
 *
 * Base score: 50
 * Clamped to 0–100.
 */
export function calculateRoutingScore(
  irnPresent: boolean,
  leverageTier: ApLeverageTier,
  filingPattern: FilingPattern,
  irnApplicabilityStatus?: 'LIKELY_APPLICABLE' | 'APPLICABILITY_UNCLEAR' | 'LIKELY_NOT_APPLICABLE',
  explicitIrnState?: IrnState,
  daysToCutoff?: number
): ScoreExplanation {
  const baseScore = 50;

  // Compute 4-state IRN adjustment:
  let irnAdjustment = 0;
  if (explicitIrnState) {
    if (explicitIrnState === 'PRESENT') {
      irnAdjustment = 20;
    } else if (explicitIrnState === 'ABSENT_APPLIES') {
      irnAdjustment = -15;
    } else {
      // ABSENT_NOT_APPLICABLE or ABSENT_UNKNOWN -> 0 (zero risk contribution)
      irnAdjustment = 0;
    }
  } else if (irnPresent) {
    irnAdjustment = 20;
  } else {
    if (irnApplicabilityStatus === 'LIKELY_NOT_APPLICABLE' || irnApplicabilityStatus === 'APPLICABILITY_UNCLEAR') {
      irnAdjustment = 0; // neutral / unknown signal
    } else {
      irnAdjustment = -15; // default negative penalty when applicable or unassessed
    }
  }

  let apAdjustment = 0;
  if (leverageTier === 'HIGH') {
    apAdjustment = 15;
  } else if (leverageTier === 'MEDIUM') {
    apAdjustment = 5;
  } else {
    apAdjustment = -10;
  }

  let filingAdjustment = 0;
  if (filingPattern === 'HABITUAL LAGGARD') {
    filingAdjustment = 15;
  } else if (filingPattern === 'NEW ANOMALY') {
    filingAdjustment = -25;
  } else {
    filingAdjustment = 0;
  }

  // Statutory Deadline Urgency Adjustment (Section 16(4) Reversal Cutoff)
  let cutoffAdjustment = 0;
  if (daysToCutoff !== undefined) {
    if (daysToCutoff <= 15) {
      // Critical proximity: holding is high risk because statutory credit reversal window is closing
      cutoffAdjustment = -20;
    } else if (daysToCutoff <= 35) {
      // Approaching deadline: moderate caution downgrade
      cutoffAdjustment = -10;
    }
  }

  const rawScore = baseScore + irnAdjustment + apAdjustment + filingAdjustment + cutoffAdjustment;
  const clampedScore = Math.max(0, Math.min(100, rawScore));

  let bucket: Bucket;
  let reason = '';

  if (clampedScore >= 75) {
    bucket = 'SAFE TO HOLD';
    reason =
      'Positive signals (IRN verified, high AP payment hold, or habitual supplier delay pattern) suggest a routine reporting lag. Monitor or follow up softly.';
  } else if (clampedScore >= 40) {
    bucket = 'WATCH';
    reason =
      'Signals are mixed or uncertain. Retain AP leverage or verify IRN copy before the upcoming return deadline.';
  } else {
    bucket = 'CHASE NOW';
    reason =
      'Critical discrepancy risk (missing IRN, zero payment leverage, or imminent Section 16(4) statutory cutoff). Prioritize supplier outreach and review potential ITC reversal.';
  }

  return {
    baseScore,
    irnAdjustment,
    apAdjustment,
    filingAdjustment,
    cutoffAdjustment,
    rawScore,
    clampedScore,
    bucket,
    reason,
  };
}
