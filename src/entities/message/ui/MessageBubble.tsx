import { formatTime } from '@/shared/lib/date'
import type { Message } from '../model/types'
import styles from './MessageBubble.module.css'

const labels = { sending: 'Отправляется', queued: 'В очереди', delivered: 'Доставлено', read: 'Прочитано', failed: 'Ошибка отправки', unknown: 'Результат неизвестен' }

export function MessageBubble({ message }: { message: Message }) {
  return <li className={`${styles.row} ${message.direction === 'outgoing' ? styles.outgoing : ''}`}>
    <article
      className={styles.bubble}
      aria-label={message.direction === 'outgoing' ? 'Ваше сообщение' : 'Входящее сообщение'}
    >
      <p>
        {message.text}
      </p>
      <div className={styles.meta}>
        <time dateTime={new Date(message.timestamp).toISOString()}>
          {formatTime(message.timestamp)}
        </time>
        {message.direction === 'outgoing' && message.status && <span>
          {labels[message.status]}
        </span>}
      </div>
    </article>
  </li>
}
