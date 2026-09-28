import { PageHeader } from "../components/layout/PageHeader";
import { MovieStrip } from "../components/movies/MovieStrip";

export function DashboardPage() {
  return (
    <section>
      <PageHeader
        title="Discover"
        info="Browse movies by section, such as Trending and Top Rated. You can edit movies from the cards."
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
      <MovieStrip
        title="Trending"
        limit={12}
        sort="views"
        viewAllTo="/movies?sort=views"
        info="Movies opened the most. Each opening counts, and a refresh counts again."
        source="trending"
      />
    </section>
  );
}
