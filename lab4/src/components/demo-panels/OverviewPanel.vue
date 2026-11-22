<script setup>
import { ref } from 'vue'
const note = ref('')
</script>

<template>
  <div class="p-4 border border-gray-200 rounded-lg bg-gray-50 mt-4">
    <h3 class="font-bold mb-2">Особиста нотатка</h3>
    <textarea 
      v-model="note" 
      class="w-full p-2 border border-gray-300 rounded focus:outline-blue-500" 
      rows="3" 
      placeholder="Введіть примітку до матеріалу..."
    ></textarea>
  </div>
</template>