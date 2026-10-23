<script setup lang="ts">
defineProps<{ page: number; pageSize: number; total: number }>()
defineEmits<{ change: [page: number] }>()
</script>
<template>
  <div class="pagination">
    <span>Показано {{ Math.min((page - 1) * pageSize + 1, total) }}–{{ Math.min(page * pageSize, total) }} из {{ total }}</span>
    <div>
      <button class="btn btn-secondary btn-sm" :disabled="page<=1" @click="$emit('change',page-1)">Назад</button>
      <button class="btn btn-secondary btn-sm" :disabled="page*pageSize>=total" @click="$emit('change',page+1)">Далее
      </button>
    </div>
  </div>
</template>