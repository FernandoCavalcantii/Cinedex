import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ApiError } from "../../services/api";
import { listRecentActivity } from "../../services/movies";
import { Button } from "../ui/Button";
import styles from "./ActivityFeed.module.css";

function activityErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return "Could not load recent activity.";
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

export function ActivityFeed() {
  const activity = useQuery({
    queryKey: ["activity"],
    queryFn: ({ signal }) => listRecentActivity(8, signal),
  });

  return (
    <section className={styles.section}>
      <h2>
        <span aria-hidden="true">●</span> Recent Activity
      </h2>
      {activity.isPending ? <p className={styles.status}>Loading activity…</p> : null}
      {activity.isError ? (
        <div className={styles.status}>
          <p>{activityErrorMessage(activity.error)}</p>
          <Button onClick={() => void activity.refetch()}>Try again</Button>
        </div>
      ) : null}
      {activity.isSuccess && activity.data.length === 0 ? (
        <p className={styles.status}>No reviews yet.</p>
      ) : null}
      {activity.isSuccess && activity.data.length > 0 ? (
        <ul className={styles.list}>
          {activity.data.map((item) => (
            <li key={item.sk_movie_review_id}>
              <Link className={styles.row} to={`/movies/${item.sk_movie_id}`} state={{ source: "activity" }}>
                <span className={styles.dot} aria-hidden="true" />
                <span className={styles.copy}>
                  <span className={styles.line}>
                    <span className={styles.action}>Reviewed</span> {item.titulo}
                  </span>
                  <span className={styles.meta}>
                    {item.nome} · {formatWhen(item.created_at)}
                  </span>
                </span>
                <span className={styles.score}>{formatScore(item.nota)}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
