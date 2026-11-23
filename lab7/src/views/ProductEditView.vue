<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  onBeforeRouteLeave,
  onBeforeRouteUpdate,
  RouterLink,
  useRoute,
} from 'vue-router'
import {
  createProductDraft,
  isDraftDirty,
  validateProductDraft,
} from '../api/productDraft.js'
import { isValidProductId } from '../api/products.js'
import Breadcrumbs from '../components/Breadcrumbs.vue'
import { useBreadcrumbs } from '../composables/useBreadcrumbs.js'
import { usePrivateResource } from '../composables/usePrivateResource.js'
import { useAuthStore } from '../stores/auth.js'
import { useProductsStore } from '../stores/products.js'

const route = useRoute()
const authStore = useAuthStore()
const productsStore = useProductsStore()

const currentId = computed(() => String(route.params.id ?? ''))
const isInvalidId = computed(() => !isValidProductId(currentId.value))
const resourcePath = computed(() =>
  isInvalidId.value ? null : `/auth/products/${currentId.value}`,
)

const {
  data: rawProduct,
  error: loadError,
  isLoading,
  refetch,
} = usePrivateResource(resourcePath)

const confirmedProduct = computed(() =>
  rawProduct.value ? productsStore.applyConfirmedChanges(rawProduct.value) : null,
)

const isNotFound = computed(
  () => isInvalidId.value || loadError.value?.status === 404,
)

const breadcrumbTitle = computed(() => {
  if (isNotFound.value) {
    return 'Товар не знайдено'
  }
  if (confirmedProduct.value?.title) {
    return confirmedProduct.value.title
  }
  return `Товар №${currentId.value}`
})

const breadcrumbs = useBreadcrumbs(breadcrumbTitle)

// Локальна чернетка та початкова копія підтверджених значень
const draft = ref(createProductDraft(null))
const initialDraft = ref(createProductDraft(null))
const fieldErrors = ref({})
const saveFeedback = ref('')
const saveErrorMessage = ref('')

const titleInputRef = ref(null)
const priceInputRef = ref(null)
const stockInputRef = ref(null)
const descriptionInputRef = ref(null)

const isSaving = computed(() => productsStore.isSaving(currentId.value))
const isDirty = computed(() =>
  Boolean(confirmedProduct.value) && isDraftDirty(draft.value, initialDraft.value),
)

function syncDraftFromConfirmed(product) {
  const snapshot = createProductDraft(product)
  draft.value = { ...snapshot }
  initialDraft.value = { ...snapshot }
  fieldErrors.value = {}
}

watch(rawProduct, (loaded) => {
  saveFeedback.value = ''
  saveErrorMessage.value = ''
  if (loaded) {
    syncDraftFromConfirmed(productsStore.applyConfirmedChanges(loaded))
  } else {
    syncDraftFromConfirmed(null)
  }
})

async function focusFirstInvalidField(errors) {
  await nextTick()
  const fieldOrder = [
    ['title', titleInputRef],
    ['price', priceInputRef],
    ['stock', stockInputRef],
    ['description', descriptionInputRef],
  ]

  for (const [key, inputRef] of fieldOrder) {
    if (errors[key] && inputRef.value) {
      inputRef.value.focus()
      return
    }
  }
}

async function handleSave() {
  if (isSaving.value || !confirmedProduct.value) {
    return
  }

  saveFeedback.value = ''
  saveErrorMessage.value = ''

  const validation = validateProductDraft(draft.value)
  fieldErrors.value = validation.errors

  if (!validation.isValid) {
    await focusFirstInvalidField(validation.errors)
    return
  }

  const result = await productsStore.save(currentId.value, validation.normalized)

  if (result.ok) {
    syncDraftFromConfirmed(confirmedProduct.value)
    saveFeedback.value = 'Зміни підтверджено API та збережено для поточного сеансу.'
  } else if (result.error) {
    saveErrorMessage.value =
      result.error instanceof Error
        ? result.error.message
        : 'Не вдалося зберегти зміни. Чернетку збережено.'
  }
}

function handleCancelChanges() {
  if (isSaving.value || !confirmedProduct.value) {
    return
  }
  syncDraftFromConfirmed(confirmedProduct.value)
  saveFeedback.value = ''
  saveErrorMessage.value = ''
}

function confirmLeaveIfDirty() {
  // Після завершення сеансу гард не повинен утримувати редактор
  if (!authStore.isAuthenticated || !isDirty.value) {
    return true
  }
  return window.confirm(
    'У формі є незбережені зміни. Вийти без збереження?',
  )
}

onBeforeRouteLeave(() => confirmLeaveIfDirty())
onBeforeRouteUpdate((to, from) => {
  if (to.params.id === from.params.id) {
    return true
  }
  return confirmLeaveIfDirty()
})

function handleBeforeUnload(event) {
  if (authStore.isAuthenticated && isDirty.value) {
    event.preventDefault()
    event.returnValue = ''
  }
}

onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})
</script>

