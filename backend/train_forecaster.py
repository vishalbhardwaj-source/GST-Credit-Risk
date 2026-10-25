"""
GST Resolution Forecaster - Scenario 4 Upgraded Architecture.

Implements:
  * Tier 1: Statutory Invariants (CGST Act Sec 16(4) calendar expiry, Rule 48(4) IRN authentication).
  * Tier 2: Calibrated GBDT Forecaster incorporating Scenario 4 Causal Signals:
      - dispute_active: Active commercial hold / rate dispute / debit note in buyer ERP.
      - portal_filing_status: Supplier's return status visible on GST portal.
      - vendor_acknowledgment: Supplier response to automated AP inquiry / confirmed upload.
      - mismatch_reason_code: Granular discrepancy categorization (Typo vs Value vs Non-filing).
  * Vendor-grouped leak-free partition (no vendor shared across train / early-stop / calibration / test).
  * Isotonic probability calibration fitted strictly on calibration partition.
"""
import argparse
import os

import joblib
import numpy as np
import pandas as pd

try:
    import lightgbm as lgb
except (ImportError, OSError):
    lgb = None
try:
    from catboost import CatBoostClassifier
except (ImportError, OSError):
    CatBoostClassifier = None
try:
    import xgboost as xgb
except (ImportError, OSError):
    xgb = None

from sklearn.calibration import calibration_curve
from sklearn.isotonic import IsotonicRegression
from sklearn.metrics import (
    average_precision_score,
    brier_score_loss,
    confusion_matrix,
    roc_auc_score,
    roc_curve,
)

DEFAULT_WEIGHTS = {"lgb": 0.50, "cb": 0.30, "xgb": 0.20}
BUYER_POSTED_CAP = 0.02  # Tier-1 clamp; see note in module docstring
IRN_ABSENT_CAP = 0.05    # Tier-1 clamp, applied only to ABSENT_APPLIES
FILING_MAP = {"punctual": 0, "habitual_laggard": 1, "sudden_silence": 2}
COMP_MAP = {"poor": 0, "mixed": 1, "good": 2, "perfect": 3}
IRN_UNKNOWN_STRINGS = ["unknown", "exempt", "not_applicable", "absent_unknown", "absent_not_applicable"]


def _num(df, col, default=np.nan):
    """Numeric column as float Series; NaN (or default) if the column is absent."""
    if col in df.columns:
        return pd.to_numeric(df[col], errors="coerce").astype(float)
    return pd.Series(default, index=df.index, dtype=float)


def _flag(df, col, missing=0):
    """Boolean-ish column -> 0/1. If the column is absent, returns missing (0 or NaN)."""
    if col not in df.columns:
        return pd.Series(missing, index=df.index, dtype=float if missing != missing else int)
    s = df[col]
    if s.dtype == object:
        s = s.astype(str).str.strip().str.lower().isin(["true", "1", "yes", "t", "y"])
    return s.fillna(False).astype(bool).astype(int)


def _cat(df, col, mapping):
    """Categorical string column -> numeric code; NaN if absent or unmapped."""
    if col not in df.columns:
        return pd.Series(np.nan, index=df.index, dtype=float)
    return df[col].astype(str).str.strip().str.lower().map(mapping).astype(float)


def _irn_code(df):
    """active/True -> 1, unknown/exempt -> NaN, anything else -> 0."""
    if "irn_present" not in df.columns:
        return pd.Series(np.nan, index=df.index, dtype=float)
    s = df["irn_present"].astype(str).str.strip().str.lower()
    out = np.where(
        s.isin(["active", "true", "1", "1.0", "yes"]),
        1.0,
        np.where(s.isin(IRN_UNKNOWN_STRINGS), np.nan, 0.0),
    )
    return pd.Series(out, index=df.index, dtype=float)


def _group_split(groups, fractions, seed):
    """Assign whole groups (vendors) to buckets so no group appears in two splits."""
    codes, uniq = pd.factorize(groups)
    n = len(uniq)
    rng = np.random.default_rng(seed)
    rank = np.empty(n, dtype=int)
    rank[rng.permutation(n)] = np.arange(n)
    cuts = np.cumsum(fractions)[:-1] * n
    bucket_of_group = np.searchsorted(cuts, rank, side="right")
    bucket = bucket_of_group[codes]
    return [np.where(bucket == i)[0] for i in range(len(fractions))]


