import type { CatalogMetrics } from "../types/movie";

const HEADER = ["section", "name", "value", "detail"];

function cell(value: string | number): string {
  const text = String(value);
  if (/[;"\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function line(columns: Array<string | number>): string {
  return columns.map(cell).join(";");
}

export function buildMetricsCsv(metrics: CatalogMetrics, exportedAt: Date): string {
  const rows: Array<Array<string | number>> = [
    HEADER,
    ["export", "exported_at", exportedAt.toISOString(), "Snapshot of the Metrics page"],
    ["summary", "Movies", metrics.movie_count, "In the catalog"],
    ["summary", "Reviews", metrics.review_count, "Notes and comments"],
    ["summary", "Users", metrics.user_count, "Distinct names on reviews"],
    ["summary", "Unreviewed", metrics.unreviewed_count, "Movies with no review"],
    ["summary", "Average score", metrics.average_rating === null ? "" : metrics.average_rating.toFixed(1), "Mean of all review scores, 0 to 10"],
    ["summary", "Last 7 days", metrics.reviews_last_7_days, "Reviews saved this week"],
    ["summary", "Added in 7 days", metrics.movies_added_last_7_days, "Movies added in the app. The imported catalog is not included."],
    ["summary", "Today", metrics.catalog_seconds_today, "Seconds in the catalog today"],
    ["summary", "Next-day returns", metrics.returning_visitors, "Same anonymous browser on a day and the next. Creating a movie does not count."],
  ];

  for (const movie of metrics.most_viewed) {
    rows.push(["most_viewed", movie.titulo, movie.view_count, "opens"]);
  }
  for (const item of metrics.top_searches) {
    rows.push(["searches", item.search_term, item.search_count, item.empty_count]);
  }
  for (const genre of metrics.attention_by_genre) {
    rows.push(["attention_by_genre", genre.nome_genero, genre.duration_seconds, "seconds"]);
  }
  for (const person of metrics.top_reviewers) {
    rows.push(["most_reviews", person.nome, person.review_count, "reviews"]);
  }
  for (const movie of metrics.top_rated) {
    rows.push(["top_rated", movie.titulo, movie.average_rating.toFixed(1), movie.review_count]);
  }
  for (const genre of metrics.genres) {
    rows.push(["movies_by_genre", genre.nome_genero, genre.movie_count, "movies"]);
  }

  return `\uFEFF${rows.map(line).join("\r\n")}\r\n`;
}

export function downloadMetricsCsv(metrics: CatalogMetrics): void {
  const exportedAt = new Date();
  const csv = buildMetricsCsv(metrics, exportedAt);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `cinedex-metrics-${exportedAt.toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
