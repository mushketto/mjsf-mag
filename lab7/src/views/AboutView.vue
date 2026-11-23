<script setup>
import { RouterLink } from 'vue-router'
import Breadcrumbs from '../components/Breadcrumbs.vue'
import { useBreadcrumbs } from '../composables/useBreadcrumbs.js'

const breadcrumbs = useBreadcrumbs()
</script>

<template>
  <section class="about-page">
    <Breadcrumbs :items="breadcrumbs" />

    <div class="about-page__card">
      <p class="storefront__eyebrow">Лабораторна робота №6</p>
      <h1 class="about-page__title">Про застосунок</h1>
      <p class="about-page__text">
        Односторінковий каталог товарів на базі Vue 3 (Composition API) та Vue Router 4.6.4
        із вкладеними маршрутами, реактивним завантаженням за параметром id, хлібними крихтами
        з метаданих маршрутизатора та синхронізацією пошуку з query-параметром адреси.
      </p>
      <ul class="about-page__list">
        <li>Середовище: Windows 11 · Node.js 24 LTS · Vue 3 · Vue Router 4.6.4 · Vite</li>
        <li>Джерело даних: публічний API DummyJSON</li>
        <li>Навігація: HTML5 History Mode (createWebHistory)</li>
      </ul>
      <RouterLink class="catalog__retry" :to="{ name: 'products' }">
        Перейти до каталогу
      </RouterLink>
    </div>
  </section>
</template>