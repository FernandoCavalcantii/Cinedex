import { PageHeader } from "../components/layout/PageHeader";
import { ActivityFeed } from "../components/movies/ActivityFeed";
import { GenreStrip } from "../components/movies/GenreStrip";
import { MovieStrip } from "../components/movies/MovieStrip";

export function DashboardPage() {
  return (
    <section>
      <PageHeader eyebrow="Movie Management" title="Dashboard" />
      <MovieStrip title="Catalog" limit={12} viewAllTo="/movies" />
      <MovieStrip
        title="Top Rated"
        limit={12}
        sort="rating"
        viewAllTo="/movies?sort=rating"
        showTotal={false}
        info="Only movies with at least 3 reviews."
      />
      <GenreStrip />
      <ActivityFeed />
    </section>
  );
}
