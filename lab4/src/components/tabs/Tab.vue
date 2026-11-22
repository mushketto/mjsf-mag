<script setup>
import { inject, onMounted, onBeforeUnmount, computed } from 'vue'
import { tabsKey } from './tabsKey'

const props = defineProps({
  slug: { type: String, required: true },
  title: { type: String, required: true },
  disabled: { type: Boolean, default: false },
  panel: { type: [Object, String], default: null },
  panelProps: { type: Object, default: () => ({}) }
})

const tabsContext = inject(tabsKey)

if (!tabsContext) {
  throw new Error('Компонент <Tab> повинен використовуватися всередині <Tabs>')
}

const { activeSlug, idPrefix, registerTab, unregisterTab } = tabsContext

const isActive = computed(() => activeSlug.value === props.slug)

onMounted(() => {
  registerTab({
    slug: props.slug,
    title: props.title,
    disabled: props.disabled
  })
})

onBeforeUnmount(() => {
  unregisterTab(props.slug)
})
</script>

<template>
  <section
    :id="`${idPrefix}-panel-${slug}`"
    v-show="isActive"
    class="tabs__panel"
    role="tabpanel"
    :aria-labelledby="`${idPrefix}-tab-${slug}`"
    tabindex="0"
  >
    <KeepAlive>
      <slot v-if="isActive && $slots.default" :is-active="isActive" />
      <component v-else-if="isActive" :is="panel" v-bind="panelProps" />
    </KeepAlive>
  </section>
</template>

<style scoped>
.tabs__panel {
}
.tabs__panel:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
  border-radius: 0.5rem;
}
</style>