import csv
import json
import random
import os
from datetime import datetime, timedelta

def generate_multi_month_cohort(seed=42):
    random.seed(seed)
    
    # 50 Supplier GSTINs with diverse compliance archetypes
    suppliers = []
    archetypes = [
        {"type": "regular_monthly", "is_qrmp": False, "median_lag": 2, "reliability": 0.95, "recovery_rate": 0.96},
        {"type": "qrmp_quarterly", "is_qrmp": True, "median_lag": 18, "reliability": 0.88, "recovery_rate": 0.92},
        {"type": "chronic_lag", "is_qrmp": False, "median_lag": 38, "reliability": 0.58, "recovery_rate": 0.72},
        {"type": "erratic_compliance", "is_qrmp": False, "median_lag": 55, "reliability": 0.32, "recovery_rate": 0.25},
        {"type": "cancelled_defaulter", "is_qrmp": False, "median_lag": 90, "reliability": 0.05, "recovery_rate": 0.02},
    ]

    for i in range(1, 51):
        arch = archetypes[(i - 1) % len(archetypes)]
        state_code = f"{random.choice([27, 29, 24, 33, 19, 7, 3, 23]):02d}"
        pan = f"AAAC{chr(65 + (i % 26))}{random.randint(1000, 9999)}{chr(65 + (i % 26))}"
        gstin = f"{state_code}{pan}1Z{i % 9}"
        suppliers.append({
            "supplier_id": f"supp_{i:02d}",
            "supplier_gstin": gstin,
            "supplier_name": f"Supplier_{i}_{arch['type']}",
            "filing_frequency": "QRMP_QUARTERLY" if arch["is_qrmp"] else "MONTHLY",
            "is_qrmp": arch["is_qrmp"],
            "median_filing_delay_days": float(arch["median_lag"] + random.randint(-2, 3)),
            "on_time_filing_ratio": float(round(arch["reliability"] + random.uniform(-0.05, 0.04), 2)),
            "historical_recovery_rate": float(arch["recovery_rate"]),
            "unresolved_mismatches_past_6m": random.randint(0, 8) if arch["reliability"] < 0.7 else 0,
            "archetype": arch["type"]
        })

    # Generate 1,200 Purchase Register transactions across 6 consecutive tax periods (Apr 2025 to Sep 2025)
    months = [
        ("Apr 2025", datetime(2025, 4, 1)),
        ("May 2025", datetime(2025, 5, 1)),
        ("Jun 2025", datetime(2025, 6, 1)),
        ("Jul 2025", datetime(2025, 7, 1)),
        ("Aug 2025", datetime(2025, 8, 1)),
        ("Sep 2025", datetime(2025, 9, 1)),
    ]

    pr_rows = []
    gstr2b_rows = []
    training_rows = []

    inv_counter = 1000
    sec_16_4_cutoff = datetime(2026, 11, 30)

    for m_idx, (m_name, base_date) in enumerate(months):
        invoices_in_month = 200
        for _ in range(invoices_in_month):
            inv_counter += 1
            supp = random.choice(suppliers)
            inv_num = f"INV/2025/{inv_counter:05d}"
            inv_date = base_date + timedelta(days=random.randint(0, 27))
            
            # Realistic GST Tax Slabs (5%, 12%, 18%, 28%)
            rate = random.choice([0.05, 0.12, 0.18, 0.28])
            taxable = round(random.uniform(5000, 280000), 2)
            total_tax = round(taxable * rate, 2)
            cgst = round(total_tax / 2, 2)
            sgst = cgst
            igst = 0.0
            gross = taxable + total_tax

            pr_rows.append({
                "pr_id": f"PR_{inv_counter}",
                "period": m_name,
                "supplier_gstin": supp["supplier_gstin"],
                "supplier_name": supp["supplier_name"],
                "invoice_number": inv_num,
                "invoice_date": inv_date.strftime("%Y-%m-%d"),
                "taxable_value": taxable,
                "gst_rate": int(rate * 100),
                "cgst_amount": cgst,
                "sgst_amount": sgst,
                "igst_amount": igst,
                "total_tax": total_tax,
                "gross_amount": gross,
                "pos": supp["supplier_gstin"][:2]
            })

            # Ground truth labeled mechanics:
            # Exact Match (70%), Typo/Rounding (8%), Timing Lag (14%), True Non-Filing / Missing (8%)
            dice = random.random()
            resolved = 1
            discrepancy_type = "EXACT_MATCH"

            if dice < 0.70:
                # 1. Exact Match (appears on 14th of following month)
                discrepancy_type = "EXACT_MATCH"
                gstr2b_rows.append({
                    "gstr2b_id": f"2B_{inv_counter}",
                    "supplier_gstin": supp["supplier_gstin"],
                    "invoice_number": inv_num,
                    "invoice_date": inv_date.strftime("%Y-%m-%d"),
                    "taxable_value": taxable,
                    "total_tax": total_tax,
                    "filing_date_gstr1": (inv_date + timedelta(days=supp["median_filing_delay_days"])).strftime("%Y-%m-%d"),
                    "gstr2b_generation_date": (base_date + timedelta(days=44)).strftime("%Y-%m-%d"),
                    "itc_availability": "Y"
                })
                resolved = 1
            elif dice < 0.78:
                # 2. Punctuation / Typo / Rounding Mismatch (resolved with high probability)
                discrepancy_type = "TYPO_OR_ROUNDING"
                mutated_num = inv_num.replace("/", "-")
                tax_offset = random.choice([-0.50, 0.50, 1.0])
                gstr2b_rows.append({
                    "gstr2b_id": f"2B_{inv_counter}",
                    "supplier_gstin": supp["supplier_gstin"],
                    "invoice_number": mutated_num,
                    "invoice_date": inv_date.strftime("%Y-%m-%d"),
                    "taxable_value": taxable + (tax_offset * 5),
                    "total_tax": round(total_tax + tax_offset, 2),
                    "filing_date_gstr1": (inv_date + timedelta(days=supp["median_filing_delay_days"])).strftime("%Y-%m-%d"),
                    "gstr2b_generation_date": (base_date + timedelta(days=44)).strftime("%Y-%m-%d"),
                    "itc_availability": "Y"
                })
                resolved = 1 if random.random() < 0.94 else 0
            elif dice < 0.92:
                # 3. Timing lag: files late in T+1 or T+2 month, resolves before Sec 16(4)
                discrepancy_type = "TIMING_LAG"
                # If supplier reliability is high, it resolves in subsequent 2B
                resolved = 1 if (supp["on_time_filing_ratio"] > 0.40 or supp["is_qrmp"]) else 0
            else:
                # 4. True non-filing / Missing credit beyond Section 16(4) statutory cutoff
                discrepancy_type = "TRUE_NON_FILING"
                resolved = 0

            days_to_cutoff = (sec_16_4_cutoff - inv_date).days

            training_rows.append({
                "invoice_number": inv_num,
                "supplier_gstin": supp["supplier_gstin"],
                "total_tax": total_tax,
                "vendor_filing_lag_median": supp["median_filing_delay_days"],
                "vendor_qrmp_flag": 1 if supp["is_qrmp"] else 0,
                "days_to_statutory_cutoff": days_to_cutoff,
                "on_time_filing_ratio": supp["on_time_filing_ratio"],
                "historical_recovery_rate": supp["historical_recovery_rate"],
                "discrepancy_type": discrepancy_type,
                "resolved_target": resolved
            })

    # Save generated files
    data_dir = os.path.join(os.path.dirname(__file__), "data")
    os.makedirs(data_dir, exist_ok=True)

    with open(os.path.join(data_dir, "purchase_register.csv"), "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=pr_rows[0].keys())
        writer.writeheader()
        writer.writerows(pr_rows)

    with open(os.path.join(data_dir, "gstr_2b.csv"), "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=gstr2b_rows[0].keys())
        writer.writeheader()
        writer.writerows(gstr2b_rows)

    with open(os.path.join(data_dir, "supplier_profiles.json"), "w", encoding="utf-8") as f:
        json.dump(suppliers, f, indent=2)

    with open(os.path.join(data_dir, "training_cohort.csv"), "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=training_rows[0].keys())
        writer.writeheader()
        writer.writerows(training_rows)

    print(f"Generated {len(pr_rows)} PR invoices and {len(gstr2b_rows)} 2B records across 50 suppliers.")
    return len(pr_rows)

if __name__ == "__main__":
    generate_multi_month_cohort()
