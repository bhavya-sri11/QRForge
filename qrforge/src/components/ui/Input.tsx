import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import styles from './Input.module.css'

type InputProps = InputHTMLAttributes<HTMLInputElement> & { mono?: boolean }

export function TextInput({ className, mono, ...rest }: InputProps) {
  return <input className={[styles.control, mono ? styles.mono : '', className ?? ''].join(' ')} {...rest} />
}

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement>

export function TextArea({ className, rows = 4, ...rest }: TextAreaProps) {
  return <textarea className={[styles.control, styles.textarea, className ?? ''].join(' ')} rows={rows} {...rest} />
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>

export function Select({ className, children, ...rest }: SelectProps) {
  return (
    <span className={styles.selectWrap}>
      <select className={[styles.control, styles.select, className ?? ''].join(' ')} {...rest}>
        {children}
      </select>
      <ChevronDown className={styles.selectIcon} size={16} aria-hidden="true" />
    </span>
  )
}
