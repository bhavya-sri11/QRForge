import { Info, TriangleAlert } from 'lucide-react'
import type { ReactNode } from 'react'
import styles from './Notice.module.css'

interface NoticeProps {
  level: 'warning' | 'info'
  children: ReactNode
  action?: { label: string; onClick: () => void }
}

/** Inline advisory. The icon and the wording carry the meaning, not just the colour. */
export function Notice({ level, children, action }: NoticeProps) {
  const Icon = level === 'warning' ? TriangleAlert : Info
  return (
    <div className={[styles.notice, styles[level]].join(' ')} role={level === 'warning' ? 'alert' : 'status'}>
      <Icon className={styles.icon} size={16} aria-hidden="true" />
      <p className={styles.text}>{children}</p>
      {action && (
        <button type="button" className={styles.action} onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  )
}
