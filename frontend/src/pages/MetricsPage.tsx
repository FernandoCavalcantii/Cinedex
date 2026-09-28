import { useId, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { PageHeader } from "../components/layout/PageHeader";
import { Button } from "../components/ui/Button";
import { getCatalogMetrics } from "../services/movies";
import type { CatalogMetrics } from "../types/movie";
import { downloadMetricsCsv } from "./metricsCsv";
import styles from "./MetricsPage.module.css";

function formatCount(value: number): string {
  return value.toLocaleString("pt-BR");
}

function searchPath(term: string): string {
  const params = new URLSearchParams();
  params.set("q", term);
  return `/movies?${params.toString()}`;
}

function formatSpent(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  return `${formatCount(Math.round(seconds / 60))} min`;
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

function MetricInfo({ label, text }: { label: string; text: string }) {
  const infoId = useId();

  return (
    <span className={styles.infoWrap}>
      <button type="button" className={styles.info} aria-label={`About ${label}`} aria-describedby={infoId}>
        i
      </button>
      <span id={infoId} className={styles.tip} role="tooltip">
        {text}
      </span>
    </span>
  );
}

function Stat({ label, value, note, info }: { label: string; value: string; note: string; info: string }) {
  return (
    <article className={styles.stat}>
      <p className={styles.statLabel}>
        {label}
        <MetricInfo label={label} text={info} />
      </p>
      <p className={styles.statValue}>{value}</p>
      <p className={styles.statNote}>{note}</p>
    </article>
  );
}

function PanelTitle({ title, info }: { title: string; info: string }) {
  return (
    <div className={styles.panelTitle}>
      <h3>{title}</h3>
      <MetricInfo label={title} text={info} />
    </div>
  );
}

function BarChart({
  rows,
  showEmptyLegend,
  scroll,
}: {
  rows: {
    key: string;
    label: ReactNode;
    valueText: string;
    amount: number;
    scale: number;
    note?: string;
    emptyAmount?: number;
  }[];
  showEmptyLegend?: boolean;
  scroll?: boolean;
}) {
  return (
    <>
      {showEmptyLegend ? (
        <p className={styles.legend}>
          <span>
            <i className={styles.swatch} aria-hidden="true" /> With results
          </span>
          <span>
            <i className={styles.swatchMiss} aria-hidden="true" /> Empty
          </span>
        </p>
      ) : null}
      <ul className={scroll ? `${styles.bars} ${styles.barsScroll}` : styles.bars}>
        {rows.map((row) => {
          const empty = Math.min(row.emptyAmount ?? 0, row.amount);
          const found = row.amount - empty;
          const width = row.scale <= 0 || row.amount <= 0 ? 0 : (row.amount / row.scale) * 100;
          return (
            <li key={row.key}>
              <div className={styles.barHead}>
                <span className={styles.barLabel}>{row.label}</span>
                <strong>{row.valueText}</strong>
              </div>
              <span className={styles.track} aria-hidden="true">
                {width > 0 ? (
                  <span className={styles.fill} style={{ width: `${width}%` }}>
                    <span className={styles.found} style={{ flexGrow: found }} />
                    {empty > 0 ? <span className={styles.miss} style={{ flexGrow: empty }} /> : null}
                  </span>
                ) : null}
              </span>
              {row.note ? <span className={styles.barNote}>{row.note}</span> : null}
            </li>
          );
        })}
      </ul>
    </>
  );
}

function MetricsBody({ metrics }: { metrics: CatalogMetrics }) {
  const largestViews = metrics.most_viewed.reduce((largest, movie) => Math.max(largest, movie.view_count), 0);
  const largestSearch = metrics.top_searches.reduce((largest, item) => Math.max(largest, item.search_count), 0);
  const largestAttention = metrics.attention_by_genre.reduce(
    (largest, genre) => Math.max(largest, genre.duration_seconds),
    0,
  );
  const largestReviewer = metrics.top_reviewers.reduce((largest, person) => Math.max(largest, person.review_count), 0);
  const largestGenre = metrics.genres.reduce((largest, genre) => Math.max(largest, genre.movie_count), 0);
  const searchesHaveEmpty = metrics.top_searches.some((item) => item.empty_count > 0);

  return (
    <>
      <div className={styles.stats}>
        <Stat
          label="Movies"
          value={formatCount(metrics.movie_count)}
          note="In the catalog"
          info="Movies in the catalog. Adding one raises it. Deleting one lowers it."
        />
        <Stat
          label="Reviews"
          value={formatCount(metrics.review_count)}
          note="Notes and comments"
          info="Saved reviews. Deleting a movie removes its reviews. A review cannot be deleted alone."
        />
        <Stat
          label="Users"
          value={formatCount(metrics.user_count)}
          note="Distinct names on reviews"
          info={'Distinct names on reviews, exact text. "Ana" and "ana" count apart. Not accounts.'}
        />
        <Stat
          label="Unreviewed"
          value={formatCount(metrics.unreviewed_count)}
          note="Movies with no review"
          info="Movies with no review. The first review, or deleting the movie, lowers it."
        />
        <Stat
          label="Average score"
          value={metrics.average_rating === null ? "—" : metrics.average_rating.toFixed(1)}
          note="Mean of all review scores, 0 to 10"
          info="Mean of every review score, 0 to 10. A movie with more reviews pulls it more."
        />
        <Stat
          label="Last 7 days"
          value={formatCount(metrics.reviews_last_7_days)}
          note="Reviews saved this week"
          info="Reviews saved in the last 7 days. Imported reviews use the import time."
        />
        <Stat
          label="Added in 7 days"
          value={formatCount(metrics.movies_added_last_7_days)}
          note="From the screen"
          info="Movies added in the app in the last 7 days. The imported catalog is not included."
        />
        <Stat
          label="Today"
          value={formatSpent(metrics.catalog_seconds_today)}
          note="Time in the catalog today"
          info="Time the app was visible today, including movie pages. Counted once."
        />
        <Stat
          label="Next-day returns"
          value={formatCount(metrics.returning_visitors)}
          note="Two days in a row"
          info="Same anonymous browser on a day and the next. Creating a movie does not count."
        />
      </div>

      <div className={styles.board}>
        <h2 className={styles.group}>Usage</h2>
        <section className={`${styles.panel} ${styles.toneUsage}`}>
          <PanelTitle
            title="Most viewed"
            info="Top 5 by page openings. A refresh counts again. The edit pencil does not."
          />
          <p className={styles.hint}>Each opening of the movie page counts once.</p>
          {metrics.most_viewed.length === 0 ? <p className={styles.empty}>No visits yet.</p> : null}
          <BarChart
            rows={metrics.most_viewed.map((movie) => ({
              key: movie.sk_movie_id,
              label: (
                <Link to={`/movies/${movie.sk_movie_id}`} state={{ source: "metrics" }}>
                  {movie.titulo}
                </Link>
              ),
              valueText: formatCount(movie.view_count),
              amount: movie.view_count,
              scale: largestViews,
            }))}
          />
        </section>

        <section className={`${styles.panel} ${styles.toneUsage}`}>
          <PanelTitle
            title="Searches"
            info={'Top 8 exact search texts. Counts when the list loads. Empty means zero movies.'}
          />
          <p className={styles.hint}>Each search that runs counts. The same text later counts again.</p>
          {metrics.top_searches.length === 0 ? <p className={styles.empty}>No searches yet.</p> : null}
          <BarChart
            showEmptyLegend={searchesHaveEmpty}
            rows={metrics.top_searches.map((item) => ({
              key: item.search_term,
              label: <Link to={searchPath(item.search_term)}>{item.search_term}</Link>,
              valueText: formatCount(item.search_count),
              amount: item.search_count,
              scale: largestSearch,
              emptyAmount: item.empty_count,
              note: item.empty_count > 0 ? `${formatCount(item.empty_count)} empty` : undefined,
            }))}
          />
        </section>

        <section className={`${styles.panel} ${styles.wide} ${styles.toneTime}`}>
          <PanelTitle
            title="Attention by genre"
            info="Time on movie pages, top 8 genres. A movie in two genres counts in both."
          />
          <p className={styles.hint}>Time on the movie page. A movie in two genres counts in both.</p>
          {metrics.attention_by_genre.length === 0 ? <p className={styles.empty}>No time recorded yet.</p> : null}
          <BarChart
            rows={metrics.attention_by_genre.map((genre) => ({
              key: genre.nome_genero,
              label: genre.nome_genero,
              valueText: formatSpent(genre.duration_seconds),
              amount: genre.duration_seconds,
              scale: largestAttention,
            }))}
          />
        </section>

        <h2 className={styles.group}>Catalog</h2>
        <section className={`${styles.panel} ${styles.toneScore}`}>
          <PanelTitle
            title="Top rated"
            info="Top 5 average scores, only movies with at least 3 reviews."
          />
          <p className={styles.hint}>Score from 0 to 10. At least 3 reviews.</p>
          {metrics.top_rated.length === 0 ? <p className={styles.empty}>No movie has 3 reviews yet.</p> : null}
          <BarChart
            rows={metrics.top_rated.map((movie) => ({
              key: movie.sk_movie_id,
              label: (
                <Link to={`/movies/${movie.sk_movie_id}`} state={{ source: "metrics" }}>
                  {movie.titulo}
                </Link>
              ),
              valueText: movie.average_rating.toFixed(1),
              amount: movie.average_rating,
              scale: 10,
              note: `${formatCount(movie.review_count)} reviews`,
            }))}
          />
        </section>

        <section className={`${styles.panel} ${styles.toneVolume}`}>
          <PanelTitle
            title="Most reviews"
            info={'Top 8 names by review count, exact text. "Ana" and "ana" stay apart.'}
          />
          <p className={styles.hint}>Names with the most reviews.</p>
          {metrics.top_reviewers.length === 0 ? <p className={styles.empty}>No reviews yet.</p> : null}
          <BarChart
            rows={metrics.top_reviewers.map((person) => ({
              key: person.nome,
              label: person.nome,
              valueText: formatCount(person.review_count),
              amount: person.review_count,
              scale: largestReviewer,
            }))}
          />
        </section>

        <section className={`${styles.panel} ${styles.wide} ${styles.toneVolume}`}>
          <PanelTitle
            title="Movies by genre"
            info="Movies per genre. Movies with none are listed as No genre. A movie in two genres counts in both."
          />
          <p className={styles.hint}>Includes movies with no genre. A movie in two genres counts in both.</p>
          <BarChart
            scroll
            rows={metrics.genres.map((genre) => ({
              key: genre.nome_genero,
              label: genre.nome_genero,
              valueText: formatCount(genre.movie_count),
              amount: genre.movie_count,
              scale: largestGenre,
            }))}
          />
        </section>
      </div>
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
      <div className={styles.toolbar}>
        <BackButton />
        <Button disabled={!metrics.isSuccess} onClick={() => metrics.data && downloadMetricsCsv(metrics.data)}>
          Export
        </Button>
      </div>
      <PageHeader
        title="Metrics"
        info="Each number is calculated when this page loads. The i beside a metric states its exact rule."
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
