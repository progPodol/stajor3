from datetime import datetime
from typing import Optional, List

from fastapi import APIRouter, Request, Depends, HTTPException, Form, UploadFile, File, Response
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.templating import Jinja2Templates
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
import asyncio
from pathlib import Path
from database import AsyncSessions, get_db
from src.auth.models import User
from src.girls.models import Girls, Service, ModelPhoto
from src.utils.tools import process_photo, get_current_superuser, verify_password, create_access_token
from slugify import slugify

from src.managements.models import Sites

BASE_DIR = Path(__file__).resolve().parent.parent
templates = Jinja2Templates(directory=BASE_DIR / "templates")

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/", response_class=HTMLResponse)
async def admin_dashboard(request: Request, _: str = Depends(get_current_superuser)):
    return templates.TemplateResponse("dashboard.html", {
        "request": request,
        "current_year": datetime.now().year
    })


@router.get("/models", response_class=HTMLResponse)
async def admin_models_view(
        request: Request,
        role: Optional[str] = "",
        db: AsyncSessions = Depends(get_db), _: str = Depends(get_current_superuser)
):
    query = select(Girls).options(selectinload(Girls.photos))

    if role == "new":
        query = query.where(Girls.new.is_(True))
    elif role == "elit":
        query = query.where(Girls.elit.is_(True))
    elif role == "indi":
        query = query.where(Girls.indi.is_(True))

    result = await db.execute(query)
    girls = result.scalars().all()

    return templates.TemplateResponse("models.html", {
        "request": request,
        "girls": girls,
        "selected_role": role,
        "current_year": datetime.now().year
    })


@router.get("/models/new", response_class=HTMLResponse)
async def create_model_view(request: Request, db: AsyncSessions = Depends(get_db),
                            _: str = Depends(get_current_superuser)):
    result = await db.execute(select(Service))
    services = result.scalars().all()

    return templates.TemplateResponse("create.html", {
        "request": request,
        "services": services,
        "current_year": datetime.now().year
    })

@router.get("/models/{slug}/edit", response_class=HTMLResponse)
async def edit_model_view(slug: str, request: Request, db: AsyncSessions = Depends(get_db),
                          _: str = Depends(get_current_superuser)):
    result = await db.execute(select(Girls).options(selectinload(Girls.photos)).where(Girls.slug == slug))
    girl = result.scalar_one_or_none()
    if not girl:
        raise HTTPException(status_code=404, detail="Model not found")

    # Загружаем все доступные сервисы
    result_services = await db.execute(select(Service))
    services = result_services.scalars().all()

    return templates.TemplateResponse("edit_model.html", {
        "request": request,
        "girl": girl,
        "services": services,
        "current_year": datetime.now().year
    })
@router.post("/models/{slug}/edit")
async def edit_model_post(
        slug: str,
        name: str = Form(...),
        name_en: str = Form(...),
        city: str = Form(...),
        city_en: str = Form(...),
        age: int = Form(...),
        price_per_hour: int = Form(...),
        price_per_4: int = Form(0),
        price_per_night: int = Form(0),
        role: str = Form(""),
        height: Optional[int] = Form(None),
        weight: Optional[int] = Form(None),
        boobs: Optional[int] = Form(None),
        description: Optional[str] = Form(""),
        description_en: Optional[str] = Form(""),
        verified: Optional[bool] = Form(False),
        service_ids: Optional[List[int]] = Form(None),
        photos: Optional[List[UploadFile]] = File(None),  # новые фото
        db: AsyncSessions = Depends(get_db),
        _: str = Depends(get_current_superuser)
):
    result = await db.execute(select(Girls).options(selectinload(Girls.photos)).where(Girls.slug == slug))
    girl = result.scalar_one_or_none()
    if not girl:
        raise HTTPException(status_code=404, detail="Model not found")

    # обновление всех текстовых и числовых полей
    girl.name = name
    girl.name_en = name_en
    girl.city = city
    girl.city_en = city_en
    girl.age = age
    girl.price_per_hour = price_per_hour
    girl.price_per_4 = price_per_4 or price_per_hour * 4
    girl.price_per_night = price_per_night or price_per_hour * 10
    girl.role = role
    girl.height = height
    girl.weight = weight
    girl.boobs = boobs
    girl.description = description
    girl.description_en = description_en
    girl.verified = verified

    # обновление сервисов
    if service_ids is not None:
        result_services = await db.execute(select(Service).where(Service.id.in_(service_ids)))
        girl.services = result_services.scalars().all()

    # замена фото на новые
    if photos and photos[0].filename:
        # удаляем старые фото
        girl.photos.clear()
        # загружаем новые
        uploaded_urls = await asyncio.gather(*(process_photo(photo) for photo in photos))
        girl.photos = [ModelPhoto(photo_url=url) for url in uploaded_urls]

    db.add(girl)
    await db.commit()
    await db.refresh(girl)

    return RedirectResponse(url="/admin/models", status_code=303)


