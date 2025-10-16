import asyncio
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from slugify import slugify
from sqlalchemy import desc
from fastapi.responses import RedirectResponse
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from datetime import datetime
from starlette.requests import Request
from database import get_db, AsyncSessions
from src.core.settings import settings
from src.girls.models import Girls, Service, ModelPhoto
from src.girls.schemas import GirlsRead
from src.utils.tools import process_photo, get_current_superuser, trigger_revalidate


router = APIRouter(tags=['Girls'], prefix=settings.api.v1.girls)


@router.post("/create")
async def create_girl(
        name: str = Form(...),
        name_en: str = Form(...),
        description: str = Form(...),
        description_en: str = Form(...),
        city: str = Form(...),
        city_en: str = Form(...),
        age: int = Form(...),
        price_per_hour: int = Form(...),
        price_per_4: int = Form(...),
        price_per_night: int = Form(...),
        elit: Optional[bool] = Form(False),
        new: Optional[bool] = Form(False),
        indi: Optional[bool] = Form(False),
        verified: Optional[bool] = Form(False),
        height: Optional[int] = Form(170),
        weight: Optional[int] = Form(50),
        boobs: Optional[int] = Form(1),
        service_ids: str = Form(""),
        photos: List[UploadFile] = File(...),
        db: AsyncSessions = Depends(get_db),
        _: str = Depends(get_current_superuser),
):
    base_slug = slugify(f"{name} {city} {price_per_hour}")
    slug = base_slug
    counter = 1
    while True:
        result = await db.execute(select(Girls).where(Girls.slug == slug))
        if result.scalar_one_or_none() is None:
            break
        slug = f"{base_slug}-{counter}"
        counter += 1

    service_ids_list = [int(i) for i in service_ids.split(",") if i.strip()]
    new_girl = Girls(
        name=name,
        name_en=name_en,
        description=description,
        description_en=description_en,
        city=city,
        city_en=city_en,
        age=age,
        price_per_hour=price_per_hour,
        price_per_4=price_per_4,
        price_per_night=price_per_night,
        elit=elit,
        new=new,
        indi=indi,
        height=height,
        weight=weight,
        boobs=boobs,
        slug=slug,
        verified=verified,
        created_at=datetime.utcnow(),
    )

    if service_ids_list:
        services_query = select(Service).where(Service.id.in_(service_ids_list))
        result = await db.execute(services_query)
        services_result = result.scalars().all()
        new_girl.services = services_result

    uploaded_urls = await asyncio.gather(*(process_photo(photo) for photo in photos))
    new_girl.photos = [ModelPhoto(photo_url=url) for url in uploaded_urls]

    db.add(new_girl)

    await db.commit()
    await db.refresh(new_girl)

    return new_girl


@router.post("/admin/create/")
async def create_model(
    name: str = Form(...),
    name_en: str = Form(...),
    city: str = Form(...),
    city_en: str = Form(...),
    age: int = Form(...),
    price_per_hour: int = Form(...),
    price_per_4: int = Form(0),
    price_per_night: int = Form(0),
    description: str = Form(""),
    description_en: str = Form(""),
    role: str = Form(""),
    height: int = Form(170),
    weight: int = Form(50),
    boobs: int = Form(1),
    verified: bool = Form(False),
    service_ids: Optional[List[int]] = Form(None),
    photos: List[UploadFile] = File([]),
    db: AsyncSessions = Depends(get_db), _: str = Depends(get_current_superuser)
):
    base_slug = slugify(f"{name} {city} {price_per_hour}")
    slug = base_slug
    counter = 1
    while True:
        result = await db.execute(select(Girls).where(Girls.slug == slug))
        if result.scalar_one_or_none() is None:
            break
        slug = f"{base_slug}-{counter}"
        counter += 1

    elit = role == "elit"
    new = role == "new"
    indi = role == "indi"
    service_ids_list = service_ids or []

    new_girl = Girls(
        name=name,
        name_en=name_en,
        description=description,
        description_en=description_en,
        city=city,
        city_en=city_en,
        age=age,
        price_per_hour=price_per_hour,
        price_per_4=price_per_4 if price_per_4 > 0 else price_per_hour * 3,
        price_per_night=price_per_night if price_per_night > 0 else price_per_hour * 6,
        elit=elit,
        new=new,
        indi=indi,
        height=height,
        weight=weight,
        boobs=boobs,
        slug=slug,
        verified=verified,
        created_at=datetime.utcnow(),
    )
    if service_ids_list:
        services_query = select(Service).where(Service.id.in_(service_ids_list))
        result = await db.execute(services_query)
        services_result = result.scalars().all()
        new_girl.services = services_result

    if photos and photos[0].filename:
        uploaded_urls = await asyncio.gather(*(process_photo(photo) for photo in photos))
        new_girl.photos = [ModelPhoto(photo_url=url) for url in uploaded_urls]

    db.add(new_girl)
    await db.commit()
    await db.refresh(new_girl)

    # Revalidate impacted service pages if services were selected
    try:
        impacted_slugs = []
        if new_girl.services:
            impacted_slugs = [s.slug for s in new_girl.services if s.slug]
        if impacted_slugs:
            asyncio.create_task(trigger_revalidate(service_slugs=impacted_slugs))
    except Exception:
        pass

    return RedirectResponse(url="/admin/models", status_code=303)

