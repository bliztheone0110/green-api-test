import { useState } from 'react'
import { ConnectionPage } from '@/pages/connection'
import { MessengerPage } from '@/pages/messenger'

export function App() {
  const [preview, setPreview] = useState(false)
  return preview ? <MessengerPage onExit={() => setPreview(false)} /> : <ConnectionPage onPreview={() => setPreview(true)} />
}
