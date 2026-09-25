import type { CSSProperties } from "react";
import styles from "./PosterMark.module.css";

const WASHES = [
  "186, 98, 64",
  "64, 128, 112",
  "78, 108, 176",
  "168, 82, 102",
  "184, 146, 72",
  "112, 90, 176",
  "58, 132, 150",
  "140, 104, 72",
];

function posterWash(title: string): string {
  let hash = 0;
  for (let index = 0; index < title.length; index += 1) {
    hash = (hash * 33 + title.charCodeAt(index)) >>> 0;
  }
  return WASHES[hash % WASHES.length];
}

type PosterMarkProps = {
  title: string;
  genres?: string[];
};

export function PosterMark({ title, genres = [] }: PosterMarkProps) {
  const style = { "--poster-wash": posterWash(title) } as CSSProperties;
  const genreLabel = genres.slice(0, 2).join(" · ");

  return (
    <span className={styles.mark} style={style}>
      <svg className={styles.watermark} viewBox="0 0 80 88" fill="currentColor" aria-hidden="true">
        <circle cx="28" cy="26" r="12" opacity="0.55" />
        <circle cx="44" cy="18" r="13" opacity="0.7" />
        <circle cx="58" cy="28" r="11" opacity="0.5" />
        <circle cx="36" cy="34" r="10" opacity="0.45" />
        <circle cx="52" cy="36" r="9" opacity="0.4" />
        <path d="M18 42h44l-6 40H24z" />
        <path d="M34 44h8l-1 36h-6z" opacity="0.35" />
      </svg>
      <span className={styles.intro}>
        <span className={styles.brand} aria-hidden="true">
          <span className={styles.logo}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <rect x="2" y="7" width="20" height="15" rx="2" />
              <polyline points="17 2 12 7 7 2" />
            </svg>
          </span>
          <span className={styles.word}>Cinedex</span>
        </span>
        <span className={styles.presents}>apresenta...</span>
      </span>
      <span className={styles.title}>{title}</span>
      <span className={styles.genre}>{genreLabel}</span>
    </span>
  );
}
