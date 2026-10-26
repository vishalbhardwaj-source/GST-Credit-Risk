import os
import json
from typing import List, Dict, Any, Optional
import httpx
from pydantic import BaseModel

SYSTEM_PROMPT = """You are the **GST Credit-at-Risk Copilot & Tax Compliance Advisor**, an enterprise tax intelligence agent embedded inside a CFO & Tax Operations platform.

### Domain Knowledge & Statutory Framework:
1. **Rule 37A (CGST Rules, 2017)**:
   - Requires recipient taxpayers to reverse Input Tax Credit (ITC) availed if the supplier fails to file their GSTR-3B return by the statutory deadline (November 30th following the end of the financial year).
   - If not reversed before November 30th, the recipient is liable to reverse the tax along with mandatory **18% p.a. interest** under Section 50.
   - Re-availment is allowed once the supplier files the return.

2. **Section 16(2)(aa) Matching Mandate**:
   - ITC is strictly eligible only if the invoice details have been furnished by the supplier in GSTR-1/IFF and communicated to the recipient in **GSTR-2B**.
   - Invoices missing in GSTR-2B cannot be legitimately claimed until reconciled.

3. **B2B e-Invoicing Rule 48(4)**:
   - Mandatory for taxpayers with aggregate turnover exceeding ₹5 Crore.
   - Absence of a statutory 64-character Invoice Reference Number (IRN) / QR code for an e-invoice-applicable vendor renders the document legally invalid for ITC claim.

4. **3-Signal Decision Engine Used by This Platform**:
   - **Signal 1: IRN Applicability** (Is IRN missing? Does the vendor actually meet the ₹5 Cr threshold?).
   - **Signal 2: AP Leverage Ratio** (Pending Accounts Payable due to vendor vs ITC at risk. High leverage enables direct hold).
   - **Signal 3: Vendor Filing History** (Habitual Laggard, Normal/Punctual, or New Anomaly based on past GSTR-1/3B filing track record).
   - **Action Buckets**:
     - *Bucket 1: Direct Payment Hold* (High AP leverage, immediate risk).
     - *Bucket 2: Automated Follow-Up* (Medium risk, automated reminders).
     - *Bucket 3: High-Touch Engagement* (Low leverage or critical supplier, manual CFO intervention).

### Your Capabilities:
- Answer questions on Indian GST laws, GSTR-1/2B/3B reconciliation, Rule 37A clawback, and interest calculations.
- Analyze the user's currently active dashboard data (KPIs, at-risk ITC, top risky vendors, invoice status).
- Draft formal, professional legal/commercial notices to suppliers (email, demand notices, WhatsApp reminders) citing specific invoice details and legal provisions.
- Provide step-by-step guidance on how to avoid ITC clawback and optimize cash flow.

### Formatting Style:
- Professional, structured, and authoritative yet accessible to finance managers and tax teams.
- Use bolding, bullet points, and clean sections.
- When drafting notices, include clear placeholders or use the actual supplier/invoice details provided in the context.
"""

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    provider: str  # "openai", "anthropic", "gemini", "groq"
    model: Optional[str] = None
    apiKey: Optional[str] = None
    messages: List[ChatMessage]
    context: Optional[Dict[str, Any]] = None

def get_server_api_keys() -> Dict[str, bool]:
    """Returns availability of server-configured default API keys."""
    return {
        "gemini": bool(os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")),
        "openai": bool(os.getenv("OPENAI_API_KEY")),
        "anthropic": bool(os.getenv("ANTHROPIC_API_KEY")),
        "groq": bool(os.getenv("GROQ_API_KEY")),
    }

def format_system_prompt_with_context(context: Optional[Dict[str, Any]]) -> str:
    prompt = SYSTEM_PROMPT
    if not context:
        return prompt

    summary_text = "\n\n### Current Active Session Data Context:\n"
    if "total_invoices" in context:
        summary_text += f"- Total Reconciled Invoices: {context.get('total_invoices', 0)}\n"
    if "total_itc" in context:
        summary_text += f"- Total ITC: ₹{context.get('total_itc', 0):,.2f}\n"
    if "at_risk_itc" in context:
        summary_text += f"- Total At-Risk ITC: ₹{context.get('at_risk_itc', 0):,.2f}\n"
    if "days_to_cutoff" in context:
        summary_text += f"- Days to Statutory Rule 37A Cutoff (Nov 30): {context.get('days_to_cutoff')}\n"
    if "bucket_breakdown" in context:
        bb = context.get("bucket_breakdown", {})
        summary_text += f"- Action Buckets: Bucket 1 (Hold): {bb.get('bucket1', 0)}, Bucket 2 (Follow-up): {bb.get('bucket2', 0)}, Bucket 3 (Engage): {bb.get('bucket3', 0)}\n"
    if "top_risky_vendors" in context and context["top_risky_vendors"]:
        summary_text += "- Top At-Risk Vendors:\n"
        for v in context["top_risky_vendors"][:5]:
            summary_text += f"  • {v.get('vendor_name', 'Unknown')} (GSTIN: {v.get('gstin', 'N/A')}): ₹{v.get('at_risk_amount', 0):,.2f} at risk [{v.get('risk_level', 'HIGH')} risk]\n"
    if "selected_invoice" in context and context["selected_invoice"]:
        inv = context["selected_invoice"]
        summary_text += f"- Currently Inspected Invoice in UI: Inv #{inv.get('invoiceNumber', 'N/A')}, Vendor: {inv.get('vendorName', 'N/A')}, Tax: ₹{inv.get('taxAmount', 0):,.2f}, Matched: {inv.get('matched', False)}, IRN Present: {inv.get('irnPresent', False)}\n"

    return prompt + summary_text

async def call_openai(api_key: str, model: str, messages: List[ChatMessage], system_prompt: str) -> str:
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    api_messages = [{"role": "system", "content": system_prompt}]
    for m in messages:
        api_messages.append({"role": m.role, "content": m.content})

    payload = {
        "model": model or "gpt-4o-mini",
        "messages": api_messages,
        "temperature": 0.2,
    }

    async with httpx.AsyncClient(timeout=45.0) as client:
        res = await client.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)
        if res.status_code != 200:
            error_msg = res.text
            try:
                err_json = res.json()
                error_msg = err_json.get("error", {}).get("message", error_msg)
            except Exception:
                pass
            raise ValueError(f"OpenAI API error ({res.status_code}): {error_msg}")
        data = res.json()
        return data["choices"][0]["message"]["content"]

