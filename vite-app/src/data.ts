import type {
  ApVendorRecord,
  FilingCycle,
  Gstr2bRecord,
  IrnRecord,
  PurchaseInvoice,
  Vendor,
} from './types';



export function generateSyntheticDataset(_seed = 42) {

  // 30 Fictional Synthetic Suppliers
  const vendorTemplates = [
    { name: 'Shree Ganesh Packaging Works', city: 'Pune', state: 'Maharashtra', code: '27' },
    { name: 'Kaveri Steel Traders LLP', city: 'Bengaluru', state: 'Karnataka', code: '29' },
    { name: 'Annapurna Agro Supplies Pvt Ltd', city: 'Indore', state: 'Madhya Pradesh', code: '23' },
    { name: 'Sahyadri Logistics & Freight', city: 'Nashik', state: 'Maharashtra', code: '27' },
    { name: 'Vardhman Polymers Ltd', city: 'Ahmedabad', state: 'Gujarat', code: '24' },
    { name: 'Lakshmi Electricals Corp', city: 'Chennai', state: 'Tamil Nadu', code: '33' },
    { name: 'Narmada Office Supplies', city: 'Vadodara', state: 'Gujarat', code: '24' },
    { name: 'Bharat Fasteners & Hardware', city: 'Ludhiana', state: 'Punjab', code: '03' },
    { name: 'Deccan Print House LLP', city: 'Hyderabad', state: 'Telangana', code: '36' },
    { name: 'Ganga Chemicals Pvt Ltd', city: 'Kanpur', state: 'Uttar Pradesh', code: '09' },
    { name: 'Konark Engineering Services', city: 'Bhubaneswar', state: 'Odisha', code: '21' },
    { name: 'Malabar Spice Exports', city: 'Kochi', state: 'Kerala', code: '32' },
    { name: 'Rajdhani Tech Solutions Ltd', city: 'New Delhi', state: 'Delhi', code: '07' },
    { name: 'Pioneer Courier & Logistics', city: 'Mumbai', state: 'Maharashtra', code: '27' },
    { name: 'Himalayan Herbal Extracts', city: 'Dehradun', state: 'Uttarakhand', code: '05' },
    { name: 'Chola Textile Mills', city: 'Coimbatore', state: 'Tamil Nadu', code: '33' },
    { name: 'Sonar Bangla Kraft Paper', city: 'Kolkata', state: 'West Bengal', code: '19' },
    { name: 'Marwar Precision Tools', city: 'Jodhpur', state: 'Rajasthan', code: '08' },
    { name: 'Coromandel Industrial Gases', city: 'Visakhapatnam', state: 'Andhra Pradesh', code: '37' },
    { name: 'Kalinga Minerals Corp', city: 'Rourkela', state: 'Odisha', code: '21' },
    { name: 'Godavari Safety Equipments', city: 'Aurangabad', state: 'Maharashtra', code: '27' },
    { name: 'Brahmputra Jute Products', city: 'Guwahati', state: 'Assam', code: '18' },
    { name: 'Vindhya Refractories', city: 'Katni', state: 'Madhya Pradesh', code: '23' },
    { name: 'Satpura Bearing Works', city: 'Jabalpur', state: 'Madhya Pradesh', code: '23' },
    { name: 'Thar Desert Logistics', city: 'Jaipur', state: 'Rajasthan', code: '08' },
    { name: 'Cauvery Valve & Pumps', city: 'Mysuru', state: 'Karnataka', code: '29' },
    { name: 'Gomti Packaging Solutions', city: 'Lucknow', state: 'Uttar Pradesh', code: '09' },
    { name: 'Tapti Rubber Products', city: 'Surat', state: 'Gujarat', code: '24' },
    { name: 'Mahanadi Heavy Castings', city: 'Raipur', state: 'Chhattisgarh', code: '22' },
    { name: 'Yamuna Glass Containers', city: 'Firozabad', state: 'Uttar Pradesh', code: '09' },
  ];

  // Specific vendors mapped for designated test cases:
  // v01-v15 will be primary vendors
  const vendors: Vendor[] = vendorTemplates.map((t, idx) => {
    const id = `v${String(idx + 1).padStart(2, '0')}`;
    const syntheticGstin = `${t.code}AAAC${String.fromCharCode(65 + (idx % 26))}99${10 + idx}Z${(idx % 9) + 1}`;

    // Base filing cycles (Apr 2026 - Sep 2026, 6 cycles)
    const months = ['Apr 2026', 'May 2026', 'Jun 2026', 'Jul 2026', 'Aug 2026', 'Sep 2026'];
    const dueDates = ['2026-05-11', '2026-06-11', '2026-07-11', '2026-08-11', '2026-09-11', '2026-10-11'];

    let filingPattern: Vendor['filingPattern'] = 'NORMAL/PUNCTUAL';

    // Vendors reserved for exact test scenarios:
    if (idx === 13) {
      // v14 is Chase Now vendor: Normal punctual history, but latest return is a NEW ANOMALY (missed/huge delay)
      filingPattern = 'NEW ANOMALY';
    } else if (idx === 11 || idx === 12) {
      // v12 & v13 are Watch (case 2): NEW ANOMALY
      filingPattern = 'NEW ANOMALY';
    } else if (idx < 10) {
      // v01 - v10 are habitual laggards (used for 25 Safe to Hold & 2 Watch case 1)
      filingPattern = 'HABITUAL LAGGARD';
    } else {
      filingPattern = idx % 2 === 0 ? 'NORMAL/PUNCTUAL' : 'HABITUAL LAGGARD';
    }

    const filingCycles: FilingCycle[] = months.map((m, mIdx) => {
      const dueDate = dueDates[mIdx];
      let delayDays = 0;
      let missed = false;
      let filingDate: string | null = null;

      if (filingPattern === 'HABITUAL LAGGARD') {
        delayDays = 12 + (mIdx % 5); // consistently 12-16 days late
        const d = new Date(dueDate);
        d.setDate(d.getDate() + delayDays);
        filingDate = d.toISOString().slice(0, 10);
      } else if (filingPattern === 'NEW ANOMALY') {
        if (mIdx < 4) {
          delayDays = 1; // punctual in earlier months
          filingDate = dueDate;
        } else {
          missed = true;
          delayDays = 45;
          filingDate = null; // sudden recent anomaly/missed
        }
      } else {
        // NORMAL/PUNCTUAL
        delayDays = (mIdx % 2 === 0) ? 0 : 2;
        const d = new Date(dueDate);
        d.setDate(d.getDate() + delayDays);
        filingDate = d.toISOString().slice(0, 10);
      }

      return {
        period: m,
        dueDate,
        filingDate,
        delayDays,
        missed,
      };
    });

    return {
      id,
      name: t.name,
      gstin: syntheticGstin,
      city: t.city,
      state: t.state,
      filingPattern,
      filingCycles,
    };
  });

  const vendorMap = new Map(vendors.map((v) => [v.id, v]));

  // Generate 200 Purchase Invoices
  const purchaseInvoices: PurchaseInvoice[] = [];

  // Designated 30 Unmatched Invoice IDs: inv-001 to inv-030
  // Specifically:
  // Invoices 1 to 25: SAFE TO HOLD
  //   Criteria: IRN Present (+20) + High AP (+15) + Habitual Laggard (+15) -> 50 + 20 + 15 + 15 = 100
  // Invoices 26 & 27: WATCH (Case 1)
  //   Criteria: IRN Absent (-15) + High AP (+15) + Habitual Laggard (+15) -> 50 - 15 + 15 + 15 = 65
  // Invoices 28 & 29: WATCH (Case 2)
  //   Criteria: IRN Present (+20) + Medium AP (+5) + New Anomaly (-25) -> 50 + 20 + 5 - 25 = 50
  // Invoice 30: CHASE NOW
  //   Criteria: IRN Absent (-15) + Low AP (-10) + New Anomaly (-25) -> 50 - 15 - 10 - 25 = 0 (clamped)

  for (let i = 1; i <= 200; i++) {
    const invId = `inv-${String(i).padStart(3, '0')}`;
    let vendor: Vendor;

    if (i <= 25) {
      // Safe to Hold: map across habitual laggard vendors v01-v08
      vendor = vendors[(i - 1) % 8];
    } else if (i === 26 || i === 27) {
      // Watch 1: habitual laggard vendor v09 or v10
      vendor = vendors[8 + (i - 26)];
    } else if (i === 28 || i === 29) {
      // Watch 2: new anomaly vendor v12 or v13
      vendor = vendors[11 + (i - 28)];
    } else if (i === 30) {
      // Chase Now: new anomaly vendor v14
      vendor = vendors[13];
    } else {
      // Invoices 31 to 200 (all 170 will match GSTR-2B)
      vendor = vendors[(i - 31) % vendors.length];
    }

    const day = ((i * 3) % 27) + 1;
    const invoiceDate = `2026-09-${String(day).padStart(2, '0')}`;
    const prefix = vendor.name.split(' ').map((w) => w[0]).join('').slice(0, 3).toUpperCase();
    const invoiceNumber = `${prefix}/26-27/${String(1000 + i)}`;

    // Taxable amounts between ₹10,000 and ₹250,000
    const taxableAmount = Math.round(15000 + ((i * 739) % 180000));
    const gstRate = 18;
    const taxAmount = Math.round(taxableAmount * (gstRate / 100));
    const grossAmount = taxableAmount + taxAmount;

    purchaseInvoices.push({
      id: invId,
      invoiceNumber,
      invoiceDate,
      vendorId: vendor.id,
      vendorName: vendor.name,
      gstin: vendor.gstin,
      taxableAmount,
      gstRate,
      taxAmount,
      grossAmount,
    });
  }

  // AP Records per Vendor
  // To ensure AP leverage ratios:
  // - Vendors v01-v10 have high unpaid amounts (e.g. ₹5,000,000) so leverageRatio >= 1.0 (HIGH)
  // - Vendors v12-v13 have partial unpaid amounts (e.g. ₹20,000) so 0 < leverageRatio < 1.0 (MEDIUM for their invoices)
  // - Vendor v14 has zero unpaid amount (LOW)
  const apRecords = new Map<string, ApVendorRecord>();

  vendors.forEach((v, idx) => {
    if (idx === 13) {
      // v14 Chase Now
      apRecords.set(v.id, {
        vendorId: v.id,
        unpaidAmount: 0,
        overdueAmount: 0,
        retentionHeldAmount: 0,
        isPaid: true,
      });
    } else if (idx === 11 || idx === 12) {
      // v12, v13 Watch (Case 2 - Medium AP leverage)
      apRecords.set(v.id, {
        vendorId: v.id,
        unpaidAmount: 18000,
        overdueAmount: 0,
        retentionHeldAmount: 5000,
        isPaid: false,
      });
    } else {
      // High AP leverage for v01-v10 and others
      apRecords.set(v.id, {
        vendorId: v.id,
        unpaidAmount: 650000,
        overdueAmount: 120000,
        retentionHeldAmount: 50000,
        isPaid: false,
      });
    }
  });

  // IRN Registry records
  const irnRegistry = new Map<string, IrnRecord>();
  purchaseInvoices.forEach((inv, idx) => {
    const i = idx + 1;
    let irnPresent = true;

    if (i === 26 || i === 27 || i === 30) {
      // Invoices 26, 27, and 30 must have IRN ABSENT
      irnPresent = false;
    } else if (i <= 25 || i === 28 || i === 29) {
      // Invoices 1-25 and 28, 29 have IRN PRESENT
      irnPresent = true;
    } else {
      irnPresent = (i % 5 !== 0);
    }

    irnRegistry.set(inv.invoiceNumber, {
      invoiceNumber: inv.invoiceNumber,
      gstin: inv.gstin,
      irnPresent,
      irnRef: irnPresent
        ? `IRN-SIM-${inv.invoiceNumber.replace(/[^A-Z0-9]/g, '')}-${i * 19}`
        : null,
    });
  });

  // Generate GSTR-2B Records for exactly 170 of the 200 invoices (Invoices 31 to 200)
  // Controlled variations (punctuation, case, date noise) are introduced so fuzzy matching is demonstrated
  const gstr2bRecords: Gstr2bRecord[] = [];

  for (let i = 31; i <= 200; i++) {
    const inv = purchaseInvoices[i - 1];
    let invNoIn2b = inv.invoiceNumber;

    // Introduce controlled formatting variations for some records
    if (i % 7 === 0) {
      // e.g. replace slashes with hyphens
      invNoIn2b = inv.invoiceNumber.replace(/\//g, '-');
    } else if (i % 11 === 0) {
      // lowercase variation
      invNoIn2b = inv.invoiceNumber.toLowerCase();
    } else if (i % 13 === 0) {
      // space variation
      invNoIn2b = inv.invoiceNumber.replace(/\//g, ' ');
    }

    gstr2bRecords.push({
      id: `2b-${String(i).padStart(3, '0')}`,
      invoiceNumber: invNoIn2b,
      invoiceDate: inv.invoiceDate,
      gstin: inv.gstin,
      taxableAmount: inv.taxableAmount,
      taxAmount: inv.taxAmount,
    });
  }

  return {
    vendors,
    vendorMap,
    purchaseInvoices,
    gstr2bRecords,
    apRecords,
    irnRegistry,
  };
}
