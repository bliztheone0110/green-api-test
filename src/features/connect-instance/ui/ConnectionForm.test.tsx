import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { GreenApiError } from '@/shared/api/green-api'
import { ConnectionForm } from './ConnectionForm'

describe('connection form', () => {
  it('passes the entered credentials to the connection callback', async () => {
    const user = userEvent.setup()
    const onConnect = vi.fn().mockResolvedValue(undefined)
    render(<ConnectionForm onConnect={onConnect} onPreview={vi.fn()} />)

    await user.type(screen.getByRole('textbox', { name: 'ID инстанса' }), '410000001')
    await user.type(screen.getByLabelText('API-токен'), 'secret-token')
    await user.click(screen.getByRole('button', { name: /Подключиться/ }))

    expect(onConnect).toHaveBeenCalledWith({
      idInstance: '410000001',
      apiTokenInstance: 'secret-token',
    }, expect.any(AbortSignal))
  })

  it('shows a safe API error and allows retrying', async () => {
    const user = userEvent.setup()
    const onConnect = vi.fn().mockRejectedValue(new GreenApiError('Проверьте настройки инстанса.', 'invalid_settings'))
    render(<ConnectionForm onConnect={onConnect} onPreview={vi.fn()} />)

    await user.type(screen.getByRole('textbox', { name: 'ID инстанса' }), '410000001')
    await user.type(screen.getByLabelText('API-токен'), 'secret-token')
    await user.click(screen.getByRole('button', { name: /Подключиться/ }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Проверьте настройки инстанса.')
    expect(screen.getByRole('button', { name: /Подключиться/ })).toBeEnabled()
  })
})
