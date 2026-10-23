<script setup lang="ts">
import { X } from 'lucide-vue-next'
defineProps<{ title: string; wide?: boolean }>()
defineEmits<{ close: [] }>()
</script>
<template><div class="modal-backdrop" @click.self="$emit('close')"><section class="modal-card" :class="{wide}"><header class="modal-header"><h2>{{title}}</h2><button class="icon-button" @click="$emit('close')"><X/></button></header><div class="modal-body"><slot/></div><footer v-if="$slots.footer" class="modal-footer"><slot name="footer"/></footer></section></div></template>