import { GreenApiClient, GreenApiError } from './client'
import type { ConnectedInstance, GreenApiCredentials, InstanceState } from './types'

const stateMessages: Record<Exclude<InstanceState, 'authorized'>, string> = {
  notAuthorized: 'Инстанс не авторизован в Telegram. Завершите авторизацию в кабинете GREEN-API.',
  blocked: 'Telegram-аккаунт инстанса заблокирован.',
  suspended: 'На Telegram-аккаунте действуют временные ограничения.',
  starting: 'Инстанс запускается. Подождите несколько минут и повторите попытку.',
  pendingPassword: 'Для авторизации инстанса требуется пароль двухфакторной аутентификации.',
}

export async function validateConnection(
  credentials: GreenApiCredentials,
  signal?: AbortSignal,
): Promise<{ client: GreenApiClient; instance: ConnectedInstance }> {
  const client = new GreenApiClient(credentials)
  const [state, settings] = await Promise.all([
    client.getStateInstance(signal),
    client.getSettings(signal),
  ])

  if (state.stateInstance !== 'authorized') {
    throw new GreenApiError(stateMessages[state.stateInstance], 'unauthorized_instance')
  }

  if (settings.typeInstance !== 'telegram') {
    throw new GreenApiError('Указанный инстанс не относится к Telegram.', 'invalid_settings')
  }

  const settingsProblems: string[] = []
  if (settings.webhookUrl) settingsProblems.push('очистите webhookUrl')
  if (settings.incomingWebhook !== 'yes') settingsProblems.push('включите входящие уведомления')
  if (settings.outgoingWebhook !== 'yes') settingsProblems.push('включите статусы исходящих сообщений')
  if (settings.outgoingMessageWebhook !== 'yes') settingsProblems.push('включите уведомления об исходящих сообщениях')
  if (settings.outgoingAPIMessageWebhook !== 'yes') settingsProblems.push('включите уведомления о сообщениях из API')

  if (settingsProblems.length > 0) {
    throw new GreenApiError(
      `Измените настройки инстанса в кабинете GREEN-API: ${settingsProblems.join(', ')}.`,
      'invalid_settings',
    )
  }

  return {
    client,
    instance: {
      idInstance: client.publicInstance.idInstance,
      typeInstance: settings.typeInstance,
    },
  }
}
