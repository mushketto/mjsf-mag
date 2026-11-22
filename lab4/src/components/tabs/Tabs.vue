<script setup>
import { ref, computed, provide, useId, onMounted, watch } from 'vue'
import { tabsKey } from './tabsKey'

const props = defineProps({
  modelValue: { type: String, required: true },
  variant: { type: String, default: 'underline' } 
})

const emit = defineEmits(['update:modelValue'])

const tabs = ref([])
const tabRefs = ref([])

const idPrefix = useId()

const activeSlug = computed(() => props.modelValue)

function setActiveTab(slug) {
  if (slug && slug !== activeSlug.value) {
    emit('update:modelValue', slug)
  }
}

function registerTab(tabDef) {
  if (tabs.value.some(t => t.slug === tabDef.slug)) {
    console.error(`Вкладка з дублюючим slug "${tabDef.slug}" вже існує.`)
    return
  }
  tabs.value.push(tabDef)
  
  if (!activeSlug.value && !tabDef.disabled) {
    setActiveTab(tabDef.slug)
  }
}

function unregisterTab(slug) {
  tabs.value = tabs.value.filter(t => t.slug !== slug)
  if (activeSlug.value === slug) {
    const firstAvailable = tabs.value.find(t => !t.disabled)
    if (firstAvailable) setActiveTab(firstAvailable.slug)
  }
}

provide(tabsKey, {
  activeSlug,
  idPrefix,
  setActiveTab,
  registerTab,
  unregisterTab
})

function handleKeydown(e, index) {
  const availableTabs = tabs.value.map((tab, i) => ({ ...tab, originalIndex: i })).filter(t => !t.disabled)
  if (!availableTabs.length) return

  const currentIndexInAvailable = availableTabs.findIndex(t => t.originalIndex === index)
  let nextIndexInAvailable = null

  if (e.key === 'ArrowRight') {
    nextIndexInAvailable = (currentIndexInAvailable + 1) % availableTabs.length
  } else if (e.key === 'ArrowLeft') {
    nextIndexInAvailable = (currentIndexInAvailable - 1 + availableTabs.length) % availableTabs.length
  } else if (e.key === 'Home') {
    nextIndexInAvailable = 0
  } else if (e.key === 'End') {
    nextIndexInAvailable = availableTabs.length - 1
  }

  if (nextIndexInAvailable !== null) {
    e.preventDefault()
    const targetTab = availableTabs[nextIndexInAvailable]
    setActiveTab(targetTab.slug)
    setTimeout(() => {
      if (tabRefs.value[targetTab.originalIndex]) {
        tabRefs.value[targetTab.originalIndex].focus()
      }
    }, 0)
  }
}
</script>

<template>
  <div class="tabs" :class="[`tabs--${variant}`]">
    <div class="tabs__list" role="tablist" aria-label="Вкладки">
      <button
        v-for="(tab, index) in tabs"
        :key="tab.slug"
        :id="`${idPrefix}-tab-${tab.slug}`"
        :ref="el => tabRefs[index] = el"
        type="button"
        role="tab"
        :aria-selected="activeSlug === tab.slug"
        :aria-controls="`${idPrefix}-panel-${tab.slug}`"
        :tabindex="activeSlug === tab.slug ? 0 : -1"
        :disabled="tab.disabled"
        class="tabs__tab"
        :class="{ 'tabs__tab--active': activeSlug === tab.slug }"
        @click="setActiveTab(tab.slug)"
        @keydown="handleKeydown($event, index)"
      >
        {{ tab.title }}
      </button>
    </div>
    <slot />
  </div>
</template>

<style scoped lang="scss">
.tabs {
  @apply flex flex-col gap-4;
}

.tabs__list {
  @apply flex gap-2 border-b border-gray-200;
}

.tabs__tab {
  @apply px-4 py-2 text-sm font-medium text-gray-500 rounded-t-lg transition-colors;
  
  &:hover:not(:disabled) {
    @apply bg-gray-50 text-gray-700;
  }
  
  &:focus-visible {
    @apply outline-none ring-2 ring-blue-500 z-10 relative;
  }
  
  &:disabled {
    @apply opacity-50 cursor-not-allowed;
  }
}

.tabs--underline {
  .tabs__tab--active {
    @apply border-b-2 border-blue-600 text-blue-600 font-bold bg-blue-50/50;
  }
}
.tabs--pills {
  .tabs__list {
    @apply border-none bg-gray-100 p-1 rounded-lg w-max max-w-full overflow-x-auto;
  }
  .tabs__tab {
    @apply rounded-md text-gray-600;
    
    &:hover:not(:disabled) {
      @apply bg-gray-200 text-gray-800;
    }
  }
  .tabs__tab--active {
    @apply bg-white text-blue-700 shadow font-bold;
  }
}

.tabs--boxed {
  .tabs__list {
    @apply border-b-0;
  }
  .tabs__tab {
    @apply border border-transparent border-b-gray-300 bg-gray-50;
    
    &:hover:not(:disabled) {
      @apply border-gray-300;
    }
  }
  .tabs__tab--active {
    @apply border-gray-300 border-b-transparent bg-white text-gray-900 font-bold;
    margin-bottom: -1px;
  }
}
</style>