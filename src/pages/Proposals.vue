<script setup lang="ts">
import {onMounted, ref, watch} from 'vue'
import {Download, Eye, FileText, Search, Trash2} from 'lucide-vue-next'
import {downloadProposalDocument, downloadProposalsCsv, proposalsApi} from '../api/client'
import SectionTitle from '../components/SectionTitle.vue'
import UiState from '../components/UiState.vue'
import DataTable from '../components/DataTable.vue'
import PaginationBar from '../components/PaginationBar.vue'
import BaseModal from '../components/BaseModal.vue'
import {useAppStore} from '../stores/app'

const app = useAppStore(), rows = ref<any[]>([]), selected = ref<any>(null), loading = ref(false), error = ref(''),
    search = ref(''), status = ref(''), dealId = ref(''), page = ref(1), pageSize = 10, total = ref(0),
    busyId = ref<string | number | null>(null), confirmDelete = ref<any>(null)

async function load() {
  loading.value = true;
  error.value = '';
  try {
    const r = await proposalsApi.list({
      search: search.value || undefined,
      status: status.value || undefined,
      deal_id: dealId.value ? Number(dealId.value) : undefined,
      page: page.value,
      page_size: pageSize
    });
    rows.value = r.items;
    total.value = r.total
  } catch (e: any) {
    error.value = e.userMessage || 'Не удалось загрузить предложения'
  } finally {
    loading.value = false
  }
}

watch([page, status, dealId], load);
onMounted(load)
let timer: ReturnType<typeof setTimeout>;

function searchChanged() {
  clearTimeout(timer);
  page.value = 1;
  timer = setTimeout(load, 300)
}

function date(v: any) {
  return v ? new Date(v).toLocaleDateString('ru-RU') : '—'
}

function money(v: any) {
  return v == null ? '—' : new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0
  }).format(v)
}

async function downloadDocument(p: any) {
  busyId.value = p.id;
  try {
    await downloadProposalDocument(p.id);
    app.notify('Документ DOCX скачан')
  } catch (e: any) {
    app.notify(`Ошибка экспорта: ${e.userMessage || 'backend недоступен'}`)
  } finally {
    busyId.value = null
  }
}

async function downloadCsv() {
  try {
    await downloadProposalsCsv();
    app.notify('Реестр КП скачан в CSV')
  } catch (e: any) {
    app.notify(`Ошибка экспорта: ${e.userMessage || 'backend недоступен'}`)
  }
}

