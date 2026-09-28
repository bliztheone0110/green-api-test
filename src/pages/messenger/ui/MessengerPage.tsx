import { useState } from 'react'
import { CreateChatDialog } from '@/features/create-chat'
import { MessageComposer } from '@/features/send-message'
import { ChatList } from '@/widgets/chat-list'
import { Conversation } from '@/widgets/conversation'
import { Button, EmptyState } from '@/shared/ui'
import { createDemoData } from '../model/demo'
import styles from './MessengerPage.module.css'

// Preview-only state. Production chat state and API flows are implemented in later stages.
export function MessengerPage({ onExit }: { onExit: () => void }) {
  const [data, setData] = useState(createDemoData)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [isCreating, setIsCreating] = useState(false)
  const activeChat = data.chats.find((chat) => chat.id === activeId)

  function selectChat(id: string) {
    setActiveId(id)
    setData((previous) => ({ ...previous, chats: previous.chats.map((chat) => chat.id === id ? { ...chat, unreadCount: 0 } : chat) }))
  }

  function createChat(phone: string) {
    const existing = data.chats.find((chat) => chat.phone === phone)
    if (existing) { selectChat(existing.id) } else {
      const id = crypto.randomUUID()
      setData((previous) => ({ ...previous, chats: [{ id, phone, name: phone, preview: '', unreadCount: 0, updatedAt: Date.now() }, ...previous.chats] }))
      setActiveId(id)
    }
    setIsCreating(false)
  }

  function sendDemoMessage() {
    if (!activeId) return
    const text = drafts[activeId] ?? ''
    if (!text.trim() || text.length > 4096) return
    const timestamp = Date.now()
    setData((previous) => ({
      messages: [...previous.messages, { id: crypto.randomUUID(), chatId: activeId, text, timestamp, direction: 'outgoing', status: 'demo' }],
      chats: previous.chats.map((chat) => chat.id === activeId ? { ...chat, preview: `Вы: ${text}`, updatedAt: timestamp } : chat).sort((a, b) => b.updatedAt - a.updatedAt),
    }))
    setDrafts((previous) => ({ ...previous, [activeId]: '' }))
  }

  return <main className={styles.page}>
    <div className={styles.demoBanner}><strong>Демо интерфейса</strong><span>Сообщения не отправляются в Telegram</span></div>
    <div className={`${styles.shell} ${activeChat ? styles.chatOpen : ''}`}>
      <div className={styles.sidebar}><ChatList chats={data.chats} activeId={activeId} onSelect={selectChat} onCreate={() => setIsCreating(true)} onExit={onExit} /></div>
      <div className={styles.conversation}>
        {activeChat ? <Conversation chat={activeChat} messages={data.messages.filter((message) => message.chatId === activeId)} onBack={() => setActiveId(null)}
          composer={<MessageComposer value={drafts[activeChat.id] ?? ''} onChange={(value) => setDrafts((previous) => ({ ...previous, [activeChat.id]: value }))} onSend={sendDemoMessage} />} />
          : <EmptyState title="Хороший разговор начинается с приветствия" description="Выберите диалог слева или создайте новый чат по номеру телефона." action={<Button variant="secondary" onClick={() => setIsCreating(true)}>Начать разговор</Button>} />}
      </div>
    </div>
    {isCreating && <CreateChatDialog onClose={() => setIsCreating(false)} onCreate={createChat} />}
  </main>
}
