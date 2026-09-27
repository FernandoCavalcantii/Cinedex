import { useId } from "react";

const RAYS = [
  { angle: -160, spread: 5 },
  { angle: -140, spread: 8 },
  { angle: -115, spread: 5 },
  { angle: -90, spread: 7 },
  { angle: -65, spread: 4 },
  { angle: -42, spread: 9 },
  { angle: -20, spread: 5 },
  { angle: 5, spread: 6 },
  { angle: 30, spread: 4 },
  { angle: 55, spread: 8 },
  { angle: 80, spread: 5 },
  { angle: 110, spread: 6 },
  { angle: 140, spread: 4 },
  { angle: 165, spread: 7 },
];

const BRACKETS = [
  { x: 36, y: 50, sx: 1, sy: 1 },
  { x: 1164, y: 50, sx: -1, sy: 1 },
  { x: 36, y: 650, sx: 1, sy: -1 },
  { x: 1164, y: 650, sx: -1, sy: -1 },
];

const PARTICLES: Array<[number, number]> = [
  [120, 120],
  [340, 80],
  [580, 95],
  [760, 60],
  [920, 110],
  [1080, 75],
  [160, 580],
  [420, 620],
  [700, 595],
  [950, 610],
  [1100, 575],
  [60, 310],
  [1150, 270],
  [200, 450],
  [1050, 420],
  [490, 160],
  [650, 540],
  [880, 400],
  [300, 340],
  [1020, 200],
  [70, 470],
  [740, 120],
  [550, 620],
];

type MoviePlaceholderBgProps = {
  className?: string;
};

