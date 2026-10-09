import { describe, expect, it } from 'vitest'
import { DEFAULT_STYLE } from '../../state/defaults'
import { detectMode, getCapacity } from './capacity'
import { buildQrOptions, toByteString } from './encode'
import { findMatchingPreset, PRESETS } from './presets'
import { getAdvisories } from './scannability'

describe('toByteString', () => {
  it('leaves ASCII untouched', () => {
    expect(toByteString('https://example.com')).toBe('https://example.com')
  })

  it('maps every UTF-8 byte to one character so the encoder keeps it intact', () => {
    const bytes = toByteString('₹')
    expect(bytes).toHaveLength(3)
    expect([...bytes].map((c) => c.charCodeAt(0))).toEqual([0xe2, 0x82, 0xb9])
    expect(toByteString('नमस्ते')).toHaveLength(18)
  })
})

describe('capacity', () => {
  it('detects the encoder mode the same way the library does', () => {
    expect(detectMode('0123456789')).toBe('numeric')
    expect(detectMode('HELLO WORLD 123')).toBe('alphanumeric')
    expect(detectMode('https://example.com')).toBe('byte')
  })

  it('counts UTF-8 bytes against the byte-mode limit', () => {
    const info = getCapacity('a'.repeat(1300), 'H')
    expect(info.max).toBe(1273)
    expect(info.exceeded).toBe(true)
    expect(getCapacity('नमस्ते', 'L').used).toBe(18)
  })
})

describe('buildQrOptions', () => {
  it('maps studio style to renderer options', () => {
    const options = buildQrOptions('hello', { ...DEFAULT_STYLE, size: 640, margin: 8, errorCorrection: 'Q' })
    expect(options.width).toBe(640)
    expect(options.margin).toBe(8)
    expect(options.qrOptions?.errorCorrectionLevel).toBe('Q')
    expect(options.dotsOptions?.color).toBe(DEFAULT_STYLE.foreground)
    expect(options.image).toBeUndefined()
  })
})

describe('presets', () => {
  it('recognises the default style as the first preset', () => {
    expect(findMatchingPreset(DEFAULT_STYLE)?.id).toBe(PRESETS[0].id)
  })

  it('returns null once any identity field changes', () => {
    expect(findMatchingPreset({ ...DEFAULT_STYLE, foreground: '#ff0000' })).toBeNull()
  })

  it('every preset has at least 3:1 contrast', () => {
    for (const preset of PRESETS) {
      const advisories = getAdvisories({ ...DEFAULT_STYLE, ...preset.style })
      expect(
        advisories.find((a) => a.id === 'contrast'),
        preset.name,
      ).toBeUndefined()
    }
  })
})

describe('getAdvisories', () => {
  it('warns about low contrast', () => {
    const advisories = getAdvisories({ ...DEFAULT_STYLE, foreground: '#888888', background: '#999999' })
    expect(advisories.map((a) => a.id)).toContain('contrast')
  })

  it('suggests level H when a logo is present', () => {
    const advisories = getAdvisories({
      ...DEFAULT_STYLE,
      errorCorrection: 'M',
      logo: { dataUrl: 'data:image/png;base64,', name: 'x', width: 1, height: 1, bytes: 1 },
    })
    expect(advisories.find((a) => a.id === 'logo-ecl')?.action?.patch).toEqual({ errorCorrection: 'H' })
  })
})
