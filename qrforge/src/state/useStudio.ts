import type { Options } from 'qr-code-styling'
import { useEffect, useMemo, useReducer, type Dispatch } from 'react'
import { getCapacity, type CapacityInfo } from '../lib/qr/capacity'
import { buildQrOptions } from '../lib/qr/encode'
import { buildPayload } from '../lib/qr/payload'
import { getAdvisories, type Advisory } from '../lib/qr/scannability'
import { validateContent, type ValidationResult } from '../lib/qr/validation'
import { createInitialState, type StudioState } from './defaults'
import { studioReducer, type StudioAction } from './reducer'
import { loadState, saveState } from './storage'

export type PreviewStatus = 'ready' | 'empty' | 'invalid' | 'too-long'

export interface DerivedQr {
  payload: string
  validation: ValidationResult
  capacity: CapacityInfo
  advisories: Advisory[]
  status: PreviewStatus
  /** Renderer options, or null when there is nothing valid to draw. */
  options: Options | null
}

const SAVE_DELAY_MS = 300

export function useStudio(): [StudioState, Dispatch<StudioAction>, DerivedQr] {
  const [state, dispatch] = useReducer(studioReducer, undefined, () => loadState() ?? createInitialState())

  useEffect(() => {
    const timer = window.setTimeout(() => saveState(state), SAVE_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [state])

  const derived = useMemo<DerivedQr>(() => {
    const payload = buildPayload(state.type, state.content)
    const validation = validateContent(state.type, state.content)
    const capacity = getCapacity(payload, state.style.errorCorrection)
    const advisories = getAdvisories(state.style)

    let status: PreviewStatus = 'ready'
    if (validation.isEmpty) status = 'empty'
    else if (!validation.isValid) status = 'invalid'
    else if (capacity.exceeded) status = 'too-long'

    return {
      payload,
      validation,
      capacity,
      advisories,
      status,
      options: status === 'ready' ? buildQrOptions(payload, state.style) : null,
    }
  }, [state])

  return [state, dispatch, derived]
}
