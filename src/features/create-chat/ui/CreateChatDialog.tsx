import { useState } from 'react'
import { Button, Dialog, TextField } from '@/shared/ui'
import styles from './CreateChatDialog.module.css'

export function CreateChatDialog({ onClose, onCreate }: { onClose: () => void; onCreate: (phone: string) => void }) {
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  return <Dialog title="Новый чат" onClose={onClose}>
    <form className={styles.form} onSubmit={(event) => {
      event.preventDefault()
      const digits = phone.replace(/[\s()+-]/g, '')
      if (!/^[1-9]\d{6,14}$/.test(digits)) { setError('Введите международный номер: от 7 до 15 цифр.'); return }
      onCreate(`+${digits}`)
    }}>
      <p>Введите номер собеседника с кодом страны.</p>
      <TextField label="Номер телефона" type="tel" placeholder="+7 900 000-00-00" value={phone} autoComplete="off" autoFocus
        onChange={(event) => { setPhone(event.target.value); setError('') }} error={error} />
      <p className={styles.note}>Демо: аккаунт Telegram не проверяется, чат создаётся только в этом окне.</p>
      <div className={styles.actions}><Button variant="secondary" onClick={onClose}>Отмена</Button><Button type="submit">Создать чат</Button></div>
    </form>
  </Dialog>
}
