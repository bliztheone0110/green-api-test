import { useEffect, useRef, useState } from 'react'
import type { SubmitEvent } from 'react'
import type { GreenApiCredentials } from '@/shared/api/green-api'
import { GreenApiError } from '@/shared/api/green-api'
import { Button, ErrorNotice, Icon, Spinner, TextField } from '@/shared/ui'
import styles from './ConnectionForm.module.css'

interface ConnectionFormProps {
  onConnect: (credentials: GreenApiCredentials, signal: AbortSignal) => Promise<void>
  onPreview: () => void
}

const emptyCredentials: GreenApiCredentials = {
  idInstance: '',
  apiTokenInstance: '',
}

export function ConnectionForm({ onConnect, onPreview }: ConnectionFormProps) {
  const [credentials, setCredentials] = useState(emptyCredentials)
  const [error, setError] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const controllerRef = useRef<AbortController | null>(null)

  useEffect(() => () => controllerRef.current?.abort(), [])

  function updateField(field: keyof GreenApiCredentials, value: string) {
    setCredentials((previous) => ({ ...previous, [field]: value }))
    setError('')
  }

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isConnecting) return

    const controller = new AbortController()
    controllerRef.current = controller
    setIsConnecting(true)
    setError('')

    try {
      await onConnect(credentials, controller.signal)
    } catch (connectionError) {
      if (controller.signal.aborted) return
      setError(connectionError instanceof GreenApiError
        ? connectionError.message
        : 'Не удалось подключить инстанс. Попробуйте ещё раз.')
    } finally {
      if (!controller.signal.aborted) setIsConnecting(false)
      controllerRef.current = null
    }
  }

  return <form className={styles.form} onSubmit={(event) => { void submit(event) }}>
    <TextField label="ID инстанса" name="idInstance" inputMode="numeric" placeholder="Введите idInstance"
      value={credentials.idInstance} onChange={(event) => { updateField('idInstance', event.target.value) }} autoComplete="off" required />
    <TextField label="API-токен" name="apiTokenInstance" type="password" placeholder="Введите apiTokenInstance"
      value={credentials.apiTokenInstance} onChange={(event) => { updateField('apiTokenInstance', event.target.value) }} autoComplete="new-password" required />
    {error && <ErrorNotice>{error}</ErrorNotice>}
    <Button type="submit" disabled={isConnecting}>
      {isConnecting ? <Spinner label="Проверяем инстанс…" /> : <>Подключиться <Icon name="arrow" /></>}
    </Button>
    <div className={styles.divider}><span>А пока можно посмотреть интерфейс</span></div>
    <Button variant="secondary" onClick={onPreview} disabled={isConnecting}>Открыть демо чата <Icon name="chat" /></Button>
  </form>
}
