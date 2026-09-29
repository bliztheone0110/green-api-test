import { useCallback, useMemo, useRef } from 'react'
import type { PropsWithChildren } from 'react'
import { validateConnection } from './validateConnection'
import type { GreenApiClient } from './client'
import type { GreenApiCredentials } from './types'
import { GreenApiContext } from './context'

export function GreenApiProvider({ children }: PropsWithChildren) {
  const clientRef = useRef<GreenApiClient | null>(null)

  const connect = useCallback(async (credentials: GreenApiCredentials, signal?: AbortSignal) => {
    clientRef.current = null
    const result = await validateConnection(credentials, signal)
    clientRef.current = result.client
    return result.instance
  }, [])

  const disconnect = useCallback(() => {
    clientRef.current = null
  }, [])

  const getClient = useCallback(() => clientRef.current, [])
  const value = useMemo(() => ({ connect, disconnect, getClient }), [connect, disconnect, getClient])

  return <GreenApiContext value={value}>{children}</GreenApiContext>
}
