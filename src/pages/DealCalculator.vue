<script setup lang="ts">
import {computed, ref} from 'vue'
import {BadgeCheck, Calculator, FilePlus2, RotateCcw} from 'lucide-vue-next'
import {dealsApi, dealsCalculatorApi, proposalsApi} from '../api/client'
import SectionTitle from '../components/SectionTitle.vue'
import BaseModal from '../components/BaseModal.vue'
import {useAppStore} from '../stores/app'

const app = useAppStore()
const form = ref({
  project_id: '',
  name: '',
  equipment_cost: 0,
  service_cost: 0,
  margin_percent: 20,
  risk_percent: 5,
  competitor_price: ''
})
const errors = ref<Record<string, string>>({}), saving = ref(false), showResult = ref(false), result = ref<any>(null),
    showProposal = ref(false), proposalTitle = ref('')
const subtotal = computed(() => Math.max(0, Number(form.value.equipment_cost || 0)) + Math.max(0, Number(form.value.service_cost || 0)))
const marginAmount = computed(() => subtotal.value * Math.min(100, Math.max(0, Number(form.value.margin_percent || 0))) / 100)
const riskAmount = computed(() => subtotal.value * Math.min(100, Math.max(0, Number(form.value.risk_percent || 0))) / 100)
const total = computed(() => subtotal.value + marginAmount.value + riskAmount.value)
const money = (n: number) => new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 2
}).format(n || 0)

function validate() {
  const e: Record<string, string> = {};
  if (form.value.name.trim().length < 2) e.name = 'Укажите наименование сделки (минимум 2 символа)';
  if (form.value.equipment_cost < 0) e.equipment_cost = 'Стоимость не может быть отрицательной';
  if (form.value.service_cost < 0) e.service_cost = 'Стоимость не может быть отрицательной';
  if (form.value.margin_percent < 0 || form.value.margin_percent > 100) e.margin_percent = 'Маржа должна быть от 0 до 100%';
  if (form.value.risk_percent < 0 || form.value.risk_percent > 100) e.risk_percent = 'Риск должен быть от 0 до 100%';
  errors.value = e;
  return !Object.keys(e).length
}

function payload() {
  return {
    project_id: form.value.project_id ? Number(form.value.project_id) : null,
    name: form.value.name.trim(),
    equipment_cost: Number(form.value.equipment_cost) || 0,
    service_cost: Number(form.value.service_cost) || 0,
    margin_percent: Number(form.value.margin_percent) || 0,
    risk_percent: Number(form.value.risk_percent) || 0,
    competitor_price: form.value.competitor_price === '' ? null : Number(form.value.competitor_price),
    status: 'calculated'
  }
}

async function calculate() {
  if (!validate()) return;
  saving.value = true;
  try {
    result.value = await dealsCalculatorApi.preview(payload());
    showResult.value = true;
    app.notify('Расчёт получен из backend')
  } catch (e: any) {
    app.notify(`Ошибка сохранения: ${e.userMessage || 'проверьте API'}`)
  } finally {
    saving.value = false
  }
}

async function saveDeal() {
  saving.value = true;
  try {
    result.value = await dealsApi.create(payload());
    app.notify('Сделка сохранена в backend')
  } catch (e: any) {
    app.notify(`Не удалось сохранить: ${e.userMessage || 'проверьте API'}`)
  } finally {
    saving.value = false
  }
}

async function createProposal() {
  if (!result.value?.id) {
    app.notify('Backend не вернул ID сделки — невозможно связать предложение');
    return
  }
  saving.value = true;
  try {
    const p = await proposalsApi.create({
      number: `КП-${Date.now()}`,
      title: proposalTitle.value || `Коммерческое предложение — ${form.value.name}`,
      deal_id: result.value.id,
      total_price: result.value.final_price ?? result.value.recommended_price ?? total.value,
      status: 'draft'
    });
    showProposal.value = false;
    app.notify(`Коммерческое предложение создано${p?.id ? ` (№ ${p.id})` : ''}`)
  } catch (e: any) {
    app.notify(`Не удалось создать предложение: ${e.userMessage || 'ошибка API'}`)
  } finally {
    saving.value = false
  }
}

