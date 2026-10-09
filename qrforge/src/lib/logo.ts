import { LOGO_MAX_BYTES, type Logo } from './qr/types'

const ACCEPTED_TYPES = new Set(['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'])

export const LOGO_ACCEPT = 'image/png,image/jpeg,image/svg+xml,image/webp'

export class LogoError extends Error {}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new LogoError('The file could not be read.'))
    reader.readAsDataURL(file)
  })
}

function measureImage(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve({ width: image.naturalWidth || 1, height: image.naturalHeight || 1 })
    image.onerror = () => reject(new LogoError('That file is not a readable image.'))
    image.src = dataUrl
  })
}

/** Validates and decodes an uploaded logo entirely on the client. */
export async function loadLogo(file: File): Promise<Logo> {
  if (!ACCEPTED_TYPES.has(file.type)) {
    throw new LogoError('Use a PNG, JPG, SVG or WebP image.')
  }
  if (file.size > LOGO_MAX_BYTES) {
    throw new LogoError(`Keep the logo under ${Math.round(LOGO_MAX_BYTES / 1024)} KB.`)
  }
  const dataUrl = await readAsDataUrl(file)
  const { width, height } = await measureImage(dataUrl)
  return { dataUrl, name: file.name, width, height, bytes: file.size }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(bytes < 10 * 1024 ? 1 : 0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
