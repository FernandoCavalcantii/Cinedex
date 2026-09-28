"""Guarda o termo buscado em catalog_events.

Revision ID: 0003_catalog_event_search
Revises: 0002_catalog_events
Create Date: 2026-09-27
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0003_catalog_event_search"
down_revision: str | Sequence[str] | None = "0002_catalog_events"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("catalog_events", sa.Column("search_term", sa.String(200), nullable=True))
    op.add_column("catalog_events", sa.Column("result_count", sa.Integer(), nullable=True))


def downgrade() -> None:
    op.drop_column("catalog_events", "result_count")
    op.drop_column("catalog_events", "search_term")
