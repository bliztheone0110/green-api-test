import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { GreenApiError } from '@/shared/api/green-api'
import { ConnectionForm } from './ConnectionForm'

describe('connection form', () => {
  it('passes the entered credentials to the connection callback', async () => {
    const user = userEvent.setup()
    const onConnect = vi.fn().mockResolvedValue(undefined)
    render(<ConnectionForm onConnect={onConnect} />)

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
    const onConnect = vi.fn()
      .mockRejectedValueOnce(new GreenApiError('Проверьте настройки инстанса.', 'invalid_settings'))
      .mockResolvedValueOnce(undefined)
    render(<ConnectionForm onConnect={onConnect} />)

    await user.type(screen.getByRole('textbox', { name: 'ID инстанса' }), '410000001')
    await user.type(screen.getByLabelText('API-токен'), 'secret-token')
    await user.click(screen.getByRole('button', { name: /Подключиться/ }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Проверьте настройки инстанса.')
    const submit = screen.getByRole('button', { name: /Подключиться/ })
    expect(submit).toBeEnabled()

    await user.click(submit)
    await waitFor(() => { expect(onConnect).toHaveBeenCalledTimes(2) })
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('aborts an active connection when the form unmounts', async () => {
    const user = userEvent.setup()
    let connectionSignal: AbortSignal | undefined
    const onConnect = vi.fn((_credentials, signal: AbortSignal) => {
      connectionSignal = signal
      return new Promise<void>(() => undefined)
    })
    const { unmount } = render(<ConnectionForm onConnect={onConnect} />)

    await user.type(screen.getByRole('textbox', { name: 'ID инстанса' }), '410000001')
    await user.type(screen.getByLabelText('API-токен'), 'secret-token')
    await user.click(screen.getByRole('button', { name: /Подключиться/ }))
    await waitFor(() => { expect(onConnect).toHaveBeenCalledOnce() })

    unmount()
    expect(connectionSignal?.aborted).toBe(true)
  })
})
