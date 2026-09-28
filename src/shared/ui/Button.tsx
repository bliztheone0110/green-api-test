import type { ButtonHTMLAttributes } from 'react'
import { Icon } from './Icon'
import type { IconName } from './Icon'
import styles from './ui.module.css'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' }

export function Button({ variant = 'primary', className = '', type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={`${styles.button} ${styles[variant]} ${className}`} {...props} />
}

export function IconButton({ icon, label, className = '', ...props }: Omit<ButtonProps, 'children'> & { icon: IconName; label: string }) {
  return <Button variant="ghost" className={`${styles.iconButton} ${className}`} aria-label={label} title={label} {...props}><Icon name={icon} /></Button>
}
