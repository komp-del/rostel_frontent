<script setup lang="ts">
import { LoaderCircle, CircleAlert, Inbox } from 'lucide-vue-next'
defineProps<{ loading?: boolean; error?: string; empty?: boolean; emptyText?: string }>()
defineEmits<{ retry: [] }>()
</script>
<template><div v-if="loading" class="state-panel"><LoaderCircle class="spin" :size="27"/><strong>Загружаем данные</strong><span>Подключаемся к серверу…</span></div><div v-else-if="error" class="state-panel error-state"><CircleAlert :size="28"/><strong>Не удалось загрузить данные</strong><span>{{error}}</span><button class="btn btn-secondary" @click="$emit('retry')">Повторить</button></div><div v-else-if="empty" class="state-panel"><Inbox :size="30"/><strong>Пока ничего нет</strong><span>{{emptyText || 'Измените фильтры или проверьте данные в системе.'}}</span></div><slot v-else/></template>