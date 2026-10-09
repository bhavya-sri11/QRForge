import { describe, expect, it } from 'vitest'
import { DEFAULT_CONTENT } from '../../state/defaults'
import type { ContentState } from './types'
import { findIssue, getUrlIssue, isValidEmail, isValidPhone, validateContent } from './validation'

function withContent(patch: Partial<ContentState>): ContentState {
  return { ...DEFAULT_CONTENT, ...patch }
}

describe('getUrlIssue', () => {
  it('accepts normal addresses, with or without a scheme', () => {
    expect(getUrlIssue('https://example.com')).toBeNull()
    expect(getUrlIssue('example.com/path?x=1')).toBeNull()
    expect(getUrlIssue('http://localhost:3000')).toBeNull()
    expect(getUrlIssue('http://192.168.1.10/admin')).toBeNull()
  })

  it('rejects spaces, missing domains and garbage', () => {
    expect(getUrlIssue('my site.com')).toMatch(/spaces/)
    expect(getUrlIssue('https://intranet')).toMatch(/domain ending/)
    expect(getUrlIssue('https://')).toMatch(/complete address/)
  })
})

describe('validateContent', () => {
  it('treats a blank URL as empty, not invalid', () => {
    const result = validateContent('url', withContent({ url: { url: '   ' } }))
    expect(result.isEmpty).toBe(true)
    expect(result.isValid).toBe(false)
    expect(result.issues).toHaveLength(0)
  })

  it('requires a Wi-Fi password for protected networks', () => {
    const result = validateContent(
      'wifi',
      withContent({ wifi: { ssid: 'HomeNet', password: '', encryption: 'WPA', hidden: false } }),
    )
    expect(findIssue(result.issues, 'password')).toMatch(/need a password/)

    const short = validateContent(
      'wifi',
      withContent({ wifi: { ssid: 'HomeNet', password: '123', encryption: 'WPA', hidden: false } }),
    )
    expect(findIssue(short.issues, 'password')).toMatch(/8–63/)

    const open = validateContent(
      'wifi',
      withContent({ wifi: { ssid: 'HomeNet', password: '', encryption: 'nopass', hidden: false } }),
    )
    expect(open.isValid).toBe(true)
  })

  it('needs a recipient once an email subject is typed', () => {
    const result = validateContent('email', withContent({ email: { to: '', subject: 'Hi', body: '' } }))
    expect(result.isEmpty).toBe(false)
    expect(findIssue(result.issues, 'to')).toMatch(/recipient/)
  })

  it('validates phone numbers', () => {
    expect(isValidPhone('+91 98765 43210')).toBe(true)
    expect(isValidPhone('123')).toBe(false)
    expect(isValidPhone('call me')).toBe(false)
    expect(validateContent('phone', withContent({ phone: { phone: '555-0199' } })).isValid).toBe(true)
  })

  it('validates email addresses', () => {
    expect(isValidEmail('name@example.com')).toBe(true)
    expect(isValidEmail('name@example')).toBe(false)
    expect(isValidEmail('not an email')).toBe(false)
  })

  it('needs a name for a vCard and checks optional fields', () => {
    const noName = validateContent('vcard', withContent({ vcard: { ...DEFAULT_CONTENT.vcard, organization: 'Acme' } }))
    expect(findIssue(noName.issues, 'firstName')).toMatch(/first or last name/)

    const badFields = validateContent(
      'vcard',
      withContent({
        vcard: { ...DEFAULT_CONTENT.vcard, firstName: 'Asha', email: 'nope', phone: '12', website: 'bad url' },
      }),
    )
    expect(badFields.issues.map((issue) => issue.field).sort()).toEqual(['email', 'phone', 'website'])
  })
})
