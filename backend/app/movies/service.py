from __future__ import annotations

from decimal import Decimal
from uuid import uuid4

from fastapi import HTTPException, status
from sqlalchemy import case, func, or_, select, text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import aliased, selectinload

from app.movies.models import (
    CatalogEvent,
    DimCompany,
    DimGenre,
    DimMovie,
    DimPerson,
    DimReview,
    MovieReview,
    bridge_movie_genre,
)
from app.movies.schemas import (
    AdminFeedItem,
    CatalogEventCreate,
    CatalogMetrics,
    CompanySummary,
    MovieCreate,
    MovieDetail,
    MovieListItem,
    MovieReviewRead,
    MovieUpdate,
    PaginatedMovieList,
    PerformanceSummary,
    PersonSummary,
    RecentActivity,
    ReviewCreate,
    ReviewCreated,
    ReviewSummary,
    GenreSummary,
    MetricAttention,
    MetricGenreCount,
    MetricRatedMovie,
    MetricReviewer,
    MetricSearchTerm,
    MetricViewedMovie,
)


MISSING_SYNOPSIS = "sem descrição"
REPLACEMENT_SYNOPSIS = "No synopsis available."
CATALOG_ACTOR = "catalog-admin"


def _coalesce_decimal(value: Decimal | None) -> float | None:
    return None if value is None else float(value)


def _normalize_sinopse(value: str | None) -> str | None:
    if value is not None and value.strip().casefold() == MISSING_SYNOPSIS:
        return REPLACEMENT_SYNOPSIS
    return value


def _build_average(movie: DimMovie) -> float | None:
    if movie.reviews:
        total = sum(review.nota for review in movie.reviews)
        return round(total / len(movie.reviews), 2)

    if movie.reviews_summary and movie.reviews_summary.nota_media_usuarios is not None:
        return movie.reviews_summary.nota_media_usuarios

    return None


def _build_review_count(movie: DimMovie) -> int:
    if movie.reviews:
        return len(movie.reviews)
    if movie.reviews_summary:
        return movie.reviews_summary.qtd_avaliacoes_usuarios
    return 0


def _movie_list_item(movie: DimMovie) -> MovieListItem:
    return MovieListItem(
        sk_movie_id=movie.sk_movie_id,
        id_filme=movie.id_filme,
        titulo=movie.titulo,
        data_lancamento=movie.data_lancamento,
        ano_lancamento=movie.ano_lancamento,
        duracao_minutos=movie.duracao_minutos,
        status_filme=movie.status_filme,
        sinopse=_normalize_sinopse(movie.sinopse),
        url_poster=movie.url_poster,
        url_backdrop=movie.url_backdrop,
        genres=[GenreSummary.model_validate(genre) for genre in movie.genres],
        average_rating=_build_average(movie),
        review_count=_build_review_count(movie),
    )


def _movie_detail(movie: DimMovie) -> MovieDetail:
    performance = None
    if movie.performance is not None:
        performance = PerformanceSummary(
            sk_movie_id=movie.performance.sk_movie_id,
            orcamento_usd=_coalesce_decimal(movie.performance.orcamento_usd),
            receita_usd=_coalesce_decimal(movie.performance.receita_usd),
            lucro_usd=_coalesce_decimal(movie.performance.lucro_usd),
            orcamento_brl=_coalesce_decimal(movie.performance.orcamento_brl),
            receita_brl=_coalesce_decimal(movie.performance.receita_brl),
            lucro_brl=_coalesce_decimal(movie.performance.lucro_brl),
            popularidade=movie.performance.popularidade,
            nota_tmdb=movie.performance.nota_tmdb,
            qtd_tmdb=movie.performance.qtd_tmdb,
            nota_imdb=movie.performance.nota_imdb,
            qtd_imdb=movie.performance.qtd_imdb,
        )

    reviews_summary = None
    if movie.reviews_summary is not None:
        reviews_summary = ReviewSummary.model_validate(movie.reviews_summary)

    return MovieDetail(
        sk_movie_id=movie.sk_movie_id,
        id_filme=movie.id_filme,
        titulo=movie.titulo,
        data_lancamento=movie.data_lancamento,
        ano_lancamento=movie.ano_lancamento,
        duracao_minutos=movie.duracao_minutos,
        status_filme=movie.status_filme,
        sinopse=_normalize_sinopse(movie.sinopse),
        url_poster=movie.url_poster,
        url_backdrop=movie.url_backdrop,
        genres=[GenreSummary.model_validate(genre) for genre in movie.genres],
        average_rating=_build_average(movie),
        review_count=_build_review_count(movie),
        companies=[CompanySummary.model_validate(company) for company in movie.companies],
        people=[PersonSummary.model_validate(person) for person in movie.people],
        performance=performance,
        reviews_summary=reviews_summary,
        reviews=[MovieReviewRead.model_validate(review) for review in movie.reviews],
    )


