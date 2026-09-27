import { useQuery } from "@tanstack/react-query";
import { Pagination } from "../layout/Pagination";
import { Button } from "../ui/Button";
import { ApiError } from "../../services/api";
import { listMovies } from "../../services/movies";
import { MovieCard } from "./MovieCard";
import styles from "./MovieCatalog.module.css";

const PAGE_SIZE = 24;

type MovieCatalogProps = {
  search?: string;
  page: number;
  onPageChange: (page: number) => void;
};

function catalogErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return "Could not load the catalog.";
  }
  return "Could not reach the API.";
}

export function MovieCatalog({ search, page, onPageChange }: MovieCatalogProps) {
  const skip = (page - 1) * PAGE_SIZE;
  const movies = useQuery({
    queryKey: ["movies", { skip, limit: PAGE_SIZE, search: search ?? "" }],
    queryFn: ({ signal }) => listMovies({ skip, limit: PAGE_SIZE, search }, signal),
  });

  const total = movies.data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <section className={styles.section}>
      {movies.isPending ? <p className={styles.status}>Loading movies…</p> : null}

      {movies.isError ? (
        <div className={styles.status}>
          <p>{catalogErrorMessage(movies.error)}</p>
          <Button onClick={() => void movies.refetch()}>Try again</Button>
        </div>
      ) : null}

      {movies.isSuccess && total === 0 ? (
        <p className={styles.status}>
          {search ? `No movies found for “${search}”.` : "No movies in the catalog."}
        </p>
      ) : null}

      {movies.isSuccess && total > 0 && movies.data.items.length === 0 ? (
        <div className={styles.status}>
          <p>This page is empty.</p>
          <Button onClick={() => onPageChange(1)}>Back to first page</Button>
        </div>
      ) : null}

      {movies.isSuccess && movies.data.items.length > 0 ? (
        <>
          <p className={styles.count}>{total.toLocaleString("en-US")} titles</p>
          <div className={styles.catalog}>
            <Pagination page={page} pageCount={pageCount} onPageChange={onPageChange} />
            <div className={styles.grid}>
              {movies.data.items.map((movie) => (
                <MovieCard key={movie.sk_movie_id} movie={movie} />
              ))}
            </div>
            <Pagination page={page} pageCount={pageCount} onPageChange={onPageChange} />
          </div>
        </>
      ) : null}
    </section>
  );
}
