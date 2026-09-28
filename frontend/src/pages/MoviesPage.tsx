import { Link, useSearchParams } from "react-router-dom";
import { PageHeader } from "../components/layout/PageHeader";
import { MovieCatalog } from "../components/movies/MovieCatalog";
import catalogStyles from "../components/movies/MovieCatalog.module.css";
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
  const sortParam = searchParams.get("sort");
  const sort = sortParam === "rating" || sortParam === "views" ? sortParam : "title";
  const requested = Number(searchParams.get("page"));
  const page = Number.isFinite(requested) && requested >= 1 ? Math.floor(requested) : 1;

  const manageInfo = "The full movie catalog. Admin only: here you can manage movies, including add, edit, and delete.";
  let title = "All Movies";
  let info = manageInfo;
  if (query) {
    title = `Results for “${query}”`;
  } else if (sort === "rating") {
    title = "Top Rated";
    info = `${manageInfo} Only movies with at least 3 reviews.`;
  } else if (sort === "views") {
    title = "Trending";
    info = `${manageInfo} Ordered by how many times the page was opened.`;
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
        title={title}
        info={info}
      />
      <MovieCatalog
        toolbarStart={<MovieFilters />}
        toolbarEnd={
          <Link className={catalogStyles.add} to="/movies/new">
            Add movie
          </Link>
        }
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