async def _load_movie_detail(session: AsyncSession, movie_id: str) -> DimMovie:
    statement = (
        select(DimMovie)
        .where(DimMovie.sk_movie_id == movie_id)
        .options(
            selectinload(DimMovie.genres),
            selectinload(DimMovie.companies),
            selectinload(DimMovie.people),
            selectinload(DimMovie.performance),
            selectinload(DimMovie.reviews_summary),
            selectinload(DimMovie.reviews),
        )
    )
    result = await session.execute(statement)
    movie = result.scalar_one_or_none()
    if movie is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Movie not found")
    return movie


async def _genres_by_name(session: AsyncSession, names: list[str]) -> list[DimGenre]:
    wanted: list[str] = []
    seen: set[str] = set()
    for name in names:
        cleaned = name.strip()
        key = cleaned.casefold()
        if cleaned and key not in seen:
            seen.add(key)
            wanted.append(cleaned)
    if not wanted:
        return []

    result = await session.execute(
        select(DimGenre).where(func.lower(DimGenre.nome_genero).in_([name.casefold() for name in wanted]))
    )
    found = list(result.scalars().all())
    found_keys = {genre.nome_genero.casefold() for genre in found}
    missing = [name for name in wanted if name.casefold() not in found_keys]
    if missing:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail="Unknown genre")
    return found


async def _directors_by_name(session: AsyncSession, raw: str | None) -> list[DimPerson]:
    names: list[str] = []
    seen: set[str] = set()
    for part in (raw or "").split(","):
        cleaned = part.strip()
        key = cleaned.casefold()
        if not cleaned or key in seen:
            continue
        if len(cleaned) > 255:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail="Director name is too long")
        seen.add(key)
        names.append(cleaned)

    people: list[DimPerson] = []
    for name in names:
        existing = await session.scalar(
            select(DimPerson).where(
                func.lower(DimPerson.nome_pessoa) == name.casefold(),
                DimPerson.tipo_pessoa == "Diretor",
            )
        )
        if existing is None:
            existing = DimPerson(nome_pessoa=name, tipo_pessoa="Diretor")
            session.add(existing)
        people.append(existing)
    return people


def _replace_directors(movie: DimMovie, directors: list[DimPerson]) -> None:
    movie.people = [person for person in movie.people if person.tipo_pessoa != "Diretor"]
    movie.people.extend(directors)


async def list_genres(session: AsyncSession) -> list[GenreSummary]:
    result = await session.execute(select(DimGenre).order_by(DimGenre.nome_genero))
    return [GenreSummary.model_validate(genre) for genre in result.scalars().all()]


