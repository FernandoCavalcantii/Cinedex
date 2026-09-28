import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import styles from "./Header.module.css";

const SEARCH_DELAY_MS = 300;
const KEPT_FILTERS = ["genres", "genre", "year", "year_from", "year_to", "sort"];

function catalogSearch(current: URLSearchParams, nextQuery: string): string {
  const params = new URLSearchParams();
  if (nextQuery) {
    params.set("q", nextQuery);
  }
  for (const key of KEPT_FILTERS) {
    for (const value of current.getAll(key)) {
      params.append(key, value);
    }
  }
  const search = params.toString();
  return search ? `/movies?${search}` : "/movies";
}

export function Header() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const [draft, setDraft] = useState(query);

  useEffect(() => {
    setDraft(query);
  }, [query]);

  useEffect(() => {
    const nextQuery = draft.trim();
    if (nextQuery === query) {
      return;
    }
    const handle = window.setTimeout(() => {
      navigate(catalogSearch(searchParams, nextQuery), { replace: true });
    }, SEARCH_DELAY_MS);
    return () => window.clearTimeout(handle);
  }, [draft, query, navigate, searchParams]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextQuery = draft.trim();
    if (nextQuery === query) {
      return;
    }
    navigate(catalogSearch(searchParams, nextQuery));
  }

  return (
    <header className={styles.topbar}>
      <Link className={styles.brand} to="/">
        <span className={styles.mark} aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <rect x="2" y="7" width="20" height="15" rx="2" />
            <polyline points="17 2 12 7 7 2" />
          </svg>
        </span>
        <span className={styles.name}>Cinedex</span>
        <span className={styles.badge}>Pro</span>
      </Link>

      <form className={styles.search} onSubmit={onSubmit} role="search">
        <svg className={styles.icon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          name="q"
          type="search"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Search titles, genres, directors…"
          aria-label="Search movies"
        />
      </form>

      <div className={styles.actions}>
        <div className={styles.profile}>
          <span className={styles.avatar} aria-hidden="true">A</span>
          <span>
            <span className={styles.profileName}>Admin</span>
            <span className={styles.profileRole}>Super User</span>
          </span>
        </div>
      </div>
    </header>
  );
}
