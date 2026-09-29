import { describe, expect, it } from 'vitest'
import { parseNotification } from './notifications'

describe('GREEN-API notification parser', () => {
  it('parses an incoming text message', () => {
    expect(parseNotification({
      typeWebhook: 'incomingMessageReceived',
      timestamp: 1_700_000_000,
      idMessage: 'incoming-1',
      senderData: {
        senderPhoneNumber: 12025550100,
        senderName: 'Alice',
      },
      messageData: {
        typeMessage: 'textMessage',
        textMessageData: { textMessage: 'Привет!' },
      },
    })).toEqual({
      kind: 'incomingText',
      chatName: 'Alice',
      idMessage: 'incoming-1',
      phoneNumber: '12025550100',
      text: 'Привет!',
      timestamp: 1_700_000_000_000,
    })
  })

  it('parses an outgoing message status', () => {
    expect(parseNotification({
      typeWebhook: 'outgoingMessageStatus',
      chatId: '12025550100@c.us',
      idMessage: 'outgoing-1',
      status: 'read',
    })).toEqual({
      kind: 'outgoingStatus',
      chatId: '12025550100@c.us',
      idMessage: 'outgoing-1',
      status: 'read',
    })
  })
})
