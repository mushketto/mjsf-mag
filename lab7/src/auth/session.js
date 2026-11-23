const ACCESS_TOKEN_KEY = 'forma_lab7_access_token'

export function readAccessToken() {
  try {
    const token = window.sessionStorage.getItem(ACCESS_TOKEN_KEY)
    return token && token.trim() ? token : null
  } catch {
    return null
  }
}

export function writeAccessToken(token) {
  try {
    if (token && token.trim()) {
      window.sessionStorage.setItem(ACCESS_TOKEN_KEY, token)
    } else {
      window.sessionStorage.removeItem(ACCESS_TOKEN_KEY)
    }
  } catch {
  }
}

export function clearAccessToken() {
  try {
    window.sessionStorage.removeItem(ACCESS_TOKEN_KEY)
  } catch {
  }
}