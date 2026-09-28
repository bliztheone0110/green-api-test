import { configureStore } from '@reduxjs/toolkit'
import { sessionReducer } from '@/entities/session'

export function createAppStore() {
  return configureStore({
    reducer: { session: sessionReducer },
    devTools: import.meta.env.DEV,
  })
}

export type AppStore = ReturnType<typeof createAppStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
