import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ApiError } from "../../services/api";
import { listMovies } from "../../services/movies";
import { MovieCard } from "./MovieCard";
import styles from "./MovieStrip.module.css";

type MovieStripProps = {
  title: string;
  limit?: number;
  search?: string;
  viewAllTo?: string;
};

function catalogErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return "Could not load the catalog.";
  }
  return "Could not reach the API.";
}

export function MovieStrip({ title, limit = 12, search, viewAllTo }: MovieStripProps) {
  const movies = useQuery({
    queryKey: ["movies", { limit, search: search ?? "" }],
    queryFn: ({ signal }) => listMovies({ limit, search }, signal),
  });

  const total = movies.data?.total ?? null;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div className={styles.heading}>
          <h2>{title}</h2>
          {total !== null ? <span>{total.toLocaleString("en-US")} titles</span> : null}
        </div>
        {viewAllTo ? (
          <Link className={styles.viewAll} to={viewAllTo}>
            View all →
          </Link>
        ) : null}
      </div>

      {movies.isPending ? <p className={styles.status}>Loading movies…</p> : null}

      {movies.isError ? (
        <div className={styles.status}>
          <p>{catalogErrorMessage(movies.error)}</p>
          <button type="button" onClick={() => void movies.refetch()}>
            Try again
          </button>
        </div>
      ) : null}

      {movies.isSuccess && movies.data.items.length === 0 ? (
        <p className={styles.status}>
          {search ? `No movies found for “${search}”.` : "No movies in the catalog."}
        </p>
      ) : null}

      {movies.isSuccess && movies.data.items.length > 0 ? (
        <div className={styles.track}>
          {movies.data.items.map((movie) => (
            <MovieCard key={movie.sk_movie_id} movie={movie} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