<template>
  <section class="edit-page">
    <Breadcrumbs :items="breadcrumbs" />

    <div v-if="isNotFound" class="catalog__message catalog__message--error">
      <p class="catalog__message-index">404 / PRODUCT</p>
      <h1 class="catalog__message-title">Товар не знайдено</h1>
      <p class="catalog__message-text">
        Товар із ідентифікатором «{{ currentId }}» не існує або має некоректний формат.
      </p>
      <RouterLink class="btn btn--primary" :to="{ name: 'manage-products' }">
        До списку керування
      </RouterLink>
    </div>

    <div v-else-if="isLoading" class="product-detail__loading" aria-live="polite">
      <p class="catalog__message-index">LOADING / #{{ currentId }}</p>
      <h1 class="catalog__message-title">Завантажуємо товар №{{ currentId }}…</h1>
    </div>

    <div v-else-if="loadError" class="catalog__message catalog__message--error" role="alert">
      <p class="catalog__message-index">ERR / AUTH API</p>
      <h1 class="catalog__message-title">Не вдалося завантажити товар №{{ currentId }}</h1>
      <p class="catalog__message-text">{{ loadError.message }}</p>
      <button type="button" class="btn btn--primary" @click="refetch">
        Повторити запит
      </button>
    </div>

    <div v-else-if="confirmedProduct" class="edit-card">
      <div class="edit-card__header">
        <div>
          <p class="storefront__eyebrow">Редагування товару #{{ confirmedProduct.id }}</p>
          <h1 class="edit-card__title">{{ confirmedProduct.title }}</h1>
        </div>
        <div class="edit-card__links">
          <RouterLink
            class="btn btn--secondary"
            :to="{ name: 'product-overview', params: { id: String(confirmedProduct.id) } }"
          >
            Публічна сторінка
          </RouterLink>
          <RouterLink
            class="btn btn--secondary"
            :to="{ name: 'manage-products' }"
          >
            До списку
          </RouterLink>
        </div>
      </div>

      <form class="edit-form" novalidate @submit.prevent="handleSave">
        <div class="form-field">
          <label class="form-field__label" for="edit-title">
            Назва товару (1–120 символів)
          </label>
          <input
            id="edit-title"
            ref="titleInputRef"
            v-model="draft.title"
            class="form-field__input"
            type="text"
            :disabled="isSaving"
            :aria-invalid="Boolean(fieldErrors.title)"
            :aria-describedby="fieldErrors.title ? 'edit-title-error' : undefined"
          />
          <p v-if="fieldErrors.title" id="edit-title-error" class="form-field__error" role="alert">
            {{ fieldErrors.title }}
          </p>
        </div>

        <div class="edit-form__grid">
          <div class="form-field">
            <label class="form-field__label" for="edit-price">
              Ціна (USD, &gt; 0)
            </label>
            <input
              id="edit-price"
              ref="priceInputRef"
              v-model="draft.price"
              class="form-field__input"
              type="text"
              inputmode="decimal"
              :disabled="isSaving"
              :aria-invalid="Boolean(fieldErrors.price)"
              :aria-describedby="fieldErrors.price ? 'edit-price-error' : undefined"
            />
            <p v-if="fieldErrors.price" id="edit-price-error" class="form-field__error" role="alert">
              {{ fieldErrors.price }}
            </p>
          </div>

          <div class="form-field">
            <label class="form-field__label" for="edit-stock">
              Залишок (ціле число ≥ 0)
            </label>
            <input
              id="edit-stock"
              ref="stockInputRef"
              v-model="draft.stock"
              class="form-field__input"
              type="text"
              inputmode="numeric"
              :disabled="isSaving"
              :aria-invalid="Boolean(fieldErrors.stock)"
              :aria-describedby="fieldErrors.stock ? 'edit-stock-error' : undefined"
            />
            <p v-if="fieldErrors.stock" id="edit-stock-error" class="form-field__error" role="alert">
              {{ fieldErrors.stock }}
            </p>
          </div>
        </div>

        <div class="form-field">
          <label class="form-field__label" for="edit-description">
            Опис товару (1–2000 символів)
          </label>
          <textarea
            id="edit-description"
            ref="descriptionInputRef"
            v-model="draft.description"
            class="form-field__textarea"
            rows="5"
            :disabled="isSaving"
            :aria-invalid="Boolean(fieldErrors.description)"
            :aria-describedby="fieldErrors.description ? 'edit-description-error' : undefined"
          ></textarea>
          <p
            v-if="fieldErrors.description"
            id="edit-description-error"
            class="form-field__error"
            role="alert"
          >
            {{ fieldErrors.description }}
          </p>
        </div>

        <p v-if="saveErrorMessage" class="form-field__error" role="alert">
          Помилка збереження: {{ saveErrorMessage }}
        </p>

        <p v-if="saveFeedback" class="edit-form__success" role="status">
          {{ saveFeedback }}
        </p>

        <div class="edit-form__actions">
          <button
            type="submit"
            class="btn btn--primary"
            :disabled="isSaving"
          >
            {{ isSaving ? 'Зберігаємо…' : 'Зберегти зміни' }}
          </button>

          <button
            type="button"
            class="btn btn--secondary"
            :disabled="isSaving || !isDirty"
            @click="handleCancelChanges"
          >
            Скасувати зміни
          </button>
        </div>
      </form>
    </div>
  </section>
</template>