import { useCallback, useState } from 'react'
import { findIssue, type FieldIssue } from '../../../lib/qr/validation'

/**
 * Validation messages only appear once a field has been left (or has
 * clearly-wrong content), so people are not shouted at mid-keystroke.
 */
export function useTouched(issues: FieldIssue[]) {
  const [touched, setTouched] = useState<Record<string, true>>({})

  const touch = useCallback((field: string) => {
    setTouched((current) => (current[field] ? current : { ...current, [field]: true }))
  }, [])

  const errorFor = useCallback(
    (field: string) => (touched[field] ? findIssue(issues, field) : undefined),
    [issues, touched],
  )

  return { touch, errorFor }
}
