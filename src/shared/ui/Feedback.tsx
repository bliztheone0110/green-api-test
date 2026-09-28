import type { ReactNode } from 'react'
import { Icon } from './Icon'
import styles from './ui.module.css'

export function Spinner({ label = 'Загрузка' }: { label?: string }) {
  return <span role="status" className={styles.spinnerWrap}><span className={styles.spinner} aria-hidden="true" />{label}</span>
}
export function ErrorNotice({ children }: { children: ReactNode }) {
  return <div role="alert" className={styles.errorNotice}>{children}</div>
}
export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className={styles.empty}><span className={styles.emptyIcon}><Icon name="chat" width="30" height="30" /></span><h2>{title}</h2><p>{description}</p>{action}</div>
}
export function Avatar({ name, color = 'purple' }: { name: string; color?: 'purple' | 'blue' | 'peach' }) {
  const initials = name.replace(/^\+/, '').split(/\s+/).map((word) => Array.from(word)[0]).slice(0, 2).join('')
  return <span className={`${styles.avatar} ${styles[color]}`} aria-hidden="true">{initials.toUpperCase()}</span>
}
