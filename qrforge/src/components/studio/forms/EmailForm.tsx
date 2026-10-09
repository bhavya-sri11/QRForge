import type { FieldIssue } from '../../../lib/qr/validation'
import type { EmailContent } from '../../../lib/qr/types'
import { Field } from '../../ui/Field'
import { TextArea, TextInput } from '../../ui/Input'
import styles from './forms.module.css'
import { useTouched } from './useTouched'

interface Props {
  value: EmailContent
  issues: FieldIssue[]
  onChange: (patch: Partial<EmailContent>) => void
}

export function EmailForm({ value, issues, onChange }: Props) {
  const { touch, errorFor } = useTouched(issues)

  return (
    <div className={styles.stack}>
      <Field id="email-to" label="To" hint="Scanning opens a pre-filled email." error={errorFor('to')}>
        {(props) => (
          <TextInput
            {...props}
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="off"
            spellCheck={false}
            placeholder="hello@example.com"
            value={value.to}
            onChange={(event) => onChange({ to: event.target.value })}
            onBlur={() => touch('to')}
          />
        )}
      </Field>
      <Field id="email-subject" label="Subject" optional>
        {(props) => (
          <TextInput
            {...props}
            placeholder="Booking enquiry"
            value={value.subject}
            onChange={(event) => onChange({ subject: event.target.value })}
          />
        )}
      </Field>
      <Field id="email-body" label="Message" optional>
        {(props) => (
          <TextArea
            {...props}
            rows={4}
            placeholder="Hi, I'd like to…"
            value={value.body}
            onChange={(event) => onChange({ body: event.target.value })}
          />
        )}
      </Field>
    </div>
  )
}
