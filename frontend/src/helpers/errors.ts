import axios, { AxiosError } from 'axios'
import { toast } from '@/hooks/use-toast'

type BackendErrorBody = {
  statusCode?: number
  message?: string | string[]
  timestamp?: string
  path?: string
  error?: string
}

export function extractErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  // Axios error with response from backend
  if (axios.isAxiosError(error)) {
    const err = error as AxiosError<BackendErrorBody | string | any>
    const data = err.response?.data
    if (data) {
      if (typeof data === 'string') return data
      const body = data as BackendErrorBody
      const msg = Array.isArray(body.message) ? body.message[0] : body.message
      if (msg && String(msg).trim().length > 0) return String(msg)
      if (body.error && String(body.error).trim().length > 0) return String(body.error)
    }
    if (err.message) return err.message
  }

  // Native Error
  if (error instanceof Error) {
    return error.message || fallback
  }

  // String
  if (typeof error === 'string') return error

  try {
    return JSON.stringify(error)
  } catch {
    return fallback
  }
}

export function handleError(error: unknown, options?: { toast?: boolean; fallbackMessage?: string }) {
  const { toast: shouldToast = true, fallbackMessage } = options || {}
  const message = extractErrorMessage(error, fallbackMessage)
  if (shouldToast) {
    toast({
      title: 'Error',
      description: message,
      // You can set variant via your Toast component props if supported
    })
  }
  return message
}

export function getErrorTitle(error: unknown): string {
  // Provide a short title for UI components
  if (axios.isAxiosError(error)) {
    const status = error.response?.status
    if (status) return `Request failed (${status})`
  }
  return 'Something went wrong'
}