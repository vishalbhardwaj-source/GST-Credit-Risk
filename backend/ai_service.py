import os
import json
from typing import List, Dict, Any, Optional, AsyncGenerator
import httpx
from pydantic import BaseModel

SYSTEM_PROMPT = """You are the **GST Credit-at-Risk Copilot & Tax Advisor**, an expert tax assistant for Indian businesses.

### Key Rules & Regulations:
1. **Rule 37A (CGST Rules, 2017)**: Recipient must reverse ITC if supplier fails to file GSTR-3B by November 30 following financial year end. Missing this deadline incurs mandatory **18% p.a. interest** under Section 50.
2. **Section 16(2)(aa)**: ITC is strictly claimable only if details appear in recipient's **GSTR-2B**.
3. **e-Invoicing Rule 48(4)**: Mandatory for turnover > ₹5 Crore. Invoices without 64-char IRN / QR code are legally invalid for ITC claim.
4. **3-Signal Engine**:
   - Signal 1: IRN Applicability (Threshold check).
   - Signal 2: AP Leverage Ratio (Payables held vs ITC at risk).
   - Signal 3: Vendor Filing History (Habitual Laggard, Normal, New Anomaly).
   - Buckets: Bucket 1 (Direct Payment Hold), Bucket 2 (Automated Follow-Up), Bucket 3 (High-Touch CFO Engagement).

Provide direct, structured, authoritative responses with clean markdown bullet points and clear takeaways.
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

    summary_text = "\n### Current Session Context:\n"
    if "total_invoices" in context:
        summary_text += f"- Invoices: {context.get('total_invoices', 0)}\n"
    if "total_itc" in context:
        summary_text += f"- Total ITC: ₹{context.get('total_itc', 0):,.2f}\n"
    if "at_risk_itc" in context:
        summary_text += f"- At-Risk ITC: ₹{context.get('at_risk_itc', 0):,.2f}\n"
    if "bucket_breakdown" in context:
        bb = context.get("bucket_breakdown", {})
        summary_text += f"- Buckets: Hold={bb.get('bucket1', 0)}, Follow-up={bb.get('bucket2', 0)}, Engage={bb.get('bucket3', 0)}\n"
    if "top_risky_vendors" in context and context["top_risky_vendors"]:
        summary_text += "- Top Risky Vendors:\n"
        for v in context["top_risky_vendors"][:5]:
            summary_text += f"  • {v.get('vendor_name', 'Unknown')}: ₹{v.get('at_risk_amount', 0):,.2f} at risk\n"
    if "selected_invoice" in context and context["selected_invoice"]:
        inv = context["selected_invoice"]
        summary_text += f"- Focus Invoice #{inv.get('invoiceNumber', 'N/A')} ({inv.get('vendorName', 'N/A')}), Tax: ₹{inv.get('taxAmount', 0):,.2f}, Matched: {inv.get('matched', False)}\n"

    return prompt + summary_text

def resolve_api_key(provider: str, user_key: Optional[str]) -> str:
    if user_key and user_key.strip():
        return user_key.strip()
    p = provider.lower().strip()
    if p in ["gemini", "google"]:
        key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    elif p in ["openai", "chatgpt"]:
        key = os.getenv("OPENAI_API_KEY")
    elif p in ["anthropic", "claude"]:
        key = os.getenv("ANTHROPIC_API_KEY")
    elif p == "groq":
        key = os.getenv("GROQ_API_KEY")
    else:
        key = None

    if not key:
        raise ValueError(
            f"No API key provided for {provider.capitalize()}. "
            f"Please enter your API Key in the chat settings."
        )
    return key

async def stream_gemini(api_key: str, model: str, messages: List[ChatMessage], system_prompt: str) -> AsyncGenerator[str, None]:
    gemini_model = model or "gemini-3.8-flash"
    if gemini_model == "gemini-2.5-flash":
        gemini_model = "gemini-3.8-flash"

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{gemini_model}:streamGenerateContent?alt=sse&key={api_key}"

    contents = []
    for m in messages:
        role = "model" if m.role == "assistant" else "user"
        contents.append({
            "role": role,
            "parts": [{"text": m.content}]
        })

    payload = {
        "system_instruction": {"parts": [{"text": system_prompt}]},
        "contents": contents,
        "generationConfig": {"temperature": 0.2, "maxOutputTokens": 1500}
    }

    async with httpx.AsyncClient(timeout=25.0) as client:
        async with client.stream("POST", url, json=payload) as response:
            if response.status_code != 200:
                err_text = await response.aread()
                try:
                    err_json = json.loads(err_text)
                    msg = err_json.get("error", {}).get("message", err_text.decode("utf-8", errors="ignore"))
                except Exception:
                    msg = err_text.decode("utf-8", errors="ignore")
                raise ValueError(f"Gemini API error ({response.status_code}): {msg}")

            async for line in response.aiter_lines():
                if line.startswith("data: "):
                    json_str = line[6:].strip()
                    if json_str == "[DONE]":
                        break
                    try:
                        parsed = json.loads(json_str)
                        candidates = parsed.get("candidates", [])
                        if candidates:
                            parts = candidates[0].get("content", {}).get("parts", [])
                            for part in parts:
                                text = part.get("text", "")
                                if text:
                                    yield f"data: {json.dumps({'text': text})}\n\n"
                    except Exception:
                        continue
    yield "data: [DONE]\n\n"

async def stream_openai_compatible(url: str, api_key: str, model: str, messages: List[ChatMessage], system_prompt: str) -> AsyncGenerator[str, None]:
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    api_messages = [{"role": "system", "content": system_prompt}]
    for m in messages:
        api_messages.append({"role": m.role, "content": m.content})

    payload = {
        "model": model,
        "messages": api_messages,
        "temperature": 0.2,
        "stream": True,
    }

    async with httpx.AsyncClient(timeout=25.0) as client:
        async with client.stream("POST", url, headers=headers, json=payload) as response:
            if response.status_code != 200:
                err_text = await response.aread()
                raise ValueError(f"API error ({response.status_code}): {err_text.decode('utf-8', errors='ignore')}")

            async for line in response.aiter_lines():
                if line.startswith("data: "):
                    json_str = line[6:].strip()
                    if json_str == "[DONE]":
                        break
                    try:
                        parsed = json.loads(json_str)
                        delta = parsed.get("choices", [{}])[0].get("delta", {})
                        content = delta.get("content", "")
                        if content:
                            yield f"data: {json.dumps({'text': content})}\n\n"
                    except Exception:
                        continue
    yield "data: [DONE]\n\n"

async def stream_anthropic(api_key: str, model: str, messages: List[ChatMessage], system_prompt: str) -> AsyncGenerator[str, None]:
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
        "stream": True,
    }

    async with httpx.AsyncClient(timeout=25.0) as client:
        async with client.stream("POST", "https://api.anthropic.com/v1/messages", headers=headers, json=payload) as response:
            if response.status_code != 200:
                err_text = await response.aread()
                try:
                    err_json = json.loads(err_text)
                    msg = err_json.get("error", {}).get("message", err_text.decode("utf-8", errors="ignore"))
                except Exception:
                    msg = err_text.decode("utf-8", errors="ignore")
                raise ValueError(f"Anthropic API error ({response.status_code}): {msg}")

            async for line in response.aiter_lines():
                if line.startswith("data: "):
                    json_str = line[6:].strip()
                    try:
                        parsed = json.loads(json_str)
                        evt_type = parsed.get("type")
                        if evt_type == "content_block_delta":
                            delta = parsed.get("delta", {})
                            text = delta.get("text", "")
                            if text:
                                yield f"data: {json.dumps({'text': text})}\n\n"
                        elif evt_type == "message_stop":
                            break
                    except Exception:
                        continue
    yield "data: [DONE]\n\n"

async def stream_chat(req: ChatRequest) -> AsyncGenerator[str, None]:
    provider = req.provider.lower().strip()
    api_key = resolve_api_key(provider, req.apiKey)
    system_prompt = format_system_prompt_with_context(req.context)

    if provider in ["gemini", "google"]:
        async for chunk in stream_gemini(api_key, req.model or "gemini-3.8-flash", req.messages, system_prompt):
            yield chunk
    elif provider in ["openai", "chatgpt"]:
        async for chunk in stream_openai_compatible("https://api.openai.com/v1/chat/completions", api_key, req.model or "gpt-4o-mini", req.messages, system_prompt):
            yield chunk
    elif provider in ["anthropic", "claude"]:
        async for chunk in stream_anthropic(api_key, req.model or "claude-3-5-haiku-20241022", req.messages, system_prompt):
            yield chunk
    elif provider == "groq":
        async for chunk in stream_openai_compatible("https://api.groq.com/openai/v1/chat/completions", api_key, req.model or "llama-3.3-70b-versatile", req.messages, system_prompt):
            yield chunk
    else:
        raise ValueError(f"Unsupported AI provider: {provider}")

async def execute_chat(req: ChatRequest) -> str:
    chunks = []
    async for chunk_str in stream_chat(req):
        if chunk_str.startswith("data: ") and not chunk_str.startswith("data: [DONE]"):
            try:
                data = json.loads(chunk_str[6:].strip())
                chunks.append(data.get("text", ""))
            except Exception:
                pass
    return "".join(chunks)
