import os
import json
from pathlib import Path
from fastapi import APIRouter
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
import msal
import httpx
from core.config import settings

router = APIRouter()

TOKEN_FILE = Path("microsoft_token.json")
user_tokens = {}

if TOKEN_FILE.exists():
    user_tokens = json.loads(TOKEN_FILE.read_text())

SCOPES = ["Mail.Send", "Mail.Read", "User.Read"]

def get_msal_app():
    return msal.ConfidentialClientApplication(
        settings.MICROSOFT_CLIENT_ID,
        authority="https://login.microsoftonline.com/common",
        client_credential=settings.MICROSOFT_CLIENT_SECRET,
    )

@router.get("/login")
async def microsoft_login():
    app = get_msal_app()
    auth_url = app.get_authorization_request_url(
        SCOPES,
        redirect_uri=settings.MICROSOFT_REDIRECT_URI
    )
    return RedirectResponse(auth_url)

@router.get("/callback")
async def microsoft_callback(code: str):
    app = get_msal_app()
    result = app.acquire_token_by_authorization_code(
        code,
        scopes=SCOPES,
        redirect_uri=settings.MICROSOFT_REDIRECT_URI
    )
    if "access_token" in result:
        user_tokens["default"] = result
        TOKEN_FILE.write_text(json.dumps(user_tokens))
        return RedirectResponse("http://localhost:3000?microsoft=connected")
    return {"error": result.get("error_description")}

@router.get("/status")
async def microsoft_status():
    return {"authenticated": "default" in user_tokens}

def get_access_token():
    if "default" not in user_tokens:
        return None
    token_data = user_tokens["default"]
    if "refresh_token" in token_data:
        app = get_msal_app()
        result = app.acquire_token_by_refresh_token(
            token_data["refresh_token"],
            scopes=SCOPES
        )
        if "access_token" in result:
            user_tokens["default"] = result
            TOKEN_FILE.write_text(json.dumps(user_tokens))
            return result["access_token"]
    return token_data.get("access_token")

class OutlookEmailRequest(BaseModel):
    to: str
    subject: str
    body: str

@router.post("/send")
async def send_outlook_email(req: OutlookEmailRequest):
    token = get_access_token()
    if not token:
        return {"status": "error", "detail": "No autenticado con Microsoft"}

    email_data = {
        "message": {
            "subject": req.subject,
            "body": {"contentType": "Text", "content": req.body},
            "toRecipients": [{"emailAddress": {"address": req.to}}]
        }
    }

    async with httpx.AsyncClient() as client:
        res = await client.post(
            "https://graph.microsoft.com/v1.0/me/sendMail",
            json=email_data,
            headers={"Authorization": f"Bearer {token}"}
        )

    if res.status_code == 202:
        return {"status": "enviado", "to": req.to}
    return {"status": "error", "detail": res.text}

@router.get("/inbox")
async def get_outlook_inbox():
    token = get_access_token()
    if not token:
        return {"status": "error", "detail": "No autenticado con Microsoft"}

    async with httpx.AsyncClient() as client:
        res = await client.get(
            "https://graph.microsoft.com/v1.0/me/messages?$top=5&$orderby=receivedDateTime desc",
            headers={"Authorization": f"Bearer {token}"}
        )

    data = res.json()
    messages = []
    for msg in data.get("value", []):
        messages.append({
            "id": msg["id"],
            "from": msg["from"]["emailAddress"]["address"],
            "subject": msg["subject"],
            "date": msg["receivedDateTime"]
        })
    return messages