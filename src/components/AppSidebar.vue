<script setup lang="ts">
import {useRoute} from 'vue-router'
import {BriefcaseBusiness, Calculator, Files, LayoutDashboard, Radar, RadioTower, X} from 'lucide-vue-next'
import {useAppStore} from '../stores/app'

const route = useRoute();
const app = useAppStore()
const links = [
  {to: '/', label: 'Обзор', icon: LayoutDashboard},
  {to: '/companies', label: 'Радар присутствия', icon: Radar},
  {to: '/projects', label: 'Инвестиционный навигатор', icon: BriefcaseBusiness},
  {to: '/deals', label: 'Калькулятор сделок', icon: Calculator},
  {to: '/proposals', label: 'Коммерческие предложения', icon: Files}
]
</script>
<template>
  <div v-if="app.sidebarOpen" class="mobile-scrim" @click="app.sidebarOpen=false"></div>
  <aside class="sidebar" :class="{ 'sidebar-open': app.sidebarOpen }">
    <div class="brand">
      <div class="brand-mark">
        <RadioTower :size="23"/>
      </div>
      <div><strong>Ростелеком</strong><small>КОММЕРЧЕСКАЯ ЭКОСИСТЕМА</small></div>
      <button class="icon-button mobile-close" @click="app.sidebarOpen=false">
        <X/>
      </button>
    </div>
    <div class="nav-caption">РАБОЧЕЕ ПРОСТРАНСТВО</div>
    <nav>
      <RouterLink v-for="link in links" :key="link.to" :to="link.to" class="nav-link"
                  :class="{active:route.path===link.to}" @click="app.sidebarOpen=false">
        <component :is="link.icon" :size="19"/>
        <span>{{ link.label }}</span><span v-if="route.path===link.to" class="active-dot"></span></RouterLink>
    </nav>
    <div class="sidebar-bottom">
      <div class="status-indicator"></div>
      <div><strong>Коммерческий блок</strong><small>Рабочая среда</small></div>
    </div>
  </aside>
</template>