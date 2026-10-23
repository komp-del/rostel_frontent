<script setup lang="ts">
import {RouterView} from 'vue-router'
import AppSidebar from './components/AppSidebar.vue'
import AppHeader from './components/AppHeader.vue'
import {useAppStore} from './stores/app'
import {CheckCircle2, X} from 'lucide-vue-next'
import {useRoute, useRouter} from 'vue-router'

const app = useAppStore()
const route = useRoute()
const router = useRouter()
function logout() { localStorage.removeItem('rt_access_token'); router.replace('/login'); app.notify('Вы вышли из системы') }
</script>
<template>
  <div class="app-shell">
    <AppSidebar v-if="route.path !== '/login'"/>
    <div v-if="route.path === '/login'" class="login-shell"><RouterView/></div>
    <div v-else class="main-shell">
      <AppHeader @logout="logout"/>
      <RouterView/>
      <footer class="app-footer"><span>© Ростелеком · Коммерческая экосистема</span><span>API · OpenAPI 3.1</span>
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