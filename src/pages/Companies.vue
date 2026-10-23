<script setup lang="ts">
import {onMounted, ref, watch} from 'vue'
import {Building2, Download, MapPin, Pencil, Plus, Search, SlidersHorizontal, Trash2, TrendingUp, X} from 'lucide-vue-next'
import {companiesApi, downloadCsv} from '../api/client'
import {useAppStore} from '../stores/app'
import SectionTitle from '../components/SectionTitle.vue'
import UiState from '../components/UiState.vue'
import PaginationBar from '../components/PaginationBar.vue'
import BaseModal from '../components/BaseModal.vue'

const app = useAppStore()
const rows = ref<any[]>([]), selected = ref<any>(null), loading = ref(false), error = ref(''), total = ref(0),
    page = ref(1), pageSize = 10, search = ref(''), region = ref(''), industry = ref(''), potentialOnly = ref(false), editing = ref(false), saving = ref(false), confirmDelete = ref(false)
const companyForm = ref<any>({})
let debounce: ReturnType<typeof setTimeout>

async function load() {
  loading.value = true;
  error.value = '';
  try {
    const r = await companiesApi.list({
      search: search.value || undefined,
      region: region.value || undefined,
      industry: industry.value || undefined,
      potential_only: potentialOnly.value || undefined,
      page: page.value,
      page_size: pageSize
    });
    rows.value = r.items;
    total.value = r.total
  } catch (e: any) {
    error.value = e.userMessage || 'Не удалось получить компании'
  } finally {
    loading.value = false
  }
}

function delayed() {
  clearTimeout(debounce);
  page.value = 1;
  debounce = setTimeout(load, 300)
}

function clear() {
  search.value = region.value = industry.value = ''; potentialOnly.value = false;
  page.value = 1;
  load()
}

