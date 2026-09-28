"""Cria a tabela de eventos de uso do catálogo.

Revision ID: 0002_catalog_events
Revises: 0001_initial_movie_schema
Create Date: 2026-09-27
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0002_catalog_events"
down_revision: str | Sequence[str] | None = "0001_initial_movie_schema"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "catalog_events",
        sa.Column("sk_event_id", sa.String(64), primary_key=True),
        sa.Column("occurred_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("visitor_id", sa.String(64), nullable=False),
        sa.Column("event_type", sa.String(32), nullable=False),
        sa.Column("sk_movie_id", sa.String(64), nullable=True),
        sa.Column("source", sa.String(32), nullable=True),
        sa.Column("duration_seconds", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(
            ["sk_movie_id"],
            ["dim_movies.sk_movie_id"],
            ondelete="CASCADE",
        ),
    )
    op.create_index("ix_catalog_events_occurred_at", "catalog_events", ["occurred_at"])
    op.create_index("ix_catalog_events_visitor_id", "catalog_events", ["visitor_id"])
    op.create_index("ix_catalog_events_event_type", "catalog_events", ["event_type"])
    op.create_index("ix_catalog_events_sk_movie_id", "catalog_events", ["sk_movie_id"])


def downgrade() -> None:
    op.drop_index("ix_catalog_events_sk_movie_id", table_name="catalog_events")
    op.drop_index("ix_catalog_events_event_type", table_name="catalog_events")
    op.drop_index("ix_catalog_events_visitor_id", table_name="catalog_events")
    op.drop_index("ix_catalog_events_occurred_at", table_name="catalog_events")
    op.drop_table("catalog_events")
