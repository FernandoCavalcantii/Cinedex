import { useQuery } from "@tanstack/react-query";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { PageHeader } from "../components/layout/PageHeader";
import { Button } from "../components/ui/Button";
import { getCatalogMetrics } from "../services/movies";
import type { CatalogMetrics } from "../types/movie";
import styles from "./MetricsPage.module.css";

function formatCount(value: number): string {
  return value.toLocaleString("pt-BR");
}

function BackButton() {
  const navigate = useNavigate();
  const location = useLocation();

  function goBack() {
    if (location.key === "default") {
      navigate("/admin");
      return;
    }
    navigate(-1);
  }

  return (
    <Button className={styles.back} onClick={goBack}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M15 18l-6-6 6-6" />
      </svg>
      Back
    </Button>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <article className={styles.stat}>
      <p className={styles.statLabel}>{label}</p>
      <p className={styles.statValue}>{value}</p>
      <p className={styles.statNote}>{note}</p>
    </article>
  );
}

function MetricsBody({ metrics }: { metrics: CatalogMetrics }) {
  const largestGenre = metrics.genres.reduce((largest, genre) => Math.max(largest, genre.movie_count), 0);

  return (
    <>
      <div className={styles.stats}>
        <Stat label="Movies" value={formatCount(metrics.movie_count)} note="In the catalog" />
        <Stat label="Reviews" value={formatCount(metrics.review_count)} note="Notes and comments" />
        <Stat label="Users" value={formatCount(metrics.user_count)} note="Distinct names on reviews" />
        <Stat label="Unreviewed" value={formatCount(metrics.unreviewed_count)} note="Movies with no review" />
        <Stat
          label="Average"
          value={metrics.average_rating === null ? "—" : metrics.average_rating.toFixed(1)}
          note="Across all reviews"
        />
        <Stat label="Last 7 days" value={formatCount(metrics.reviews_last_7_days)} note="Reviews saved this week" />
      </div>

      <section className={styles.panel}>
        <h2>Most reviews</h2>
        {metrics.top_reviewers.length === 0 ? <p className={styles.empty}>No reviews yet.</p> : null}
        <ol className={styles.ranked}>
          {metrics.top_reviewers.map((person) => (
            <li key={person.nome}>
              <span>{person.nome}</span>
              <strong>{formatCount(person.review_count)}</strong>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.panel}>
        <h2>Top rated</h2>
        <p className={styles.hint}>At least 3 reviews.</p>
        {metrics.top_rated.length === 0 ? <p className={styles.empty}>No movie has 3 reviews yet.</p> : null}
        <ol className={styles.ranked}>
          {metrics.top_rated.map((movie) => (
            <li key={movie.sk_movie_id}>
              <Link to={`/movies/${movie.sk_movie_id}`}>{movie.titulo}</Link>
              <strong>
                {movie.average_rating.toFixed(1)}
                <span>{formatCount(movie.review_count)}</span>
              </strong>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.panel}>
        <h2>Movies by genre</h2>
        <p className={styles.hint}>A movie in two genres counts in both.</p>
        <ul className={styles.genres}>
          {metrics.genres.map((genre) => (
            <li key={genre.nome_genero}>
              <div className={styles.genreHead}>
                <span>{genre.nome_genero}</span>
                <strong>{formatCount(genre.movie_count)}</strong>
              </div>
              <span className={styles.bar} aria-hidden="true">
                <span style={{ width: largestGenre === 0 ? "0%" : `${(genre.movie_count / largestGenre) * 100}%` }} />
              </span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

export function MetricsPage() {
  const metrics = useQuery({
    queryKey: ["metrics"],
    queryFn: ({ signal }) => getCatalogMetrics(signal),
  });

  return (
    <section>
      <BackButton />
      <PageHeader
        title="Metrics"
        info="Users are distinct names on reviews. The same name counts once. When accounts exist, this number becomes registered users."
      />
      {metrics.isPending ? <p className={styles.status}>Loading metrics…</p> : null}
      {metrics.isError ? (
        <div className={styles.status}>
          <p>Could not load metrics.</p>
          <Button onClick={() => void metrics.refetch()}>Try again</Button>
        </div>
      ) : null}
      {metrics.isSuccess ? <MetricsBody metrics={metrics.data} /> : null}
    </section>
  );
}
