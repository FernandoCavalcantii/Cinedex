import { apiGet } from "./api";
import type { PaginatedMovies } from "../types/movie";

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
