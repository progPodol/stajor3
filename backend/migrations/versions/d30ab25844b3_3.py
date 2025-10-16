"""3

Revision ID: d30ab25844b3
Revises: 876a19d8d0d7
Create Date: 2025-07-08 16:53:53.028136

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'd30ab25844b3'
down_revision: Union[str, Sequence[str], None] = '876a19d8d0d7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('girls', sa.Column('likes', sa.Integer(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('girls', 'likes')
