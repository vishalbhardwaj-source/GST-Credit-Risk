import math
import re
from typing import Dict, List, Any, Optional
from datetime import datetime
from .matcher import normalize_invoice_str, reconcile_with_rapidfuzz, PurchaseInvoice, Gstr2bRecord, MatchResult

VENDOR_TEMPLATES = [
    {"name": "Shree Ganesh Packaging Works", "city": "Pune", "state": "Maharashtra", "code": "27"},
    {"name": "Kaveri Steel Traders LLP", "city": "Bengaluru", "state": "Karnataka", "code": "29"},
    {"name": "Annapurna Agro Supplies Pvt Ltd", "city": "Indore", "state": "Madhya Pradesh", "code": "23"},
    {"name": "Sahyadri Logistics & Freight", "city": "Nashik", "state": "Maharashtra", "code": "27"},
    {"name": "Vardhman Polymers Ltd", "city": "Ahmedabad", "state": "Gujarat", "code": "24"},
    {"name": "Lakshmi Electricals Corp", "city": "Chennai", "state": "Tamil Nadu", "code": "33"},
    {"name": "Narmada Office Supplies", "city": "Vadodara", "state": "Gujarat", "code": "24"},
    {"name": "Bharat Fasteners & Hardware", "city": "Ludhiana", "state": "Punjab", "code": "03"},
    {"name": "Deccan Print House LLP", "city": "Hyderabad", "state": "Telangana", "code": "36"},
    {"name": "Ganga Chemicals Pvt Ltd", "city": "Kanpur", "state": "Uttar Pradesh", "code": "09"},
    {"name": "Konark Engineering Services", "city": "Bhubaneswar", "state": "Odisha", "code": "21"},
    {"name": "Malabar Spice Exports", "city": "Kochi", "state": "Kerala", "code": "32"},
    {"name": "Rajdhani Tech Solutions Ltd", "city": "New Delhi", "state": "Delhi", "code": "07"},
    {"name": "Pioneer Courier & Logistics", "city": "Mumbai", "state": "Maharashtra", "code": "27"},
    {"name": "Himalayan Herbal Extracts", "city": "Dehradun", "state": "Uttarakhand", "code": "05"},
    {"name": "Chola Textile Mills", "city": "Coimbatore", "state": "Tamil Nadu", "code": "33"},
    {"name": "Sonar Bangla Kraft Paper", "city": "Kolkata", "state": "West Bengal", "code": "19"},
    {"name": "Marwar Precision Tools", "city": "Jodhpur", "state": "Rajasthan", "code": "08"},
    {"name": "Coromandel Industrial Gases", "city": "Visakhapatnam", "state": "Andhra Pradesh", "code": "37"},
    {"name": "Kalinga Minerals Corp", "city": "Rourkela", "state": "Odisha", "code": "21"},
    {"name": "Godavari Safety Equipments", "city": "Aurangabad", "state": "Maharashtra", "code": "27"},
    {"name": "Brahmputra Jute Products", "city": "Guwahati", "state": "Assam", "code": "18"},
    {"name": "Vindhya Refractories", "city": "Katni", "state": "Madhya Pradesh", "code": "23"},
    {"name": "Satpura Bearing Works", "city": "Jabalpur", "state": "Madhya Pradesh", "code": "23"},
    {"name": "Thar Desert Logistics", "city": "Jaipur", "state": "Rajasthan", "code": "08"},
    {"name": "Cauvery Valve & Pumps", "city": "Mysuru", "state": "Karnataka", "code": "29"},
    {"name": "Gomti Packaging Solutions", "city": "Lucknow", "state": "Uttar Pradesh", "code": "09"},
    {"name": "Tapti Rubber Products", "city": "Surat", "state": "Gujarat", "code": "24"},
    {"name": "Mahanadi Heavy Castings", "city": "Raipur", "state": "Chhattisgarh", "code": "22"},
    {"name": "Yamuna Glass Containers", "city": "Firozabad", "state": "Uttar Pradesh", "code": "09"},
]

