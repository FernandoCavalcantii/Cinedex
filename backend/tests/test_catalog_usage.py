import pytest

VISITOR = "visitor-test-1"


async def _open(client, movie_id: str, source: str = "discover") -> None:
    response = await client.post(
        "/api/v1/events",
        json={
            "visitor_id": VISITOR,
            "event_type": "detail_open",
            "movie_id": movie_id,
            "source": source,
        },
    )
    assert response.status_code == 204


@pytest.mark.asyncio
async def test_trending_lists_opened_movies_most_viewed_first(client) -> None:
    empty = await client.get("/api/v1/movies", params={"sort": "views"})
    assert empty.status_code == 200
    assert empty.json()["total"] == 0

    await _open(client, "movie-2")
    await _open(client, "movie-2", source="trending")
    await _open(client, "movie-1")

    ranked = await client.get("/api/v1/movies", params={"sort": "views"})
    assert ranked.status_code == 200
    payload = ranked.json()
    assert payload["total"] == 2
    assert [item["titulo"] for item in payload["items"]] == ["Memento", "Matrix"]

    await _open(client, "movie-1")

    tied = await client.get("/api/v1/movies", params={"sort": "views"})
    assert [item["titulo"] for item in tied.json()["items"]] == ["Matrix", "Memento"]

    missing = await client.post(
        "/api/v1/events",
        json={
            "visitor_id": VISITOR,
            "event_type": "detail_open",
            "movie_id": "missing-movie",
            "source": "discover",
        },
    )
    assert missing.status_code == 404

    rejected = await client.post(
        "/api/v1/events",
        json={"visitor_id": VISITOR, "event_type": "movie_created", "movie_id": "movie-1"},
    )
    assert rejected.status_code == 422


@pytest.mark.asyncio
async def test_metrics_count_screen_adds_opens_and_the_admin_feed(client) -> None:
    before = await client.get("/api/v1/admin/metrics")
    assert before.status_code == 200
    baseline = before.json()
    assert baseline["movie_count"] == 2
    assert baseline["movies_added_last_7_days"] == 0
    assert baseline["average_rating"] == 8.5
    assert baseline["most_viewed"] == []
    assert baseline["unreviewed_count"] == 1

    created = await client.post("/api/v1/movies", json={"titulo": "Feed Check"})
    assert created.status_code == 201
    movie_id = created.json()["sk_movie_id"]

    after = await client.get("/api/v1/admin/metrics")
    metrics = after.json()
    assert metrics["movie_count"] == 3
    assert metrics["movies_added_last_7_days"] == 1
    assert metrics["unreviewed_count"] == 2
    assert {genre["nome_genero"]: genre["movie_count"] for genre in metrics["genres"]}["No genre"] == 1

    feed = await client.get("/api/v1/admin/feed")
    assert feed.status_code == 200
    items = feed.json()
    added = [item for item in items if item["kind"] == "added"]
    assert [item["titulo"] for item in added] == ["Feed Check"]
    assert all(item["titulo"] != "Matrix" for item in added)

    await _open(client, movie_id, source="all_movies")
    await _open(client, movie_id, source="metrics")

    viewed = await client.get("/api/v1/admin/metrics")
    most_viewed = viewed.json()["most_viewed"]
    assert most_viewed[0]["titulo"] == "Feed Check"
    assert most_viewed[0]["view_count"] == 2


@pytest.mark.asyncio
async def test_search_events_keep_the_term_and_the_empty_count(client) -> None:
    found = await client.post(
        "/api/v1/events",
        json={
            "visitor_id": VISITOR,
            "event_type": "search",
            "search_term": "Memento",
            "result_count": 1,
        },
    )
    assert found.status_code == 204

    missed = await client.post(
        "/api/v1/events",
        json={
            "visitor_id": VISITOR,
            "event_type": "search",
            "search_term": "zzzz",
            "result_count": 0,
        },
    )
    assert missed.status_code == 204

    response = await client.get("/api/v1/admin/metrics")
    searches = response.json()["top_searches"]
    by_term = {item["search_term"]: item for item in searches}
    assert by_term["Memento"]["search_count"] == 1
    assert by_term["Memento"]["empty_count"] == 0
    assert by_term["zzzz"]["search_count"] == 1
    assert by_term["zzzz"]["empty_count"] == 1
