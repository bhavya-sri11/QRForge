import type { FieldIssue } from '../../../lib/qr/validation'
import type { UrlContent } from '../../../lib/qr/types'
import { Field } from '../../ui/Field'
import { TextInput } from '../../ui/Input'
import { useTouched } from './useTouched'

interface Props {
  value: UrlContent
  issues: FieldIssue[]
  onChange: (patch: Partial<UrlContent>) => void
}

const HAS_SCHEME = /^[a-z][a-z0-9+.-]*:/i

export function UrlForm({ value, issues, onChange }: Props) {
  const { touch, errorFor } = useTouched(issues)
  const trimmed = value.url.trim()
  const hint =
    trimmed && !HAS_SCHEME.test(trimmed)
      ? 'https:// will be added automatically.'
      : 'Scanning opens this address in the browser.'

  return (
    <Field id="url" label="Website address" hint={hint} error={errorFor('url')}>
      {(props) => (
        <TextInput
          {...props}
          type="url"
          inputMode="url"
          autoComplete="url"
          autoCapitalize="off"
          spellCheck={false}
          placeholder="https://example.com"
          value={value.url}
          onChange={(event) => onChange({ url: event.target.value })}
          onBlur={() => touch('url')}
        />
      )}
    </Field>
  )
}