async def list_admin_feed(session: AsyncSession, *, limit: int) -> list[AdminFeedItem]:
    review_rows = await session.execute(
        select(MovieReview, DimMovie.titulo)
        .join(DimMovie, DimMovie.sk_movie_id == MovieReview.sk_movie_id)
        .order_by(MovieReview.created_at.desc(), MovieReview.sk_movie_review_id.desc())
        .limit(limit)
    )
    movie_rows = await session.execute(
        select(CatalogEvent.occurred_at, DimMovie.sk_movie_id, DimMovie.titulo)
        .join(DimMovie, DimMovie.sk_movie_id == CatalogEvent.sk_movie_id)
        .where(CatalogEvent.event_type == "movie_created")
        .order_by(CatalogEvent.occurred_at.desc(), DimMovie.titulo)
        .limit(limit)
    )
    items = [
        AdminFeedItem(
            kind="review",
            sk_movie_review_id=review.sk_movie_review_id,
            sk_movie_id=review.sk_movie_id,
            titulo=title,
            nome=review.nome,
            nota=review.nota,
            created_at=review.created_at,
        )
        for review, title in review_rows.all()
    ]
    items.extend(
        AdminFeedItem(
            kind="added",
            sk_movie_id=movie_id,
            titulo=title,
            created_at=occurred_at,
        )
        for occurred_at, movie_id, title in movie_rows.all()
    )
    items.sort(key=lambda item: item.created_at, reverse=True)
    return items[:limit]


async def list_recent_activity(session: AsyncSession, *, limit: int) -> list[RecentActivity]:
    statement = (
        select(MovieReview, DimMovie.titulo)
        .join(DimMovie, DimMovie.sk_movie_id == MovieReview.sk_movie_id)
        .order_by(MovieReview.created_at.desc(), MovieReview.sk_movie_review_id.desc())
        .limit(limit)
    )
    result = await session.execute(statement)
    return [
        RecentActivity(
            sk_movie_review_id=review.sk_movie_review_id,
            sk_movie_id=review.sk_movie_id,
            titulo=title,
            nome=review.nome,
            nota=review.nota,
            created_at=review.created_at,
        )
        for review, title in result.all()
    ]


async def list_movies(
    session: AsyncSession,
    *,
    skip: int,
    limit: int,
    search: str | None = None,
    genre: str | None = None,
    genres: list[str] | None = None,
    year: int | None = None,
    year_from: int | None = None,
    year_to: int | None = None,
    sort: str = "title",
) -> PaginatedMovieList:
    filters = []
    normalized_search = search.strip() if search else None
    if normalized_search:
        pattern = f"%{normalized_search}%"
        filters.append(
            or_(
                DimMovie.titulo.ilike(pattern),
                DimMovie.sinopse.ilike(pattern),
                DimMovie.id_filme.ilike(pattern),
            )
        )

    genre_names = []
    if genre and genre.strip():
        genre_names.append(genre.strip())
    for name in genres or []:
        cleaned = name.strip()
        if cleaned and cleaned.casefold() not in {item.casefold() for item in genre_names}:
            genre_names.append(cleaned)
    if genre_names:
        lowered = [name.casefold() for name in genre_names]
        filters.append(DimMovie.genres.any(func.lower(DimGenre.nome_genero).in_(lowered)))

    if year_from is not None and year_to is not None and year_from > year_to:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="year_from must be less than or equal to year_to",
        )
    if year is not None:
        filters.append(DimMovie.ano_lancamento == year)
    else:
        if year_from is not None:
            filters.append(DimMovie.ano_lancamento >= year_from)
        if year_to is not None:
            filters.append(DimMovie.ano_lancamento <= year_to)

    ranked_reviews = None
    if sort == "rating":
        ranked_reviews = (
            select(
                MovieReview.sk_movie_id.label("sk_movie_id"),
                func.count(MovieReview.sk_movie_review_id).label("qtd"),
                func.avg(MovieReview.nota).label("media"),
            )
            .group_by(MovieReview.sk_movie_id)
            .having(func.count(MovieReview.sk_movie_review_id) >= 3)
            .subquery()
        )

    count_statement = select(func.count(DimMovie.sk_movie_id))
    if ranked_reviews is not None:
        count_statement = count_statement.join(
            ranked_reviews, ranked_reviews.c.sk_movie_id == DimMovie.sk_movie_id
        )
    if filters:
        count_statement = count_statement.where(*filters)

    total = await session.scalar(count_statement)
    total = total or 0

    statement = (
        select(DimMovie)
        .options(
            selectinload(DimMovie.genres),
            selectinload(DimMovie.reviews_summary),
            selectinload(DimMovie.reviews),
        )
        .offset(skip)
        .limit(limit)
    )
    if ranked_reviews is not None:
        statement = statement.join(ranked_reviews, ranked_reviews.c.sk_movie_id == DimMovie.sk_movie_id).order_by(
            ranked_reviews.c.media.desc(),
            ranked_reviews.c.qtd.desc(),
            DimMovie.titulo,
        )
    else:
        statement = statement.order_by(DimMovie.titulo)
    if filters:
        statement = statement.where(*filters)

    result = await session.execute(statement)
    movies = result.scalars().unique().all()

    items = [_movie_list_item(movie) for movie in movies]
    return PaginatedMovieList(
        items=items,
        total=total,
        skip=skip,
        limit=limit,
        has_more=skip + len(items) < total,
    )


