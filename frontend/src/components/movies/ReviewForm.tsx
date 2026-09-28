import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useState } from "react";
import { ApiError } from "../../services/api";
import { createReview } from "../../services/movies";
import styles from "./ReviewForm.module.css";

type ReviewFormProps = {
  movieId: string;
};

function nameIssue(value: string): string | null {
  const name = value.trim();
  if (!name) {
    return "Add a name.";
  }
  if (name.length > 120) {
    return "Use at most 120 characters.";
  }
  if (!/^[\p{L}\p{M}\d _.'-]+$/u.test(name)) {
    return "Use letters, numbers, spaces, and characters like _ - . '";
  }
  return null;
}

function commentIssue(value: string): string | null {
  const comment = value.trim();
  if (!comment) {
    return "Add a review.";
  }
  if (value.length > 4000) {
    return "Use at most 4.000 characters.";
  }
  return null;
}

function scoreIssue(value: string): string | null {
  const score = value.trim();
  if (!/^(?:10(?:\.0)?|[0-9](?:\.\d)?)$/.test(score)) {
    return "Use 0 to 10, with at most one decimal place.";
  }
  return null;
}

export function ReviewForm({ movieId }: ReviewFormProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [score, setScore] = useState("0");
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [attempted, setAttempted] = useState(false);
  const nameMessage = nameIssue(name);
  const commentMessage = commentIssue(comment);
  const scoreMessage = scoreIssue(score);
  const visibleNameMessage = nameMessage && (nameMessage !== "Add a name." || attempted) ? nameMessage : null;
  const visibleCommentMessage = commentMessage && (commentMessage !== "Add a review." || attempted) ? commentMessage : null;
  const visibleScoreMessage = scoreMessage;

  const review = useMutation({
    mutationFn: createReview,
    onSuccess: async () => {
      setName("");
      setScore("0");
      setComment("");
      setError(null);
      setAttempted(false);
      await queryClient.invalidateQueries({ queryKey: ["movie", movieId] });
      await queryClient.invalidateQueries({ queryKey: ["metrics"] });
      await queryClient.invalidateQueries({ queryKey: ["activity"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-feed"] });
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
    if (nameMessage || commentMessage || scoreMessage) {
      setAttempted(true);
      return;
    }
    setError(null);
    review.mutate({ movie_id: movieId, nome: name.trim(), nota: Number(score), comentario: comment.trim() });
  }

  return (
    <form className={styles.form} noValidate onSubmit={onSubmit}>
      <div className={styles.row}>
        <div className={styles.field}>
          <div className={styles.scoreTitle}>
            <label htmlFor="review-name">Name</label>
            <span className={styles.hint}>
              <button type="button" className={styles.info} aria-label="About the name" aria-describedby="name-tip">
                i
              </button>
              <span id="name-tip" className={styles.tip} role="tooltip">
                120 characters at most. Letters, numbers, spaces, and _ - . '
              </span>
            </span>
          </div>
          {visibleNameMessage ? <p className={styles.fieldError}>{visibleNameMessage}</p> : null}
          <input
            id="review-name"
            className={visibleNameMessage ? styles.invalid : undefined}
            value={name}
            onChange={(event) => setName(event.target.value)}
            aria-invalid={visibleNameMessage ? true : undefined}
          />
        </div>
        <div className={styles.scoreField}>
          <div className={styles.scoreTitle}>
            <label htmlFor="review-score">Score</label>
            <span className={styles.hint}>
              <button type="button" className={styles.info} aria-label="About the score" aria-describedby="score-tip">
                i
              </button>
              <span id="score-tip" className={styles.tip} role="tooltip">
                0 to 10, with at most one decimal place.
              </span>
            </span>
          </div>
          {visibleScoreMessage ? <p className={styles.fieldError}>{visibleScoreMessage}</p> : null}
          <input
            id="review-score"
            className={visibleScoreMessage ? styles.invalid : undefined}
            inputMode="decimal"
            value={score}
            onChange={(event) => setScore(event.target.value)}
            aria-invalid={visibleScoreMessage ? true : undefined}
          />
        </div>
      </div>
      <div className={styles.field}>
        <div className={styles.scoreTitle}>
          <label htmlFor="review-comment">Review</label>
          <span className={styles.hint}>
            <button type="button" className={styles.info} aria-label="About the review" aria-describedby="review-tip">
              i
            </button>
            <span id="review-tip" className={styles.tip} role="tooltip">
              4.000 characters at most.
            </span>
          </span>
        </div>
        {visibleCommentMessage ? <p className={styles.fieldError}>{visibleCommentMessage}</p> : null}
        <textarea
          id="review-comment"
          className={visibleCommentMessage ? styles.invalid : undefined}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          rows={4}
          aria-invalid={visibleCommentMessage ? true : undefined}
        />
      </div>
      {error ? <p className={styles.error}>{error}</p> : null}
      <button type="submit" disabled={review.isPending || Boolean(nameMessage || commentMessage || scoreMessage)}>
        {review.isPending ? "Saving…" : "Add review"}
      </button>
    </form>
  );
}
