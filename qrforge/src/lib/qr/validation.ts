import { normalizePhone, normalizeUrl } from './payload'
import type { ContentState, ContentType, EmailContent, VCardContent, WifiContent } from './types'

export interface FieldIssue {
  field: string
  message: string
}

export interface ValidationResult {
  /** Nothing meaningful typed yet — show an empty state instead of errors. */
  isEmpty: boolean
  issues: FieldIssue[]
  /** Non-empty and free of issues: safe to encode. */
  isValid: boolean
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE_ALLOWED = /^\+?[\d\s().-]+$/
const HOSTNAME_PATTERN = /^(localhost|[^.]+(\.[^.]+)*\.[a-z0-9-]{2,})$/i

function result(isEmpty: boolean, issues: FieldIssue[]): ValidationResult {
  return { isEmpty, issues, isValid: !isEmpty && issues.length === 0 }
}

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim())
}

export function isValidPhone(value: string): boolean {
  const trimmed = value.trim()
  if (!PHONE_ALLOWED.test(trimmed)) return false
  const digits = normalizePhone(trimmed).replace('+', '')
  return digits.length >= 4 && digits.length <= 15
}

/** Returns a message for a bad URL, or null when it is usable. */
export function getUrlIssue(raw: string): string | null {
  const trimmed = raw.trim()
  if (/\s/.test(trimmed)) return 'Remove the spaces from the address.'
  let parsed: URL
  try {
    parsed = new URL(normalizeUrl(trimmed))
  } catch {
    return 'Enter a complete address, like https://example.com.'
  }
  if ((parsed.protocol === 'http:' || parsed.protocol === 'https:') && !HOSTNAME_PATTERN.test(parsed.hostname)) {
    return 'Add a domain ending, like .com or .in.'
  }
  return null
}

function validateUrl(url: string): ValidationResult {
  if (!url.trim()) return result(true, [])
  const issue = getUrlIssue(url)
  return result(false, issue ? [{ field: 'url', message: issue }] : [])
}

function validateText(text: string): ValidationResult {
  return result(!text.trim(), [])
}

function validateWifi(content: WifiContent): ValidationResult {
  const ssid = content.ssid.trim()
  const needsPassword = content.encryption !== 'nopass'
  if (!ssid && !content.password) return result(true, [])

  const issues: FieldIssue[] = []
  if (!ssid) issues.push({ field: 'ssid', message: 'Enter the network name (SSID).' })
  else if (ssid.length > 32) issues.push({ field: 'ssid', message: 'Network names are at most 32 characters.' })

  if (needsPassword) {
    if (!content.password) {
      issues.push({ field: 'password', message: `${content.encryption} networks need a password.` })
    } else if (content.encryption === 'WPA' && (content.password.length < 8 || content.password.length > 63)) {
      issues.push({ field: 'password', message: 'WPA passwords are 8–63 characters long.' })
    }
  }
  return result(false, issues)
}

function validateEmail(content: EmailContent): ValidationResult {
  const to = content.to.trim()
  if (!to && !content.subject.trim() && !content.body.trim()) return result(true, [])
  const issues: FieldIssue[] = []
  if (!to) issues.push({ field: 'to', message: 'Enter the recipient’s email address.' })
  else if (!isValidEmail(to)) issues.push({ field: 'to', message: 'Enter a valid address, like name@example.com.' })
  return result(false, issues)
}

function validatePhone(phone: string): ValidationResult {
  if (!phone.trim()) return result(true, [])
  const issues: FieldIssue[] = []
  if (!isValidPhone(phone)) {
    issues.push({ field: 'phone', message: 'Enter 4–15 digits, with an optional + country code.' })
  }
  return result(false, issues)
}

function validateVCard(content: VCardContent): ValidationResult {
  const values = Object.values(content).map((value) => value.trim())
  if (values.every((value) => !value)) return result(true, [])

  const issues: FieldIssue[] = []
  if (!content.firstName.trim() && !content.lastName.trim()) {
    issues.push({ field: 'firstName', message: 'Add at least a first or last name.' })
  }
  if (content.phone.trim() && !isValidPhone(content.phone)) {
    issues.push({ field: 'phone', message: 'Enter 4–15 digits, with an optional + country code.' })
  }
  if (content.email.trim() && !isValidEmail(content.email)) {
    issues.push({ field: 'email', message: 'Enter a valid address, like name@example.com.' })
  }
  if (content.website.trim()) {
    const issue = getUrlIssue(content.website)
    if (issue) issues.push({ field: 'website', message: issue })
  }
  return result(false, issues)
}

export function validateContent(type: ContentType, content: ContentState): ValidationResult {
  switch (type) {
    case 'url':
      return validateUrl(content.url.url)
    case 'text':
      return validateText(content.text.text)
    case 'wifi':
      return validateWifi(content.wifi)
    case 'email':
      return validateEmail(content.email)
    case 'phone':
      return validatePhone(content.phone.phone)
    case 'vcard':
      return validateVCard(content.vcard)
  }
}

export function findIssue(issues: FieldIssue[], field: string): string | undefined {
  return issues.find((issue) => issue.field === field)?.message
}
