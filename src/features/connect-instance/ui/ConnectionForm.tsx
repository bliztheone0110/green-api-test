import { Button, Icon, TextField } from '@/shared/ui'
import styles from './ConnectionForm.module.css'

export function ConnectionForm({ onPreview }: { onPreview: () => void }) {
  return <form className={styles.form} onSubmit={(event) => event.preventDefault()}>
    <TextField label="API URL" type="url" name="apiUrl" placeholder="https://4100.api.green-api.com" autoComplete="off" />
    <TextField label="ID инстанса" name="idInstance" inputMode="numeric" placeholder="Введите idInstance" autoComplete="off" />
    <TextField label="API-токен" name="apiTokenInstance" type="password" placeholder="Введите apiTokenInstance" autoComplete="off" />
    <Button disabled aria-describedby="connection-hint">Подключиться <Icon name="arrow" /></Button>
    <p id="connection-hint" className={styles.hint}>Подключение к API будет доступно на следующем этапе.</p>
    <div className={styles.divider}><span>А пока можно посмотреть интерфейс</span></div>
    <Button variant="secondary" onClick={onPreview}>Открыть демо чата <Icon name="chat" /></Button>
  </form>
}
