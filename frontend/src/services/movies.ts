import { apiGet } from "./api";
import type { MovieDetail, PaginatedMovies } from "../types/movie";

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
