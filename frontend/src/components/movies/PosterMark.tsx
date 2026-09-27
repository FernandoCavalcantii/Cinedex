import type { CSSProperties } from "react";
import { useId } from "react";
import styles from "./PosterMark.module.css";

type CoverTheme = {
  bgFrom: string;
  bgTo: string;
  glowColor: string;
  strokeColor: string;
  fillColor: string;
  accentColor: string;
  dotColor: string;
  tagBg: string;
  tagText: string;
  yearText: string;
};

const THEMES: CoverTheme[] = [
  {
    bgFrom: "#060a1a",
    bgTo: "#0e1740",
    glowColor: "rgba(67,97,238,0.2)",
    strokeColor: "rgba(67,97,238,0.22)",
    fillColor: "rgba(67,97,238,0.08)",
    accentColor: "#4361ee",
    dotColor: "rgba(120,145,255,0.7)",
    tagBg: "rgba(67,97,238,0.18)",
    tagText: "#899bff",
    yearText: "#4d6aff",
  },
  {
    bgFrom: "#060f09",
    bgTo: "#0c2618",
    glowColor: "rgba(45,198,83,0.18)",
    strokeColor: "rgba(45,198,83,0.2)",
    fillColor: "rgba(45,198,83,0.07)",
    accentColor: "#2dc653",
    dotColor: "rgba(80,210,110,0.7)",
    tagBg: "rgba(45,198,83,0.15)",
    tagText: "#5ddf7a",
    yearText: "#2dc653",
  },
  {
    bgFrom: "#0f0614",
    bgTo: "#221030",
    glowColor: "rgba(155,93,229,0.22)",
    strokeColor: "rgba(155,93,229,0.2)",
    fillColor: "rgba(155,93,229,0.08)",
    accentColor: "#9b5de5",
    dotColor: "rgba(185,130,255,0.7)",
    tagBg: "rgba(155,93,229,0.17)",
    tagText: "#be8fff",
    yearText: "#a96de8",
  },
  {
    bgFrom: "#100507",
    bgTo: "#2e0c0e",
    glowColor: "rgba(239,35,60,0.2)",
    strokeColor: "rgba(239,35,60,0.18)",
    fillColor: "rgba(239,35,60,0.07)",
    accentColor: "#ef233c",
    dotColor: "rgba(255,80,100,0.7)",
    tagBg: "rgba(239,35,60,0.15)",
    tagText: "#ff6b7d",
    yearText: "#ef4055",
  },
  {
    bgFrom: "#0e0a05",
    bgTo: "#2a1c09",
    glowColor: "rgba(244,162,97,0.2)",
    strokeColor: "rgba(244,162,97,0.18)",
    fillColor: "rgba(244,162,97,0.07)",
    accentColor: "#f4a261",
    dotColor: "rgba(255,185,120,0.7)",
    tagBg: "rgba(244,162,97,0.15)",
    tagText: "#ffc28a",
    yearText: "#f4a261",
  },
  {
    bgFrom: "#050d0e",
    bgTo: "#0b2526",
    glowColor: "rgba(46,196,182,0.2)",
    strokeColor: "rgba(46,196,182,0.18)",
    fillColor: "rgba(46,196,182,0.07)",
    accentColor: "#2ec4b6",
    dotColor: "rgba(80,220,210,0.7)",
    tagBg: "rgba(46,196,182,0.15)",
    tagText: "#65d8ce",
    yearText: "#2ec4b6",
  },
  {
    bgFrom: "#0b0b05",
    bgTo: "#222208",
    glowColor: "rgba(233,196,106,0.2)",
    strokeColor: "rgba(233,196,106,0.18)",
    fillColor: "rgba(233,196,106,0.07)",
    accentColor: "#e9c46a",
    dotColor: "rgba(245,215,130,0.7)",
    tagBg: "rgba(233,196,106,0.15)",
    tagText: "#f0d593",
    yearText: "#e9c46a",
  },
  {
    bgFrom: "#060a0f",
    bgTo: "#0d1e30",
    glowColor: "rgba(96,165,250,0.2)",
    strokeColor: "rgba(96,165,250,0.18)",
    fillColor: "rgba(96,165,250,0.07)",
    accentColor: "#60a5fa",
    dotColor: "rgba(130,185,255,0.7)",
    tagBg: "rgba(96,165,250,0.15)",
    tagText: "#93c4fd",
    yearText: "#60a5fa",
  },
  {
    bgFrom: "#0c0505",
    bgTo: "#280f10",
    glowColor: "rgba(251,113,133,0.2)",
    strokeColor: "rgba(251,113,133,0.18)",
    fillColor: "rgba(251,113,133,0.07)",
    accentColor: "#fb7185",
    dotColor: "rgba(255,150,165,0.7)",
    tagBg: "rgba(251,113,133,0.15)",
    tagText: "#fd9faa",
    yearText: "#fb7185",
  },
  {
    bgFrom: "#060508",
    bgTo: "#14101c",
    glowColor: "rgba(167,139,250,0.2)",
    strokeColor: "rgba(167,139,250,0.18)",
    fillColor: "rgba(167,139,250,0.07)",
    accentColor: "#a78bfa",
    dotColor: "rgba(195,175,255,0.7)",
    tagBg: "rgba(167,139,250,0.15)",
    tagText: "#c4b0ff",
    yearText: "#a78bfa",
  },
];