async def call_anthropic(api_key: str, model: str, messages: List[ChatMessage], system_prompt: str) -> str:
    headers = {
        "x-api-key": api_key,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
    }
    anthropic_messages = []
    for m in messages:
        role = "assistant" if m.role == "assistant" else "user"
        anthropic_messages.append({"role": role, "content": m.content})

    payload = {
        "model": model or "claude-3-5-haiku-20241022",
        "max_tokens": 1500,
        "system": system_prompt,
        "messages": anthropic_messages,
        "temperature": 0.2,
    }

    async with httpx.AsyncClient(timeout=45.0) as client:
        res = await client.post("https://api.anthropic.com/v1/messages", headers=headers, json=payload)
        if res.status_code != 200:
            error_msg = res.text
            try:
                err_json = res.json()
                error_msg = err_json.get("error", {}).get("message", error_msg)
            except Exception:
                pass
            raise ValueError(f"Anthropic API error ({res.status_code}): {error_msg}")
        data = res.json()
        # Extract text from content blocks
        text_blocks = [b.get("text", "") for b in data.get("content", []) if b.get("type") == "text"]
        return "".join(text_blocks)

async def call_gemini(api_key: str, model: str, messages: List[ChatMessage], system_prompt: str) -> str:
    gemini_model = model or "gemini-2.5-flash"
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{gemini_model}:generateContent?key={api_key}"

    contents = []
    for m in messages:
        role = "model" if m.role == "assistant" else "user"
        contents.append({
            "role": role,
            "parts": [{"text": m.content}]
        })

    payload = {
        "system_instruction": {
            "parts": [{"text": system_prompt}]
        },
        "contents": contents,
        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": 2048,
        }
    }

    async with httpx.AsyncClient(timeout=45.0) as client:
        res = await client.post(url, json=payload)
        if res.status_code != 200:
            error_msg = res.text
            try:
                err_json = res.json()
                error_msg = err_json.get("error", {}).get("message", error_msg)
            except Exception:
                pass
            raise ValueError(f"Gemini API error ({res.status_code}): {error_msg}")
        data = res.json()
        candidates = data.get("candidates", [])
        if not candidates:
            return "No response generated by Gemini."
        parts = candidates[0].get("content", {}).get("parts", [])
        return "".join([p.get("text", "") for p in parts])

async def call_groq(api_key: str, model: str, messages: List[ChatMessage], system_prompt: str) -> str:
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    api_messages = [{"role": "system", "content": system_prompt}]
    for m in messages:
        api_messages.append({"role": m.role, "content": m.content})

    payload = {
        "model": model or "llama-3.3-70b-versatile",
        "messages": api_messages,
        "temperature": 0.2,
    }

    async with httpx.AsyncClient(timeout=45.0) as client:
        res = await client.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload)
        if res.status_code != 200:
            error_msg = res.text
            try:
                err_json = res.json()
                error_msg = err_json.get("error", {}).get("message", error_msg)
            except Exception:
                pass
            raise ValueError(f"Groq API error ({res.status_code}): {error_msg}")
        data = res.json()
        return data["choices"][0]["message"]["content"]

async def execute_chat(req: ChatRequest) -> str:
    provider = req.provider.lower().strip()
    system_prompt = format_system_prompt_with_context(req.context)

    # Resolve API Key (User key first, then server environment fallback)
    api_key = req.apiKey
    if not api_key:
        if provider == "gemini":
            api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        elif provider in ["openai", "chatgpt"]:
            api_key = os.getenv("OPENAI_API_KEY")
        elif provider in ["anthropic", "claude"]:
            api_key = os.getenv("ANTHROPIC_API_KEY")
        elif provider == "groq":
            api_key = os.getenv("GROQ_API_KEY")

    if not api_key:
        raise ValueError(
            f"No API key provided for {provider.capitalize()}. "
            f"Please enter your {provider.capitalize()} API Key in the chat settings, or configure {provider.upper()}_API_KEY on the server."
        )

    if provider in ["gemini", "google"]:
        return await call_gemini(api_key, req.model or "gemini-2.5-flash", req.messages, system_prompt)
    elif provider in ["anthropic", "claude"]:
        return await call_anthropic(api_key, req.model or "claude-3-5-haiku-20241022", req.messages, system_prompt)
    elif provider in ["openai", "chatgpt"]:
        return await call_openai(api_key, req.model or "gpt-4o-mini", req.messages, system_prompt)
    elif provider == "groq":
        return await call_groq(api_key, req.model or "llama-3.3-70b-versatile", req.messages, system_prompt)
    else:
        raise ValueError(f"Unsupported AI provider: '{provider}'. Supported providers: gemini, openai, claude, groq.")
