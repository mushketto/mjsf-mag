<script setup>
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { createProductUrl, isValidProductId } from '../api/products.js'
import Breadcrumbs from '../components/Breadcrumbs.vue'
import { useBreadcrumbs } from '../composables/useBreadcrumbs.js'
import { useFetch } from '../composables/useFetch.js'
import { useProductsStore } from '../stores/products.js'

const route = useRoute()
const productsStore = useProductsStore()

const priceFormatter = new Intl.NumberFormat('uk-UA', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
})

const currentId = computed(() => String(route.params.id ?? ''))
const isInvalidId = computed(() => !isValidProductId(currentId.value))
const productUrl = computed(() =>
  isInvalidId.value ? null : createProductUrl(currentId.value),
)

const { data: rawProduct, error, isLoading, refetch } = useFetch(productUrl)

const product = computed(() =>
  rawProduct.value ? productsStore.applyConfirmedChanges(rawProduct.value) : null,
)

const isNotFound = computed(
  () => isInvalidId.value || error.value?.status === 404,
)

const breadcrumbTitle = computed(() => {
  if (isNotFound.value) {
    return 'Товар не знайдено'
  }
  if (product.value?.title) {
    return product.value.title
  }
  return `Товар №${currentId.value}`
})

const breadcrumbs = useBreadcrumbs(breadcrumbTitle)

const preservedQuery = computed(() =>
  typeof route.query.q === 'string' && route.query.q.trim()
    ? { q: route.query.q.trim() }
    : {},
)

const catalogLink = computed(() => ({
  name: 'products',
  query: preservedQuery.value,
}))

const overviewLink = computed(() => ({
  name: 'product-overview',
  params: { id: currentId.value },
  query: preservedQuery.value,
}))

const reviewsLink = computed(() => ({
  name: 'product-reviews',
  params: { id: currentId.value },
  query: preservedQuery.value,
}))
</script>

<template>
  <section class="product-detail">
    <Breadcrumbs :items="breadcrumbs" />

    <div v-if="isNotFound" class="catalog__message catalog__message--error">
      <p class="catalog__message-index">404 / PRODUCT</p>
      <h1 class="catalog__message-title">Товар не знайдено</h1>
      <p class="catalog__message-text">
        Товар з ідентифікатором «{{ currentId }}» не існує або має некоректний формат.
      </p>
      <RouterLink class="catalog__retry" :to="catalogLink">
        Повернутися до каталогу
      </RouterLink>
    </div>

    <div v-else-if="isLoading" class="product-detail__loading" aria-live="polite">
      <p class="catalog__message-index">LOADING / #{{ currentId }}</p>
      <h1 class="catalog__message-title">Завантажуємо товар №{{ currentId }}…</h1>
      <p class="catalog__message-text">Очікуємо відповідь від DummyJSON API.</p>
    </div>

    <div v-else-if="error" class="catalog__message catalog__message--error">
      <p class="catalog__message-index">ERR / API</p>
      <h1 class="catalog__message-title">Не вдалося завантажити товар №{{ currentId }}</h1>
      <p class="catalog__message-text">{{ error.message }}</p>
      <button class="catalog__retry" type="button" @click="refetch">
        Повторити запит
      </button>
    </div>

    <article v-else-if="product" class="product-detail__shell">
      <div class="product-detail__summary">
        <div class="product-detail__visual">
          <span
            v-if="product.discountPercentage >= 10"
            class="product-card__discount"
          >
            −{{ Math.round(product.discountPercentage) }}%
          </span>
          <img
            class="product-detail__image"
            :src="product.thumbnail"
            :alt="product.title"
            width="480"
            height="360"
          />
        </div>

        <div class="product-detail__info">
          <div class="product-card__meta">
            <span class="product-card__category">{{ product.category }}</span>
            <span class="product-card__rating">
              {{ Number(product.rating).toFixed(1) }} / 5
            </span>
          </div>

          <h1 class="product-detail__title">{{ product.title }}</h1>

          <div class="product-detail__pricing">
            <strong class="product-detail__price">
              {{ priceFormatter.format(product.price) }}
            </strong>
            <span class="product-card__stock">
              {{ product.stock > 0 ? `У наявності · ${product.stock}` : 'Немає в наявності' }}
            </span>
          </div>

          <nav class="product-subnav" aria-label="Розділи товару">
            <RouterLink class="product-subnav__link" :to="overviewLink">
              Огляд
            </RouterLink>
            <RouterLink class="product-subnav__link" :to="reviewsLink">
              Відгуки ({{ product.reviews?.length ?? 0 }})
            </RouterLink>
          </nav>
        </div>
      </div>

      <div class="product-detail__content">
        <RouterView v-slot="{ Component }">
          <component :is="Component" :product="product" />
        </RouterView>
      </div>
    </article>
  </section>
</template>