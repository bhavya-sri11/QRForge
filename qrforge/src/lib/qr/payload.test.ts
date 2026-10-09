import { describe, expect, it } from 'vitest'
import { DEFAULT_CONTENT } from '../../state/defaults'
import {
  buildEmailPayload,
  buildPayload,
  buildPhonePayload,
  buildVCardPayload,
  buildWifiPayload,
  escapeWifi,
  normalizePhone,
  normalizeUrl,
} from './payload'

describe('normalizeUrl', () => {
  it('adds https:// when the scheme is missing', () => {
    expect(normalizeUrl('example.com/page')).toBe('https://example.com/page')
  })

  it('keeps an explicit scheme and trims whitespace', () => {
    expect(normalizeUrl('  http://example.com  ')).toBe('http://example.com')
    expect(normalizeUrl('mailto:hi@example.com')).toBe('mailto:hi@example.com')
  })

  it('returns an empty string for blank input', () => {
    expect(normalizeUrl('   ')).toBe('')
  })
})

describe('normalizePhone', () => {
  it('keeps the leading plus and strips separators', () => {
    expect(normalizePhone('+91 (98765) 43-210')).toBe('+919876543210')
    expect(normalizePhone('040 2345 6789')).toBe('04023456789')
  })
})

describe('buildWifiPayload', () => {
  it('encodes a WPA network', () => {
    expect(buildWifiPayload({ ssid: 'HomeNet', password: 'secret123', encryption: 'WPA', hidden: false })).toBe(
      'WIFI:T:WPA;S:HomeNet;P:secret123;;',
    )
  })

  it('escapes reserved characters and flags hidden networks', () => {
    expect(buildWifiPayload({ ssid: 'Caf;é:Net', password: 'p,a"s\\s', encryption: 'WEP', hidden: true })).toBe(
      'WIFI:T:WEP;S:Caf\\;é\\:Net;P:p\\,a\\"s\\\\s;H:true;;',
    )
    expect(escapeWifi('a;b')).toBe('a\\;b')
  })

  it('omits the password for open networks', () => {
    expect(buildWifiPayload({ ssid: 'Guest', password: 'ignored', encryption: 'nopass', hidden: false })).toBe(
      'WIFI:T:nopass;S:Guest;;',
    )
  })
})

describe('buildEmailPayload', () => {
  it('builds a bare mailto link', () => {
    expect(buildEmailPayload({ to: 'hi@example.com', subject: '', body: '' })).toBe('mailto:hi@example.com')
  })

  it('percent-encodes subject and body with %20 for spaces', () => {
    expect(buildEmailPayload({ to: 'hi@example.com', subject: 'Hello there', body: 'Line 1\nLine 2 & 3' })).toBe(
      'mailto:hi@example.com?subject=Hello%20there&body=Line%201%0ALine%202%20%26%203',
    )
  })
})

describe('buildPhonePayload', () => {
  it('produces a tel: URI', () => {
    expect(buildPhonePayload({ phone: '+1 555 010 9999' })).toBe('tel:+15550109999')
  })
})

describe('buildVCardPayload', () => {
  it('writes a vCard 3.0 with CRLF line endings and only the filled fields', () => {
    const payload = buildVCardPayload({
      firstName: 'Asha',
      lastName: 'Rao',
      organization: 'Acme, Inc.',
      title: '',
      phone: '+91 98765 43210',
      email: 'asha@acme.example',
      website: 'acme.example',
    })
    expect(payload.split('\r\n')).toEqual([
      'BEGIN:VCARD',
      'VERSION:3.0',
      'N:Rao;Asha;;;',
      'FN:Asha Rao',
      'ORG:Acme\\, Inc.',
      'TEL;TYPE=CELL:+919876543210',
      'EMAIL;TYPE=INTERNET:asha@acme.example',
      'URL:https://acme.example',
      'END:VCARD',
    ])
  })

  it('returns an empty string without a name', () => {
    expect(buildVCardPayload({ ...DEFAULT_CONTENT.vcard, organization: 'Acme' })).toBe('')
  })
})

describe('buildPayload', () => {
  it('dispatches on the active content type', () => {
    expect(buildPayload('url', DEFAULT_CONTENT)).toBe('https://example.com')
    expect(buildPayload('text', { ...DEFAULT_CONTENT, text: { text: '  hello  ' } })).toBe('hello')
    expect(buildPayload('wifi', DEFAULT_CONTENT)).toBe('')
  })
})
