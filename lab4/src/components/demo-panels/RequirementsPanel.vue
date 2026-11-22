<script setup>
import { ref, computed } from 'vue'
const reqs = ref([
  { id: 1, text: 'Використати Composition API', done: false },
  { id: 2, text: 'Реалізувати Provide/Inject', done: false },
  { id: 3, text: 'Використати KeepAlive', done: false }
])
const doneCount = computed(() => reqs.value.filter(r => r.done).length)
</script>

<template>
  <div class="p-4 border border-gray-200 rounded-lg bg-gray-50 mt-4">
    <h3 class="font-bold mb-3">Вимоги (Виконано: {{ doneCount }}/{{ reqs.length }})</h3>
    <ul class="flex flex-col gap-2">
      <li v-for="req in reqs" :key="req.id">
        <label class="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" v-model="req.done" class="w-4 h-4 text-blue-600" />
          <span :class="{'line-through text-gray-500': req.done}">{{ req.text }}</span>
        </label>
      </li>
    </ul>
  </div>
</template>