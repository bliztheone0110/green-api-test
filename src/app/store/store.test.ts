import { describe, expect, it } from 'vitest'
import { connectionEstablished, sessionCleared } from '@/entities/session'
import { createAppStore } from './store'

describe('session isolation', () => {
  it('does not reuse a previous instance when creating a new application store', () => {
    const previousStore = createAppStore()
    previousStore.dispatch(connectionEstablished({ instanceId: '410000001', typeInstance: 'telegram' }))

    const nextStore = createAppStore()
    expect(nextStore.getState().session).toEqual({
      status: 'disconnected',
      instanceId: null,
      typeInstance: null,
    })
    expect(previousStore.getState().session.instanceId).toBe('410000001')
  })

  it('clears instance identity on disconnect', () => {
    const store = createAppStore()
    store.dispatch(connectionEstablished({ instanceId: '410000001', typeInstance: 'telegram' }))
    store.dispatch(sessionCleared())

    expect(store.getState().session).toEqual({ status: 'disconnected', instanceId: null, typeInstance: null })
  })
})
