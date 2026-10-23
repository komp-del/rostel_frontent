import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../pages/Dashboard.vue'
import Companies from '../pages/Companies.vue'
import Projects from '../pages/Projects.vue'
import DealCalculator from '../pages/DealCalculator.vue'
import Proposals from '../pages/Proposals.vue'
export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'dashboard', component: Dashboard, meta: { title: 'Обзор' } },
    { path: '/companies', name: 'companies', component: Companies, meta: { title: 'Радар присутствия' } },
    { path: '/projects', name: 'projects', component: Projects, meta: { title: 'Инвестиционный навигатор' } },
    { path: '/deals', name: 'deals', component: DealCalculator, meta: { title: 'Калькулятор сделок' } },
    { path: '/proposals', name: 'proposals', component: Proposals, meta: { title: 'Коммерческие предложения' } }
  ],
  scrollBehavior: () => ({ top: 0 })
})