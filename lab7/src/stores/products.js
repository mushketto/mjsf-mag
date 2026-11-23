import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useAuthStore } from './auth.js'

export const useProductsStore = defineStore('products', () => {
  const overridesById = ref({})
  const savingIds = ref({})
  const saveError = ref(null)

  const activeControllers = new Map()
  let saveCounter = 0

  const hasConfirmedChanges = computed(
    () => Object.keys(overridesById.value).length > 0,
  )

  function isSaving(id) {
    return Boolean(savingIds.value[String(id)])
  }

  function getOverride(id) {
    return overridesById.value[String(id)] ?? null
  }

  function applyConfirmedChanges(product) {
    if (!product || product.id == null) {
      return product
    }

    const override = overridesById.value[String(product.id)]
    if (!override) {
      return product
    }

    return {
      ...product,
      ...override,
    }
  }

  async function save(id, draftPayload) {
    const key = String(id)
    if (savingIds.value[key]) {
      return { ok: false, reason: 'busy' }
    }

    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) {
      return { ok: false, reason: 'unauthenticated' }
    }

    const sessionVersionAtStart = authStore.sessionVersion
    const operationId = ++saveCounter
    const controller = new AbortController()
    activeControllers.set(key, { controller, operationId })

    savingIds.value = { ...savingIds.value, [key]: true }
    saveError.value = null

    const body = {
      title: draftPayload.title,
      price: draftPayload.price,
      stock: draftPayload.stock,
      description: draftPayload.description,
    }

    try {
      const updated = await authStore.request(`/auth/products/${key}`, {
        method: 'PATCH',
        body,
        signal: controller.signal,
      })

      const currentEntry = activeControllers.get(key)
      const isCurrentOperation =
        currentEntry && currentEntry.operationId === operationId
      const isSameActiveSession =
        authStore.isAuthenticated &&
        authStore.sessionVersion === sessionVersionAtStart

      if (!isCurrentOperation || controller.signal.aborted || !isSameActiveSession) {
        return { ok: false, reason: 'stale' }
      }

      const confirmedFields = {
        title: typeof updated?.title === 'string' ? updated.title : body.title,
        price: Number.isFinite(Number(updated?.price))
          ? Number(updated.price)
          : body.price,
        stock: Number.isInteger(Number(updated?.stock))
          ? Number(updated.stock)
          : body.stock,
        description:
          typeof updated?.description === 'string'
            ? updated.description
            : body.description,
      }

      overridesById.value = {
        ...overridesById.value,
        [key]: confirmedFields,
      }

      return { ok: true, data: confirmedFields }
    } catch (cause) {
      if (controller.signal.aborted || cause?.name === 'AbortError') {
        return { ok: false, reason: 'aborted' }
      }

      if (authStore.sessionVersion === sessionVersionAtStart) {
        saveError.value =
          cause instanceof Error ? cause.message : 'Не вдалося зберегти зміни'
      }

      return { ok: false, error: cause }
    } finally {
      const currentEntry = activeControllers.get(key)
      if (currentEntry && currentEntry.operationId === operationId) {
        activeControllers.delete(key)
      }

      const nextSaving = { ...savingIds.value }
      delete nextSaving[key]
      savingIds.value = nextSaving
    }
  }

  function reset() {
    for (const { controller } of activeControllers.values()) {
      controller.abort()
    }
    activeControllers.clear()
    saveCounter += 1
    overridesById.value = {}
    savingIds.value = {}
    saveError.value = null
  }

  function $reset() {
    reset()
  }

  return {
    overridesById,
    savingIds,
    saveError,
    hasConfirmedChanges,
    isSaving,
    getOverride,
    applyConfirmedChanges,
    save,
    reset,
    $reset,
  }
})