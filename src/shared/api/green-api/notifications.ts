export type OutgoingMessageStatus = 'delivered' | 'read' | 'failed' | 'noAccount'

export type ParsedNotification =
  | {
    kind: 'incomingText'
    chatName: string
    idMessage: string
    phoneNumber: string
    text: string
    timestamp: number
  }
  | {
    kind: 'outgoingStatus'
    chatId: string
    description?: string
    idMessage?: string
    status: OutgoingMessageStatus
  }
  | { kind: 'unsupported' }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function asString(value: unknown) {
  return typeof value === 'string' ? value : null
}

export function parseNotification(value: unknown): ParsedNotification {
  if (!isRecord(value)) return { kind: 'unsupported' }

  if (value.typeWebhook === 'incomingMessageReceived') {
    const senderData = value.senderData
    const messageData = value.messageData
    if (!isRecord(senderData) || !isRecord(messageData) || messageData.typeMessage !== 'textMessage') {
      return { kind: 'unsupported' }
    }

    const textMessageData = messageData.textMessageData
    const idMessage = asString(value.idMessage)
    const text = isRecord(textMessageData) ? asString(textMessageData.textMessage) : null
    const rawPhoneNumber = senderData.senderPhoneNumber
    const phoneNumber = typeof rawPhoneNumber === 'number' || typeof rawPhoneNumber === 'string'
      ? String(rawPhoneNumber)
      : ''
    if (!idMessage || !text || !/^\d{7,15}$/.test(phoneNumber) || typeof value.timestamp !== 'number') {
      return { kind: 'unsupported' }
    }

    return {
      kind: 'incomingText',
      chatName: asString(senderData.senderContactName)
        ?? asString(senderData.senderName)
        ?? `+${phoneNumber}`,
      idMessage,
      phoneNumber,
      text,
      timestamp: value.timestamp * 1000,
    }
  }

  if (value.typeWebhook === 'outgoingMessageStatus') {
    const status = value.status
    const chatId = asString(value.chatId)
    if (!chatId || (status !== 'delivered' && status !== 'read' && status !== 'failed' && status !== 'noAccount')) {
      return { kind: 'unsupported' }
    }
    const idMessage = asString(value.idMessage) ?? undefined
    const description = asString(value.description) ?? undefined
    return { kind: 'outgoingStatus', chatId, description, idMessage, status }
  }

  return { kind: 'unsupported' }
}
