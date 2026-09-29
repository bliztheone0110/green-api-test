import { useCallback } from 'react'
import { connectionEstablished, connectionStarted, sessionCleared } from '@/entities/session'
import { GreenApiError, useGreenApi } from '@/shared/api/green-api'
import type { GreenApiCredentials } from '@/shared/api/green-api'
import { useAppDispatch, useAppSelector } from '../store/hooks'

export function useAppController() {
  const isConnected = useAppSelector((state) => state.session.status === 'connected')
  const dispatch = useAppDispatch()
  const { connect, disconnect, getClient } = useGreenApi()

  const requireClient = useCallback(() => {
    const client = getClient()
    if (!client) {
      throw new GreenApiError('Соединение с GREEN-API потеряно. Подключитесь заново.', 'request_failed')
    }
    return client
  }, [getClient])

  const connectInstance = useCallback(async (credentials: GreenApiCredentials, signal: AbortSignal) => {
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
  }, [connect, dispatch])

  const exitMessenger = useCallback(() => {
    disconnect()
    dispatch(sessionCleared())
  }, [disconnect, dispatch])

  const sendMessage = useCallback((chatId: string, message: string) => (
    requireClient().sendMessage(chatId, message)
  ), [requireClient])

  const receiveNotification = useCallback((signal: AbortSignal) => (
    requireClient().receiveNotification(signal)
  ), [requireClient])

  const deleteNotification = useCallback((receiptId: number, signal?: AbortSignal) => (
    requireClient().deleteNotification(receiptId, signal)
  ), [requireClient])

  return {
    connectInstance,
    deleteNotification,
    exitMessenger,
    isConnected,
    receiveNotification,
    sendMessage,
  }
}