async function remove() {
  try {
    await proposalsApi.remove(confirmDelete.value.id);
    app.notify('Предложение удалено');
    confirmDelete.value = null;
    selected.value = null;
    load()
  } catch (e: any) {
    app.notify(`Не удалось удалить: ${e.userMessage || 'ошибка API'}`)
  }
}
</script>
<template>
  <main class="page">
    <SectionTitle title="Коммерческие предложения"
                  subtitle="Просматривайте подготовленные предложения и выгружайте документы из системы."/>
    <section class="panel list-panel">
      <div class="proposal-toolbar">
        <div class="search-toolbar">
          <div class="input-icon">
            <Search/>
            <input v-model="search" placeholder="Поиск по названию или ID" @input="searchChanged"/></div>
          <select v-model="status" aria-label="Статус">
            <option value="">Все статусы</option>
            <option value="draft">Черновик</option>
            <option value="sent">Отправлено</option>
            <option value="accepted">Принято</option>
            <option value="rejected">Отклонено</option>
            <option value="expired">Просрочено</option>
          </select><input v-model="dealId" class="deal-id-filter" type="number" min="1" placeholder="ID сделки" aria-label="Фильтр по ID сделки" @input="page=1"/></div>
        <div class="toolbar-actions"><button class="btn btn-secondary btn-sm" @click="downloadCsv"><Download :size="15"/> CSV</button><span class="subtle-label">{{ total }} предложений</span></div></div>
      <UiState :loading="loading" :error="error" :empty="!rows.length"
               empty-text="Коммерческие предложения пока не созданы." @retry="load">
        <DataTable
            :columns="[{key:'id',label:'ID'},{key:'title',label:'Название'},{key:'status',label:'Статус'},{key:'total_price',label:'Сумма'},{key:'created_at',label:'Дата создания'},{key:'actions',label:'Действия'}]"
            :rows="rows">
          <template #cell-id="{value}"><span class="id-chip">#{{ value }}</span></template>
          <template #cell-title="{row}">
            <div class="proposal-name">
              <div class="proposal-file-icon">
                <FileText/>
              </div>
              <div>
                <strong>{{ row.title || `Коммерческое предложение #${row.id}` }}</strong><small>{{ row.company_name || `Компания ID: ${row.company_id ?? '—'}` }}</small>
              </div>
            </div>
          </template>
          <template #cell-status="{value}"><span class="status-badge" :class="`status-${value}`">{{
              ({
                draft: 'Черновик',
                sent: 'Отправлено',
                accepted: 'Принято',
                rejected: 'Отклонено',
                expired: 'Просрочено'
              } as any)[value] || value || '—'
            }}</span></template>
          <template #cell-total_price="{value}">{{ money(value) }}</template>
          <template #cell-created_at="{value}">{{ date(value) }}</template>
          <template #cell-actions="{row}">
            <div class="table-actions">
              <button class="icon-button" title="Просмотр" @click.stop="selected=row">
                <Eye :size="16"/>
              </button>
              <button class="icon-button" title="Скачать DOCX" :disabled="busyId===row.id"
                      @click.stop="downloadDocument(row)">
                <Download :size="16"/>
              </button>
              <button class="icon-button danger-icon" title="Удалить" @click.stop="confirmDelete=row">
                <Trash2 :size="16"/>
              </button>
            </div>
          </template>
        </DataTable>
      </UiState>
      <PaginationBar v-if="!loading&&!error&&total>pageSize" :page="page" :page-size="pageSize" :total="total"
                     @change="page=$event"/>
    </section>
    <BaseModal v-if="selected" title="Коммерческое предложение" wide @close="selected=null">
      <div class="proposal-preview">
        <div class="preview-icon">
          <FileText/>
        </div>
        <div><h3>{{ selected.title || `Коммерческое предложение #${selected.id}` }}</h3>
          <p>Создано {{ date(selected.created_at) }} · Статус: {{ selected.status || '—' }}</p></div>
      </div>
      <div class="detail-grid">
        <div><small>ID</small><strong>#{{ selected.id }}</strong></div>
        <div><small>Компания</small><strong>{{ selected.company_name || selected.company_id || '—' }}</strong></div>
        <div><small>Сумма</small><strong>{{ money(selected.total_price) }}</strong></div>
        <div><small>Сделка</small><strong>{{ selected.deal_id ?? '—' }}</strong></div>
      </div>
      <div class="proposal-body"><strong>Описание / условия</strong>
        <p>
          {{ selected.content || 'Текст предложения не возвращён backend. Полная версия доступна в документе DOCX.' }}</p>
      </div>
      <template #footer>
        <button class="btn btn-secondary" @click="selected=null">Закрыть</button>
        <button class="btn btn-primary" @click="downloadDocument(selected)">
          <Download :size="15"/>
          Экспорт DOCX
        </button>
      </template>
    </BaseModal>
    <BaseModal v-if="confirmDelete" title="Удалить предложение?" @close="confirmDelete=null"><p>Вы уверены, что хотите
      удалить «{{ confirmDelete.title || `КП #${confirmDelete.id}` }}»? Действие будет отправлено в backend.</p>
      <template #footer>
        <button class="btn btn-secondary" @click="confirmDelete=null">Отмена</button>
        <button class="btn btn-danger" @click="remove">Удалить</button>
      </template>
    </BaseModal>
  </main>
</template>
