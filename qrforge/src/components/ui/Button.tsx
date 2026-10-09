import { LoaderCircle } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import styles from './Button.module.css'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md'
  icon?: ReactNode
  loading?: boolean
  /** Replaces the label while loading, e.g. "Preparing…". */
  loadingLabel?: string
  fullWidth?: boolean
}

export function Button({
  variant = 'secondary',
  size = 'md',
  icon,
  loading = false,
  loadingLabel,
  fullWidth = false,
  className,
  children,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  const classes = [styles.button, styles[variant], styles[size], fullWidth ? styles.fullWidth : '', className ?? '']
    .filter(Boolean)
    .join(' ')
  const iconOnly = !children

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      data-icon-only={iconOnly || undefined}
      {...rest}
    >
      {loading ? (
        <LoaderCircle className={styles.spinner} size={16} aria-hidden="true" />
      ) : (
        icon && (
          <span className={styles.icon} aria-hidden="true">
            {icon}
          </span>
        )
      )}
      {children && <span className={styles.label}>{loading && loadingLabel ? loadingLabel : children}</span>}
    </button>
  )
}
