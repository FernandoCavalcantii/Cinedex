from app.scripts.title_cleaning import normalize_catalog_synopsis, normalize_catalog_title


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


def test_unwraps_a_synopsis_that_quotes_its_own_title() -> None:
    raw = '"""Truelove: The Film"" is a documentary feature film following Callie Truelove'
    assert (
        normalize_catalog_synopsis(raw)
        == '"Truelove: The Film" is a documentary feature film following Callie Truelove'
    )


def test_unwraps_a_synopsis_escaped_twice_and_wrapped() -> None:
    raw = '"""Laughumentary"" about black comedians in Hollywood."'
    assert normalize_catalog_synopsis(raw) == '"Laughumentary" about black comedians in Hollywood.'


def test_unwraps_internal_quotes_and_drops_the_csv_wrapper() -> None:
    raw = '"Julia discovers a ""movie within the movie"" that no one has seen."'
    assert normalize_catalog_synopsis(raw) == 'Julia discovers a "movie within the movie" that no one has seen.'


def test_leaves_a_synopsis_without_escaped_quotes_unchanged() -> None:
    assert normalize_catalog_synopsis("A hacker discovers reality is simulated.") == (
        "A hacker discovers reality is simulated."
    )
    assert normalize_catalog_synopsis('"blessed"') == '"blessed"'
    assert normalize_catalog_synopsis("Sem descrição") == "Sem descrição"
    assert normalize_catalog_synopsis(None) is None
