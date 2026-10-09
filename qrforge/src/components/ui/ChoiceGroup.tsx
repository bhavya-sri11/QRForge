import type { CSSProperties, ReactNode } from 'react'
import styles from './ChoiceGroup.module.css'

export interface ChoiceOption<T extends string> {
  value: T
  label: string
  /** Small secondary text under or beside the label. */
  description?: string
  icon?: ReactNode
  /** Extra accessible description when the visual label is too terse. */
  ariaLabel?: string
}

interface ChoiceGroupProps<T extends string> {
  name: string
  legend: string
  value: T
  options: readonly ChoiceOption<T>[]
  onChange: (value: T) => void
  /** "tiles" stacks icon over label; "segments" is a compact horizontal strip. */
  appearance?: 'tiles' | 'segments'
  columns?: number
  hint?: ReactNode
  /** Visually hides the legend when the surrounding section already names the group. */
  hideLegend?: boolean
}

/**
 * A radio group rendered as buttons. Real radio inputs keep native keyboard
 * behaviour (arrow keys, form semantics) and screen-reader announcements.
 */
export function ChoiceGroup<T extends string>({
  name,
  legend,
  value,
  options,
  onChange,
  appearance = 'segments',
  columns,
  hint,
  hideLegend = false,
}: ChoiceGroupProps<T>) {
  const hintId = hint ? `${name}-hint` : undefined
  const style = columns ? ({ '--columns': columns } as CSSProperties) : undefined

  return (
    <fieldset className={styles.fieldset} aria-describedby={hintId}>
      <legend className={hideLegend ? 'sr-only' : styles.legend}>{legend}</legend>
      <div className={[styles.group, styles[appearance]].join(' ')} style={style}>
        {options.map((option) => {
          const id = `${name}-${option.value}`
          return (
            <div key={option.value} className={styles.item}>
              <input
                type="radio"
                id={id}
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={() => onChange(option.value)}
                className={styles.input}
                aria-label={option.ariaLabel}
              />
              <label htmlFor={id} className={styles.label}>
                {option.icon && (
                  <span className={styles.icon} aria-hidden="true">
                    {option.icon}
                  </span>
                )}
                <span className={styles.text}>
                  <span className={styles.title}>{option.label}</span>
                  {option.description && <span className={styles.description}>{option.description}</span>}
                </span>
              </label>
            </div>
          )
        })}
      </div>
      {hint && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
    </fieldset>
  )
}
