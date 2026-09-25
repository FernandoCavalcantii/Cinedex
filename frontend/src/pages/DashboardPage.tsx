import { PageHeader } from "../components/layout/PageHeader";
import { MovieStrip } from "../components/movies/MovieStrip";

export function DashboardPage() {
  return (
    <section>
      <PageHeader eyebrow="Movie Management" title="Dashboard" />
      <MovieStrip title="Catalog" limit={12} viewAllTo="/movies" />
    </section>
  );
}
