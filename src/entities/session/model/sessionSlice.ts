import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface SessionState {
  status: 'disconnected' | 'connecting' | 'connected'
  instanceId: string | null
}

const initialState: SessionState = {
  status: 'disconnected',
  instanceId: null,
}

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    connectionStarted: () => ({ ...initialState, status: 'connecting' as const }),
    connectionEstablished: (_state, action: PayloadAction<string>) => ({
      status: 'connected' as const,
      instanceId: action.payload,
    }),
    sessionCleared: () => initialState,
  },
})

export const { connectionStarted, connectionEstablished, sessionCleared } = sessionSlice.actions
export const sessionReducer = sessionSlice.reducer
