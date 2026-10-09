import type { FieldIssue } from '../../../lib/qr/validation'
import type { PhoneContent } from '../../../lib/qr/types'
import { Field } from '../../ui/Field'
import { TextInput } from '../../ui/Input'
import { useTouched } from './useTouched'

interface Props {
  value: PhoneContent
  issues: FieldIssue[]
  onChange: (patch: Partial<PhoneContent>) => void
}

export function PhoneForm({ value, issues, onChange }: Props) {
  const { touch, errorFor } = useTouched(issues)

  return (
    <Field
      id="phone"
      label="Phone number"
      hint="Include the country code so it works abroad. Scanning opens the dialler."
      error={errorFor('phone')}
    >
      {(props) => (
        <TextInput
          {...props}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+91 98765 43210"
          value={value.phone}
          onChange={(event) => onChange({ phone: event.target.value })}
          onBlur={() => touch('phone')}
        />
      )}
    </Field>
  )
}
