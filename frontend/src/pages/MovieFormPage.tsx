import { useLocation, useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../components/layout/PageHeader";
import { MovieForm } from "../components/movies/MovieForm";
import { Button } from "../components/ui/Button";
import styles from "./MovieFormPage.module.css";

export function MovieFormPage() {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  function leave() {
    if (location.key === "default") {
      navigate(movieId ? `/movies/${movieId}` : "/movies");
      return;
    }
    navigate(-1);
  }

  return (
    <section>
      <Button className={styles.back} onClick={leave}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Back
      </Button>
      <PageHeader title={movieId ? "Edit movie" : "Add movie"} />
      <MovieForm movieId={movieId} onLeave={leave} />
    </section>
  );
}
