<script setup>
import { ref, reactive, computed } from 'vue'
import MaterialFilterForm from './MaterialFilterForm.vue'
import MaterialCard from './MaterialCard.vue'
import ModalDialog from './ModalDialog.vue'
import { materials } from '../data/materials.js'

const items = ref(materials.map(material => ({ ...material })))
const selectedId = ref(items.value[0]?.id ?? null)

const activeFilters = reactive({
  query: '',
  topic: 'all'
})

function applyFilters(payload) {
  activeFilters.query = payload.query
  activeFilters.topic = payload.topic
}

function clearFilters() {
  activeFilters.query = ''
  activeFilters.topic = 'all'
}

const filteredMaterials = computed(() => {
  return items.value.filter(material => {
    const matchesQuery = material.title.toLowerCase().includes(activeFilters.query.toLowerCase())
    const matchesTopic = activeFilters.topic === 'all' || material.topic === activeFilters.topic
    return matchesQuery && matchesTopic
  })
})

const totalMinutes = computed(() => {
  return filteredMaterials.value.reduce((sum, material) => sum + material.minutes, 0)
})

const selectedTitle = computed(() => {
  const item = items.value.find(i => i.id === selectedId.value)
  return item ? item.title : ''
})

const isOpen = ref(false)
const dialogMode = ref('edit') 
const dialogTitle = ref('')
const draft = ref({ title: '', minutes: '' })
const editingId = ref(null)
const editError = ref('')

const catalogHeadingRef = ref(null) 
const titleInputRef = ref(null) 
const cancelBtnRef = ref(null) 

function openEdit(material) {
  dialogMode.value = 'edit'
  dialogTitle.value = 'Редагування матеріалу'
  editingId.value = material.id
  draft.value = { title: material.title, minutes: material.minutes }
  editError.value = ''
  isOpen.value = true
}

function openDelete(material) {
  dialogMode.value = 'delete'
  dialogTitle.value = 'Підтвердження видалення'
  editingId.value = material.id
  draft.value = { title: material.title, minutes: material.minutes }
  isOpen.value = true
}

function saveEdit() {
  const trimmedTitle = draft.value.title.trim()
  const mins = Number(draft.value.minutes)

  if (!trimmedTitle) {
    editError.value = 'Назва не може бути порожньою.'
    return
  }
  if (!Number.isInteger(mins) || mins <= 0) {
    editError.value = 'Тривалість має бути додатним цілим числом.'
    return
  }

  const index = items.value.findIndex(i => i.id === editingId.value)
  if (index !== -1) {
    items.value[index].title = trimmedTitle
    items.value[index].minutes = mins
  }
  isOpen.value = false
}


function confirmDelete() {
  items.value = items.value.filter(i => i.id !== editingId.value)
  if (selectedId.value === editingId.value) {
    selectedId.value = items.value[0]?.id ?? null
  }
  isOpen.value = false
}

const currentInitialFocus = computed(() => {
  return dialogMode.value === 'edit' ? titleInputRef.value : cancelBtnRef.value
})
</script>

<template>
  <section class="material-catalog" aria-labelledby="catalog-title">
    <div class="material-catalog__heading">
      <div>
        <!-- Додано ref та tabindex="-1" для повернення фокуса -->
        <h2 
          class="material-catalog__title focus-visible:outline-2 focus-visible:outline-blue-500 rounded" 
          id="catalog-title" 
          ref="catalogHeadingRef" 
          tabindex="-1"
        >
          Каталог матеріалів
        </h2>
      </div>
      <p class="material-catalog__summary">
        <strong class="material-catalog__count">Знайдено: {{ filteredMaterials.length }}</strong>
        <span aria-hidden="true">·</span>
        Загальна тривалість: {{ totalMinutes }} хв
      </p>
    </div>

    <MaterialFilterForm @apply="applyFilters" @clear="clearFilters" />

    <p class="selection-status" aria-live="polite">
      <span class="selection-status__label">Обраний матеріал</span>
      <strong class="selection-status__value">{{ selectedTitle }}</strong>
    </p>

    <div v-if="filteredMaterials.length > 0" class="material-list">
      <MaterialCard
        v-for="material in filteredMaterials"
        :key="material.id"
        :title="material.title"
        :topic="material.topic"
        :description="material.description"
        :minutes="material.minutes"
        :selected="material.id === selectedId"
        @select="selectedId = material.id"
        @edit="openEdit(material)"
        @delete="openDelete(material)"
      />
    </div>

    <p v-else class="empty-state">
      За заданими умовами матеріалів немає.
    </p>

    <ModalDialog 
      v-model="isOpen" 
      :title="dialogTitle" 
      :initial-focus="currentInitialFocus"
      :fallback-focus="catalogHeadingRef"
    >
      <!-- Слот за замовчуванням (контент) -->
      <template v-if="dialogMode === 'edit'">
        <form id="material-edit-form" @submit.prevent="saveEdit" class="flex flex-col gap-4">
          <p v-if="editError" class="text-red-600 bg-red-50 p-2 rounded text-sm">
            {{ editError }}
          </p>
          <label class="flex flex-col gap-1">
            <span class="font-medium text-sm">Назва матеріалу</span>
            <input 
              type="text" 
              v-model="draft.title" 
              ref="titleInputRef"
              required
              class="border border-gray-300 rounded p-2 min-h-11 focus-visible:outline-2 focus-visible:outline-blue-500"
            />
          </label>
          <label class="flex flex-col gap-1">
            <span class="font-medium text-sm">Тривалість (хвилин)</span>
            <input 
              type="number" 
              v-model="draft.minutes" 
              required 
              min="1" 
              step="1"
              class="border border-gray-300 rounded p-2 min-h-11 focus-visible:outline-2 focus-visible:outline-blue-500"
            />
          </label>
        </form>
      </template>

      <template v-else-if="dialogMode === 'delete'">
        <p>Ви дійсно бажаєте видалити матеріал <strong>{{ draft.title }}</strong>? <br>Наслідок дії: запис буде видалено назавжди.</p>
      </template>

      <!-- Іменований слот (кнопки) -->
      <template #footer>
        <template v-if="dialogMode === 'edit'">
          <button 
            class="button button--secondary min-h-11 min-w-11 px-4" 
            type="button" 
            @click="isOpen = false"
          >
            Скасувати
          </button>
          <button 
            class="button button--primary min-h-11 min-w-11 px-4" 
            type="submit" 
            form="material-edit-form"
          >
            Зберегти
          </button>
        </template>

        <template v-else-if="dialogMode === 'delete'">
          <button 
            ref="cancelBtnRef"
            class="button button--secondary min-h-11 min-w-11 px-4" 
            type="button" 
            @click="isOpen = false"
          >
            Скасувати
          </button>
          <button 
            class="min-h-11 min-w-11 px-4 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-red-500" 
            type="button" 
            @click="confirmDelete"
          >
            Видалити
          </button>
        </template>
      </template>
    </ModalDialog>
  </section>
</template>