const MODELS = ["reel", "rays", "clapper"] as const;

type CoverModel = (typeof MODELS)[number];

type PosterMarkProps = {
  title: string;
  year?: number | null;
  genres?: string[];
  duration?: number | null;
};

function titleHash(value: string): number {
  let hash = 5381;
  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) + hash) ^ value.charCodeAt(index);
  }
  return hash >>> 0;
}

function mix(seed: number, index: number): number {
  const value = Math.sin(seed * 0.00013 + index * 7919) * 99991;
  return value - Math.floor(value);
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) {
    return `${rest}min`;
  }
  if (rest === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${rest}min`;
}

function CinedexIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="1.5" y="4" width="21" height="15" rx="2.5" fill="#4ade80" />
      <rect x="3.5" y="6" width="17" height="11" rx="1.5" fill="rgba(0,0,0,0.35)" />
      <rect x="9" y="19.5" width="6" height="1.5" rx="0.75" fill="#4ade80" />
      <rect x="7" y="21" width="10" height="1" rx="0.5" fill="#4ade80" />
    </svg>
  );
}

function FilmReelArt({ seed, theme }: { seed: number; theme: CoverTheme }) {
  const rawId = useId().replace(/:/g, "");
  const width = 200;
  const height = 300;
  const centerX = 55 + mix(seed, 0) * 90;
  const centerY = 45 + mix(seed, 1) * 90;
  const radius = 58 + mix(seed, 2) * 32;
  const rotation = mix(seed, 3) * 360;
  const windowOrbit = radius * 0.52;
  const windowRadiusX = radius * 0.115;
  const windowRadiusY = radius * 0.235;
  const sprocketRadius = radius + 10;
  const secondRadius = radius * 0.4;
  const secondX = centerX + (mix(seed, 10) - 0.4) * width * 0.9;
  const secondY = centerY + (mix(seed, 11) + 0.25) * height * 0.55;
  const stripY = height * 0.84;
  const stripHeight = height * 0.09;
  const frameWidth = width / 5.5;
  const frameStart = -(mix(seed, 20) * frameWidth);
  const frameCount = Math.ceil(width / frameWidth) + 2;

  return (
    <svg className={styles.art} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <radialGradient id={`${rawId}-glow`} cx={centerX / width} cy={centerY / height} r="0.55" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={theme.glowColor} />
          <stop offset="80%" stopColor={theme.glowColor} stopOpacity={0} />
        </radialGradient>
        <clipPath id={`${rawId}-clip`}>
          <rect width={width} height={height} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${rawId}-clip)`}>
        <ellipse cx={centerX} cy={centerY} rx={radius * 2.6} ry={radius * 2.4} fill={`url(#${rawId}-glow)`} />
        <g transform={`rotate(${rotation} ${centerX} ${centerY})`}>
          <circle cx={centerX} cy={centerY} r={radius + 14} fill="none" stroke={theme.strokeColor} strokeWidth={0.4} opacity={0.5} />
          {Array.from({ length: 20 }, (_, index) => {
            const angle = (index / 20) * Math.PI * 2;
            const x = centerX + Math.cos(angle) * sprocketRadius;
            const y = centerY + Math.sin(angle) * sprocketRadius;
            const degrees = (index / 20) * 360;
            return (
              <rect
                key={index}
                x={x - 2.2}
                y={y - 3.6}
                width={4.4}
                height={7.2}
                rx={1}
                fill="rgba(0,0,0,0.55)"
                stroke={theme.strokeColor}
                strokeWidth={0.3}
                transform={`rotate(${degrees} ${x} ${y})`}
              />
            );
          })}
          <circle cx={centerX} cy={centerY} r={radius} fill={theme.fillColor} stroke={theme.strokeColor} strokeWidth={0.8} />
          <circle cx={centerX} cy={centerY} r={radius * 0.66} fill="none" stroke={theme.strokeColor} strokeWidth={0.4} opacity={0.7} />
          {Array.from({ length: 6 }, (_, index) => {
            const angle = (index / 6) * Math.PI * 2;
            const x = centerX + Math.cos(angle) * windowOrbit;
            const y = centerY + Math.sin(angle) * windowOrbit;
            const degrees = (angle * 180) / Math.PI + 90;
            return (
              <ellipse
                key={index}
                cx={x}
                cy={y}
                rx={windowRadiusX}
                ry={windowRadiusY}
                fill="rgba(0,0,0,0.5)"
                stroke={theme.strokeColor}
                strokeWidth={0.55}
                transform={`rotate(${degrees} ${x} ${y})`}
              />
            );
          })}
          <circle cx={centerX} cy={centerY} r={radius * 0.22} fill={theme.fillColor} stroke={theme.accentColor} strokeWidth={0.9} opacity={0.85} />
          <circle cx={centerX} cy={centerY} r={radius * 0.12} fill={theme.fillColor} stroke={theme.strokeColor} strokeWidth={0.5} opacity={0.7} />
          <circle cx={centerX} cy={centerY} r={radius * 0.052} fill={theme.accentColor} opacity={0.75} />
        </g>
        <g transform={`rotate(${rotation * 1.4} ${secondX} ${secondY})`} opacity={0.3}>
          <circle cx={secondX} cy={secondY} r={secondRadius} fill={theme.fillColor} stroke={theme.strokeColor} strokeWidth={0.5} />
          <circle cx={secondX} cy={secondY} r={secondRadius * 0.65} fill="none" stroke={theme.strokeColor} strokeWidth={0.35} />
          {Array.from({ length: 6 }, (_, index) => {
            const angle = (index / 6) * Math.PI * 2;
            const x = secondX + Math.cos(angle) * secondRadius * 0.52;
            const y = secondY + Math.sin(angle) * secondRadius * 0.52;
            const degrees = (angle * 180) / Math.PI + 90;
            return (
              <ellipse
                key={index}
                cx={x}
                cy={y}
                rx={secondRadius * 0.11}
                ry={secondRadius * 0.235}
                fill="rgba(0,0,0,0.45)"
                stroke={theme.strokeColor}
                strokeWidth={0.4}
                transform={`rotate(${degrees} ${x} ${y})`}
              />
            );
          })}
          <circle cx={secondX} cy={secondY} r={secondRadius * 0.19} fill="none" stroke={theme.accentColor} strokeWidth={0.65} />
          <circle cx={secondX} cy={secondY} r={secondRadius * 0.065} fill={theme.accentColor} opacity={0.6} />
        </g>
        <g opacity={0.45}>
          <rect x={0} y={stripY} width={width} height={stripHeight} fill="rgba(0,0,0,0.35)" stroke={theme.strokeColor} strokeWidth={0.35} />
          {Array.from({ length: frameCount }, (_, index) => {
            const x = frameStart + index * frameWidth;
            return (
              <g key={index}>
                <rect x={x + 3} y={stripY + 1.8} width={7} height={4.5} rx={0.9} fill="rgba(0,0,0,0.65)" stroke={theme.strokeColor} strokeWidth={0.25} />
                <rect x={x + 3} y={stripY + stripHeight - 6.3} width={7} height={4.5} rx={0.9} fill="rgba(0,0,0,0.65)" stroke={theme.strokeColor} strokeWidth={0.25} />
                <line x1={x} y1={stripY + 7.5} x2={x} y2={stripY + stripHeight - 7.5} stroke={theme.strokeColor} strokeWidth={0.3} />
              </g>
            );
          })}
        </g>
      </g>
    </svg>
  );
}

