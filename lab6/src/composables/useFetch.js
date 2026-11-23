import { onScopeDispose, ref, toValue, watchEffect } from 'vue'

export function useFetch(url) {
  const data = ref(null)
  const error = ref(null)
  const isLoading = ref(false)
  const reloadToken = ref(0)

  let activeController = null

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

  watchEffect(async (onCleanup) => {
    const currentUrl = toValue(url)
    void reloadToken.value

    if (activeController) {
      activeController.abort()
    }

    data.value = null
    error.value = null

    if (!currentUrl) {
      activeController = null
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
      const response = await fetch(currentUrl, {
        signal: controller.signal,
      })

      if (!response.ok) {
        const httpError = new Error(`HTTP ${response.status}`)
        httpError.status = response.status
        throw httpError
      }

      const payload = await response.json()

      if (activeController === controller && !controller.signal.aborted) {
        data.value = payload
      }
    } catch (cause) {
      if (controller.signal.aborted || cause?.name === 'AbortError') {
        return
      }

      if (activeController === controller) {
        const normalizedError =
          cause instanceof Error ? cause : new Error(String(cause))
        error.value = normalizedError
      }
    } finally {
      if (activeController === controller) {
        isLoading.value = false
        activeController = null
      }
    }
  })

  onScopeDispose(abort)

  return {
    data,
    error,
    isLoading,
    abort,
    refetch,
  }
}