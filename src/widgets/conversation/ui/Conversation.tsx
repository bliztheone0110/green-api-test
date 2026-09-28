import { Fragment, useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import type { Chat } from '@/entities/chat'
import { MessageBubble } from '@/entities/message'
import type { Message } from '@/entities/message'
import { Avatar, EmptyState, IconButton } from '@/shared/ui'
import { formatDate } from '@/shared/lib/date'
import styles from './Conversation.module.css'

export function Conversation({ chat, messages, composer, onBack }: { chat: Chat; messages: Message[]; composer: ReactNode; onBack: () => void }) {
  const list = useRef<HTMLDivElement>(null)
  useEffect(() => { if (list.current) list.current.scrollTop = list.current.scrollHeight }, [chat.id, messages.length])
  return <section className={styles.conversation} aria-label={`Переписка: ${chat.name}`}>
    <header className={styles.header}><IconButton className={styles.back} icon="back" label="К списку чатов" onClick={onBack} /><Avatar name={chat.name} color={chat.color} />
      <div><h1>{chat.name}</h1><p>{chat.phone || 'Демонстрационный контакт'}</p></div><span className={styles.label}>Личный чат</span>
    </header>
    <div className={styles.messages} ref={list}>
      {messages.length ? <ol aria-label="Сообщения">{messages.map((message, index) => <Fragment key={message.id}>
        {(index === 0 || formatDate(messages[index - 1].timestamp) !== formatDate(message.timestamp)) && <li className={styles.date}>{formatDate(message.timestamp)}</li>}
        <MessageBubble message={message} />
      </Fragment>)}</ol> : <EmptyState title="Здесь начинается разговор" description="Напишите первое сообщение. В демо оно останется только в этом окне." />}
    </div>
    {composer}
  </section>
}
