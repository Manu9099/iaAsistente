from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from googleapiclient.discovery import build
from api.routes.auth import get_credentials
import base64
from email.mime.text import MIMEText
from datetime import datetime, timedelta

router = APIRouter()

class EmailRequest(BaseModel):
    to: str
    subject: str
    body: str

class EventRequest(BaseModel):
    title: str
    date: str
    time: str
    duration_hours: int = 1
    description: str = ""

@router.post("/gmail/send")
async def send_email(req: EmailRequest):
    creds = get_credentials()
    if not creds:
        raise HTTPException(status_code=401, detail="No autenticado con Google")

    service = build("gmail", "v1", credentials=creds)

    message = MIMEText(req.body)
    message["to"] = req.to
    message["subject"] = req.subject

    encoded = base64.urlsafe_b64encode(message.as_bytes()).decode()
    service.users().messages().send(
        userId="me",
        body={"raw": encoded}
    ).execute()

    return {"status": "enviado", "to": req.to}

@router.get("/gmail/inbox")
async def get_inbox():
    creds = get_credentials()
    if not creds:
        raise HTTPException(status_code=401, detail="No autenticado con Google")

    service = build("gmail", "v1", credentials=creds)
    results = service.users().messages().list(
        userId="me", maxResults=5, labelIds=["INBOX"]
    ).execute()

    messages = []
    for msg in results.get("messages", []):
        detail = service.users().messages().get(
            userId="me", id=msg["id"], format="metadata",
            metadataHeaders=["From", "Subject", "Date"]
        ).execute()
        headers = {h["name"]: h["value"] for h in detail["payload"]["headers"]}
        messages.append({
            "id": msg["id"],
            "from": headers.get("From", ""),
            "subject": headers.get("Subject", ""),
            "date": headers.get("Date", "")
        })

    return messages

@router.post("/calendar/event")
async def create_event(req: EventRequest):
    creds = get_credentials()
    if not creds:
        raise HTTPException(status_code=401, detail="No autenticado con Google")

    service = build("calendar", "v3", credentials=creds)

    start = datetime.strptime(f"{req.date} {req.time}", "%Y-%m-%d %H:%M")
    end = start + timedelta(hours=req.duration_hours)

    event = {
        "summary": req.title,
        "description": req.description,
        "start": {"dateTime": start.isoformat(), "timeZone": "America/Lima"},
        "end": {"dateTime": end.isoformat(), "timeZone": "America/Lima"},
    }

    result = service.events().insert(calendarId="primary", body=event).execute()
    return {"status": "creado", "link": result.get("htmlLink")}
 


@router.get("/calendar/events")
async def get_events():
    creds = get_credentials()
    if not creds:
        raise HTTPException(status_code=401, detail="No autenticado con Google")

    service = build("calendar", "v3", credentials=creds)
    now = datetime.utcnow().isoformat() + "Z"

    results = service.events().list(
        calendarId="primary",
        timeMin=now,
        maxResults=5,
        singleEvents=True,
        orderBy="startTime"
    ).execute()

    events = []
    for e in results.get("items", []):
        events.append({
            "title": e.get("summary", "Sin título"),
            "start": e["start"].get("dateTime", e["start"].get("date")),
            "link": e.get("htmlLink", "")
        })


    return events
   
class ReplyRequest(BaseModel):
    thread_id: str
    message_id: str
    to: str
    subject: str
    body: str

@router.post("/gmail/reply")
async def reply_email(req: ReplyRequest):
    creds = get_credentials()
    if not creds:
        raise HTTPException(status_code=401, detail="No autenticado con Google")

    service = build("gmail", "v1", credentials=creds)

    message = MIMEText(req.body)
    message["to"] = req.to
    message["subject"] = f"Re: {req.subject}"
    message["In-Reply-To"] = req.message_id
    message["References"] = req.message_id

    encoded = base64.urlsafe_b64encode(message.as_bytes()).decode()

    service.users().messages().send(
        userId="me",
        body={
            "raw": encoded,
            "threadId": req.thread_id
        }
    ).execute()

    return {"status": "respondido", "to": req.to}


@router.get("/gmail/search")
async def search_emails(query: str):
    creds = get_credentials()
    if not creds:
        raise HTTPException(status_code=401, detail="No autenticado con Google")

    service = build("gmail", "v1", credentials=creds)
    results = service.users().messages().list(
        userId="me", maxResults=5, q=query
    ).execute()

    messages = []
    for msg in results.get("messages", []):
        detail = service.users().messages().get(
            userId="me", id=msg["id"], format="metadata",
            metadataHeaders=["From", "Subject", "Date"]
        ).execute()
        headers = {h["name"]: h["value"] for h in detail["payload"]["headers"]}
        messages.append({
            "id": msg["id"],
            "thread_id": detail["threadId"],
            "from": headers.get("From", ""),
            "subject": headers.get("Subject", ""),
            "date": headers.get("Date", "")
        })

    return messages

@router.get("/gmail/read/{message_id}")
async def read_email(message_id: str):
    creds = get_credentials()
    if not creds:
        raise HTTPException(status_code=401, detail="No autenticado con Google")

    service = build("gmail", "v1", credentials=creds)
    detail = service.users().messages().get(
        userId="me", id=message_id, format="full"
    ).execute()

    headers = {h["name"]: h["value"] for h in detail["payload"]["headers"]}
    
    body = ""
    payload = detail.get("payload", {})
    if "parts" in payload:
        for part in payload["parts"]:
            if part["mimeType"] == "text/plain":
                import base64
                data = part["body"].get("data", "")
                if data:
                    body = base64.urlsafe_b64decode(data).decode("utf-8", errors="ignore")
                    break
    elif "body" in payload:
        import base64
        data = payload["body"].get("data", "")
        if data:
            body = base64.urlsafe_b64decode(data).decode("utf-8", errors="ignore")

    return {
        "id": message_id,
        "thread_id": detail["threadId"],
        "from": headers.get("From", ""),
        "to": headers.get("To", ""),
        "subject": headers.get("Subject", ""),
        "date": headers.get("Date", ""),
        "body": body[:2000]
    }