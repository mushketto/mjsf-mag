<script setup>
import { RouterLink } from 'vue-router'

defineProps({
  items: {
    type: Array,
    required: true,
  },
})
</script>

<template>
  <nav v-if="items.length" class="breadcrumbs" aria-label="Хлібні крихти">
    <ol class="breadcrumbs__list">
      <li
        v-for="(item, index) in items"
        :key="`${item.to?.name ?? 'crumb'}-${index}`"
        class="breadcrumbs__item"
      >
        <template v-if="index < items.length - 1">
          <RouterLink class="breadcrumbs__link" :to="item.to">
            {{ item.label }}
          </RouterLink>
          <span class="breadcrumbs__separator" aria-hidden="true">/</span>
        </template>

        <span
          v-else
          class="breadcrumbs__current"
          aria-current="page"
        >
          {{ item.label }}
        </span>
      </li>
    </ol>
  </nav>
</template>