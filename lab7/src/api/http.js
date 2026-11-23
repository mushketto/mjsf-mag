const API_BASE_URL = 'https://dummyjson.com'

export class HttpError extends Error {
  constructor(message, status, data = null) {
    super(message)
    this.name = 'HttpError'
    this.status = status
    this.data = data
    this.isUnauthorized = status === 401
  }
}

export async function requestJson(
  path,
  { method = 'GET', token = null, body, signal } = {},
) {
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`
  const headers = {
    Accept: 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const init = {
    method,
    headers,
    credentials: 'omit',
    signal,
  }

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    init.body = JSON.stringify(body)
  }

  const response = await fetch(url, init)

  let payload = null
  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    try {
      payload = await response.json()
    } catch {
      payload = null
    }
  }

  if (!response.ok) {
    const serverMessage =
      payload && typeof payload.message === 'string' && payload.message.trim()
        ? payload.message.trim()
        : `HTTP ${response.status}`
    throw new HttpError(serverMessage, response.status, payload)
  }

  return payload
}