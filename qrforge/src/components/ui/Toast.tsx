import { CircleAlert, CircleCheck, Info, X } from 'lucide-react'
import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'
import styles from './Toast.module.css'
import { ToastContext, type ToastOptions, type ToastVariant } from './toastContext'

interface ToastItem extends ToastOptions {
  id: number
  variant: ToastVariant
}

const MAX_VISIBLE = 3

const ICONS: Record<ToastVariant, typeof CircleCheck> = {
  success: CircleCheck,
  error: CircleAlert,
  info: Info,
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const counter = useRef(0)
  const timers = useRef(new Map<number, number>())

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id)
    if (timer) window.clearTimeout(timer)
    timers.current.delete(id)
    setToasts((current) => current.filter((item) => item.id !== id))
  }, [])

  const toast = useCallback(
    (options: ToastOptions) => {
      const id = ++counter.current
      const item: ToastItem = { ...options, id, variant: options.variant ?? 'success' }
      setToasts((current) => [...current, item].slice(-MAX_VISIBLE))
      const duration = options.duration ?? (options.action ? 7000 : 4000)
      timers.current.set(
        id,
        window.setTimeout(() => dismiss(id), duration),
      )
      return id
    },
    [dismiss],
  )

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <section className={styles.viewport} aria-label="Notifications">
        {toasts.map((item) => {
          const Icon = ICONS[item.variant]
          return (
            <div
              key={item.id}
              className={[styles.toast, styles[item.variant]].join(' ')}
              role={item.variant === 'error' ? 'alert' : 'status'}
            >
              <Icon className={styles.icon} size={18} aria-hidden="true" />
              <div className={styles.body}>
                <p className={styles.title}>{item.title}</p>
                {item.description && <p className={styles.description}>{item.description}</p>}
              </div>
              {item.action && (
                <button
                  type="button"
                  className={styles.action}
                  onClick={() => {
                    item.action?.onClick()
                    dismiss(item.id)
                  }}
                >
                  {item.action.label}
                </button>
              )}
              <button type="button" className={styles.close} onClick={() => dismiss(item.id)} aria-label="Dismiss">
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          )
        })}
      </section>
    </ToastContext.Provider>
  )
}
