import { useParams } from "react-router-dom";
import { PageHeader } from "../components/layout/PageHeader";

export function MovieDetailPage() {
  const { movieId } = useParams();

  return (
    <section>
      <PageHeader eyebrow="Movie Management" title="Movie detail" />
      <p className="page-note">Selected movie: {movieId}</p>
    </section>
  );
}
