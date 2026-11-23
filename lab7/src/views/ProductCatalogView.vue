<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  API_DELAY,
  API_LIMIT,
  createProductsUrl,
} from '../api/products.js'
import Breadcrumbs from '../components/Breadcrumbs.vue'
import CatalogLoadMore from '../components/CatalogLoadMore.vue'
import ProductCatalog from '../components/ProductCatalog.vue'
import ProductSearchForm from '../components/ProductSearchForm.vue'
import { useBreadcrumbs } from '../composables/useBreadcrumbs.js'
import { useDebouncedValue } from '../composables/useDebouncedValue.js'
import { useFetch } from '../composables/useFetch.js'

import { useProductsStore } from '../stores/products.js'
const productsStore = useProductsStore()
const displayedProducts = computed(() =>
  products.value.map((item) => productsStore.applyConfirmedChanges(item)),
)

const route = useRoute()
const router = useRouter()
const breadcrumbs = useBreadcrumbs()

const confirmedQuery = computed(() =>
  typeof route.query.q === 'string' ? route.query.q.trim() : '',
)

const query = ref(confirmedQuery.value)
const editVersion = ref(0)
let lastHandledVersion = 0
let isSyncingFromRoute = false

const debouncedEdit = useDebouncedValue(
  () => ({ text: query.value, version: editVersion.value }),
  400,
)

const skip = ref(0)
const products = ref([])
const total = ref(0)

const requestUrl = computed(() =>
  createProductsUrl(confirmedQuery.value, skip.value),
)

const { data, error, isLoading, abort, refetch } = useFetch(requestUrl)

watch(
  query,
  () => {
    if (isSyncingFromRoute) {
      return
    }
    abort()
    editVersion.value += 1
  },
  { flush: 'sync' },
)

watch(debouncedEdit, (edit) => {
  if (edit.version <= lastHandledVersion) {
    return
  }

  lastHandledVersion = edit.version
  const nextQuery = edit.text.trim()

  if (nextQuery !== confirmedQuery.value) {
    router.replace({
      name: 'products',
      query: nextQuery ? { q: nextQuery } : {},
    })
  } else {
    refetch()
  }
})

watch(
  confirmedQuery,
  (nextConfirmed) => {
    isSyncingFromRoute = true
    lastHandledVersion = editVersion.value
    query.value = nextConfirmed
    skip.value = 0
    products.value = []
    total.value = 0
    isSyncingFromRoute = false
  },
  { flush: 'sync' },
)

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
const isDebouncePending = computed(
  () => editVersion.value > lastHandledVersion,
)
const catalogHeading = computed(() =>
  confirmedQuery.value ? `Результати для «${confirmedQuery.value}»` : 'Початкова добірка',
)

function loadMore() {
  if (!hasMore.value || isLoading.value || isDebouncePending.value || error.value) {
    return
  }
  skip.value += API_LIMIT
}
</script>

<template>
  <Breadcrumbs :items="breadcrumbs" />

  <section class="storefront__hero">
    <div class="storefront__intro">
      <p class="storefront__eyebrow">Каталог із маршрутизацією</p>
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
      :products="displayedProducts"
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
</template>