import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '@/shared/lib/testing/server'
import { GreenApiClient, GreenApiError, normalizeCredentials } from './client'
import { validateConnection } from './validateConnection'

const credentials = {
  idInstance: '410000001',
  apiTokenInstance: 'test-token',
}

const baseUrl = 'https://4100.api.green-api.com/waInstance410000001'

function useValidConnectionHandlers(overrides: Record<string, unknown> = {}) {
  server.use(
    http.get(`${baseUrl}/getStateInstance/test-token`, () => HttpResponse.json({ stateInstance: 'authorized' })),
    http.get(`${baseUrl}/getSettings/test-token`, () => HttpResponse.json({
      wid: '79990000000@c.us',
      typeInstance: 'telegram',
      webhookUrl: '',
      incomingWebhook: 'yes',
      outgoingWebhook: 'yes',
      outgoingMessageWebhook: 'yes',
      outgoingAPIMessageWebhook: 'yes',
      stateWebhook: 'yes',
      ...overrides,
    })),
  )
}

describe('GREEN-API client', () => {
  it('normalizes credentials without exposing the token through public instance data', () => {
    expect(normalizeCredentials(credentials)).toEqual(credentials)
    expect(new GreenApiClient(credentials).publicInstance).toEqual({ idInstance: '410000001' })
  })

  it('connects only an authorized Telegram instance with HTTP API notifications enabled', async () => {
    useValidConnectionHandlers()
    const result = await validateConnection(credentials)

    expect(result.instance).toEqual({ idInstance: '410000001', typeInstance: 'telegram' })
  })

  it('does not require instance state notifications', async () => {
    useValidConnectionHandlers({ stateWebhook: 'no' })

    const result = await validateConnection(credentials)

    expect(result.instance).toEqual({ idInstance: '410000001', typeInstance: 'telegram' })
  })

  it('explains which notification settings must be changed', async () => {
    useValidConnectionHandlers({ webhookUrl: 'https://example.com/hook', incomingWebhook: 'no' })

    const connection = validateConnection(credentials)
    await expect(connection).rejects.toSatisfy((error: unknown) => {
      if (!(error instanceof GreenApiError)) return false
      expect(error.code).toBe('invalid_settings')
      expect(error.message).toContain('очистите webhookUrl')
      expect(error.message).toContain('включите входящие уведомления')
      return true
    })
  })

  it('does not include the token in an HTTP error message', async () => {
    server.use(
      http.get(`${baseUrl}/getStateInstance/test-token`, () => new HttpResponse(null, { status: 401 })),
    )

    const client = new GreenApiClient(credentials)
    await expect(client.getStateInstance()).rejects.toSatisfy((error: GreenApiError) => {
      expect(error.message).not.toContain(credentials.apiTokenInstance)
      expect(error.status).toBe(401)
      return true
    })
  })

  it('sends a text message to a phone chat', async () => {
    server.use(
      http.post(`${baseUrl}/sendMessage/test-token`, async ({ request }) => {
        const body: unknown = await request.json()
        expect(body).toEqual({ chatId: '12025550100@c.us', message: 'Привет!' })
        return HttpResponse.json({ idMessage: 'message-1' })
      }),
    )

    const client = new GreenApiClient(credentials)
    await expect(client.sendMessage('12025550100@c.us', 'Привет!')).resolves.toEqual({ idMessage: 'message-1' })
  })

  it('receives and deletes an HTTP API notification', async () => {
    server.use(
      http.get(`${baseUrl}/receiveNotification/test-token`, ({ request }) => {
        expect(new URL(request.url).searchParams.get('receiveTimeout')).toBe('5')
        return HttpResponse.json({ receiptId: 42, body: { typeWebhook: 'test' } })
      }),
      http.delete(`${baseUrl}/deleteNotification/test-token/42`, () => HttpResponse.json({ result: true, reason: '' })),
    )

    const client = new GreenApiClient(credentials)
    await expect(client.receiveNotification()).resolves.toEqual({ receiptId: 42, body: { typeWebhook: 'test' } })
    await expect(client.deleteNotification(42)).resolves.toBeUndefined()
  })
})
