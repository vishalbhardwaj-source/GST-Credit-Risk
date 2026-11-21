import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import {
  parsePurchaseRegisterCsv,
  parseGstr2bCsv,
  parseReconciledAuditCsv,
  reconcileUploadedLists,
} from './parser';

describe('200-Entry Demo Files Verification', () => {
  const prPath = path.resolve(__dirname, '../../purchase_register_demo_200.csv');
  const g2bPath = path.resolve(__dirname, '../../gstr2b_demo_200.csv');
  const auditPath = path.resolve(__dirname, '../../reconciled_audit_demo_200.csv');

  it('verifies purchase_register_demo_200.csv parses cleanly with 200 entries and 0 errors', () => {
    const content = fs.readFileSync(prPath, 'utf-8');
    const { invoices, errors } = parsePurchaseRegisterCsv(content);
    expect(errors).toEqual([]);
    expect(invoices.length).toBe(200);
    expect(invoices[0].invoiceNumber).toBeDefined();
    expect(invoices[0].gstin).toMatch(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9A-Z]{1}Z[0-9A-Z]{1}$/);
  });

  it('verifies gstr2b_demo_200.csv parses cleanly with 200 entries and 0 errors', () => {
    const content = fs.readFileSync(g2bPath, 'utf-8');
    const { records, errors } = parseGstr2bCsv(content);
    expect(errors).toEqual([]);
    expect(records.length).toBe(200);
    expect(records[0].invoiceNumber).toBeDefined();
  });

  it('reconciles PR (200) and GSTR-2B (200) producing matches and categorized discrepancies', () => {
    const prContent = fs.readFileSync(prPath, 'utf-8');
    const g2bContent = fs.readFileSync(g2bPath, 'utf-8');

    const { invoices } = parsePurchaseRegisterCsv(prContent);
    const { records } = parseGstr2bCsv(g2bContent);

    const reconciled = reconcileUploadedLists(invoices, records, true);
    expect(reconciled.length).toBe(200);

    const matched = reconciled.filter((i) => i.matchResult.matched);
    const unmatched = reconciled.filter((i) => !i.matchResult.matched);

    expect(matched.length).toBe(140);
    expect(unmatched.length).toBe(60);

    // Verify unmatched invoices have 3-signal triage routing buckets
    unmatched.forEach((inv) => {
      expect(['SAFE TO HOLD', 'WATCH', 'CHASE NOW']).toContain(inv.routingBucket);
      expect(inv.scoreExplanation).toBeDefined();
    });
  });

  it('verifies reconciled_audit_demo_200.csv parses cleanly with 200 entries and 0 errors', () => {
    const content = fs.readFileSync(auditPath, 'utf-8');
    const { invoices, errors } = parseReconciledAuditCsv(content);
    expect(errors).toEqual([]);
    expect(invoices.length).toBe(200);

    const matched = invoices.filter((i) => i.matchResult.matched);
    const safeToHold = invoices.filter((i) => i.routingBucket === 'SAFE TO HOLD');
    const watch = invoices.filter((i) => i.routingBucket === 'WATCH');
    const chaseNow = invoices.filter((i) => i.routingBucket === 'CHASE NOW');

    expect(matched.length).toBe(120);
    expect(safeToHold.length).toBe(45);
    expect(watch.length).toBe(23);
    expect(chaseNow.length).toBe(12);
  });
});
