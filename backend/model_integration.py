"""Adapter between the bundled GST model and the Vite app's invoice contract."""

import io
import json
import re
import threading
import time
import uuid
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

import pandas as pd

from .gst_model import serve


DATA_DIR = Path(__file__).parent / "data" / "gst_model_demo"
with (Path(__file__).parent / "gst_model" / "router.meta.json").open() as metadata_file:
    FEATURES = tuple(json.load(metadata_file)["features"])
PAGE_SIZE = 100
MAX_UPLOAD_BYTES = 50 * 1024 * 1024
MAX_TOTAL_UPLOAD_BYTES = 80 * 1024 * 1024
SESSION_TTL_SECONDS = 30 * 60
_demo_lock = threading.Lock()
_demo_data_lock = threading.Lock()
_demo_frame: pd.DataFrame | None = None
_demo_scored_frame: pd.DataFrame | None = None
_sessions: dict[str, "DatasetSession"] = {}


@dataclass
class DatasetSession:
    frame: pd.DataFrame
    source: str
    scored: bool
    created_at: float = field(default_factory=time.monotonic)
    summary: dict[str, Any] = field(default_factory=dict)


def _norm(value: Any) -> str:
    return re.sub(r"[^A-Z0-9]", "", str(value or "").upper())


def _column(df: pd.DataFrame, *aliases: str) -> str | None:
    normalized = {
        re.sub(r"[^a-z0-9]", "", str(name).lower()): name
        for name in df.columns
    }
    return next(
        (normalized[re.sub(r"[^a-z0-9]", "", alias.lower())]
         for alias in aliases
         if re.sub(r"[^a-z0-9]", "", alias.lower()) in normalized),
        None,
    )


def _numeric(row: pd.Series, col: str | None, default: float | None = None) -> float | None:
    if col is None or pd.isna(row.get(col)):
        return default
    return float(row[col])


def _safe_bool(value: Any) -> bool:
    if pd.isna(value):
        return False
    return str(value).strip().lower() in {"1", "true", "yes", "y"}


def _summary(frame: pd.DataFrame, scored: bool) -> dict[str, Any]:
    total = len(frame)
    matched = int(frame["matched"].sum()) if frame["reconciliation_available"].any() else None
    unmatched = total - matched if matched is not None else None
    risk = (
        float(frame.loc[~frame["matched"], "taxAmount"].sum())
        if matched is not None else None
    )
    if scored and matched is not None:
        discrepancies = frame.loc[~frame["matched"]]
        bucket_counts = discrepancies["routingBucket"].value_counts()
        bucket_tax = discrepancies.groupby("routingBucket")["taxAmount"].sum()
        safe_count = int(bucket_counts.get("SAFE TO HOLD", 0))
        watch_count = int(bucket_counts.get("WATCH", 0))
        chase_count = int(bucket_counts.get("CHASE NOW", 0))
        safe_tax = float(bucket_tax.get("SAFE TO HOLD", 0))
        watch_tax = float(bucket_tax.get("WATCH", 0))
        chase_tax = float(bucket_tax.get("CHASE NOW", 0))
    else:
        safe_count = watch_count = chase_count = None
        safe_tax = watch_tax = chase_tax = None
    return {
        "total": total,
        "matched": matched,
        "unmatched": unmatched,
        "totalTaxAtRisk": risk,
        "safeCount": safe_count,
        "safeTax": safe_tax,
        "watchCount": watch_count,
        "watchTax": watch_tax,
        "chaseCount": chase_count,
        "chaseTax": chase_tax,
        "unscoredCount": 0 if scored else total,
        "reconciliationAvailable": matched is not None,
    }


def _leverage_tiers(frame: pd.DataFrame) -> pd.Series:
    outstanding = pd.to_numeric(frame["apOutstanding"], errors="coerce")
    retention = pd.to_numeric(frame["apRetention"], errors="coerce").fillna(0)
    gross = pd.to_numeric(frame["grossAmount"], errors="coerce")
    leverage = ((outstanding + retention) / gross.where(gross != 0)).mask(gross == 0, 0)
    tiers = pd.Series(pd.NA, index=frame.index, dtype="object")
    tiers.loc[leverage >= 1] = "HIGH"
    tiers.loc[(leverage > 0) & (leverage < 1)] = "MEDIUM"
    tiers.loc[leverage.notna() & (leverage <= 0)] = "LOW"
    return tiers


