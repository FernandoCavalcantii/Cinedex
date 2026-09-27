import { useState } from 'react'
import MoviePlaceholderBg from './MoviePlaceholderBg'

const UNSPLASH_BASE = 'https://images.unsplash.com'

const recentlyAdded = [
  {
    id: 1,
    title: 'Hollow Signal',
    genre: 'Sci-Fi / Thriller',
    year: 2024,
    rating: 8.4,
    duration: '2h 18m',
    img: `${UNSPLASH_BASE}/photo-1676739666271-98982ae6a3c3?w=300&h=450&fit=crop&auto=format`,
  },
  {
    id: 2,
    title: 'The Iron Meridian',
    genre: 'Action / Drama',
    year: 2024,
    rating: 7.9,
    duration: '2h 03m',
    img: `${UNSPLASH_BASE}/photo-1614201842267-206a09286c3b?w=300&h=450&fit=crop&auto=format`,
  },
  {
    id: 3,
    title: 'Nocturne',
    genre: 'Crime / Mystery',
    year: 2024,
    rating: 8.7,
    duration: '1h 54m',
    img: `${UNSPLASH_BASE}/photo-1555768496-d7da8fe3468e?w=300&h=450&fit=crop&auto=format`,
  },
  {
    id: 4,
    title: 'Fracture Line',
    genre: 'Drama',
    year: 2024,
    rating: 7.2,
    duration: '1h 47m',
    img: `${UNSPLASH_BASE}/photo-1581140875849-80b9153138d1?w=300&h=450&fit=crop&auto=format`,
  },
  {
    id: 5,
    title: 'Black Latitude',
    genre: 'Adventure',
    year: 2024,
    rating: 8.1,
    duration: '2h 31m',
    img: `${UNSPLASH_BASE}/photo-1628637667791-292015de4bae?w=300&h=450&fit=crop&auto=format`,
  },
  {
    id: 6,
    title: 'Cascade Protocol',
    genre: 'Action / Sci-Fi',
    year: 2024,
    rating: 7.6,
    duration: '2h 08m',
    img: `${UNSPLASH_BASE}/photo-1627133805103-ce2d34ccdd37?w=300&h=450&fit=crop&auto=format`,
  },
]

const mostPopular = [
  {
    id: 7,
    title: 'Ember Throne',
    genre: 'Fantasy / Epic',
    year: 2023,
    rating: 9.1,
    duration: '3h 02m',
    views: '4.2M',
    img: `${UNSPLASH_BASE}/photo-1708544483196-9e71da0c2b18?w=300&h=450&fit=crop&auto=format`,
  },
  {
    id: 8,
    title: 'Steel Vow',
    genre: 'Action',
    year: 2023,
    rating: 8.5,
    duration: '2h 14m',
    views: '3.8M',
    img: `${UNSPLASH_BASE}/photo-1665314567748-37ac2ac92738?w=300&h=450&fit=crop&auto=format`,
  },
  {
    id: 9,
    title: 'Phantom Accord',
    genre: 'Thriller',
    year: 2023,
    rating: 8.8,
    duration: '2h 02m',
    views: '3.1M',
    img: `${UNSPLASH_BASE}/photo-1574923930958-9b653a0e5148?w=300&h=450&fit=crop&auto=format`,
  },
  {
    id: 10,
    title: 'Dusk Circuit',
    genre: 'Sci-Fi',
    year: 2023,
    rating: 7.7,
    duration: '1h 58m',
    views: '2.9M',
    img: `${UNSPLASH_BASE}/photo-1678140156938-3edd46de86ef?w=300&h=450&fit=crop&auto=format`,
  },
  {
    id: 11,
    title: 'Veiled Dominion',
    genre: 'Drama / History',
    year: 2023,
    rating: 8.3,
    duration: '2h 39m',
    views: '2.4M',
    img: `${UNSPLASH_BASE}/photo-1781209443147-a9ce6d197839?w=300&h=450&fit=crop&auto=format`,
  },
  {
    id: 12,
    title: 'Iron Veil',
    genre: 'War / Drama',
    year: 2023,
    rating: 8.9,
    duration: '2h 47m',
    views: '2.1M',
    img: `${UNSPLASH_BASE}/photo-1679129396357-6b11683760bc?w=300&h=450&fit=crop&auto=format`,
  },
]

