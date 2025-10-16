"""1

Revision ID: 6be2669f0cd6
Revises: 
Create Date: 2025-07-08 12:21:01.997466

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa



revision: str = '6be2669f0cd6'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table('girls',
    sa.Column('uuid', sa.UUID(), nullable=False),
    sa.Column('name', sa.String(), nullable=False),
    sa.Column('name_en', sa.String(), nullable=False),
    sa.Column('description', sa.String(), nullable=False),
    sa.Column('description_en', sa.String(), nullable=False),
    sa.Column('city', sa.String(), nullable=False),
    sa.Column('city_en', sa.String(), nullable=False),
    sa.Column('age', sa.Integer(), nullable=False),
    sa.Column('price_per_hour', sa.Integer(), nullable=False),
    sa.Column('price_per_4', sa.Integer(), nullable=False),
    sa.Column('price_per_night', sa.Integer(), nullable=False),
    sa.Column('elit', sa.Boolean(), nullable=True),
    sa.Column('new', sa.Boolean(), nullable=True),
    sa.Column('indi', sa.Boolean(), nullable=True),
    sa.Column('verified', sa.Boolean(), nullable=True),
    sa.Column('height', sa.Integer(), nullable=True),
    sa.Column('weight', sa.Integer(), nullable=True),
    sa.Column('boobs', sa.Integer(), nullable=True),
    sa.Column('slug', sa.String(), nullable=False),
    sa.PrimaryKeyConstraint('uuid'),
    sa.UniqueConstraint('slug')
    )
    op.create_table('services',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('name', sa.String(length=100), nullable=False),
    sa.Column('name_en', sa.String(length=100), nullable=False),
    sa.Column('slug', sa.String(), nullable=False),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('slug')
    )
    op.create_table('sites',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('site_name', sa.String(), nullable=False),
    sa.Column('whatsapp', sa.String(), nullable=False),
    sa.Column('telegram', sa.String(), nullable=False),
    sa.Column('url', sa.String(), nullable=True),
    sa.Column('image', sa.String(), nullable=True),
    sa.Column('type', sa.String(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('users',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('username', sa.String(), nullable=False),
    sa.Column('password_hash', sa.String(), nullable=False),
    sa.Column('is_active', sa.Boolean(), nullable=False),
    sa.Column('is_superuser', sa.Boolean(), nullable=False),
    sa.Column('email', sa.String(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    op.create_table('girl_service_association',
    sa.Column('girl_uuid', sa.UUID(), nullable=False),
    sa.Column('service_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['girl_uuid'], ['girls.uuid'], ),
    sa.ForeignKeyConstraint(['service_id'], ['services.id'], ),
    sa.PrimaryKeyConstraint('girl_uuid', 'service_id')
    )
    op.create_table('model_photos',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('model_uuid', sa.UUID(), nullable=False),
    sa.Column('photo_url', sa.String(), nullable=False),
    sa.ForeignKeyConstraint(['model_uuid'], ['girls.uuid'], ),
    sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('model_photos')
    op.drop_table('girl_service_association')
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_table('users')
    op.drop_table('sites')
    op.drop_table('services')
    op.drop_table('girls')
