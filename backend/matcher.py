import re
from typing import List, Optional, Tuple
from rapidfuzz import fuzz, utils
from pydantic import BaseModel

class PurchaseInvoice(BaseModel):
    id: str
    invoice_number: str
    invoice_date: str
    vendor_id: str
    vendor_name: str
    gstin: str
    taxable_amount: float
    gst_rate: float
    tax_amount: float
    gross_amount: float

class Gstr2bRecord(BaseModel):
    id: str
    invoice_number: str
    invoice_date: str
    gstin: str
    taxable_amount: float
    tax_amount: float

class MatchResult(BaseModel):
    matched: bool
    confidence: float
    matched_record: Optional[Gstr2bRecord] = None
    explanation: str

def normalize_invoice_str(s: str) -> str:
    """Normalize alphanumeric invoice string in sub-milliseconds."""
    return re.sub(r'[^A-Z0-9]', '', s.upper())

def reconcile_with_rapidfuzz(
    purchase: PurchaseInvoice,
    candidates: List[Gstr2bRecord]
) -> MatchResult:
    """
    RapidFuzz high-throughput matching engine:
    1. Filter candidates by exact GSTIN (zero cross-vendor false positives).
    2. Check exact normalized string equality.
    3. Run RapidFuzz token/ratio metric for noisy OCR/typo discrepancies.
    """
    vendor_candidates = [
        c for c in candidates 
        if c.gstin.strip().upper() == purchase.gstin.strip().upper()
    ]
    
    if not vendor_candidates:
        return MatchResult(
            matched=False,
            confidence=0.0,
            explanation="No GSTR-2B returns filed for supplier GSTIN."
        )

    norm_purchase = normalize_invoice_str(purchase.invoice_number)

    # 1. Exact normalized match with tax threshold tolerance
    for record in vendor_candidates:
        norm_cand = normalize_invoice_str(record.invoice_number)
        tax_diff = abs(record.tax_amount - purchase.tax_amount)
        if norm_purchase == norm_cand and tax_diff <= 1.0:
            is_exact = purchase.invoice_number == record.invoice_number
            return MatchResult(
                matched=True,
                confidence=100.0 if is_exact else 98.0,
                matched_record=record,
                explanation="Exact invoice number and tax match." if is_exact else f"Punctuation/case normalized match ({purchase.invoice_number} vs {record.invoice_number})."
            )

    # 2. RapidFuzz ratio similarity
    best_record = None
    best_score = 0.0

    for record in vendor_candidates:
        norm_cand = normalize_invoice_str(record.invoice_number)
        # Using RapidFuzz normalized ratio
        similarity = fuzz.ratio(norm_purchase, norm_cand, processor=utils.default_process)
        tax_diff = abs(record.tax_amount - purchase.tax_amount)

        if similarity >= 80.0 and tax_diff <= 2.0:
            if similarity > best_score:
                best_score = similarity
                best_record = record

    if best_record and best_score >= 80.0:
        return MatchResult(
            matched=True,
            confidence=round(best_score, 1),
            matched_record=best_record,
            explanation=f"RapidFuzz similarity score {best_score:.1f}% on normalized invoice numbers."
        )

    return MatchResult(
        matched=False,
        confidence=0.0,
        explanation="No matching invoice found in supplier's GSTR-2B."
    )
