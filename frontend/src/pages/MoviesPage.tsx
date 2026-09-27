import { useSearchParams } from "react-router-dom";
import { PageHeader } from "../components/layout/PageHeader";
import { MovieCatalog } from "../components/movies/MovieCatalog";
import { MovieFilters } from "../components/movies/MovieFilters";

function readYear(value: string | null): number | undefined {
  if (!value || !/^\d{4}$/.test(value)) {
    return undefined;
  }
  const year = Number(value);
  if (year < 1888 || year > 2100) {
    return undefined;
  }
  return year;
}

export function MoviesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";
  const genres = [
    ...searchParams.getAll("genres"),
    ...(searchParams.get("genre") ? [searchParams.get("genre") ?? ""] : []),
  ]
    .map((name) => name.trim())
    .filter(Boolean);
  const year = readYear(searchParams.get("year"));
  const yearFrom = readYear(searchParams.get("year_from"));
  const yearTo = readYear(searchParams.get("year_to"));
  const sort = searchParams.get("sort") === "rating" ? "rating" : "title";
  const requested = Number(searchParams.get("page"));
  const page = Number.isFinite(requested) && requested >= 1 ? Math.floor(requested) : 1;

  let title = "All Movies";
  if (query) {
    title = `Results for “${query}”`;
  } else if (sort === "rating") {
    title = "Top Rated";
  } else if (genres.length === 1 && year === undefined && yearFrom === undefined && yearTo === undefined) {
    title = genres[0];
  }

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
      <PageHeader
        eyebrow="Movie Management"
        title={title}
        info={sort === "rating" && !query ? "Only movies with at least 3 reviews." : undefined}
      />
      <MovieFilters />
      <MovieCatalog
        search={query || undefined}
        genres={genres}
        year={year}
        yearFrom={yearFrom}
        yearTo={yearTo}
        sort={sort}
        page={page}
        onPageChange={onPageChange}
      />
    </section>
  );
}
