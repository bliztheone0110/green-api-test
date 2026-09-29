import { ConnectionPage } from '@/pages/connection'
import { MessengerPage } from '@/pages/messenger'
import { useAppController } from './model/useAppController'

export function App() {
  const appController = useAppController()

  if (appController.isConnected) {
    return <MessengerPage
      onExit={appController.exitMessenger}
      onSendMessage={appController.sendMessage}
      onReceiveNotification={appController.receiveNotification}
      onDeleteNotification={appController.deleteNotification}
    />
  }

  return <ConnectionPage onConnect={appController.connectInstance} />
}
