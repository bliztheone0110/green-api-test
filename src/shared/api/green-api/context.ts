import { createContext, use } from 'react'
import type { GreenApiClient } from './client'
import type { ConnectedInstance, GreenApiCredentials } from './types'

export interface GreenApiContextValue {
  connect: (credentials: GreenApiCredentials, signal?: AbortSignal) => Promise<ConnectedInstance>
  disconnect: () => void
  getClient: () => GreenApiClient | null
}

export const GreenApiContext = createContext<GreenApiContextValue | null>(null)

export function useGreenApi() {
  const context = use(GreenApiContext)
  if (!context) throw new Error('useGreenApi must be used inside GreenApiProvider')
  return context
}
