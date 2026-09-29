import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface SessionState {
  status: 'disconnected' | 'connecting' | 'connected'
  instanceId: string | null
  typeInstance: string | null
}

const initialState: SessionState = {
  status: 'disconnected',
  instanceId: null,
  typeInstance: null,
}

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    connectionStarted: () => ({ ...initialState, status: 'connecting' as const }),
    connectionEstablished: (_state, action: PayloadAction<{ instanceId: string; typeInstance: string }>) => ({
      status: 'connected' as const,
      instanceId: action.payload.instanceId,
      typeInstance: action.payload.typeInstance,
    }),
    sessionCleared: () => initialState,
  },
})

export const { connectionStarted, connectionEstablished, sessionCleared } = sessionSlice.actions
export const sessionReducer = sessionSlice.reducer
