from uuid import UUID, uuid4
from sqlalchemy.dialects.postgresql import UUID as SQLAlchemyUUID
from sqlalchemy import Table, ForeignKey, String, Integer, Boolean, Column, DateTime, Float
from sqlalchemy.orm import relationship, mapped_column, Mapped
from src.core.base import Base
from datetime import datetime
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from src.managements.models import Sites

girl_service_association = Table(
    "girl_service_association",
    Base.metadata,
    Column("girl_uuid", SQLAlchemyUUID(as_uuid=True), ForeignKey("girls.uuid"), primary_key=True),
    Column("service_id", Integer, ForeignKey("services.id"), primary_key=True),
)


class ModelPhoto(Base):
    __tablename__ = "model_photos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    model_uuid: Mapped[UUID] = mapped_column(SQLAlchemyUUID(as_uuid=True), ForeignKey("girls.uuid"))
    photo_url: Mapped[str] = mapped_column(String, nullable=False)

    model: Mapped["Girls"] = relationship("Girls", back_populates="photos")


class Girls(Base):
    __tablename__ = 'girls'

    uuid: Mapped[UUID] = mapped_column(SQLAlchemyUUID(as_uuid=True), primary_key=True, default=uuid4)
    name: Mapped[str] = mapped_column(String, nullable=False)
    name_en: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(String, nullable=False)
    description_en: Mapped[str] = mapped_column(String, nullable=False)
    city: Mapped[str] = mapped_column(String, nullable=False)
    city_en: Mapped[str] = mapped_column(String, nullable=False)
    age: Mapped[int] = mapped_column(Integer, nullable=False)
    price_per_hour: Mapped[int] = mapped_column(Integer, nullable=False)
    price_per_4: Mapped[int] = mapped_column(Integer, nullable=False)
    price_per_night: Mapped[int] = mapped_column(Integer, nullable=False)
    elit: Mapped[bool] = mapped_column(Boolean, nullable=True)
    new: Mapped[bool] = mapped_column(Boolean, nullable=True)
    indi: Mapped[bool] = mapped_column(Boolean, nullable=True)
    verified: Mapped[bool] = mapped_column(Boolean, nullable=True)
    height: Mapped[int] = mapped_column(Integer, nullable=True)
    weight: Mapped[int] = mapped_column(Integer, nullable=True)
    boobs: Mapped[int] = mapped_column(Integer, nullable=True)
    likes: Mapped[int] = mapped_column(Integer, default=0, nullable=True)
    photos: Mapped[list["ModelPhoto"]] = relationship("ModelPhoto", back_populates="model", cascade="all, delete-orphan")
    slug: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    services: Mapped[list["Service"]] = relationship(
        "Service",
        secondary=girl_service_association,
        back_populates="girls"
    )


class Service(Base):
    __tablename__ = 'services'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    name_en: Mapped[str] = mapped_column(String(100), nullable=False)
    slug: Mapped[str] = mapped_column(String, unique=True)
    girls: Mapped[list["Girls"]] = relationship(
        "Girls",
        secondary=girl_service_association,
        back_populates="services"
    )
    sites: Mapped[list["Sites"]] = relationship("Sites", back_populates="service")
