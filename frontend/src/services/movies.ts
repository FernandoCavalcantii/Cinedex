import { apiDelete, apiGet, apiPost, apiPut } from "./api";
import type {
  AdminFeedItem,
  CatalogMetrics,
  GenreSummary,
  MovieDetail,
  MovieReview,
  PaginatedMovies,
  RecentActivity,
} from "../types/movie";

type ListMoviesQuery = {
  skip?: number;
  limit?: number;
  search?: string;
  genre?: string;
  genres?: string[];
  year?: number;
  year_from?: number;
  year_to?: number;
  sort?: "title" | "rating";
};

export function listMovies(
  query: ListMoviesQuery = {},
  signal?: AbortSignal,
): Promise<PaginatedMovies> {
  return apiGet<PaginatedMovies>("movies", query, signal);
}

export function listGenres(signal?: AbortSignal): Promise<GenreSummary[]> {
  return apiGet<GenreSummary[]>("genres", undefined, signal);
}

export function listRecentActivity(limit = 8, signal?: AbortSignal): Promise<RecentActivity[]> {
  return apiGet<RecentActivity[]>("reviews", { limit }, signal);
}

export function getMovie(movieId: string, signal?: AbortSignal): Promise<MovieDetail> {
  return apiGet<MovieDetail>(`movies/${movieId}`, undefined, signal);
}

export type ReviewInput = {
  movie_id: string;
  nome: string;
  nota: number;
  comentario: string;
};

export function createReview(review: ReviewInput): Promise<MovieReview> {
  return apiPost<MovieReview>("reviews", review);
}

export type MovieInput = {
  titulo: string;
  data_lancamento: string | null;
  ano_lancamento: number | null;
  duracao_minutos: number | null;
  status_filme: string | null;
  url_poster: string | null;
  url_backdrop: string | null;
  sinopse: string | null;
  generos: string[];
  diretor: string;
};

export function createMovie(movie: MovieInput): Promise<MovieDetail> {
  return apiPost<MovieDetail>("movies", movie);
}

export function updateMovie(movieId: string, movie: MovieInput): Promise<MovieDetail> {
  return apiPut<MovieDetail>(`movies/${movieId}`, movie);
}

export function deleteMovie(movieId: string): Promise<void> {
  return apiDelete(`movies/${movieId}`);
}

export function listAdminFeed(limit = 8, signal?: AbortSignal): Promise<AdminFeedItem[]> {
  return apiGet<AdminFeedItem[]>("admin/feed", { limit }, signal);
}

export function getCatalogMetrics(signal?: AbortSignal): Promise<CatalogMetrics> {
  return apiGet<CatalogMetrics>("admin/metrics", undefined, signal);
}
