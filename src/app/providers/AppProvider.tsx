import { useState } from 'react'
import type { PropsWithChildren } from 'react'
import { Provider } from 'react-redux'
import { GreenApiProvider } from '@/shared/api/green-api'
import { createAppStore } from '../store/store'

export function AppProvider({ children }: PropsWithChildren) {
  const [store] = useState(createAppStore)

  return (
    <Provider store={store}>
      <GreenApiProvider>
        {children}
      </GreenApiProvider>
    </Provider>
  )
}
