import io

from fastapi.testclient import TestClient

from backend.main import app
from backend.gst_model import serve
from backend.model_integration import _load_demo, _score_frame


client = TestClient(app)


def test_demo_page_is_server_paginated_and_excludes_training_label():
    response = client.get("/api/model/invoices", params={"session_id": "demo", "limit": 1})
    assert response.status_code == 200
    data = response.json()
    assert data["source"] == "synthetic_demo"
    assert data["summary"]["total"] == 200_000
    assert data["summary"]["matched"] == 134_880
    assert len(data["invoices"]) == 1
    assert "self_correct" not in data["invoices"][0]


def test_demo_invoice_endpoint_accepts_default_and_specific_ap_filters():
    pipeline = client.post("/api/model/pipeline/run", json={})
    assert pipeline.status_code == 200
    assert pipeline.json()["scored"] is True

    for ap_filter in ("ALL", "HIGH", "MEDIUM", "LOW"):
        response = client.get(
            "/api/model/invoices",
            params={"session_id": "demo", "limit": 1, "ap": ap_filter},
        )
        assert response.status_code == 200
        data = response.json()
        if ap_filter == "ALL":
            assert data["total"] == 200_000
        else:
            assert all(invoice["leverageTier"] == ap_filter for invoice in data["invoices"])


def test_uploads_are_reconciled_but_not_scored_without_irn_source():
    files = {
        "pr_file": (
            "purchase_register.csv",
            io.BytesIO(
                b"org_id,invoice_no,invoice_date,vendor_gstin,taxable_value,igst,cgst,sgst,cess\n"
                b"ORG1,INV-1,2025-01-01,27ABCDE0001Z1P01,1000,180,0,0,0\n"
            ),
            "text/csv",
        ),
        "gstr2b_file": (
            "gstr2b.csv",
            io.BytesIO(
                b"org_id,GSTIN of supplier,Invoice number,Invoice date,Taxable value (Amt),IGST (Amt),CGST (Amt),SGST (Amt),Cess (Amt)\n"
                b"ORG1,27ABCDE0001Z1P01,INV-1,2025-01-01,1000,180,0,0,0\n"
            ),
            "text/csv",
        ),
        "gstr1_file": (
            "gstr1.csv",
            io.BytesIO(
                b"org_id,GSTIN of supplier,Invoice number\n"
                b"ORG1,27ABCDE0001Z1P01,INV-1\n"
            ),
            "text/csv",
        ),
        "ap_aging_file": (
            "ap_aging.csv",
            io.BytesIO(
                b"org_id,vendor_gstin,period,outstanding_payable,retention_held,days_since_last_payment,paid_in_advance_ratio\n"
                b"ORG1,27ABCDE0001Z1P01,2025-01,2000,100,30,0\n"
            ),
            "text/csv",
        ),
        "filing_history_file": (
            "filing_history.csv",
            io.BytesIO(
                b"org_id,vendor_gstin,cycle,filed_date,statutory_due_date,delay_days,missed_cycle_flag\n"
                b"ORG1,27ABCDE0001Z1P01,2024-12,2025-01-05,2025-01-02,3,false\n"
            ),
            "text/csv",
        ),
    }
    response = client.post("/api/model/upload", files=files)
    assert response.status_code == 200
    data = response.json()
    invoice = data["invoices"][0]
    assert data["source"] == "user_upload"
    assert data["summary"]["matched"] == 1
    assert data["summary"]["safeCount"] is None
    assert invoice["matchResult"]["matched"] is True
    assert invoice["irnRecord"]["available"] is False
    assert invoice["modelDecision"]["status"] == "not_scored"
    assert invoice["gstr1Reported"] is True
    assert invoice["apRecord"]["unpaidAmount"] == 2000
    assert invoice["vendor"]["filingCycles"][0]["delayDays"] == 3

    run = client.post("/api/model/pipeline/run", json={"session_id": data["session_id"]})
    assert run.status_code == 200
    assert run.json()["scored"] is False
    assert run.json()["invoices"][0]["modelDecision"]["status"] == "not_scored"


def test_upload_without_gstr2b_does_not_claim_unmatched_tax():
    response = client.post(
        "/api/model/upload",
        files={
            "pr_file": (
                "purchase_register.csv",
                io.BytesIO(
                    b"invoice_no,vendor_gstin,taxable_value,igst,cgst,sgst,cess\n"
                    b"INV-2,27ABCDE0002Z1P02,1000,180,0,0,0\n"
                ),
                "text/csv",
            )
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["summary"]["reconciliationAvailable"] is False
    assert data["summary"]["matched"] is None
    assert data["summary"]["totalTaxAtRisk"] is None
    assert data["invoices"][0]["matchResult"]["available"] is False


def test_upload_preserves_leading_zeroes_in_invoice_numbers():
    response = client.post(
        "/api/model/upload",
        files={
            "pr_file": (
                "purchase_register.csv",
                io.BytesIO(
                    b"invoice_no,vendor_gstin,taxable_value,igst\n"
                    b"000042,27ABCDE0002Z1P02,1000,180\n"
                ),
                "text/csv",
            ),
            "gstr2b_file": (
                "gstr2b.csv",
                io.BytesIO(
                    b"GSTIN of supplier,Invoice number,Taxable value (Amt),IGST (Amt)\n"
                    b"27ABCDE0002Z1P02,000042,1000,180\n"
                ),
                "text/csv",
            ),
        },
    )
    assert response.status_code == 200
    invoice = response.json()["invoices"][0]
    assert invoice["invoiceNumber"] == "000042"
    assert invoice["matchResult"]["matched"] is True


def test_batch_adapter_preserves_the_bundled_decision():
    rows = _score_frame(_load_demo().head(3).copy())
    for row in rows.to_dict(orient="records"):
        decision = serve.decide(
            serve.Feats(
                irn_present=row["irn_present"],
                leverage_score=float(row["leverage_score"]),
                retention_active=bool(row["retention_active"]),
                paid_in_advance_ratio=float(row["paid_in_advance_ratio"]),
                outstanding_payable_ratio=float(row["outstanding_payable_ratio"]),
                filing_pattern=row["filing_pattern"],
                current_delay_z=float(row["current_delay_z"]),
                is_credit_note=bool(row["is_credit_note"]),
                is_format_divergence=bool(row["is_format_divergence"]),
                buyer_posted_flag=bool(row["buyer_posted_flag"]),
                value_mismatch_pct=float(row["value_mismatch_pct"]),
                days_to_16_4=int(row["days_to_16_4"]),
                rupees_at_risk=float(row["rupees_at_risk"]),
                compliance_history_band=row["compliance_history_band"],
            ),
            serve.Thresholds(),
        )
        assert row["modelRawBucket"] == decision.bucket.name
        assert abs(float(row["modelProbability"]) - decision.probability) < 1e-12
