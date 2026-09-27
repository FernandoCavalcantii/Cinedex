import type React from 'react'

export default function MoviePlaceholderBg({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      className={className}
      viewBox="0 0 1200 700"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: '100%', display: 'block', ...style }}
      aria-label="CINEDEX — no cover available"
    >
      <defs>
        {/* Film grain noise */}
        <filter id="grain" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" stitchTiles="stitch" result="noise" />
          <feColorMatrix type="saturate" values="0" in="noise" result="grayNoise" />
          <feBlend in="SourceGraphic" in2="grayNoise" mode="overlay" result="blended" />
          <feComposite in="blended" in2="SourceGraphic" operator="in" />
        </filter>

        {/* Soft blur for glows */}
        <filter id="softBlur">
          <feGaussianBlur stdDeviation="40" />
        </filter>
        <filter id="medBlur">
          <feGaussianBlur stdDeviation="18" />
        </filter>
        <filter id="tinyBlur">
          <feGaussianBlur stdDeviation="3" />
        </filter>

        {/* Primary radial glow — positioned upper-right */}
        <radialGradient id="primaryGlow" cx="68%" cy="35%" r="55%" gradientUnits="objectBoundingBox">
          <stop offset="0%"   stopColor="#39e75f" stopOpacity="0.18" />
          <stop offset="40%"  stopColor="#39e75f" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#18191b" stopOpacity="0" />
        </radialGradient>

        {/* Secondary orange warmth — bottom left */}
        <radialGradient id="warmGlow" cx="18%" cy="80%" r="40%" gradientUnits="objectBoundingBox">
          <stop offset="0%"   stopColor="#ff6b35" stopOpacity="0.10" />
          <stop offset="100%" stopColor="#18191b" stopOpacity="0" />
        </radialGradient>

        {/* Lens ring gradient */}
        <radialGradient id="lensRingGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#39e75f" stopOpacity="0" />
          <stop offset="85%"  stopColor="#39e75f" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#39e75f" stopOpacity="0.2" />
        </radialGradient>

        {/* Rays clipping */}
        <clipPath id="bgClip">
          <rect width="1200" height="700" />
        </clipPath>
      </defs>

      {/* ── BASE ─────────────────────────────────────── */}
      <rect width="1200" height="700" fill="#18191b" />

      {/* ── ATMOSPHERIC GLOW LAYERS ─────────────────── */}
      <ellipse cx="820" cy="240" rx="520" ry="380" fill="url(#primaryGlow)" filter="url(#softBlur)" />
      <ellipse cx="210" cy="560" rx="320" ry="260" fill="url(#warmGlow)"   filter="url(#softBlur)" />

      {/* ── SCAN LINES (very subtle, horizontal) ─────── */}
      <g opacity="0.025">
        {Array.from({ length: 350 }, (_, i) => (
          <line key={i} x1="0" y1={i * 2} x2="1200" y2={i * 2} stroke="#fff" strokeWidth="0.6" />
        ))}
      </g>

      {/* ── LIGHT RAYS from focal point ──────────────── */}
      {/* Focal point: 820, 240 — matches the main glow */}
      <g clipPath="url(#bgClip)" opacity="1">
        {[
          { angle: -160, spread: 5 },
          { angle: -140, spread: 8 },
          { angle: -115, spread: 5 },
          { angle: -90,  spread: 7 },
          { angle: -65,  spread: 4 },
          { angle: -42,  spread: 9 },
          { angle: -20,  spread: 5 },
          { angle:   5,  spread: 6 },
          { angle:  30,  spread: 4 },
          { angle:  55,  spread: 8 },
          { angle:  80,  spread: 5 },
          { angle: 110,  spread: 6 },
          { angle: 140,  spread: 4 },
          { angle: 165,  spread: 7 },
        ].map((ray, i) => {
          const cx = 820, cy = 240
          const len = 900
          const rad = (ray.angle * Math.PI) / 180
          const halfSpread = (ray.spread / 2) * (Math.PI / 180)
          const x1 = cx + Math.cos(rad - halfSpread) * len
          const y1 = cy + Math.sin(rad - halfSpread) * len
          const x2 = cx + Math.cos(rad + halfSpread) * len
          const y2 = cy + Math.sin(rad + halfSpread) * len
          return (
            <polygon
              key={i}
              points={`${cx},${cy} ${x1},${y1} ${x2},${y2}`}
              fill="#39e75f"
              opacity={0.022 + (i % 3) * 0.008}
            />
          )
        })}
      </g>

      {/* ── LENS APERTURE RINGS ──────────────────────── */}
      {/* Center: offset from actual center for dynamic composition */}
      <g transform="translate(820, 300)">
        {/* Outer large ring */}
        <circle r="310" fill="none" stroke="#39e75f" strokeWidth="0.6" opacity="0.08" />
        {/* Second ring */}
        <circle r="240" fill="none" stroke="#39e75f" strokeWidth="0.8" opacity="0.11" />
        {/* Third ring with dashes */}
        <circle r="172" fill="none" stroke="#39e75f" strokeWidth="0.6" opacity="0.14"
          strokeDasharray="8 6" />
        {/* Fourth — orange accent */}
        <circle r="118" fill="none" stroke="#ff6b35" strokeWidth="0.8" opacity="0.12" />
        {/* Fifth tight */}
        <circle r="76"  fill="none" stroke="#39e75f" strokeWidth="1"   opacity="0.18" />
        {/* Center dot */}
        <circle r="3"   fill="#39e75f" opacity="0.3" />
        {/* Inner glow fill */}
        <circle r="76"  fill="url(#lensRingGrad)" opacity="0.4" filter="url(#tinyBlur)" />

        {/* Aperture blades (6 lines crossing the center rings) */}
        {[0, 30, 60, 90, 120, 150].map(deg => {
          const r = (deg * Math.PI) / 180
          return (
            <line
              key={deg}
              x1={Math.cos(r) * -310} y1={Math.sin(r) * -310}
              x2={Math.cos(r) *  310} y2={Math.sin(r) *  310}
              stroke="#39e75f"
              strokeWidth="0.4"
              opacity="0.05"
            />
          )
        })}
      </g>

      {/* ── FILM STRIP — TOP EDGE ───────────────────── */}
      <g opacity="0.35">
        <rect x="0" y="0" width="1200" height="28" fill="#0f1011" />
        <rect x="0" y="28" width="1200" height="1" fill="#39e75f" opacity="0.3" />
        {Array.from({ length: 38 }, (_, i) => (
          <rect
            key={i}
            x={i * 32 + 6} y="5"
            width="18" height="18"
            rx="2"
            fill="#18191b"
            stroke="#39e75f"
            strokeWidth="0.5"
            opacity="0.5"
          />
        ))}
      </g>

      {/* ── FILM STRIP — BOTTOM EDGE ─────────────────── */}
      <g opacity="0.35">
        <rect x="0" y="672" width="1200" height="28" fill="#0f1011" />
        <rect x="0" y="672" width="1200" height="1" fill="#39e75f" opacity="0.3" />
        {Array.from({ length: 38 }, (_, i) => (
          <rect
            key={i}
            x={i * 32 + 6} y="677"
            width="18" height="18"
            rx="2"
            fill="#18191b"
            stroke="#39e75f"
            strokeWidth="0.5"
            opacity="0.5"
          />
        ))}
      </g>

      {/* ── CORNER FRAME BRACKETS ───────────────────── */}
      {[
        { x: 36, y: 50, sx: 1,  sy: 1  },
        { x: 1164, y: 50,  sx: -1, sy: 1  },
        { x: 36, y: 650, sx: 1,  sy: -1 },
        { x: 1164, y: 650, sx: -1, sy: -1 },
      ].map((c, i) => (
        <g key={i} transform={`translate(${c.x},${c.y}) scale(${c.sx},${c.sy})`} opacity="0.3">
          <line x1="0" y1="0" x2="28" y2="0"  stroke="#39e75f" strokeWidth="1.5" />
          <line x1="0" y1="0" x2="0"  y2="28" stroke="#39e75f" strokeWidth="1.5" />
        </g>
      ))}

      {/* ── CINEDEX WATERMARK TEXT ──────────────────── */}
      {/* Main large outline wordmark */}
      <text
        x="600" y="415"
        textAnchor="middle"
        fontFamily="'Barlow Condensed', sans-serif"
        fontWeight="800"
        fontSize="188"
        letterSpacing="24"
        fill="none"
        stroke="#39e75f"
        strokeWidth="0.8"
        opacity="0.09"
      >
        CINEDEX
      </text>

      {/* Thinner echo — slightly offset for depth */}
      <text
        x="603" y="418"
        textAnchor="middle"
        fontFamily="'Barlow Condensed', sans-serif"
        fontWeight="800"
        fontSize="188"
        letterSpacing="24"
        fill="none"
        stroke="#ff6b35"
        strokeWidth="0.4"
        opacity="0.04"
      >
        CINEDEX
      </text>

      {/* Small tagline below */}
      <text
        x="600" y="448"
        textAnchor="middle"
        fontFamily="'Barlow Condensed', sans-serif"
        fontWeight="500"
        fontSize="14"
        letterSpacing="10"
        fill="#39e75f"
        opacity="0.18"
      >
        NO COVER AVAILABLE
      </text>

      {/* ── SCATTER PARTICLES ───────────────────────── */}
      {[
        [120, 120], [340, 80], [580, 95], [760, 60], [920, 110], [1080, 75],
        [160, 580], [420, 620], [700, 595], [950, 610], [1100, 575],
        [60,  310], [1150, 270], [200, 450], [1050, 420],
        [490, 160], [650, 540], [880, 400], [300, 340],
        [1020, 200], [70, 470], [740, 120], [550, 620],
      ].map(([px, py], i) => (
        <circle
          key={i}
          cx={px} cy={py}
          r={i % 4 === 0 ? 1.5 : 0.8}
          fill={i % 5 === 0 ? '#ff6b35' : '#39e75f'}
          opacity={0.15 + (i % 3) * 0.1}
        />
      ))}

      {/* ── FILM GRAIN OVERLAY ──────────────────────── */}
      <rect width="1200" height="700" fill="#18191b" opacity="0" filter="url(#grain)" />
      <rect width="1200" height="700" fill="url(#primaryGlow)" opacity="0.06" filter="url(#grain)" />
    </svg>
  )
}
