<script setup>
import { ref } from 'vue'
import ModalDialog from '../ModalDialog.vue'

const isModalOpen = ref(false)
</script>

<template>
  <div class="p-4 border border-gray-200 rounded-lg bg-gray-50 mt-4">
    <h3 class="font-bold mb-2">Середовище</h3>
    <p class="mb-4">Налаштування та інструменти розробки.</p>
    
    <button 
      @click="isModalOpen = true" 
      class="px-4 py-2 bg-blue-100 text-blue-700 font-medium rounded hover:bg-blue-200 focus-visible:outline-blue-500"
    >
      Відкрити вікно налаштувань
    </button>

    <ModalDialog v-model="isModalOpen" title="Налаштування">
      <p>Тут ви можете змінити параметри середовища.</p>
      <template #footer>
        <button 
          @click="isModalOpen = false" 
          class="px-4 py-2 bg-gray-200 font-medium rounded hover:bg-gray-300 focus-visible:outline-gray-500"
        >
          Закрити
        </button>
      </template>
    </ModalDialog>
  </div>
</template>