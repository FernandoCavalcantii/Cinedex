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
