import { contrastRatio, isLighter } from '../color'
import type { QrStyle } from './types'

export interface Advisory {
  id: string
  level: 'warning' | 'info'
  message: string
  /** A one-click fix the preview can offer. */
  action?: { label: string; patch: Partial<QrStyle> }
}

export const MIN_CONTRAST = 3

/** Design choices that commonly break scanning, with a fix for each. */
export function getAdvisories(style: QrStyle): Advisory[] {
  const advisories: Advisory[] = []
  const ratio = contrastRatio(style.foreground, style.background)

  if (ratio < MIN_CONTRAST) {
    advisories.push({
      id: 'contrast',
      level: 'warning',
      message: `Contrast is ${ratio.toFixed(1)}:1. Scanners need about ${MIN_CONTRAST}:1 or more.`,
    })
  } else if (isLighter(style.foreground, style.background)) {
    advisories.push({
      id: 'inverted',
      level: 'info',
      message: 'Light-on-dark codes fail in some scanner apps. Swap the colours if scans are unreliable.',
      action: { label: 'Swap colours', patch: { foreground: style.background, background: style.foreground } },
    })
  }

  if (style.logo && style.errorCorrection !== 'H') {
    advisories.push({
      id: 'logo-ecl',
      level: 'warning',
      message: 'The logo covers part of the code. Level H error correction keeps it scannable.',
      action: { label: 'Use level H', patch: { errorCorrection: 'H' } },
    })
  }

  if (style.margin === 0) {
    advisories.push({
      id: 'margin',
      level: 'info',
      message: 'A quiet zone around the code helps cameras lock on.',
      action: { label: 'Add margin', patch: { margin: 16 } },
    })
  }

  return advisories
}
