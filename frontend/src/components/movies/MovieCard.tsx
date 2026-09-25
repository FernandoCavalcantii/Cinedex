import { useState } from "react";
import { Link } from "react-router-dom";
import type { MovieListItem } from "../../types/movie";
import { PosterMark } from "./PosterMark";
import styles from "./MovieCard.module.css";

type MovieCardProps = {
  movie: MovieListItem;
};

function formatDuration(minutes: number | null): string | null {
  if (!minutes) {
    return null;
  }
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) {
    return `${rest}m`;
  }
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

export function MovieCard({ movie }: MovieCardProps) {
  const genres = movie.genres
    .slice(0, 2)
    .map((genre) => genre.nome_genero)
    .join(" / ");
  const duration = formatDuration(movie.duracao_minutos);
  const rating = movie.average_rating;
  const ratingWidth = rating === null ? 0 : Math.min(100, Math.max(0, (rating / 10) * 100));
  const detailPath = `/movies/${movie.sk_movie_id}`;
  const [posterFailed, setPosterFailed] = useState(false);
  const posterUrl = posterFailed ? null : movie.url_poster;

  return (
    <article className={styles.card}>
      <Link className={styles.poster} to={detailPath} draggable={false}>
        {posterUrl ? (
          <img
            src={posterUrl}
            alt=""
            referrerPolicy="no-referrer"
            draggable={false}
            onError={() => setPosterFailed(true)}
          />
        ) : (
          <PosterMark title={movie.titulo} genres={movie.genres.map((genre) => genre.nome_genero)} />
        )}
        <span className={styles.overlay}>
          {genres ? <span>{genres}</span> : null}
          {duration ? <span>{duration}</span> : null}
        </span>
      </Link>
      <Link className={styles.edit} to={`${detailPath}/edit`} draggable={false} aria-label={`Edit ${movie.titulo}`}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      </Link>
      <div className={styles.meta}>
        <Link className={styles.title} to={detailPath} draggable={false}>
          {movie.titulo}
        </Link>
        <div className={styles.row}>
          <span>{movie.ano_lancamento ?? "—"}</span>
          <span className={styles.rating}>
            <span className={styles.track} aria-hidden="true">
              <span className={styles.fill} style={{ width: `${ratingWidth}%` }} />
            </span>
            <span>{rating === null ? "—" : rating.toFixed(1)}</span>
          </span>
        </div>
      </div>
    </article>
  );
}