def calculate_ap_leverage(unpaid: float, retention: float, gross: float):
    denom = max(gross, 1.0)
    ratio = (unpaid + retention) / denom
    if ratio >= 1.0:
        tier = "HIGH"
    elif ratio > 0.0:
        tier = "MEDIUM"
    else:
        tier = "LOW"
    return round(ratio, 2), tier

def generate_server_dataset():
    months = ['Apr 2026', 'May 2026', 'Jun 2026', 'Jul 2026', 'Aug 2026', 'Sep 2026']
    due_dates = ['2026-05-11', '2026-06-11', '2026-07-11', '2026-08-11', '2026-09-11', '2026-10-11']

    vendors = []
    for idx, t in enumerate(VENDOR_TEMPLATES):
        vid = f"v{str(idx + 1).zfill(2)}"
        char_code = chr(65 + (idx % 26))
        synthetic_gstin = f"{t['code']}AAAC{char_code}99{10 + idx}Z{(idx % 9) + 1}"

        if idx == 13:
            filing_pattern = "NEW ANOMALY"
        elif idx in (11, 12):
            filing_pattern = "NEW ANOMALY"
        elif idx < 10:
            filing_pattern = "HABITUAL LAGGARD"
        else:
            filing_pattern = "NORMAL/PUNCTUAL" if idx % 2 == 0 else "HABITUAL LAGGARD"

        filing_cycles = []
        for m_idx, m in enumerate(months):
            due = due_dates[m_idx]
            if filing_pattern == "HABITUAL LAGGARD":
                delay = 12 + (m_idx % 5)
                fdate = f"2026-0{5 + m_idx if 5 + m_idx <= 9 else 5 + m_idx}-{11 + delay:02d}" if 11 + delay <= 28 else due
                missed = False
            elif filing_pattern == "NEW ANOMALY":
                if m_idx < 4:
                    delay = 1
                    fdate = due
                    missed = False
                else:
                    delay = 45
                    fdate = None
                    missed = True
            else:
                delay = 0 if m_idx % 2 == 0 else 2
                fdate = due
                missed = False

            filing_cycles.append({
                "period": m,
                "dueDate": due,
                "filingDate": fdate,
                "delayDays": delay,
                "missed": missed
            })

        vendors.append({
            "id": vid,
            "name": t["name"],
            "gstin": synthetic_gstin,
            "city": t["city"],
            "state": t["state"],
            "filingPattern": filing_pattern,
            "filingCycles": filing_cycles
        })

    vendor_map = {v["id"]: v for v in vendors}

    # AP Records
    ap_records = {}
    for idx, v in enumerate(vendors):
        if idx == 13:
            ap_records[v["id"]] = {
                "vendorId": v["id"],
                "unpaidAmount": 0,
                "overdueAmount": 0,
                "retentionHeldAmount": 0,
                "isPaid": True
            }
        elif idx in (11, 12):
            ap_records[v["id"]] = {
                "vendorId": v["id"],
                "unpaidAmount": 18000,
                "overdueAmount": 0,
                "retentionHeldAmount": 5000,
                "isPaid": False
            }
        else:
            ap_records[v["id"]] = {
                "vendorId": v["id"],
                "unpaidAmount": 650000,
                "overdueAmount": 120000,
                "retentionHeldAmount": 50000,
                "isPaid": False
            }

    # Purchase Invoices
    purchase_invoices = []
    for i in range(1, 201):
        inv_id = f"inv-{str(i).zfill(3)}"
        if i <= 25:
            vendor = vendors[(i - 1) % 8]
        elif i in (26, 27):
            vendor = vendors[8 + (i - 26)]
        elif i in (28, 29):
            vendor = vendors[11 + (i - 28)]
        elif i == 30:
            vendor = vendors[13]
        else:
            vendor = vendors[(i - 31) % len(vendors)]

        day = ((i * 3) % 27) + 1
        inv_date = f"2026-09-{str(day).zfill(2)}"
        prefix = "".join([w[0] for w in vendor["name"].split()]).upper()[:3]
        inv_num = f"{prefix}/26-27/{1000 + i}"

        taxable = round(15000 + ((i * 739) % 180000))
        gst_rate = 18.0
        tax = round(taxable * (gst_rate / 100))
        gross = taxable + tax

        purchase_invoices.append({
            "id": inv_id,
            "invoiceNumber": inv_num,
            "invoiceDate": inv_date,
            "vendorId": vendor["id"],
            "vendorName": vendor["name"],
            "gstin": vendor["gstin"],
            "taxableAmount": float(taxable),
            "gstRate": gst_rate,
            "taxAmount": float(tax),
            "grossAmount": float(gross)
        })

    # IRN Registry
    irn_registry = {}
    for idx, inv in enumerate(purchase_invoices):
        i = idx + 1
        if i in (26, 27, 30):
            irn_present = False
        elif i <= 25 or i in (28, 29):
            irn_present = True
        else:
            irn_present = (i % 5 != 0)

        cleaned_num = re.sub(r'[^A-Z0-9]', '', inv["invoiceNumber"].upper())
        irn_registry[inv["invoiceNumber"]] = {
            "invoiceNumber": inv["invoiceNumber"],
            "gstin": inv["gstin"],
            "irnPresent": irn_present,
            "irnRef": f"IRN-SIM-{cleaned_num}-{i * 19}" if irn_present else None
        }

    # GSTR-2B Records for Invoices 31 to 200
    gstr2b_records = []
    for i in range(31, 201):
        inv = purchase_invoices[i - 1]
        inv_no_in_2b = inv["invoiceNumber"]
        if i % 7 == 0:
            inv_no_in_2b = inv["invoiceNumber"].replace('/', '-')
        elif i % 11 == 0:
            inv_no_in_2b = inv["invoiceNumber"].lower()
        elif i % 13 == 0:
            inv_no_in_2b = inv["invoiceNumber"].replace('/', ' ')

        gstr2b_records.append(Gstr2bRecord(
            id=f"2b-{str(i).zfill(3)}",
            invoice_number=inv_no_in_2b,
            invoice_date=inv["invoiceDate"],
            gstin=inv["gstin"],
            taxable_amount=inv["taxableAmount"],
            tax_amount=inv["taxAmount"]
        ))

    # Reconcile on the server using RapidFuzz
    reconciled_list = []
    for inv in purchase_invoices:
        pinv_model = PurchaseInvoice(
            id=inv["id"],
            invoice_number=inv["invoiceNumber"],
            invoice_date=inv["invoiceDate"],
            vendor_id=inv["vendorId"],
            vendor_name=inv["vendorName"],
            gstin=inv["gstin"],
            taxable_amount=inv["taxableAmount"],
            gst_rate=inv["gstRate"],
            tax_amount=inv["taxAmount"],
            gross_amount=inv["grossAmount"]
        )
        match_res = reconcile_with_rapidfuzz(pinv_model, gstr2b_records)

        vendor = vendor_map[inv["vendorId"]]
        ap = ap_records[vendor["id"]]
        irn = irn_registry[inv["invoiceNumber"]]

        ratio, tier = calculate_ap_leverage(ap["unpaidAmount"], ap["retentionHeldAmount"], inv["grossAmount"])

        reconciled_list.append({
            **inv,
            "matchResult": {
                "matched": match_res.matched,
                "confidence": match_res.confidence,
                "matchedRecord": {
                    "id": match_res.matched_record.id,
                    "invoiceNumber": match_res.matched_record.invoice_number,
                    "invoiceDate": match_res.matched_record.invoice_date,
                    "gstin": match_res.matched_record.gstin,
                    "taxableAmount": match_res.matched_record.taxable_amount,
                    "taxAmount": match_res.matched_record.tax_amount,
                } if match_res.matched_record else None,
                "explanation": match_res.explanation
            },
            "irnRecord": irn,
            "apRecord": ap,
            "vendor": vendor,
            "leverageRatio": ratio,
            "leverageTier": tier,
        })

    return reconciled_list

