import { CreateChatDialog } from '@/features/create-chat'
import { MessageComposer } from '@/features/send-message'
import { ChatList } from '@/widgets/chat-list'
import { Conversation } from '@/widgets/conversation'
import { Button, EmptyState, ErrorNotice } from '@/shared/ui'
import type { MessengerServices } from '../model/types'
import { useMessenger } from '../model/useMessenger'
import styles from './MessengerPage.module.css'

interface MessengerPageProps extends MessengerServices {
  onExit: () => void
}

export function MessengerPage({ onExit, ...services }: MessengerPageProps) {
  const messenger = useMessenger(services)

  return <main className={styles.page}>
    <div className={styles.statusBanner}>
      <strong>
        Инстанс подключён
      </strong>
      <span>
        GREEN-API готов к работе
      </span>
    </div>
    {messenger.syncError && <div className={styles.syncError}>
      <ErrorNotice>
        {messenger.syncError}
      </ErrorNotice>
    </div>}
    <div className={`${styles.shell} ${messenger.activeChat ? styles.chatOpen : ''}`}>
      <div className={styles.sidebar}>
        <ChatList
          chats={messenger.chats}
          activeId={messenger.activeId}
          onSelect={messenger.selectChat}
          onCreate={messenger.openCreateChat}
          onExit={onExit}
          footerTitle="Telegram подключён"
          footerDescription="GREEN-API"
        />
      </div>
      <div className={styles.conversation}>
        {messenger.activeChat ? <Conversation
          chat={messenger.activeChat}
          messages={messenger.activeMessages}
          onBack={messenger.closeChat}
          emptyDescription="Напишите первое сообщение — оно будет отправлено в Telegram."
          composer={<>
            {messenger.sendError && <ErrorNotice>
              {messenger.sendError}
            </ErrorNotice>}
            <MessageComposer
              value={messenger.draft}
              isSending={messenger.isSending}
              onChange={messenger.updateDraft}
              onSend={() => { void messenger.sendCurrentMessage() }}
            />
          </>}
        />
          : <EmptyState
            title="Хороший разговор начинается с приветствия"
            description="Создайте новый чат и укажите номер телефона получателя."
            action={<Button
              variant="secondary"
              onClick={messenger.openCreateChat}
            >
              Начать разговор
            </Button>}
          />}
      </div>
    </div>
    {messenger.isCreating && <CreateChatDialog
      onClose={messenger.closeCreateChat}
      onCreate={messenger.createChat}
    />}
  </main>
}
