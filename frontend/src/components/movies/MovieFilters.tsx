import { useQuery } from "@tanstack/react-query";
import { useEffect, useId, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { listGenres } from "../../services/movies";
import { Button } from "../ui/Button";
import styles from "./MovieFilters.module.css";

const YEAR_MIN = 1888;
const YEAR_MAX = 2100;

function selectedGenres(params: URLSearchParams): string[] {
  const names = [...params.getAll("genres")];
  const legacy = params.get("genre")?.trim();
  if (legacy) {
    names.push(legacy);
  }
  const unique = new Map<string, string>();
  for (const name of names) {
    const cleaned = name.trim();
    if (cleaned) {
      unique.set(cleaned.toLowerCase(), cleaned);
    }
  }
  return [...unique.values()];
}

function parseYear(value: string): number | null {
  if (!/^\d{4}$/.test(value.trim())) {
    return null;
  }
  const year = Number(value);
  if (year < YEAR_MIN || year > YEAR_MAX) {
    return null;
  }
  return year;
}

function hasText(value: string): boolean {
  return value.trim() !== "";
}

export function MovieFilters() {
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [open, setOpen] = useState(false);
  const [draftGenres, setDraftGenres] = useState<string[]>(() => selectedGenres(searchParams));
  const [year, setYear] = useState(searchParams.get("year") ?? "");
  const [yearFrom, setYearFrom] = useState(searchParams.get("year_from") ?? "");
  const [yearTo, setYearTo] = useState(searchParams.get("year_to") ?? "");
  const genres = useQuery({
    queryKey: ["genres"],
    queryFn: ({ signal }) => listGenres(signal),
  });
  const appliedGenres = selectedGenres(searchParams);
  const appliedYear = Boolean(searchParams.get("year") || searchParams.get("year_from") || searchParams.get("year_to"));
  const activeCount = appliedGenres.length + (appliedYear ? 1 : 0);
  const exactLocked = hasText(yearFrom) || hasText(yearTo);
  const rangeLocked = hasText(year);
  const fromYear = parseYear(yearFrom);
  const toYear = parseYear(yearTo);
  const exactInvalid = rangeLocked && parseYear(year) === null;
  const fromInvalid = exactLocked && hasText(yearFrom) && fromYear === null;
  const toInvalid = exactLocked && hasText(yearTo) && toYear === null;
  const rangeError = exactLocked && fromYear !== null && toYear !== null && fromYear > toYear;
  const draftActive = draftGenres.length > 0 || rangeLocked || exactLocked;

  useEffect(() => {
    if (!open) {
      return;
    }
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function readAppliedDraft() {
    setDraftGenres(selectedGenres(searchParams));
    setYear(searchParams.get("year") ?? "");
    setYearFrom(searchParams.get("year_from") ?? "");
    setYearTo(searchParams.get("year_to") ?? "");
  }

  function toggleOpen() {
    setOpen((current) => {
      if (!current) {
        readAppliedDraft();
      }
      return !current;
    });
  }

  function toggleGenre(name: string) {
    const exists = draftGenres.some((item) => item.toLowerCase() === name.toLowerCase());
    setDraftGenres(
      exists
        ? draftGenres.filter((item) => item.toLowerCase() !== name.toLowerCase())
        : [...draftGenres, name],
    );
  }

  function clearDraft() {
    setDraftGenres([]);
    setYear("");
    setYearFrom("");
    setYearTo("");
  }

  function applyFilters() {
    if (exactInvalid || fromInvalid || toInvalid || rangeError) {
      return;
    }
    const params = new URLSearchParams(searchParams);
    params.delete("page");
    params.delete("genre");
    params.delete("genres");
    params.delete("year");
    params.delete("year_from");
    params.delete("year_to");
    for (const name of draftGenres) {
      params.append("genres", name);
    }
    if (rangeLocked) {
      const exact = parseYear(year);
      if (exact !== null) {
        params.set("year", String(exact));
      }
    } else {
      if (fromYear !== null) {
        params.set("year_from", String(fromYear));
      }
      if (toYear !== null) {
        params.set("year_to", String(toYear));
      }
    }
    setSearchParams(params);
    setOpen(false);
  }

  return (
    <div className={styles.wrap} ref={rootRef}>
      <button
        type="button"
        className={activeCount > 0 ? `${styles.trigger} ${styles.triggerOn}` : styles.trigger}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={toggleOpen}
      >
        Filters
        {activeCount > 0 ? <span className={styles.badge}>{activeCount}</span> : null}
      </button>
      {open ? (
        <div className={styles.panel} id={panelId}>
          <div className={styles.panelHead}>
            <p>Genres</p>
            {draftActive ? (
              <button type="button" className={styles.clear} onClick={clearDraft}>
                Clear
              </button>
            ) : null}
          </div>
          <p className={styles.note}>A movie matches if it has any selected genre.</p>
          {genres.isPending ? <p className={styles.note}>Loading genres…</p> : null}
          {genres.isSuccess ? (
            <div className={styles.genres}>
              {genres.data.map((genre) => {
                const checked = draftGenres.some((item) => item.toLowerCase() === genre.nome_genero.toLowerCase());
                return (
                  <label key={genre.sk_genre_id} className={styles.genre}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleGenre(genre.nome_genero)}
                    />
                    {genre.nome_genero}
                  </label>
                );
              })}
            </div>
          ) : null}
          <p className={styles.yearLabel}>Year</p>
          <div className={styles.years}>
            <label className={exactLocked ? styles.locked : undefined}>
              Exact
              <input
                inputMode="numeric"
                value={year}
                placeholder="1999"
                disabled={exactLocked}
                onChange={(event) => {
                  const next = event.target.value;
                  setYear(next);
                  if (hasText(next)) {
                    setYearFrom("");
                    setYearTo("");
                  }
                }}
              />
            </label>
            <label className={rangeLocked ? styles.locked : undefined}>
              From
              <input
                inputMode="numeric"
                value={yearFrom}
                placeholder="1990"
                disabled={rangeLocked}
                onChange={(event) => {
                  const next = event.target.value;
                  setYearFrom(next);
                  if (hasText(next)) {
                    setYear("");
                  }
                }}
              />
            </label>
            <label className={rangeLocked ? styles.locked : undefined}>
              To
              <input
                inputMode="numeric"
                value={yearTo}
                placeholder="2010"
                disabled={rangeLocked}
                onChange={(event) => {
                  const next = event.target.value;
                  setYearTo(next);
                  if (hasText(next)) {
                    setYear("");
                  }
                }}
              />
            </label>
          </div>
          {exactInvalid || fromInvalid || toInvalid ? (
            <p className={styles.error}>Use a 4-digit year from 1888 to 2100.</p>
          ) : null}
          {rangeError ? <p className={styles.error}>From must be the same year as To, or earlier.</p> : null}
          <p className={styles.note}>
            Exact keeps that year. From alone runs through the newest. To alone keeps every earlier year.
          </p>
          <div className={styles.apply}>
            <Button onClick={applyFilters} disabled={exactInvalid || fromInvalid || toInvalid || rangeError}>
              Apply Filters
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
