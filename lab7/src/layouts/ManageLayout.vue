<script setup>
import { storeToRefs } from 'pinia'
import { watch } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const authStore = useAuthStore()
const { isAuthenticated, endReason } = storeToRefs(authStore)

const route = useRoute()
const router = useRouter()

watch(isAuthenticated, (authed) => {
  if (!authed && route.meta.requiresAuth) {
    if (endReason.value === 'expired') {
      router.replace({
        name: 'login',
        query: { redirect: route.fullPath },
      })
    } else {
      router.replace({ name: 'products' })
    }
  }
})
</script>

<template>
  <section v-if="isAuthenticated" class="manage-shell">
    <p class="manage-shell__notice" role="status">
      Навчальна модель DummyJSON: підтверджені зміни товарів зберігаються у Pinia лише в межах
      поточного сеансу та скидаються після оновлення сторінки (reload) або виходу.
    </p>

    <RouterView />
  </section>
</template>