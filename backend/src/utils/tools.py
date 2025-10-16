import base64
from fastapi import UploadFile
from slugify import slugify
import httpx
from datetime import datetime, timedelta, UTC
import bcrypt
import jwt
from fastapi import Depends, status,Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException

from database import get_db
import asyncio
from src.auth.models import User
from src.core.settings import settings

IMGBB_API_KEY = "d4d6c58e63d037d9c2af5e11cb51db2e"


async def slug_generator(name: str, city: str, age: int) -> str:
    base_slug = f"{name} {city} {age}"
    slug = slugify(base_slug)
    return slug

async def process_photo(photo_file: UploadFile):
    image_bytes = await photo_file.read()
    return await upload_image_to_imgbb(image_bytes)

async def upload_image_to_imgbb(image_bytes: bytes) -> str:
    encoded_image = base64.b64encode(image_bytes).decode('utf-8')
    payload = {"key": IMGBB_API_KEY, "image": encoded_image}

    last_error: Exception | None = None
    for attempt in range(3):
        try:
            async with httpx.AsyncClient(timeout=httpx.Timeout(60.0, connect=10.0)) as client:
                response = await client.post("https://api.imgbb.com/1/upload", data=payload)
            if response.status_code == 200:
                return response.json()["data"]["url"]
            # 5xx or other errors: keep text for diagnostics
            last_error = HTTPException(status_code=500, detail=response.text)
        except Exception as exc:  # timeouts/network
            last_error = exc
        # small backoff before retry
        await asyncio.sleep(1.5 * (attempt + 1))

    # All attempts failed
    if isinstance(last_error, HTTPException):
        raise last_error
    raise HTTPException(status_code=500, detail=f"Image upload failed: {last_error}")


def create_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))


def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=30))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, settings.ALGORITHM)

def get_token(request: Request):
    token = request.cookies.get('access_token')
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Нужно авторизироваться')
    return token

async def get_current_user(token: str = Depends(get_token), db: AsyncSession = Depends(get_db)) -> User:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=402, detail="Пароль или логин не правильный")
        result = await db.execute(select(User).where(User.username == username))
        user = result.scalars().first()
        if user is None:
            raise HTTPException(status_code=402, detail="Такого юзера не существует")
        return user
    except Exception:
        raise HTTPException(status_code=402, detail="Пароль или логин не правильный")




def get_current_superuser(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="У тебя нет доступа к ресурсу, так как ты не админ")
    return current_user


async def trigger_revalidate(
    *,
    path: str | None = None,
    paths: list[str] | None = None,
    service_slug: str | None = None,
    service_slugs: list[str] | None = None,
) -> dict:
    """Call Next.js revalidate API. Requires FRONTEND_INTERNAL_URL and REVALIDATE_SECRET.

    Returns JSON response from frontend, or raises HTTPException on network errors.
    """
    # Send secret redundantly in both header and query to avoid proxy/header quirks
    secret = settings.REVALIDATE_SECRET or ""
    url = f"{settings.FRONTEND_INTERNAL_URL}/api/revalidate"
    if secret:
        joiner = '&' if ('?' in url) else '?'
        url = f"{url}{joiner}secret={secret}"
    payload: dict = {}
    if path:
        payload["path"] = path
    if paths:
        payload["paths"] = paths
    if service_slug:
        payload["serviceSlug"] = service_slug
    if service_slugs:
        payload["serviceSlugs"] = service_slugs

    headers = {
        "Content-Type": "application/json",
        "x-revalidate-secret": secret,
        "Authorization": f"Bearer {secret}" if secret else "",
    }

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(url, json=payload, headers=headers)
            resp.raise_for_status()
            data = resp.json()
            # Background warmup for all revalidated paths to prebuild HTML immediately
            try:
                paths_for_warmup = []
                if isinstance(data, dict) and isinstance(data.get("revalidated"), list):
                    paths_for_warmup = [p for p in data["revalidated"] if isinstance(p, str)]
                if paths_for_warmup:
                    asyncio.create_task(_warmup_pages(paths_for_warmup))
            except Exception:
                pass
            return data
    except httpx.HTTPStatusError as exc:
        # Bubble up with details for admin logs
        raise HTTPException(status_code=exc.response.status_code, detail=f"Revalidate failed: {exc.response.text}")
    except Exception as exc:  # network or unexpected
        raise HTTPException(status_code=500, detail=f"Revalidate request error: {exc}")


async def _warmup_pages(paths: list[str]) -> None:
    """Fire-and-forget GETs to Next.js via nginx to prebuild pages.
    Keeps footprint very low (1 request per path), ignores errors.
    """
    if not paths:
        return
    base = settings.FRONTEND_INTERNAL_URL
    # Prefer nginx if configured
    # If user followed recommendation, FRONTEND_INTERNAL_URL may already be http://nginx:81
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            for p in paths:
                try:
                    url = f"{base}{p}" if base.endswith('/') is False else f"{base[:-1]}{p}"
                    await client.get(url, headers={"x-internal-warmup": "1"})
                except Exception:
                    pass
    except Exception:
        pass

