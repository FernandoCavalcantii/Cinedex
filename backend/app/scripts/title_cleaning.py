def normalize_catalog_title(title: str | None) -> str | None:
    """Undo CSV quote escaping on a catalog title.

    A real title that is already wrapped in one pair of quotes, such as
    ``"blessed"``, has no doubled quotes and is left untouched. The outer pair
    is removed only when ``""`` shows the field was escaped on the way in.
    """
    if title is None or '""' not in title:
        return title
    if len(title) >= 2 and title.startswith('"') and title.endswith('"'):
        title = title[1:-1]
    return title.replace('""', '"')


def normalize_catalog_synopsis(synopsis: str | None) -> str | None:
    """Undo CSV quote escaping on a synopsis.

    Titles need one pass. A synopsis was often escaped twice, so ``""`` can
    remain after the first pass. Repeat the same rule until it is gone.
    A synopsis without a doubled quote is left untouched, including one that
    is already wrapped in a single pair of quotes.
    """
    if synopsis is None:
        return None
    seen: set[str] = set()
    while '""' in synopsis and synopsis not in seen:
        seen.add(synopsis)
        cleaned = normalize_catalog_title(synopsis)
        if cleaned is None:
            return synopsis
        synopsis = cleaned
    return synopsis
