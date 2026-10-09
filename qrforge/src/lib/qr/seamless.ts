import type { ExtensionFunction } from 'qr-code-styling'

/**
 * The renderer draws every module as its own shape inside one clip path. When
 * the SVG is displayed at anything other than 1:1 (the scaled preview, a
 * zoomed SVG viewer) anti-aliasing leaves hairline seams between neighbouring
 * modules. Enlarging each module by a fraction of a unit so that neighbours
 * overlap removes the seams without visibly changing the design.
 */
const MAX_OVERLAP = 0.5

const MOVE_TO = /^M\s*(-?[\d.]+)\s+(-?[\d.]+)/
const ROTATE = /rotate\(([^,]+),\s*(-?[\d.]+),\s*(-?[\d.]+)\)/

export const removeSeams: ExtensionFunction = (svg) => {
  const clips = svg.querySelectorAll('clipPath[id^="clip-path-dot-color"]')
  for (const clip of clips) {
    for (const element of clip.children) {
      if (element.tagName === 'circle') continue // isolated dots never touch

      const transform = element.getAttribute('transform') ?? ''
      const rotate = ROTATE.exec(transform)
      if (!rotate) continue
      const cx = Number(rotate[2])
      const cy = Number(rotate[3])

      let size = 0
      if (element.tagName === 'rect') {
        size = Number(element.getAttribute('width'))
      } else {
        const move = MOVE_TO.exec(element.getAttribute('d') ?? '')
        if (move) size = 2 * (cx - Number(move[1]))
      }
      if (!(size > 0)) continue

      const overlap = Math.min(MAX_OVERLAP, size * 0.04)
      const scale = (size + overlap) / size
      element.setAttribute('transform', `${transform} translate(${cx} ${cy}) scale(${scale}) translate(${-cx} ${-cy})`)
    }
  }
}
