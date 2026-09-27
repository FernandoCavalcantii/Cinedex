import { useSearchParams } from "react-router-dom";
import { PageHeader } from "../components/layout/PageHeader";
import { MovieCatalog } from "../components/movies/MovieCatalog";

export function MoviesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";
  const requested = Number(searchParams.get("page"));
  const page = Number.isFinite(requested) && requested >= 1 ? Math.floor(requested) : 1;

  function onPageChange(nextPage: number) {
    const params = new URLSearchParams(searchParams);
    if (nextPage <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(nextPage));
    }
    setSearchParams(params);
  }

  return (
    <section>
      <PageHeader eyebrow="Movie Management" title={query ? `Results for “${query}”` : "All Movies"} />
      <MovieCatalog search={query || undefined} page={page} onPageChange={onPageChange} />
    </section>
  );
}
