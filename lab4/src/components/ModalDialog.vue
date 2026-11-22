<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, required: true },
  initialFocus: { type: [Object, window.HTMLElement], default: null },
  fallbackFocus: { type: [Object, window.HTMLElement], default: null }
})

const emit = defineEmits(['update:modelValue'])

const panelRef = ref(null)
let previousActiveElement = null
let previousOverflow = ''
let previousInert = false

function close() {
  emit('update:modelValue', false)
}

function handleKeydown(e) {
  if (e.key === 'Escape') {
    close()
  }
  
  if (e.key === 'Tab') {
    if (!panelRef.value) return
    const focusableElements = panelRef.value.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
    if (focusableElements.length === 0) {
      e.preventDefault()
      panelRef.value.focus()
      return
    }

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus()
        e.preventDefault()
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus()
        e.preventDefault()
      }
    }
  }
}

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    previousActiveElement = document.activeElement
    
    const app = document.getElementById('app')
    if (app) {
      previousInert = app.inert
      app.inert = true
    }
    previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    
    document.addEventListener('keydown', handleKeydown)
  } else {
    document.removeEventListener('keydown', handleKeydown)
  }
})

function onAfterEnter() {
  if (props.initialFocus) {
    props.initialFocus.focus()
  } else if (panelRef.value) {
    panelRef.value.focus()
  }
}

function onAfterLeave() {
  cleanup()
}

function cleanup() {
  const app = document.getElementById('app')
  if (app) app.inert = previousInert
  document.body.style.overflow = previousOverflow

  if (previousActiveElement && document.body.contains(previousActiveElement)) {
    previousActiveElement.focus()
  } else if (props.fallbackFocus) {
    props.fallbackFocus.focus()
  }
}

onBeforeUnmount(() => {
  if (props.modelValue) cleanup()
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-150 motion-reduce:transition-none"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150 motion-reduce:transition-none"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
      @after-enter="onAfterEnter"
      @after-leave="onAfterLeave"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 bg-black/50 p-4 box-border flex items-center justify-center z-50"
        @click.self="close"
      >
        <div
          ref="panelRef"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dialog-title"
          tabindex="-1"
          class="bg-white box-border w-full max-w-screen-sm max-h-[calc(100dvh-2rem)] flex flex-col overflow-hidden rounded-lg shadow-xl"
        >
          <header class="shrink-0 flex justify-between items-center p-4 border-b">
            <h2 id="dialog-title" class="text-xl font-bold break-words">{{ title }}</h2>
            <button 
              type="button" 
              aria-label="Закрити вікно" 
              @click="close" 
              class="min-h-11 min-w-11 shrink-0 flex items-center justify-center rounded hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-500"
            >
              ✕
            </button>
          </header>

          <main class="min-h-0 overflow-y-auto break-words p-4">
            <slot></slot>
          </main>

          <footer class="shrink-0 flex flex-col gap-3 sm:flex-row sm:justify-end p-4 border-t">
            <slot name="footer"></slot>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>