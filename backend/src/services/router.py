from typing import List

from fastapi import APIRouter, Depends
from slugify import slugify
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from database import get_db, AsyncSessions
from src.core.settings import settings
from src.girls.models import Girls, Service
from src.girls.schemas import GirlsRead
from src.services.schemas import ServicesCreate, ServicesRead
from src.utils.tools import get_current_superuser

router = APIRouter(tags=['Services'], prefix=settings.api.v1.services)



@router.post('/create', response_model=ServicesRead)
async def create_services(data: ServicesCreate, db: AsyncSessions = Depends(get_db), _: str = Depends(get_current_superuser),):
    slug = slugify(data.name)
    new_services = Service(
        name=data.name,
        name_en=data.name_en,
        slug=slug
    )
    db.add(new_services)
    await db.commit()
    await db.refresh(new_services)

    return new_services



@router.get('/all', response_model=List[ServicesRead])
async def get_all_services(db: AsyncSessions = Depends(get_db)):
    result = await db.execute(select(Service))
    services = result.scalars().all()

    return services

@router.get("/{slug}", response_model=ServicesRead)
async def get_service_with_girls(slug: str, db: AsyncSessions = Depends(get_db)):
    result = await db.execute(
        select(Service)
        .options(
            selectinload(Service.girls)
        )
        .where(Service.slug == slug)
    )
    service = result.scalar_one_or_none()
    if not service:
        return None
    return service
