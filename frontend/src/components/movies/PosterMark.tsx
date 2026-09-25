import styles from "./PosterMark.module.css";

const SKIPPED_WORDS = new Set(["a", "an", "the", "o", "os", "as", "um", "uma"]);

function posterInitials(title: string): string {
  const words = title
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((word) => /\p{L}/u.test(word));
  const significant = words.filter((word) => !SKIPPED_WORDS.has(word.toLocaleLowerCase("en-US")));
  const chosen = (significant.length > 0 ? significant : words).slice(0, 2);
  if (chosen.length === 0) {
    return "—";
  }
  if (chosen.length === 1) {
    return chosen[0].slice(0, 2).toLocaleUpperCase("en-US");
  }
  return chosen.map((word) => word[0]).join("").toLocaleUpperCase("en-US");
}

type PosterMarkProps = {
  title: string;
};

export function PosterMark({ title }: PosterMarkProps) {
  return (
    <span className={styles.mark} aria-hidden="true">
      {posterInitials(title)}
    </span>
  );
}
