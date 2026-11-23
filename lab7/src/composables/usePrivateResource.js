import { onScopeDispose, ref, toValue, watch } from 'vue'
import { useAuthStore } from '../stores/auth.js'

export function usePrivateResource(pathSource) {
  const authStore = useAuthStore()

  const data = ref(null)
  const error = ref(null)
  const isLoading = ref(false)
  const reloadToken = ref(0)

  let activeController = null
  let isDisposed = false

  function abort() {
    if (activeController) {
      activeController.abort()
      activeController = null
    }
    isLoading.value = false
  }

  function refetch() {
    reloadToken.value += 1
  }

  watch(
    [() => toValue(pathSource), reloadToken, () => authStore.isAuthenticated],
    async ([currentPath, _token, isAuthed], _prev, onCleanup) => {
      if (activeController) {
        activeController.abort()
        activeController = null
      }

      data.value = null
      error.value = null

      if (!currentPath || !isAuthed) {
        isLoading.value = false
        return
      }

      const controller = new AbortController()
      activeController = controller

      onCleanup(() => {
        controller.abort()
        if (activeController === controller) {
          activeController = null
        }
      })

      isLoading.value = true

      try {
        const payload = await authStore.request(currentPath, {
          method: 'GET',
          signal: controller.signal,
        })

        if (!isDisposed && activeController === controller && !controller.signal.aborted) {
          data.value = payload
        }
      } catch (cause) {
        if (isDisposed || controller.signal.aborted || cause?.name === 'AbortError') {
          return
        }

        if (activeController === controller) {
          error.value = cause instanceof Error ? cause : new Error(String(cause))
        }
      } finally {
        if (!isDisposed && activeController === controller) {
          isLoading.value = false
          activeController = null
        }
      }
    },
    { immediate: true },
  )

  onScopeDispose(() => {
    isDisposed = true
    abort()
  })

  return {
    data,
    error,
    isLoading,
    abort,
    refetch,
  }
}