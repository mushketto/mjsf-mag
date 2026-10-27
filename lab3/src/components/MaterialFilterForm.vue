<script setup>
import { reactive } from 'vue'

const filterForm = reactive({
  query: '',
  topic: 'all'
})

const emit = defineEmits(['apply', 'clear'])

function submitFilters() {
  emit('apply', { query: filterForm.query, topic: filterForm.topic })
}

function clearFilters() {
  filterForm.query = ''
  filterForm.topic = 'all'
  emit('clear')
}
</script>

<template>
  <form 
    class="filters" 
    action="#" 
    aria-label="Фільтри каталогу"
    @submit.prevent="submitFilters"
    @reset.prevent="clearFilters"
    @keydown.esc="clearFilters"
  >
    <label class="field">
      <span class="field__label">Пошук за назвою</span>
      <span class="field__control">
        <span class="field__icon" aria-hidden="true">⌕</span>
        <input
          class="field__input"
          type="search"
          name="query"
          placeholder="Наприклад, компоненти"
          v-model.trim="filterForm.query"
        />
      </span>
    </label>

    <label class="field">
      <span class="field__label">Тема</span>
      <span class="field__control">
        <select class="field__select" name="topic" v-model="filterForm.topic">
          <option value="all">Усі теми</option>
          <option value="vue">Vue</option>
          <option value="html">HTML</option>
          <option value="css">CSS</option>
          <option value="javascript">JavaScript</option>
        </select>
      </span>
    </label>

    <div class="filters__actions">
      <button class="button button--primary" type="submit">
        Застосувати
      </button>
      <button class="button button--secondary" type="reset">
        Очистити
      </button>
    </div>
  </form>
</template>