import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CreateChatDialog } from './CreateChatDialog'

describe('create chat dialog', () => {
  it('shows an error for an invalid phone number', async () => {
    const user = userEvent.setup()
    const onCreate = vi.fn()
    render(<CreateChatDialog
      onClose={vi.fn()}
      onCreate={onCreate}
    />)

    await user.type(screen.getByRole('textbox', { name: 'Номер телефона' }), '123')
    await user.click(screen.getByRole('button', { name: 'Создать чат' }))

    expect(screen.getByText('Введите международный номер: от 7 до 15 цифр.')).toBeInTheDocument()
    expect(onCreate).not.toHaveBeenCalled()
  })

  it('normalizes an international phone number before creating a chat', async () => {
    const user = userEvent.setup()
    const onCreate = vi.fn()
    render(<CreateChatDialog
      onClose={vi.fn()}
      onCreate={onCreate}
    />)

    await user.type(screen.getByRole('textbox', { name: 'Номер телефона' }), '+1 (202) 555-0100')
    await user.click(screen.getByRole('button', { name: 'Создать чат' }))

    expect(onCreate).toHaveBeenCalledWith('+12025550100')
  })
})
