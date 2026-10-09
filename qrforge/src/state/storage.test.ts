import { describe, expect, it } from 'vitest'
import { createInitialState } from './defaults'
import { sanitizeState } from './storage'

describe('sanitizeState', () => {
  it('falls back to defaults for garbage', () => {
    expect(sanitizeState(null)).toEqual(createInitialState())
    expect(sanitizeState('nope')).toEqual(createInitialState())
  })

  it('keeps valid stored values and drops invalid ones', () => {
    const state = sanitizeState({
      type: 'wifi',
      content: { wifi: { ssid: 'HomeNet', password: 42, encryption: 'WEP' } },
      style: {
        foreground: '#abc',
        size: 999999,
        dotStyle: 'triangle',
        errorCorrection: 'H',
        logo: { dataUrl: 'nope' },
      },
    })
    expect(state.type).toBe('wifi')
    expect(state.content.wifi).toEqual({ ssid: 'HomeNet', password: '', encryption: 'WEP', hidden: false })
    expect(state.style.foreground).toBe('#aabbcc')
    expect(state.style.size).toBe(512)
    expect(state.style.dotStyle).toBe('rounded')
    expect(state.style.errorCorrection).toBe('H')
    expect(state.style.logo).toBeNull()
  })
})
