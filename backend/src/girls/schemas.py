from pydantic import BaseModel, HttpUrl
from typing import List, Optional

class ModelPhotoRead(BaseModel):
    photo_url: HttpUrl

    class Config:
        orm_mode = True

class ServiceRead(BaseModel):
    name: str
    name_en: str

    class Config:
        orm_mode = True

class LikeRequest(BaseModel):
    slug: str

class GirlsRead(BaseModel):
    name: str
    name_en: str
    description: str
    likes: int
    description_en: str
    city: str
    city_en: str
    age: int
    price_per_hour: int
    price_per_4: int
    price_per_night: int
    elit: Optional[bool] = False
    new: Optional[bool] = False
    indi: Optional[bool] = False
    verified: Optional[bool] = False
    height: Optional[int]
    weight: Optional[int]
    boobs: Optional[int]
    slug: str
    photos: List[ModelPhotoRead]
    services: List[ServiceRead]

    class Config:
        orm_mode = True
