#!/usr/bin/env python3
"""
Generate 3 realistic 200-entry CSV datasets for demoing the GST Credit Triage Engine:
1. purchase_register_demo_200.csv (Two Files tab - PR)
2. gstr2b_demo_200.csv (Two Files tab - GSTR-2B)
3. reconciled_audit_demo_200.csv (Single Reconciled Audit CSV tab)
"""

import os
import random
import csv

# Set deterministic random seed
random.seed(20261119)

# 40 Realistic Indian Vendors across states
VENDORS = [
    {"name": "Shree Ganesh Packaging Works", "code": "27", "pan": "AAACA", "state": "Maharashtra"},
    {"name": "Kaveri Steel Traders LLP", "code": "29", "pan": "AAACB", "state": "Karnataka"},
    {"name": "Annapurna Agro Supplies Pvt Ltd", "code": "23", "pan": "AAACC", "state": "Madhya Pradesh"},
    {"name": "Sahyadri Logistics & Freight", "code": "27", "pan": "AAACD", "state": "Maharashtra"},
    {"name": "Vardhman Polymers Ltd", "code": "24", "pan": "AAACE", "state": "Gujarat"},
    {"name": "Lakshmi Electricals Corp", "code": "33", "pan": "AAACF", "state": "Tamil Nadu"},
    {"name": "Narmada Office Supplies", "code": "24", "pan": "AAACG", "state": "Gujarat"},
    {"name": "Bharat Fasteners & Hardware", "code": "03", "pan": "AAACH", "state": "Punjab"},
    {"name": "Deccan Print House LLP", "code": "36", "pan": "AAACI", "state": "Telangana"},
    {"name": "Ganga Chemicals Pvt Ltd", "code": "09", "pan": "AAACJ", "state": "Uttar Pradesh"},
    {"name": "Konark Engineering Services", "code": "21", "pan": "AAACK", "state": "Odisha"},
    {"name": "Malabar Spice Exports", "code": "32", "pan": "AAACL", "state": "Kerala"},
    {"name": "Rajdhani Tech Solutions Ltd", "code": "07", "pan": "AAACM", "state": "Delhi"},
    {"name": "Pioneer Courier & Logistics", "code": "27", "pan": "AAACN", "state": "Maharashtra"},
    {"name": "Himalayan Herbal Extracts", "code": "05", "pan": "AAACO", "state": "Uttarakhand"},
    {"name": "Chola Textile Mills", "code": "33", "pan": "AAACP", "state": "Tamil Nadu"},
    {"name": "Sonar Bangla Kraft Paper", "code": "19", "pan": "AAACQ", "state": "West Bengal"},
    {"name": "Marwar Precision Tools", "code": "08", "pan": "AAACR", "state": "Rajasthan"},
    {"name": "Coromandel Industrial Gases", "code": "37", "pan": "AAACS", "state": "Andhra Pradesh"},
    {"name": "Kalinga Minerals Corp", "code": "21", "pan": "AAACT", "state": "Odisha"},
    {"name": "Godavari Safety Equipments", "code": "27", "pan": "AAACU", "state": "Maharashtra"},
    {"name": "Brahmputra Jute Products", "code": "18", "pan": "AAACV", "state": "Assam"},
    {"name": "Vindhya Refractories", "code": "23", "pan": "AAACW", "state": "Madhya Pradesh"},
    {"name": "Satpura Bearing Works", "code": "23", "pan": "AAACX", "state": "Madhya Pradesh"},
    {"name": "Thar Desert Logistics", "code": "08", "pan": "AAACY", "state": "Rajasthan"},
    {"name": "Cauvery Valve & Pumps", "code": "29", "pan": "AAACZ", "state": "Karnataka"},
    {"name": "Gomti Packaging Solutions", "code": "09", "pan": "BAACA", "state": "Uttar Pradesh"},
    {"name": "Tapti Rubber Products", "code": "24", "pan": "BAACB", "state": "Gujarat"},
    {"name": "Mahanadi Heavy Castings", "code": "22", "pan": "BAACC", "state": "Chhattisgarh"},
    {"name": "Yamuna Glass Containers", "code": "09", "pan": "BAACD", "state": "Uttar Pradesh"},
    {"name": "Apex Precision CNC Components", "code": "27", "pan": "BAACE", "state": "Maharashtra"},
    {"name": "Silicon City Cloud Infra LLP", "code": "29", "pan": "BAACF", "state": "Karnataka"},
    {"name": "Sterling Metallics India", "code": "24", "pan": "BAACG", "state": "Gujarat"},
    {"name": "Zenith Industrial Automations", "code": "07", "pan": "BAACH", "state": "Delhi"},
    {"name": "BlueDart Warehouse Logistics", "code": "27", "pan": "BAACI", "state": "Maharashtra"},
    {"name": "Sutlej Hydraulics & Pumping", "code": "03", "pan": "BAACJ", "state": "Punjab"},
    {"name": "Sundaram Foundry Works", "code": "33", "pan": "BAACK", "state": "Tamil Nadu"},
    {"name": "Bhoomi Heavy Earthmovers", "code": "20", "pan": "BAACL", "state": "Jharkhand"},
    {"name": "Alaknanda Power Generators", "code": "05", "pan": "BAACM", "state": "Uttarakhand"},
    {"name": "Godrej Interio Commercial Dist", "code": "27", "pan": "BAACN", "state": "Maharashtra"},
]

