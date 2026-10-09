import { Contact, Link, Mail, Phone, Type, Wifi } from 'lucide-react'
import { useRef, type KeyboardEvent } from 'react'
import { CONTENT_TYPE_LABELS } from '../../lib/qr/summary'
import { CONTENT_TYPES, type ContentType } from '../../lib/qr/types'
import { tabId, tabPanelId } from './tabIds'
import styles from './TypeTabs.module.css'

const ICONS: Record<ContentType, typeof Link> = {
  url: Link,
  text: Type,
  wifi: Wifi,
  email: Mail,
  phone: Phone,
  vcard: Contact,
}

interface TypeTabsProps {
  value: ContentType
  onChange: (type: ContentType) => void
}

/** WAI-ARIA tabs with automatic activation and arrow-key navigation. */
export function TypeTabs({ value, onChange }: TypeTabsProps) {
  const listRef = useRef<HTMLDivElement>(null)

  const focusTab = (type: ContentType) => {
    onChange(type)
    const element = listRef.current?.querySelector<HTMLButtonElement>(`#${tabId(type)}`)
    element?.focus()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = CONTENT_TYPES.indexOf(value)
    const last = CONTENT_TYPES.length - 1
    let next: number | null = null
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        next = index === last ? 0 : index + 1
        break
      case 'ArrowLeft':
      case 'ArrowUp':
        next = index === 0 ? last : index - 1
        break
      case 'Home':
        next = 0
        break
      case 'End':
        next = last
        break
    }
    if (next !== null) {
      event.preventDefault()
      focusTab(CONTENT_TYPES[next])
    }
  }

  return (
    <div ref={listRef} role="tablist" aria-label="Content type" className={styles.list} onKeyDown={handleKeyDown}>
      {CONTENT_TYPES.map((type) => {
        const Icon = ICONS[type]
        const selected = type === value
        return (
          <button
            key={type}
            id={tabId(type)}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={tabPanelId(type)}
            tabIndex={selected ? 0 : -1}
            className={styles.tab}
            onClick={() => onChange(type)}
          >
            <Icon size={18} aria-hidden="true" />
            <span>{CONTENT_TYPE_LABELS[type]}</span>
          </button>
        )
      })}
    </div>
  )
}
