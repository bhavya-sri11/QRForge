import type { FieldIssue } from '../../../lib/qr/validation'
import type { VCardContent } from '../../../lib/qr/types'
import { Field } from '../../ui/Field'
import { TextInput } from '../../ui/Input'
import styles from './forms.module.css'
import { useTouched } from './useTouched'

interface Props {
  value: VCardContent
  issues: FieldIssue[]
  onChange: (patch: Partial<VCardContent>) => void
}

export function VCardForm({ value, issues, onChange }: Props) {
  const { touch, errorFor } = useTouched(issues)

  return (
    <div className={styles.stack}>
      <div className={styles.columns}>
        <Field id="vcard-first" label="First name" error={errorFor('firstName')}>
          {(props) => (
            <TextInput
              {...props}
              autoComplete="given-name"
              placeholder="Asha"
              value={value.firstName}
              onChange={(event) => onChange({ firstName: event.target.value })}
              onBlur={() => touch('firstName')}
            />
          )}
        </Field>
        <Field id="vcard-last" label="Last name">
          {(props) => (
            <TextInput
              {...props}
              autoComplete="family-name"
              placeholder="Rao"
              value={value.lastName}
              onChange={(event) => onChange({ lastName: event.target.value })}
              onBlur={() => touch('firstName')}
            />
          )}
        </Field>
      </div>
      <div className={styles.columns}>
        <Field id="vcard-org" label="Company" optional>
          {(props) => (
            <TextInput
              {...props}
              autoComplete="organization"
              placeholder="Acme Studio"
              value={value.organization}
              onChange={(event) => onChange({ organization: event.target.value })}
            />
          )}
        </Field>
        <Field id="vcard-title" label="Job title" optional>
          {(props) => (
            <TextInput
              {...props}
              autoComplete="organization-title"
              placeholder="Product Designer"
              value={value.title}
              onChange={(event) => onChange({ title: event.target.value })}
            />
          )}
        </Field>
      </div>
      <Field id="vcard-phone" label="Phone" optional error={errorFor('phone')}>
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
      <Field id="vcard-email" label="Email" optional error={errorFor('email')}>
        {(props) => (
          <TextInput
            {...props}
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="off"
            placeholder="asha@example.com"
            value={value.email}
            onChange={(event) => onChange({ email: event.target.value })}
            onBlur={() => touch('email')}
          />
        )}
      </Field>
      <Field id="vcard-website" label="Website" optional error={errorFor('website')}>
        {(props) => (
          <TextInput
            {...props}
            type="url"
            inputMode="url"
            autoComplete="url"
            autoCapitalize="off"
            spellCheck={false}
            placeholder="example.com"
            value={value.website}
            onChange={(event) => onChange({ website: event.target.value })}
            onBlur={() => touch('website')}
          />
        )}
      </Field>
    </div>
  )
}
