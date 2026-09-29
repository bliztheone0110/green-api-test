import type { GreenApiCredentials } from '@/shared/api/green-api'

export type ConnectInstance = (
  credentials: GreenApiCredentials,
  signal: AbortSignal,
) => Promise<void>