@router.get('/all', response_model=List[GirlsRead])
async def get_all_girls(
        offset: int = Query(0, ge=0),
        limit: int = Query(6, ge=1, le=50),
        db: AsyncSessions = Depends(get_db)
):
    query = (
        select(Girls)
        .options(selectinload(Girls.photos))
        .options(selectinload(Girls.services))
        .order_by(desc(Girls.created_at))
        .offset(offset)
        .limit(limit)
    )
    result = await db.execute(query)
    girls = result.scalars().all()
    return girls

@router.get("/get-by-role/{role}", response_model=List[GirlsRead])
async def get_by_role(
        role: str,
        offset: int = Query(0, ge=0),
        limit: int = Query(6, ge=1, le=50),
        db: AsyncSessions = Depends(get_db),
):
    if role not in ["indi", "new", "elit"]:
        raise HTTPException(status_code=400, detail="Invalid role")

    role_filter = None
    if role == "indi":
        role_filter = Girls.indi.is_(True)
    elif role == "new":
        role_filter = Girls.new.is_(True)
    elif role == "elit":
        role_filter = Girls.elit.is_(True)

    query = (
        select(Girls)
        .options(
            selectinload(Girls.photos),
            selectinload(Girls.services)
        )
        .where(role_filter)
        .order_by(desc(Girls.created_at))
        .offset(offset)
        .limit(limit)
    )

    result = await db.execute(query)
    girls = result.scalars().all()
    return girls

@router.get('/{slug}', response_model=GirlsRead)
async def get_by_slug(slug: str, db: AsyncSessions = Depends(get_db)):
    result = await db.execute(
        select(Girls).where(Girls.slug == slug)
        .options(selectinload(Girls.photos))
        .options(selectinload(Girls.services))
    )
    girls = result.scalars().first()

    if not girls:
        raise HTTPException(status_code=404, detail="Girl not found")

    return girls


@router.post("/{slug}/like")
async def set_like(
    slug: str,
    request: Request,
    db: AsyncSessions = Depends(get_db)
):
    ip = request.client.host
    # Пока без проверки повторных лайков по IP

    result = await db.execute(select(Girls).where(Girls.slug == slug))
    model = result.scalar_one_or_none()

    if not model:
        raise HTTPException(status_code=404, detail="Model not found")

    model.likes = (model.likes or 0) + 1
    await db.commit()
    await db.refresh(model)

    return {"success": True, "likes": model.likes}


@router.get("/by-services/{service_slug}", response_model=List[GirlsRead])
async def get_girls_by_service(
        service_slug: str,
        offset: int = Query(0, ge=0),
        limit: int = Query(6, ge=1, le=50),
        db: AsyncSessions = Depends(get_db),
):
    service_result = await db.execute(
        select(Service).where(Service.slug == service_slug)
    )
    service = service_result.scalar_one_or_none()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    query = (
        select(Girls)
        .join(Girls.services)
        .where(Service.slug == service_slug)
        .options(selectinload(Girls.photos), selectinload(Girls.services))
        .offset(offset)
        .limit(limit)
    )
    result = await db.execute(query)
    girls = result.scalars().all()

    return girls


