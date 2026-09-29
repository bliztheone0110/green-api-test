import { useEffect, useRef, useState } from 'react'
import type { Chat } from '@/entities/chat'
import type { Message } from '@/entities/message'
import { GreenApiError, parseNotification, phoneNumberToChatId } from '@/shared/api/green-api'
import type { MessengerServices } from './types'

interface MessengerData {
  chats: Chat[]
  messages: Message[]
}

interface PendingNotification {
  chatId: string
  receiptId: number
}

function waitForRetry(signal: AbortSignal) {
  return new Promise<void>((resolve) => {
    const finish = () => {
      window.clearTimeout(timeoutId)
      signal.removeEventListener('abort', finish)
      resolve()
    }
    const timeoutId = window.setTimeout(finish, 2000)
    signal.addEventListener('abort', finish, { once: true })
  })
}

export function useMessenger({
  onDeleteNotification,
  onReceiveNotification,
  onSendMessage,
}: MessengerServices) {
  const [data, setData] = useState<MessengerData>({ chats: [], messages: [] })
  const [activeId, setActiveId] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [isCreating, setIsCreating] = useState(false)
  const [sendingChatId, setSendingChatId] = useState<string | null>(null)
  const [sendError, setSendError] = useState('')
  const [syncError, setSyncError] = useState('')
  const [pendingNotification, setPendingNotification] = useState<PendingNotification | null>(null)
  const activeIdRef = useRef(activeId)
  const earlyStatusesRef = useRef<Partial<Record<string, 'delivered' | 'read' | 'failed'>>>({})
  const activeChat = data.chats.find((chat) => chat.id === activeId)
  const activeMessages = data.messages.filter((message) => message.chatId === activeId)
  const draft = activeChat ? drafts[activeChat.id] ?? '' : ''

  useEffect(() => {
    activeIdRef.current = activeId
  }, [activeId])

  useEffect(() => {
    if (pendingNotification) return

    const controller = new AbortController()
    const receiveNotification = onReceiveNotification
    const deleteNotification = onDeleteNotification

    async function pollNotifications() {
      while (!controller.signal.aborted) {
        try {
          const envelope = await receiveNotification(controller.signal)
          if (!envelope) continue
          setSyncError('')

          const notification = parseNotification(envelope.body)
          if (notification.kind === 'incomingText') {
            const chatId = phoneNumberToChatId(notification.phoneNumber)
            const phone = `+${notification.phoneNumber}`
            const isActive = activeIdRef.current === chatId

            setData((previous) => {
              if (previous.messages.some((message) => message.id === notification.idMessage)) return previous
              const existing = previous.chats.find((chat) => chat.id === chatId)
              const updatedChat = {
                id: chatId,
                name: !existing || existing.name === existing.phone ? notification.chatName : existing.name,
                phone,
                preview: notification.text,
                unreadCount: isActive ? 0 : (existing?.unreadCount ?? 0) + 1,
                updatedAt: notification.timestamp,
              }
              return {
                messages: [...previous.messages, {
                  id: notification.idMessage,
                  chatId,
                  text: notification.text,
                  timestamp: notification.timestamp,
                  direction: 'incoming',
                }],
                chats: [updatedChat, ...previous.chats.filter((chat) => chat.id !== chatId)],
              }
            })

            if (!isActive) {
              setPendingNotification({ chatId, receiptId: envelope.receiptId })
              return
            }
          } else if (notification.kind === 'outgoingStatus') {
            const status = notification.status === 'noAccount' ? 'failed' : notification.status
            if (notification.idMessage) earlyStatusesRef.current[notification.idMessage] = status
            setData((previous) => {
              const fallbackMessage = notification.idMessage
                ? undefined
                : previous.messages.findLast((message) => message.direction === 'outgoing'
                  && message.chatId === notification.chatId
                  && (message.status === 'queued' || message.status === 'sending'))
              const targetId = notification.idMessage ?? fallbackMessage?.id
              if (!targetId) return previous
              return {
                ...previous,
                messages: previous.messages.map((message) => message.id === targetId
                  ? { ...message, status }
                  : message),
              }
            })
            if (notification.status === 'failed' || notification.status === 'noAccount') {
              setSyncError(notification.status === 'noAccount'
                ? 'Сообщение не отправлено: аккаунт Telegram не найден или номер скрыт.'
                : notification.description ?? 'Telegram не смог отправить сообщение.')
            }
          }

          await deleteNotification(envelope.receiptId, controller.signal)
        } catch (error) {
          if (error instanceof DOMException && error.name === 'AbortError') return
          setSyncError(error instanceof GreenApiError
            ? error.message
            : 'Не удалось получить обновления. Повторяем подключение…')
          await waitForRetry(controller.signal)
        }
      }
    }

    void pollNotifications()
    return () => { controller.abort() }
  }, [onDeleteNotification, onReceiveNotification, pendingNotification])

  async function acknowledgePending(chatId: string) {
    if (pendingNotification?.chatId !== chatId) return
    try {
      await onDeleteNotification(pendingNotification.receiptId)
      setPendingNotification(null)
      setSyncError('')
    } catch (error) {
      setSyncError(error instanceof GreenApiError
        ? error.message
        : 'Не удалось подтвердить прочтение сообщения. Повторите попытку.')
    }
  }

  function selectChat(id: string) {
    activeIdRef.current = id
    setActiveId(id)
    setSendError('')
    setData((previous) => ({
      ...previous,
      chats: previous.chats.map((chat) => chat.id === id ? { ...chat, unreadCount: 0 } : chat),
    }))
    void acknowledgePending(id)
  }

  function closeChat() {
    activeIdRef.current = null
    setActiveId(null)
  }

  function createChat(phone: string) {
    const existing = data.chats.find((chat) => chat.phone === phone)
    if (existing) {
      selectChat(existing.id)
    } else {
      const id = phoneNumberToChatId(phone)
      setData((previous) => ({
        ...previous,
        chats: [{ id, phone, name: phone, preview: '', unreadCount: 0, updatedAt: Date.now() }, ...previous.chats],
      }))
      setActiveId(id)
      activeIdRef.current = id
    }
    setSendError('')
    setIsCreating(false)
  }

  function updateDraft(value: string) {
    if (!activeChat) return
    setDrafts((previous) => ({ ...previous, [activeChat.id]: value }))
    setSendError('')
  }

  async function sendCurrentMessage() {
    if (!activeChat || sendingChatId) return
    const chatId = activeChat.id
    const text = drafts[chatId] ?? ''
    if (!text.trim() || text.length > 4096) return
    const timestamp = Date.now()
    const localMessageId = crypto.randomUUID()
    const status = 'sending'

    setSendError('')
    setSendingChatId(chatId)
    setData((previous) => ({
      messages: [...previous.messages, { id: localMessageId, chatId, text, timestamp, direction: 'outgoing', status }],
      chats: previous.chats.map((chat) => chat.id === chatId
        ? { ...chat, preview: `Вы: ${text}`, updatedAt: timestamp }
        : chat).sort((a, b) => b.updatedAt - a.updatedAt),
    }))
    setDrafts((previous) => ({ ...previous, [chatId]: '' }))

    try {
      const result = await onSendMessage(phoneNumberToChatId(activeChat.phone), text)
      const { [result.idMessage]: earlyStatus, ...remainingStatuses } = earlyStatusesRef.current
      earlyStatusesRef.current = remainingStatuses
      setData((previous) => ({
        ...previous,
        messages: previous.messages.map((message) => message.id === localMessageId
          ? {
            ...message,
            id: result.idMessage,
            status: earlyStatus
              ?? (message.status === 'delivered' || message.status === 'read' || message.status === 'failed'
                ? message.status
                : 'queued'),
          }
          : message),
      }))
    } catch (error) {
      setData((previous) => ({
        ...previous,
        messages: previous.messages.map((message) => message.id === localMessageId
          ? { ...message, status: 'failed' }
          : message),
      }))
      setSendError(error instanceof GreenApiError
        ? error.message
        : 'Не удалось отправить сообщение. Попробуйте ещё раз.')
    } finally {
      setSendingChatId(null)
    }
  }

  return {
    activeChat,
    activeId,
    activeMessages,
    chats: data.chats,
    closeChat,
    closeCreateChat: () => { setIsCreating(false) },
    createChat,
    draft,
    isCreating,
    isSending: sendingChatId === activeChat?.id,
    openCreateChat: () => { setIsCreating(true) },
    selectChat,
    sendCurrentMessage,
    sendError,
    syncError,
    updateDraft,
  }
}
