<script setup>
import { RouterLink, useRoute } from 'vue-router'
import Breadcrumbs from '../components/Breadcrumbs.vue'
import { useBreadcrumbs } from '../composables/useBreadcrumbs.js'

const route = useRoute()
const breadcrumbs = useBreadcrumbs()
</script>

<template>
  <section class="not-found-page">
    <Breadcrumbs :items="breadcrumbs" />

    <div class="catalog__message catalog__message--error">
      <p class="catalog__message-index">404 / NOT FOUND</p>
      <h1 class="catalog__message-title">Сторінку не знайдено</h1>
      <p class="catalog__message-text">
        Адреса «{{ route.fullPath }}» не відповідає жодному маршруту застосунку.
      </p>
      <RouterLink class="catalog__retry" :to="{ name: 'products' }">
        Повернутися до каталогу
      </RouterLink>
    </div>
  </section>
</template>