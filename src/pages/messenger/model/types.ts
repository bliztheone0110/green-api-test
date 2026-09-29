import type { NotificationEnvelope, SendMessageResponse } from '@/shared/api/green-api'

export interface MessengerServices {
  onDeleteNotification: (receiptId: number, signal?: AbortSignal) => Promise<void>
  onReceiveNotification: (signal: AbortSignal) => Promise<NotificationEnvelope | null>
  onSendMessage: (chatId: string, message: string) => Promise<SendMessageResponse>
}
