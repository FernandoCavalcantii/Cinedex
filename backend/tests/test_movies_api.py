import pytest


@pytest.mark.asyncio
async def test_list_movies_supports_pagination_and_search(client) -> None:
    response = await client.get("/api/v1/movies", params={"skip": 0, "limit": 1})

    assert response.status_code == 200
    payload = response.json()
    assert payload["total"] == 2
    assert payload["limit"] == 1
    assert payload["skip"] == 0
    assert payload["has_more"] is True
    assert len(payload["items"]) == 1

    response = await client.get("/api/v1/movies", params={"search": "Memento"})

    assert response.status_code == 200
    payload = response.json()
    assert payload["total"] == 1
    assert payload["items"][0]["titulo"] == "Memento"


@pytest.mark.asyncio
async def test_movie_detail_includes_reviews_and_summary(client) -> None:
    response = await client.get("/api/v1/movies/movie-1")

    assert response.status_code == 200
    payload = response.json()
    assert payload["titulo"] == "Matrix"
    assert payload["review_count"] == 2
    assert payload["average_rating"] == 8.5
    assert len(payload["genres"]) == 2
    assert len(payload["companies"]) == 1
    assert len(payload["people"]) == 2
    assert len(payload["reviews"]) == 2


@pytest.mark.asyncio
async def test_create_review_updates_summary(client) -> None:
    response = await client.post(
        "/api/v1/reviews",
        json={
            "movie_id": "movie-2",
            "nome": "Carla",
            "nota": 9.5,
            "comentario": "Excelente suspense.",
        },
    )

    assert response.status_code == 201
    payload = response.json()
    assert payload["nome"] == "Carla"
    assert payload["nota"] == 9.5

    response = await client.get("/api/v1/movies/movie-2")
    assert response.status_code == 200
    payload = response.json()
    assert payload["review_count"] == 1
    assert payload["average_rating"] == 9.5
    assert len(payload["reviews"]) == 1

    rejected = await client.post(
        "/api/v1/reviews",
        json={
            "movie_id": "movie-2",
            "nome": "Carla",
            "nota": 9.75,
            "comentario": "Fora do passo.",
        },
    )
    assert rejected.status_code == 422


@pytest.mark.asyncio
async def test_movie_filters_combine_genres_and_years(client) -> None:
    both = await client.get("/api/v1/movies", params=[("genres", "Thriller"), ("genres", "Science Fiction")])
    assert both.status_code == 200
    assert both.json()["total"] == 2

    exact = await client.get("/api/v1/movies", params={"year": 1999})
    assert exact.status_code == 200
    assert [item["titulo"] for item in exact.json()["items"]] == ["Matrix"]

    starting = await client.get("/api/v1/movies", params={"year_from": 2000})
    assert starting.status_code == 200
    assert [item["titulo"] for item in starting.json()["items"]] == ["Memento"]

    ending = await client.get("/api/v1/movies", params={"year_to": 1999, "genres": "Thriller"})
    assert ending.status_code == 200
    assert [item["titulo"] for item in ending.json()["items"]] == ["Matrix"]


@pytest.mark.asyncio
async def test_home_lists_genres_top_rated_and_activity(client) -> None:
    genres = await client.get("/api/v1/genres")
    assert genres.status_code == 200
    names = [item["nome_genero"] for item in genres.json()]
    assert names == ["Science Fiction", "Thriller"]

    by_genre = await client.get("/api/v1/movies", params={"genre": "science fiction"})
    assert by_genre.status_code == 200
    payload = by_genre.json()
    assert payload["total"] == 1
    assert payload["items"][0]["titulo"] == "Matrix"

    below_minimum = await client.get("/api/v1/movies", params={"sort": "rating", "limit": 2})
    assert below_minimum.status_code == 200
    assert below_minimum.json()["total"] == 0

    created = await client.post(
        "/api/v1/reviews",
        json={
            "movie_id": "movie-1",
            "nome": "Diana",
            "nota": 9.0,
            "comentario": "Terceira avaliação.",
        },
    )
    assert created.status_code == 201

    top_rated = await client.get("/api/v1/movies", params={"sort": "rating", "limit": 2})
    assert top_rated.status_code == 200
    payload = top_rated.json()
    assert payload["total"] == 1
    assert [item["titulo"] for item in payload["items"]] == ["Matrix"]

    activity = await client.get("/api/v1/reviews", params={"limit": 2})
    assert activity.status_code == 200
    reviews = activity.json()
    assert len(reviews) == 2
    assert {item["titulo"] for item in reviews} == {"Matrix"}
    assert {item["nome"] for item in reviews} == {"Ana", "Bruno"}


@pytest.mark.asyncio
async def test_movie_crud_flow(client) -> None:
    create_response = await client.post(
        "/api/v1/movies",
        json={
            "id_filme": "tt999",
            "titulo": "New Movie",
            "data_lancamento": "2026-09-24",
            "ano_lancamento": 2026,
            "duracao_minutos": 120,
            "status_filme": "Rascunho",
            "sinopse": "Uma nova produção.",
            "url_poster": "https://example.com/new.jpg",
            "url_backdrop": "https://example.com/new-backdrop.jpg",
        },
    )

    assert create_response.status_code == 201
    created_movie = create_response.json()
    movie_id = created_movie["sk_movie_id"]
    assert created_movie["titulo"] == "New Movie"

    update_response = await client.put(
        f"/api/v1/movies/{movie_id}",
        json={"titulo": "Updated Movie", "status_filme": "Lançado", "sinopse": "SEM DESCRIÇÃO"},
    )

    assert update_response.status_code == 200
    updated_movie = update_response.json()
    assert updated_movie["titulo"] == "Updated Movie"
    assert updated_movie["status_filme"] == "Lançado"
    assert updated_movie["sinopse"] == "No synopsis available."

    delete_response = await client.delete(f"/api/v1/movies/{movie_id}")
    assert delete_response.status_code == 204

    not_found_response = await client.get(f"/api/v1/movies/{movie_id}")
    assert not_found_response.status_code == 404
