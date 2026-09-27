import { PageHeader } from "../components/layout/PageHeader";
import { MovieForm } from "../components/movies/MovieForm";
import styles from "./AdminPage.module.css";

export function AdminPage() {
  return (
    <section>
      <PageHeader eyebrow="Movie Management" title="Admin" />
      <p className={styles.lead}>
        Add a movie here. To change or remove one, open it from All Movies. The pencil on the card edits it, and the movie page can edit or delete it.
      </p>
      <MovieForm />
    </section>
  );
}
