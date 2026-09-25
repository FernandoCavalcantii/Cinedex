from app.scripts.title_cleaning import normalize_catalog_title


def test_keeps_a_title_that_is_already_a_single_quoted_name() -> None:
    assert normalize_catalog_title('"blessed"') == '"blessed"'


def test_unwraps_csv_quotes_and_keeps_the_real_pair() -> None:
    assert normalize_catalog_title('"""blessed"""') == '"blessed"'
    assert normalize_catalog_title('"""truelove: The Film"""') == '"truelove: The Film"'


def test_unwraps_internal_doubled_quotes() -> None:
    assert normalize_catalog_title('"call Sign ""banderas"""') == 'call Sign "banderas"'
    assert (
        normalize_catalog_title('"biography: ""stone Cold"" Steve Austin\'s Last Match"')
        == 'biography: "stone Cold" Steve Austin\'s Last Match'
    )


def test_collapses_a_doubled_quote_that_does_not_wrap_the_title() -> None:
    assert normalize_catalog_title('8\' 19""') == '8\' 19"'


def test_leaves_ordinary_titles_unchanged() -> None:
    assert normalize_catalog_title("Rings") == "Rings"
    assert normalize_catalog_title(None) is None