const topRated = [
  { id: 1, title: 'Ember Throne', year: 2023, rating: 9.1, genre: 'Fantasy' },
  { id: 2, title: 'Iron Veil', year: 2023, rating: 8.9, genre: 'War / Drama' },
  { id: 3, title: 'Phantom Accord', year: 2023, rating: 8.8, genre: 'Thriller' },
  { id: 4, title: 'Nocturne', year: 2024, rating: 8.7, genre: 'Crime' },
  { id: 5, title: 'Hollow Signal', year: 2024, rating: 8.4, genre: 'Sci-Fi' },
  { id: 6, title: 'Steel Vow', year: 2023, rating: 8.5, genre: 'Action' },
  { id: 7, title: 'Veiled Dominion', year: 2023, rating: 8.3, genre: 'Drama' },
]

const recentActivity = [
  { id: 1, action: 'Added', title: 'Cascade Protocol', time: '2m ago', type: 'add' },
  { id: 2, action: 'Edited', title: 'Nocturne', time: '14m ago', type: 'edit' },
  { id: 3, action: 'Published', title: 'Black Latitude', time: '1h ago', type: 'pub' },
  { id: 4, action: 'Edited', title: 'Steel Vow', time: '3h ago', type: 'edit' },
  { id: 5, action: 'Deleted', title: 'Draft #042', time: '5h ago', type: 'del' },
  { id: 6, action: 'Added', title: 'Iron Meridian', time: '8h ago', type: 'add' },
]

function StarRating({ rating }: { rating: number }) {
  const pct = (rating / 10) * 100
  return (
    <div className="flex items-center gap-1.5">
      <div className="relative w-16 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
        <div className="rating-bar absolute inset-y-0 left-0 rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <span style={{ fontFamily: 'var(--font-display)', color: '#39e75f', fontSize: '13px', fontWeight: 600, letterSpacing: '0.03em' }}>
        {rating.toFixed(1)}
      </span>
    </div>
  )
}

function ActivityDot({ type }: { type: string }) {
  const colors: Record<string, string> = {
    add: '#39e75f',
    edit: '#ff6b35',
    pub: '#4da8ff',
    del: '#ff4545',
  }
  return (
    <div
      className="w-2 h-2 rounded-full flex-shrink-0 mt-0.5"
      style={{ background: colors[type] ?? '#555', boxShadow: `0 0 6px ${colors[type] ?? '#555'}80` }}
    />
  )
}

function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

