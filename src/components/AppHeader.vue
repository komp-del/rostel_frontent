<script setup lang="ts">
import {Bell, ChevronDown, LogOut, Menu, Search} from 'lucide-vue-next'
import {useAppStore} from '../stores/app'
import {useRoute} from 'vue-router'

const app = useAppStore();
const route = useRoute()
const emit = defineEmits<{logout: []}>()
</script>
<template>
  <header class="topbar">
    <button class="icon-button menu-toggle" @click="app.sidebarOpen=!app.sidebarOpen">
      <Menu/>
    </button>
    <div class="breadcrumbs">Коммерческий блок <span>/</span> <strong>{{ route.meta.title }}</strong></div>
    <div class="topbar-actions">
      <div class="global-search">
        <Search :size="16"/>
        <span>Быстрый поиск</span><kbd>⌘ K</kbd></div>
      <button class="icon-button notification-button" aria-label="Уведомления">
        <Bell :size="19"/>
        <i></i></button>
      <button class="btn btn-secondary btn-sm header-logout" @click="emit('logout')"><LogOut :size="15"/><span>Выйти</span></button>
      <div class="profile">
        <div class="avatar">КБ</div>
        <div class="profile-text"><strong>Коммерческий блок</strong><small>Администратор</small></div>
        <ChevronDown :size="15"/>
      </div>
    </div>
  </header>
</template>