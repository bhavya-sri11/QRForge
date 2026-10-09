import type { ReactNode } from 'react'
import styles from './Panel.module.css'

interface PanelProps {
  id: string
  title: string
  description?: string
  /** Rendered on the right of the header, e.g. a status pill or button. */
  aside?: ReactNode
  children: ReactNode
  className?: string
}

export function Panel({ id, title, description, aside, children, className }: PanelProps) {
  const headingId = `${id}-heading`
  return (
    <section id={id} className={[styles.panel, className ?? ''].join(' ')} aria-labelledby={headingId}>
      <header className={styles.header}>
        <div className={styles.headerText}>
          <h2 id={headingId} className={styles.title}>
            {title}
          </h2>
          {description && <p className={styles.description}>{description}</p>}
        </div>
        {aside && <div className={styles.aside}>{aside}</div>}
      </header>
      <div className={styles.body}>{children}</div>
    </section>
  )
}

interface GroupProps {
  title: string
  aside?: ReactNode
  children: ReactNode
}

/** A titled block inside a panel body. */
export function Group({ title, aside, children }: GroupProps) {
  return (
    <div className={styles.group}>
      <div className={styles.groupHeader}>
        <h3 className={styles.groupTitle}>{title}</h3>
        {aside}
      </div>
      <div className={styles.groupBody}>{children}</div>
    </div>
  )
}
