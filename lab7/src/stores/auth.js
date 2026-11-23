import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { requestJson } from '../api/http.js'
import {
  clearAccessToken,
  readAccessToken,
  writeAccessToken,
} from '../auth/session.js'
import { useProductsStore } from './products.js'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref(null)
  const user = ref(null)
  const status = ref('idle')
  const error = ref(null)
  const endReason = ref(null)
  const sessionVersion = ref(0)

  let activeRestorePromise = null
  let activeAuthController = null

  const isAuthenticated = computed(
    () =>
      status.value === 'authenticated' &&
      Boolean(accessToken.value) &&
      Boolean(user.value),
  )

  const isBusy = computed(
    () => status.value === 'restoring' || status.value === 'signing-in',
  )

  const displayName = computed(() => {
    if (!user.value) {
      return ''
    }
    const fullName = [user.value.firstName, user.value.lastName]
      .filter(Boolean)
      .join(' ')
      .trim()
    return fullName || user.value.username || 'Користувач'
  })

  function abortPendingAuth() {
    if (activeAuthController) {
      activeAuthController.abort()
      activeAuthController = null
    }
    activeRestorePromise = null
  }

  function clearSessionState(reason = null) {
    sessionVersion.value += 1
    abortPendingAuth()
    clearAccessToken()
    accessToken.value = null
    user.value = null
    status.value = 'guest'
    error.value = null
    endReason.value = reason

    const productsStore = useProductsStore()
    productsStore.reset()
  }

  async function login({ username, password }) {
    if (isBusy.value) {
      return false
    }

    const versionAtStart = ++sessionVersion.value
    abortPendingAuth()

    const controller = new AbortController()
    activeAuthController = controller

    status.value = 'signing-in'
    error.value = null
    endReason.value = null

    try {
      const payload = await requestJson('/auth/login', {
        method: 'POST',
        body: {
          username: String(username ?? '').trim(),
          password: String(password ?? ''),
          expiresInMins: 30,
        },
        signal: controller.signal,
      })

      if (controller.signal.aborted || sessionVersion.value !== versionAtStart) {
        return false
      }

      const token = payload?.accessToken
      if (!token) {
        throw new Error('Сервер не повернув accessToken.')
      }

      accessToken.value = token
      user.value = {
        id: payload.id,
        username: payload.username,
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
      }
      writeAccessToken(token)
      status.value = 'authenticated'
      error.value = null
      return true
    } catch (cause) {
      if (controller.signal.aborted || cause?.name === 'AbortError') {
        return false
      }

      if (sessionVersion.value === versionAtStart) {
        accessToken.value = null
        user.value = null
        clearAccessToken()
        status.value = 'guest'
        error.value =
          cause?.status === 400
            ? 'Неправильний логін або пароль.'
            : cause instanceof Error
              ? cause.message
              : 'Не вдалося виконати вхід.'
      }
      return false
    } finally {
      if (activeAuthController === controller) {
        activeAuthController = null
      }
    }
  }

  async function restore(force = false) {
    if (!force && (status.value === 'authenticated' || status.value === 'guest')) {
      return isAuthenticated.value
    }

    if (activeRestorePromise) {
      return activeRestorePromise
    }

    const storedToken = readAccessToken()
    if (!storedToken) {
      accessToken.value = null
      user.value = null
      status.value = 'guest'
      error.value = null
      return false
    }

    const versionAtStart = sessionVersion.value
    const controller = new AbortController()
    activeAuthController = controller

    status.value = 'restoring'
    error.value = null

    const promise = (async () => {
      try {
        const profile = await requestJson('/auth/me', {
          method: 'GET',
          token: storedToken,
          signal: controller.signal,
        })

        if (controller.signal.aborted || sessionVersion.value !== versionAtStart) {
          return false
        }

        accessToken.value = storedToken
        user.value = {
          id: profile.id,
          username: profile.username,
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
        }
        status.value = 'authenticated'
        error.value = null
        endReason.value = null
        return true
      } catch (cause) {
        if (controller.signal.aborted || cause?.name === 'AbortError') {
          return false
        }

        if (sessionVersion.value !== versionAtStart) {
          return false
        }

        if (cause?.status === 401) {
          clearSessionState('expired')
          error.value = 'Збережений сеанс недійсний або завершився. Увійдіть знову.'
          return false
        }

        accessToken.value = null
        user.value = null
        status.value = 'unavailable'
        error.value =
          'Не вдалося перевірити сеанс через помилку мережі. Перевірте з’єднання та повторіть спробу.'
        return false
      } finally {
        if (activeAuthController === controller) {
          activeAuthController = null
        }
        if (activeRestorePromise === promise) {
          activeRestorePromise = null
        }
      }
    })()

    activeRestorePromise = promise
    return promise
  }

  async function request(path, options = {}) {
    const versionAtStart = sessionVersion.value
    const tokenAtStart = accessToken.value

    if (!tokenAtStart) {
      clearSessionState('expired')
      const err = new Error('Сеанс відсутній.')
      err.status = 401
      throw err
    }

    try {
      return await requestJson(path, {
        ...options,
        token: tokenAtStart,
      })
    } catch (cause) {
      if (
        cause?.status === 401 &&
        sessionVersion.value === versionAtStart &&
        accessToken.value === tokenAtStart
      ) {
        clearSessionState('expired')
        error.value = 'Сеанс завершився (HTTP 401). Увійдіть повторно.'
      }
      throw cause
    }
  }

  function logout() {
    clearSessionState('logout')
  }

  function $reset() {
    clearSessionState(null)
  }

  return {
    accessToken,
    user,
    status,
    error,
    endReason,
    sessionVersion,
    isAuthenticated,
    isBusy,
    displayName,
    login,
    restore,
    request,
    logout,
    $reset,
  }
})