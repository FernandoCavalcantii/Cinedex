import { useParams } from "react-router-dom";
import { PageHeader } from "../components/layout/PageHeader";

export function MovieFormPage() {
  const { movieId } = useParams();
  const isEdit = Boolean(movieId);

  return (
    <section>
      <PageHeader
        eyebrow="Movie Management"
        title={isEdit ? "Edit movie" : "Add new movie"}
      />
    </section>
  );
}
