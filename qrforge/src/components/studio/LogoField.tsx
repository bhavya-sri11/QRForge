import { ImagePlus, LoaderCircle, Trash2 } from 'lucide-react'
import { useId, useRef, useState, type DragEvent } from 'react'
import { formatBytes, loadLogo, LOGO_ACCEPT, LogoError } from '../../lib/logo'
import type { Logo } from '../../lib/qr/types'
import { Button } from '../ui/Button'
import styles from './LogoField.module.css'

interface LogoFieldProps {
  logo: Logo | null
  onChange: (logo: Logo | null) => void
}

export function LogoField({ logo, onChange }: LogoFieldProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [reading, setReading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)

  const accept = async (file: File | undefined) => {
    if (!file) return
    setReading(true)
    setError(null)
    try {
      onChange(await loadLogo(file))
    } catch (err) {
      setError(err instanceof LogoError ? err.message : 'The logo could not be loaded.')
    } finally {
      setReading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const handleDrop = (event: DragEvent<HTMLElement>) => {
    event.preventDefault()
    setDragging(false)
    void accept(event.dataTransfer.files[0])
  }

  const errorId = `${inputId}-error`

  return (
    <div className={styles.field}>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={LOGO_ACCEPT}
        className="sr-only"
        aria-label="Logo image file"
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => void accept(event.target.files?.[0])}
      />

      {logo ? (
        <div className={styles.card}>
          <span className={styles.thumb}>
            <img src={logo.dataUrl} alt="" width={40} height={40} />
          </span>
          <span className={styles.meta}>
            <span className={styles.name} title={logo.name}>
              {logo.name}
            </span>
            <span className={styles.dims}>
              {logo.width} × {logo.height} · {formatBytes(logo.bytes)}
            </span>
          </span>
          <span className={styles.cardActions}>
            <Button size="sm" variant="ghost" onClick={() => inputRef.current?.click()} loading={reading}>
              Replace
            </Button>
            <Button
              size="sm"
              variant="ghost"
              icon={<Trash2 />}
              onClick={() => onChange(null)}
              aria-label="Remove logo"
            />
          </span>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          className={styles.dropzone}
          data-dragging={dragging || undefined}
          onDragOver={(event) => {
            event.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          {reading ? (
            <LoaderCircle className={styles.spinner} size={20} aria-hidden="true" />
          ) : (
            <ImagePlus size={20} aria-hidden="true" />
          )}
          <span className={styles.dropText}>
            <span className={styles.dropTitle}>{reading ? 'Reading logo…' : 'Add a logo'}</span>
            <span className={styles.dropHint}>PNG, JPG, SVG or WebP · up to 1 MB · stays on this device</span>
          </span>
        </label>
      )}

      {error && (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
