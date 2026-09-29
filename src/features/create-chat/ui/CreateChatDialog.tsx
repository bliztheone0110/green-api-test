import type { CreateChat } from '../model/types'
import { useCreateChatForm } from '../model/useCreateChatForm'
import { Button, Dialog, TextField } from '@/shared/ui'
import styles from './CreateChatDialog.module.css'

interface CreateChatDialogProps {
  onClose: () => void
  onCreate: CreateChat
}

export function CreateChatDialog({ onClose, onCreate }: CreateChatDialogProps) {
  const { error, phone, submit, updatePhone } = useCreateChatForm(onCreate)
  return <Dialog
    title="Новый чат"
    onClose={onClose}
  >
    <form
      className={styles.form}
      onSubmit={submit}
    >
      <p>
        Введите номер собеседника с кодом страны.
      </p>
      <TextField
        label="Номер телефона"
        type="tel"
        placeholder="+7 900 000-00-00"
        value={phone}
        autoComplete="off"
        autoFocus
        onChange={(event) => { updatePhone(event.target.value) }}
        error={error}
      />
      <p className={styles.note}>
        Сообщение будет отправлено на этот номер через Telegram.
      </p>
      <div className={styles.actions}>
        <Button
          variant="secondary"
          onClick={onClose}
        >
          Отмена
        </Button>
        <Button type="submit">
          Создать чат
        </Button>
      </div>
    </form>
  </Dialog>
}
