from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy import select, update
from database import get_db, AsyncSessions
from src.core.settings import settings
from src.managements.models import Sites
from src.managements.schemas import SiteCreate
from src.utils.tools import get_current_superuser, trigger_revalidate
from fastapi import Form


router = APIRouter(tags=['Sites'], prefix=settings.api.v1.sites)


@router.post('/create')
async def create_services(
    data: SiteCreate,
    db: AsyncSessions = Depends(get_db),
    _: str = Depends(get_current_superuser),
):
    new_sites = Sites(
        site_name=data.site_name,
        telegram=data.telegram,
        whatsapp=data.whatsapp,
        url=data.url,
        image=data.image,
        type=data.type
    )
    db.add(new_sites)
    await db.commit()
    await db.refresh(new_sites)

    return new_sites


@router.get('/all')
async def get_all_info(db: AsyncSessions = Depends(get_db)):
    result = await db.execute(select(Sites))
    sites = result.scalars().all()
    return sites

@router.post('/edit/{site_id}')
async def edit_site_post(
    site_id: int = Path(...),
    site_name: str = Form(...),
    telegram: str = Form(...),
    whatsapp: str = Form(...),
    url: str = Form(...),
    image: str = Form(...),
    type: str = Form(...),
    db: AsyncSessions = Depends(get_db),
    _: str = Depends(get_current_superuser),
):
    result = await db.execute(select(Sites).where(Sites.id == site_id))
    site = result.scalar_one_or_none()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")

    site.site_name = site_name
    site.telegram = telegram
    site.whatsapp = whatsapp
    site.url = url
    site.image = image
    site.type = type

    db.add(site)
    await db.commit()
    await db.refresh(site)

    # Content visible across many pages might change; revalidate all service pages
    try:
        # Best-effort: load all services slugs and revalidate
        from sqlalchemy.future import select as sa_select
        from src.girls.models import Service
        result = await db.execute(sa_select(Service))
        services = result.scalars().all()
        slugs = [s.slug for s in services if s.slug]
        if slugs:
            asyncio.create_task(trigger_revalidate(service_slugs=slugs))
    except Exception:
        pass

    return site