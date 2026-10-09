import type { ContentType } from '../../lib/qr/types'

export function tabId(type: ContentType): string {
  return `type-tab-${type}`
}

export function tabPanelId(type: ContentType): string {
  return `type-panel-${type}`
}
