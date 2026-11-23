<script setup>
import { storeToRefs } from 'pinia'
import { RouterLink, RouterView } from 'vue-router'
import { useAuthStore } from './stores/auth.js'
import { useProductsStore } from './stores/products.js'

const authStore = useAuthStore()
useProductsStore()

const { isAuthenticated, displayName, isBusy } = storeToRefs(authStore)

function handleLogout() {
  authStore.logout()
}
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
        <RouterLink class="storefront__nav-link" :to="{ name: 'manage-products' }">
          Керування
        </RouterLink>
        <RouterLink class="storefront__nav-link" :to="{ name: 'about' }">
          Про застосунок
        </RouterLink>
        
      </nav>

      <div class="storefront__auth">
        <template v-if="isAuthenticated">
          <span class="storefront__user">{{ displayName }}</span>
          <button
            type="button"
            class="btn btn--secondary btn--compact"
            :disabled="isBusy"
            @click="handleLogout"
          >
            Вийти
          </button>
        </template>
        <RouterLink
          v-else
          class="btn btn--secondary btn--compact"
          :to="{ name: 'login' }"
        >
          Увійти
        </RouterLink>
      </div>
    </header>

    <RouterView />

    <footer class="storefront__footer">
      <p>
        Студент: Беркман Дмитро · 7.F2.25-2 · Windows 11, Node.js 24 LTS, Vue 3.5.43,
        Vue Router 4.6.4, Pinia 3.0.4
      </p>
      <a href="https://dummyjson.com/docs/products" target="_blank" rel="noreferrer">
        Дані: DummyJSON
      </a>
    </footer>
  </main>
</template>