@router.post("/models/{slug}/delete")
async def delete_model(slug: str, db: AsyncSessions = Depends(get_db), _: str = Depends(get_current_superuser)):
    result = await db.execute(select(Girls).where(Girls.slug == slug))
    girl = result.scalar_one_or_none()

    if not girl:
        raise HTTPException(status_code=404, detail="Model not found")

    await db.delete(girl)
    await db.commit()
    return RedirectResponse(url="/admin/models", status_code=303)


@router.get("/services", response_class=HTMLResponse)
async def admin_services_view(request: Request, db: AsyncSessions = Depends(get_db),
                              _: str = Depends(get_current_superuser)):
    result = await db.execute(select(Service))
    services = result.scalars().all()

    return templates.TemplateResponse("services.html", {
        "request": request,
        "services": services,
        "current_year": datetime.now().year
    })


@router.get("/services/new", response_class=HTMLResponse)
async def create_service_view(request: Request, _: str = Depends(get_current_superuser)):
    return templates.TemplateResponse("create_service.html", {
        "request": request,
        "current_year": datetime.now().year
    })


@router.get("/login", response_class=HTMLResponse)
async def login_form(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})


@router.get("/sites", response_class=HTMLResponse)
async def admin_sites_view(request: Request, db: AsyncSessions = Depends(get_db),
                           _: str = Depends(get_current_superuser)):
    result = await db.execute(select(Sites))
    sites = result.scalars().all()
    return templates.TemplateResponse("sites.html", {
        "request": request,
        "sites": sites,
        "current_year": datetime.now().year
    })


@router.get("/sites/new", response_class=HTMLResponse)
async def create_site_view(request: Request, _: str = Depends(get_current_superuser)):
    return templates.TemplateResponse("create_site.html", {
        "request": request,
        "current_year": datetime.now().year
    })


@router.get("/sites/{site_id}/edit", response_class=HTMLResponse)
async def edit_site_view(site_id: int, request: Request, db: AsyncSessions = Depends(get_db),
                         _: str = Depends(get_current_superuser)):
    result = await db.execute(select(Sites).where(Sites.id == site_id))
    site = result.scalar_one_or_none()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    return templates.TemplateResponse("edit_site.html", {
        "request": request,
        "site": site,
        "current_year": datetime.now().year
    })


@router.post("/sites/edit/{site_id}")
async def edit_site_form(
        site_id: int,
        site_name: str = Form(...),
        telegram: str = Form(...),
        whatsapp: str = Form(...),
        url: str = Form(...),
        image: str = Form(...),
        type: str = Form(...),
        db: AsyncSessions = Depends(get_db)
):
    result = await db.execute(select(Sites).where(Sites.id == site_id))
    site = result.scalar_one_or_none()
    if not site:
        return RedirectResponse(url="/admin/sites", status_code=303)

    site.site_name = site_name
    site.telegram = telegram
    site.whatsapp = whatsapp
    site.url = url
    site.image = image
    site.type = type

    db.add(site)
    await db.commit()
    await db.refresh(site)
    return RedirectResponse(url="/admin/sites", status_code=303)