def _model_bucket(probability: float, days_to_cutoff: int) -> str:
    raw = serve.bucket(probability, serve.Thresholds())
    if days_to_cutoff <= serve.Thresholds().window_escalation_days:
        raw = max(serve.Bucket.WATCH, raw)
    return raw.name


def _frontend_bucket(raw_bucket: str) -> str:
    return {
        "IGNORE": "SAFE TO HOLD",
        "WATCH": "WATCH",
        "CHASE": "CHASE NOW",
        "ESCALATE": "CHASE NOW",
    }[raw_bucket]


def _score_frame(frame: pd.DataFrame) -> pd.DataFrame:
    model, metadata = serve._ensure_model()
    features = frame.loc[:, metadata["features"]].copy()
    for column, categories in metadata.get("categorical_features", {}).items():
        features[column] = features[column].where(features[column].isin(categories))
        features[column] = pd.Categorical(features[column], categories=categories)
    probabilities = model.predict_proba(features)[:, 1]
    raw_buckets = []
    for probability, days_to_cutoff in zip(probabilities, frame["days_to_16_4"]):
        raw_buckets.append(_model_bucket(float(probability), int(days_to_cutoff)))
    frame["modelProbability"] = probabilities
    frame["modelRawBucket"] = raw_buckets
    frame["modelSource"] = "lightgbm"
    frame["modelStatus"] = "scored"
    frame["modelReason"] = "LightGBM v1 synthetic later GSTR-2B appearance probability."
    frame["routingBucket"] = [_frontend_bucket(bucket) for bucket in raw_buckets]
    return frame


def _model_decision(row: dict[str, Any]) -> dict[str, Any] | None:
    status = row.get("modelStatus")
    if status == "scored":
        probability = float(row["modelProbability"])
        raw_bucket = str(row["modelRawBucket"])
        drivers = [
            f"IRN status: {row['irn_present']}",
            f"Filing pattern: {row['filing_pattern']}",
            "AP leverage available",
        ]
        return {
            "status": "scored",
            "rawBucket": raw_bucket,
            "bucket": _frontend_bucket(raw_bucket),
            "probability": probability,
            "source": str(row["modelSource"]),
            "reason": f"p={probability:.2f} (LGBM v1)",
            "drivers": drivers,
        }
    if status == "not_scored":
        return {
            "status": "not_scored",
            "reason": "Not scored: no verified IRN source is included in the uploaded files.",
            "drivers": [],
        }
    return None


def _filing_cycles(history: pd.DataFrame) -> dict[tuple[str, str], list[dict[str, Any]]]:
    org_col, gstin_col = _column(history, "org_id"), _column(history, "vendor_gstin")
    if not org_col or not gstin_col:
        return {}
    cycle_col = _column(history, "cycle")
    due_col = _column(history, "statutory_due_date")
    filed_col = _column(history, "filed_date")
    delay_col = _column(history, "delay_days")
    missed_col = _column(history, "missed_cycle_flag")
    if not cycle_col:
        return {}
    history = history.sort_values(cycle_col)
    result: dict[tuple[str, str], list[dict[str, Any]]] = {}
    for (org, gstin), rows in history.groupby([org_col, gstin_col], sort=False):
        cycles = []
        for _, row in rows.tail(6).iterrows():
            missed = _safe_bool(row.get(missed_col)) if missed_col else False
            cycles.append({
                "period": str(row[cycle_col]),
                "dueDate": str(row[due_col]) if due_col and pd.notna(row.get(due_col)) else "",
                "filingDate": None if missed else (
                    str(row[filed_col]) if filed_col and pd.notna(row.get(filed_col)) else None
                ),
                "delayDays": int(_numeric(row, delay_col, 0) or 0),
                "missed": missed,
            })
        result[(str(org), str(gstin).upper())] = cycles
    return result


def _load_demo() -> pd.DataFrame:
    if _demo_frame is not None:
        return _demo_frame
    with _demo_data_lock:
        if _demo_frame is not None:
            return _demo_frame
        return _load_demo_uncached()


