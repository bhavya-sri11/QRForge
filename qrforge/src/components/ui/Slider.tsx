import type { CSSProperties } from 'react'
import styles from './Slider.module.css'

interface SliderProps {
  id: string
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
  /** Text shown next to the label and read by screen readers, e.g. "512 px". */
  formatValue?: (value: number) => string
  hint?: string
  disabled?: boolean
}

export function Slider({ id, label, value, min, max, step, onChange, formatValue, hint, disabled }: SliderProps) {
  const display = formatValue ? formatValue(value) : String(value)
  const percent = ((value - min) / (max - min)) * 100
  const hintId = hint ? `${id}-hint` : undefined

  return (
    <div className={styles.slider}>
      <div className={styles.labelRow}>
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
        <output htmlFor={id} className={styles.value} aria-hidden="true">
          {display}
        </output>
      </div>
      <input
        id={id}
        type="range"
        className={styles.input}
        style={{ '--percent': `${percent}%` } as CSSProperties}
        value={value}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        aria-valuetext={display}
        aria-describedby={hintId}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      {hint && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
    </div>
  )
}
