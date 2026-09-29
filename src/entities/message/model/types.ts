export interface Message {
  id: string
  chatId: string
  text: string
  timestamp: number
  direction: 'incoming' | 'outgoing'
  status?: 'sending' | 'queued' | 'delivered' | 'read' | 'failed' | 'unknown'
}
