import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ApiError } from "../../services/api";
import { createMovie, deleteMovie, getMovie, listGenres, updateMovie, type MovieInput } from "../../services/movies";
import { Button } from "../ui/Button";
import styles from "./MovieForm.module.css";

type MovieFormProps = {
  movieId?: string;
  onLeave: () => void;
};

const YEAR_MIN = 1888;
const YEAR_MAX = 2100;
const STATUSES = ["Lançado", "Pós-Produção", "Em Produção", "Planejado"] as const;

function yearFromDate(value: string): string {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value.slice(0, 4) : "";
}

function FieldHint({ label, children }: { label: string; children: ReactNode }) {
  const tipId = useId();

  return (
    <span className={styles.hint}>
      <button type="button" className={styles.info} aria-label={label} aria-describedby={tipId}>
        i
      </button>
      <span id={tipId} className={styles.tip} role="tooltip">
        {children}
      </span>
    </span>
  );
}

function directorIssue(value: string): string | null {
  const text = value.trim();
  if (!text) {
    return null;
  }
  if (text.length > 2000) {
    return "Use at most 2.000 characters.";
  }
  const names = text.split(",").map((name) => name.trim());
  if (names.some((name) => name === "")) {
    return "Separate director names with commas, for example Lana Wachowski, Lilly Wachowski.";
  }
  for (const name of names) {
    if (name.length > 255) {
      return "Each director name must be at most 255 characters.";
    }
    if (/\d/u.test(name)) {
      return `"${name}" can't include numbers.`;
    }
    if (!/^[\p{L}\p{M} .'-]+$/u.test(name)) {
      return `"${name}" can't include characters like #, @, or %.`;
    }
  }
  return null;
}

function imageUrlIssue(value: string): string | null {
  const url = value.trim();
  if (!url) {
    return null;
  }
  if (url.length > 2048) {
    return "Use at most 2.048 characters.";
  }
  if (!url.startsWith("https://") || !url.endsWith(".jpg")) {
    return "Start with https:// and end with .jpg.";
  }
  return null;
}

function durationIssue(value: string): string | null {
  const text = value.trim();
  if (!text) {
    return null;
  }
  if (!/^[1-9]\d*$/.test(text) || Number(text) > 100000) {
    return "Use 1 to 100.000 minutes.";
  }
  return null;
}

function dateIssue(value: string): string | null {
  if (!value) {
    return null;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return "Use a release date in mm/DD/yyyy.";
  }
  const year = Number(value.slice(0, 4));
  if (year < YEAR_MIN || year > YEAR_MAX) {
    return `The release year must be from ${YEAR_MIN} to ${YEAR_MAX}.`;
  }
  return null;
}

function titleIssue(value: string): string | null {
  const title = value.trim();
  if (!title) {
    return "Add a title.";
  }
  if (title.length > 500) {
    return "Title must be at most 500 characters.";
  }
  return null;
}

function statusIssue(value: string): string | null {
  if (value.length > 50) {
    return "Use at most 50 characters.";
  }
  return null;
}

function synopsisIssue(value: string): string | null {
  if (value.length > 4000) {
    return "Use at most 4.000 characters.";
  }
  return null;
}

function directorNames(people: { nome_pessoa: string; tipo_pessoa: string }[]): string {
  return people
    .filter((person) => person.tipo_pessoa === "Diretor")
    .map((person) => person.nome_pessoa)
    .join(", ");
}

export function MovieForm({ movieId, onLeave }: MovieFormProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = Boolean(movieId);
  const movie = useQuery({
    queryKey: ["movie", movieId],
    queryFn: ({ signal }) => getMovie(movieId ?? "", signal),
    enabled: isEdit,
  });
  const genres = useQuery({
    queryKey: ["genres"],
    queryFn: ({ signal }) => listGenres(signal),
  });
  const [title, setTitle] = useState("");
  const [director, setDirector] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [duration, setDuration] = useState("");
  const [status, setStatus] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [backdropUrl, setBackdropUrl] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deletePhrase, setDeletePhrase] = useState("");
  const deleteDialogRef = useRef<HTMLDialogElement>(null);
  const [ready, setReady] = useState(!isEdit);
  const savedTitle = movie.data?.titulo ?? "";
  const expectedPhrase = `delete ${savedTitle}`;
  const year = yearFromDate(releaseDate);
  const titleMessage = titleIssue(title);
  const directorMessage = directorIssue(director);
  const dateMessage = dateIssue(releaseDate);
  const durationMessage = durationIssue(duration);
  const statusMessage = statusIssue(status);
  const posterMessage = imageUrlIssue(posterUrl);
  const backdropMessage = imageUrlIssue(backdropUrl);
  const synopsisMessage = synopsisIssue(synopsis);
  const issue =
    titleMessage ??
    directorMessage ??
    dateMessage ??
    durationMessage ??
    statusMessage ??
    posterMessage ??
    backdropMessage ??
    synopsisMessage;

  useEffect(() => {
    if (!movie.data) {
      return;
    }
    setTitle(movie.data.titulo);
    setDirector(directorNames(movie.data.people));
    setReleaseDate(movie.data.data_lancamento ?? "");
    setDuration(movie.data.duracao_minutos?.toString() ?? "");
    setStatus(movie.data.status_filme ?? "");
    setPosterUrl(movie.data.url_poster ?? "");
    setBackdropUrl(movie.data.url_backdrop ?? "");
    setSynopsis(movie.data.sinopse ?? "");
    setSelectedGenres(movie.data.genres.map((genre) => genre.nome_genero));
    setReady(true);
  }, [movie.data]);

  const save = useMutation({
    mutationFn: (input: MovieInput) => (isEdit ? updateMovie(movieId ?? "", input) : createMovie(input)),
    onSuccess: async (saved) => {
      await queryClient.invalidateQueries({ queryKey: ["movies"] });
      await queryClient.invalidateQueries({ queryKey: ["metrics"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-feed"] });
      await queryClient.invalidateQueries({ queryKey: ["movie", saved.sk_movie_id] });
      navigate(`/movies/${saved.sk_movie_id}`);
    },
    onError: (caught: unknown) => {
      if (caught instanceof ApiError) {
        setError(caught.message);
        return;
      }
      setError("Could not reach the API.");
    },
  });

  const removal = useMutation({
    mutationFn: () => deleteMovie(movieId ?? ""),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["movies"] });
      await queryClient.invalidateQueries({ queryKey: ["metrics"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-feed"] });
      navigate("/movies");
    },
    onError: (caught: unknown) => {
      setError(caught instanceof ApiError ? caught.message : "Could not reach the API.");
    },
  });

  function dismissDelete() {
    setConfirmDelete(false);
    setDeletePhrase("");
  }

  useEffect(() => {
    const dialog = deleteDialogRef.current;
    if (!dialog || !confirmDelete) {
      return;
    }
    if (!dialog.open) {
      dialog.showModal();
    }
    dialog.querySelector("input")?.focus();
  }, [confirmDelete]);

  function toggleGenre(name: string) {
    setSelectedGenres((current) =>
      current.some((item) => item.toLowerCase() === name.toLowerCase())
        ? current.filter((item) => item.toLowerCase() !== name.toLowerCase())
        : [...current, name],
    );
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (issue) {
      setError(issue);
      return;
    }
    setError(null);
    const minutes = duration.trim() ? Number(duration) : null;
    const poster = posterUrl.trim();
    const backdrop = backdropUrl.trim();
    save.mutate({
      titulo: title.trim(),
      data_lancamento: releaseDate || null,
      ano_lancamento: year ? Number(year) : null,
      duracao_minutos: minutes,
      status_filme: status || null,
      url_poster: poster || null,
      url_backdrop: backdrop || null,
      sinopse: synopsis.trim() || null,
      generos: selectedGenres,
      diretor: director.trim(),
    });
  }

  if (isEdit && movie.isPending) {
    return <p className={styles.status}>Loading movie…</p>;
  }
  if (isEdit && movie.isError) {
    return <p className={styles.status}>Could not load this movie.</p>;
  }
  if (!ready) {
    return null;
  }

  return (
    <>
    <form className={styles.form} onSubmit={onSubmit}>
      <div className={styles.titleBlock}>
        <div className={styles.titleHead}>
          <span className={styles.labelRow}>
            <span className={styles.fieldLabel}>Title</span>
            <FieldHint label="About the title">500 characters at most.</FieldHint>
          </span>
          {isEdit ? (
            <button type="button" className={styles.remove} onClick={() => setConfirmDelete(true)}>
              Delete movie
            </button>
          ) : null}
        </div>
        {titleMessage && titleMessage !== "Add a title." ? <p className={styles.fieldError}>{titleMessage}</p> : null}
        <input
          value={title}
          className={titleMessage && titleMessage !== "Add a title." ? styles.invalid : undefined}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={500}
          placeholder="Ex: The Matrix"
          required
          aria-invalid={titleMessage && titleMessage !== "Add a title." ? true : undefined}
        />
      </div>
      <div className={styles.field}>
        <div className={styles.labelRow}>
          <label htmlFor="movie-director">Director</label>
          <FieldHint label="About the director">
            Separated by commas, ex: Lana Wachowski, Lilly Wachowski. No numbers. 2.000 characters at most.
          </FieldHint>
        </div>
        {directorMessage ? <p className={styles.fieldError}>{directorMessage}</p> : null}
        <input
          id="movie-director"
          className={directorMessage ? styles.invalid : undefined}
          value={director}
          onChange={(event) => setDirector(event.target.value)}
          placeholder="Ex: Lana Wachowski, Lilly Wachowski"
          aria-invalid={directorMessage ? true : undefined}
        />
      </div>
      <div className={styles.details}>
        <div className={styles.field}>
          <div className={styles.labelRow}>
            <label htmlFor="movie-release">Release date</label>
            <FieldHint label="About the release date">mm/DD/yyyy. Year from 1888 to 2100.</FieldHint>
          </div>
          {dateMessage ? <p className={styles.fieldError}>{dateMessage}</p> : null}
          <input
            id="movie-release"
            className={dateMessage ? styles.invalid : undefined}
            type="date"
            value={releaseDate}
            onChange={(event) => setReleaseDate(event.target.value)}
            aria-invalid={dateMessage ? true : undefined}
          />
        </div>
        <div className={styles.field}>
          <div className={styles.labelRow}>
            <label htmlFor="movie-duration">Duration</label>
            <FieldHint label="About the duration">Total length in minutes, from 1 to 100.000.</FieldHint>
          </div>
          {durationMessage ? <p className={styles.fieldError}>{durationMessage}</p> : null}
          <input
            id="movie-duration"
            className={durationMessage ? styles.invalid : undefined}
            inputMode="numeric"
            value={duration}
            onChange={(event) => setDuration(event.target.value)}
            placeholder="Ex: 136"
            aria-invalid={durationMessage ? true : undefined}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="movie-status">Status</label>
          {statusMessage ? <p className={styles.fieldError}>{statusMessage}</p> : null}
          <select
            id="movie-status"
            className={statusMessage ? styles.invalid : undefined}
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            aria-invalid={statusMessage ? true : undefined}
          >
            <option value="">—</option>
            {STATUSES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
            {status && !STATUSES.includes(status as (typeof STATUSES)[number]) ? (
              <option value={status}>{status}</option>
            ) : null}
          </select>
        </div>
      </div>
      <div className={styles.field}>
        <div className={styles.labelRow}>
          <label htmlFor="movie-poster">Poster URL</label>
          <FieldHint label="About the poster">Starts with https://, ends with .jpg, 2.048 characters at most.</FieldHint>
        </div>
        {posterMessage ? <p className={styles.fieldError}>{posterMessage}</p> : null}
        <input
          id="movie-poster"
          className={posterMessage ? styles.invalid : undefined}
          value={posterUrl}
          onChange={(event) => setPosterUrl(event.target.value)}
          placeholder="Ex: https://image.example.com/poster.jpg"
          aria-invalid={posterMessage ? true : undefined}
        />
      </div>
      <div className={styles.field}>
        <div className={styles.labelRow}>
          <label htmlFor="movie-backdrop">Backdrop URL</label>
          <FieldHint label="About the backdrop">Starts with https://, ends with .jpg, 2.048 characters at most.</FieldHint>
        </div>
        {backdropMessage ? <p className={styles.fieldError}>{backdropMessage}</p> : null}
        <input
          id="movie-backdrop"
          className={backdropMessage ? styles.invalid : undefined}
          value={backdropUrl}
          onChange={(event) => setBackdropUrl(event.target.value)}
          placeholder="Ex: https://image.example.com/backdrop.jpg"
          aria-invalid={backdropMessage ? true : undefined}
        />
      </div>
      <fieldset className={styles.genres}>
        <legend className={styles.labelRow}>
          Genres
          <FieldHint label="About the genres">You can select more than one, or none.</FieldHint>
        </legend>
        {genres.isPending ? <p>Loading genres…</p> : null}
        {genres.isSuccess ? (
          <div className={styles.genreList}>
            {genres.data.map((genre) => {
              const checked = selectedGenres.some((item) => item.toLowerCase() === genre.nome_genero.toLowerCase());
              return (
                <label key={genre.sk_genre_id} className={checked ? `${styles.genre} ${styles.genreOn}` : styles.genre}>
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
      </fieldset>
      <div className={styles.field}>
        <div className={styles.labelRow}>
          <label htmlFor="movie-synopsis">Synopsis</label>
          <FieldHint label="About the synopsis">4.000 characters at most.</FieldHint>
        </div>
        {synopsisMessage ? <p className={styles.fieldError}>{synopsisMessage}</p> : null}
        <textarea
          id="movie-synopsis"
          className={synopsisMessage ? styles.invalid : undefined}
          value={synopsis}
          onChange={(event) => setSynopsis(event.target.value)}
          rows={5}
          maxLength={4000}
          placeholder="Ex: A computer hacker learns that the world he lives in is a simulation."
          aria-invalid={synopsisMessage ? true : undefined}
        />
      </div>
      {error ? <p className={styles.error}>{error}</p> : null}
      <div className={styles.actions}>
        <Button type="submit" disabled={save.isPending || issue !== null}>
          {save.isPending ? "Saving…" : "Save"}
        </Button>
        <button type="button" className={styles.cancel} onClick={onLeave}>
          Cancel
        </button>
      </div>
    </form>
    {isEdit && confirmDelete ? (
      <dialog
        ref={deleteDialogRef}
        className={styles.dialog}
        aria-labelledby="delete-movie-title"
        onClose={dismissDelete}
        onClick={(event) => {
          const bounds = event.currentTarget.getBoundingClientRect();
          const inside =
            event.clientX >= bounds.left &&
            event.clientX <= bounds.right &&
            event.clientY >= bounds.top &&
            event.clientY <= bounds.bottom;
          if (!inside) {
            event.currentTarget.close();
          }
        }}
      >
        <h2 id="delete-movie-title">Delete movie</h2>
        <p>
          Type <strong>{expectedPhrase}</strong> to confirm.
        </p>
        <input
          value={deletePhrase}
          onChange={(event) => setDeletePhrase(event.target.value)}
          aria-label="Type the delete phrase"
          autoComplete="off"
        />
        <div className={styles.confirmActions}>
          <button
            type="button"
            className={styles.remove}
            disabled={removal.isPending || deletePhrase !== expectedPhrase}
            onClick={() => removal.mutate()}
          >
            {removal.isPending ? "Deleting…" : "Delete"}
          </button>
          <button type="button" className={styles.quiet} onClick={() => deleteDialogRef.current?.close()}>
            Cancel
          </button>
        </div>
      </dialog>
    ) : null}
    </>
  );
}
