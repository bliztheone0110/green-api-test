import { useState } from 'react'
import type { SubmitEvent } from 'react'
import type { CreateChat } from './types'

export function useCreateChatForm(onCreate: CreateChat) {
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')

  function updatePhone(value: string) {
    setPhone(value)
    setError('')
  }

  function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const digits = phone.replace(/[\s()+-]/g, '')
    if (!/^[1-9]\d{6,14}$/.test(digits)) {
      setError('Введите международный номер: от 7 до 15 цифр.')
      return
    }
    onCreate(`+${digits}`)
  }

  return {
    error,
    phone,
    submit,
    updatePhone,
  }
}
