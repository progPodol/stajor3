from pydantic import BaseModel


class SitesBase(BaseModel):
    site_name: str
    whatsapp: str
    telegram: str
    url: str
    image: str
    type: str

class SiteCreate(SitesBase):
    pass