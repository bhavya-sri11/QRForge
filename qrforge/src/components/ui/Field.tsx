import { CircleAlert } from 'lucide-react'
import type { ReactNode } from 'react'
import styles from './Field.module.css'

export interface FieldControlProps {
  id: string
  'aria-describedby'?: string
  'aria-invalid'?: true
}

interface FieldProps {
  id: string
  label: string
  hint?: ReactNode
  error?: string
  /** Rendered on the right of the label row, e.g. a character counter. */
  meta?: ReactNode
  optional?: boolean
  children: (props: FieldControlProps) => ReactNode
}

/**
 * Wires a label, hint and error message to a control with the right ARIA
 * relationships. The control is rendered by the caller so any input works.
 */
export function Field({ id, label, hint, error, meta, optional, children }: FieldProps) {
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined

  return (
    <div className={styles.field}>
      <div className={styles.labelRow}>
        <label htmlFor={id} className={styles.label}>
          {label}
          {optional && <span className={styles.optional}> · optional</span>}
        </label>
        {meta && <span className={styles.meta}>{meta}</span>}
      </div>
      {children({ id, 'aria-describedby': describedBy, 'aria-invalid': error ? true : undefined })}
      {error ? (
        <p id={errorId} className={styles.error} role="alert">
          <CircleAlert size={14} aria-hidden="true" />
          <span>{error}</span>
        </p>
      ) : (
        hint && (
          <p id={hintId} className={styles.hint}>
            {hint}
          </p>
        )
      )}
    </div>
  )
}
