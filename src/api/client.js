import axios from 'axios'

/**
 * Shared Axios client for the Laravel SaaS API.
 * Dev: Vite proxy (`/api` → law.elmoroj.com)
 * Prod: absolute API origin
 */
export const API_BASE_URL = import.meta.env.DEV
  ? '/api'
  : 'https://law.elmoroj.com/api'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    Accept: 'application/json',
  },
})

/**
 * Normalize Laravel / Axios errors into a UI-friendly shape.
 */
export function parseApiError(error) {
  const data = error?.response?.data
  const fieldErrors = {}

  if (data?.errors && typeof data.errors === 'object') {
    for (const [key, value] of Object.entries(data.errors)) {
      fieldErrors[key] = Array.isArray(value) ? value[0] : String(value)
    }
  }

  if (!data) {
    const isNetwork = error?.message === 'Network Error' || !error?.response
    return {
      message: isNetwork
        ? 'تعذر الاتصال بالخادم. تحقق من الاتصال بالإنترنت ثم حاول مرة أخرى.'
        : 'حدث خطأ غير متوقع. حاول مرة أخرى.',
      fieldErrors,
    }
  }

  const message =
    data.message ||
    Object.values(fieldErrors)[0] ||
    'تعذر إكمال العملية. راجع البيانات المدخلة.'

  return { message, fieldErrors }
}
