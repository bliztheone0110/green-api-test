import type {
  DeleteNotificationResponse,
  GetSettingsResponse,
  GetStateInstanceResponse,
  GreenApiCredentials,
  NotificationEnvelope,
  SendMessageResponse,
} from './types'

const API_URL = 'https://4100.api.green-api.com'

export type GreenApiErrorCode =
  | 'invalid_credentials'
  | 'unauthorized_instance'
  | 'invalid_settings'
  | 'network_error'
  | 'request_failed'

export class GreenApiError extends Error {
  readonly code: GreenApiErrorCode
  readonly status?: number

  constructor(
    message: string,
    code: GreenApiErrorCode,
    status?: number,
  ) {
    super(message)
    this.name = 'GreenApiError'
    this.code = code
    this.status = status
  }
}

export function normalizeCredentials(credentials: GreenApiCredentials): GreenApiCredentials {
  const idInstance = credentials.idInstance.trim()
  const apiTokenInstance = credentials.apiTokenInstance.trim()

  if (!/^\d+$/.test(idInstance)) {
    throw new GreenApiError('ID инстанса должен содержать только цифры.', 'invalid_credentials')
  }

  if (!apiTokenInstance) {
    throw new GreenApiError('Введите API-токен инстанса.', 'invalid_credentials')
  }

  return { idInstance, apiTokenInstance }
}

export function phoneNumberToChatId(phoneNumber: string) {
  const digits = phoneNumber.replace(/\D/g, '')
  if (!/^[1-9]\d{6,14}$/.test(digits)) {
    throw new GreenApiError('Введите корректный номер телефона.', 'invalid_credentials')
  }
  return `${digits}@c.us`
}

export class GreenApiClient {
  private readonly credentials: GreenApiCredentials

  constructor(credentials: GreenApiCredentials) {
    this.credentials = normalizeCredentials(credentials)
  }

  get publicInstance() {
    return { idInstance: this.credentials.idInstance }
  }

  getStateInstance(signal?: AbortSignal) {
    return this.request<GetStateInstanceResponse>('getStateInstance', { signal })
  }

  getSettings(signal?: AbortSignal) {
    return this.request<GetSettingsResponse>('getSettings', { signal })
  }

  sendMessage(chatId: string, message: string, signal?: AbortSignal) {
    return this.request<SendMessageResponse>('sendMessage', {
      method: 'POST',
      body: JSON.stringify({ chatId, message }),
      headers: { 'Content-Type': 'application/json' },
      signal,
    })
  }

  receiveNotification(signal?: AbortSignal) {
    return this.request<NotificationEnvelope | null>('receiveNotification', { signal }, '?receiveTimeout=5')
  }

  async deleteNotification(receiptId: number, signal?: AbortSignal) {
    const response = await this.request<DeleteNotificationResponse>(
      'deleteNotification',
      { method: 'DELETE', signal },
      `/${String(receiptId)}`,
    )
    if (!response.result) {
      throw new GreenApiError('GREEN-API не подтвердил обработку уведомления.', 'request_failed')
    }
  }

  private async request<T>(method: string, init?: RequestInit, suffix = ''): Promise<T> {
    const { idInstance, apiTokenInstance } = this.credentials
    const endpoint = `${API_URL}/waInstance${encodeURIComponent(idInstance)}/${method}/${encodeURIComponent(apiTokenInstance)}${suffix}`
    const headers = new Headers(init?.headers)
    headers.set('Accept', 'application/json')

    let response: Response
    try {
      response = await fetch(endpoint, {
        ...init,
        headers,
      })
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') throw error
      throw new GreenApiError(
        'Не удалось связаться с GREEN-API. Проверьте адрес и подключение к интернету.',
        'network_error',
      )
    }

    if (!response.ok) {
      const message = response.status === 401 || response.status === 403
        ? 'GREEN-API отклонил учётные данные. Проверьте ID и токен.'
        : `GREEN-API вернул ошибку ${String(response.status)}. Попробуйте ещё раз.`
      throw new GreenApiError(message, 'request_failed', response.status)
    }

    try {
      const body = await response.text()
      if (!body) return null as T
      return JSON.parse(body) as T
    } catch {
      throw new GreenApiError('GREEN-API вернул некорректный ответ.', 'request_failed', response.status)
    }
  }
}
