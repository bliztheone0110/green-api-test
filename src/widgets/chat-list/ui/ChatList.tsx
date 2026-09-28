import { useState } from 'react'
import { ChatListItem } from '@/entities/chat'
import type { Chat } from '@/entities/chat'
import { EmptyState, Icon, IconButton, TextField } from '@/shared/ui'
import styles from './ChatList.module.css'

export function ChatList({ chats, activeId, onSelect, onCreate, onExit }: {
  chats: Chat[]; activeId: string | null; onSelect: (id: string) => void; onCreate: () => void; onExit: () => void
}) {
  const [query, setQuery] = useState('')
  const filtered = chats.filter((chat) => `${chat.name} ${chat.phone}`.toLowerCase().includes(query.toLowerCase().trim()))
  return <aside className={styles.sidebar} aria-label="Список чатов">
    <header className={styles.header}><div className={styles.brand}><span><Icon name="chat" /></span>Линия</div><IconButton icon="plus" label="Новый чат" onClick={onCreate} /></header>
    <div className={styles.search}><TextField label="Поиск чатов" type="search" placeholder="Имя или номер телефона" value={query} onChange={(event) => setQuery(event.target.value)} /></div>
    <div className={styles.sectionTitle}>СООБЩЕНИЯ <span>{chats.length}</span></div>
    <nav className={styles.list} aria-label="Диалоги">
      {filtered.length ? filtered.map((chat) => <ChatListItem key={chat.id} chat={chat} selected={chat.id === activeId} onSelect={() => onSelect(chat.id)} />)
        : <EmptyState title="Чатов не найдено" description="Попробуйте другой запрос или создайте новый чат." />}
    </nav>
    <footer className={styles.footer}><span className={styles.demoAvatar}>Д</span><div><strong>Демо-пространство</strong><span>Без подключения к Telegram</span></div><IconButton icon="logout" label="Выйти из демо" onClick={onExit} /></footer>
  </aside>
}
