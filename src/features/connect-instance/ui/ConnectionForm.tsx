import type { ConnectInstance } from '../model/types'
import { useConnectionForm } from '../model/useConnectionForm'
import { Button, ErrorNotice, Icon, Spinner, TextField } from '@/shared/ui'
import styles from './ConnectionForm.module.css'

interface ConnectionFormProps {
  onConnect: ConnectInstance
}

export function ConnectionForm({ onConnect }: ConnectionFormProps) {
  const { credentials, error, isConnecting, submit, updateField } = useConnectionForm(onConnect)

  return <form
    className={styles.form}
    onSubmit={(event) => { void submit(event) }}
  >
    <TextField
      label="ID инстанса"
      name="idInstance"
      inputMode="numeric"
      placeholder="Введите idInstance"
      value={credentials.idInstance}
      onChange={(event) => { updateField('idInstance', event.target.value) }}
      autoComplete="off"
      required
    />
    <TextField
      label="API-токен"
      name="apiTokenInstance"
      type="password"
      placeholder="Введите apiTokenInstance"
      value={credentials.apiTokenInstance}
      onChange={(event) => { updateField('apiTokenInstance', event.target.value) }}
      autoComplete="new-password"
      required
    />
    {error && <ErrorNotice>
      {error}
    </ErrorNotice>}
    <Button
      type="submit"
      disabled={isConnecting}
    >
      {isConnecting ? <Spinner label="Проверяем инстанс…" /> : <>
        Подключиться
        <Icon name="arrow" />
      </>}
    </Button>
  </form>
}
