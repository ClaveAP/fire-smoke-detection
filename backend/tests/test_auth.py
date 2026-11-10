import base64
import json
import pytest
from unittest.mock import patch
from fastapi import HTTPException

from app.routers import auth
from app.schemas import GoogleAuthRequest


def _create_fake_jwt(payload: dict) -> str:
    header = base64.urlsafe_b64encode(json.dumps({"alg": "RS256", "typ": "JWT"}).encode()).decode().rstrip("=")
    body = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip("=")
    sig = "fake_signature"
    return f"{header}.{body}.{sig}"


def test_google_auth_invalid_format():
    with patch.object(auth.google_id_token, "verify_oauth2_token", side_effect=ValueError("Invalid token format")):
        with pytest.raises(HTTPException) as exc_info:
            auth.google_auth(GoogleAuthRequest(credential="not_a_valid_jwt"))
        assert exc_info.value.status_code == 401


def test_google_auth_dev_fallback_jwt():
    fake_token = _create_fake_jwt({
        "sub": "user_dev_01",
        "email": "dev.operator@safety.aegisflame.id",
        "name": "Dev Operator",
        "picture": "https://example.com/dev.jpg",
    })
    # Signature verification fails, but in dev mode with valid JWT claims, fallback parses claims
    with patch.object(auth.google_id_token, "verify_oauth2_token", side_effect=ValueError("Signature verification failed")):
        data = auth.google_auth(GoogleAuthRequest(credential=fake_token))
        assert data.id == "google-user_dev_01"
        assert data.email == "dev.operator@safety.aegisflame.id"
        assert data.name == "Dev Operator"
        assert data.role == "Operator"


def test_google_auth_supervisor_role_assignment():
    fake_token = _create_fake_jwt({
        "sub": "user_sup_02",
        "email": "supervisor.safety@company.com",
        "name": "Lead Supervisor",
        "picture": "https://example.com/sup.jpg",
    })
    with patch.object(auth.google_id_token, "verify_oauth2_token", side_effect=ValueError("Dev fallback")):
        data = auth.google_auth(GoogleAuthRequest(credential=fake_token))
        assert data.role == "Supervisor K3"
        assert data.roleTitle == "Lead Safety & HSE Officer"


def test_google_auth_verified_with_client_id(monkeypatch):
    monkeypatch.setenv("FSD_GOOGLE_CLIENT_ID", "12345.apps.googleusercontent.com")
    mock_payload = {
        "sub": "prod_123",
        "email": "officer@factory.com",
        "name": "Safety Officer",
        "picture": "https://example.com/officer.jpg",
    }
    with patch.object(auth.google_id_token, "verify_oauth2_token", return_value=mock_payload):
        data = auth.google_auth(GoogleAuthRequest(credential="any_jwt_mock"))
        assert data.id == "google-prod_123"
        assert data.email == "officer@factory.com"
        assert data.role == "Operator"