function ProjectorArt({
  seed,
  theme,
  fromLeft,
  showClapper,
}: {
  seed: number;
  theme: CoverTheme;
  fromLeft: boolean;
  showClapper: boolean;
}) {
  const rawId = useId().replace(/:/g, "");
  const width = 200;
  const height = 300;
  const sourceX = fromLeft ? -6 : width + 6;
  const sourceY = 12 + mix(seed, 1) * 40;
  const centerAngle = fromLeft
    ? ((15 + mix(seed, 2) * 35) * Math.PI) / 180
    : Math.PI - ((15 + mix(seed, 2) * 35) * Math.PI) / 180;
  const spread = ((22 + mix(seed, 3) * 22) * Math.PI) / 180;
  const beamLength = 340;
  const low = centerAngle - spread;
  const high = centerAngle + spread;
  const beam = [
    `${sourceX},${sourceY}`,
    `${sourceX + Math.cos(low) * beamLength},${sourceY + Math.sin(low) * beamLength}`,
    `${sourceX + Math.cos(high) * beamLength},${sourceY + Math.sin(high) * beamLength}`,
  ].join(" ");
  const rays = Array.from({ length: 6 }, (_, index) => {
    const angle = low + ((index + 1) / 7) * (spread * 2);
    return {
      angle,
      length: 180 + mix(seed, 10 + index) * 120,
      opacity: 0.06 + mix(seed, 16 + index) * 0.1,
    };
  });
  const motes = Array.from({ length: 18 }, (_, index) => ({
    x: mix(seed, 30 + index) * width,
    y: mix(seed, 48 + index) * height * 0.75 + 10,
    radius: 0.4 + mix(seed, 66 + index) * 1.5,
    opacity: 0.08 + mix(seed, 84 + index) * 0.35,
  }));
  const stripX = fromLeft ? width - 19 : 0;
  const stripWidth = 19;
  const frames = 9;
  const frameHeight = height / frames;
  const clapperX = fromLeft ? 18 : width - 52;
  const clapperY = 28 + mix(seed, 90) * 30;
  const clapperWidth = 34;

  return (
    <svg className={styles.art} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <radialGradient id={`${rawId}-glow`} cx={sourceX / width} cy={sourceY / height} r="1" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={theme.glowColor} stopOpacity={0.7} />
          <stop offset="100%" stopColor={theme.glowColor} stopOpacity={0} />
        </radialGradient>
        <clipPath id={`${rawId}-clip`}>
          <rect width={width} height={height} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${rawId}-clip)`}>
        <polygon points={beam} fill={`url(#${rawId}-glow)`} opacity={0.65} />
        {rays.map((ray, index) => (
          <line
            key={index}
            x1={sourceX}
            y1={sourceY}
            x2={sourceX + Math.cos(ray.angle) * ray.length}
            y2={sourceY + Math.sin(ray.angle) * ray.length}
            stroke={theme.accentColor}
            strokeWidth={0.55}
            opacity={ray.opacity}
          />
        ))}
        <line
          x1={sourceX}
          y1={sourceY}
          x2={sourceX + Math.cos(low) * beamLength}
          y2={sourceY + Math.sin(low) * beamLength}
          stroke={theme.strokeColor}
          strokeWidth={0.6}
          opacity={0.4}
        />
        <line
          x1={sourceX}
          y1={sourceY}
          x2={sourceX + Math.cos(high) * beamLength}
          y2={sourceY + Math.sin(high) * beamLength}
          stroke={theme.strokeColor}
          strokeWidth={0.6}
          opacity={0.4}
        />
        {motes.map((mote, index) => (
          <circle key={index} cx={mote.x} cy={mote.y} r={mote.radius} fill={theme.dotColor} opacity={mote.opacity} />
        ))}
        <circle cx={sourceX} cy={sourceY} r={11} fill={theme.accentColor} opacity={0.12} />
        <circle cx={sourceX} cy={sourceY} r={5} fill={theme.accentColor} opacity={0.28} />
        <circle cx={sourceX} cy={sourceY} r={2} fill={theme.accentColor} opacity={0.6} />
        <g opacity={0.5}>
          <rect x={stripX} y={0} width={stripWidth} height={height} fill="rgba(0,0,0,0.28)" stroke={theme.strokeColor} strokeWidth={0.4} />
          <rect x={stripX + 5.5} y={0} width={stripWidth - 11} height={height} fill="none" stroke={theme.strokeColor} strokeWidth={0.3} opacity={0.5} />
          {Array.from({ length: frames * 2 }, (_, index) => {
            const y = (index / (frames * 2)) * height + frameHeight / 4 - 2.5;
            return (
              <rect
                key={index}
                x={stripX + 2}
                y={y}
                width={4.5}
                height={5}
                rx={0.9}
                fill="rgba(0,0,0,0.65)"
                stroke={theme.strokeColor}
                strokeWidth={0.25}
              />
            );
          })}
          {Array.from({ length: frames }, (_, index) => (
            <line
              key={index}
              x1={stripX + 7}
              y1={(index / frames) * height}
              x2={stripX + stripWidth - 7}
              y2={(index / frames) * height}
              stroke={theme.strokeColor}
              strokeWidth={0.3}
              opacity={0.6}
            />
          ))}
        </g>
        {showClapper ? (
          <g opacity={0.4}>
            <rect x={clapperX} y={clapperY + 8} width={clapperWidth} height={14} rx={1} fill={theme.fillColor} stroke={theme.strokeColor} strokeWidth={0.55} />
            <rect x={clapperX} y={clapperY} width={clapperWidth} height={10} rx={1} fill={theme.fillColor} stroke={theme.strokeColor} strokeWidth={0.55} />
            {Array.from({ length: 5 }, (_, index) => {
              const x = clapperX + (index / 5) * clapperWidth;
              return (
                <polygon
                  key={index}
                  points={`${x},${clapperY} ${x + clapperWidth / 5},${clapperY} ${x + clapperWidth / 5 - 5},${clapperY + 10} ${x - 5},${clapperY + 10}`}
                  fill={index % 2 ? theme.accentColor : "transparent"}
                  opacity={0.5}
                />
              );
            })}
            <line x1={clapperX + 4} y1={clapperY + 15} x2={clapperX + clapperWidth - 4} y2={clapperY + 15} stroke={theme.strokeColor} strokeWidth={0.4} />
            <line x1={clapperX + 4} y1={clapperY + 21} x2={clapperX + clapperWidth - 4} y2={clapperY + 21} stroke={theme.strokeColor} strokeWidth={0.4} />
          </g>
        ) : null}
      </g>
    </svg>
  );
}

