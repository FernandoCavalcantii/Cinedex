import { useSearchParams } from "react-router-dom";
import { PageHeader } from "../components/layout/PageHeader";
import { MovieStrip } from "../components/movies/MovieStrip";

export function MoviesPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";

  return (
    <section>
      <PageHeader
        eyebrow="Movie Management"
        title={query ? `Results for “${query}”` : "All Movies"}
      />
      <MovieStrip title="Catalog" limit={20} search={query || undefined} />
    </section>
  );
}
