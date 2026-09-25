import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PageHeader } from "../components/layout/PageHeader";
import { PosterMark } from "../components/movies/PosterMark";
import { ApiError } from "../services/api";
import { getMovie } from "../services/movies";
import type { MovieDetail, PersonSummary } from "../types/movie";
import styles from "./MovieDetailPage.module.css";

const CAST_LIMIT = 12;

function detailErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 404) {
    return "This movie is not in the catalog.";
  }
  if (error instanceof ApiError) {
    return "Could not load this movie.";
  }
  return "Could not reach the API.";
}

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

function formatReviewDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function namesFor(people: PersonSummary[], role: string): string[] {
  return people.filter((person) => person.tipo_pessoa === role).map((person) => person.nome_pessoa);
}

function MovieHero({ movie }: { movie: MovieDetail }) {
  const [posterFailed, setPosterFailed] = useState(false);
  const posterUrl = posterFailed ? null : movie.url_poster;
  const duration = formatDuration(movie.duracao_minutos);
  const rating = movie.average_rating;
  const ratingWidth = rating === null ? 0 : Math.min(100, Math.max(0, (rating / 10) * 100));
  const facts = [movie.ano_lancamento?.toString(), duration, movie.status_filme].filter(
    (fact): fact is string => Boolean(fact),
  );
  const directors = namesFor(movie.people, "Diretor");
  const writers = namesFor(movie.people, "Roteirista");
  const cast = namesFor(movie.people, "Ator");
  const visibleCast = cast.slice(0, CAST_LIMIT);
  const hiddenCast = cast.length - visibleCast.length;
  const reviews = [...movie.reviews].sort((left, right) => right.created_at.localeCompare(left.created_at));

  return (
    <>
      <div className={styles.hero}>
        <div className={styles.poster}>
          {posterUrl ? (
            <img
              src={posterUrl}
              alt=""
              referrerPolicy="no-referrer"
              draggable={false}
              onError={() => setPosterFailed(true)}
            />
          ) : (
            <PosterMark title={movie.titulo} />
          )}
        </div>
        <div className={styles.intro}>
          <h2 className={styles.movieTitle}>{movie.titulo}</h2>
          {facts.length > 0 ? <p className={styles.facts}>{facts.join(" · ")}</p> : null}
          {movie.genres.length > 0 ? (
            <ul className={styles.genres}>
              {movie.genres.map((genre) => (
                <li key={genre.sk_genre_id}>{genre.nome_genero}</li>
              ))}
            </ul>
          ) : null}
          <p className={styles.score}>
            <span>{rating === null ? "—" : rating.toFixed(1)}</span>
            <span className={styles.outOf}>/10</span>
            <span className={styles.track} aria-hidden="true">
              <span className={styles.fill} style={{ width: `${ratingWidth}%` }} />
            </span>
            <span className={styles.count}>
              {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
            </span>
          </p>
          {movie.companies.length > 0 ? (
            <p className={styles.studios}>{movie.companies.map((company) => company.nome_produtora).join(", ")}</p>
          ) : null}
          <Link className={styles.edit} to={`/movies/${movie.sk_movie_id}/edit`}>
            Edit movie
          </Link>
        </div>
      </div>

      <section className={styles.block}>
        <h3>Synopsis</h3>
        <p>{movie.sinopse?.trim() || "No synopsis available."}</p>
      </section>

      {directors.length > 0 || writers.length > 0 || cast.length > 0 ? (
        <section className={styles.block}>
          <h3>Credits</h3>
          <dl className={styles.credits}>
            {directors.length > 0 ? (
              <div>
                <dt>Director</dt>
                <dd>{directors.join(", ")}</dd>
              </div>
            ) : null}
            {writers.length > 0 ? (
              <div>
                <dt>Writer</dt>
                <dd>{writers.join(", ")}</dd>
              </div>
            ) : null}
            {visibleCast.length > 0 ? (
              <div>
                <dt>Cast</dt>
                <dd>
                  {visibleCast.join(", ")}
                  {hiddenCast > 0 ? ` and ${hiddenCast} more` : ""}
                </dd>
              </div>
            ) : null}
          </dl>
        </section>
      ) : null}

      <section className={styles.block}>
        <h3>Reviews</h3>
        {reviews.length === 0 ? <p className={styles.empty}>No reviews yet.</p> : null}
        <ul className={styles.reviews}>
          {reviews.map((review) => (
            <li key={review.sk_movie_review_id}>
              <div className={styles.reviewHead}>
                <span>{review.nome}</span>
                <span>
                  {review.nota.toFixed(1)}
                  <span className={styles.outOf}>/10</span>
                </span>
              </div>
              <time dateTime={review.created_at}>{formatReviewDate(review.created_at)}</time>
              <p>{review.comentario}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

export function MovieDetailPage() {
  const { movieId } = useParams();
  const movie = useQuery({
    queryKey: ["movie", movieId],
    queryFn: ({ signal }) => getMovie(movieId ?? "", signal),
    enabled: Boolean(movieId),
  });
  const missing = movie.isError && movie.error instanceof ApiError && movie.error.status === 404;
  const [failedBackdropId, setFailedBackdropId] = useState<string | null>(null);
  const backdropUrl =
    movie.isSuccess && movie.data.url_backdrop && failedBackdropId !== movie.data.sk_movie_id
      ? movie.data.url_backdrop
      : null;

  return (
    <section className={movie.isSuccess ? styles.sheet : undefined}>
      {movie.isSuccess && backdropUrl ? (
        <img
          className={styles.backdrop}
          src={backdropUrl}
          alt=""
          referrerPolicy="no-referrer"
          onError={() => setFailedBackdropId(movie.data?.sk_movie_id ?? null)}
        />
      ) : null}
      {movie.isSuccess && !backdropUrl ? <div className={styles.brandBackdrop} aria-hidden="true" /> : null}
      <PageHeader eyebrow="Movie Management" title="Movie detail" />

      {movie.isPending ? <p className={styles.status}>Loading movie…</p> : null}

      {movie.isError ? (
        <div className={styles.status}>
          <p>{detailErrorMessage(movie.error)}</p>
          {missing ? (
            <Link className={styles.back} to="/movies">
              Back to catalog
            </Link>
          ) : (
            <button type="button" onClick={() => void movie.refetch()}>
              Try again
            </button>
          )}
        </div>
      ) : null}

      {movie.isSuccess ? <MovieHero movie={movie.data} /> : null}
    </section>
  );
}
