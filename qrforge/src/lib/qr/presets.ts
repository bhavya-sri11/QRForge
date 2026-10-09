import type { QrStyle } from './types'

export type PresetStyle = Pick<QrStyle, 'foreground' | 'background' | 'dotStyle' | 'eyeFrame' | 'eyeCenter'>

export interface Preset {
  id: string
  name: string
  style: PresetStyle
}

/**
 * Presets only touch the visual identity (colours and shapes). Size, margin,
 * error correction and the logo are deliberately left alone so switching
 * looks never throws away export settings.
 */
export const PRESETS: readonly Preset[] = [
  {
    id: 'minimal',
    name: 'Minimal',
    style: {
      foreground: '#111318',
      background: '#FFFFFF',
      dotStyle: 'rounded',
      eyeFrame: 'extra-rounded',
      eyeCenter: 'dot',
    },
  },
  {
    id: 'corporate',
    name: 'Corporate',
    style: {
      foreground: '#0B3A75',
      background: '#FFFFFF',
      dotStyle: 'square',
      eyeFrame: 'square',
      eyeCenter: 'square',
    },
  },
  {
    id: 'event',
    name: 'Event',
    style: {
      foreground: '#4C1D95',
      background: '#F3EEFF',
      dotStyle: 'classy-rounded',
      eyeFrame: 'extra-rounded',
      eyeCenter: 'dot',
    },
  },
  {
    id: 'instagram',
    name: 'Instagram',
    style: {
      foreground: '#C2185B',
      background: '#FFF4F8',
      dotStyle: 'dots',
      eyeFrame: 'dot',
      eyeCenter: 'dot',
    },
  },
  {
    id: 'cafe',
    name: 'Café',
    style: {
      foreground: '#3F2A22',
      background: '#F4E9D8',
      dotStyle: 'classy',
      eyeFrame: 'extra-rounded',
      eyeCenter: 'rounded',
    },
  },
  {
    id: 'neon',
    name: 'Neon',
    style: {
      foreground: '#4AF59A',
      background: '#0B0F14',
      dotStyle: 'extra-rounded',
      eyeFrame: 'extra-rounded',
      eyeCenter: 'dot',
    },
  },
]

const PRESET_KEYS: (keyof PresetStyle)[] = ['foreground', 'background', 'dotStyle', 'eyeFrame', 'eyeCenter']

/** The preset the current style matches exactly, if any. */
export function findMatchingPreset(style: QrStyle): Preset | null {
  return (
    PRESETS.find((preset) =>
      PRESET_KEYS.every((key) => String(preset.style[key]).toLowerCase() === String(style[key]).toLowerCase()),
    ) ?? null
  )
}