function reset() {
  form.value = {
    project_id: '',
    name: '',
    equipment_cost: 0,
    service_cost: 0,
    margin_percent: 20,
    risk_percent: 5,
    competitor_price: ''
  };
  errors.value = {};
  result.value = null;
  showResult.value = false
}
</script>
<template>
  <main class="page">
    <SectionTitle title="Калькулятор сделок"
                  subtitle="Рассчитайте коммерческие параметры и сохраните результат в системе."/>
    <div class="calculator-layout">
      <section class="panel calculator-form">
        <div class="panel-heading">
          <div><h2>Параметры сделки</h2>
            <p>Поля со звёздочкой обязательны</p></div>
          <div class="calc-heading-icon">
            <Calculator/>
          </div>
        </div>
        <form @submit.prevent="calculate">
          <div class="form-grid"><label class="field full"><span>Наименование сделки *</span><input
              v-model="form.name" placeholder="Например, облачная инфраструктура"/><small
              v-if="errors.name" class="field-error">{{ errors.name }}</small></label><label
              class="field"><span>ID проекта (необязательно)</span><input v-model="form.project_id" type="number" min="1"
                                                                          placeholder="ID из backend"/></label><label
              class="field"><span>Стоимость оборудования, ₽</span><input v-model.number="form.equipment_cost" type="number" min="0" step="0.01"/><small
              v-if="errors.equipment_cost" class="field-error">{{ errors.equipment_cost }}</small></label><label
              class="field"><span>Стоимость сервиса, ₽</span><input v-model.number="form.service_cost" type="number" min="0" step="0.01"/><small
              v-if="errors.service_cost" class="field-error">{{ errors.service_cost }}</small></label><label
              class="field"><span>Маржа, %</span><input v-model.number="form.margin_percent" type="number" min="0" max="100"/><small
              v-if="errors.margin_percent" class="field-error">{{ errors.margin_percent }}</small></label><label
              class="field"><span>Риски, %</span><input v-model.number="form.risk_percent" type="number" min="0" max="100"/><small
              v-if="errors.risk_percent" class="field-error">{{ errors.risk_percent }}</small></label><label
              class="field"><span>Цена конкурента, ₽</span><input v-model.number="form.competitor_price" type="number" min="0" placeholder="Необязательно"/></label>
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" @click="reset">
              <RotateCcw :size="16"/>
              Очистить
            </button>
            <button class="btn btn-primary" :disabled="saving">
              <Calculator :size="16"/>
              {{ saving ? 'Рассчитываем…' : 'Рассчитать через API' }}
            </button>
          </div>
        </form>
      </section>
      <aside class="calculation-aside">
        <section class="result-card">
          <div class="result-top"><span>Предварительный расчёт</span>
            <div class="result-icon">
              <Calculator/>
            </div>
          </div>
          <div class="result-total">{{ money(total) }}</div>
          <p>Предварительная цена до ответа API</p>
          <div class="result-divider"></div>
          <div class="result-line"><span>Базовая стоимость</span><strong>{{ money(subtotal) }}</strong></div>
          <div class="result-line"><span>Маржа ({{ form.margin_percent || 0 }}%)</span><strong>{{ money(marginAmount) }}</strong></div>
          <div class="result-line"><span>Риск ({{ form.risk_percent || 0 }}%)</span><strong>{{ money(riskAmount) }}</strong></div>
          <div class="result-line"><span>Цена конкурента</span><strong>{{ form.competitor_price === '' ? '—' : money(Number(form.competitor_price)) }}</strong></div>
          <div class="result-foot">
            <BadgeCheck :size="16"/>
            Значения обновляются автоматически
          </div>
        </section>
        <section class="panel comparison-panel"><h3>Сравнение цен</h3>
          <p>Введите параметры для расчёта. Сравнение с тарифами и рыночными предложениями подключается через отдельный
            endpoint backend.</p>
          <div class="comparison-placeholder">Нет подключённых ценовых ориентиров</div>
        </section>
      </aside>
    </div>
    <section v-if="showResult" class="panel saved-result">
      <div class="saved-check">
        <BadgeCheck/>
      </div>
      <div><h3>Расчёт сохранён</h3>
        <p>Предварительный расчёт получен. Сохраните сделку, чтобы сформировать коммерческое предложение.</p><small>ID
          сделки: {{ result?.id ?? 'ещё не сохранена' }}</small></div>
      <button v-if="!result?.id" class="btn btn-secondary" :disabled="saving" @click="saveDeal">Сохранить сделку</button>
      <button v-else class="btn btn-primary" @click="showProposal=true">
        <FilePlus2 :size="16"/>
        Создать КП
      </button>
    </section>
    <BaseModal v-if="showProposal" title="Новое коммерческое предложение" @close="showProposal=false">
      <form @submit.prevent="createProposal"><label class="field"><span>Название предложения</span><input
          v-model="proposalTitle" :placeholder="`КП — ${form.name}`"/></label>
        <p class="modal-note">Предложение будет сохранено через POST /api/proposals и связано с созданной сделкой.</p>
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" @click="showProposal=false">Отмена</button>
          <button class="btn btn-primary" :disabled="saving">Создать через API</button>
        </div>
      </form>
    </BaseModal>
  </main>
</template>
