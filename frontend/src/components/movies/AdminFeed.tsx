import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ApiError } from "../../services/api";
import { listAdminFeed } from "../../services/movies";
import { Button } from "../ui/Button";
import styles from "./AdminFeed.module.css";

function feedErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return "Could not load the feed.";
  }
  return "Could not reach the API.";
}

function formatWhen(value: string): string {
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) {
    return "";
  }
  const minutes = Math.round((Date.now() - then) / 60000);
  if (minutes < 1) {
    return "just now";
  }
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  const days = Math.round(hours / 24);
  if (days < 30) {
    return `${days}d ago`;
  }
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatScore(nota: number): string {
  return Number.isInteger(nota) ? nota.toFixed(1) : String(nota);
}

export function AdminFeed() {
  const feed = useQuery({
    queryKey: ["admin-feed"],
    queryFn: ({ signal }) => listAdminFeed(8, signal),
  });

  return (
    <div className={styles.panel}>
      {feed.isPending ? <p className={styles.status}>Loading activity…</p> : null}
      {feed.isError ? (
        <div className={styles.status}>
          <p>{feedErrorMessage(feed.error)}</p>
          <Button onClick={() => void feed.refetch()}>Try again</Button>
        </div>
      ) : null}
      {feed.isSuccess && feed.data.length === 0 ? <p className={styles.status}>Nothing here yet.</p> : null}
      {feed.isSuccess && feed.data.length > 0 ? (
        <ul className={styles.list}>
          {feed.data.map((item) => (
            <li key={item.kind === "review" ? item.sk_movie_review_id : `added-${item.sk_movie_id}`}>
              <Link className={styles.row} to={`/movies/${item.sk_movie_id}`}>
                <span className={item.kind === "added" ? styles.added : styles.kind}>
                  {item.kind === "added" ? "Added" : "Reviewed"}
                </span>
                <span className={styles.copy}>
                  <span className={styles.title}>{item.titulo}</span>
                  <span className={styles.meta}>
                    {item.kind === "review" && item.nome ? `${item.nome} · ` : ""}
                    {formatWhen(item.created_at)}
                  </span>
                </span>
                {item.kind === "review" && item.nota !== null ? (
                  <span className={styles.score}>{formatScore(item.nota)}</span>
                ) : (
                  <span className={styles.score} />
                )}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
