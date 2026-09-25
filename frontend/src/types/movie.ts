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
