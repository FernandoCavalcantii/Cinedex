import { PageHeader } from "../components/layout/PageHeader";
import { ActivityFeed } from "../components/movies/ActivityFeed";
import { GenreStrip } from "../components/movies/GenreStrip";
import { MovieStrip } from "../components/movies/MovieStrip";

export function DashboardPage() {
  return (
    <section>
      <PageHeader
        title="Discover"
        info="Browse movies by section, such as Top Rated. Admin only: you can edit movies from the cards."
      />
      <MovieStrip title="Catalog" limit={12} viewAllTo="/movies" source="discover" />
      <MovieStrip
        title="Top Rated"
        limit={12}
        sort="rating"
        viewAllTo="/movies?sort=rating"
        info="Only movies with at least 3 reviews."
        source="top_rated"
      />
      <GenreStrip />
      <ActivityFeed />
    </section>
  );
}
