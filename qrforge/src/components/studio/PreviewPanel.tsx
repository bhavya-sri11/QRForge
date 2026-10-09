import { Copy, Download, FileCode2, QrCode } from 'lucide-react'
import type { Options } from 'qr-code-styling'
import type { Ref } from 'react'
import type { ExportJob } from '../../hooks/useExportActions'
import { useQrCode } from '../../hooks/useQrCode'
import { ERROR_CORRECTION_INFO, type CapacityInfo } from '../../lib/qr/capacity'
import type { Advisory } from '../../lib/qr/scannability'
import { CONTENT_TYPE_LABELS, describeContent } from '../../lib/qr/summary'
import type { ContentState, ContentType, QrStyle } from '../../lib/qr/types'
import type { PreviewStatus } from '../../state/useStudio'
import { Button } from '../ui/Button'
import { Notice } from '../ui/Notice'
import { Panel } from '../ui/Panel'
import { DOT_STYLE_LABELS } from './labels'
import styles from './PreviewPanel.module.css'

interface PreviewPanelProps {
  options: Options | null
  status: PreviewStatus
  type: ContentType
  content: ContentState
  style: QrStyle
  payload: string
  capacity: CapacityInfo
  advisories: Advisory[]
  busy: ExportJob | null
  canCopy: boolean
  onApplyPatch: (patch: Partial<QrStyle>) => void
  onDownload: (format: 'png' | 'svg') => void
  onCopy: () => void
  onCopyPayload: () => void
  /** Called with the stage element so a sticky mini preview can watch its visibility. */
  stageRef?: Ref<HTMLDivElement>
}

const EMPTY_MESSAGES: Record<ContentType, string> = {
  url: 'Enter a web address to generate your code.',
  text: 'Type some text to generate your code.',
  wifi: 'Enter the network details to generate your code.',
  email: 'Enter an email address to generate your code.',
  phone: 'Enter a phone number to generate your code.',
  vcard: 'Add a name to generate your code.',
}

const INVALID_MESSAGES: Record<ContentType, string> = {
  url: 'Waiting for a valid web address.',
  text: 'Waiting for valid text.',
  wifi: 'Waiting for valid network details.',
  email: 'Waiting for a valid email address.',
  phone: 'Waiting for a valid phone number.',
  vcard: 'Waiting for valid contact details.',
}

const STATUS_LABELS: Record<PreviewStatus, string> = {
  ready: 'Live',
  empty: 'Waiting for content',
  invalid: 'Check the content',
  'too-long': 'Content too long',
}

const numberFormatter = new Intl.NumberFormat('en')

export function PreviewPanel({
  options,
  status,
  type,
  content,
  style,
  payload,
  capacity,
  advisories,
  busy,
  canCopy,
  onApplyPatch,
  onDownload,
  onCopy,
  onCopyPayload,
  stageRef,
}: PreviewPanelProps) {
  const { containerRef, hasRender, error } = useQrCode(options)

  const effectiveStatus: PreviewStatus = status === 'ready' && error ? 'too-long' : status
  const isReady = effectiveStatus === 'ready'
  const encoded = isReady ? payload : ''
  const showCode = hasRender && effectiveStatus !== 'empty'
  const description = describeContent(type, content)
  const stageMessage =
    effectiveStatus === 'empty'
      ? EMPTY_MESSAGES[type]
      : effectiveStatus === 'too-long'
        ? (error ?? 'The content is too long for this error-correction level.')
        : INVALID_MESSAGES[type]

  const recovery = ERROR_CORRECTION_INFO[style.errorCorrection]
  const summary: { term: string; value: string }[] = [
    { term: CONTENT_TYPE_LABELS[type], value: description || '—' },
    { term: 'Size', value: `${style.size} px` },
    { term: 'Margin', value: `${style.margin} px` },
    { term: 'Correction', value: `${style.errorCorrection} · ${recovery.recovery}` },
    { term: 'Modules', value: DOT_STYLE_LABELS[style.dotStyle] },
  ]
  if (style.logo) summary.push({ term: 'Logo', value: style.logo.name })

  return (
    <Panel
      id="preview"
      title="Preview"
      description="Updates as you type"
      className={styles.panel}
      aside={
        <span className={styles.status} data-status={effectiveStatus} role="status">
          <span className={styles.statusDot} aria-hidden="true" />
          {STATUS_LABELS[effectiveStatus]}
        </span>
      }
    >
      <div className={styles.layout}>
        <div className={styles.stage} ref={stageRef}>
          <div className={styles.frame} data-state={effectiveStatus} data-has-code={showCode || undefined}>
            <div
              ref={containerRef}
              className={styles.code}
              role="img"
              aria-label={isReady ? `QR code for ${description || payload}` : 'QR code preview'}
              aria-hidden={!showCode || undefined}
            />
            {!showCode && (
              <div className={styles.placeholder}>
                <QrCode size={40} strokeWidth={1.5} aria-hidden="true" />
                <p>{stageMessage}</p>
              </div>
            )}
            {showCode && !isReady && (
              <div className={styles.veil}>
                <p className={styles.veilMessage}>{stageMessage}</p>
              </div>
            )}
          </div>
          <p className={styles.caption}>
            Scaled to fit · exports at {style.size} × {style.size} px
          </p>
        </div>

        <div className={styles.details}>
          {isReady &&
            advisories.map((advisory) => (
              <Notice
                key={advisory.id}
                level={advisory.level}
                action={
                  advisory.action
                    ? { label: advisory.action.label, onClick: () => onApplyPatch(advisory.action!.patch) }
                    : undefined
                }
              >
                {advisory.message}
              </Notice>
            ))}

          <div className={styles.actions}>
            <Button
              variant="primary"
              icon={<Download />}
              className={styles.primaryAction}
              disabled={!isReady}
              loading={busy === 'png'}
              loadingLabel="Preparing PNG…"
              onClick={() => onDownload('png')}
            >
              Download PNG
            </Button>
            <Button
              icon={<FileCode2 />}
              disabled={!isReady}
              loading={busy === 'svg'}
              loadingLabel="Preparing…"
              onClick={() => onDownload('svg')}
              aria-label="Download SVG"
            >
              SVG
            </Button>
            <Button
              icon={<Copy />}
              disabled={!isReady || !canCopy}
              loading={busy === 'copy'}
              loadingLabel="Copying…"
              onClick={onCopy}
              aria-label="Copy as image"
            >
              Copy
            </Button>
          </div>
          {!canCopy && (
            <p className={styles.note}>Copying images isn’t supported in this browser — download instead.</p>
          )}

          <dl className={styles.summary} aria-label="Current configuration">
            {summary.map((item) => (
              <div key={item.term} className={styles.summaryItem}>
                <dt>{item.term}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>

          <details className={styles.payload}>
            <summary className={styles.payloadSummary}>
              <span>Encoded data</span>
              <span className={styles.payloadMeta}>
                {encoded
                  ? `${numberFormatter.format(capacity.used)} ${capacity.mode === 'byte' ? 'bytes' : 'chars'} · ${capacity.mode} mode`
                  : 'nothing yet'}
              </span>
            </summary>
            <div className={styles.payloadBody}>
              <pre className={styles.payloadText}>{encoded || 'Add valid content to see what gets encoded.'}</pre>
              <Button size="sm" variant="ghost" icon={<Copy />} disabled={!encoded} onClick={onCopyPayload}>
                Copy text
              </Button>
            </div>
          </details>
        </div>
      </div>
    </Panel>
  )
}
