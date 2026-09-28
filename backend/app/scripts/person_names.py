"""Nomes de pessoa que na verdade são números não entram no catálogo."""

from __future__ import annotations

import re

_NUMERIC_NAME = re.compile(r"^[+-]?(?:\d+(?:[.,]\d+)?|[.,]\d+)$")


def is_numeric_person_name(value: str | None) -> bool:
    if value is None:
        return False
    return _NUMERIC_NAME.fullmatch(value.strip()) is not None