def _pick_threshold(y, p, target_default_recall=None):
    fpr, tpr, thr = roc_curve(y, p)
    spec = 1.0 - fpr
    idx = int(np.argmax(tpr - fpr))
    if target_default_recall is not None:
        ok = np.where(spec >= target_default_recall)[0]
        if len(ok):
            idx = int(ok[np.argmax(tpr[ok])])
    t = float(thr[idx])
    return t if np.isfinite(t) else 0.5


def _metrics_at(y, p, thr):
    pred = (p >= thr).astype(int)
    tn, fp, fn, tp = confusion_matrix(y, pred, labels=[0, 1]).ravel()
    spec = tn / (tn + fp) if (tn + fp) else 0.0
    sens = tp / (tp + fn) if (tp + fn) else 0.0
    return {
        "cm": [[int(tn), int(fp)], [int(fn), int(tp)]],
        "spec": float(spec),
        "sens": float(sens),
        "bal": float((spec + sens) / 2.0),
        "acc": float((tp + tn) / max(1, len(y))),
    }


def _topk_default_capture(y, p, frac=0.10):
    n = max(1, int(len(y) * frac))
    top = np.argsort(p, kind="stable")[:n]
    is_default = (np.asarray(y) == 0)
    base = is_default.mean() if len(y) else 0.0
    capture = is_default[top].sum() / max(1, is_default.sum())
    precision = is_default[top].mean()
    return float(capture), float(precision / base) if base > 0 else 0.0


def _safe_auc(y, s):
    y = np.asarray(y)
    if len(np.unique(y)) < 2:
        return None
    return float(roc_auc_score(y, s))


