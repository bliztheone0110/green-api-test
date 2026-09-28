const timeFormatter = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' })
const dateFormatter = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })

export function formatTime(timestamp: number) { return timeFormatter.format(timestamp) }
export function formatDate(timestamp: number) { return dateFormatter.format(timestamp) }
