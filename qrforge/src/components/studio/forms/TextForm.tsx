import type { CapacityInfo } from '../../../lib/qr/capacity'
import { ERROR_CORRECTION_INFO } from '../../../lib/qr/capacity'
import type { ErrorCorrection, TextContent } from '../../../lib/qr/types'
import { Field } from '../../ui/Field'
import { TextArea } from '../../ui/Input'

interface Props {
  value: TextContent
  capacity: CapacityInfo
  errorCorrection: ErrorCorrection
  onChange: (patch: Partial<TextContent>) => void
}

const formatter = new Intl.NumberFormat('en')

export function TextForm({ value, capacity, errorCorrection, onChange }: Props) {
  const unit = capacity.mode === 'byte' ? 'bytes' : 'chars'
  const counter = `${formatter.format(capacity.used)} / ${formatter.format(capacity.max)} ${unit}`
  const error = capacity.exceeded
    ? `Too long for level ${errorCorrection} (${ERROR_CORRECTION_INFO[errorCorrection].label}). Shorten the text or lower the error correction.`
    : undefined

  return (
    <Field
      id="text"
      label="Text"
      hint="Shown as plain text when scanned. Shorter text makes a simpler, easier-to-scan code."
      error={error}
      meta={counter}
    >
      {(props) => (
        <TextArea
          {...props}
          rows={6}
          placeholder="Type or paste anything…"
          value={value.text}
          onChange={(event) => onChange({ text: event.target.value })}
        />
      )}
    </Field>
  )
}
