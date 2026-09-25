import { apiGet, apiPost } from "./api";
import type { MovieDetail, MovieReview, PaginatedMovies } from "../types/movie";

type ListMoviesQuery = {
  skip?: number;
  limit?: number;
  search?: string;
};

export function listMovies(
  query: ListMoviesQuery = {},
  signal?: AbortSignal,
): Promise<PaginatedMovies> {
  return apiGet<PaginatedMovies>("movies", query, signal);
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
