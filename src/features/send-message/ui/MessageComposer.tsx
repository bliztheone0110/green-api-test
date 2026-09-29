import { IconButton, TextArea } from '@/shared/ui'
import styles from './MessageComposer.module.css'

interface MessageComposerProps {
  isSending?: boolean
  onChange: (value: string) => void
  onSend: () => void
  value: string
}

export function MessageComposer({ isSending = false, value, onChange, onSend }: MessageComposerProps) {
  const canSend = !isSending && value.trim().length > 0 && value.length <= 4096
  function submit() { if (canSend) onSend() }
  return <form
    className={styles.form}
    onSubmit={(event) => {
      event.preventDefault()
      submit()
    }}
  >
    <div className={styles.inputRow}>
      <TextArea
        label="Сообщение"
        placeholder="Напишите сообщение…"
        value={value}
        rows={2}
        maxLength={4096}
        onChange={(event) => { onChange(event.target.value) }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
            event.preventDefault()
            submit()
          }
        }}
      />
      <IconButton
        type="submit"
        icon="send"
        label="Отправить сообщение"
        variant="primary"
        disabled={!canSend}
      />
    </div>
    <div className={styles.hint}>
      <span>
        Enter — отправить · Shift + Enter — новая строка
      </span>
      <span>
        {value.length}
        {' '}
        / 4096
      </span>
    </div>
  </form>
}
