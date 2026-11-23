<script setup>
import { computed, ref, watch } from 'vue'
import {
  API_DELAY,
  API_LIMIT,
  createProductsUrl,
} from './api/products.js'
import CatalogLoadMore from './components/CatalogLoadMore.vue'
import ProductCatalog from './components/ProductCatalog.vue'
import ProductSearchForm from './components/ProductSearchForm.vue'
import { useDebouncedValue } from './composables/useDebouncedValue.js'
import { useFetch } from './composables/useFetch.js'

const query = ref('')
const debouncedQuery = useDebouncedValue(query, 400)

const skip = ref(0)
const products = ref([])
const total = ref(0)

const requestUrl = computed(() =>
  createProductsUrl(debouncedQuery.value, skip.value),
)

const { data, error, isLoading, abort, refetch } = useFetch(requestUrl)

// Немедленная отмена активного запроса при изменении сырого поля поиска
watch(
  query,
  () => {
    abort()
  },
  { flush: 'sync' },
)

// Синхронный сброс пагинации и накопленного списка при смене отложенного запроса
watch(
  debouncedQuery,
  () => {
    skip.value = 0
    products.value = []
    total.value = 0
  },
  { flush: 'sync' },
)

// Объединение страниц без мутации ответа API и без дублирования id
watch(data, (page) => {
  if (!page || !Array.isArray(page.products)) {
    return
  }

  total.value = page.total

  if (skip.value === 0) {
    products.value = [...page.products]
    return
  }

  const existingIds = new Set(products.value.map((item) => item.id))
  const uniqueNext = page.products.filter((item) => !existingIds.has(item.id))
  products.value = [...products.value, ...uniqueNext]
})

const hasMore = computed(() => products.value.length < total.value)
const isDebouncePending = computed(() => query.value !== debouncedQuery.value)
const catalogHeading = computed(() => {
  const trimmed = debouncedQuery.value.trim()
  return trimmed ? `Результати для «${trimmed}»` : 'Початкова добірка'
})

function loadMore() {
  if (!hasMore.value || isLoading.value || isDebouncePending.value || error.value) {
    return
  }
  skip.value += API_LIMIT
}
</script>

<template>
  <main class="storefront">
    <header class="storefront__masthead">
      <a class="storefront__brand" href="#" aria-label="Forma, на початок">
        FORMA<span class="storefront__brand-mark">®</span>
      </a>
      <p class="storefront__edition">Лабораторна / 05</p>
      <p class="storefront__note">Каталог і composables</p>
    </header>

    <section class="storefront__hero">
      <div class="storefront__intro">
        <p class="storefront__eyebrow">Каталог із composables</p>
        <h1 class="storefront__title">
          Речі з ясною
          <em class="storefront__title-accent">формою</em>
        </h1>
      </div>

      <ProductSearchForm
        v-model="query"
        :is-loading="isLoading"
        :error="error"
        :loaded="products.length"
        :total="total"
        :api-delay="API_DELAY"
      />
    </section>

    <section class="catalog" aria-labelledby="catalog-title">
      <div class="catalog__heading">
        <h2 id="catalog-title" class="catalog__title">{{ catalogHeading }}</h2>
        <span class="catalog__count">{{ products.length.toString().padStart(2, '0') }}</span>
      </div>

      <ProductCatalog
        :products="products"
        :is-loading="isLoading"
        :error="error"
        @retry="refetch"
      />

      <CatalogLoadMore
        v-if="products.length"
        :loaded="products.length"
        :total="total"
        :is-loading="isLoading"
        :error="error"
        :has-more="hasMore"
        @load-more="loadMore"
        @retry="refetch"
      />
    </section>

    <footer class="storefront__footer">
      <p>Студент: Беркман Дмитро · Група 7.F2.25-2 · Windows 11, Node.js 24 LTS, Vue 3, Vite</p>
      <a href="https://dummyjson.com/docs/products" target="_blank" rel="noreferrer">
        Дані: DummyJSON
      </a>
    </footer>
  </main>
</template>