async def get_movie(session: AsyncSession, movie_id: str) -> MovieDetail:
    movie = await _load_movie_detail(session, movie_id)
    return _movie_detail(movie)


async def create_movie(session: AsyncSession, movie_in: MovieCreate) -> MovieDetail:
    genres = await _genres_by_name(session, movie_in.generos)
    directors = await _directors_by_name(session, movie_in.diretor)
    identifier = (movie_in.id_filme or "").strip() or f"local-{uuid4().hex[:16]}"
    movie = DimMovie(
        id_filme=identifier,
        titulo=movie_in.titulo,
        data_lancamento=movie_in.data_lancamento,
        ano_lancamento=movie_in.ano_lancamento,
        duracao_minutos=movie_in.duracao_minutos,
        status_filme=movie_in.status_filme,
        sinopse=_normalize_sinopse(movie_in.sinopse),
        url_poster=movie_in.url_poster,
        url_backdrop=movie_in.url_backdrop,
    )
    movie.genres = genres
    movie.people = directors
    session.add(movie)
    await session.flush()
    session.add(
        CatalogEvent(
            visitor_id=CATALOG_ACTOR,
            event_type="movie_created",
            sk_movie_id=movie.sk_movie_id,
        )
    )

    try:
        await session.commit()
    except IntegrityError as exc:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Movie identifier already exists",
        ) from exc

    return await get_movie(session, movie.sk_movie_id)


async def update_movie(session: AsyncSession, movie_id: str, movie_in: MovieUpdate) -> MovieDetail:
    movie = await _load_movie_detail(session, movie_id)
    update_data = movie_in.model_dump(exclude_unset=True)
    genres = update_data.pop("generos", None)
    director = update_data.pop("diretor", None)
    if "sinopse" in update_data:
        update_data["sinopse"] = _normalize_sinopse(update_data["sinopse"])
    for field, value in update_data.items():
        setattr(movie, field, value)
    if genres is not None:
        movie.genres = await _genres_by_name(session, genres)
    if director is not None:
        _replace_directors(movie, await _directors_by_name(session, director))

    try:
        await session.commit()
    except IntegrityError as exc:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Movie identifier already exists",
        ) from exc

    return await get_movie(session, movie_id)


async def delete_movie(session: AsyncSession, movie_id: str) -> None:
    movie = await _load_movie_detail(session, movie_id)
    await session.delete(movie)
    await session.commit()


async def create_review(session: AsyncSession, review_in: ReviewCreate) -> ReviewCreated:
    movie = await _load_movie_detail(session, review_in.movie_id)

    review = MovieReview(
        sk_movie_id=movie.sk_movie_id,
        nome=review_in.nome,
        nota=review_in.nota,
        comentario=review_in.comentario,
    )
    session.add(review)
    await session.flush()
    await session.refresh(review)

    aggregate_statement = select(
        func.count(MovieReview.sk_movie_review_id),
        func.avg(MovieReview.nota),
    ).where(MovieReview.sk_movie_id == movie.sk_movie_id)
    aggregate_result = await session.execute(aggregate_statement)
    total_reviews, average_rating = aggregate_result.one()

    review_summary = movie.reviews_summary
    if review_summary is None:
        review_summary = DimReview(
            sk_movie_id=movie.sk_movie_id,
            qtd_avaliacoes_usuarios=int(total_reviews),
            nota_media_usuarios=float(round(average_rating or 0, 2)),
        )
        session.add(review_summary)
    else:
        review_summary.qtd_avaliacoes_usuarios = int(total_reviews)
        review_summary.nota_media_usuarios = float(round(average_rating or 0, 2))

    await session.commit()

    return ReviewCreated.model_validate(review)


