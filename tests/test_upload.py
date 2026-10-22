import io
import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"

def test_upload_and_reconcile():
    pr_csv = (
        "invoice_number,supplier_gstin,supplier_name,invoice_date,taxable_value,total_tax,gross_amount\n"
        "INV-TEST-001,27AAACA9910Z1,Vendor A,2026-09-01,10000,1800,11800\n"
        "INV-TEST-002,29AAACB9911Z2,Vendor B,2026-09-02,20000,3600,23600\n"
    )
    gstr2b_csv = (
        "invoice_number,supplier_gstin,invoice_date,taxable_value,total_tax\n"
        "INV-TEST-001,27AAACA9910Z1,2026-09-01,10000,1800\n"
    )

    files = {
        "pr_file": ("test_pr.csv", io.BytesIO(pr_csv.encode("utf-8")), "text/csv"),
        "gstr2b_file": ("test_2b.csv", io.BytesIO(gstr2b_csv.encode("utf-8")), "text/csv"),
    }

    response = client.post("/api/upload/reconcile", files=files)
    assert response.status_code == 200
    res = response.json()
    assert res["status"] == "success"
    assert res["summary"]["total_invoices"] == 2
    assert res["summary"]["matched_in_gstr2b"] == 1
    assert res["summary"]["unmatched_discrepancies"] == 1
    assert len(res["invoices"]) == 2