def _load_demo_uncached() -> pd.DataFrame:
    global _demo_frame

    pr = pd.read_csv(DATA_DIR / "purchase_register.csv")
    corpus = pd.read_csv(
        DATA_DIR / "train_corpus.csv",
        usecols=["org_id", "invoice_no", *FEATURES],
    )
    # Read all source files by their production keys; never load self_correct.
    g2b = pd.read_csv(DATA_DIR / "gstr2b.csv")
    gstr1 = pd.read_csv(DATA_DIR / "gstr1.csv", usecols=["org_id", "GSTIN of supplier", "Invoice number"])
    ap = pd.read_csv(DATA_DIR / "ap_aging.csv")
    history = pd.read_csv(DATA_DIR / "filing_history.csv")
    cycles = _filing_cycles(history)

    pr["key"] = pr["org_id"].astype(str) + "|" + pr["invoice_no"].map(_norm)
    corpus["key"] = corpus["org_id"].astype(str) + "|" + corpus["invoice_no"].map(_norm)
    if pr["key"].duplicated().any() or corpus["key"].duplicated().any():
        raise ValueError("Demo Purchase Register and feature corpus keys must be unique.")
    frame = pr.merge(corpus.drop(columns=["org_id", "invoice_no"]), on="key", validate="one_to_one")
    frame["gstin"] = frame["vendor_gstin"].astype(str).str.upper()
    frame["taxAmount"] = frame[["igst", "cgst", "sgst", "cess"]].sum(axis=1)
    frame["grossAmount"] = frame["taxable_value"] + frame["taxAmount"]
    frame["invoiceNumber"] = frame["invoice_no"].astype(str)
    frame["invoiceDate"] = frame["invoice_date"].astype(str)
    frame["taxableAmount"] = frame["taxable_value"].astype(float)
    frame["gstRate"] = (
        frame["taxAmount"].div(frame["taxableAmount"].replace(0, pd.NA)).mul(100).fillna(0)
    )

    def input_key(df: pd.DataFrame, gstin_col: str, inv_col: str, org_col: str | None) -> pd.Series:
        orgs = df[org_col].astype(str) if org_col else pd.Series("", index=df.index)
        return orgs + "|" + df[gstin_col].map(_norm) + "|" + df[inv_col].map(_norm)

    frame["match_key"] = (
        frame["org_id"].astype(str) + "|" + frame["gstin"].map(_norm) + "|" + frame["invoice_no"].map(_norm)
    )
    g2b_gstin, g2b_invoice = _column(g2b, "GSTIN of supplier"), _column(g2b, "Invoice number")
    g2b_org = _column(g2b, "org_id")
    if not g2b_gstin or not g2b_invoice:
        raise ValueError("Demo GSTR-2B columns are incomplete.")
    g2b["match_key"] = input_key(g2b, g2b_gstin, g2b_invoice, g2b_org)
    g2b_tax_cols = [
        col for col in (
            _column(g2b, "IGST (Amt)"), _column(g2b, "CGST (Amt)"),
            _column(g2b, "SGST (Amt)"), _column(g2b, "Cess (Amt)"),
        ) if col
    ]
    g2b["matched_tax"] = g2b[g2b_tax_cols].sum(axis=1) if g2b_tax_cols else 0
    g2b["matched_invoice"] = g2b[g2b_invoice].astype(str)
    g2b["matched_date"] = g2b[_column(g2b, "Invoice date")].astype(str)
    g2b["matched_taxable"] = g2b[_column(g2b, "Taxable value (Amt)")].astype(float)
    matched = g2b.drop_duplicates("match_key").set_index("match_key")
    frame["matched"] = frame["match_key"].isin(matched.index)
    frame["reconciliation_available"] = True
    frame["matchedRecord"] = frame["match_key"].map(
        lambda key: None if key not in matched.index else {
            "id": f"2b-{key}",
            "invoiceNumber": matched.at[key, "matched_invoice"],
            "invoiceDate": matched.at[key, "matched_date"],
            "gstin": matched.at[key, g2b_gstin],
            "taxableAmount": float(matched.at[key, "matched_taxable"]),
            "taxAmount": float(matched.at[key, "matched_tax"]),
        }
    )
    frame["matchExplanation"] = frame["matched"].map({
        True: "Invoice found in the supplied synthetic GSTR-2B snapshot.",
        False: "No matching invoice found in the supplied synthetic GSTR-2B snapshot.",
    })
    frame["matchConfidence"] = frame["matched"].map({True: 100.0, False: 0.0})

    g1_gstin, g1_invoice = _column(gstr1, "GSTIN of supplier"), _column(gstr1, "Invoice number")
    frame["gstr1Reported"] = False
    frame["gstr1Available"] = True
    if g1_gstin and g1_invoice:
        frame["gstr1Reported"] = (
            frame["org_id"].astype(str) + "|" + frame["gstin"].map(_norm) + "|" + frame["invoice_no"].map(_norm)
        ).isin(input_key(gstr1, g1_gstin, g1_invoice, _column(gstr1, "org_id")))

    ap_org, ap_gstin = _column(ap, "org_id"), _column(ap, "vendor_gstin")
    ap_outstanding = _column(ap, "outstanding_payable")
    ap_retention = _column(ap, "retention_held")
    ap_advance = _column(ap, "paid_in_advance_ratio")
    ap_period = _column(ap, "period")
    if ap_org and ap_gstin and ap_outstanding:
        if ap_period:
            ap = ap.sort_values(ap_period).drop_duplicates([ap_org, ap_gstin], keep="last")
        ap["ap_key"] = ap[ap_org].astype(str) + "|" + ap[ap_gstin].astype(str).str.upper()
        ap_map = ap.set_index("ap_key")
    else:
        ap_map = pd.DataFrame()
    frame["ap_key"] = frame["org_id"].astype(str) + "|" + frame["gstin"]
    frame["apOutstanding"] = frame["ap_key"].map(ap_map[ap_outstanding].to_dict()) if ap_outstanding and not ap_map.empty else pd.NA
    frame["apRetention"] = frame["ap_key"].map(ap_map[ap_retention].to_dict()) if ap_retention and not ap_map.empty else pd.NA
    frame["paidAdvance"] = frame["ap_key"].map(ap_map[ap_advance].to_dict()) if ap_advance and not ap_map.empty else pd.NA
    frame["filingCycles"] = [
        cycles.get((str(org), str(gstin).upper()), [])
        for org, gstin in zip(frame["org_id"], frame["gstin"])
    ]
    frame["filingPatternDisplay"] = frame["filing_pattern"].map({
        "punctual": "NORMAL/PUNCTUAL",
        "habitual_laggard": "HABITUAL LAGGARD",
        "sudden_silence": "NEW ANOMALY",
    }).fillna("INSUFFICIENT HISTORY")
    frame["irnPresent"] = frame["irn_present"].eq("active")
    frame["irnAvailable"] = True
    frame["modelProbability"] = pd.NA
    frame["modelRawBucket"] = None
    frame["modelSource"] = None
    frame["modelStatus"] = "pending"
    frame["modelReason"] = None
    frame["routingBucket"] = None
    frame["source"] = "synthetic_demo"
    _demo_frame = frame
    return frame


