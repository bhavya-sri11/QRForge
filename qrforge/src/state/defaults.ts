import { PRESETS } from '../lib/qr/presets'
import type { ContentState, ContentType, QrStyle } from '../lib/qr/types'

export interface StudioState {
  type: ContentType
  content: ContentState
  style: QrStyle
}

export const DEFAULT_CONTENT: ContentState = {
  url: { url: 'https://example.com' },
  text: { text: '' },
  wifi: { ssid: '', password: '', encryption: 'WPA', hidden: false },
  email: { to: '', subject: '', body: '' },
  phone: { phone: '' },
  vcard: { firstName: '', lastName: '', organization: '', title: '', phone: '', email: '', website: '' },
}

export const DEFAULT_STYLE: QrStyle = {
  ...PRESETS[0].style,
  size: 512,
  margin: 24,
  errorCorrection: 'M',
  logo: null,
  logoScale: 0.4,
  logoPadding: 6,
  hideDotsBehindLogo: true,
}

export function createInitialState(): StudioState {
  return {
    type: 'url',
    content: structuredClone(DEFAULT_CONTENT),
    style: { ...DEFAULT_STYLE },
  }
}
