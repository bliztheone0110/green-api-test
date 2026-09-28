import type { Chat } from '@/entities/chat'
import type { Message } from '@/entities/message'

export function createDemoData(): { chats: Chat[]; messages: Message[] } {
  const timestamp = Date.now() - 600000
  const messages: Message[] = [
    { id: 'demo-1', chatId: 'anna', text: 'Привет! Как тебе идея собраться на выходных?', timestamp, direction: 'incoming' },
    { id: 'demo-2', chatId: 'anna', text: 'Привет! Отличная идея ☀️\nДавай в субботу, после обеда?', timestamp: timestamp + 60000, direction: 'outgoing', status: 'demo' },
    { id: 'demo-3', chatId: 'anna', text: 'Договорились! Я как раз знаю уютное место с хорошим кофе.', timestamp: timestamp + 120000, direction: 'incoming' },
    { id: 'demo-4', chatId: 'anna', text: 'Звучит как план. Пришли адрес, пожалуйста', timestamp: timestamp + 180000, direction: 'outgoing', status: 'demo' },
    { id: 'demo-5', chatId: 'anna', text: 'Сейчас отправлю. Будет здорово увидеться 🙂', timestamp: timestamp + 240000, direction: 'incoming' },
    { id: 'demo-6', chatId: 'mikhail', text: 'Привет! Посмотрел твои идеи, мне понравились.', timestamp: timestamp - 600000, direction: 'incoming' },
    { id: 'demo-7', chatId: 'mikhail', text: 'Обсудим завтра?', timestamp: timestamp - 500000, direction: 'incoming' },
    { id: 'demo-8', chatId: 'katya', text: 'Спасибо, до встречи!', timestamp: timestamp - 900000, direction: 'incoming' },
  ]
  return {
    chats: [
      { id: 'anna', name: 'Анна Смирнова', phone: '', preview: messages[4].text, updatedAt: messages[4].timestamp, unreadCount: 1, color: 'purple' },
      { id: 'mikhail', name: 'Михаил Волков', phone: '', preview: messages[6].text, updatedAt: messages[6].timestamp, unreadCount: 2, color: 'blue' },
      { id: 'katya', name: 'Катя', phone: '', preview: messages[7].text, updatedAt: messages[7].timestamp, unreadCount: 0, color: 'peach' },
    ], messages,
  }
}
