import { Avatar } from '@/shared/ui'
import { formatTime } from '@/shared/lib/date'
import type { Chat } from '../model/types'
import styles from './ChatListItem.module.css'

export function ChatListItem({ chat, selected, onSelect }: { chat: Chat; selected: boolean; onSelect: () => void }) {
  return <button className={`${styles.item} ${selected ? styles.selected : ''}`} onClick={onSelect} aria-current={selected ? 'true' : undefined}>
    <Avatar name={chat.name} color={chat.color} />
    <span className={styles.body}><span className={styles.top}><strong>{chat.name}</strong><time>{formatTime(chat.updatedAt)}</time></span>
      <span className={styles.bottom}><span>{chat.preview || 'Начните разговор'}</span>
        {chat.unreadCount > 0 && <span className={styles.badge} aria-label={`Непрочитанных: ${chat.unreadCount}`}>{chat.unreadCount}</span>}
      </span>
    </span>
  </button>
}
