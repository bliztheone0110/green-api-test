import { useEffect, useRef, useState } from 'react'
import type { SubmitEvent } from 'react'
import { GreenApiError } from '@/shared/api/green-api'
import type { GreenApiCredentials } from '@/shared/api/green-api'
import type { ConnectInstance } from './types'

const emptyCredentials: GreenApiCredentials = {
  idInstance: '',
  apiTokenInstance: '',
}

export function useConnectionForm(onConnect: ConnectInstance) {
  const [credentials, setCredentials] = useState(emptyCredentials)
  const [error, setError] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const controllerRef = useRef<AbortController | null>(null)

  useEffect(() => () => { controllerRef.current?.abort() }, [])

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

  return {
    credentials,
    error,
    isConnecting,
    submit,
    updateField,
  }
}
