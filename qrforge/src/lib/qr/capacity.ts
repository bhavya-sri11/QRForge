import type { ErrorCorrection } from './types'

export type QrMode = 'numeric' | 'alphanumeric' | 'byte'

/**
 * Maximum characters a version-40 symbol holds per mode and error-correction
 * level (ISO/IEC 18004, Table 7). Byte mode counts UTF-8 bytes.
 */
export const CAPACITY: Record<QrMode, Record<ErrorCorrection, number>> = {
  numeric: { L: 7089, M: 5596, Q: 3993, H: 3057 },
  alphanumeric: { L: 4296, M: 3391, Q: 2420, H: 1852 },
  byte: { L: 2953, M: 2331, Q: 1663, H: 1273 },
}

export const ERROR_CORRECTION_INFO: Record<ErrorCorrection, { label: string; recovery: string }> = {
  L: { label: 'Low', recovery: '7%' },
  M: { label: 'Medium', recovery: '15%' },
  Q: { label: 'Quartile', recovery: '25%' },
  H: { label: 'High', recovery: '30%' },
}

const encoder = new TextEncoder()

/** Mirrors the mode auto-detection used by the encoder. */
export function detectMode(data: string): QrMode {
  if (/^[0-9]*$/.test(data)) return 'numeric'
  if (/^[0-9A-Z $%*+\-./:]*$/.test(data)) return 'alphanumeric'
  return 'byte'
}

export function utf8Length(data: string): number {
  return encoder.encode(data).length
}

export interface CapacityInfo {
  mode: QrMode
  used: number
  max: number
  exceeded: boolean
}

export function getCapacity(data: string, level: ErrorCorrection): CapacityInfo {
  const mode = detectMode(data)
  const used = mode === 'byte' ? utf8Length(data) : data.length
  const max = CAPACITY[mode][level]
  return { mode, used, max, exceeded: used > max }
}
