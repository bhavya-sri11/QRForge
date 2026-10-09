import type { DotStyle, EyeCenterStyle, EyeFrameStyle } from '../../lib/qr/types'

export const DOT_STYLE_LABELS: Record<DotStyle, string> = {
  square: 'Square',
  rounded: 'Rounded',
  dots: 'Dots',
  classy: 'Classy',
  'classy-rounded': 'Classy round',
  'extra-rounded': 'Fluid',
}

export const EYE_FRAME_LABELS: Record<EyeFrameStyle, string> = {
  square: 'Square',
  'extra-rounded': 'Round',
  dot: 'Circle',
}

export const EYE_CENTER_LABELS: Record<EyeCenterStyle, string> = {
  square: 'Square',
  rounded: 'Round',
  dot: 'Dot',
}