export function MoviePlaceholderBg({ className }: MoviePlaceholderBgProps) {
  const rawId = useId().replace(/:/g, "");
  const grain = `${rawId}-grain`;
  const softBlur = `${rawId}-soft-blur`;
  const tinyBlur = `${rawId}-tiny-blur`;
  const primaryGlow = `${rawId}-primary-glow`;
  const warmGlow = `${rawId}-warm-glow`;
  const lensRing = `${rawId}-lens-ring`;
  const clip = `${rawId}-clip`;

  return (
    <svg
      className={className}
      viewBox="0 0 1200 700"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <filter id={grain} x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" stitchTiles="stitch" result="noise" />
          <feColorMatrix type="saturate" values="0" in="noise" result="grayNoise" />
          <feBlend in="SourceGraphic" in2="grayNoise" mode="overlay" result="blended" />
          <feComposite in="blended" in2="SourceGraphic" operator="in" />
        </filter>
        <filter id={softBlur}>
          <feGaussianBlur stdDeviation="40" />
        </filter>
        <filter id={tinyBlur}>
          <feGaussianBlur stdDeviation="3" />
        </filter>
        <radialGradient id={primaryGlow} cx="68%" cy="35%" r="55%" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="#39e75f" stopOpacity="0.34" />
          <stop offset="40%" stopColor="#39e75f" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#18191b" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={warmGlow} cx="18%" cy="80%" r="40%" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="#39e75f" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#18191b" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={lensRing} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#39e75f" stopOpacity="0" />
          <stop offset="85%" stopColor="#39e75f" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#39e75f" stopOpacity="0.2" />
        </radialGradient>
        <clipPath id={clip}>
          <rect width="1200" height="700" />
        </clipPath>
      </defs>

      <rect width="1200" height="700" fill="#18191b" />
      <ellipse cx="820" cy="240" rx="520" ry="380" fill={`url(#${primaryGlow})`} filter={`url(#${softBlur})`} />
      <ellipse cx="210" cy="560" rx="320" ry="260" fill={`url(#${warmGlow})`} filter={`url(#${softBlur})`} />

      <g opacity="0.025">
        {Array.from({ length: 350 }, (_, index) => (
          <line key={index} x1="0" y1={index * 2} x2="1200" y2={index * 2} stroke="#fff" strokeWidth="0.6" />
        ))}
      </g>

      <g clipPath={`url(#${clip})`}>
        {RAYS.map((ray, index) => {
          const originX = 820;
          const originY = 240;
          const length = 900;
          const radians = (ray.angle * Math.PI) / 180;
          const halfSpread = (ray.spread / 2) * (Math.PI / 180);
          const x1 = originX + Math.cos(radians - halfSpread) * length;
          const y1 = originY + Math.sin(radians - halfSpread) * length;
          const x2 = originX + Math.cos(radians + halfSpread) * length;
          const y2 = originY + Math.sin(radians + halfSpread) * length;
          return (
            <polygon
              key={index}
              points={`${originX},${originY} ${x1},${y1} ${x2},${y2}`}
              fill="#39e75f"
              opacity={0.022 + (index % 3) * 0.008}
            />
          );
        })}
      </g>

      <g transform="translate(820, 300)">
        <circle r="310" fill="none" stroke="#39e75f" strokeWidth="0.8" opacity="0.2" />
        <circle r="240" fill="none" stroke="#39e75f" strokeWidth="1" opacity="0.26" />
        <circle r="172" fill="none" stroke="#39e75f" strokeWidth="0.8" opacity="0.32" strokeDasharray="8 6" />
        <circle r="118" fill="none" stroke="#39e75f" strokeWidth="1" opacity="0.22" />
        <circle r="76" fill="none" stroke="#39e75f" strokeWidth="1.4" opacity="0.4" />
        <circle r="3" fill="#39e75f" opacity="0.7" />
        <circle r="76" fill={`url(#${lensRing})`} opacity="0.4" filter={`url(#${tinyBlur})`} />
        {[0, 30, 60, 90, 120, 150].map((degrees) => {
          const radians = (degrees * Math.PI) / 180;
          return (
            <line
              key={degrees}
              x1={Math.cos(radians) * -310}
              y1={Math.sin(radians) * -310}
              x2={Math.cos(radians) * 310}
              y2={Math.sin(radians) * 310}
              stroke="#39e75f"
              strokeWidth="0.4"
              opacity="0.05"
            />
          );
        })}
      </g>

      <g opacity="0.35">
        <rect x="0" y="0" width="1200" height="28" fill="#0f1011" />
        <rect x="0" y="28" width="1200" height="1" fill="#39e75f" opacity="0.3" />
        {Array.from({ length: 38 }, (_, index) => (
          <rect
            key={index}
            x={index * 32 + 6}
            y="5"
            width="18"
            height="18"
            rx="2"
            fill="#18191b"
            stroke="#39e75f"
            strokeWidth="0.5"
            opacity="0.5"
          />
        ))}
      </g>
      <g opacity="0.35">
        <rect x="0" y="672" width="1200" height="28" fill="#0f1011" />
        <rect x="0" y="672" width="1200" height="1" fill="#39e75f" opacity="0.3" />
        {Array.from({ length: 38 }, (_, index) => (
          <rect
            key={index}
            x={index * 32 + 6}
            y="677"
            width="18"
            height="18"
            rx="2"
            fill="#18191b"
            stroke="#39e75f"
            strokeWidth="0.5"
            opacity="0.5"
          />
        ))}
      </g>

      {BRACKETS.map((bracket) => (
        <g
          key={`${bracket.x}-${bracket.y}`}
          transform={`translate(${bracket.x},${bracket.y}) scale(${bracket.sx},${bracket.sy})`}
          opacity="0.3"
        >
          <line x1="0" y1="0" x2="28" y2="0" stroke="#39e75f" strokeWidth="1.5" />
          <line x1="0" y1="0" x2="0" y2="28" stroke="#39e75f" strokeWidth="1.5" />
        </g>
      ))}

      <text
        x="894"
        y="520"
        textAnchor="end"
        fontFamily="Barlow Condensed, sans-serif"
        fontWeight="800"
        fontSize="120"
        letterSpacing="8"
        fill="none"
        stroke="#1f8f3a"
        strokeWidth="1.1"
        opacity="0.55"
      >
        CINEDEX
      </text>
      <text
        x="908"
        y="534"
        textAnchor="end"
        fontFamily="Barlow Condensed, sans-serif"
        fontWeight="800"
        fontSize="120"
        letterSpacing="8"
        fill="#39e75f"
        fillOpacity="0.24"
        stroke="#39e75f"
        strokeWidth="1.6"
        opacity="0.95"
      >
        CINEDEX
      </text>

      {PARTICLES.map(([x, y], index) => (
        <circle
          key={`${x}-${y}`}
          cx={x}
          cy={y}
          r={index % 4 === 0 ? 1.5 : 0.8}
          fill="#39e75f"
          opacity={0.15 + (index % 3) * 0.1}
        />
      ))}

      <rect width="1200" height="700" fill="#18191b" opacity="0" filter={`url(#${grain})`} />
      <rect width="1200" height="700" fill={`url(#${primaryGlow})`} opacity="0.06" filter={`url(#${grain})`} />
    </svg>
  );
}