def _invoice_records(frame: pd.DataFrame) -> list[dict[str, Any]]:
    output = []
    for row in frame.to_dict(orient="records"):
        gstin = str(row["gstin"])
        taxable = float(row["taxableAmount"])
        tax = float(row["taxAmount"])
        gross = float(row["grossAmount"])
        unpaid = None if pd.isna(row.get("apOutstanding")) else float(row["apOutstanding"])
        retention = None if pd.isna(row.get("apRetention")) else float(row["apRetention"])
        leverage = None if unpaid is None else (unpaid + (retention or 0)) / gross if gross else 0
        tier = None if leverage is None else "HIGH" if leverage >= 1 else "MEDIUM" if leverage > 0 else "LOW"
        vendor_id = f"v-{gstin}"
        model_decision = _model_decision(row)
        output.append({
            "id": str(row["key"]),
            "invoiceNumber": str(row["invoiceNumber"]),
            "invoiceDate": str(row["invoiceDate"]),
            "vendorId": vendor_id,
            "vendorName": gstin,
            "gstin": gstin,
            "taxableAmount": taxable,
            "gstRate": float(row["gstRate"]),
            "taxAmount": tax,
            "grossAmount": gross,
            "matchResult": {
                "available": bool(row["reconciliation_available"]),
                "matched": bool(row["matched"]),
                "confidence": float(row["matchConfidence"]),
                "matchedRecord": row.get("matchedRecord"),
                "explanation": str(row["matchExplanation"]),
            },
            "irnRecord": {
                "invoiceNumber": str(row["invoiceNumber"]),
                "gstin": gstin,
                "irnPresent": bool(row["irnPresent"]),
                "available": bool(row["irnAvailable"]),
                "irnRef": None,
            },
            "apRecord": {
                "vendorId": vendor_id,
                "unpaidAmount": unpaid,
                "overdueAmount": None,
                "retentionHeldAmount": retention,
                "isPaid": unpaid == 0 if unpaid is not None else None,
            },
            "vendor": {
                "id": vendor_id,
                "name": gstin,
                "gstin": gstin,
                "city": "-to-be-populated-",
                "state": "-to-be-populated-",
                "filingPattern": str(row["filingPatternDisplay"]),
                "filingCycles": row.get("filingCycles") or [],
            },
            "leverageRatio": leverage,
            "leverageTier": tier,
            "gstr1Reported": bool(row["gstr1Reported"]) if row["gstr1Available"] else None,
            "gstr1Available": bool(row["gstr1Available"]),
            "modelDecision": model_decision,
            "routingBucket": row.get("routingBucket"),
            "modelFeatures": {
                "irnPresent": str(row["irn_present"]),
                "filingPattern": str(row["filing_pattern"]),
                "complianceHistoryBand": str(row["compliance_history_band"]),
                "paidInAdvanceRatio": float(row["paid_in_advance_ratio"]),
                "outstandingPayableRatio": float(row["outstanding_payable_ratio"]),
            } if row["source"] == "synthetic_demo" else None,
        })
    return output