watch(page, load);
onMounted(load)
const money = (n: any) => n == null ? '—' : new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  notation: 'compact',
  maximumFractionDigits: 1
}).format(n)
function openCreate() {
  selected.value = null;
  companyForm.value = {name: '', inn: '', industry: '', region: '', revenue: 0, growth_percent: 0, potential_score: 0, is_potential_client: true, is_test_data: false};
  editing.value = true
}
function openEdit(company: any) {
  companyForm.value = {...company, inn: company.inn || ''};
  editing.value = true
}
async function saveCompany() {
  saving.value = true;
  try {
    const payload = {...companyForm.value, inn: companyForm.value.inn || null, revenue: Number(companyForm.value.revenue) || 0, growth_percent: Number(companyForm.value.growth_percent) || 0, potential_score: Number(companyForm.value.potential_score) || 0};
    const saved = selected.value?.id ? await companiesApi.update(selected.value.id, payload) : await companiesApi.create(payload);
    selected.value = saved;
    editing.value = false;
    await load()
  } catch (e: any) { error.value = e.userMessage || 'Не удалось сохранить компанию' } finally { saving.value = false }
}
async function deleteCompany() {
  saving.value = true;
  try { await companiesApi.remove(selected.value.id); selected.value = null; confirmDelete.value = false; await load() } catch (e: any) { error.value = e.userMessage || 'Не удалось удалить компанию' } finally { saving.value = false }
}
</script>
<template>
  <main class="page">
    <SectionTitle title="Радар присутствия" subtitle="Поиск компаний, оценка потенциала и анализ динамики бизнеса."/>
    <section class="panel filter-panel">
      <div class="filter-heading">
        <div>
          <SlidersHorizontal :size="17"/>
          <strong>Фильтры компаний</strong></div>
        <button class="text-button" @click="clear">
          <X :size="14"/>
          Сбросить
        </button>
      </div>
      <div class="filters-grid"><label class="field search-field"><span>Поиск</span>
        <div class="input-icon"><Search/><input v-model="search" placeholder="Название, ИНН или ключевое слово" @input="delayed"/></div>
      </label><label class="field"><span>Регион</span><input v-model="region" placeholder="Например, Москва" @input="delayed"/></label>
      <label class="field"><span>Отрасль</span><input v-model="industry" placeholder="Отрасль" @input="delayed"/></label>
      <label class="field checkbox-field potential-filter"><input v-model="potentialOnly" type="checkbox" @change="delayed"/> Только потенциальные клиенты</label></div>
    </section>
    <section class="panel list-panel">
      <div class="panel-heading">
        <div><h2>Компании</h2>
          <p>Найдено: {{ total.toLocaleString('ru-RU') }}</p></div>
        <div class="toolbar-actions"><button class="btn btn-secondary btn-sm" @click="downloadCsv('companies').then(()=>app.notify('Экспорт компаний скачан')).catch((e:any)=>app.notify(e.userMessage || 'Ошибка экспорта'))"><Download :size="15"/> CSV</button><button class="btn btn-primary btn-sm" @click="openCreate"><Plus :size="15"/> Компания</button><span class="subtle-label">Реестр организаций</span></div></div>
      <UiState :loading="loading" :error="error" :empty="!rows.length"
               empty-text="По заданным параметрам компании не найдены." @retry="load">
        <div class="company-grid">
          <button v-for="c in rows" :key="c.id" class="company-card" @click="selected=c">
            <div class="company-logo">
              {{ String(c.name || '?').split(' ').map((x: string) => x[0]).slice(0, 2).join('').toUpperCase() }}
            </div>
            <div class="company-main"><strong>{{ c.name }}</strong><small>
              <MapPin :size="13"/>
              {{ c.region || 'Регион не указан' }} · {{ c.industry || 'Отрасль не указана' }}</small></div>
            <div class="company-metrics"><span>Выручка</span><strong>{{ money(c.revenue) }}</strong></div>
            <div class="growth" :class="Number(c.growth_percent)>=0?'positive':'negative'">
              <TrendingUp :size="15"/>
              {{ c.growth_percent == null ? '—' : `${c.growth_percent > 0 ? '+' : ''}${c.growth_percent}%` }}
            </div>
          </button>
        </div>
      </UiState>
      <PaginationBar v-if="!loading&&!error&&total>pageSize" :page="page" :page-size="pageSize" :total="total"
                     @change="page=$event"/>
    </section>
    <BaseModal v-if="editing || selected" :title="editing ? (selected ? 'Редактировать компанию' : 'Новая компания') : 'Карточка компании'" @close="editing=false;selected=null">
      <form v-if="editing" @submit.prevent="saveCompany" class="form-grid">
        <label class="field full"><span>Название *</span><input v-model="companyForm.name" required minlength="2"/></label>
        <label class="field"><span>ИНН</span><input v-model="companyForm.inn" inputmode="numeric" pattern="\d{10}(\d{2})?"/></label>
        <label class="field"><span>Отрасль *</span><input v-model="companyForm.industry" required minlength="2"/></label>
        <label class="field"><span>Регион *</span><input v-model="companyForm.region" required minlength="2"/></label>
        <label class="field"><span>Выручка, ₽</span><input v-model.number="companyForm.revenue" type="number" min="0"/></label>
        <label class="field"><span>Рост, %</span><input v-model.number="companyForm.growth_percent" type="number"/></label>
        <label class="field"><span>Оценка потенциала, 0–100</span><input v-model.number="companyForm.potential_score" type="number" min="0" max="100"/></label>
        <label class="field checkbox-field"><input v-model="companyForm.is_potential_client" type="checkbox"/> Потенциальный клиент</label>
        <div class="form-actions full"><button type="button" class="btn btn-secondary" @click="editing=false">Отмена</button><button class="btn btn-primary" :disabled="saving">{{ saving ? 'Сохраняем…' : 'Сохранить' }}</button></div>
      </form>
      <template v-else>
      <div class="detail-hero">
        <div class="company-logo large">
          <Building2/>
        </div>
        <div><h3>{{ selected.name }}</h3>
          <p>{{ selected.industry || 'Отрасль не указана' }}</p></div>
      </div>
      <div class="detail-grid">
        <div><small>Регион</small><strong>{{ selected.region || '—' }}</strong></div>
        <div><small>Выручка</small><strong>{{ money(selected.revenue) }}</strong></div>
        <div><small>Рост</small><strong>{{ selected.growth_percent == null ? '—' : `${selected.growth_percent}%` }}</strong></div>
        <div><small>ИНН</small><strong>{{ selected.inn || '—' }}</strong></div>
      </div>
      <p class="detail-description">{{ selected.description || 'Дополнительная информация отсутствует.' }}</p>
      </template>
      <template #footer>
        <template v-if="!editing"><button class="btn btn-danger" @click="confirmDelete=true"><Trash2 :size="15"/> Удалить</button><button class="btn btn-secondary" @click="openEdit(selected)"><Pencil :size="15"/> Изменить</button><button class="btn btn-secondary" @click="selected=null">Закрыть</button></template>
      </template>
    </BaseModal>
    <BaseModal v-if="confirmDelete" title="Удалить компанию?" @close="confirmDelete=false"><p>Компания «{{ selected?.name }}» будет удалена без возможности восстановления.</p><template #footer><button class="btn btn-secondary" @click="confirmDelete=false">Отмена</button><button class="btn btn-danger" :disabled="saving" @click="deleteCompany">Удалить</button></template></BaseModal>
  </main>
</template>
