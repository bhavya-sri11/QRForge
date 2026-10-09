import { normalizePhone, normalizeUrl } from './payload'
import type { ContentState, ContentType } from './types'
import { getUrlIssue } from './validation'

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  url: 'URL',
  text: 'Text',
  wifi: 'Wi-Fi',
  email: 'Email',
  phone: 'Phone',
  vcard: 'vCard',
}

/** A short, human-readable description of what the code contains. */
export function describeContent(type: ContentType, content: ContentState): string {
  switch (type) {
    case 'url': {
      const value = content.url.url.trim()
      if (!value || getUrlIssue(value)) return value
      const parsed = new URL(normalizeUrl(value))
      return parsed.hostname + (parsed.pathname !== '/' ? parsed.pathname : '')
    }
    case 'text': {
      const text = content.text.text.trim()
      if (!text) return ''
      const firstLine = text.split('\n')[0]
      return firstLine.length > 40 ? `${firstLine.slice(0, 40)}…` : firstLine
    }
    case 'wifi':
      return content.wifi.ssid.trim()
    case 'email':
      return content.email.to.trim()
    case 'phone':
      return normalizePhone(content.phone.phone)
    case 'vcard':
      return [content.vcard.firstName.trim(), content.vcard.lastName.trim()].filter(Boolean).join(' ')
  }
}

/** Used for file names, so it prefers something recognisable over the raw payload. */
export function fileNameHint(type: ContentType, content: ContentState): string {
  const description = describeContent(type, content)
  return description ? `${type}-${description}` : type
}
