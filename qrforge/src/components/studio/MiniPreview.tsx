import { Download } from 'lucide-react'
import type { Options } from 'qr-code-styling'
import { useQrCode } from '../../hooks/useQrCode'
import { Button } from '../ui/Button'
import styles from './MiniPreview.module.css'

interface MiniPreviewProps {
  options: Options | null
  visible: boolean
  title: string
  subtitle: string
  busy: boolean
  disabled: boolean
  onDownload: () => void
  onJumpToPreview: () => void
}

/**
 * On small screens the full preview scrolls away while people edit, so this
 * bar keeps a live thumbnail and the main action pinned to the top.
 */
export function MiniPreview({
  options,
  visible,
  title,
  subtitle,
  busy,
  disabled,
  onDownload,
  onJumpToPreview,
}: MiniPreviewProps) {
  const { containerRef, hasRender } = useQrCode(options)

  return (
    <div className={styles.bar} data-visible={visible || undefined} aria-hidden={!visible || undefined}>
      <button type="button" className={styles.thumbButton} onClick={onJumpToPreview} tabIndex={visible ? 0 : -1}>
        <span ref={containerRef} className={styles.thumb} data-empty={!hasRender || undefined} aria-hidden="true" />
        <span className={styles.text}>
          <span className={styles.title}>{title}</span>
          <span className={styles.subtitle}>{subtitle}</span>
        </span>
      </button>
      <Button
        variant="primary"
        size="sm"
        icon={<Download />}
        disabled={disabled}
        loading={busy}
        onClick={onDownload}
        tabIndex={visible ? 0 : -1}
        aria-label="Download PNG"
      >
        PNG
      </Button>
    </div>
  )
}
