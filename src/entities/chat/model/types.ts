export interface Chat {
  id: string
  name: string
  phone: string
  preview: string
  updatedAt: number
  unreadCount: number
  color?: 'purple' | 'blue' | 'peach'
}
