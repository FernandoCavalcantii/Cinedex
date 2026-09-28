export type GenreSummary = {
  sk_genre_id: string;
  nome_genero: string;
};

export type MovieListItem = {
  sk_movie_id: string;
  id_filme: string;
  titulo: string;
  data_lancamento: string | null;
  ano_lancamento: number | null;
  duracao_minutos: number | null;
  status_filme: string | null;
  sinopse: string | null;
  url_poster: string | null;
  url_backdrop: string | null;
  genres: GenreSummary[];
  average_rating: number | null;
  review_count: number;
};

export type PaginatedMovies = {
  items: MovieListItem[];
  total: number;
  skip: number;
  limit: number;
  has_more: boolean;
};

export type CompanySummary = {
  sk_company_id: string;
  nome_produtora: string;
};

export type PersonSummary = {
  sk_person_id: string;
  nome_pessoa: string;
  tipo_pessoa: string;
};

export type RecentActivity = {
  sk_movie_review_id: string;
  sk_movie_id: string;
  titulo: string;
  nome: string;
  nota: number;
  created_at: string;
};

export type MovieReview = {
  sk_movie_review_id: string;
  sk_movie_id: string;
  nome: string;
  nota: number;
  comentario: string;
  created_at: string;
};

export type MovieDetail = MovieListItem & {
  companies: CompanySummary[];
  people: PersonSummary[];
  reviews: MovieReview[];
};

export type MetricReviewer = {
  nome: string;
  review_count: number;
};

export type MetricRatedMovie = {
  sk_movie_id: string;
  titulo: string;
  average_rating: number;
  review_count: number;
};

export type MetricGenreCount = {
  nome_genero: string;
  movie_count: number;
};

export type MetricViewedMovie = {
  sk_movie_id: string;
  titulo: string;
  view_count: number;
};

export type MetricAttention = {
  nome_genero: string;
  duration_seconds: number;
};

export type MetricSearchTerm = {
  search_term: string;
  search_count: number;
  empty_count: number;
};

export type CatalogMetrics = {
  movie_count: number;
  review_count: number;
  user_count: number;
  unreviewed_count: number;
  average_rating: number | null;
  reviews_last_7_days: number;
  catalog_seconds_today: number;
  returning_visitors: number;
  top_reviewers: MetricReviewer[];
  top_rated: MetricRatedMovie[];
  genres: MetricGenreCount[];
  most_viewed: MetricViewedMovie[];
  attention_by_genre: MetricAttention[];
  top_searches: MetricSearchTerm[];
};
