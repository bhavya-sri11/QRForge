import {
  CONTENT_TYPES,
  DOT_STYLES,
  ERROR_CORRECTION_LEVELS,
  EYE_CENTER_STYLES,
  EYE_FRAME_STYLES,
  LOGO_PADDING_RANGE,
  LOGO_SCALE_RANGE,
  MARGIN_RANGE,
  SIZE_RANGE,
  type ContentState,
  type Logo,
  type QrStyle,
} from '../lib/qr/types'
import { isValidHex, normalizeHex } from '../lib/color'
import { createInitialState, type StudioState } from './defaults'

const STORAGE_KEY = 'qrforge.studio.v1'

type Range = { min: number; max: number }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function pickEnum<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value) ? (value as T) : fallback
}

function pickNumber(value: unknown, range: Range, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= range.min && value <= range.max
    ? value
    : fallback
}

function pickColor(value: unknown, fallback: string): string {
  return typeof value === 'string' && isValidHex(value) ? (normalizeHex(value) as string) : fallback
}

function pickLogo(value: unknown): Logo | null {
  if (!isRecord(value)) return null
  const { dataUrl, name, width, height, bytes } = value
  if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) return null
  return {
    dataUrl,
    name: typeof name === 'string' ? name : 'logo',
    width: typeof width === 'number' ? width : 1,
    height: typeof height === 'number' ? height : 1,
    bytes: typeof bytes === 'number' ? bytes : 0,
  }
}

/** Copies stored fields over the defaults when they have the expected type. */
function mergeSlot<T extends object>(defaults: T, stored: unknown): T {
  if (!isRecord(stored)) return defaults
  const next = { ...defaults }
  for (const field of Object.keys(defaults) as (keyof T)[]) {
    const value = stored[field as string]
    if (typeof value === typeof defaults[field]) next[field] = value as T[keyof T]
  }
  return next
}

/** Merges whatever was stored over the defaults, dropping anything malformed. */
export function sanitizeState(raw: unknown): StudioState {
  const base = createInitialState()
  if (!isRecord(raw)) return base

  const content = isRecord(raw.content) ? raw.content : {}
  const style = isRecord(raw.style) ? raw.style : {}

  const mergedContent: ContentState = {
    url: mergeSlot(base.content.url, content.url),
    text: mergeSlot(base.content.text, content.text),
    wifi: mergeSlot(base.content.wifi, content.wifi),
    email: mergeSlot(base.content.email, content.email),
    phone: mergeSlot(base.content.phone, content.phone),
    vcard: mergeSlot(base.content.vcard, content.vcard),
  }

  const mergedStyle: QrStyle = {
    foreground: pickColor(style.foreground, base.style.foreground),
    background: pickColor(style.background, base.style.background),
    dotStyle: pickEnum(style.dotStyle, DOT_STYLES, base.style.dotStyle),
    eyeFrame: pickEnum(style.eyeFrame, EYE_FRAME_STYLES, base.style.eyeFrame),
    eyeCenter: pickEnum(style.eyeCenter, EYE_CENTER_STYLES, base.style.eyeCenter),
    size: pickNumber(style.size, SIZE_RANGE, base.style.size),
    margin: pickNumber(style.margin, MARGIN_RANGE, base.style.margin),
    errorCorrection: pickEnum(style.errorCorrection, ERROR_CORRECTION_LEVELS, base.style.errorCorrection),
    logo: pickLogo(style.logo),
    logoScale: pickNumber(style.logoScale, LOGO_SCALE_RANGE, base.style.logoScale),
    logoPadding: pickNumber(style.logoPadding, LOGO_PADDING_RANGE, base.style.logoPadding),
    hideDotsBehindLogo:
      typeof style.hideDotsBehindLogo === 'boolean' ? style.hideDotsBehindLogo : base.style.hideDotsBehindLogo,
  }

  return {
    type: pickEnum(raw.type, CONTENT_TYPES, base.type),
    content: mergedContent,
    style: mergedStyle,
  }
}

export function loadState(): StudioState | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    return raw ? sanitizeState(JSON.parse(raw)) : null
  } catch {
    return null
  }
}

export function saveState(state: StudioState): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Private mode or quota exceeded: the session simply won't survive a reload.
  }
}

export function clearState(): void {
  try {
    window.sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // Nothing to clean up.
  }
}
