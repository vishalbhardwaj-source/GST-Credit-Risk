import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.ai_service import format_system_prompt_with_context

client = TestClient(app)

def test_ai_config_endpoint():
    res = client.get("/api/ai/config")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "online"
    assert "gemini" in data["supported_providers"]
    assert "openai" in data["supported_providers"]
    assert "claude" in data["supported_providers"]
    assert "groq" in data["supported_providers"]
    assert "server_keys" in data

def test_ai_chat_missing_key_validation():
    payload = {
        "provider": "openai",
        "model": "gpt-4o-mini",
        "messages": [{"role": "user", "content": "Hello"}],
    }
    # Unless OPENAI_API_KEY is in env, this should return a clear 400 error about missing key
    res = client.post("/api/ai/chat", json=payload)
    if res.status_code == 400:
        data = res.json()
        assert "API key" in data["detail"]
    else:
        # If server env has key, it returns success
        assert res.status_code in [200, 400]

def test_system_prompt_context_injection():
    context = {
        "total_invoices": 150,
        "total_itc": 450000.0,
        "at_risk_itc": 82000.0,
        "days_to_cutoff": 45,
        "bucket_breakdown": {"bucket1": 10, "bucket2": 5, "bucket3": 2},
        "top_risky_vendors": [
            {"vendor_name": "Apex Infra", "gstin": "27AAACA1234A1Z5", "at_risk_amount": 50000.0, "risk_level": "HIGH"}
        ]
    }
    prompt = format_system_prompt_with_context(context)
    assert "Rule 37A" in prompt
    assert "Apex Infra" in prompt
    assert "450,000" in prompt
    assert "82,000" in prompt
