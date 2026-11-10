"""Google OAuth token verification endpoint."""

import base64
import json
import logging
from typing import Optional

from fastapi import APIRouter, HTTPException
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token

from ..config import Settings
from ..schemas import GoogleAuthRequest, UserProfileResponse

logger = logging.getLogger(__name__)
router = APIRouter(tags=["auth"])


class FastTimeoutRequest(google_requests.Request):
    """Google requests wrapper that enforces a short timeout (3s) to prevent hanging."""
    def __call__(self, url, method="GET", body=None, headers=None, timeout=3, **kwargs):
        return super().__call__(url, method=method, body=body, headers=headers, timeout=timeout, **kwargs)


def _decode_unverified_payload(credential: str) -> dict:
    """Fallback decoder for token claims without signature verification."""
    parts = credential.split(".")
    if len(parts) < 2:
        raise ValueError("Invalid JWT format: expected at least 2 dot-separated parts")
    payload_b64 = parts[1]
    # Add padding if necessary
    rem = len(payload_b64) % 4
    if rem > 0:
        payload_b64 += "=" * (4 - rem)
    decoded_bytes = base64.urlsafe_b64decode(payload_b64.encode("utf-8"))
    return json.loads(decoded_bytes.decode("utf-8"))


@router.post("/auth/google", response_model=UserProfileResponse)
def google_auth(payload: GoogleAuthRequest):
    """
    Verify a Google ID Token (JWT credential from Google Identity Services).

    In production: Validates signature with Google public keys and audience against FSD_GOOGLE_CLIENT_ID.
    In development: If FSD_GOOGLE_CLIENT_ID is not configured or Google servers are unreachable,
    extracts verified/unverified claims with warning to allow smooth local testing.
    """
    import os
    import requests

    client_id = os.getenv("FSD_GOOGLE_CLIENT_ID", "").strip()
    idinfo = None

    # Custom requests session with 5s timeout to prevent hanging on network issues
    session = requests.Session()
    adapter = requests.adapters.HTTPAdapter(max_retries=1)
    session.mount("https://", adapter)
    session.mount("http://", adapter)
    request_transport = FastTimeoutRequest(session=session)

    try:
        if client_id:
            idinfo = google_id_token.verify_oauth2_token(
                payload.credential,
                request_transport,
                client_id,
            )
        else:
            # Without client_id, verify signature without audience check
            idinfo = google_id_token.verify_oauth2_token(
                payload.credential,
                request_transport,
            )
            logger.info("Token signature verified successfully (audience check skipped in dev mode)")
    except ValueError as exc:
        logger.warning("Google token verification failed: %s", exc)
        # In dev mode without client_id, if format is valid JWT, fall back to payload decode for testing
        if not client_id:
            try:
                idinfo = _decode_unverified_payload(payload.credential)
                logger.warning(
                    "FSD_GOOGLE_CLIENT_ID not set and signature verification failed — "
                    "using decoded JWT claims for local development only: email=%s",
                    idinfo.get("email"),
                )
            except Exception:
                raise HTTPException(status_code=401, detail=f"Invalid Google token: {exc}")
        else:
            raise HTTPException(status_code=401, detail=f"Invalid Google token: {exc}")
    except Exception as exc:
        logger.warning("Network or verification error verifying Google token: %s", exc)
        # If network error in dev mode, fallback to payload decode
        if not client_id:
            try:
                idinfo = _decode_unverified_payload(payload.credential)
                logger.warning(
                    "Google certs unreachable — decoded token payload for local testing: email=%s",
                    idinfo.get("email"),
                )
            except Exception:
                raise HTTPException(status_code=401, detail="Google token verification unreachable and token invalid")
        else:
            raise HTTPException(status_code=500, detail="Google token verification service error")

    if not idinfo:
        raise HTTPException(status_code=401, detail="Failed to parse user profile from Google token")

    email = idinfo.get("email", "")
    name = idinfo.get("name", email.split("@")[0] if email else "Operator")
    picture = idinfo.get("picture", "")
    google_sub = idinfo.get("sub", "unknown")

    # Determine role (default: Operator, supervisor if email contains 'supervisor' or 'hse')
    role = "Supervisor K3" if ("supervisor" in email.lower() or "hse" in email.lower()) else "Operator"
    role_title = "Lead Safety & HSE Officer" if role == "Supervisor K3" else "Operator Jaga Shift 1"

    return UserProfileResponse(
        id=f"google-{google_sub}",
        name=name,
        email=email,
        avatar=picture or "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80",
        role=role,
        roleTitle=role_title,
    )
