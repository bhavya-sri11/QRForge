import type { PresetStyle } from '../lib/qr/presets'
import type { ContentState, ContentType, QrStyle } from '../lib/qr/types'
import { createInitialState, type StudioState } from './defaults'

export type StudioAction =
  | { type: 'selectType'; contentType: ContentType }
  | { type: 'updateContent'; contentType: ContentType; patch: Partial<ContentState[ContentType]> }
  | { type: 'updateStyle'; patch: Partial<QrStyle> }
  | { type: 'applyPreset'; style: PresetStyle }
  | { type: 'swapColors' }
  | { type: 'reset' }
  | { type: 'restore'; state: StudioState }

export function studioReducer(state: StudioState, action: StudioAction): StudioState {
  switch (action.type) {
    case 'selectType':
      return state.type === action.contentType ? state : { ...state, type: action.contentType }
    case 'updateContent':
      return {
        ...state,
        content: {
          ...state.content,
          [action.contentType]: { ...state.content[action.contentType], ...action.patch },
        },
      }
    case 'updateStyle':
      return { ...state, style: { ...state.style, ...action.patch } }
    case 'applyPreset':
      return { ...state, style: { ...state.style, ...action.style } }
    case 'swapColors':
      return {
        ...state,
        style: { ...state.style, foreground: state.style.background, background: state.style.foreground },
      }
    case 'reset':
      return createInitialState()
    case 'restore':
      return action.state
  }
}