def _session(session_id: str) -> DatasetSession:
    _prune_sessions()
    if session_id in {"demo", "demo-scored"}:
        frame = _load_demo()
        if session_id == "demo-scored" and _demo_scored_frame is None:
            raise KeyError(session_id)
        scored = _demo_scored_frame is not None
        if scored:
            frame = _demo_scored_frame
        return DatasetSession(frame, "synthetic_demo", scored, summary=_summary(frame, scored))
    if session_id not in _sessions:
        raise KeyError(session_id)
    return _sessions[session_id]


def _prune_sessions() -> None:
    expired = [
        session_id for session_id, session in _sessions.items()
        if time.monotonic() - session.created_at > SESSION_TTL_SECONDS
    ]
    for session_id in expired:
        del _sessions[session_id]


def get_demo_page(offset: int = 0, limit: int = PAGE_SIZE) -> dict[str, Any]:
    frame = _load_demo()
    scored = _demo_scored_frame is not None
    session = DatasetSession(frame, "synthetic_demo", scored, summary=_summary(frame, scored))
    return _page(session, "demo", offset, limit)


def run_pipeline(session_id: str | None = None) -> dict[str, Any]:
    global _demo_scored_frame
    if not session_id or session_id in {"demo", "demo-scored"}:
        if _demo_scored_frame is None:
            with _demo_lock:
                if _demo_scored_frame is None:
                    _demo_scored_frame = _score_frame(_load_demo())
        frame = _demo_scored_frame
        session = DatasetSession(frame, "synthetic_demo", True, summary=_summary(frame, True))
        return _page(session, "demo-scored", 0, PAGE_SIZE)
    try:
        session = _session(session_id)
    except KeyError as exc:
        raise ValueError("Upload session expired; upload the files again.") from exc
    session.scored = False
    session.summary = _summary(session.frame, False)
    return _page(session, session_id, 0, PAGE_SIZE)