# Generate standard 15-character GSTIN for each vendor
# Format: 2 digits state + 5 letters PAN + 4 digits + 1 letter + 1 entity num + 'Z' + check digit
for idx, v in enumerate(VENDORS):
    v["gstin"] = f"{v['code']}{v['pan']}{1200 + idx}A1Z{(idx % 9) + 1}"
    # Generate clean alphanumeric 3-letter prefix
    clean_words = [w for w in v["name"].split() if w.isalnum()]
    v["prefix"] = "".join(w[0] for w in clean_words[:3]).upper()
    if len(v["prefix"]) < 3:
        v["prefix"] = (v["prefix"] + "X")[:3]

PERIODS = ["Sep 2026", "Sep 2026", "Sep 2026", "Aug 2026", "Aug 2026"]
GST_RATES = [18, 18, 18, 12, 18, 5, 28, 18]

def generate_invoice_number(vendor_prefix, seq, year="26-27", style=0):
    if style == 0:
        return f"{vendor_prefix}/{year}/{1000 + seq}"
    elif style == 1:
        return f"{vendor_prefix}-{year}-{1000 + seq}"
    elif style == 2:
        return f"INV-{year}-{1000 + seq}"
    else:
        return f"{vendor_prefix}/{1000 + seq}"

def generate_datasets():
    # Directories
    demo_dir = os.path.join(os.getcwd(), "demo_data")
    templates_dir = os.path.join(os.getcwd(), "vite-app", "public", "templates")
    os.makedirs(demo_dir, exist_ok=True)
    os.makedirs(templates_dir, exist_ok=True)

    # 1. GENERATE PURCHASE REGISTER (200 records)
    pr_rows = []
    
    # We will track 140 entries that match in GSTR-2B, and 60 that don't
    # In those 140: 115 are exact invoice numbers, 25 are fuzzy (slash vs hyphen)
    matched_flags = [True] * 140 + [False] * 60
    # Shuffle match flags deterministically so they are distributed across vendors
    random.shuffle(matched_flags)

    # Dates between 2026-08-01 and 2026-09-30
    for i in range(200):
        v = VENDORS[i % len(VENDORS)]
        pr_id = f"PR_{3001 + i}"
        period = PERIODS[i % len(PERIODS)]
        
        day = (i % 28) + 1
        month = 8 if i % 4 == 0 else 9
        inv_date = f"2026-{month:02d}-{day:02d}"
        
        inv_num = generate_invoice_number(v["prefix"], i + 1, "26-27", 0)
        
        # Taxable amount between 18,000 and 2,80,000 in neat increments
        base_amounts = [24000, 35000, 48000, 62000, 75000, 88000, 110000, 125000, 150000, 185000, 220000]
        taxable_val = base_amounts[i % len(base_amounts)] + (i * 250)
        gst_rate = GST_RATES[i % len(GST_RATES)]
        
        total_tax = round(taxable_val * (gst_rate / 100))
        
        # Intra-state vs Inter-state based on state code (Assume buyer is Maharashtra 27)
        is_intra = (v["code"] == "27")
        if is_intra:
            cgst = round(total_tax / 2)
            sgst = total_tax - cgst
            igst = 0
        else:
            cgst = 0
            sgst = 0
            igst = total_tax
            
        gross_amount = taxable_val + total_tax
        
        pr_rows.append({
            "pr_id": pr_id,
            "period": period,
            "supplier_gstin": v["gstin"],
            "supplier_name": v["name"],
            "invoice_number": inv_num,
            "invoice_date": inv_date,
            "taxable_value": taxable_val,
            "gst_rate": gst_rate,
            "cgst_amount": cgst,
            "sgst_amount": sgst,
            "igst_amount": igst,
            "total_tax": total_tax,
            "gross_amount": gross_amount,
            "_matched": matched_flags[i],
            "_vendor": v,
        })

    # Write Purchase Register CSV
    pr_headers = [
        "pr_id", "period", "supplier_gstin", "supplier_name",
        "invoice_number", "invoice_date", "taxable_value", "gst_rate",
        "cgst_amount", "sgst_amount", "igst_amount", "total_tax", "gross_amount"
    ]
    
    pr_csv_path = os.path.join(demo_dir, "purchase_register_demo_200.csv")
    with open(pr_csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=pr_headers)
        writer.writeheader()
        for r in pr_rows:
            row_dict = {k: r[k] for k in pr_headers}
            writer.writerow(row_dict)

    # 2. GENERATE GSTR-2B CSV (200 records)
    # 140 matched records from PR (115 exact, 25 fuzzy variation)
    # + 60 distinct records from other/supplementary filings = 200 total records
    gstr2b_rows = []
    
    fuzzy_count = 0
    g2b_counter = 0

    for r in pr_rows:
        if r["_matched"]:
            g2b_counter += 1
            gstr2b_id = f"2B_{4000 + g2b_counter}"
            inv_no = r["invoice_number"]
            
            # Make 25 records use fuzzy/alternate formatting (e.g. SGP-26-27-1001 vs SGP/26-27/1001)
            if fuzzy_count < 25 and (g2b_counter % 5 == 0):
                fuzzy_count += 1
                inv_no = inv_no.replace("/", "-")
            
            # Filing date in GSTR-1 by vendor (e.g. 10th or 11th of next month)
            filing_date = "2026-10-11" if "09" in r["invoice_date"] else "2026-09-11"
            
            gstr2b_rows.append({
                "gstr2b_id": gstr2b_id,
                "supplier_gstin": r["supplier_gstin"],
                "invoice_number": inv_no,
                "invoice_date": r["invoice_date"],
                "taxable_value": r["taxable_value"],
                "total_tax": r["total_tax"],
                "filing_date_gstr1": filing_date,
                "itc_availability": "Y"
            })

    # Now add 60 extra records to reach exactly 200 rows in GSTR-2B
    for j in range(60):
        g2b_counter += 1
        gstr2b_id = f"2B_{4000 + g2b_counter}"
        v = VENDORS[(j + 15) % len(VENDORS)]
        inv_no = f"{v['prefix']}/SER/26-27/{5001 + j}"
        taxable_val = 15000 + (j * 750)
        total_tax = round(taxable_val * 0.18)
        filing_date = "2026-10-10"
        
        gstr2b_rows.append({
            "gstr2b_id": gstr2b_id,
            "supplier_gstin": v["gstin"],
            "invoice_number": inv_no,
            "invoice_date": "2026-09-15",
            "taxable_value": taxable_val,
            "total_tax": total_tax,
            "filing_date_gstr1": filing_date,
            "itc_availability": "Y"
        })

    g2b_headers = [
        "gstr2b_id", "supplier_gstin", "invoice_number", "invoice_date",
        "taxable_value", "total_tax", "filing_date_gstr1", "itc_availability"
    ]
    
    g2b_csv_path = os.path.join(demo_dir, "gstr2b_demo_200.csv")
    with open(g2b_csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=g2b_headers)
        writer.writeheader()
        for r in gstr2b_rows:
            writer.writerow(r)

    # 3. GENERATE RECONCILED AUDIT CSV (200 records)
    # Complete 15-column format:
    # Invoice No,Invoice Date,Vendor Name,Vendor GSTIN,Taxable Amount (INR),GST Rate %,GST Amount at Risk (INR),Gross Amount (INR),GSTR-2B Matched,IRN Status,AP Leverage,Filing Pattern,Signal Score,Routing Bucket,Reason
    # Distribution:
    # - 120 Matched (UNROUTED)
    # - 45 Safe to Hold (Signal score 85-100, IRN Present, High AP leverage, Habitual Laggard)
    # - 23 Watch (Signal score 40-65, mixed signals)
    # - 12 Chase Now (Signal score 0-20, IRN Absent, Low AP leverage, Sudden Anomaly)
    
    audit_rows = []
    
    # Pre-generate 200 items with distribution
    categories = (
        ["MATCHED"] * 120 +
        ["SAFE_TO_HOLD"] * 45 +
        ["WATCH"] * 23 +
        ["CHASE_NOW"] * 12
    )
    random.shuffle(categories)

    for idx, cat in enumerate(categories):
        v = VENDORS[idx % len(VENDORS)]
        inv_no = f"AUD/{v['prefix']}/26-27/{7001 + idx}"
        day = (idx % 28) + 1
        inv_date = f"2026-09-{day:02d}"
        
        taxable_amt = 25000 + (idx * 650)
        gst_rate = 18
        gst_amt_risk = round(taxable_amt * 0.18)
        gross_amt = taxable_amt + gst_amt_risk

        if cat == "MATCHED":
            matched = "Yes"
            irn_status = "Present"
            ap_leverage = random.choice(["HIGH", "HIGH", "MEDIUM"])
            filing_pattern = "NORMAL/PUNCTUAL"
            signal_score = "N/A"
            routing_bucket = "UNROUTED"
            reason = "Exact match in GSTR-2B return."
        elif cat == "SAFE_TO_HOLD":
            matched = "No"
            irn_status = "Present"
            ap_leverage = "HIGH"
            filing_pattern = "HABITUAL LAGGARD"
            signal_score = str(random.choice([85, 90, 95, 100]))
            routing_bucket = "SAFE TO HOLD"
            reason = "Positive signals (IRN verified, high AP payment hold, or habitual supplier delay pattern) suggest a routine reporting lag. Monitor or follow up softly."
        elif cat == "WATCH":
            matched = "No"
            irn_status = random.choice(["Present", "Absent"])
            ap_leverage = "MEDIUM"
            filing_pattern = random.choice(["HABITUAL LAGGARD", "NEW ANOMALY"])
            signal_score = str(random.choice([40, 45, 50, 55, 60, 65]))
            routing_bucket = "WATCH"
            reason = "Signals are mixed or uncertain. Retain AP leverage or verify IRN copy before the upcoming return deadline."
        else: # CHASE_NOW
            matched = "No"
            irn_status = "Absent"
            ap_leverage = "LOW"
            filing_pattern = "NEW ANOMALY"
            signal_score = str(random.choice([0, 5, 10, 15]))
            routing_bucket = "CHASE NOW"
            reason = "Critical discrepancy risk (missing IRN, zero payment leverage, and sudden filing anomaly). Prioritize supplier outreach and review potential ITC reversal."

        audit_rows.append({
            "Invoice No": inv_no,
            "Invoice Date": inv_date,
            "Vendor Name": v["name"],
            "Vendor GSTIN": v["gstin"],
            "Taxable Amount (INR)": str(taxable_amt),
            "GST Rate %": str(gst_rate),
            "GST Amount at Risk (INR)": str(gst_amt_risk),
            "Gross Amount (INR)": str(gross_amt),
            "GSTR-2B Matched": matched,
            "IRN Status": irn_status,
            "AP Leverage": ap_leverage,
            "Filing Pattern": filing_pattern,
            "Signal Score": signal_score,
            "Routing Bucket": routing_bucket,
            "Reason": reason
        })

    audit_headers = [
        "Invoice No", "Invoice Date", "Vendor Name", "Vendor GSTIN",
        "Taxable Amount (INR)", "GST Rate %", "GST Amount at Risk (INR)", "Gross Amount (INR)",
        "GSTR-2B Matched", "IRN Status", "AP Leverage", "Filing Pattern",
        "Signal Score", "Routing Bucket", "Reason"
    ]
    
    audit_csv_path = os.path.join(demo_dir, "reconciled_audit_demo_200.csv")
    with open(audit_csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=audit_headers)
        writer.writeheader()
        for r in audit_rows:
            writer.writerow(r)

    # Also copy to root and vite-app/public/templates
    import shutil
    for fname in ["purchase_register_demo_200.csv", "gstr2b_demo_200.csv", "reconciled_audit_demo_200.csv"]:
        src = os.path.join(demo_dir, fname)
        shutil.copy2(src, os.path.join(os.getcwd(), fname))
        shutil.copy2(src, os.path.join(templates_dir, fname))

    print(f"Generated PR: {len(pr_rows)} rows -> {pr_csv_path}")
    print(f"Generated 2B: {len(gstr2b_rows)} rows -> {g2b_csv_path}")
    print(f"Generated Audit: {len(audit_rows)} rows -> {audit_csv_path}")

if __name__ == "__main__":
    generate_datasets()
