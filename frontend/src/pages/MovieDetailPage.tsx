import { useParams } from "react-router-dom";
import { PageHeader } from "../components/layout/PageHeader";
import styles from "./MovieDetailPage.module.css";

export function MovieDetailPage() {
  const { movieId } = useParams();

  return (
    <section>
      <PageHeader eyebrow="Movie Management" title="Movie detail" />
      <p className={styles.note}>Selected movie: {movieId}</p>
    </section>
  );
}