class GSTResolutionForecaster:
    """
    Tier 1: statutory invariants (Sec 16(4) expiry, Rule 48(4) IRN, buyer-posted cap).
    Tier 2: calibrated gradient-boosted resolution probability with Scenario 4 Causal Signals.
    Expected loss = invoice_tax * (1 - P_resolution).
    """

    ALL_FEATURES = [
        "irn_present", "buyer_posted_flag", "is_credit_note", "is_format_divergence",
        "retention_active", "leverage_score", "paid_in_advance_ratio",
        "outstanding_payable_ratio", "value_mismatch_pct", "days_to_16_4",
        "rupees_at_risk_log", "statutory_urgency", "current_delay_z",
        "v_mean_delay", "v_median_delay", "v_max_delay", "v_std_delay", "v_missed_ratio",
        "days_since_last_payment", "payable_log", "filing_pattern_code",
        "compliance_band_code", "has_vendor_history",
        # Scenario 4 Causal Signals:
        "dispute_active", "portal_filing_status", "vendor_acknowledgment", "mismatch_reason_code",
    ]

    def __init__(self, exclude_features=None):
        self.model = None       # LightGBM
        self.model_cb = None    # CatBoost
        self.model_xgb = None   # XGBoost
        self.calibrator = None
        self.exclude_features = list(exclude_features or [])
        self.feature_cols = [c for c in self.ALL_FEATURES if c not in self.exclude_features]
        self.blend_weights = dict(DEFAULT_WEIGHTS)
        self.optimal_threshold = 0.5
        self.model_metrics = {}

    def prepare_all(self, df: pd.DataFrame) -> pd.DataFrame:
        X = pd.DataFrame(index=df.index)

        if "rupees_at_risk" in df.columns or "days_to_16_4" in df.columns:
            X["irn_present"] = _irn_code(df)
            X["buyer_posted_flag"] = _flag(df, "buyer_posted_flag")
            X["is_credit_note"] = _flag(df, "is_credit_note")
            X["is_format_divergence"] = _flag(df, "is_format_divergence", missing=np.nan)
            X["retention_active"] = _flag(df, "retention_active", missing=np.nan)
            X["leverage_score"] = _num(df, "leverage_score")
            X["paid_in_advance_ratio"] = _num(df, "paid_in_advance_ratio")
            X["outstanding_payable_ratio"] = _num(df, "outstanding_payable_ratio")
            X["value_mismatch_pct"] = _num(df, "value_mismatch_pct")
            X["days_to_16_4"] = _num(df, "days_to_16_4")
            risk = _num(df, "rupees_at_risk") if "rupees_at_risk" in df.columns else _num(df, "total_tax")
            X["rupees_at_risk_log"] = np.log1p(risk.clip(lower=0))
            X["statutory_urgency"] = X["rupees_at_risk_log"] / (X["days_to_16_4"].clip(lower=0) + 1.0)
            X["current_delay_z"] = _num(df, "current_delay_z")
            X["v_mean_delay"] = _num(df, "v_mean_delay")
            X["v_median_delay"] = _num(df, "v_median_delay")
            X["v_max_delay"] = _num(df, "v_max_delay")
            X["v_std_delay"] = _num(df, "v_std_delay")
            X["v_missed_ratio"] = _num(df, "v_missed_ratio")
            X["days_since_last_payment"] = _num(df, "days_since_last_payment")
            X["payable_log"] = np.log1p(_num(df, "outstanding_payable").clip(lower=0))
            X["filing_pattern_code"] = _cat(df, "filing_pattern", FILING_MAP)
            X["compliance_band_code"] = _cat(df, "compliance_history_band", COMP_MAP)
            X["has_vendor_history"] = X["v_mean_delay"].notna().astype(int) if "has_vendor_history" not in df.columns else _flag(df, "has_vendor_history")

            # Scenario 4 Causal Signals (Point-in-time)
            X["dispute_active"] = _flag(df, "dispute_active", missing=0)
            X["portal_filing_status"] = _flag(df, "portal_filing_status", missing=np.nan)
            X["vendor_acknowledgment"] = _flag(df, "vendor_acknowledgment", missing=0)
            X["mismatch_reason_code"] = _num(df, "mismatch_reason_code", default=0.0)
        else:
            tax = _num(df, "total_tax", 0.0).fillna(0.0)
            X["irn_present"] = _irn_code(df) if "irn_present" in df.columns else 1.0
            X["buyer_posted_flag"] = _flag(df, "buyer_posted_flag")
            X["is_credit_note"] = _flag(df, "is_credit_note")
            if "discrepancy_type" in df.columns:
                X["is_format_divergence"] = (df["discrepancy_type"].fillna("UNKNOWN") == "TYPO_OR_ROUNDING").astype(int)
            else:
                X["is_format_divergence"] = np.nan
            X["retention_active"] = _flag(df, "retention_active", missing=np.nan)

            on_time = _num(df, "on_time_filing_ratio")
            X["leverage_score"] = _num(df, "leverage_score") if "leverage_score" in df.columns else on_time.fillna(0.8)
            X["paid_in_advance_ratio"] = np.nan
            X["outstanding_payable_ratio"] = np.nan
            X["value_mismatch_pct"] = np.nan
            X["days_to_16_4"] = _num(df, "days_to_statutory_cutoff").fillna(45.0)
            X["rupees_at_risk_log"] = np.log1p(tax.clip(lower=0))
            X["statutory_urgency"] = X["rupees_at_risk_log"] / (X["days_to_16_4"].clip(lower=0) + 1.0)

            lag = _num(df, "vendor_filing_lag_median")
            X["current_delay_z"] = np.nan
            X["v_mean_delay"] = lag
            X["v_median_delay"] = lag
            X["v_max_delay"] = np.nan
            X["v_std_delay"] = np.nan
            X["v_missed_ratio"] = (1.0 - on_time).clip(lower=0)
            X["days_since_last_payment"] = np.nan
            X["payable_log"] = np.nan
            qrmp = _num(df, "vendor_qrmp_flag", 0.0).fillna(0)
            X["filing_pattern_code"] = np.where(lag > 25, 1, np.where(qrmp == 1, 1, 0)).astype(float)
            X["compliance_band_code"] = np.where(
                on_time > 0.90, 3, np.where(on_time > 0.75, 2, np.where(on_time > 0.50, 1, 0))
            ).astype(float)
            X.loc[on_time.isna(), "compliance_band_code"] = np.nan
            X["has_vendor_history"] = lag.notna().astype(int)

            # Scenario 4 Signals
            X["dispute_active"] = _flag(df, "dispute_active", missing=0)
            X["portal_filing_status"] = _flag(df, "portal_filing_status", missing=np.nan)
            X["vendor_acknowledgment"] = _flag(df, "vendor_acknowledgment", missing=0)
            X["mismatch_reason_code"] = _num(df, "mismatch_reason_code", default=0.0)

        return X[self.ALL_FEATURES]

    def prepare_features(self, df: pd.DataFrame) -> pd.DataFrame:
        return self.prepare_all(df)[self.feature_cols]

    @staticmethod
    def _enrich(df: pd.DataFrame, data_path: str) -> pd.DataFrame:
        base_dir = os.path.dirname(data_path)
        fh_path = os.path.join(base_dir, "filing_history.csv")
        ap_path = os.path.join(base_dir, "ap_aging.csv")
        if not (os.path.exists(fh_path) and os.path.exists(ap_path) and "vendor_gstin" in df.columns):
            return df

        fh = pd.read_csv(fh_path)
        ap_df = pd.read_csv(ap_path)
        keys = [k for k in ("org_id", "vendor_gstin") if k in df.columns and k in fh.columns and k in ap_df.columns]

        fh_agg = fh.groupby(keys).agg(
            v_mean_delay=("delay_days", "mean"),
            v_median_delay=("delay_days", "median"),
            v_max_delay=("delay_days", "max"),
            v_std_delay=("delay_days", "std"),
            v_missed_cycles=("missed_cycle_flag", "sum"),
            v_total_cycles=("cycle", "count"),
        ).reset_index()
        fh_agg["v_missed_ratio"] = fh_agg["v_missed_cycles"] / fh_agg["v_total_cycles"]

        ap_sub = ap_df[keys + ["days_since_last_payment", "outstanding_payable"]]
        ap_sub = ap_sub.drop_duplicates(keys, keep="last")

        v_profile = fh_agg.merge(ap_sub, on=keys, how="left")
        n_before = len(df)
        df = df.merge(v_profile, on=keys, how="left")
        assert len(df) == n_before, f"Merge changed row count {n_before} -> {len(df)}; check join keys."
        return df

    def _xgb_predict(self, X):
        dm = xgb.DMatrix(X)
        best = getattr(self.model_xgb, "best_iteration", None)
        if best is not None:
            try:
                return self.model_xgb.predict(dm, iteration_range=(0, int(best) + 1))
            except TypeError:
                pass
        return self.model_xgb.predict(dm)

    def _component_preds(self, X, only_weighted=False):
        w = self.blend_weights or DEFAULT_WEIGHTS
        def want(k): return (not only_weighted) or w.get(k, 0) > 0

        out = {}
        if self.model is not None and want("lgb"):
            out["lgb"] = np.asarray(self.model.predict(X))
        if self.model_cb is not None and want("cb"):
            out["cb"] = self.model_cb.predict_proba(X)[:, 1]
        if self.model_xgb is not None and xgb is not None and want("xgb"):
            out["xgb"] = self._xgb_predict(X)
        return out

    def _blend(self, comps):
        w = {k: v for k, v in (self.blend_weights or DEFAULT_WEIGHTS).items() if v > 0 and k in comps}
        s = sum(w.values())
        return sum((v / s) * comps[k] for k, v in w.items())

    def _blend_predict(self, X):
        return self._blend(self._component_preds(X, only_weighted=True))

    @staticmethod
    def _apply_tier1(p, X_all):
        p = np.asarray(p, dtype=float).copy()
        p[(X_all["days_to_16_4"].fillna(1.0) <= 0).values] = 0.0
        m = (X_all["irn_present"] == 0).values
        p[m] = np.minimum(p[m], IRN_ABSENT_CAP)
        m = (X_all["buyer_posted_flag"] == 1).values
        p[m] = np.minimum(p[m], BUYER_POSTED_CAP)
        # Commercial dispute invariant: if active commercial dispute, clamp resolution
        if "dispute_active" in X_all:
            disp_mask = (X_all["dispute_active"] == 1).values
            p[disp_mask] = np.minimum(p[disp_mask], 0.10)
        return p

    def train(self, data_path, out_path=None, target_default_recall=None, seed=42):
        if lgb is None:
            raise RuntimeError("lightgbm is required (pip install lightgbm).")

        print(f"Loading training cohort from {data_path}...")
        df = pd.read_csv(data_path)
        df = self._enrich(df, data_path)

        if "self_correct" in df.columns:
            y = df["self_correct"].astype(int).values
        elif "resolved_target" in df.columns:
            y = df["resolved_target"].astype(int).values
        else:
            raise ValueError("No valid target column found ('self_correct' or 'resolved_target')")

        X_all = self.prepare_all(df)
        X = X_all[self.feature_cols]

        if "vendor_gstin" in df.columns:
            groups = (df["org_id"].astype(str) + "|" + df["vendor_gstin"].astype(str)).values if "org_id" in df.columns else df["vendor_gstin"].astype(str).values
            strategy = "vendor-grouped split (no vendor shared across train/early-stop/calibration/test)"
        else:
            groups = np.arange(len(df))
            strategy = "row-level random split"

        i_tr, i_es, i_ca, i_te = _group_split(groups, [0.65, 0.10, 0.10, 0.15], seed)
        X_train, y_train = X.iloc[i_tr], y[i_tr]
        X_es, y_es = X.iloc[i_es], y[i_es]
        X_calib, y_calib = X.iloc[i_ca], y[i_ca]
        X_test, y_test = X.iloc[i_te], y[i_te]
        Xa_test = X_all.iloc[i_te]

        print("Training LightGBM GBDT...")
        params_lgb = {
            "objective": "binary", "metric": "auc", "boosting_type": "gbdt",
            "num_leaves": 48, "learning_rate": 0.03, "min_child_samples": 300,
            "lambda_l2": 10.0, "feature_fraction": 0.7,
            "bagging_fraction": 0.8, "bagging_freq": 1,
            "verbose": -1, "seed": seed,
        }
        d_train = lgb.Dataset(X_train, label=y_train)
        d_es = lgb.Dataset(X_es, label=y_es, reference=d_train)
        self.model = lgb.train(
            params_lgb, d_train, num_boost_round=3000, valid_sets=[d_es],
            callbacks=[lgb.early_stopping(100), lgb.log_evaluation(0)],
        )

        comps_calib = self._component_preds(X_calib)
        auc_single = roc_auc_score(y_calib, comps_calib["lgb"])
        self.blend_weights = {"lgb": 1.0}
        p_blend_calib = comps_calib["lgb"]

        self.calibrator = IsotonicRegression(out_of_bounds="clip")
        self.calibrator.fit(p_blend_calib, y_calib)
        p_calib_cal = self.calibrator.predict(p_blend_calib)
        self.optimal_threshold = _pick_threshold(y_calib, p_calib_cal, target_default_recall)

        p_test_raw = self.model.predict(X_test)
        p_test_cal = self.calibrator.predict(p_test_raw)
        thr = self.optimal_threshold

        m_all = _metrics_at(y_test, p_test_cal, thr)
        live = (Xa_test["days_to_16_4"].fillna(1.0) > 0).values
        m_t2 = _metrics_at(y_test[live], p_test_cal[live], thr)
        p_sys = self._apply_tier1(p_test_cal, Xa_test)
        m_sys = _metrics_at(y_test, p_sys, thr)

        capture10, lift10 = _topk_default_capture(y_test, p_test_raw, 0.10)
        capture20, lift20 = _topk_default_capture(y_test, p_test_raw, 0.20)
        frac_pos, mean_pred = calibration_curve(y_test, p_test_cal, n_bins=10, strategy="quantile")

        self.model_metrics = {
            "validation_strategy": strategy,
            "roc_auc": round(float(roc_auc_score(y_test, p_test_raw)), 4),
            "roc_auc_calibrated": round(float(roc_auc_score(y_test, p_test_cal)), 4),
            "pr_auc_defaults": round(float(average_precision_score(1 - y_test, 1 - p_test_raw)), 4),
            "brier_score_raw": round(float(brier_score_loss(y_test, p_test_raw)), 4),
            "brier_score": round(float(brier_score_loss(y_test, p_test_cal)), 4),
            "plain_accuracy": round(m_all["acc"] * 100, 2),
            "balanced_accuracy": round(m_all["bal"] * 100, 2),
            "optimal_threshold": round(thr, 4),
            "specificity": round(m_all["spec"] * 100, 2),
            "sensitivity": round(m_all["sens"] * 100, 2),
            "confusion_matrix": m_all["cm"],
            "tier2_only_balanced_accuracy": round(m_t2["bal"] * 100, 2),
            "system_balanced_accuracy": round(m_sys["bal"] * 100, 2),
            "system_confusion_matrix": m_sys["cm"],
            "top10pct_default_capture": round(capture10 * 100, 2),
            "top10pct_lift": round(lift10, 2),
            "training_sample_size": int(len(y_train)),
            "calibration_sample_size": int(len(y_calib)),
            "test_sample_size": int(len(y_test)),
            "unique_vendor_groups": int(len(np.unique(groups))),
            "ensemble_architecture": "LightGBM + Scenario 4 Signals (Tier 1 Statutory Clamps)",
            "probability_calibrated": True,
            "statutory_hierarchy_enabled": True,
            "scenario_4_signals_active": True,
            "feature_importance": dict(zip(
                self.model.feature_name(), [float(v) for v in self.model.feature_importance(importance_type="gain")]
            )),
        }

        out_path = out_path or os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "gst_resolution_lgb.pkl")
        os.makedirs(os.path.dirname(out_path), exist_ok=True)
        joblib.dump(
            {
                "model": self.model, "model_cb": self.model_cb, "model_xgb": self.model_xgb,
                "calibrator": self.calibrator, "metrics": self.model_metrics,
                "optimal_threshold": self.optimal_threshold, "feature_cols": self.feature_cols,
                "blend_weights": self.blend_weights,
            },
            out_path, compress=3,
        )
        print(f"Model saved to {out_path}")

    @classmethod
    def load(cls, path):
        art = joblib.load(path)
        f = cls(exclude_features=art.get("metrics", {}).get("excluded_features", []))
        f.model, f.model_cb, f.model_xgb = art["model"], art.get("model_cb"), art.get("model_xgb")
        f.calibrator = art.get("calibrator")
        f.feature_cols = art.get("feature_cols", f.feature_cols)
        f.blend_weights = art.get("blend_weights") or dict(DEFAULT_WEIGHTS)
        f.optimal_threshold = art.get("optimal_threshold", 0.5)
        f.model_metrics = art.get("metrics", {})
        return f

    def predict_invoice_resolution(
        self,
        total_tax: float,
        filing_lag_median: float,
        is_qrmp: bool,
        days_to_cutoff: float,
        on_time_ratio: float,
        recovery_rate: float,
        discrepancy_type: str = "TIMING_LAG",
        irn_present: bool = True,
        leverage_ratio: float = 0.8,
        filing_pattern: str = "punctual",
        buyer_posted_flag: bool = False,
        is_credit_note: bool = False,
        irn_state: str = None,
        dispute_active: bool = False,
        portal_filing_status: bool = None,
        vendor_acknowledgment: bool = False,
        **kwargs,
    ):
        if days_to_cutoff <= 0:
            return {
                "p_resolution": 0.0,
                "expected_loss_amount": float(total_tax),
                "days_to_statutory_cutoff": int(days_to_cutoff),
                "tier": "TIER_1_STATUTORY_INVARIANT",
                "local_explanation": "Statutory cutoff expired under CGST Act Section 16(4). ITC claim barred by law.",
            }

        state = irn_state or ("PRESENT" if irn_present else "ABSENT_APPLIES")

        if self.model is None:
            p_res = min(0.96, max(0.04, on_time_ratio * (1.1 if is_qrmp else 0.9)))
        else:
            band = "perfect" if on_time_ratio >= 0.90 else ("good" if on_time_ratio > 0.75 else ("mixed" if on_time_ratio > 0.50 else "poor"))
            row = {
                "rupees_at_risk": total_tax,
                "days_to_16_4": days_to_cutoff,
                "irn_present": {"PRESENT": "active", "ABSENT_APPLIES": "absent"}.get(state, "unknown"),
                "buyer_posted_flag": bool(buyer_posted_flag),
                "is_credit_note": bool(is_credit_note),
                "is_format_divergence": discrepancy_type == "TYPO_OR_ROUNDING",
                "leverage_score": leverage_ratio,
                "filing_pattern": filing_pattern,
                "compliance_history_band": band,
                "v_mean_delay": filing_lag_median,
                "v_median_delay": filing_lag_median,
                "v_missed_ratio": max(0.0, 1.0 - on_time_ratio),
                "has_vendor_history": 1,
                "dispute_active": int(bool(dispute_active)),
                "portal_filing_status": int(bool(portal_filing_status)) if portal_filing_status is not None else np.nan,
                "vendor_acknowledgment": int(bool(vendor_acknowledgment)),
                "mismatch_reason_code": 1 if discrepancy_type == "TYPO_OR_ROUNDING" else 0,
            }
            row.update(kwargs)
            features = self.prepare_features(pd.DataFrame([row]))
            p_blended = float(self._blend_predict(features)[0])
            p_res = float(self.calibrator.predict([p_blended])[0]) if self.calibrator is not None else p_blended

        if state == "ABSENT_APPLIES":
            p_res = min(p_res, IRN_ABSENT_CAP)
        if buyer_posted_flag:
            p_res = min(p_res, BUYER_POSTED_CAP)
        if dispute_active:
            p_res = min(p_res, 0.10)

        expected_loss = round(total_tax * (1.0 - p_res), 2)

        if dispute_active:
            explanation = "Elevated risk: Commercial dispute or pending debit note recorded in buyer ERP."
        elif buyer_posted_flag:
            explanation = "Elevated risk: Buyer ERP ledger posted entry without matching vendor GSTR-1 credit."
        elif state == "ABSENT_APPLIES":
            explanation = "Rule 48(4) IRN absent on portal: Elevated default exposure under e-invoicing mandate."
        elif vendor_acknowledgment:
            explanation = f"High resolution confidence ({int(p_res * 100)}%): Vendor confirmed upcoming upload in inquiry response."
        else:
            explanation = f"Calibrated likelihood ({int(p_res * 100)}%) based on vendor filing volatility and statutory buffer."

        return {
            "p_resolution": round(p_res, 3),
            "expected_loss_amount": expected_loss,
            "days_to_statutory_cutoff": int(days_to_cutoff),
            "tier": "TIER_2_CALIBRATED_ML",
            "local_explanation": explanation,
        }


