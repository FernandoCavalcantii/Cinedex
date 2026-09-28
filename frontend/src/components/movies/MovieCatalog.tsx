import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { Pagination } from "../layout/Pagination";
import { Button } from "../ui/Button";
import { ApiError } from "../../services/api";
import { useRecordedSearch, type VisitSource } from "../../services/catalogTracking";
import { listMovies } from "../../services/movies";
import { MovieCard } from "./MovieCard";
import styles from "./MovieCatalog.module.css";

const PAGE_SIZE = 24;

type MovieCatalogProps = {
  search?: string;
  genres?: string[];
  year?: number;
  yearFrom?: number;
  yearTo?: number;
  sort?: "title" | "rating";
  page: number;
  onPageChange: (page: number) => void;
  toolbarStart?: ReactNode;
  toolbarEnd?: ReactNode;
};

function cardSource(search: string | undefined, genres: string[] | undefined): VisitSource {
  if (search) {
    return "search";
  }
  if (genres && genres.length > 0) {
    return "genre";
  }
  return "all_movies";
}

function catalogErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return "Could not load the catalog.";
  }
  return "Could not reach the API.";
}

function emptyCatalogMessage(search?: string, filtered?: boolean): string {
  if (search) {
    return `No movies found for “${search}”.`;
  }
  if (filtered) {
    return "No movies match these filters.";
  }
  return "No movies in the catalog.";
}

export function MovieCatalog({
  search,
  genres = [],
  year,
  yearFrom,
  yearTo,
  sort = "title",
  page,
  onPageChange,
  toolbarStart,
  toolbarEnd,
}: MovieCatalogProps) {
  const skip = (page - 1) * PAGE_SIZE;
  const filtered = genres.length > 0 || year !== undefined || yearFrom !== undefined || yearTo !== undefined;
  const movies = useQuery({
    queryKey: [
      "movies",
      {
        skip,
        limit: PAGE_SIZE,
        search: search ?? "",
        genres,
        year: year ?? "",
        yearFrom: yearFrom ?? "",
        yearTo: yearTo ?? "",
        sort,
      },
    ],
    queryFn: ({ signal }) =>
      listMovies(
        {
          skip,
          limit: PAGE_SIZE,
          search,
          genres,
          year,
          year_from: yearFrom,
          year_to: yearTo,
          sort: sort === "rating" ? "rating" : undefined,
        },
        signal,
      ),
  });

  const total = movies.data?.total ?? 0;
  useRecordedSearch(search, movies.isSuccess && !movies.isFetching ? movies.data?.total : undefined);
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <section className={styles.section}>
      <div className={styles.bar}>
        <div className={styles.barStart}>{toolbarStart}</div>
        <p className={styles.count}>{movies.isSuccess ? `${total.toLocaleString("pt-BR")} titles` : ""}</p>
        <div className={styles.barEnd}>{toolbarEnd}</div>
      </div>
      {movies.isPending ? <p className={styles.status}>Loading movies…</p> : null}

      {movies.isError ? (
        <div className={styles.status}>
          <p>{catalogErrorMessage(movies.error)}</p>
          <Button onClick={() => void movies.refetch()}>Try again</Button>
        </div>
      ) : null}

      {movies.isSuccess && total === 0 ? (
        <p className={styles.status}>
          {emptyCatalogMessage(search, filtered)}
        </p>
      ) : null}

      {movies.isSuccess && total > 0 && movies.data.items.length === 0 ? (
        <div className={styles.status}>
          <p>This page is empty.</p>
          <Button onClick={() => onPageChange(1)}>Back to first page</Button>
        </div>
      ) : null}

      {movies.isSuccess && movies.data.items.length > 0 ? (
        <div className={styles.catalog}>
          <Pagination page={page} pageCount={pageCount} onPageChange={onPageChange} />
          <div className={styles.grid}>
            {movies.data.items.map((movie) => (
              <MovieCard key={movie.sk_movie_id} movie={movie} source={cardSource(search, genres)} />
            ))}
          </div>
          <Pagination page={page} pageCount={pageCount} onPageChange={onPageChange} />
        </div>
      ) : null}
    </section>
  );
}
