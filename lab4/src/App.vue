<script setup>
import { ref, shallowRef } from 'vue'
import Tabs from './components/tabs/Tabs.vue'
import Tab from './components/tabs/Tab.vue'

import OverviewPanel from './components/demo-panels/OverviewPanel.vue'
import RequirementsPanel from './components/demo-panels/RequirementsPanel.vue'
import EnvironmentPanel from './components/demo-panels/EnvironmentPanel.vue'

const activeTabUnderline = ref('overview')
const activeTabPills = ref('reqs')
const activeTabBoxed = ref('env')

const pillsConfig = ref([
  { slug: 'overview', title: 'Огляд (через масив)', panel: shallowRef(OverviewPanel) },
  { slug: 'reqs', title: 'Вимоги (через масив)', panel: shallowRef(RequirementsPanel) }
])
</script>

<template>
  <div class="max-w-4xl mx-auto p-4 md:p-8 flex flex-col gap-12">
    
    <header class="bg-gray-100 p-6 rounded-xl shadow-sm border border-gray-200">
      <h1 class="text-2xl font-bold mb-4">Лабораторна робота №4: Складений компонент Tabs</h1>
      <div class="flex flex-col md:flex-row gap-4 text-gray-700">
        <p><strong>Студент:</strong> Беркман Дмитро · група 7.F2.25-2</p>
        <p class="hidden md:block text-gray-400">|</p>
        <p><strong>Середовище:</strong> Windows 11 · Google Chrome · Node.js 24</p>
      </div>
    </header>

    <section>
      <h2 class="text-xl font-bold mb-4 text-gray-800">1. Варіант "Underline" (через слоти)</h2>
      <Tabs v-model="activeTabUnderline" variant="underline">
        <Tab slug="overview" title="Огляд">
          <OverviewPanel />
        </Tab>
        <Tab slug="requirements" title="Вимоги">
          <RequirementsPanel />
        </Tab>
        <Tab slug="environment" title="Середовище">
          <EnvironmentPanel />
        </Tab>
      </Tabs>
    </section>

    <section>
      <h2 class="text-xl font-bold mb-4 text-gray-800">2. Варіант "Pills" (динамічні компоненти)</h2>
      <Tabs v-model="activeTabPills" variant="pills">
        <Tab 
          v-for="item in pillsConfig" 
          :key="item.slug"
          :slug="item.slug" 
          :title="item.title"
          :panel="item.panel"
        />
      </Tabs>
    </section>

    <section>
      <h2 class="text-xl font-bold mb-4 text-gray-800">3. Варіант "Boxed" (із вимкненою вкладкою)</h2>
      <Tabs v-model="activeTabBoxed" variant="boxed">
        <Tab slug="env" title="Середовище (копія)">
          <EnvironmentPanel />
        </Tab>
        <Tab slug="disabled-tab" title="Недоступна вкладка" disabled>
          <p>Цей текст ніколи не з'явиться.</p>
        </Tab>
        <Tab slug="overview-copy" title="Огляд (копія)">
          <OverviewPanel />
        </Tab>
      </Tabs>
    </section>

  </div>
</template>