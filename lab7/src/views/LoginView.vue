<script setup>
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Breadcrumbs from '../components/Breadcrumbs.vue'
import { useBreadcrumbs } from '../composables/useBreadcrumbs.js'
import { resolveSafeRedirect } from '../router/guards.js'
import { useAuthStore } from '../stores/auth.js'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { status, error, isBusy, isAuthenticated, displayName } = storeToRefs(authStore)
const breadcrumbs = useBreadcrumbs()

const username = ref('emilys')
const password = ref('')
const localError = ref('')

function navigateToTarget() {
  const target = resolveSafeRedirect(router, route.query.redirect)
  return router.replace(target)
}

async function handleSubmit() {
  if (isBusy.value) {
    return
  }

  localError.value = ''
  const trimmedUsername = username.value.trim()
  const submittedPassword = password.value

  if (!trimmedUsername || !submittedPassword) {
    localError.value = 'Введіть ім’я користувача та пароль.'
    return
  }

  // Очищуємо пароль у локальному стані після передавання до action
  password.value = ''

  const success = await authStore.login({
    username: trimmedUsername,
    password: submittedPassword,
  })

  if (success) {
    await navigateToTarget()
  }
}

async function handleRetryRestore() {
  if (isBusy.value) {
    return
  }

  const restored = await authStore.restore(true)
  if (restored) {
    await navigateToTarget()
  }
}
</script>

<template>
  <section class="auth-page">
    <Breadcrumbs :items="breadcrumbs" />

    <div class="auth-card">
      <p class="storefront__eyebrow">Приватний доступ</p>
      <h1 class="auth-card__title">Вхід до керування товарами</h1>

      <div
        v-if="status === 'unavailable'"
        class="auth-card__alert auth-card__alert--warning"
        role="alert"
      >
        <p>{{ error }}</p>
        <button
          type="button"
          class="btn btn--secondary"
          :disabled="isBusy"
          @click="handleRetryRestore"
        >
          {{ isBusy ? 'Перевіряємо сеанс…' : 'Повторити перевірку сеансу' }}
        </button>
      </div>

      <div v-else-if="isAuthenticated" class="auth-card__alert" role="status">
        <p>Ви вже увійшли як <strong>{{ displayName }}</strong>.</p>
        <button
          type="button"
          class="btn btn--primary"
          @click="navigateToTarget"
        >
          Перейти до керування
        </button>
      </div>

      <form class="auth-form" novalidate @submit.prevent="handleSubmit">
        <div class="form-field">
          <label class="form-field__label" for="login-username">
            Ім’я користувача
          </label>
          <input
            id="login-username"
            v-model="username"
            class="form-field__input"
            type="text"
            autocomplete="username"
            :disabled="isBusy"
            required
          />
        </div>

        <div class="form-field">
          <label class="form-field__label" for="login-password">
            Пароль
          </label>
          <input
            id="login-password"
            v-model="password"
            class="form-field__input"
            type="password"
            autocomplete="current-password"
            placeholder="Введіть пароль"
            :disabled="isBusy"
            required
          />
        </div>

        <p
          v-if="localError || (error && status !== 'unavailable')"
          class="form-field__error"
          role="alert"
        >
          {{ localError || error }}
        </p>

        <p class="auth-card__hint">
          Навчальний обліковий запис DummyJSON: <code>emilys</code> / <code>emilyspass</code>
        </p>

        <button
          type="submit"
          class="btn btn--primary"
          :disabled="isBusy"
        >
          {{ status === 'signing-in' ? 'Виконується вхід…' : 'Увійти' }}
        </button>
      </form>
    </div>
  </section>
</template>