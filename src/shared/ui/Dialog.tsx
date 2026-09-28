import { useEffect, useId, useRef } from 'react'
import type { ReactNode } from 'react'
import { IconButton } from './Button'
import styles from './ui.module.css'

export function Dialog({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  useEffect(() => {
    const dialog = ref.current!
    const previousFocus = document.activeElement
    dialog.showModal()
    dialog.querySelector<HTMLElement>('input, textarea, select')?.focus()
    return () => {
      dialog.close()
      if (previousFocus instanceof HTMLElement) previousFocus.focus()
    }
  }, [])
  return <dialog ref={ref} className={styles.dialog} aria-labelledby={titleId} onCancel={(event) => { event.preventDefault(); onClose() }}>
    <header className={styles.dialogHeader}><h2 id={titleId}>{title}</h2><IconButton icon="close" label="Закрыть окно" onClick={onClose} /></header>
    {children}
  </dialog>
}
