import { apiGet, apiPost } from "./api";
import type { GenreSummary, MovieDetail, MovieReview, PaginatedMovies, RecentActivity } from "../types/movie";

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
