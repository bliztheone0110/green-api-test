import { useId } from 'react'
import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'
import styles from './Fields.module.css'

interface FieldProps { label: string; hint?: string; error?: string }

export function TextField({ label, hint, error, id, className = '', ...props }: InputHTMLAttributes<HTMLInputElement> & FieldProps) {
  const generatedId = useId()
  const fieldId = id ?? generatedId
  const description = error ?? hint
  return <div className={styles.field}>
    <label htmlFor={fieldId}>
      {label}
    </label>
    <input
      id={fieldId}
      className={`${styles.input} ${className}`}
      aria-invalid={Boolean(error)}
      aria-describedby={description ? `${fieldId}-hint` : undefined}
      {...props}
    />
    {description && <span
      id={`${fieldId}-hint`}
      className={error ? styles.errorText : styles.hint}
    >
      {description}
    </span>}
  </div>
}

export function TextArea({ label, id, className = '', ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  const generatedId = useId()
  const fieldId = id ?? generatedId
  return <>
    <label
      className={styles.srOnly}
      htmlFor={fieldId}
    >
      {label}
    </label>
    <textarea
      id={fieldId}
      className={`${styles.textarea} ${className}`}
      {...props}
    />
  </>
}
