import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import type { FieldIssue } from '../../../lib/qr/validation'
import type { WifiContent, WifiEncryption } from '../../../lib/qr/types'
import { Field } from '../../ui/Field'
import { Select, TextInput } from '../../ui/Input'
import { Switch } from '../../ui/Switch'
import styles from './forms.module.css'
import { useTouched } from './useTouched'

interface Props {
  value: WifiContent
  issues: FieldIssue[]
  onChange: (patch: Partial<WifiContent>) => void
}

const ENCRYPTION_OPTIONS: { value: WifiEncryption; label: string }[] = [
  { value: 'WPA', label: 'WPA / WPA2 / WPA3' },
  { value: 'WEP', label: 'WEP' },
  { value: 'nopass', label: 'None (open network)' },
]

export function WifiForm({ value, issues, onChange }: Props) {
  const { touch, errorFor } = useTouched(issues)
  const [showPassword, setShowPassword] = useState(false)
  const needsPassword = value.encryption !== 'nopass'

  return (
    <div className={styles.stack}>
      <Field id="wifi-ssid" label="Network name (SSID)" error={errorFor('ssid')}>
        {(props) => (
          <TextInput
            {...props}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            placeholder="HomeNetwork"
            value={value.ssid}
            onChange={(event) => onChange({ ssid: event.target.value })}
            onBlur={() => touch('ssid')}
          />
        )}
      </Field>

      <Field id="wifi-encryption" label="Security">
        {(props) => (
          <Select
            {...props}
            value={value.encryption}
            onChange={(event) => onChange({ encryption: event.target.value as WifiEncryption })}
          >
            {ENCRYPTION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        )}
      </Field>

      {needsPassword && (
        <Field id="wifi-password" label="Password" error={errorFor('password')}>
          {(props) => (
            <div className={styles.inlineAction}>
              <TextInput
                {...props}
                type={showPassword ? 'text' : 'password'}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                placeholder="At least 8 characters"
                value={value.password}
                onChange={(event) => onChange({ password: event.target.value })}
                onBlur={() => touch('password')}
              />
              <button
                type="button"
                className={styles.inlineButton}
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
              </button>
            </div>
          )}
        </Field>
      )}

      <Switch
        id="wifi-hidden"
        label="Hidden network"
        description="Turn on if the network doesn't broadcast its name."
        checked={value.hidden}
        onChange={(hidden) => onChange({ hidden })}
      />
    </div>
  )
}
