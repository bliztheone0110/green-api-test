import { useEffect, useRef, useState } from 'react'
import { CreateChatDialog } from '@/features/create-chat'
import { MessageComposer } from '@/features/send-message'
import { ChatList } from '@/widgets/chat-list'
import { Conversation } from '@/widgets/conversation'
import { GreenApiError, parseNotification, phoneNumberToChatId } from '@/shared/api/green-api'
import type { NotificationEnvelope, SendMessageResponse } from '@/shared/api/green-api'
import { Button, EmptyState, ErrorNotice } from '@/shared/ui'
import { createDemoData } from '../model/demo'
import styles from './MessengerPage.module.css'

interface MessengerPageProps {
  mode: 'demo' | 'connected'
  onDeleteNotification?: (receiptId: number, signal?: AbortSignal) => Promise<void>
  onExit: () => void
  onReceiveNotification?: (signal: AbortSignal) => Promise<NotificationEnvelope | null>
  onSendMessage?: (chatId: string, message: string) => Promise<SendMessageResponse>
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

export function MessengerPage({
  mode,
  onDeleteNotification,
  onExit,
  onReceiveNotification,
  onSendMessage,
}: MessengerPageProps) {
  const isDemo = mode === 'demo'
  const [data, setData] = useState(() => isDemo ? createDemoData() : { chats: [], messages: [] })
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

  useEffect(() => {
    activeIdRef.current = activeId
  }, [activeId])

  useEffect(() => {
    if (isDemo || pendingNotification || !onReceiveNotification || !onDeleteNotification) return

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
  }, [isDemo, onDeleteNotification, onReceiveNotification, pendingNotification])

  async function acknowledgePending(chatId: string) {
    if (pendingNotification?.chatId !== chatId || !onDeleteNotification) return
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
    setData((previous) => ({ ...previous, chats: previous.chats.map((chat) => chat.id === id ? { ...chat, unreadCount: 0 } : chat) }))
    void acknowledgePending(id)
  }

  function closeChat() {
    activeIdRef.current = null
    setActiveId(null)
  }

  function createChat(phone: string) {
    const existing = data.chats.find((chat) => chat.phone === phone)
    if (existing) { selectChat(existing.id) } else {
      const id = isDemo ? crypto.randomUUID() : phoneNumberToChatId(phone)
      setData((previous) => ({ ...previous, chats: [{ id, phone, name: phone, preview: '', unreadCount: 0, updatedAt: Date.now() }, ...previous.chats] }))
      setActiveId(id)
      activeIdRef.current = id
    }
    setSendError('')
    setIsCreating(false)
  }

  async function sendCurrentMessage() {
    if (!activeChat || sendingChatId) return
    const chatId = activeChat.id
    const text = drafts[chatId] ?? ''
    if (!text.trim() || text.length > 4096) return
    const timestamp = Date.now()
    const localMessageId = crypto.randomUUID()
    const status = isDemo ? 'demo' : 'sending'

    setSendError('')
    setSendingChatId(chatId)
    setData((previous) => ({
      messages: [...previous.messages, { id: localMessageId, chatId, text, timestamp, direction: 'outgoing', status }],
      chats: previous.chats.map((chat) => chat.id === chatId ? { ...chat, preview: `Вы: ${text}`, updatedAt: timestamp } : chat).sort((a, b) => b.updatedAt - a.updatedAt),
    }))
    setDrafts((previous) => ({ ...previous, [chatId]: '' }))

    if (isDemo) {
      setSendingChatId(null)
      return
    }

    try {
      if (!onSendMessage) throw new Error('SendMessage handler is not configured')
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

  return <main className={styles.page}>
    <div className={`${styles.demoBanner} ${isDemo ? '' : styles.connectedBanner}`}>
      <strong>{isDemo ? 'Демо интерфейса' : 'Инстанс подключён'}</strong>
      <span>{isDemo ? 'Сообщения не отправляются в Telegram' : 'GREEN-API готов к работе'}</span>
    </div>
    {syncError && <div className={styles.syncError}><ErrorNotice>{syncError}</ErrorNotice></div>}
    <div className={`${styles.shell} ${activeChat ? styles.chatOpen : ''}`}>
      <div className={styles.sidebar}><ChatList chats={data.chats} activeId={activeId} onSelect={selectChat}
        onCreate={() => { setIsCreating(true) }} onExit={onExit}
        footerTitle={isDemo ? 'Демо-пространство' : 'Telegram подключён'}
        footerDescription={isDemo ? 'Без подключения к Telegram' : 'GREEN-API'} /></div>
      <div className={styles.conversation}>
        {activeChat ? <Conversation chat={activeChat} messages={data.messages.filter((message) => message.chatId === activeId)} onBack={closeChat}
          emptyDescription={isDemo ? 'Напишите первое сообщение. В демо оно останется только в этом окне.' : 'Напишите первое сообщение — оно будет отправлено в Telegram.'}
          composer={<>{sendError && <ErrorNotice>{sendError}</ErrorNotice>}<MessageComposer value={drafts[activeChat.id] ?? ''}
            isSending={sendingChatId === activeChat.id}
            onChange={(value) => {
              setDrafts((previous) => ({ ...previous, [activeChat.id]: value }))
              setSendError('')
            }}
            onSend={() => { void sendCurrentMessage() }} /></>} />
          : <EmptyState title="Хороший разговор начинается с приветствия"
            description="Создайте новый чат и укажите номер телефона получателя."
            action={<Button variant="secondary" onClick={() => { setIsCreating(true) }}>Начать разговор</Button>} />}
      </div>
    </div>
    {isCreating && <CreateChatDialog isDemo={isDemo} onClose={() => { setIsCreating(false) }} onCreate={createChat} />}
  </main>
}
