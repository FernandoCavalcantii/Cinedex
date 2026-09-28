from app.scripts.person_names import is_numeric_person_name


def test_treats_a_plain_number_as_a_missing_name() -> None:
    assert is_numeric_person_name("0.644")
    assert is_numeric_person_name("1.812")
    assert is_numeric_person_name("0,644")
    assert is_numeric_person_name(" 007 ")
    assert is_numeric_person_name("-0.6")


def test_keeps_a_name_that_only_contains_a_number() -> None:
    assert not is_numeric_person_name("50 Cent")
    assert not is_numeric_person_name("Agent 47")
    assert not is_numeric_person_name("Lana Wachowski")
    assert not is_numeric_person_name(None)
    assert not is_numeric_person_name("")
    assert not is_numeric_person_name("NaN")
