<script setup lang="ts">
defineProps<{ columns: { key: string; label: string }[]; rows: Record<string, any>[]; rowKey?: string }>()
defineEmits<{ select: [row: Record<string, any>] }>()
</script>
<template>
  <div class="table-wrap">
    <table class="data-table">
      <thead>
      <tr>
        <th v-for="c in columns" :key="c.key">{{ c.label }}</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(row,i) in rows" :key="String(row[rowKey || 'id'] ?? i)" @click="$emit('select',row)">
        <td v-for="c in columns" :key="c.key">
          <slot :name="`cell-${c.key}`" :row="row" :value="row[c.key]">{{ row[c.key] ?? '—' }}</slot>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>