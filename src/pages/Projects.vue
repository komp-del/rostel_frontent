<script setup lang="ts">
import {onMounted, ref, watch} from 'vue'
import {BriefcaseBusiness, CalendarDays, Download, MapPin, Pencil, Plus, Search, Trash2, X} from 'lucide-vue-next'
import {projectsApi, downloadCsv} from '../api/client'
import {useAppStore} from '../stores/app'
import SectionTitle from '../components/SectionTitle.vue'
import UiState from '../components/UiState.vue'
import PaginationBar from '../components/PaginationBar.vue'
import BaseModal from '../components/BaseModal.vue'

const app = useAppStore()
const rows = ref<any[]>([]), selected = ref<any>(null), loading = ref(false), error = ref(''), total = ref(0),
    page = ref(1), pageSize = 9, search = ref(''), stage = ref(''), industry = ref(''), editing = ref(false), saving = ref(false), confirmDelete = ref(false)
const projectForm = ref<any>({})

async function load() {
  loading.value = true;
  error.value = '';
  try {
    const r = await projectsApi.list({
      search: search.value || undefined,
      stage: stage.value || undefined,
      industry: industry.value || undefined,
      page: page.value,
      page_size: pageSize
    });
    rows.value = r.items;
    total.value = r.total
  } catch (e: any) {
    error.value = e.userMessage || 'Не удалось получить проекты'
  } finally {
    loading.value = false
  }
}

watch([page, stage, industry], load);
onMounted(load)
const money = (n: any) => n == null ? '—' : new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  notation: 'compact',
  maximumFractionDigits: 1
}).format(n)
let timer: ReturnType<typeof setTimeout>

