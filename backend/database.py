from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from src.core.settings import settings

engine = create_async_engine(settings.DATABASE_URL, echo=True)

AsyncSessions = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

async def get_db():
    async with AsyncSessions() as session:
        yield session