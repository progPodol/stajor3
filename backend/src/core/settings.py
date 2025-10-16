import os

from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

class V1Prefix(BaseModel):
    girls: str = '/girls'
    services: str = '/services'
    sites: str = '/sites'
    user: str = '/users'

class ApiPrefix(BaseModel):
    prefix: str = '/api'
    v1: V1Prefix = V1Prefix()

class Settings(BaseModel):
    DATABASE_URL: str = os.getenv("DATABASE_URL")
    SECRET_KEY: str = os.getenv("SECRET_KEY")
    ACCESS_TOKEN_EXPIRE_MINUTES: str = os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES")
    ALGORITHM: str = os.getenv("ALGORITHM")
    FRONTEND_INTERNAL_URL: str = os.getenv("FRONTEND_INTERNAL_URL", "http://frontend:3000")
    REVALIDATE_SECRET: str = os.getenv("REVALIDATE_SECRET", "")

    api: ApiPrefix = ApiPrefix()


settings = Settings()