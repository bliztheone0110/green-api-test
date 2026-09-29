import { useState } from 'react'
import { useAppDispatch, useAppSelector } from './store/hooks'
import { connectionEstablished, connectionStarted, sessionCleared } from '@/entities/session'
import { ConnectionPage } from '@/pages/connection'
import { MessengerPage } from '@/pages/messenger'
import { GreenApiError, useGreenApi } from '@/shared/api/green-api'
import type { GreenApiCredentials } from '@/shared/api/green-api'

export function App() {
  const [preview, setPreview] = useState(false)
  const sessionStatus = useAppSelector((state) => state.session.status)
  const dispatch = useAppDispatch()
  const { connect, disconnect, getClient } = useGreenApi()

  async function connectInstance(credentials: GreenApiCredentials, signal: AbortSignal) {
    dispatch(connectionStarted())
    try {
      const instance = await connect(credentials, signal)
      dispatch(connectionEstablished({
        instanceId: instance.idInstance,
        typeInstance: instance.typeInstance,
      }))
    } catch (error) {
      dispatch(sessionCleared())
      throw error
    }
  }

  function exitMessenger() {
    disconnect()
    dispatch(sessionCleared())
    setPreview(false)
  }

  async function sendMessage(chatId: string, message: string) {
    return requireClient().sendMessage(chatId, message)
  }

  function requireClient() {
    const client = getClient()
    if (!client) {
      throw new GreenApiError('Соединение с GREEN-API потеряно. Подключитесь заново.', 'request_failed')
    }
    return client
  }

  function receiveNotification(signal: AbortSignal) {
    return requireClient().receiveNotification(signal)
  }

  function deleteNotification(receiptId: number, signal?: AbortSignal) {
    return requireClient().deleteNotification(receiptId, signal)
  }

  if (preview) return <MessengerPage mode="demo" onExit={exitMessenger} />
  if (sessionStatus === 'connected') {
    return <MessengerPage mode="connected" onExit={exitMessenger} onSendMessage={sendMessage}
      onReceiveNotification={receiveNotification} onDeleteNotification={deleteNotification} />
  }

  return <ConnectionPage onConnect={connectInstance} onPreview={() => { setPreview(true) }} />
}
