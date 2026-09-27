import { useParams } from "react-router-dom";
import { PageHeader } from "../components/layout/PageHeader";
import { MovieForm } from "../components/movies/MovieForm";

export function MovieFormPage() {
  const { movieId } = useParams();

  return (
    <section>
      <PageHeader eyebrow="Admin" title={movieId ? "Edit movie" : "Add movie"} />
      <MovieForm movieId={movieId} />
    </section>
  );
}
