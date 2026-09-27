from __future__ import annotations

from decimal import Decimal
from uuid import uuid4

from fastapi import HTTPException, status
from sqlalchemy import func, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.movies.models import DimCompany, DimGenre, DimMovie, DimPerson, DimReview, MovieReview
from app.movies.schemas import (
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
)


MISSING_SYNOPSIS = "sem descrição"
REPLACEMENT_SYNOPSIS = "No synopsis available."


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