function searchChanged() {
  clearTimeout(timer);
  page.value = 1;
  timer = setTimeout(load, 300)
}
function openCreate() {
  selected.value = null;
  projectForm.value = {name: '', company_id: '', region: '', industry: '', stage: 'Идея', budget: 0, it_needs: '', security_needs: '', description: '', is_test_data: false};
  editing.value = true
}
function openEdit(project: any) { projectForm.value = {...project, company_id: project.company_id || ''}; editing.value = true }
async function saveProject() {
  saving.value = true;
  try {
    const payload = {...projectForm.value, company_id: projectForm.value.company_id ? Number(projectForm.value.company_id) : null, budget: Number(projectForm.value.budget) || 0};
    const saved = selected.value?.id ? await projectsApi.update(selected.value.id, payload) : await projectsApi.create(payload);
    selected.value = saved; editing.value = false; await load()
  } catch (e: any) { error.value = e.userMessage || 'Не удалось сохранить проект' } finally { saving.value = false }
}
async function deleteProject() {
  saving.value = true;
  try { await projectsApi.remove(selected.value.id); selected.value = null; confirmDelete.value = false; await load() } catch (e: any) { error.value = e.userMessage || 'Не удалось удалить проект' } finally { saving.value = false }
}
</script>
<template>
  <main class="page">
    <SectionTitle title="Инвестиционный навигатор"
                  subtitle="Проекты и инициативы для развития коммерческого портфеля."/>
    <section class="panel filter-panel">
      <div class="filters-grid project-filters"><label class="field search-field"><span>Поиск проекта</span>
        <div class="input-icon">
          <Search/>
          <input v-model="search" placeholder="Название или описание" @input="searchChanged"/></div>
      </label><label class="field"><span>Стадия проекта</span><select v-model="stage">
        <option value="">Все стадии</option>
        <option value="Идея">Идея</option>
        <option value="ТЭО">ТЭО</option>
        <option value="Проектирование">Проектирование</option>
        <option value="Реализация">Реализация</option>
        <option value="Завершён">Завершён</option>
      </select></label><label class="field"><span>Отрасль</span><input v-model="industry" placeholder="Любая отрасль"/></label>
        <button class="btn btn-secondary filter-reset" @click="search='';stage='';industry='';page=1;load()">
          <X :size="15"/>
          Сбросить
        </button>
      </div>
    </section>
    <div class="projects-heading">
      <div><h2>Портфель проектов</h2>
        <p>Найдено: {{ total.toLocaleString('ru-RU') }}</p></div>
      <div class="toolbar-actions"><button class="btn btn-secondary btn-sm" @click="downloadCsv('projects').then(()=>app.notify('Экспорт проектов скачан')).catch((e:any)=>app.notify(e.userMessage || 'Ошибка экспорта'))"><Download :size="15"/> CSV</button><button class="btn btn-primary btn-sm" @click="openCreate"><Plus :size="15"/> Проект</button><span class="subtle-label">Карточный вид</span></div></div>
    <UiState :loading="loading" :error="error" :empty="!rows.length"
             empty-text="Проекты не найдены. Попробуйте изменить фильтры." @retry="load">
      <div class="projects-grid">
        <button v-for="p in rows" :key="p.id" class="project-card" @click="selected=p">
          <div class="project-card-top">
            <div class="project-icon">
              <BriefcaseBusiness/>
            </div>
            <span class="stage-pill">{{ p.stage || 'Стадия не указана' }}</span></div>
          <h3>{{ p.name }}</h3>
          <p class="project-description">{{ p.description || 'Описание проекта не предоставлено.' }}</p>
          <div class="project-meta"><span><MapPin
              :size="14"/>{{ p.region || p.industry || 'Без категории' }}</span><span><CalendarDays
              :size="14"/>{{ p.updated_at ? new Date(p.updated_at).toLocaleDateString('ru-RU') : 'Дата не указана' }}</span>
          </div>
          <div class="project-bottom">
            <div><small>Инвестиционный объём</small><strong>{{ money(p.budget) }}</strong></div>
            <span class="view-link">Подробнее <span>↗</span></span></div>
        </button>
      </div>
    </UiState>
    <PaginationBar v-if="!loading&&!error&&total>pageSize" :page="page" :page-size="pageSize" :total="total"
                   @change="page=$event"/>
    <BaseModal v-if="editing || selected" :title="editing ? (selected ? 'Редактировать проект' : 'Новый проект') : 'Детали проекта'" wide @close="editing=false;selected=null">
      <form v-if="editing" @submit.prevent="saveProject" class="form-grid">
        <label class="field full"><span>Название *</span><input v-model="projectForm.name" required minlength="2"/></label>
        <label class="field"><span>ID компании</span><input v-model="projectForm.company_id" type="number" min="1"/></label>
        <label class="field"><span>Регион *</span><input v-model="projectForm.region" required minlength="2"/></label>
        <label class="field"><span>Отрасль *</span><input v-model="projectForm.industry" required minlength="2"/></label>
        <label class="field"><span>Стадия *</span><select v-model="projectForm.stage"><option>Идея</option><option>ТЭО</option><option>Проектирование</option><option>Реализация</option><option>Завершён</option></select></label>
        <label class="field"><span>Бюджет, ₽</span><input v-model.number="projectForm.budget" type="number" min="0"/></label>
        <label class="field"><span>IT-потребности</span><textarea v-model="projectForm.it_needs" rows="3"/></label>
        <label class="field"><span>Потребности ИБ</span><textarea v-model="projectForm.security_needs" rows="3"/></label>
        <label class="field full"><span>Описание</span><textarea v-model="projectForm.description" rows="3"/></label>
        <div class="form-actions full"><button type="button" class="btn btn-secondary" @click="editing=false">Отмена</button><button class="btn btn-primary" :disabled="saving">{{ saving ? 'Сохраняем…' : 'Сохранить' }}</button></div>
      </form>
      <template v-else>
      <div class="project-detail"><span class="stage-pill">{{ selected.stage || 'Стадия не указана' }}</span>
        <h3>{{ selected.name }}</h3>
        <p>{{ selected.description || 'Описание отсутствует.' }}</p>
        <div class="detail-grid">
          <div><small>Отрасль</small><strong>{{ selected.industry || '—' }}</strong></div>
          <div><small>Регион</small><strong>{{ selected.region || '—' }}</strong></div>
          <div><small>Инвестиционный объём</small><strong>{{ money(selected.budget) }}</strong></div>
          <div><small>IT-потребности</small><strong>{{ selected.it_needs || '—' }}</strong></div>
          <div><small>Потребности ИБ</small><strong>{{ selected.security_needs || '—' }}</strong></div>
          <div><small>ID компании</small><strong>{{ selected.company_id ?? '—' }}</strong></div>
        </div>
      </div>
      </template>
      <template #footer>
        <template v-if="!editing"><button class="btn btn-danger" @click="confirmDelete=true"><Trash2 :size="15"/> Удалить</button><button class="btn btn-secondary" @click="openEdit(selected)"><Pencil :size="15"/> Изменить</button><button class="btn btn-secondary" @click="selected=null">Закрыть</button></template>
      </template>
    </BaseModal>
    <BaseModal v-if="confirmDelete" title="Удалить проект?" @close="confirmDelete=false"><p>Проект «{{ selected?.name }}» будет удалён без возможности восстановления.</p><template #footer><button class="btn btn-secondary" @click="confirmDelete=false">Отмена</button><button class="btn btn-danger" :disabled="saving" @click="deleteProject">Удалить</button></template></BaseModal>
  </main>
</template>
