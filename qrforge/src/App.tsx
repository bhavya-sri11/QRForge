import { useCallback } from 'react'
import { ContentPanel } from './components/studio/ContentPanel'
import { MiniPreview } from './components/studio/MiniPreview'
import { PreviewPanel } from './components/studio/PreviewPanel'
import { StylePanel } from './components/studio/StylePanel'
import { TopBar } from './components/studio/TopBar'
import { ToastProvider } from './components/ui/Toast'
import { useToast } from './components/ui/toastContext'
import { useDebouncedValue } from './hooks/useDebouncedValue'
import { useExportActions } from './hooks/useExportActions'
import { useMediaQuery } from './hooks/useMediaQuery'
import { useStageVisibility } from './hooks/useStageVisibility'
import { supportsImageClipboard } from './lib/export'
import { CONTENT_TYPE_LABELS, describeContent, fileNameHint } from './lib/qr/summary'
import { useStudio } from './state/useStudio'
import styles from './App.module.css'

/** Keeps typing smooth; the preview still feels instant. */
const RENDER_DEBOUNCE_MS = 80

function Studio() {
  const [state, dispatch, derived] = useStudio()
  const { toast } = useToast()
  const renderOptions = useDebouncedValue(derived.options, RENDER_DEBOUNCE_MS)
  const isCompact = useMediaQuery('(max-width: 1099px)')
  const { stageRef, stageHidden } = useStageVisibility(isCompact)
  const { busy, download, copyImage, copyText } = useExportActions({
    options: derived.options,
    payload: derived.payload,
    fileNameHint: fileNameHint(state.type, state.content),
  })

  const reset = useCallback(() => {
    const previous = state
    dispatch({ type: 'reset' })
    toast({
      title: 'Reset to defaults',
      variant: 'info',
      action: { label: 'Undo', onClick: () => dispatch({ type: 'restore', state: previous }) },
    })
  }, [dispatch, state, toast])

  const description = describeContent(state.type, state.content)

  return (
    <div className={styles.app}>
      <a href="#preview" className="skip-link">
        Skip to preview
      </a>
      <TopBar onReset={reset} />
      <main className={styles.workspace}>
        <ContentPanel
          type={state.type}
          content={state.content}
          issues={derived.validation.issues}
          capacity={derived.capacity}
          errorCorrection={state.style.errorCorrection}
          onSelectType={(contentType) => dispatch({ type: 'selectType', contentType })}
          onChange={(contentType, patch) => dispatch({ type: 'updateContent', contentType, patch })}
        />
        <PreviewPanel
          options={renderOptions}
          status={derived.status}
          type={state.type}
          content={state.content}
          style={state.style}
          payload={derived.payload}
          capacity={derived.capacity}
          advisories={derived.advisories}
          busy={busy}
          canCopy={supportsImageClipboard()}
          stageRef={stageRef}
          onApplyPatch={(patch) => dispatch({ type: 'updateStyle', patch })}
          onDownload={(format) => void download(format)}
          onCopy={() => void copyImage()}
          onCopyPayload={() => void copyText()}
        />
        <StylePanel
          style={state.style}
          onChange={(patch) => dispatch({ type: 'updateStyle', patch })}
          onApplyPreset={(preset) => dispatch({ type: 'applyPreset', style: preset.style })}
          onSwapColors={() => dispatch({ type: 'swapColors' })}
        />
      </main>
      {isCompact && (
        <MiniPreview
          options={renderOptions}
          visible={stageHidden && derived.status === 'ready'}
          title={description || CONTENT_TYPE_LABELS[state.type]}
          subtitle={`${state.style.size} px · level ${state.style.errorCorrection}`}
          busy={busy === 'png'}
          disabled={derived.status !== 'ready'}
          onDownload={() => void download('png')}
          onJumpToPreview={() => stageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
        />
      )}
    </div>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <Studio />
    </ToastProvider>
  )
}
