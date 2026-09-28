import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ApiError } from "../../services/api";
import { listGenres } from "../../services/movies";
import { Button } from "../ui/Button";
import styles from "./GenreStrip.module.css";

function genreErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return "Could not load genres.";
  }
  return "Could not reach the API.";
}

export function GenreStrip() {
  const genres = useQuery({
    queryKey: ["genres"],
    queryFn: ({ signal }) => listGenres(signal),
  });

  return (
    <section className={styles.section}>
      <h2>Filter by Genre</h2>
      {genres.isPending ? <p className={styles.status}>Loading genres…</p> : null}
      {genres.isError ? (
        <div className={styles.status}>
          <p>{genreErrorMessage(genres.error)}</p>
          <Button onClick={() => void genres.refetch()}>Try again</Button>
        </div>
      ) : null}
      {genres.isSuccess ? (
        <div className={styles.pills}>
          <Link className={styles.pill} to="/movies">
            All
          </Link>
          {genres.data.map((genre) => (
            <Link
              key={genre.sk_genre_id}
              className={styles.pill}
              to={`/movies?genres=${encodeURIComponent(genre.nome_genero)}`}
            >
              {genre.nome_genero}
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}
