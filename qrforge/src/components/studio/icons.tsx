import type { DotStyle, EyeCenterStyle, EyeFrameStyle } from '../../lib/qr/types'

interface IconProps {
  size?: number
  /** Module colour; defaults to the current text colour. */
  color?: string
  className?: string
}

export function BrandMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" aria-hidden="true">
      <rect width="28" height="28" rx="7" fill="var(--accent-strong)" />
      <g fill="#fff">
        <path d="M7 7h6v6H7zM9 9v2h2V9z" fillRule="evenodd" />
        <path d="M15 7h6v6h-6zM17 9v2h2V9z" fillRule="evenodd" />
        <path d="M7 15h6v6H7zM9 17v2h2v-2z" fillRule="evenodd" />
        <rect x="15" y="15" width="2.5" height="2.5" />
        <rect x="18.5" y="18.5" width="2.5" height="2.5" />
        <rect x="15" y="18.5" width="2.5" height="2.5" opacity="0.55" />
        <rect x="18.5" y="15" width="2.5" height="2.5" opacity="0.55" />
      </g>
    </svg>
  )
}

/** A single module cell in each of the six styles, used to compose icons. */
function Cell({ style, x, y, s }: { style: DotStyle; x: number; y: number; s: number }) {
  switch (style) {
    case 'square':
      return <rect x={x} y={y} width={s} height={s} />
    case 'rounded':
      return <rect x={x} y={y} width={s} height={s} rx={s * 0.3} />
    case 'dots':
      return <circle cx={x + s / 2} cy={y + s / 2} r={s / 2} />
    case 'classy': {
      const r = s / 2
      return (
        <path
          d={`M${x + r} ${y}h${s - r}v${s - r}a${r} ${r} 0 0 1 -${r} ${r}h-${s - r}v-${s - r}a${r} ${r} 0 0 1 ${r} -${r}z`}
        />
      )
    }
    case 'classy-rounded': {
      const r = s / 2
      const q = s * 0.22
      return (
        <path
          d={`M${x + r} ${y}h${s - r - q}a${q} ${q} 0 0 1 ${q} ${q}v${s - q - r}a${r} ${r} 0 0 1 -${r} ${r}h-${s - r - q}a${q} ${q} 0 0 1 -${q} -${q}v-${s - q - r}a${r} ${r} 0 0 1 ${r} -${r}z`}
        />
      )
    }
    case 'extra-rounded':
      return <rect x={x} y={y} width={s} height={s} rx={s / 2} />
  }
}

const PATTERN: ReadonlyArray<readonly [number, number]> = [
  [0, 0],
  [1, 0],
  [2, 0],
  [0, 1],
  [2, 1],
  [0, 2],
  [1, 2],
  [2, 2],
]

/** A 3×3 ring of modules drawn in the given style. */
export function ModuleStyleIcon({
  style,
  size = 22,
  color = 'currentColor',
  className,
}: IconProps & { style: DotStyle }) {
  const cell = 6
  const gap = style === 'extra-rounded' ? 0.5 : 1.5
  const step = cell + gap
  const offset = (24 - (3 * cell + 2 * gap)) / 2

  if (style === 'extra-rounded') {
    // Connected runs read better than isolated pills for this style.
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill={color} aria-hidden="true">
        <rect x={offset} y={offset} width={3 * cell + 2 * gap} height={cell} rx={cell / 2} />
        <rect x={offset} y={offset + step} width={cell} height={cell + step} rx={cell / 2} />
        <rect x={offset + 2 * step} y={offset + step} width={cell} height={cell} rx={cell / 2} />
        <rect x={offset + step} y={offset + 2 * step} width={2 * cell + gap} height={cell} rx={cell / 2} />
      </svg>
    )
  }

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill={color} aria-hidden="true">
      {PATTERN.map(([col, row]) => (
        <Cell key={`${col}-${row}`} style={style} x={offset + col * step} y={offset + row * step} s={cell} />
      ))}
    </svg>
  )
}

export function EyeFrameIcon({
  style,
  size = 20,
  color = 'currentColor',
  className,
}: IconProps & { style: EyeFrameStyle }) {
  const rx = style === 'dot' ? 9 : style === 'extra-rounded' ? 5.5 : 0
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx={rx} fill="none" stroke={color} strokeWidth="3" />
      <rect x="9" y="9" width="6" height="6" rx={style === 'dot' ? 3 : 0} fill={color} opacity="0.5" />
    </svg>
  )
}

export function EyeCenterIcon({
  style,
  size = 20,
  color = 'currentColor',
  className,
}: IconProps & { style: EyeCenterStyle }) {
  const rx = style === 'dot' ? 4 : style === 'rounded' ? 2 : 0
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5.5" fill="none" stroke={color} strokeWidth="3" opacity="0.5" />
      <rect x="8" y="8" width="8" height="8" rx={rx} fill={color} />
    </svg>
  )
}