export function PosterMark({ title, year, genres = [], duration }: PosterMarkProps) {
  const seed = titleHash(title);
  const model = MODELS[seed % MODELS.length];
  const theme = THEMES[seed % THEMES.length];
  const angle = 115 + (seed % 70) - 35;
  const visibleGenres = genres.slice(0, 2);
  const minutes = duration && duration > 0 ? duration : null;
  const style = {
    "--cover-angle": `${angle}deg`,
    "--cover-from": theme.bgFrom,
    "--cover-to": theme.bgTo,
    "--cover-accent": theme.accentColor,
    "--cover-year": theme.yearText,
    "--cover-tag-bg": theme.tagBg,
    "--cover-tag-text": theme.tagText,
    "--cover-glow": theme.glowColor,
  } as CSSProperties;

  return (
    <span className={styles.mark} style={style}>
      {model === "reel" ? <FilmReelArt seed={seed} theme={theme} /> : null}
      {model === "rays" ? <ProjectorArt seed={seed} theme={theme} fromLeft={false} showClapper={false} /> : null}
      {model === "clapper" ? <ProjectorArt seed={seed} theme={theme} fromLeft showClapper /> : null}
      <span className={styles.copy}>
        <span className={styles.brand}>
          <span className={styles.lockup}>
            <CinedexIcon />
            <span className={styles.word}>Cinedex</span>
          </span>
          <span className={styles.presents}>apresenta</span>
        </span>
        <span className={styles.spacer} />
        {year ? <span className={styles.year}>{year}</span> : null}
        <span className={styles.title}>{title}</span>
        <span className={styles.rule} />
        <span className={styles.meta}>
          {visibleGenres.map((genre) => (
            <span key={genre} className={styles.tag}>
              {genre}
            </span>
          ))}
          {minutes ? <span className={styles.duration}>{formatDuration(minutes)}</span> : null}
        </span>
      </span>
    </span>
  );
}
