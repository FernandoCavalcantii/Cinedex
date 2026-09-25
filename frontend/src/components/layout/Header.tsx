import { FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

export function Header() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nextQuery = String(formData.get("q") ?? "").trim();
    const params = new URLSearchParams();
    if (nextQuery) {
      params.set("q", nextQuery);
    }
    const search = params.toString();
    navigate(search ? `/movies?${search}` : "/movies");
  }

  return (
    <header className="topbar">
      <Link className="brand" to="/">
        <span className="brand__mark" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <rect x="2" y="7" width="20" height="15" rx="2" />
            <polyline points="17 2 12 7 7 2" />
          </svg>
        </span>
        <span className="brand__name">Cinedex</span>
        <span className="brand__badge">Pro</span>
      </Link>

      <form className="search" onSubmit={onSubmit} role="search">
        <svg className="search__icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          name="q"
          type="search"
          defaultValue={query}
          key={query}
          placeholder="Search titles, genres, directors…"
          aria-label="Search movies"
        />
      </form>

      <div className="topbar__actions">
        <div className="profile">
          <span className="profile__avatar" aria-hidden="true">A</span>
          <span>
            <span className="profile__name">Admin</span>
            <span className="profile__role">Super User</span>
          </span>
        </div>
        <Link className="cta" to="/movies/new">
          <span aria-hidden="true">+</span>
          Add New Movie
        </Link>
      </div>
    </header>
  );
}