async def get_catalog_metrics(session: AsyncSession) -> CatalogMetrics:
    movie_count = await session.scalar(select(func.count()).select_from(DimMovie)) or 0
    review_count = await session.scalar(select(func.count()).select_from(MovieReview)) or 0
    user_count = await session.scalar(select(func.count(func.distinct(MovieReview.nome)))) or 0
    reviewed = (
        select(MovieReview.sk_movie_review_id)
        .where(MovieReview.sk_movie_id == DimMovie.sk_movie_id)
        .exists()
    )
    unreviewed_count = (
        await session.scalar(select(func.count()).select_from(DimMovie).where(~reviewed)) or 0
    )
    average_rating = await session.scalar(select(func.avg(MovieReview.nota)))
    reviews_last_7_days = (
        await session.scalar(
            select(func.count())
            .select_from(MovieReview)
            .where(MovieReview.created_at >= text("datetime('now', '-7 days')"))
        )
        or 0
    )

    reviewer_rows = await session.execute(
        select(MovieReview.nome, func.count().label("qtd"))
        .group_by(MovieReview.nome)
        .order_by(func.count().desc(), MovieReview.nome)
        .limit(8)
    )
    top_reviewers = [
        MetricReviewer(nome=nome, review_count=int(count)) for nome, count in reviewer_rows.all()
    ]

    ranked = (
        select(
            MovieReview.sk_movie_id.label("sk_movie_id"),
            func.count(MovieReview.sk_movie_review_id).label("qtd"),
            func.avg(MovieReview.nota).label("media"),
        )
        .group_by(MovieReview.sk_movie_id)
        .having(func.count(MovieReview.sk_movie_review_id) >= 3)
        .subquery()
    )
    rated_rows = await session.execute(
        select(DimMovie.sk_movie_id, DimMovie.titulo, ranked.c.media, ranked.c.qtd)
        .join(ranked, ranked.c.sk_movie_id == DimMovie.sk_movie_id)
        .order_by(ranked.c.media.desc(), ranked.c.qtd.desc(), DimMovie.titulo)
        .limit(5)
    )
    top_rated = [
        MetricRatedMovie(
            sk_movie_id=movie_id,
            titulo=title,
            average_rating=float(average),
            review_count=int(count),
        )
        for movie_id, title, average, count in rated_rows.all()
    ]

    genre_rows = await session.execute(
        select(DimGenre.nome_genero, func.count(bridge_movie_genre.c.sk_movie_id))
        .join(bridge_movie_genre, bridge_movie_genre.c.sk_genre_id == DimGenre.sk_genre_id)
        .group_by(DimGenre.nome_genero)
        .order_by(func.count(bridge_movie_genre.c.sk_movie_id).desc(), DimGenre.nome_genero)
    )
    genres = [
        MetricGenreCount(nome_genero=name, movie_count=int(count)) for name, count in genre_rows.all()
    ]
    no_genre_count = await session.scalar(
        select(func.count()).select_from(DimMovie).where(~DimMovie.genres.any())
    )
    if no_genre_count:
        missing = MetricGenreCount(nome_genero="No genre", movie_count=int(no_genre_count))
        insert_at = next(
            (
                index
                for index, genre in enumerate(genres)
                if genre.movie_count < missing.movie_count
                or (genre.movie_count == missing.movie_count and genre.nome_genero > missing.nome_genero)
            ),
            len(genres),
        )
        genres.insert(insert_at, missing)

    viewed_rows = await session.execute(
        select(DimMovie.sk_movie_id, DimMovie.titulo, func.count().label("qtd"))
        .join(CatalogEvent, CatalogEvent.sk_movie_id == DimMovie.sk_movie_id)
        .where(CatalogEvent.event_type == "detail_open")
        .group_by(DimMovie.sk_movie_id, DimMovie.titulo)
        .order_by(func.count().desc(), DimMovie.titulo)
        .limit(5)
    )
    most_viewed = [
        MetricViewedMovie(sk_movie_id=movie_id, titulo=title, view_count=int(count))
        for movie_id, title, count in viewed_rows.all()
    ]

    attention_rows = await session.execute(
        select(DimGenre.nome_genero, func.sum(CatalogEvent.duration_seconds))
        .join(bridge_movie_genre, bridge_movie_genre.c.sk_genre_id == DimGenre.sk_genre_id)
        .join(
            CatalogEvent,
            (CatalogEvent.sk_movie_id == bridge_movie_genre.c.sk_movie_id)
            & (CatalogEvent.event_type == "detail_dwell"),
        )
        .group_by(DimGenre.nome_genero)
        .order_by(func.sum(CatalogEvent.duration_seconds).desc(), DimGenre.nome_genero)
        .limit(8)
    )
    attention_by_genre = [
        MetricAttention(nome_genero=name, duration_seconds=int(seconds or 0))
        for name, seconds in attention_rows.all()
        if seconds
    ]

    catalog_seconds_today = (
        await session.scalar(
            select(func.coalesce(func.sum(CatalogEvent.duration_seconds), 0)).where(
                CatalogEvent.event_type == "catalog_dwell",
                func.date(CatalogEvent.occurred_at) == func.date("now"),
            )
        )
        or 0
    )

    search_rows = await session.execute(
        select(
            CatalogEvent.search_term,
            func.count(),
            func.coalesce(func.sum(case((CatalogEvent.result_count == 0, 1), else_=0)), 0),
        )
        .where(CatalogEvent.event_type == "search", CatalogEvent.search_term.is_not(None))
        .group_by(CatalogEvent.search_term)
        .order_by(func.count().desc(), CatalogEvent.search_term)
        .limit(8)
    )
    top_searches = [
        MetricSearchTerm(search_term=term, search_count=int(count), empty_count=int(empty or 0))
        for term, count, empty in search_rows.all()
        if term
    ]

    earlier = aliased(CatalogEvent)
    later = aliased(CatalogEvent)
    returning_visitors = (
        await session.scalar(
            select(func.count(func.distinct(earlier.visitor_id)))
            .select_from(earlier)
            .join(
                later,
                (earlier.visitor_id == later.visitor_id)
                & (earlier.event_type != "movie_created")
                & (later.event_type != "movie_created")
                & (func.date(later.occurred_at) == func.date(earlier.occurred_at, "+1 day")),
            )
        )
        or 0
    )

    return CatalogMetrics(
        movie_count=int(movie_count),
        review_count=int(review_count),
        user_count=int(user_count),
        unreviewed_count=int(unreviewed_count),
        average_rating=None if average_rating is None else float(average_rating),
        reviews_last_7_days=int(reviews_last_7_days),
        catalog_seconds_today=int(catalog_seconds_today),
        returning_visitors=int(returning_visitors),
        top_reviewers=top_reviewers,
        top_rated=top_rated,
        genres=genres,
        most_viewed=most_viewed,
        attention_by_genre=attention_by_genre,
        top_searches=top_searches,
    )


async def record_catalog_event(session: AsyncSession, event_in: CatalogEventCreate) -> None:
    if event_in.movie_id is not None:
        movie_exists = await session.scalar(
            select(DimMovie.sk_movie_id).where(DimMovie.sk_movie_id == event_in.movie_id)
        )
        if movie_exists is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Movie not found")
    session.add(
        CatalogEvent(
            visitor_id=event_in.visitor_id,
            event_type=event_in.event_type,
            sk_movie_id=event_in.movie_id,
            source=event_in.source,
            duration_seconds=event_in.duration_seconds,
            search_term=event_in.search_term,
            result_count=event_in.result_count,
        )
    )
    await session.commit()
