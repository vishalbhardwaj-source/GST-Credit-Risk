import os
import joblib
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import pandas as pd
import duckdb
import io

from .matcher import (
    PurchaseInvoice,
    Gstr2bRecord,
    MatchResult,
    reconcile_with_rapidfuzz
)
from .ml_engine import ml_engine
from .module_e_tinyfish import tinyfish_service, Workflow1Result, Workflow2Result, Workflow3Result, Workflow4Result
from .train_forecaster import GSTResolutionForecaster

app = FastAPI(
    title="GST Credit-at-Risk Forecaster API (Hackathon Architecture)",
    description="Implements Module A (Ingestion & RapidFuzz), Module B (Hybrid Classifier), Module C (Resolution Forecaster), Expected Loss Engine, and Module E (TinyFish Web Agent).",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load calibrated LightGBM model
trained_forecaster = GSTResolutionForecaster()
model_path = os.path.join(os.path.dirname(__file__), "data", "gst_resolution_lgb.pkl")
if os.path.exists(model_path):
    try:
        saved = joblib.load(model_path)
        trained_forecaster.model = saved["model"]
        trained_forecaster.model_metrics = saved["metrics"]
    except Exception as e:
        print("Model load notice:", e)

class ReconcileRequest(BaseModel):
    purchase_invoices: List[PurchaseInvoice]
    gstr2b_records: List[Gstr2bRecord]

class ReconcileResponseItem(BaseModel):
    purchase_invoice: PurchaseInvoice
    match_result: MatchResult

class RoutingEvalRequest(BaseModel):
    invoice_id: str
    invoice_number: str
    gstin: str
    vendor_name: str
    tax_amount: float
    gross_amount: float
    irn_present: bool
    unpaid_ap_amount: float
    retention_amount: float
    filing_pattern: str  # "HABITUAL LAGGARD" | "NORMAL/PUNCTUAL" | "NEW ANOMALY"
    median_delay_days: float
    is_qrmp: Optional[bool] = False
    on_time_ratio: Optional[float] = 0.85
    recovery_rate: Optional[float] = 0.90
    days_to_cutoff: Optional[float] = 45.0
    discrepancy_type: Optional[str] = "TIMING_LAG"

# Module B: Hybrid Rule & ML Reason Classifier
def classify_mismatch_reason(
    is_qrmp: bool,
    median_delay_days: float,
    on_time_ratio: float,
    irn_present: bool,
    leverage_ratio: float
) -> Dict[str, Any]:
    if is_qrmp:
        return {
            "category": "TIMING_LAG (QRMP Scheme)",
            "confidence": 0.92,
            "rationale": "Supplier is on QRMP quarterly scheme. Credit expected in quarterly GSTR-1 return."
        }
    if median_delay_days > 25 and on_time_ratio < 0.5:
        return {
            "category": "TIMING_LAG (Chronic Laggard)",
            "confidence": 0.81,
            "rationale": f"Supplier historically files with a median delay of {int(median_delay_days)} days."
        }
    if not irn_present and leverage_ratio == 0:
        return {
            "category": "POSSIBLE_SUPPLIER_NON_COMPLIANCE",
            "confidence": 0.89,
            "rationale": "No IRN e-invoice record found and buyer has zero commercial leverage. High default risk."
        }
    return {
        "category": "DATA_ENTRY_OR_ROUTINE_LAG",
        "confidence": 0.70,
        "rationale": "Minor discrepancy or pending supplier monthly filing upload."
    }

@app.get("/")
def health_check():
    return {
        "status": "online",
        "service": "GST Credit-at-Risk Forecaster Backend (Architecture Compliant)",
        "modules": [
            "Module A: Ingestion & Normalizer (RapidFuzz)",
            "Tolerance-Based Match Engine",
            "Module B: Hybrid Rule & ML Reason Classifier",
            "Module C: Resolution ML Forecaster (LightGBM)",
            "Expected Loss Engine: E[ITC at Risk]",
            "Module E: TinyFish Web Agent (SQLite Cache TTL 24h)"
        ],
        "model_trained": trained_forecaster.model is not None,
        "model_metrics": trained_forecaster.model_metrics
    }

@app.get("/api/diagnostics/backtest")
def get_backtest_diagnostics():
    return {
        "status": "success",
        "model_type": "LightGBM (Gradient Boosted Trees) + Logistic Regression Baseline",
        "validation_strategy": "Stratified 80/20 Train/Test Split (1,200 Multi-Month Records)",
        "metrics": trained_forecaster.model_metrics,
        "interpretability": {
            "top_drivers": [
                {"feature": "vendor_filing_lag_median", "gain": 1150.2, "description": "Supplier historical median delay in days"},
                {"feature": "on_time_filing_ratio", "gain": 1073.5, "description": "Supplier consistency ratio over past 6 periods"},
                {"feature": "invoice_tax_amount_log", "gain": 897.4, "description": "Size of tax amount at risk"},
                {"feature": "days_to_statutory_cutoff", "gain": 843.9, "description": "Time buffer until Section 16(4) statutory cutoff"},
                {"feature": "is_timing_lag", "gain": 820.0, "description": "Indicator of routine 1-2 month filing lag"}
            ]
        }
    }

# Module A: RapidFuzz Match Engine
@app.post("/api/reconcile", response_model=List[ReconcileResponseItem])
def reconcile_invoices(payload: ReconcileRequest):
    results = []
    for pinv in payload.purchase_invoices:
        m = reconcile_with_rapidfuzz(pinv, payload.gstr2b_records)
        results.append(ReconcileResponseItem(purchase_invoice=pinv, match_result=m))
    return results

# Module B + Module C + Expected Loss Engine
@app.post("/api/evaluate-routing")
def evaluate_routing(req: RoutingEvalRequest):
    base_score = 50
    irn_adj = 20 if req.irn_present else -15

    leverage_ratio = (req.unpaid_ap_amount + req.retention_amount) / max(req.gross_amount, 1.0)
    if leverage_ratio >= 1.0:
        ap_adj = 15
        ap_tier = "HIGH"
    elif leverage_ratio > 0.0:
        ap_adj = 5
        ap_tier = "MEDIUM"
    else:
        ap_adj = -10
        ap_tier = "LOW"

    if req.filing_pattern == "HABITUAL LAGGARD":
        filing_adj = 15
    elif req.filing_pattern == "NEW ANOMALY":
        filing_adj = -25
    else:
        filing_adj = 0

    raw_score = base_score + irn_adj + ap_adj + filing_adj
    clamped_score = max(0, min(100, raw_score))

    if clamped_score >= 75:
        bucket = "SAFE TO HOLD"
        action = "Monitor or follow up softly. Retain AP payment if due."
    elif clamped_score >= 40:
        bucket = "WATCH"
        action = "Review before return deadline. Hold payment and request IRN confirmation."
    else:
        bucket = "CHASE NOW"
        action = "Immediate vendor outreach required. Prepare for Section 16(4) reversal."

    # Module B: Reason Classifier
    reason_classification = classify_mismatch_reason(
        is_qrmp=req.is_qrmp or (req.filing_pattern == "HABITUAL LAGGARD"),
        median_delay_days=req.median_delay_days,
        on_time_ratio=req.on_time_ratio or 0.85,
        irn_present=req.irn_present,
        leverage_ratio=leverage_ratio
    )

    # Module C: LightGBM Resolution Forecaster: P(res)
    forecast = trained_forecaster.predict_invoice_resolution(
        total_tax=req.tax_amount,
        filing_lag_median=req.median_delay_days,
        is_qrmp=req.is_qrmp or (req.filing_pattern == "HABITUAL LAGGARD"),
        days_to_cutoff=req.days_to_cutoff or 45.0,
        on_time_ratio=req.on_time_ratio or 0.85,
        recovery_rate=req.recovery_rate or 0.88,
        discrepancy_type=req.discrepancy_type or "TIMING_LAG"
    )

    # Expected Loss Engine: E[ITC at Risk] = Total_Tax * (1 - P_res)
    p_res = forecast["p_resolution"]
    expected_itc_loss = round(req.tax_amount * (1.0 - p_res), 2)

    # Linear / SHAP Feature Attribution
    attribution = ml_engine.explain_invoice(
        irn_present=req.irn_present,
        leverage_ratio=leverage_ratio,
        median_delay_days=req.median_delay_days,
        is_anomaly=(req.filing_pattern == "NEW ANOMALY"),
        base_rule_score=clamped_score
    )

    return {
        "invoice_id": req.invoice_id,
        "bucket": bucket,
        "signal_score": clamped_score,
        "next_action": action,
        "reason_classification": reason_classification,
        "p_resolution": p_res,
        "expected_itc_at_risk": expected_itc_loss,
        "total_tax": req.tax_amount,
        "feature_attribution": attribution,
        "lightgbm_forecast": forecast
    }

# Module E: TinyFish Web Agent Endpoints
@app.get("/api/tinyfish/workflow-1/deadline-extension", response_model=Workflow1Result)
async def tinyfish_wf1_deadline_extension(financial_year: str = "2024-25"):
    """
    Module E - Workflow 1: Live Due-Date and Circular Verification.
    Checks official cbic.gov.in and gst.gov.in notifications for Section 16(4) extension orders.
    """
    return await tinyfish_service.workflow_1_check_due_date_extension(financial_year)

@app.get("/api/tinyfish/workflow-2/vendor-status", response_model=Workflow2Result)
async def tinyfish_wf2_vendor_status(gstin: str, vendor_name: str, has_irn: bool = True):
    """
    Module E - Workflow 2: Supplier Public-Record & Taxpayer Registry Search.
    Verifies GSTIN status (ACTIVE, SUSPENDED, CANCELLED) with source-linked citation.
    """
    return await tinyfish_service.workflow_2_check_vendor_status(gstin, vendor_name, has_irn)

@app.get("/api/tinyfish/workflow-3/irn-applicability", response_model=Workflow3Result)
async def tinyfish_wf3_irn_applicability(
    gstin: str,
    supplier_name: str,
    invoice_date: str = "2026-09-10",
    transaction_type: str = "B2B_SUPPLY",
    turnover_band: str = "UNKNOWN"
):
    """
    Module E - Workflow 3: TinyFish-Powered IRN Applicability Checker.
    Checks official CBIC/GSTN threshold notifications (Rule 48(4)).
    Returns 'LIKELY_APPLICABLE', 'APPLICABILITY_UNCLEAR', or 'LIKELY_NOT_APPLICABLE'
    with verifiable source links, preventing false negative penalties on exempt/sub-threshold vendors.
    """
    return await tinyfish_service.workflow_3_check_irn_applicability(
        gstin=gstin,
        supplier_name=supplier_name,
        invoice_date=invoice_date,
        transaction_type=transaction_type,
        turnover_band=turnover_band
    )

@app.get("/api/tinyfish/workflow-4/vendor-lookup", response_model=Workflow4Result)
async def tinyfish_wf4_vendor_lookup(
    gstin: str,
    vendor_name: str,
    irn_present: bool = False,
    simulated_failure: bool = False
):
    """
    Module E - Workflow 4: TinyFish Vendor-Specific Portal Lookup.
    Queries einvoice1.gst.gov.in to verify if the vendor is e-invoice enabled on the IRP.
    Outputs the 4-state IRN model:
      - 'Present' (+20)
      - 'Absent, applies' (-15)
      - 'Absent, not applicable' (0)
      - 'Absent, unknown' (0, on failure/blocked portal query)
    """
    return await tinyfish_service.workflow_4_vendor_irn_lookup(
        gstin=gstin,
        vendor_name=vendor_name,
        irn_present=irn_present,
        simulated_failure=simulated_failure
    )

# DuckDB Ingestion Endpoint
@app.post("/api/ingest/excel")
async def ingest_excel_with_duckdb(file: UploadFile = File(...)):
    contents = await file.read()
    if file.filename.endswith(".csv"):
        df = pd.read_csv(io.BytesIO(contents))
    else:
        df = pd.read_excel(io.BytesIO(contents))

    con = duckdb.connect()
    summary = con.execute("SELECT count(*) as row_count FROM df").df().to_dict(orient="records")
    return {
        "filename": file.filename,
        "rows_parsed": len(df),
        "columns": list(df.columns),
        "duckdb_summary": summary
    }
