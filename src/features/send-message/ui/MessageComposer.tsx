import { IconButton, TextArea } from '@/shared/ui'
import styles from './MessageComposer.module.css'

export function MessageComposer({ value, onChange, onSend }: { value: string; onChange: (value: string) => void; onSend: () => void }) {
  const canSend = value.trim().length > 0 && value.length <= 4096
  function submit() { if (canSend) onSend() }
  return <form className={styles.form} onSubmit={(event) => { event.preventDefault(); submit() }}>
    <div className={styles.inputRow}>
      <TextArea label="Сообщение" placeholder="Напишите сообщение…" value={value} rows={2} maxLength={4096}
        onChange={(event) => onChange(event.target.value)} onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); submit() }
        }} />
      <IconButton type="submit" icon="send" label="Отправить демо-сообщение" variant="primary" disabled={!canSend} />
    </div>
    <div className={styles.hint}><span>Enter — отправить · Shift + Enter — новая строка</span><span>{value.length} / 4096</span></div>
  </form>
}
