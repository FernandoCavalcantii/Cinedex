import { useSearchParams } from "react-router-dom";
import { PageHeader } from "../components/layout/PageHeader";

export function MoviesPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";

  return (
    <section>
      <PageHeader
        eyebrow="Movie Management"
        title={query ? `Results for “${query}”` : "All Movies"}
      />
    </section>
  );
}
