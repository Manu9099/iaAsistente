import os
import json
from pathlib import Path
from fastapi import APIRouter
from fastapi.responses import RedirectResponse, JSONResponse
from pydantic import BaseModel
from core.config import settings
import spotipy
from spotipy.oauth2 import SpotifyOAuth

router = APIRouter()

TOKEN_FILE = Path("spotify_token.json")

SCOPES = "user-read-playback-state user-modify-playback-state user-read-currently-playing playlist-read-private"

def get_spotify():
    auth = SpotifyOAuth(
        client_id=settings.SPOTIFY_CLIENT_ID,
        client_secret=settings.SPOTIFY_CLIENT_SECRET,
        redirect_uri=settings.SPOTIFY_REDIRECT_URI,
        scope=SCOPES,
        cache_path=str(TOKEN_FILE)
    )
    token = auth.get_cached_token()
    if not token:
        return None
    if auth.is_token_expired(token):
        token = auth.refresh_access_token(token["refresh_token"])
    return spotipy.Spotify(auth=token["access_token"])

@router.get("/login")
async def spotify_login():
    auth = SpotifyOAuth(
        client_id=settings.SPOTIFY_CLIENT_ID,
        client_secret=settings.SPOTIFY_CLIENT_SECRET,
        redirect_uri=settings.SPOTIFY_REDIRECT_URI,
        scope=SCOPES,
        cache_path=str(TOKEN_FILE)
    )
    auth_url = auth.get_authorize_url()
    return RedirectResponse(auth_url)

@router.get("/callback")
async def spotify_callback(code: str):
    auth = SpotifyOAuth(
        client_id=settings.SPOTIFY_CLIENT_ID,
        client_secret=settings.SPOTIFY_CLIENT_SECRET,
        redirect_uri=settings.SPOTIFY_REDIRECT_URI,
        scope=SCOPES,
        cache_path=str(TOKEN_FILE)
    )
    auth.get_access_token(code)
    return RedirectResponse("http://localhost:3000?spotify=connected")

@router.get("/status")
async def spotify_status():
    sp = get_spotify()
    return {"connected": sp is not None}

class PlayRequest(BaseModel):
    query: str

@router.post("/play")
async def play_song(req: PlayRequest):
    sp = get_spotify()
    if not sp:
        return {"status": "error", "detail": "No autenticado con Spotify"}

    results = sp.search(q=req.query, limit=1, type="track")
    tracks = results["tracks"]["items"]

    if not tracks:
        return {"status": "error", "detail": "No se encontró la canción"}

    track = tracks[0]
    track_uri = track["uri"]

    try:
        sp.start_playback(uris=[track_uri])
        return {
            "status": "reproduciendo",
            "song": track["name"],
            "artist": track["artists"][0]["name"]
        }
    except Exception as e:
        return {"status": "error", "detail": str(e)}

@router.post("/pause")
async def pause():
    sp = get_spotify()
    if not sp:
        return {"status": "error"}
    sp.pause_playback()
    return {"status": "pausado"}

@router.post("/resume")
async def resume():
    sp = get_spotify()
    if not sp:
        return {"status": "error"}
    sp.start_playback()
    return {"status": "reproduciendo"}

@router.post("/next")
async def next_track():
    sp = get_spotify()
    if not sp:
        return {"status": "error"}
    sp.next_track()
    return {"status": "siguiente"}

@router.get("/current")
async def current_track():
    sp = get_spotify()
    if not sp:
        return {"status": "error"}
    current = sp.current_playback()
    if not current or not current.get("item"):
        return {"status": "nada reproduciendo"}
    return {
        "song": current["item"]["name"],
        "artist": current["item"]["artists"][0]["name"],
        "playing": current["is_playing"]
    }