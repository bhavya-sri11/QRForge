import QRCodeStyling, { type Options } from 'qr-code-styling'
import { removeSeams } from './qr/seamless'

export type ExportFormat = 'png' | 'svg'

const EXPORT_TIMEOUT_MS = 15000

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error(`${label} timed out`)), ms)
    promise.then(
      (value) => {
        window.clearTimeout(timer)
        resolve(value)
      },
      (error) => {
        window.clearTimeout(timer)
        reject(error)
      },
    )
  })
}

/**
 * Renders a fresh, self-contained file. A throwaway instance is used on
 * purpose: the library caches its export canvas, so reusing the on-screen
 * instance can return a stale bitmap after the options change.
 */
export async function renderBlob(options: Options, format: ExportFormat): Promise<Blob> {
  const instance = new QRCodeStyling({ ...options, type: format === 'svg' ? 'svg' : 'canvas' })
  instance.applyExtension(removeSeams)
  const data = await withTimeout(instance.getRawData(format), EXPORT_TIMEOUT_MS, 'Export')
  if (!(data instanceof Blob)) throw new Error('The renderer returned no data')
  return data
}

export function saveBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.rel = 'noopener'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  // Give the browser a moment to start the download before revoking.
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

export function supportsImageClipboard(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    typeof ClipboardItem !== 'undefined' &&
    typeof navigator.clipboard?.write === 'function' &&
    window.isSecureContext
  )
}

/**
 * Copies a PNG to the clipboard. Safari only honours writes that start inside
 * the user gesture, so the Promise<Blob> form is tried first and the resolved
 * form is the fallback for browsers that reject promise-valued items.
 */
export async function copyPngToClipboard(pngPromise: Promise<Blob>): Promise<void> {
  if (!supportsImageClipboard()) throw new Error('Image clipboard is not supported in this browser')
  try {
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': pngPromise })])
  } catch (error) {
    if (!(error instanceof TypeError)) throw error
    const blob = await pngPromise
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
  }
}

export function slugify(input: string, maxLength = 40): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, maxLength)
    .replace(/-+$/g, '')
}

export function makeFileName(hint: string, format: ExportFormat): string {
  const slug = slugify(hint)
  return `qrforge-${slug || 'code'}.${format}`
}
