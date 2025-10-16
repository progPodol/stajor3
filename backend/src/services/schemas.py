from pydantic import BaseModel


class ServicesBase(BaseModel):
    id: int
    name_en: str
    slug: str
    name: str

class ServicesRead(BaseModel):
    name: str
    name_en: str
    slug: str

class ServicesCreate(BaseModel):
    name: str
    name_en: str