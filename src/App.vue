<script setup lang="ts">
import {RouterView} from 'vue-router'
import AppSidebar from './components/AppSidebar.vue'
import AppHeader from './components/AppHeader.vue'
import {useAppStore} from './stores/app'
import {CheckCircle2, X} from 'lucide-vue-next'

const app = useAppStore()
</script>
<template>
  <div class="app-shell">
    <AppSidebar/>
    <div class="main-shell">
      <AppHeader/>
      <RouterView/>
      <footer class="app-footer"><span>© Ростелеком · Коммерческая экосистема</span><span>Frontend · Vue 3</span>
      </footer>
    </div>
    <Transition name="toast">
      <div v-if="app.notification" class="toast">
        <CheckCircle2/>
        <span>{{ app.notification }}</span>
        <button class="icon-button" @click="app.notification=''">
          <X :size="16"/>
        </button>
      </div>
    </Transition>
  </div>
</template>