def run_server_pipeline(invoices: List[Dict[str, Any]], trained_forecaster=None, ml_engine=None):
    """
    Executes the 3-Signal Decision Engine, Reason Classifier, and LightGBM model on the server.
    """
    routed_invoices = []
    base_score = 50

    for inv in invoices:
        match_result = inv.get("matchResult", {})
        is_matched = match_result.get("matched", False)

        if is_matched:
            routed_invoices.append(inv)
            continue

        # 3 Signals
        irn_present = inv.get("irnRecord", {}).get("irnPresent", False)
        irn_adj = 20 if irn_present else -15

        tier = inv.get("leverageTier", "LOW")
        if tier == "HIGH":
            ap_adj = 15
        elif tier == "MEDIUM":
            ap_adj = 5
        else:
            ap_adj = -10

        pattern = inv.get("vendor", {}).get("filingPattern", "NORMAL/PUNCTUAL")
        if pattern == "HABITUAL LAGGARD":
            filing_adj = 15
        elif pattern == "NEW ANOMALY":
            filing_adj = -25
        else:
            filing_adj = 0

        raw_score = base_score + irn_adj + ap_adj + filing_adj
        clamped_score = max(0, min(100, raw_score))

        if clamped_score >= 75:
            bucket = "SAFE TO HOLD"
            reason = "High recovery confidence: IRN registered, buyer AP leverage intact, and supplier is a known habitual laggard."
        elif clamped_score >= 40:
            bucket = "WATCH"
            reason = "Mixed signals: Action needed before Section 16(4) statutory cutoff."
        else:
            bucket = "CHASE NOW"
            reason = "High credit risk: IRN missing, low buyer AP leverage, and sudden filing anomaly. Immediate supplier outreach required."

        explanation = {
            "baseScore": base_score,
            "irnAdjustment": irn_adj,
            "apAdjustment": ap_adj,
            "filingAdjustment": filing_adj,
            "rawScore": raw_score,
            "clampedScore": clamped_score,
            "bucket": bucket,
            "reason": reason
        }

        # LightGBM Resolution probability if forecaster is present
        p_res = 0.88
        expected_loss = 0.0
        tax = inv.get("taxAmount", 0.0)
        if trained_forecaster and trained_forecaster.model is not None:
            forecast = trained_forecaster.predict_invoice_resolution(
                total_tax=tax,
                filing_lag_median=14.0 if pattern == "HABITUAL LAGGARD" else (45.0 if pattern == "NEW ANOMALY" else 2.0),
                is_qrmp=(pattern == "HABITUAL LAGGARD"),
                days_to_cutoff=45.0,
                on_time_ratio=0.85 if pattern != "NEW ANOMALY" else 0.40,
                recovery_rate=0.92 if pattern == "HABITUAL LAGGARD" else 0.25,
                discrepancy_type="TIMING_LAG" if pattern == "HABITUAL LAGGARD" else "POTENTIAL_DEFAULT"
            )
            p_res = forecast["p_resolution"]
            expected_loss = round(tax * (1.0 - p_res), 2)
        else:
            expected_loss = round(tax * (1.0 - (clamped_score / 100.0)), 2)

        routed_invoices.append({
            **inv,
            "scoreExplanation": explanation,
            "routingBucket": bucket,
            "pResolution": p_res,
            "expectedItcAtRisk": expected_loss,
        })

    # Compute KPIs on the server
    total = len(routed_invoices)
    matched_count = sum(1 for i in routed_invoices if i.get("matchResult", {}).get("matched", False))
    unmatched_invoices = [i for i in routed_invoices if not i.get("matchResult", {}).get("matched", False)]
    total_tax_at_risk = sum(i.get("taxAmount", 0.0) for i in unmatched_invoices)

    safe_invs = [i for i in unmatched_invoices if i.get("routingBucket") == "SAFE TO HOLD"]
    watch_invs = [i for i in unmatched_invoices if i.get("routingBucket") == "WATCH"]
    chase_invs = [i for i in unmatched_invoices if i.get("routingBucket") == "CHASE NOW"]

    kpis = {
        "total": total,
        "matched": matched_count,
        "unmatched": len(unmatched_invoices),
        "totalTaxAtRisk": total_tax_at_risk,
        "safeCount": len(safe_invs),
        "safeTax": sum(i.get("taxAmount", 0.0) for i in safe_invs),
        "watchCount": len(watch_invs),
        "watchTax": sum(i.get("taxAmount", 0.0) for i in watch_invs),
        "chaseCount": len(chase_invs),
        "chaseTax": sum(i.get("taxAmount", 0.0) for i in chase_invs),
    }

    return routed_invoices, kpis