def find_best_training_cohort() -> str:
    here = os.path.dirname(os.path.abspath(__file__))
    workspace_root = os.path.abspath(os.path.join(here, ".."))
    candidates = [
        os.path.join(workspace_root, "one-20261025T162623Z-1-001", "one", "train_corpus.csv"),
        os.path.join(workspace_root, "two-20261025T162624Z-1-001", "two", "train_corpus.csv"),
        os.path.join(workspace_root, "three-20261025T162623Z-1-001", "three", "train_corpus.csv"),
        os.path.join(here, "data", "training_cohort.csv"),
    ]
    for c in candidates:
        if os.path.exists(c):
            return c
    return candidates[-1]


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train the GST resolution forecaster")
    parser.add_argument("--data", help="Path to train_corpus.csv (default: auto-detect)")
    parser.add_argument("--out", help="Where to write the model artifact")
    parser.add_argument("--target-default-recall", type=float, default=None)
    parser.add_argument("--exclude", nargs="*", default=[])
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()

    forecaster = GSTResolutionForecaster(exclude_features=args.exclude)
    cohort_path = args.data or find_best_training_cohort()
    print(f"Selected primary training cohort: {cohort_path}")
    forecaster.train(cohort_path, out_path=args.out,
                     target_default_recall=args.target_default_recall, seed=args.seed)
