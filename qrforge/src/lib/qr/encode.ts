import type { Options } from 'qr-code-styling'
import type { QrStyle } from './types'

const encoder = new TextEncoder()

/**
 * qr-code-styling's byte mode truncates each UTF-16 code unit to 8 bits, so
 * anything outside Latin-1 ("₹", "café" is fine, "नमस्ते" is not) would be
 * corrupted. Pre-encoding to UTF-8 and mapping each byte to a char keeps the
 * bytes intact; every mainstream reader decodes byte mode as UTF-8.
 */
export function toByteString(input: string): string {
  const bytes = encoder.encode(input)
  if (bytes.length === input.length) return input // pure ASCII, nothing to do
  let out = ''
  for (const byte of bytes) out += String.fromCharCode(byte)
  return out
}

/** Translates studio state into the renderer's option object. */
export function buildQrOptions(payload: string, style: QrStyle): Options {
  const hasLogo = style.logo !== null
  return {
    type: 'svg',
    shape: 'square',
    width: style.size,
    height: style.size,
    margin: style.margin,
    data: toByteString(payload),
    image: hasLogo ? style.logo!.dataUrl : undefined,
    qrOptions: {
      typeNumber: 0,
      errorCorrectionLevel: style.errorCorrection,
    },
    imageOptions: {
      saveAsBlob: true,
      hideBackgroundDots: style.hideDotsBehindLogo,
      imageSize: style.logoScale,
      margin: style.logoPadding,
    },
    dotsOptions: {
      type: style.dotStyle,
      color: style.foreground,
      roundSize: true,
    },
    cornersSquareOptions: {
      type: style.eyeFrame,
      color: style.foreground,
    },
    cornersDotOptions: {
      type: style.eyeCenter,
      color: style.foreground,
    },
    backgroundOptions: {
      round: 0,
      color: style.background,
    },
  }
}
