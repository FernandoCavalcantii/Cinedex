import { useQuery } from "@tanstack/react-query";
import { DragEvent, MouseEvent, PointerEvent, useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../../services/api";
import { listMovies } from "../../services/movies";
import { Button } from "../ui/Button";
import { MovieCard } from "./MovieCard";
import styles from "./MovieStrip.module.css";

type MovieStripProps = {
  title: string;
  limit?: number;
  search?: string;
  genre?: string;
  sort?: "title" | "rating";
  viewAllTo?: string;
  showTotal?: boolean;
  info?: string;
};

function catalogErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return "Could not load the catalog.";
  }
  return "Could not reach the API.";
}

const DRAG_THRESHOLD_PX = 6;
const MAX_VELOCITY = 2.8;
const FLICK_WINDOW_MS = 120;
const PAUSE_MS = 50;
const MIN_FLICK = 0.12;
const DECAY_PER_MS = 0.0024;

export function MovieStrip({
  title,
  limit = 12,
  search,
  genre,
  sort = "title",
  viewAllTo,
  showTotal = true,
  info,
}: MovieStripProps) {
  const infoId = useId();
  const movies = useQuery({
    queryKey: ["movies", { limit, search: search ?? "", genre: genre ?? "", sort }],
    queryFn: ({ signal }) =>
      listMovies({ limit, search, genre, sort: sort === "rating" ? "rating" : undefined }, signal),
  });

  const total = movies.data?.total ?? null;
  const trackRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef({ x: 0, scrollLeft: 0 });
  const pointerDown = useRef(false);
  const dragged = useRef(false);
  const velocity = useRef(0);
  const samples = useRef<{ x: number; t: number }[]>([]);
  const momentumFrame = useRef(0);
  const [dragging, setDragging] = useState(false);

  useEffect(() => () => cancelAnimationFrame(momentumFrame.current), []);

  function stopMomentum() {
    cancelAnimationFrame(momentumFrame.current);
  }

  function startMomentum() {
    const track = trackRef.current;
    if (!track || Math.abs(velocity.current) < MIN_FLICK) {
      setDragging(false);
      return;
    }

    let last = performance.now();
    const step = (now: number) => {
      const current = trackRef.current;
      if (!current) {
        return;
      }
      const elapsed = now - last;
      last = now;
      const maxScroll = current.scrollWidth - current.clientWidth;
      const next = current.scrollLeft + velocity.current * elapsed;
      if (next <= 0 || next >= maxScroll) {
        current.scrollLeft = Math.max(0, Math.min(maxScroll, next));
        velocity.current = 0;
        setDragging(false);
        return;
      }
      current.scrollLeft = next;
      velocity.current *= Math.exp(-DECAY_PER_MS * elapsed);
      if (Math.abs(velocity.current) > 0.02) {
        momentumFrame.current = requestAnimationFrame(step);
        return;
      }
      velocity.current = 0;
      setDragging(false);
    };

    momentumFrame.current = requestAnimationFrame(step);
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) {
      return;
    }
    const track = trackRef.current;
    if (!track) {
      return;
    }
    stopMomentum();
    dragStart.current = { x: event.clientX, scrollLeft: track.scrollLeft };
    samples.current = [{ x: event.clientX, t: event.timeStamp }];
    velocity.current = 0;
    pointerDown.current = true;
    dragged.current = false;
    setDragging(true);
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const track = trackRef.current;
    if (!track || !pointerDown.current) {
      return;
    }
    const delta = event.clientX - dragStart.current.x;
    if (!dragged.current && Math.abs(delta) > DRAG_THRESHOLD_PX) {
      dragged.current = true;
      try {
        track.setPointerCapture(event.pointerId);
      } catch {
        // Alguns ponteiros não aceitam capture.
      }
    }
    samples.current.push({ x: event.clientX, t: event.timeStamp });
    const cutoff = event.timeStamp - FLICK_WINDOW_MS;
    samples.current = samples.current.filter((sample) => sample.t >= cutoff);
    track.scrollLeft = dragStart.current.scrollLeft - delta;
  }

  function flickVelocity(now: number) {
    const recent = samples.current.filter((sample) => now - sample.t <= FLICK_WINDOW_MS);
    if (recent.length < 2) {
      return 0;
    }
    const last = recent[recent.length - 1];
    if (now - last.t > PAUSE_MS) {
      return 0;
    }
    const first = recent[0];
    const elapsed = last.t - first.t;
    if (elapsed < 16) {
      return 0;
    }
    const speed = (first.x - last.x) / elapsed;
    return Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, speed));
  }

  function endDrag(event: PointerEvent<HTMLDivElement>) {
    if (!pointerDown.current) {
      return;
    }
    pointerDown.current = false;
    const track = trackRef.current;
    if (track?.hasPointerCapture(event.pointerId)) {
      track.releasePointerCapture(event.pointerId);
    }
    if (dragged.current) {
      velocity.current = flickVelocity(event.timeStamp);
      startMomentum();
      return;
    }
    setDragging(false);
  }

  function onDragStart(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
  }

  function onClickCapture(event: MouseEvent<HTMLDivElement>) {
    if (!dragged.current) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    dragged.current = false;
  }

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div className={styles.heading}>
          <span className={styles.titleGroup}>
            <h2>{title}</h2>
            {info ? (
              <span className={styles.hint}>
                <button type="button" className={styles.info} aria-label={`About ${title}`} aria-describedby={infoId}>
                  i
                </button>
                <span id={infoId} className={styles.tip} role="tooltip">
                  {info}
                </span>
              </span>
            ) : null}
          </span>
          {showTotal && total !== null ? <span>{total.toLocaleString("en-US")} titles</span> : null}
        </div>
        {viewAllTo ? (
          <Link className={styles.viewAll} to={viewAllTo}>
            View all →
          </Link>
        ) : null}
      </div>

      {movies.isPending ? <p className={styles.status}>Loading movies…</p> : null}

      {movies.isError ? (
        <div className={styles.status}>
          <p>{catalogErrorMessage(movies.error)}</p>
          <Button onClick={() => void movies.refetch()}>Try again</Button>
        </div>
      ) : null}

      {movies.isSuccess && movies.data.items.length === 0 ? (
        <p className={styles.status}>
          {search ? `No movies found for “${search}”.` : "No movies in the catalog."}
        </p>
      ) : null}

      {movies.isSuccess && movies.data.items.length > 0 ? (
        <div
          ref={trackRef}
          className={dragging ? `${styles.track} ${styles.dragging}` : styles.track}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onClickCapture={onClickCapture}
          onDragStart={onDragStart}
        >
          {movies.data.items.map((movie) => (
            <MovieCard key={movie.sk_movie_id} movie={movie} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
