import { useState } from 'react'
import { normalizeHex } from '../../lib/color'
import styles from './ColorField.module.css'

interface ColorFieldProps {
  id: string
  label: string
  value: string
  onChange: (hex: string) => void
}

/**
 * A swatch (native colour picker) paired with a hex input. The text input keeps
 * a local draft so partial typing never pushes an invalid colour upstream.
 */
export function ColorField({ id, label, value, onChange }: ColorFieldProps) {
  const [draft, setDraft] = useState(value.toUpperCase())
  const [invalid, setInvalid] = useState(false)
  const [syncedValue, setSyncedValue] = useState(value)

  // Re-sync the draft when the colour changes from outside (preset, swap, undo).
  if (value !== syncedValue) {
    setSyncedValue(value)
    setDraft(value.toUpperCase())
    setInvalid(false)
  }

  const commit = (raw: string) => {
    const normalized = normalizeHex(raw)
    if (normalized) {
      setInvalid(false)
      if (normalized !== value.toLowerCase()) onChange(normalized)
    } else {
      setInvalid(true)
    }
  }

  const errorId = `${id}-error`

  return (
    <div className={styles.field}>
      <label htmlFor={`${id}-hex`} className={styles.label}>
        {label}
      </label>
      <div className={styles.row} data-invalid={invalid || undefined}>
        <span className={styles.swatchWrap}>
          <input
            id={id}
            type="color"
            className={styles.swatch}
            value={normalizeHex(value) ?? '#000000'}
            onChange={(event) => onChange(event.target.value)}
            aria-label={`${label} colour picker`}
          />
        </span>
        <input
          id={`${id}-hex`}
          type="text"
          className={styles.hex}
          value={draft}
          spellCheck={false}
          autoComplete="off"
          inputMode="text"
          maxLength={7}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? errorId : undefined}
          onChange={(event) => {
            const next = event.target.value
            setDraft(next.toUpperCase())
            if (normalizeHex(next)) commit(next)
            else setInvalid(next.length >= 4)
          }}
          onBlur={() => {
            if (!normalizeHex(draft)) {
              setDraft(value.toUpperCase())
              setInvalid(false)
            }
          }}
        />
      </div>
      {invalid && (
        <p id={errorId} className={styles.error} role="alert">
          Use a hex colour like #1A2B3C
        </p>
      )}
    </div>
  )
}
