import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { MessengerPage } from './MessengerPage'

describe('messenger preview', () => {
  it('validates a phone and reopens the same chat after number normalization', async () => {
    const user = userEvent.setup()
    render(<MessengerPage mode="demo" onExit={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: 'Новый чат' }))
    const phone = screen.getByRole('textbox', { name: 'Номер телефона' })
    expect(phone).toHaveFocus()
    await user.type(phone, '123')
    await user.click(screen.getByRole('button', { name: 'Создать чат' }))
    expect(phone).toHaveAttribute('aria-invalid', 'true')
    await user.clear(phone)
    await user.type(phone, '+1 (202) 555-0100')
    await user.click(screen.getByRole('button', { name: 'Создать чат' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '+12025550100' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Новый чат' }))
    await user.type(screen.getByRole('textbox', { name: 'Номер телефона' }), '12025550100')
    await user.click(screen.getByRole('button', { name: 'Создать чат' }))
    expect(within(screen.getByRole('navigation', { name: 'Диалоги' })).getAllByRole('button', { name: /12025550100/ })).toHaveLength(1)
  })

  it('keeps drafts separate and marks a selected conversation as read', async () => {
    const user = userEvent.setup()
    render(<MessengerPage mode="demo" onExit={vi.fn()} />)
    const nav = screen.getByRole('navigation', { name: 'Диалоги' })
    const anna = within(nav).getByRole('button', { name: /Анна Смирнова/ })
    await user.click(anna)
    expect(within(anna).queryByLabelText('Непрочитанных: 1')).not.toBeInTheDocument()
    await user.type(screen.getByRole('textbox', { name: 'Сообщение' }), 'Черновик для Анны')
    await user.click(within(nav).getByRole('button', { name: /Михаил Волков/ }))
    expect(screen.getByRole('textbox', { name: 'Сообщение' })).toHaveValue('')
    await user.click(anna)
    expect(screen.getByRole('textbox', { name: 'Сообщение' })).toHaveValue('Черновик для Анны')
  })

  it('supports multiline drafts, blocks whitespace, and inserts one local message on Enter', async () => {
    const user = userEvent.setup()
    render(<MessengerPage mode="demo" onExit={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: /Анна Смирнова/ }))
    const input = screen.getByRole('textbox', { name: 'Сообщение' })
    await user.type(input, '   ')
    expect(screen.getByRole('button', { name: 'Отправить сообщение' })).toBeDisabled()
    await user.clear(input)
    await user.type(input, 'Первая строка{Shift>}{Enter}{/Shift}Вторая строка')
    expect(input).toHaveValue('Первая строка\nВторая строка')
    await user.keyboard('{Enter}')
    expect(input).toHaveValue('')
    expect(within(screen.getByRole('list', { name: 'Сообщения' })).getAllByText(/Первая строка/)).toHaveLength(1)
    expect(screen.getByText('Сообщения не отправляются в Telegram')).toBeInTheDocument()
  })

  it('creates a new connected chat and sends its first message by phone number', async () => {
    const user = userEvent.setup()
    const onSendMessage = vi.fn().mockResolvedValue({ idMessage: 'telegram-message-1' })
    render(<MessengerPage mode="connected" onExit={vi.fn()} onSendMessage={onSendMessage} />)

    await user.click(screen.getByRole('button', { name: 'Начать разговор' }))
    await user.type(screen.getByRole('textbox', { name: 'Номер телефона' }), '+1 (202) 555-0100')
    await user.click(screen.getByRole('button', { name: 'Создать чат' }))
    await user.type(screen.getByRole('textbox', { name: 'Сообщение' }), 'Привет!')
    await user.click(screen.getByRole('button', { name: 'Отправить сообщение' }))

    expect(onSendMessage).toHaveBeenCalledWith('12025550100@c.us', 'Привет!')
    expect(await screen.findByText('В очереди')).toBeInTheDocument()
  })

  it('keeps an incoming notification unread until its chat is opened', async () => {
    const user = userEvent.setup()
    const onDeleteNotification = vi.fn().mockResolvedValue(undefined)
    const onReceiveNotification = vi.fn()
      .mockResolvedValueOnce({
        receiptId: 42,
        body: {
          typeWebhook: 'incomingMessageReceived',
          timestamp: 1_700_000_000,
          idMessage: 'incoming-1',
          senderData: { senderPhoneNumber: 12025550100, senderName: 'Alice' },
          messageData: { typeMessage: 'textMessage', textMessageData: { textMessage: 'Ответ из Telegram' } },
        },
      })
      .mockImplementation(() => new Promise(() => undefined))

    render(<MessengerPage mode="connected" onExit={vi.fn()}
      onReceiveNotification={onReceiveNotification} onDeleteNotification={onDeleteNotification} />)

    const chat = await screen.findByRole('button', { name: /Alice/ })
    expect(within(chat).getByLabelText('Непрочитанных: 1')).toBeInTheDocument()
    expect(onDeleteNotification).not.toHaveBeenCalled()

    await user.click(chat)
    expect(within(screen.getByLabelText('Входящее сообщение')).getByText('Ответ из Telegram')).toBeInTheDocument()
    await waitFor(() => { expect(onDeleteNotification).toHaveBeenCalledWith(42) })
    expect(within(chat).queryByLabelText('Непрочитанных: 1')).not.toBeInTheDocument()
  })

  it('updates a queued outgoing message from a status notification', async () => {
    const user = userEvent.setup()
    const onDeleteNotification = vi.fn().mockResolvedValue(undefined)
    let resolveNotification: ((value: {
      receiptId: number
      body: Record<string, unknown>
    }) => void) | undefined
    const onReceiveNotification = vi.fn()
      .mockImplementationOnce(() => new Promise((resolve) => { resolveNotification = resolve }))
      .mockImplementation(() => new Promise(() => undefined))

    render(<MessengerPage mode="connected" onExit={vi.fn()}
      onSendMessage={vi.fn().mockResolvedValue({ idMessage: 'telegram-message-1' })}
      onReceiveNotification={onReceiveNotification} onDeleteNotification={onDeleteNotification} />)

    await user.click(screen.getByRole('button', { name: 'Начать разговор' }))
    await user.type(screen.getByRole('textbox', { name: 'Номер телефона' }), '+1 (202) 555-0100')
    await user.click(screen.getByRole('button', { name: 'Создать чат' }))
    await user.type(screen.getByRole('textbox', { name: 'Сообщение' }), 'Привет!')
    await user.click(screen.getByRole('button', { name: 'Отправить сообщение' }))
    expect(await screen.findByText('В очереди')).toBeInTheDocument()

    resolveNotification?.({
      receiptId: 43,
      body: {
        typeWebhook: 'outgoingMessageStatus',
        chatId: '12025550100@c.us',
        idMessage: 'telegram-message-1',
        status: 'read',
      },
    })

    expect(await screen.findByText('Прочитано')).toBeInTheDocument()
    await waitFor(() => { expect(onDeleteNotification).toHaveBeenCalledWith(43, expect.any(AbortSignal)) })
  })
})