function MovieCard({
  movie,
  rank,
  onClick,
}: {
  movie: typeof recentlyAdded[0] & { views?: string }
  rank?: number
  onClick?: () => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="relative flex-shrink-0 cursor-pointer group"
      style={{ width: '180px' }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Poster */}
      <div
        className="relative rounded-lg overflow-hidden"
        style={{
          height: '268px',
          background: '#242628',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          transform: hovered ? 'translateY(-4px) scale(1.02)' : 'translateY(0) scale(1)',
          boxShadow: hovered
            ? '0 16px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(57,231,95,0.2)'
            : '0 4px 16px rgba(0,0,0,0.4)',
        }}
      >
        <img
          src={movie.img}
          alt={movie.title}
          className="w-full h-full object-cover"
          style={{ opacity: hovered ? 0.75 : 0.9, transition: 'opacity 0.2s ease' }}
        />

        {/* Top rank badge */}
        {rank !== undefined && (
          <div
            className="absolute top-2 left-2 flex items-center justify-center rounded-sm"
            style={{
              background: 'rgba(255,107,53,0.95)',
              width: '28px',
              height: '28px',
              fontFamily: 'var(--font-display)',
              fontSize: '15px',
              fontWeight: 700,
              color: '#fff',
            }}
          >
            {rank}
          </div>
        )}

        {/* Edit icon overlay */}
        <div
          className="absolute top-2 right-2 flex items-center justify-center rounded-md"
          style={{
            background: 'rgba(0,0,0,0.7)',
            width: '28px',
            height: '28px',
            color: hovered ? '#39e75f' : 'rgba(255,255,255,0.4)',
            transition: 'color 0.2s ease, background 0.2s ease',
            backdropFilter: 'blur(4px)',
          }}
        >
          <EditIcon />
        </div>

        {/* Bottom gradient with info */}
        <div
          className="absolute bottom-0 inset-x-0 p-3"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.95) 60%, transparent)',
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.2s ease',
          }}
        >
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '12px', color: 'var(--color-text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {movie.genre}
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            {movie.duration}
          </div>
        </div>
      </div>

      {/* Card info below poster */}
      <div className="mt-2.5 px-0.5">
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '15px',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            lineHeight: 1.2,
            letterSpacing: '0.02em',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {movie.title}
        </h3>
        <div className="flex items-center justify-between mt-1">
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--color-text-muted)' }}>
            {movie.year}
          </span>
          <StarRating rating={movie.rating} />
        </div>
        {movie.views && (
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            {movie.views} views
          </div>
        )}
      </div>
    </div>
  )
}

function SectionHeader({ title, count }: { title: string; count: number }) {
  return (
    <div className="flex items-baseline justify-between mb-5">
      <div className="flex items-baseline gap-3">
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '22px',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          {title}
        </h2>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '13px',
            fontWeight: 600,
            color: '#39e75f',
            letterSpacing: '0.06em',
          }}
        >
          {count} TITLES
        </span>
      </div>
      <button
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '12px',
          color: 'var(--color-text-muted)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          letterSpacing: '0.03em',
          transition: 'color 0.15s ease',
        }}
        onMouseEnter={e => ((e.target as HTMLButtonElement).style.color = '#39e75f')}
        onMouseLeave={e => ((e.target as HTMLButtonElement).style.color = 'var(--color-text-muted)')}
      >
        View all →
      </button>
    </div>
  )
}

type Movie = typeof recentlyAdded[0] & { views?: string }

