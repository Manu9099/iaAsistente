import os
os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

from fastapi import APIRouter, Request
from fastapi.responses import RedirectResponse
from google_auth_oauthlib.flow import Flow
from core.config import settings

router = APIRouter()

SCOPES = [
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/calendar.events",
]

user_tokens = {}
flow_store = {}

def get_flow():
    return Flow.from_client_config(
        {
            "web": {
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": [settings.GOOGLE_REDIRECT_URI],
            }
        },
        scopes=SCOPES,
        redirect_uri=settings.GOOGLE_REDIRECT_URI,
    )

@router.get("/login")
async def login():
    flow = get_flow()
    auth_url, state = flow.authorization_url(
        prompt="consent",
        access_type="offline",
        include_granted_scopes="true"
    )
    flow_store[state] = flow
    return RedirectResponse(auth_url)

@router.get("/callback")
async def callback(code: str, state: str):
    flow = flow_store.get(state)
    if not flow:
        flow = get_flow()

    flow.fetch_token(code=code)
    credentials = flow.credentials

    user_tokens["default"] = {
        "token": credentials.token,
        "refresh_token": credentials.refresh_token,
        "token_uri": credentials.token_uri,
        "client_id": credentials.client_id,
        "client_secret": credentials.client_secret,
        "scopes": list(credentials.scopes),
    }

    flow_store.pop(state, None)
    return RedirectResponse("http://localhost:3000?auth=success")

@router.get("/status")
async def status():
    return {"authenticated": "default" in user_tokens}

def get_credentials():
    from google.oauth2.credentials import Credentials
    if "default" not in user_tokens:
        return None
    t = user_tokens["default"]
    return Credentials(
        token=t["token"],
        refresh_token=t["refresh_token"],
        token_uri=t["token_uri"],
        client_id=t["client_id"],
        client_secret=t["client_secret"],
        scopes=t["scopes"],
    )