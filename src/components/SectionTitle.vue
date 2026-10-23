<script setup lang="ts">
import { Plus } from 'lucide-vue-next'
defineProps<{ title: string; subtitle: string; actionLabel?: string }>()
defineEmits<{ action: [] }>()
</script>
<template><div class="section-title"><div><div class="eyebrow">КОММЕРЧЕСКАЯ ЭКОСИСТЕМА</div><h1>{{title}}</h1><p>{{subtitle}}</p></div><button v-if="actionLabel" class="btn btn-primary" @click="$emit('action')"><Plus :size="17"/>{{actionLabel}}</button></div></template>