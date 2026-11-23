<script setup>
import { ref } from 'vue'
import { useIntersectionObserver } from '../composables/useIntersectionObserver.js'

const props = defineProps({
  loaded: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: Object,
    default: null,
  },
  hasMore: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['load-more', 'retry'])

const sentinelRef = ref(null)

useIntersectionObserver(
  sentinelRef,
  () => {
    if (props.hasMore && !props.isLoading && !props.error) {
      emit('load-more')
    }
  },
  {
    rootMargin: '280px 0px',
    threshold: 0.01,
  },
)
</script>

<template>
  <div ref="sentinelRef" class="catalog__load-more">
    <span class="catalog__load-progress">{{ loaded }} / {{ total }}</span>

    <div v-if="isLoading" class="catalog__load-copy">
      <strong class="catalog__load-title">Дозавантажуємо наступну сторінку…</strong>
      <span class="catalog__load-text">
        Попередні товари залишаються на екрані
      </span>
    </div>

    <div v-else-if="error" class="catalog__load-copy">
      <strong class="catalog__load-title">Не вдалося дозавантажити сторінку</strong>
      <span class="catalog__load-text">{{ error.message }}</span>
      <button class="catalog__retry" type="button" @click="emit('retry')">
        Повторити запит
      </button>
    </div>

    <div v-else-if="hasMore" class="catalog__load-copy">
      <strong class="catalog__load-title">Гортайте нижче для дозавантаження</strong>
      <span class="catalog__load-text">
        Наступні товари підтягнуться автоматично при наближенні до кінця списку
      </span>
    </div>

    <div v-else class="catalog__load-copy">
      <strong class="catalog__load-title">Усі товари завантажено</strong>
      <span class="catalog__load-text">
        Показано повний список результатів за поточним запитом
      </span>
    </div>
  </div>
</template>