/**
 * Domain types for the QR studio. Everything here is plain data so the
 * payload builders, validators and presets stay framework-agnostic and
 * unit-testable.
 */

export const CONTENT_TYPES = ['url', 'text', 'wifi', 'email', 'phone', 'vcard'] as const
export type ContentType = (typeof CONTENT_TYPES)[number]

export interface UrlContent {
  url: string
}

export interface TextContent {
  text: string
}

export type WifiEncryption = 'WPA' | 'WEP' | 'nopass'

export interface WifiContent {
  ssid: string
  password: string
  encryption: WifiEncryption
  hidden: boolean
}

export interface EmailContent {
  to: string
  subject: string
  body: string
}

export interface PhoneContent {
  phone: string
}

export interface VCardContent {
  firstName: string
  lastName: string
  organization: string
  title: string
  phone: string
  email: string
  website: string
}

/** One slot per content type so switching tabs never loses what was typed. */
export interface ContentState {
  url: UrlContent
  text: TextContent
  wifi: WifiContent
  email: EmailContent
  phone: PhoneContent
  vcard: VCardContent
}

export const DOT_STYLES = ['square', 'rounded', 'dots', 'classy', 'classy-rounded', 'extra-rounded'] as const
export type DotStyle = (typeof DOT_STYLES)[number]

export const EYE_FRAME_STYLES = ['square', 'extra-rounded', 'dot'] as const
export type EyeFrameStyle = (typeof EYE_FRAME_STYLES)[number]

export const EYE_CENTER_STYLES = ['square', 'rounded', 'dot'] as const
export type EyeCenterStyle = (typeof EYE_CENTER_STYLES)[number]

export const ERROR_CORRECTION_LEVELS = ['L', 'M', 'Q', 'H'] as const
export type ErrorCorrection = (typeof ERROR_CORRECTION_LEVELS)[number]

export interface Logo {
  /** data: URL so exports stay self-contained and nothing leaves the browser. */
  dataUrl: string
  name: string
  width: number
  height: number
  bytes: number
}

export interface QrStyle {
  foreground: string
  background: string
  dotStyle: DotStyle
  eyeFrame: EyeFrameStyle
  eyeCenter: EyeCenterStyle
  /** Export size in pixels (the preview is scaled to fit). */
  size: number
  /** Quiet zone around the code, in pixels of the export. */
  margin: number
  errorCorrection: ErrorCorrection
  logo: Logo | null
  /** Logo width as a fraction of the code (0.2 – 0.5). */
  logoScale: number
  /** Clear padding around the logo, in pixels of the export. */
  logoPadding: number
  hideDotsBehindLogo: boolean
}

export const SIZE_RANGE = { min: 200, max: 2000, step: 8 } as const
export const MARGIN_RANGE = { min: 0, max: 80, step: 4 } as const
export const LOGO_SCALE_RANGE = { min: 0.2, max: 0.5, step: 0.05 } as const
export const LOGO_PADDING_RANGE = { min: 0, max: 24, step: 2 } as const
export const LOGO_MAX_BYTES = 1024 * 1024
