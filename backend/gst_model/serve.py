"""Serve-time decide(). R1 structural rules BEFORE model.
Heuristic is cold fallback only. No user-data retrain (Q3).

All numeric constants in heuristic_p() are read from synth/priors.yaml
under the `heuristic` key so there are zero magic numbers in this file.
"""
import joblib
import json
import yaml
import numpy as np
import pandas as pd
from pathlib import Path
from dataclasses import dataclass
from enum import IntEnum
from typing import Literal, Optional

# ---- Load heuristic constants from config once at import time ----
_ROOT = Path(__file__).resolve().parent
_PRIORS_PATH = _ROOT / "priors.yaml"
_H = yaml.safe_load(open(_PRIORS_PATH))["heuristic"]


class Bucket(IntEnum):
    IGNORE = 0
    WATCH = 1
    CHASE = 2
    ESCALATE = 3


@dataclass
class Feats:
    lookup_state: str = "unknown"
    irn_present: str = "unknown"
    filing_pattern: str = "unknown"
    leverage_score: float = None
    retention_active: bool = False
    paid_in_advance_ratio: float = 0.0
    outstanding_payable_ratio: float = 0.0
    current_delay_z: float = 0.0
    is_credit_note: bool = False
    is_format_divergence: bool = False
    buyer_posted_flag: bool = False
    value_mismatch_pct: float = 0.0
    days_to_16_4: int = 90
    rupees_at_risk: float = 0.0
    compliance_history_band: str = "unknown"


@dataclass
class Thresholds:
    ignore_p: float = 0.70
    chase_p: float = 0.25
    window_escalation_days: int = 10


@dataclass
class Decision:
    bucket: Bucket
    probability: Optional[float]
    source: Literal["lightgbm", "heuristic", "rule"]
    reason: str
    drivers: list[str]


def heuristic_p(f: Feats) -> float:
    """Transparent fallback when model cannot score (cold start, missing history).
    All numeric constants sourced from priors.yaml[heuristic] -- no magic numbers here."""
    base = _H["irn_active_base"] if f.irn_present == "active" else _H["irn_absent_base"]
    if f.buyer_posted_flag:
        base = _H["buyer_posted_base"]
    if f.filing_pattern == "sudden_silence":
        base = min(base, _H["sudden_silence_cap"])
    if f.is_credit_note:
        base += _H["credit_note_bump"]
    return max(_H["p_floor"], min(_H["p_ceil"], base))


def bucket(p: float, cfg: Thresholds) -> Bucket:
    if p >= cfg.ignore_p:
        return Bucket.IGNORE
    if p < cfg.chase_p:
        return Bucket.CHASE
    return Bucket.WATCH


_model = None
_meta = None


def _ensure_model():
    global _model, _meta
    if _model is None:
        _model = joblib.load(_ROOT / "router.lgb")
        _meta = json.load(open(_ROOT / "router.meta.json"))
    return _model, _meta


def vec(f: Feats) -> dict:
    return {
        "irn_present": f.irn_present,
        "leverage_score": f.leverage_score,
        "retention_active": f.retention_active,
        "paid_in_advance_ratio": f.paid_in_advance_ratio,
        "outstanding_payable_ratio": f.outstanding_payable_ratio,
        "filing_pattern": f.filing_pattern,
        "current_delay_z": f.current_delay_z,
        "is_credit_note": f.is_credit_note,
        "is_format_divergence": f.is_format_divergence,
        "buyer_posted_flag": f.buyer_posted_flag,
        "value_mismatch_pct": f.value_mismatch_pct,
        "days_to_16_4": f.days_to_16_4,
        "rupees_at_risk": f.rupees_at_risk,
        "compliance_history_band": f.compliance_history_band,
    }


def decide(feats: Feats, cfg: Thresholds) -> Decision:
    # R1 -- structural, BEFORE the model, never learned
    if (feats.lookup_state == "confirmed_absent"
            and feats.irn_present == "absent"):
        return Decision(
            bucket=Bucket.CHASE,
            probability=None,
            source="rule",
            reason="IRN confirmed absent -- ghost risk.",
            drivers=["IRN confirmed absent"],
        )

    # R4 -- cold fallback
    if feats.filing_pattern == "unknown" or feats.leverage_score is None:
        p = heuristic_p(feats)
        source = "heuristic"
    else:
        model, meta = _ensure_model()
        row = pd.DataFrame([vec(feats)])
        for c, categories in meta.get("categorical_features", {}).items():
            row[c] = row[c].where(row[c].isin(categories))
            row[c] = pd.Categorical(row[c], categories=categories)
        p = float(model.predict_proba(row[meta["features"]])[0][1])
        source = "lightgbm"

    # window escalation
    if feats.days_to_16_4 <= cfg.window_escalation_days:
        b = max(Bucket.WATCH, bucket(p, cfg))
    else:
        b = bucket(p, cfg)

    # Context indicators only; these are not SHAP values or model attributions.
    drivers = [
        f"IRN status: {feats.irn_present}",
        f"Filing pattern: {feats.filing_pattern}",
    ]
    if feats.leverage_score is not None:
        drivers.append("AP leverage available")
    reason = f"p={p:.2f} ({'cold heuristic' if source == 'heuristic' else 'LGBM v1'})"
    return Decision(b, p, source, reason, drivers)
