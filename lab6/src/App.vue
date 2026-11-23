<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <main class="storefront">
    <header class="storefront__masthead">
      <RouterLink
        class="storefront__brand"
        :to="{ name: 'products' }"
        aria-label="Forma, до каталогу"
      >
        FORMA<span class="storefront__brand-mark">®</span>
      </RouterLink>

      <nav class="storefront__nav" aria-label="Основна навігація">
        <RouterLink class="storefront__nav-link" :to="{ name: 'products' }">
          Каталог
        </RouterLink>
        <RouterLink class="storefront__nav-link" :to="{ name: 'about' }">
          Про застосунок
        </RouterLink>
      </nav>

      <p class="storefront__edition"></p>
    </header>

    <RouterView />

    <footer class="storefront__footer">
      <p>Студент: Беркман Дмитро · 7.F2.25-2 · Windows 11, Node.js 24 LTS, Vue 3, Vue Router 4.6.4</p>
      <a href="https://dummyjson.com/docs/products" target="_blank" rel="noreferrer">
        Дані: DummyJSON
      </a>
    </footer>
  </main>
</template>