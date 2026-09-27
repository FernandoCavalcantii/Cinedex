from __future__ import annotations

from datetime import date, datetime
from pydantic import BaseModel, ConfigDict, Field, field_validator


class GenreSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    sk_genre_id: str
    nome_genero: str


class CompanySummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    sk_company_id: str
    nome_produtora: str


class PersonSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    sk_person_id: str
    nome_pessoa: str
    tipo_pessoa: str


class PerformanceSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    sk_movie_id: str
    orcamento_usd: float | None = None
    receita_usd: float | None = None
    lucro_usd: float | None = None
    orcamento_brl: float | None = None
    receita_brl: float | None = None
    lucro_brl: float | None = None
    popularidade: float | None = None
    nota_tmdb: float | None = None
    qtd_tmdb: int | None = None
    nota_imdb: float | None = None
    qtd_imdb: int | None = None


class ReviewSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    sk_review_id: str
    sk_movie_id: str
    qtd_avaliacoes_usuarios: int
    nota_media_usuarios: float | None = None


class MovieReviewRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    sk_movie_review_id: str
    sk_movie_id: str
    nome: str
    nota: float
    comentario: str
    created_at: datetime


class MovieBase(BaseModel):
    id_filme: str = Field(min_length=1, max_length=50)
    titulo: str = Field(min_length=1, max_length=500)
    data_lancamento: date | None = None
    ano_lancamento: int | None = Field(default=None, ge=1888, le=2100)
    duracao_minutos: int | None = Field(default=None, ge=1, le=100000)
    status_filme: str | None = Field(default=None, max_length=50)
    sinopse: str | None = Field(default=None, max_length=4000)
    url_poster: str | None = Field(default=None, max_length=2048)
    url_backdrop: str | None = Field(default=None, max_length=2048)


class MovieCreate(MovieBase):
    id_filme: str | None = Field(default=None, min_length=1, max_length=50)
    generos: list[str] = Field(default_factory=list)
    diretor: str | None = Field(default=None, max_length=2000)


class MovieUpdate(BaseModel):
    id_filme: str | None = Field(default=None, min_length=1, max_length=50)
    titulo: str | None = Field(default=None, min_length=1, max_length=500)
    data_lancamento: date | None = None
    ano_lancamento: int | None = Field(default=None, ge=1888, le=2100)
    duracao_minutos: int | None = Field(default=None, ge=1, le=100000)
    status_filme: str | None = Field(default=None, max_length=50)
    sinopse: str | None = Field(default=None, max_length=4000)
    url_poster: str | None = Field(default=None, max_length=2048)
    url_backdrop: str | None = Field(default=None, max_length=2048)
    generos: list[str] | None = None
    diretor: str | None = Field(default=None, max_length=2000)


class MovieListItem(MovieBase):
    model_config = ConfigDict(from_attributes=True)

    sk_movie_id: str
    duracao_minutos: int | None = Field(default=None, ge=0)
    genres: list[GenreSummary] = Field(default_factory=list)
    average_rating: float | None = None
    review_count: int = 0


class MovieDetail(MovieListItem):
    companies: list[CompanySummary] = Field(default_factory=list)
    people: list[PersonSummary] = Field(default_factory=list)
    performance: PerformanceSummary | None = None
    reviews_summary: ReviewSummary | None = None
    reviews: list[MovieReviewRead] = Field(default_factory=list)


class PaginatedMovieList(BaseModel):
    items: list[MovieListItem]
    total: int
    skip: int
    limit: int
    has_more: bool


class RecentActivity(BaseModel):
    sk_movie_review_id: str
    sk_movie_id: str
    titulo: str
    nome: str
    nota: float
    created_at: datetime


class ReviewCreate(BaseModel):
    movie_id: str = Field(min_length=1, max_length=64)
    nome: str = Field(min_length=1, max_length=120)
    nota: float = Field(ge=0, le=10)
    comentario: str = Field(min_length=1, max_length=4000)

    @field_validator("nota")
    @classmethod
    def score_step(cls, value: float) -> float:
        scaled = round(value * 10)
        if not 0 <= scaled <= 100 or abs(value * 10 - scaled) > 1e-6:
            raise ValueError("Score must be from 0 to 10 in steps of 0.1")
        return scaled / 10


class ReviewCreated(MovieReviewRead):
    pass


class MetricReviewer(BaseModel):
    nome: str
    review_count: int


class MetricRatedMovie(BaseModel):
    sk_movie_id: str
    titulo: str
    average_rating: float
    review_count: int


class MetricGenreCount(BaseModel):
    nome_genero: str
    movie_count: int


class CatalogMetrics(BaseModel):
    movie_count: int
    review_count: int
    user_count: int
    unreviewed_count: int
    average_rating: float | None = None
    reviews_last_7_days: int
    top_reviewers: list[MetricReviewer]
    top_rated: list[MetricRatedMovie]
    genres: list[MetricGenreCount]
