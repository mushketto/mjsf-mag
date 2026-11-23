<script setup>
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import Breadcrumbs from '../components/Breadcrumbs.vue'
import { useBreadcrumbs } from '../composables/useBreadcrumbs.js'
import { usePrivateResource } from '../composables/usePrivateResource.js'
import { useProductsStore } from '../stores/products.js'

const PAGE_SIZE = 12

const productsStore = useProductsStore()
const breadcrumbs = useBreadcrumbs()

const skip = ref(0)

const resourcePath = computed(
  () => `/auth/products?limit=${PAGE_SIZE}&skip=${skip.value}`,
)

const { data, error, isLoading, refetch } = usePrivateResource(resourcePath)

const priceFormatter = new Intl.NumberFormat('uk-UA', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
})

const total = computed(() => Number(data.value?.total ?? 0))

const items = computed(() => {
  const rawList = Array.isArray(data.value?.products) ? data.value.products : []
  return rawList.map((product) => productsStore.applyConfirmedChanges(product))
})

const currentPage = computed(() => Math.floor(skip.value / PAGE_SIZE) + 1)
const totalPages = computed(() =>
  total.value > 0 ? Math.ceil(total.value / PAGE_SIZE) : 1,
)
const hasPrev = computed(() => skip.value > 0)
const hasNext = computed(() => skip.value + PAGE_SIZE < total.value)

function goPrev() {
  if (isLoading.value || !hasPrev.value) {
    return
  }
  skip.value = Math.max(0, skip.value - PAGE_SIZE)
}

function goNext() {
  if (isLoading.value || !hasNext.value) {
    return
  }
  skip.value += PAGE_SIZE
}
</script>

<template>
  <section class="manage-list">
    <Breadcrumbs :items="breadcrumbs" />

    <div class="manage-list__header">
      <div>
        <h1 class="manage-list__title">Керування товарами</h1>
        <p class="manage-list__meta">
          Сторінка {{ currentPage }} із {{ totalPages }} · Всього товарів: {{ total }}
        </p>
      </div>

      <div class="manage-pagination">
        <button
          type="button"
          class="btn btn--secondary"
          :disabled="isLoading || !hasPrev"
          @click="goPrev"
        >
          ← Попередня
        </button>
        <button
          type="button"
          class="btn btn--secondary"
          :disabled="isLoading || !hasNext"
          @click="goNext"
        >
          Наступна →
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="product-detail__loading" aria-live="polite">
      <p class="catalog__message-index">LOADING / AUTH</p>
      <h2 class="catalog__message-title">Завантажуємо приватний список…</h2>
    </div>

    <div v-else-if="error" class="catalog__message catalog__message--error" role="alert">
      <p class="catalog__message-index">ERR / AUTH API</p>
      <h2 class="catalog__message-title">Не вдалося завантажити список</h2>
      <p class="catalog__message-text">{{ error.message }}</p>
      <button type="button" class="btn btn--primary" @click="refetch">
        Повторити запит
      </button>
    </div>

    <div v-else class="manage-table-wrap">
      <ul class="manage-rows">
        <li v-for="item in items" :key="item.id" class="manage-row">
          <div class="manage-row__main">
            <span class="manage-row__id">#{{ item.id }}</span>
            <strong class="manage-row__title">
              {{ item.title }}
              <span
                v-if="productsStore.getOverride(item.id)"
                class="manage-row__badge"
              >
                Змінено в сеансі
              </span>
            </strong>
          </div>

          <div class="manage-row__meta">
            <span class="manage-row__price">{{ priceFormatter.format(item.price) }}</span>
            <span class="manage-row__stock">Залишок: {{ item.stock }}</span>
          </div>

          <div class="manage-row__actions">
            <RouterLink
              class="btn btn--secondary"
              :to="{ name: 'product-overview', params: { id: String(item.id) } }"
            >
              Переглянути
            </RouterLink>
            <RouterLink
              class="btn btn--primary"
              :to="{ name: 'manage-edit', params: { id: String(item.id) } }"
            >
              Редагувати
            </RouterLink>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>