def get_invoice_page(
    session_id: str,
    offset: int = 0,
    limit: int = PAGE_SIZE,
    search: str = "",
    bucket: str = "",
    match: str = "",
    irn: str = "",
    ap: str = "",
    pattern: str = "",
    sort: str = "taxAmount",
    direction: str = "desc",
) -> dict[str, Any]:
    try:
        session = _session(session_id)
    except KeyError:
        raise ValueError("Dataset session expired; load the data again.")
    frame = session.frame
    filtered = frame
    if search:
        needle = re.escape(search)
        mask = (
            filtered["invoiceNumber"].astype(str).str.contains(needle, case=False, na=False)
            | filtered["gstin"].astype(str).str.contains(needle, case=False, na=False)
        )
        filtered = filtered.loc[mask]
    if bucket:
        filtered = filtered.loc[filtered["routingBucket"] == bucket]
    if match == "MATCHED":
        filtered = filtered.loc[filtered["reconciliation_available"] & filtered["matched"]]
    elif match == "UNMATCHED":
        filtered = filtered.loc[filtered["reconciliation_available"] & ~filtered["matched"]]
    if irn == "PRESENT":
        filtered = filtered.loc[filtered["irnAvailable"] & filtered["irnPresent"]]
    elif irn == "ABSENT":
        filtered = filtered.loc[filtered["irnAvailable"] & ~filtered["irnPresent"]]
    if ap and ap != "ALL":
        filtered = filtered.loc[_leverage_tiers(filtered) == ap]
    if pattern:
        filtered = filtered.loc[filtered["filingPatternDisplay"] == pattern]
    sort_col = {
        "taxAmount": "taxAmount",
        "score": "modelProbability",
        "invoiceDate": "invoiceDate",
        "vendorName": "gstin",
    }.get(sort, "taxAmount")
    filtered = filtered.sort_values(sort_col, ascending=direction == "asc", kind="stable", na_position="last")
    return _page(session, session_id, offset, limit, filtered)


def _page(
    session: DatasetSession,
    session_id: str,
    offset: int,
    limit: int,
    frame: pd.DataFrame | None = None,
) -> dict[str, Any]:
    limit = min(max(1, limit), PAGE_SIZE)
    subset = session.frame if frame is None else frame
    return {
        "status": "success",
        "session_id": session_id,
        "source": session.source,
        "scored": session.scored,
        "summary": session.summary,
        "total": len(subset),
        "offset": max(0, offset),
        "limit": limit,
        "invoices": _invoice_records(subset.iloc[max(0, offset):max(0, offset) + limit]),
    }


def _read_csv(contents: bytes, name: str) -> pd.DataFrame:
    try:
        return pd.read_csv(io.BytesIO(contents), comment="#", dtype=str, keep_default_na=False)
    except Exception as exc:
        raise ValueError(f"Could not read {name} as CSV: {exc}") from exc


def _required_column(df: pd.DataFrame, label: str, *aliases: str) -> str:
    col = _column(df, *aliases)
    if col is None:
        raise ValueError(f"{label} is missing a required column.")
    return col


