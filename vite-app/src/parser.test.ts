import { describe, it, expect } from 'vitest';
import {
  parseCsv,
  normalizeDate,
  cleanNumber,
  parsePurchaseRegisterCsv,
  parseGstr2bCsv,
  parseReconciledAuditCsv,
  reconcileUploadedLists,
  getSamplePrCsv,
  getSampleGstr2bCsv,
  getSampleReconciledCsv,
} from './parser';

describe('CSV Parser Core Tests', () => {
  it('parses basic CSV lines with quotes and commas', () => {
    const csv = `col1,col2,col3\n"val, 1",val2,"val ""escaped"" 3"\n4,5,6`;
    const { headers, rows } = parseCsv(csv);
    expect(headers).toEqual(['col1', 'col2', 'col3']);
    expect(rows.length).toBe(2);
    expect(rows[0]['col1']).toBe('val, 1');
    expect(rows[0]['col2']).toBe('val2');
    expect(rows[0]['col3']).toBe('val "escaped" 3');
    expect(rows[1]['col1']).toBe('4');
  });

  it('skips comments and handles CRLF newlines', () => {
    const csv = `# Comment line 1\r\n# Comment line 2\r\nid,name,tax\r\n1,"Vendor A",500\r\n2,"Vendor B",1200\r\n`;
    const { headers, rows } = parseCsv(csv);
    expect(headers).toEqual(['id', 'name', 'tax']);
    expect(rows.length).toBe(2);
  });

  it('normalizes various date formats to YYYY-MM-DD', () => {
    expect(normalizeDate('2026-09-10')).toBe('2026-09-10');
    expect(normalizeDate('15/08/2026')).toBe('2026-08-15');
    expect(normalizeDate('05-11-2026')).toBe('2026-11-05');
  });

  it('cleans numeric fields removing symbols and commas', () => {
    expect(cleanNumber('₹ 45,000.50')).toBe(45000.5);
    expect(cleanNumber('120,000')).toBe(120000);
    expect(cleanNumber(500)).toBe(500);
    expect(cleanNumber(undefined, 18)).toBe(18);
  });
});

describe('Purchase Register & GSTR-2B Parsing Tests', () => {
  it('parses sample Purchase Register CSV correctly', () => {
    const samplePr = getSamplePrCsv();
    const { invoices, errors } = parsePurchaseRegisterCsv(samplePr);
    expect(errors.length).toBe(0);
    expect(invoices.length).toBe(10);
    expect(invoices[0].invoiceNumber).toBe('SGP/26-27/2001');
    expect(invoices[0].gstin).toBe('27AAACA9910Z1');
    expect(invoices[0].taxAmount).toBe(8100);
    expect(invoices[0].grossAmount).toBe(53100);
  });

  it('parses sample GSTR-2B CSV correctly', () => {
    const sample2b = getSampleGstr2bCsv();
    const { records, errors } = parseGstr2bCsv(sample2b);
    expect(errors.length).toBe(0);
    expect(records.length).toBe(6);
    expect(records[0].invoiceNumber).toBe('SGP/26-27/2001');
    expect(records[0].gstin).toBe('27AAACA9910Z1');
    expect(records[0].taxAmount).toBe(8100);
  });

  it('reconciles uploaded PR against GSTR-2B and computes buckets', () => {
    const { invoices } = parsePurchaseRegisterCsv(getSamplePrCsv());
    const { records } = parseGstr2bCsv(getSampleGstr2bCsv());

    const reconciled = reconcileUploadedLists(invoices, records, true);
    expect(reconciled.length).toBe(10);

    const matched = reconciled.filter((i) => i.matchResult.matched);
    const unmatched = reconciled.filter((i) => !i.matchResult.matched);

    // 6 matched (2001, 2002 fuzzy KST, 2003, 2004, 2007, 2008) and 4 unmatched
    expect(matched.length).toBe(6);
    expect(unmatched.length).toBe(4);

    // Unmatched should have routing buckets assigned
    unmatched.forEach((inv) => {
      expect(inv.routingBucket).toBeDefined();
      expect(['SAFE TO HOLD', 'WATCH', 'CHASE NOW']).toContain(inv.routingBucket);
    });
  });

  it('parses Reconciled Audit CSV export format correctly', () => {
    const sampleRec = getSampleReconciledCsv();
    const { invoices, errors } = parseReconciledAuditCsv(sampleRec);
    expect(errors.length).toBe(0);
    expect(invoices.length).toBe(6);

    const inv101 = invoices.find((i) => i.invoiceNumber === 'INV-2026-101');
    expect(inv101).toBeDefined();
    expect(inv101?.matchResult.matched).toBe(false);
    expect(inv101?.routingBucket).toBe('SAFE TO HOLD');
    expect(inv101?.scoreExplanation?.clampedScore).toBe(100);

    const inv104 = invoices.find((i) => i.invoiceNumber === 'INV-2026-104');
    expect(inv104).toBeDefined();
    expect(inv104?.matchResult.matched).toBe(true);
  });
});
