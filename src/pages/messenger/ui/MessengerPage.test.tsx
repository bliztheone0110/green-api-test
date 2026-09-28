import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { MessengerPage } from './MessengerPage'

describe('messenger preview', () => {
  it('validates a phone and reopens the same chat after number normalization', async () => {
    const user = userEvent.setup()
    render(<MessengerPage onExit={vi.fn()} />)
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
    render(<MessengerPage onExit={vi.fn()} />)
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
    render(<MessengerPage onExit={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: /Анна Смирнова/ }))
    const input = screen.getByRole('textbox', { name: 'Сообщение' })
    await user.type(input, '   ')
    expect(screen.getByRole('button', { name: 'Отправить демо-сообщение' })).toBeDisabled()
    await user.clear(input)
    await user.type(input, 'Первая строка{Shift>}{Enter}{/Shift}Вторая строка')
    expect(input).toHaveValue('Первая строка\nВторая строка')
    await user.keyboard('{Enter}')
    expect(input).toHaveValue('')
    expect(within(screen.getByRole('list', { name: 'Сообщения' })).getAllByText(/Первая строка/)).toHaveLength(1)
    expect(screen.getByText('Сообщения не отправляются в Telegram')).toBeInTheDocument()
  })
})
