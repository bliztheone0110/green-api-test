export interface GreenApiCredentials {
  idInstance: string
  apiTokenInstance: string
}

export interface SendMessageResponse {
  idMessage: string
}

export interface NotificationEnvelope {
  receiptId: number
  body: unknown
}

export interface DeleteNotificationResponse {
  result: boolean
  reason: string
}

export type InstanceState =
  | 'notAuthorized'
  | 'authorized'
  | 'blocked'
  | 'suspended'
  | 'starting'
  | 'pendingPassword'

export interface GetStateInstanceResponse {
  stateInstance: InstanceState
}

export interface GetSettingsResponse {
  wid: string
  typeInstance: string
  webhookUrl: string
  incomingWebhook: 'yes' | 'no'
  outgoingWebhook: 'yes' | 'no'
  outgoingMessageWebhook: 'yes' | 'no'
  outgoingAPIMessageWebhook: 'yes' | 'no'
  stateWebhook: 'yes' | 'no'
}

export interface ConnectedInstance {
  idInstance: string
  typeInstance: string
}
