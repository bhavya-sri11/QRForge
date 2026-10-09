import QRCodeStyling, { type Options } from 'qr-code-styling'
import { useEffect, useRef, useState, type RefObject } from 'react'
import { removeSeams } from '../lib/qr/seamless'

export interface QrRender {
  containerRef: RefObject<HTMLDivElement | null>
  /** True once something has been drawn into the container. */
  hasRender: boolean
  /** A human-readable reason the latest options could not be drawn. */
  error: string | null
}

function describeRenderError(error: unknown): string {
  const message = typeof error === 'string' ? error : error instanceof Error ? error.message : ''
  if (/overflow/i.test(message)) return 'The content is too long for this error-correction level.'
  return 'The code could not be rendered.'
}

/**
 * Owns one renderer instance and keeps it in sync with `options`. The
 * renderer mutates the DOM imperatively, so it lives in a ref and React only
 * manages the container element. Pass `null` to leave the last render as is.
 */
export function useQrCode(options: Options | null): QrRender {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const instanceRef = useRef<QRCodeStyling | null>(null)
  const [hasRender, setHasRender] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container || !options) return

    try {
      if (instanceRef.current) {
        instanceRef.current.update(options)
      } else {
        const instance = new QRCodeStyling(options)
        instance.applyExtension(removeSeams)
        instance.append(container)
        instanceRef.current = instance
      }
      // The renderer is an external system; its outcome is only known after drawing.
      // oxlint-disable-next-line react/set-state-in-effect
      setHasRender(true)
      setError(null)
    } catch (err) {
      setError(describeRenderError(err))
      // update() empties the container before it throws; restore the last good render.
      instanceRef.current?.append(container)
    }
  }, [options])

  useEffect(() => {
    const container = containerRef.current
    return () => {
      instanceRef.current = null
      if (container) container.replaceChildren()
    }
  }, [])

  return { containerRef, hasRender, error }
}
