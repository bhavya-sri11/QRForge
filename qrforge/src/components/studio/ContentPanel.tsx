import type { CapacityInfo } from '../../lib/qr/capacity'
import type { ContentState, ContentType, ErrorCorrection } from '../../lib/qr/types'
import type { FieldIssue } from '../../lib/qr/validation'
import { Panel } from '../ui/Panel'
import { EmailForm } from './forms/EmailForm'
import { PhoneForm } from './forms/PhoneForm'
import { TextForm } from './forms/TextForm'
import { UrlForm } from './forms/UrlForm'
import { VCardForm } from './forms/VCardForm'
import { WifiForm } from './forms/WifiForm'
import { tabId, tabPanelId } from './tabIds'
import { TypeTabs } from './TypeTabs'

interface ContentPanelProps {
  type: ContentType
  content: ContentState
  issues: FieldIssue[]
  capacity: CapacityInfo
  errorCorrection: ErrorCorrection
  onSelectType: (type: ContentType) => void
  onChange: <T extends ContentType>(type: T, patch: Partial<ContentState[T]>) => void
}

export function ContentPanel({
  type,
  content,
  issues,
  capacity,
  errorCorrection,
  onSelectType,
  onChange,
}: ContentPanelProps) {
  const form = (() => {
    switch (type) {
      case 'url':
        return <UrlForm value={content.url} issues={issues} onChange={(patch) => onChange('url', patch)} />
      case 'text':
        return (
          <TextForm
            value={content.text}
            capacity={capacity}
            errorCorrection={errorCorrection}
            onChange={(patch) => onChange('text', patch)}
          />
        )
      case 'wifi':
        return <WifiForm value={content.wifi} issues={issues} onChange={(patch) => onChange('wifi', patch)} />
      case 'email':
        return <EmailForm value={content.email} issues={issues} onChange={(patch) => onChange('email', patch)} />
      case 'phone':
        return <PhoneForm value={content.phone} issues={issues} onChange={(patch) => onChange('phone', patch)} />
      case 'vcard':
        return <VCardForm value={content.vcard} issues={issues} onChange={(patch) => onChange('vcard', patch)} />
    }
  })()

  return (
    <Panel id="content" title="Content" description="What people get when they scan">
      <TypeTabs value={type} onChange={onSelectType} />
      <div key={type} id={tabPanelId(type)} role="tabpanel" aria-labelledby={tabId(type)}>
        {form}
      </div>
    </Panel>
  )
}
