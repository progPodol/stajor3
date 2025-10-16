from src.core.settings import settings
from src.girls.router import router as girls_router
from src.services.router import router as services_router
from src.auth.router import router as user_router
from src.managements.router import router as site_router
from fastapi import APIRouter

router = APIRouter(prefix=settings.api.prefix)

router.include_router(user_router)
router.include_router(site_router)
router.include_router(services_router)
router.include_router(girls_router)