import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useState } from "react";
import { ApiError } from "../../services/api";
import { createReview } from "../../services/movies";
import styles from "./ReviewForm.module.css";

type ReviewFormProps = {
  movieId: string;
};

export function ReviewForm({ movieId }: ReviewFormProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [score, setScore] = useState("0");
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  const review = useMutation({
    mutationFn: createReview,
    onSuccess: async () => {
      setName("");
      setScore("0");
      setComment("");
      setError(null);
      await queryClient.invalidateQueries({ queryKey: ["movie", movieId] });
    },
    onError: (caught: unknown) => {
      if (caught instanceof ApiError) {
        setError("Could not save this review.");
        return;
      }
      setError("Could not reach the API.");
    },
  });

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nome = name.trim();
    const comentario = comment.trim();
    const nota = Number(score);
    if (!nome || !comentario || Number.isNaN(nota) || nota < 0 || nota > 10) {
      setError("Add a name, a score from 0 to 10, and a review.");
      return;
    }
    setError(null);
    review.mutate({ movie_id: movieId, nome, nota, comentario });
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <div className={styles.row}>
        <label>
          Name
          <input value={name} onChange={(event) => setName(event.target.value)} maxLength={120} required />
        </label>
        <div className={styles.scoreField}>
          <div className={styles.scoreTitle}>
            <label htmlFor="review-score">Score</label>
            <span className={styles.hint}>
              <button type="button" className={styles.info} aria-label="About the score" aria-describedby="score-tip">
                i
              </button>
              <span id="score-tip" className={styles.tip} role="tooltip">
                0 to 10, in steps of 0.5.
              </span>
            </span>
          </div>
          <input
            id="review-score"
            type="number"
            min={0}
            max={10}
            step={0.5}
            value={score}
            onChange={(event) => setScore(event.target.value)}
            required
          />
        </div>
      </div>
      <label>
        Review
        <textarea value={comment} onChange={(event) => setComment(event.target.value)} maxLength={4000} rows={4} required />
      </label>
      {error ? <p className={styles.error}>{error}</p> : null}
      <button type="submit" disabled={review.isPending}>
        {review.isPending ? "Saving…" : "Add review"}
      </button>
    </form>
  );
}