function MovieDetailView({ movie, onBack, showPlaceholder = false }: { movie: Movie; onBack: () => void; showPlaceholder?: boolean }) {
  const noCover = showPlaceholder

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--color-bg)', overflow: 'hidden' }}>
      {/* Mini topbar */}
      <div style={{
        height: '52px', background: 'var(--color-sidebar)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex', alignItems: 'center', padding: '0 24px', gap: '16px', flexShrink: 0,
      }}>
        <button
          onClick={onBack}
          style={{
            fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 600,
            letterSpacing: '0.06em', textTransform: 'uppercase',
            color: '#39e75f', background: 'transparent',
            border: '1px solid rgba(57,231,95,0.35)', borderRadius: '5px',
            padding: '5px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(57,231,95,0.08)')}
          onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = 'transparent')}
        >
          ← Back
        </button>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--color-text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Movie Management
        </span>
        <span style={{ color: 'var(--color-border)' }}>›</span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--color-text-secondary)' }}>
          {movie.title}
        </span>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Left panel — movie info */}
        <div style={{
          width: '380px', flexShrink: 0,
          background: 'var(--color-sidebar)',
          borderRight: '1px solid var(--color-border)',
          padding: '36px 32px',
          display: 'flex', flexDirection: 'column', gap: '24px',
          overflowY: 'auto',
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '6px' }}>
              Movie Detail
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '34px', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--color-text-primary)', lineHeight: 1.05 }}>
              {movie.title}
            </h1>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '6px' }}>
              {movie.year} · {movie.duration} · <span style={{ color: 'var(--color-text-secondary)' }}>Released</span>
            </div>
          </div>

          {/* Poster */}
          <div style={{
            width: '100%', aspectRatio: '2/3', borderRadius: '8px', overflow: 'hidden',
            background: '#242628', boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            border: '1px solid var(--color-border)',
          }}>
            <img src={movie.img} alt={movie.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          {/* Genre badge */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {movie.genre.split(' / ').map(g => (
              <span key={g} style={{
                fontFamily: 'var(--font-display)', fontSize: '11px', fontWeight: 600,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                color: 'var(--color-text-secondary)', background: 'var(--color-card)',
                border: '1px solid var(--color-border)', borderRadius: '4px', padding: '4px 10px',
              }}>
                {g}
              </span>
            ))}
          </div>

          {/* Rating row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '6px', letterSpacing: '0.04em' }}>
                Rating
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ flex: 1, height: '4px', background: 'var(--color-border)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(movie.rating / 10) * 100}%`, background: 'linear-gradient(90deg, #39e75f, #2bc44e)', borderRadius: '2px' }} />
                </div>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: '#39e75f', lineHeight: 1 }}>
                  {movie.rating}
                </span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--color-text-muted)' }}>/10</span>
              </div>
            </div>
            {movie.views && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: '#ff6b35' }}>{movie.views}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>views</div>
              </div>
            )}
          </div>

          {/* Studio (placeholder) */}
          <div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '4px', letterSpacing: '0.04em' }}>Studio</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-text-secondary)' }}>Cinedex Studios</div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
            <button style={{
              flex: 1, fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase', color: '#141517',
              background: 'linear-gradient(135deg, #39e75f, #2bc44e)',
              border: 'none', borderRadius: '6px', padding: '10px', cursor: 'pointer',
            }}>
              Edit Movie
            </button>
            <button style={{
              fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase', color: '#ff6b35',
              background: 'transparent', border: '1px solid rgba(255,107,53,0.35)',
              borderRadius: '6px', padding: '10px 16px', cursor: 'pointer',
            }}>
              Delete
            </button>
          </div>
        </div>

        {/* Right panel — background area */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#18191b' }}>
          {noCover ? (
            /* ── BEAUTIFUL PLACEHOLDER ── */
            <MoviePlaceholderBg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
          ) : (
            /* ── COVER HERO (with image) ── */
            <>
              <img
                src={movie.img}
                alt=""
                aria-hidden
                style={{
                  position: 'absolute', inset: 0, width: '100%', height: '100%',
                  objectFit: 'cover', opacity: 0.25,
                  filter: 'blur(2px) saturate(0.6)',
                }}
              />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(135deg, rgba(24,25,27,0.85) 0%, rgba(24,25,27,0.4) 100%)',
              }} />
            </>
          )}

          {/* Overlay content on top of either background */}
          <div style={{ position: 'relative', zIndex: 1, padding: '48px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: '10px', fontWeight: 600,
              color: '#39e75f', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '8px',
            }}>
              {movie.genre}
            </div>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: '52px', fontWeight: 800,
              letterSpacing: '0.04em', textTransform: 'uppercase',
              color: 'var(--color-text-primary)', lineHeight: 1,
              textShadow: '0 2px 24px rgba(0,0,0,0.8)', marginBottom: '12px',
            }}>
              {movie.title}
            </h2>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-text-secondary)' }}>{movie.year}</span>
              <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'var(--color-text-muted)', display: 'inline-block' }} />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-text-secondary)' }}>{movie.duration}</span>
              <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'var(--color-text-muted)', display: 'inline-block' }} />
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, color: '#39e75f' }}>★ {movie.rating}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [searchFocused, setSearchFocused] = useState(false)
  const [addHovered, setAddHovered] = useState(false)
  const [selectedMovie, setSelectedMovie] = useState<{ movie: Movie; placeholder: boolean } | null>(null)

  if (selectedMovie) {
    return <MovieDetailView movie={selectedMovie.movie} onBack={() => setSelectedMovie(null)} showPlaceholder={selectedMovie.placeholder} />
  }

  return (
    <div
      className="flex flex-col"
      style={{ height: '100vh', background: 'var(--color-bg)', overflow: 'hidden' }}
    >
      {/* ── TOP NAV ─────────────────────────────────────────────────── */}
      <header
        style={{
          height: '60px',
          background: 'var(--color-sidebar)',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          paddingLeft: '20px',
          paddingRight: '24px',
          gap: '20px',
          flexShrink: 0,
          zIndex: 10,
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5" style={{ width: '232px', flexShrink: 0 }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              background: '#39e75f',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#141517" strokeWidth="2.5" strokeLinecap="round">
              <rect x="2" y="7" width="20" height="15" rx="2" />
              <polyline points="17 2 12 7 7 2" />
            </svg>
          </div>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '18px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--color-text-primary)',
            }}
          >
            CINEDEX
          </span>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '10px',
              fontWeight: 600,
              color: '#39e75f',
              background: 'rgba(57,231,95,0.1)',
              border: '1px solid rgba(57,231,95,0.25)',
              borderRadius: '3px',
              padding: '1px 5px',
              letterSpacing: '0.06em',
            }}
          >
            PRO
          </span>
        </div>

        {/* Search bar */}
        <div className="flex-1 flex justify-center">
          <div
            style={{
              position: 'relative',
              maxWidth: '420px',
              width: '100%',
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke={searchFocused ? '#39e75f' : '#555a62'}
              strokeWidth="2"
              strokeLinecap="round"
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                transition: 'stroke 0.15s',
              }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search titles, genres, directors…"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={{
                width: '100%',
                background: 'var(--color-card)',
                border: `1px solid ${searchFocused ? 'rgba(57,231,95,0.4)' : 'var(--color-border)'}`,
                borderRadius: '6px',
                padding: '7px 12px 7px 34px',
                fontSize: '13px',
                color: 'var(--color-text-primary)',
                outline: 'none',
                fontFamily: 'var(--font-body)',
                transition: 'border-color 0.15s ease',
                boxShadow: searchFocused ? '0 0 0 3px rgba(57,231,95,0.08)' : 'none',
              }}
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Stats pill */}
          <div
            style={{
              background: 'var(--color-card)',
              border: '1px solid var(--color-border)',
              borderRadius: '6px',
              padding: '5px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
            }}
          >
            <div className="text-center">
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, color: '#39e75f', lineHeight: 1 }}>2,847</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '9px', color: 'var(--color-text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: '1px' }}>Movies</div>
            </div>
            <div style={{ width: '1px', height: '24px', background: 'var(--color-border)' }} />
            <div className="text-center">
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, color: '#ff6b35', lineHeight: 1 }}>142</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '9px', color: 'var(--color-text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: '1px' }}>Pending</div>
            </div>
          </div>

          {/* Admin profile */}
          <div className="flex items-center gap-2.5">
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #39e75f 0%, #2bc44e 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-display)',
                fontSize: '14px',
                fontWeight: 700,
                color: '#141517',
              }}
            >
              A
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1.2 }}>Admin</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--color-text-muted)' }}>Super User</div>
            </div>
          </div>

          {/* Add New Movie button */}
          <button
            onMouseEnter={() => setAddHovered(true)}
            onMouseLeave={() => setAddHovered(false)}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '14px',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: '#141517',
              background: addHovered
                ? 'linear-gradient(135deg, #48f570, #39e75f)'
                : 'linear-gradient(135deg, #39e75f, #2bc44e)',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              cursor: 'pointer',
              transition: 'background 0.15s ease, box-shadow 0.15s ease',
              boxShadow: addHovered
                ? '0 0 16px rgba(57,231,95,0.5), 0 4px 12px rgba(0,0,0,0.3)'
                : '0 2px 8px rgba(0,0,0,0.3)',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span style={{ fontSize: '16px', lineHeight: 1 }}>+</span>
            Add New Movie
          </button>
        </div>
      </header>

      {/* ── BODY: SIDEBAR + MAIN ────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── SIDEBAR ─────────────────────────────────────────────── */}
        <aside
          style={{
            width: '252px',
            flexShrink: 0,
            background: 'var(--color-sidebar)',
            borderRight: '1px solid var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Sidebar nav pills */}
          <div className="p-4 pb-3" style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
            {[
              { label: 'Dashboard', active: true, icon: '▪' },
              { label: 'All Movies', active: false, icon: '▪' },
              { label: 'Genres', active: false, icon: '▪' },
              { label: 'Directors', active: false, icon: '▪' },
              { label: 'Settings', active: false, icon: '▪' },
            ].map(item => (
              <button
                key={item.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  background: item.active ? 'rgba(57,231,95,0.1)' : 'transparent',
                  border: item.active ? '1px solid rgba(57,231,95,0.2)' : '1px solid transparent',
                  color: item.active ? '#39e75f' : 'var(--color-text-secondary)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '13px',
                  fontWeight: item.active ? 600 : 400,
                  cursor: 'pointer',
                  textAlign: 'left',
                  marginBottom: '2px',
                  transition: 'background 0.15s, color 0.15s',
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Scrollable list area */}
          <div className="flex-1 overflow-y-auto scroll-track px-4 py-4 flex flex-col gap-6">
            {/* TOP RATED */}
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--color-text-muted)',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span style={{ color: '#39e75f' }}>▲</span> Top Rated Movies
              </div>
              <div className="flex flex-col gap-0.5">
                {topRated.map((m, i) => (
                  <div
                    key={m.id}
                    className="group"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '7px 8px',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.background = 'var(--color-card)')}
                    onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.background = 'transparent')}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '13px',
                        fontWeight: 700,
                        color: i < 3 ? '#ff6b35' : 'var(--color-text-muted)',
                        width: '16px',
                        textAlign: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '12px',
                          fontWeight: 500,
                          color: 'var(--color-text-primary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {m.title}
                      </div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--color-text-muted)' }}>
                        {m.genre} · {m.year}
                      </div>
                    </div>
                    <span
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: '#39e75f',
                        flexShrink: 0,
                      }}
                    >
                      {m.rating}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: '1px', background: 'var(--color-border-subtle)' }} />

            {/* RECENT ACTIVITY */}
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--color-text-muted)',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span style={{ color: '#ff6b35' }}>●</span> Recent Activity
              </div>
              <div className="flex flex-col gap-0.5">
                {recentActivity.map(a => (
                  <div
                    key={a.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                      padding: '7px 8px',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.background = 'var(--color-card)')}
                    onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.background = 'transparent')}
                  >
                    <ActivityDot type={a.type} />
                    <div className="flex-1 min-w-0">
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                        <span style={{ color: 'var(--color-text-muted)' }}>{a.action}</span>{' '}
                        <span
                          style={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: 'inline-block',
                            maxWidth: '100px',
                          }}
                        >
                          {a.title}
                        </span>
                      </div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '1px' }}>
                        {a.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* ── MAIN CONTENT ─────────────────────────────────────────── */}
        <main
          className="flex-1 overflow-y-auto scroll-track"
          style={{ background: 'var(--color-bg)', padding: '32px 32px 48px' }}
        >
          {/* Page title */}
          <div className="flex items-end justify-between mb-8">
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--color-text-muted)',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  marginBottom: '4px',
                }}
              >
                Movie Management
              </div>
              <h1
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '32px',
                  fontWeight: 800,
                  color: 'var(--color-text-primary)',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  lineHeight: 1,
                }}
              >
                Dashboard
              </h1>
            </div>

            {/* Quick stat row */}
            <div className="flex items-center gap-4">
              {[
                { label: 'Avg Rating', value: '8.4', accent: '#39e75f' },
                { label: 'This Month', value: '+34', accent: '#ff6b35' },
                { label: 'Total Views', value: '18.7M', accent: '#4da8ff' },
              ].map(s => (
                <div
                  key={s.label}
                  style={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    padding: '10px 18px',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '22px',
                      fontWeight: 700,
                      color: s.accent,
                      lineHeight: 1,
                    }}
                  >
                    {s.value}
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '10px',
                      color: 'var(--color-text-muted)',
                      marginTop: '3px',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RECENTLY ADDED ─────────────────────────────────────── */}
          <section className="mb-10">
            <SectionHeader title="Recently Added" count={recentlyAdded.length} />
            <div
              className="flex gap-4 overflow-x-auto scroll-track pb-3"
              style={{ scrollSnapType: 'x mandatory' }}
            >
              {recentlyAdded.map(m => (
                <div key={m.id} style={{ scrollSnapAlign: 'start' }}>
                  <MovieCard movie={m} onClick={() => setSelectedMovie({ movie: m, placeholder: false })} />
                </div>
              ))}
            </div>
          </section>

          {/* Divider */}
          <div
            style={{
              height: '1px',
              background: 'linear-gradient(90deg, transparent, var(--color-border) 20%, var(--color-border) 80%, transparent)',
              marginBottom: '36px',
            }}
          />

          {/* ── MOST POPULAR ───────────────────────────────────────── */}
          <section>
            <SectionHeader title="Most Popular" count={mostPopular.length} />
            <div
              className="flex gap-4 overflow-x-auto scroll-track pb-3"
              style={{ scrollSnapType: 'x mandatory' }}
            >
              {mostPopular.map((m, i) => (
                <div key={m.id} style={{ scrollSnapAlign: 'start' }}>
                  <MovieCard movie={m} rank={i + 1} onClick={() => setSelectedMovie({ movie: m, placeholder: false })} />
                </div>
              ))}
            </div>
          </section>

          {/* ── GENRE QUICK-FILTER ─────────────────────────────────── */}
          <div className="mt-10">
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--color-text-muted)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginBottom: '12px',
              }}
            >
              Filter by Genre
            </div>
            <div className="flex flex-wrap gap-2">
              {['All', 'Action', 'Drama', 'Sci-Fi', 'Thriller', 'Fantasy', 'Crime', 'War', 'Adventure', 'History'].map(
                (g, i) => (
                  <button
                    key={g}
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '12px',
                      fontWeight: 600,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      padding: '5px 14px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      background: i === 0 ? 'rgba(57,231,95,0.12)' : 'var(--color-surface)',
                      border: i === 0 ? '1px solid rgba(57,231,95,0.3)' : '1px solid var(--color-border)',
                      color: i === 0 ? '#39e75f' : 'var(--color-text-secondary)',
                      transition: 'background 0.15s, color 0.15s, border-color 0.15s',
                    }}
                    onMouseEnter={e => {
                      if (i !== 0) {
                        ;(e.currentTarget as HTMLButtonElement).style.background = 'var(--color-card)'
                        ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-primary)'
                      }
                    }}
                    onMouseLeave={e => {
                      if (i !== 0) {
                        ;(e.currentTarget as HTMLButtonElement).style.background = 'var(--color-surface)'
                        ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-secondary)'
                      }
                    }}
                  >
                    {g}
                  </button>
                )
              )}
            </div>
          </div>

          {/* ── PLACEHOLDER PREVIEW BANNER ─────────────────────────── */}
          <div
            className="mt-10"
            style={{
              borderRadius: '10px',
              overflow: 'hidden',
              border: '1px solid var(--color-border)',
              cursor: 'pointer',
              position: 'relative',
            }}
            onClick={() =>
              setSelectedMovie({
                movie: { id: 99, title: 'Untitled Project', genre: 'Unknown Genre', year: 2024, rating: 0, duration: '—', img: '' },
                placeholder: true,
              })
            }
          >
            <div style={{ height: '140px', overflow: 'hidden' }}>
              <MoviePlaceholderBg />
            </div>
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column', gap: '8px',
              background: 'rgba(24,25,27,0.4)',
            }}>
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700,
                letterSpacing: '0.12em', textTransform: 'uppercase', color: '#39e75f',
              }}>
                Preview — No Cover Placeholder
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                Click to see the detail view background in full
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
