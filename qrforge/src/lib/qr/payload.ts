import type {
  ContentState,
  ContentType,
  EmailContent,
  PhoneContent,
  UrlContent,
  VCardContent,
  WifiContent,
} from './types'

const SCHEME_PATTERN = /^[a-z][a-z0-9+.-]*:/i

/** Adds https:// when the user leaves the scheme out, which is the common case. */
export function normalizeUrl(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return ''
  return SCHEME_PATTERN.test(trimmed) ? trimmed : `https://${trimmed}`
}

/** Keeps a leading + and digits only: "+91 (98765) 43-210" → "+919876543210". */
export function normalizePhone(raw: string): string {
  const trimmed = raw.trim()
  const plus = trimmed.startsWith('+') ? '+' : ''
  return plus + trimmed.replace(/\D/g, '')
}

/** Escapes the characters that are special in the WIFI: URI scheme. */
export function escapeWifi(value: string): string {
  return value.replace(/([\\;,":])/g, '\\$1')
}

/** Escapes a vCard 3.0 text value (RFC 2426 §2.4.2). */
export function escapeVCard(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;')
}

export function buildUrlPayload(content: UrlContent): string {
  return normalizeUrl(content.url)
}

export function buildTextPayload(content: { text: string }): string {
  return content.text.trim()
}

export function buildWifiPayload(content: WifiContent): string {
  const ssid = content.ssid.trim()
  if (!ssid) return ''
  const parts = [`T:${content.encryption}`, `S:${escapeWifi(ssid)}`]
  if (content.encryption !== 'nopass' && content.password) {
    parts.push(`P:${escapeWifi(content.password)}`)
  }
  if (content.hidden) parts.push('H:true')
  return `WIFI:${parts.join(';')};;`
}

export function buildEmailPayload(content: EmailContent): string {
  const to = content.to.trim()
  if (!to) return ''
  const params = new URLSearchParams()
  if (content.subject.trim()) params.set('subject', content.subject.trim())
  if (content.body.trim()) params.set('body', content.body.trim())
  // URLSearchParams encodes spaces as "+", which mail clients read literally.
  const query = params.toString().replace(/\+/g, '%20')
  return query ? `mailto:${to}?${query}` : `mailto:${to}`
}

export function buildPhonePayload(content: PhoneContent): string {
  const phone = normalizePhone(content.phone)
  return phone ? `tel:${phone}` : ''
}

export function buildVCardPayload(content: VCardContent): string {
  const first = content.firstName.trim()
  const last = content.lastName.trim()
  const fullName = [first, last].filter(Boolean).join(' ')
  if (!fullName) return ''

  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${escapeVCard(last)};${escapeVCard(first)};;;`,
    `FN:${escapeVCard(fullName)}`,
  ]
  const organization = content.organization.trim()
  const title = content.title.trim()
  const phone = normalizePhone(content.phone)
  const email = content.email.trim()
  const website = normalizeUrl(content.website)

  if (organization) lines.push(`ORG:${escapeVCard(organization)}`)
  if (title) lines.push(`TITLE:${escapeVCard(title)}`)
  if (phone) lines.push(`TEL;TYPE=CELL:${phone}`)
  if (email) lines.push(`EMAIL;TYPE=INTERNET:${email}`)
  if (website) lines.push(`URL:${website}`)
  lines.push('END:VCARD')
  return lines.join('\r\n')
}

/** The exact string that gets encoded into the QR code for the active type. */
export function buildPayload(type: ContentType, content: ContentState): string {
  switch (type) {
    case 'url':
      return buildUrlPayload(content.url)
    case 'text':
      return buildTextPayload(content.text)
    case 'wifi':
      return buildWifiPayload(content.wifi)
    case 'email':
      return buildEmailPayload(content.email)
    case 'phone':
      return buildPhonePayload(content.phone)
    case 'vcard':
      return buildVCardPayload(content.vcard)
  }
}
