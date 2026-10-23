import {createRouter, createWebHistory} from 'vue-router'
import Dashboard from '../pages/Dashboard.vue'
import Companies from '../pages/Companies.vue'
import Projects from '../pages/Projects.vue'
import DealCalculator from '../pages/DealCalculator.vue'
import Proposals from '../pages/Proposals.vue'
import Login from '../pages/Login.vue'
import Security from '../pages/Security.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {path: '/login', name: 'login', component: Login, meta: {title: 'Вход', public: true}},
    {path: '/', name: 'dashboard', component: Dashboard, meta: {title: 'Обзор'}},
    {path: '/companies', name: 'companies', component: Companies, meta: {title: 'Радар присутствия'}},
    {path: '/projects', name: 'projects', component: Projects, meta: {title: 'Инвестиционный навигатор'}},
    {path: '/deals', name: 'deals', component: DealCalculator, meta: {title: 'Калькулятор сделок'}},
    {path: '/proposals', name: 'proposals', component: Proposals, meta: {title: 'Коммерческие предложения'}},
    {path: '/security', name: 'security', component: Security, meta: {title: 'Безопасность аккаунта'}}
  ],
  scrollBehavior: () => ({top: 0})
})

router.beforeEach(to => {
  const token = localStorage.getItem('rt_access_token')
  if (to.meta.public && token) return '/'
  if (!to.meta.public && !token) return {name: 'login', query: {redirect: to.fullPath}}
})

export default router
