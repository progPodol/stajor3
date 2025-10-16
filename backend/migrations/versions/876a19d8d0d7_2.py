"""2

Revision ID: 876a19d8d0d7
Revises: 6be2669f0cd6
Create Date: 2025-07-08 13:22:21.854321

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '876a19d8d0d7'
down_revision: Union[str, Sequence[str], None] = '6be2669f0cd6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('girls', sa.Column('created_at', sa.DateTime(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('girls', 'created_at')
