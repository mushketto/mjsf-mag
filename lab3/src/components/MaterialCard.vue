<script setup>
const props = defineProps({
  title: { type: String, required: true },
  topic: { type: String, required: true },
  description: { type: String, required: true },
  minutes: { type: Number, required: true },
  selected: { type: Boolean, default: false }
})

const emit = defineEmits(['select', 'edit', 'delete'])
</script>

<template>
  <article 
    class="material-card" 
    :class="[`material-card--${topic}`, { 'material-card--selected': selected }]"
  >
    <div class="material-card__meta">
      <span class="material-card__topic">{{ topic.toUpperCase() }}</span>
    </div>
    <h3 class="material-card__title">{{ title }}</h3>
    <p class="material-card__description">{{ description }}</p>
    
    <div class="material-card__footer flex flex-wrap items-center gap-2">
      <span class="material-card__duration">{{ minutes }} хв</span>
      <button 
        class="material-card__action" 
        type="button" 
        :aria-pressed="selected"
        @click="emit('select')"
      >
        {{ selected ? 'Обрано' : 'Обрати' }} 
        <span aria-hidden="true">{{ selected ? '✓' : '↗' }}</span>
      </button>
      
      <!-- Кнопки керування згруповано та притиснуто праворуч (ml-auto) -->
      <div class="flex gap-2 ml-auto">
        <button 
          type="button" 
          class="px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 rounded hover:bg-blue-200 focus-visible:outline-2 focus-visible:outline-blue-500" 
          @click="emit('edit')"
        >
          Редагувати
        </button>
        <button 
          type="button" 
          class="px-3 py-1 text-sm font-medium text-red-700 bg-red-100 rounded hover:bg-red-200 focus-visible:outline-2 focus-visible:outline-red-500" 
          @click="emit('delete')"
        >
          Видалити
        </button>
      </div>
    </div>
  </article>
</template>