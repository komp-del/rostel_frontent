<script setup lang="ts">
import {computed, onMounted, ref} from 'vue'
import {ArrowUpRight, BriefcaseBusiness, Building2, Handshake, RefreshCw, Wallet} from 'lucide-vue-next'
import {Doughnut, Line} from 'vue-chartjs'
import {
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip
} from 'chart.js'
import {companiesApi, dealsApi, projectsApi, statsApi} from '../api/client'
import SectionTitle from '../components/SectionTitle.vue'
import UiState from '../components/UiState.vue'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler)
const stats = ref<any>(null), loading = ref(true), error = ref(''), counts = ref({companies: 0, projects: 0, deals: 0})
const money = (n: number) => new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0
}).format(n || 0)
const lineData = computed(() => ({
  labels: stats.value?.trend?.labels || [],
  datasets: [{
    label: 'Выручка',
    data: stats.value?.trend?.values || [],
    borderColor: '#f36f21',
    backgroundColor: 'rgba(243,111,33,.12)',
    fill: true,
    tension: .35,
    pointRadius: 3
  }]
}))
const doughnutData = computed(() => ({
  labels: stats.value?.deal_stages?.map((x: any) => x.name) || [],
  datasets: [{
    data: stats.value?.deal_stages?.map((x: any) => x.value) || [],
    backgroundColor: ['#f36f21', '#343f56', '#f8b18a', '#8c9bb2', '#d9dee7'],
    borderWidth: 0
  }]
}))
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {legend: {display: false}},
  scales: {
    x: {grid: {display: false}, ticks: {color: '#8992a3'}},
    y: {grid: {color: '#edf0f4'}, ticks: {color: '#8992a3'}}
  }
}

async function load() {
  loading.value = true;
  error.value = '';
  try {
    const [s, c, p, d] = await Promise.all([statsApi.get(), companiesApi.list({
      page: 1,
      page_size: 1
    }), projectsApi.list({page: 1, page_size: 1}), dealsApi.list({page: 1, page_size: 1})]);
    stats.value = s;
    counts.value = {
      companies: s.companies_count ?? c.total,
      projects: s.projects_count ?? p.total,
      deals: s.deals_count ?? d.total
    }
  } catch (e: any) {
    error.value = e.userMessage || 'Проверьте доступность FastAPI и VITE_API_URL'
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>
<template>
  <main class="page">
    <SectionTitle title="Обзор экосистемы" subtitle="Ключевые показатели коммерческого блока и динамика портфеля."/>
    <UiState :loading="loading" :error="error" @retry="load">
      <template v-if="stats">
        <div class="kpi-grid">
          <article class="kpi-card">
            <div class="kpi-top"><span>Компании в радаре</span>
              <div class="kpi-icon orange">
                <Building2/>
              </div>
            </div>
            <strong>{{ (stats.companies_count ?? counts.companies).toLocaleString('ru-RU') }}</strong><small>Организации
            в системе</small></article>
          <article class="kpi-card">
            <div class="kpi-top"><span>Инвестиционные проекты</span>
              <div class="kpi-icon blue">
                <BriefcaseBusiness/>
              </div>
            </div>
            <strong>{{ (stats.projects_count ?? counts.projects).toLocaleString('ru-RU') }}</strong><small>В активном
            портфеле</small></article>
          <article class="kpi-card">
            <div class="kpi-top"><span>Сделки</span>
              <div class="kpi-icon purple">
                <Handshake/>
              </div>
            </div>
            <strong>{{ (stats.deals_count ?? counts.deals).toLocaleString('ru-RU') }}</strong><small>Всего в
            системе</small></article>
          <article class="kpi-card">
            <div class="kpi-top"><span>Потенциальный объём</span>
              <div class="kpi-icon green">
                <Wallet/>
              </div>
            </div>
            <strong class="kpi-money">{{ money(stats.potential_revenue || 0) }}</strong><small>По данным backend</small>
          </article>
        </div>
        <div class="chart-grid">
          <section class="panel chart-panel">
            <div class="panel-heading">
              <div><h2>Динамика выручки</h2>
                <p>Период и значения из API статистики</p></div>
              <span class="chart-tag"><span></span> Выручка</span></div>
            <div class="chart-area" v-if="lineData.labels.length">
              <Line :data="lineData" :options="chartOptions"/>
            </div>
            <div v-else class="chart-empty">Backend пока не вернул данные динамики.</div>
          </section>
          <section class="panel chart-panel">
            <div class="panel-heading">
              <div><h2>Воронка сделок</h2>
                <p>Распределение по стадиям</p></div>
            </div>
            <div class="doughnut-area" v-if="doughnutData.labels.length">
              <Doughnut :data="doughnutData"
                        :options="{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{usePointStyle:true,boxWidth:7,padding:15}}}}"/>
            </div>
            <div v-else class="chart-empty">Нет данных по стадиям сделок.</div>
          </section>
        </div>
        <section class="panel insight-panel">
          <div class="insight-icon">
            <ArrowUpRight/>
          </div>
          <div><h2>Данные в реальном времени</h2>
            <p>Показатели поступают из FastAPI. Для отображения графиков backend может возвращать <code>trend: { labels,
              values }</code> и <code>deal_stages: [{ name, value }]</code>.</p></div>
          <button class="btn btn-secondary btn-sm" @click="load">
            <RefreshCw :size="15"/>
            Обновить
          </button>
        </section>
      </template>
    </UiState>
  </main>
</template>