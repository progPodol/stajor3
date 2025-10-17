from sqlalchemy import Integer, String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID as SQLAlchemyUUID
from uuid import UUID

from src.core.base import Base


class Sites(Base):
    __tablename__ = 'sites'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    site_name: Mapped[str] = mapped_column(String, nullable=False)
    whatsapp: Mapped[str] = mapped_column(String, nullable=False)
    telegram: Mapped[str] = mapped_column(String, nullable=False)
    url: Mapped[str] = mapped_column(String, nullable=True)
    image: Mapped[str] = mapped_column(String, nullable=True)
    type: Mapped[str] = mapped_column(String, nullable=True)
    service_id: Mapped[int] = mapped_column(Integer, ForeignKey("services.id"), nullable=True)
    
    # Связь с сервисом
    service: Mapped["Service"] = relationship("Service", back_populates="sites")