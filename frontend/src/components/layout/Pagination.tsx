import { Button } from "../ui/Button";
import styles from "./Pagination.module.css";

const WINDOW = 10;

type PageToken = number | "ellipsis";

export function pageTokens(current: number, last: number): PageToken[] {
  const safeLast = Math.max(1, last);
  const safeCurrent = Math.min(Math.max(1, current), safeLast);

  if (safeLast <= WINDOW) {
    return Array.from({ length: safeLast }, (_, index) => index + 1);
  }

  let start = 1;
  let end = WINDOW;
  if (safeCurrent >= 6) {
    start = safeCurrent - 3;
    end = start + WINDOW - 1;
    if (end > safeLast) {
      end = safeLast;
      start = safeLast - WINDOW + 1;
    }
  }

  const tokens: PageToken[] = [];
  if (start > 1) {
    tokens.push(1);
    if (start > 2) {
      tokens.push("ellipsis");
    }
  }
  for (let number = start; number <= end; number += 1) {
    tokens.push(number);
  }
  if (end < safeLast) {
    if (end < safeLast - 1) {
      tokens.push("ellipsis");
    }
    tokens.push(safeLast);
  }
  return tokens;
}

function formatPage(page: number): string {
  return page.toLocaleString("pt-BR");
}

type PaginationProps = {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
};

export function Pagination({ page, pageCount, onPageChange }: PaginationProps) {
  const tokens = pageTokens(page, pageCount);

  return (
    <nav className={styles.pager} aria-label="Pages">
      <Button onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
        Previous
      </Button>
      {tokens.map((token, index) =>
        token === "ellipsis" ? (
          <span key={`ellipsis-${index}`} className={styles.ellipsis} aria-hidden="true">
            …
          </span>
        ) : (
          <button
            key={token}
            type="button"
            className={token === page ? `${styles.page} ${styles.current}` : styles.page}
            aria-current={token === page ? "page" : undefined}
            onClick={() => onPageChange(token)}
          >
            {formatPage(token)}
          </button>
        ),
      )}
      <Button onClick={() => onPageChange(page + 1)} disabled={page >= pageCount}>
        Next
      </Button>
    </nav>
  );
}