def create_upload_session(
    pr_bytes: bytes,
    optional_files: dict[str, tuple[str, bytes] | None],
) -> dict[str, Any]:
    pr = _read_csv(pr_bytes, "Purchase Register")
    invoice_col = _required_column(pr, "Purchase Register", "invoice_no", "invoice_number", "invoice number")
    gstin_col = _required_column(pr, "Purchase Register", "vendor_gstin", "supplier_gstin", "gstin of supplier")
    date_col = _column(pr, "invoice_date", "invoice date")
    taxable_col = _column(pr, "taxable_value", "taxable value (amt)", "taxable amount")
    total_tax_col = _column(pr, "total_tax", "tax_amount", "total tax")
    tax_columns = [
        col for col in (
            _column(pr, "igst", "igst (amt)"),
            _column(pr, "cgst", "cgst (amt)"),
            _column(pr, "sgst", "sgst (amt)", "sgst/utgst (amt)"),
            _column(pr, "cess", "cess (amt)"),
        ) if col
    ]
    if not taxable_col:
        raise ValueError("Purchase Register is missing a taxable-value column.")
    if total_tax_col is None and not tax_columns:
        raise ValueError("Purchase Register is missing tax columns.")
    org_col = _column(pr, "org_id")
    pr = pr.copy()
    pr["org"] = pr[org_col].astype(str) if org_col else ""
    pr["gstin"] = pr[gstin_col].astype(str).str.strip().str.upper()
    pr["invoiceNumber"] = pr[invoice_col].astype(str).str.strip()
    pr["invoiceDate"] = pr[date_col].astype(str) if date_col else "-to-be-populated-"
    pr["taxableAmount"] = pd.to_numeric(pr[taxable_col], errors="coerce")
    if total_tax_col:
        pr["taxAmount"] = pd.to_numeric(pr[total_tax_col], errors="coerce")
    else:
        pr["taxAmount"] = sum(pd.to_numeric(pr[col], errors="coerce").fillna(0) for col in tax_columns)
    pr["taxAmount"] = pr["taxAmount"].fillna(0)
    pr["grossAmount"] = pr["taxableAmount"] + pr["taxAmount"]
    if pr[["gstin", "invoiceNumber", "taxableAmount"]].isna().any().any():
        raise ValueError("Purchase Register contains rows missing GSTIN, invoice number, or taxable value.")
    if pr.empty or pr["gstin"].str.strip().eq("").any() or pr["invoiceNumber"].str.strip().eq("").any():
        raise ValueError("Purchase Register must contain invoices with a GSTIN and invoice number.")
    pr["key"] = pr["org"].astype(str) + "|" + pr["gstin"].map(_norm) + "|" + pr["invoiceNumber"].map(_norm)
    if pr["key"].duplicated().any():
        raise ValueError("Purchase Register contains duplicate invoice keys.")

    g2b_pair = optional_files.get("gstr2b")
    if g2b_pair:
        g2b = _read_csv(g2b_pair[1], "GSTR-2B")
        gi = _required_column(g2b, "GSTR-2B", "vendor_gstin", "supplier_gstin", "gstin of supplier", "gstin")
        ii = _required_column(g2b, "GSTR-2B", "invoice_no", "invoice_number", "invoice number")
        go = _column(g2b, "org_id")
        g2b_total_tax = _column(g2b, "total_tax", "tax_amount", "total tax")
        g2b_tax_parts = [
            col for col in (
                _column(g2b, "igst", "igst (amt)"),
                _column(g2b, "cgst", "cgst (amt)"),
                _column(g2b, "sgst", "sgst (amt)", "sgst/utgst (amt)"),
                _column(g2b, "cess", "cess (amt)"),
            ) if col
        ]
        g2b_taxable = _column(g2b, "taxable_value", "taxable value (amt)")
        if g2b_total_tax is None and not g2b_tax_parts:
            raise ValueError("GSTR-2B is missing tax columns.")
        g2b["key"] = (
            (g2b[go].astype(str) if go else "")
            + "|" + g2b[gi].astype(str).str.upper().map(_norm)
            + "|" + g2b[ii].astype(str).map(_norm)
        )
        g2b["matched_tax"] = (
            pd.to_numeric(g2b[g2b_total_tax], errors="coerce").fillna(0)
            if g2b_total_tax
            else sum(pd.to_numeric(g2b[col], errors="coerce").fillna(0) for col in g2b_tax_parts)
        )
        if g2b_taxable:
            g2b["matched_taxable"] = pd.to_numeric(g2b[g2b_taxable], errors="coerce").fillna(0)
        else:
            g2b["matched_taxable"] = 0.0
        g2b = g2b.drop_duplicates("key").set_index("key")
        pr["matched"] = pr["key"].isin(g2b.index)
        pr["reconciliation_available"] = True
        pr["matchedRecord"] = pr["key"].map(
            lambda key: None if key not in g2b.index else {
                "id": f"2b-{key}",
                "invoiceNumber": str(g2b.at[key, ii]),
                "invoiceDate": str(g2b.at[key, _column(g2b, "invoice_date", "invoice date")])
                if _column(g2b, "invoice_date", "invoice date") else "-to-be-populated-",
                "gstin": str(g2b.at[key, gi]).upper(),
                "taxableAmount": float(g2b.at[key, "matched_taxable"]),
                "taxAmount": float(g2b.at[key, "matched_tax"]),
            }
        )
        pr["matchExplanation"] = pr["matched"].map({
            True: "Invoice found in the uploaded GSTR-2B file.",
            False: "No matching invoice found in the uploaded GSTR-2B file.",
        })
        pr["matchConfidence"] = pr["matched"].map({True: 100.0, False: 0.0})
    else:
        pr["matched"] = False
        pr["reconciliation_available"] = False
        pr["matchedRecord"] = None
        pr["matchExplanation"] = "Not checked: no GSTR-2B file was uploaded."
        pr["matchConfidence"] = 0.0

    ap_pair = optional_files.get("ap_aging")
    if ap_pair:
        ap = _read_csv(ap_pair[1], "AP aging")
        ag = _required_column(ap, "AP aging", "vendor_gstin", "gstin")
        ao = _column(ap, "org_id")
        outstanding = _required_column(ap, "AP aging", "outstanding_payable")
        retention = _column(ap, "retention_held")
        ap["ap_key"] = (
            (ap[ao].astype(str) if ao else "")
            + "|" + ap[ag].astype(str).str.strip().str.upper()
        )
        if (period_col := _column(ap, "period")):
            ap = ap.sort_values(period_col).drop_duplicates("ap_key", keep="last")
        ap = ap.set_index("ap_key")
        pr["ap_key"] = pr["org"].astype(str) + "|" + pr["gstin"]
        pr["apOutstanding"] = pr["ap_key"].map(ap[outstanding])
        pr["apRetention"] = pr["ap_key"].map(ap[retention]) if retention else 0.0
    else:
        pr["apOutstanding"] = pd.NA
        pr["apRetention"] = pd.NA

    history_pair = optional_files.get("filing_history")
    cycles: dict[tuple[str, str], list[dict[str, Any]]] = {}
    if history_pair:
        history = _read_csv(history_pair[1], "Filing history")
        # Validate the inputs but do not invent model categories from raw history.
        _required_column(history, "Filing history", "vendor_gstin", "gstin")
        _required_column(history, "Filing history", "cycle")
        _required_column(history, "Filing history", "delay_days")
        cycles = _filing_cycles(history)

    gstr1_pair = optional_files.get("gstr1")
    pr["gstr1Reported"] = False
    pr["gstr1Available"] = False
    if gstr1_pair:
        gstr1 = _read_csv(gstr1_pair[1], "GSTR-1")
        g1g = _required_column(gstr1, "GSTR-1", "vendor_gstin", "gstin of supplier", "gstin")
        g1i = _required_column(gstr1, "GSTR-1", "invoice_no", "invoice_number", "invoice number")
        g1o = _column(gstr1, "org_id")
        g1_keys = (
            (gstr1[g1o].astype(str) if g1o else "")
            + "|" + gstr1[g1g].astype(str).str.upper().map(_norm)
            + "|" + gstr1[g1i].astype(str).map(_norm)
        )
        pr["gstr1Reported"] = pr["key"].isin(g1_keys)
        pr["gstr1Available"] = True

    pr["invoiceDate"] = pr["invoiceDate"].fillna("-to-be-populated-")
    pr["gstRate"] = (pr["taxAmount"] / pr["taxableAmount"].replace(0, pd.NA) * 100).fillna(0)
    pr["irnPresent"] = False
    pr["irnAvailable"] = False
    pr["filingCycles"] = [
        cycles.get((str(org), str(gstin).upper()), [])
        for org, gstin in zip(pr["org"], pr["gstin"])
    ]
    pr["filingPatternDisplay"] = "INSUFFICIENT HISTORY"
    pr["modelProbability"] = pd.NA
    pr["modelRawBucket"] = None
    pr["modelSource"] = None
    pr["modelStatus"] = "not_scored"
    pr["modelReason"] = "Not scored: no verified IRN source is included in the uploaded files."
    pr["routingBucket"] = None
    pr["source"] = "user_upload"
    session_id = str(uuid.uuid4())
    session = DatasetSession(pr, "user_upload", False, summary=_summary(pr, False))
    _sessions[session_id] = session
    _prune_sessions()
    if len(_sessions) > 8:
        oldest = sorted(_sessions, key=lambda key: _sessions[key].created_at)
        for expired_id in oldest[:len(_sessions) - 8]:
            del _sessions[expired_id]
    return _page(session, session_id, 0, PAGE_SIZE)


async def receive_upload(
    file: Any,
    display_name: str,
    max_bytes: int = MAX_UPLOAD_BYTES,
) -> tuple[str, bytes] | None:
    if file is None:
        return None
    content = await file.read(max_bytes + 1)
    if len(content) > max_bytes:
        limit_mb = max_bytes // (1024 * 1024)
        raise ValueError(f"{display_name} exceeds the {limit_mb} MB upload limit.")
    if not content:
        raise ValueError(f"{display_name} is empty.")
    return file.filename or display_name, content
