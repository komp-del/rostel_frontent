import axios, { type AxiosRequestConfig } from 'axios'
export const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || '').replace(/\/$/, ''),
  timeout: 20000,
  headers: { Accept: 'application/json' }
})
api.interceptors.response.use(r => r, error => {
  const message = error?.response?.data?.detail || error?.response?.data?.message || error.message || 'Ошибка сети'
  error.userMessage = message
  return Promise.reject(error)
})
export type PageResult<T> = { items: T[]; total: number; page?: number; page_size?: number }
export function normalizeList<T>(data: T[] | PageResult<T>): PageResult<T> {
  if (Array.isArray(data)) return { items: data, total: data.length }
  return { items: data.items || [], total: data.total ?? data.items?.length ?? 0, page: data.page, page_size: data.page_size }
}
export const resource = (name: 'companies'|'projects'|'deals'|'proposals') => ({
  list: (params: Record<string, unknown> = {}, config?: AxiosRequestConfig) => api.get(`/api/${name}`, { params, ...config }).then(r => normalizeList(r.data)),
  get: (id: string|number) => api.get(`/api/${name}/${id}`).then(r => r.data),
  create: (payload: unknown) => api.post(`/api/${name}`, payload).then(r => r.data),
  update: (id: string|number, payload: unknown) => api.put(`/api/${name}/${id}`, payload).then(r => r.data),
  remove: (id: string|number) => api.delete(`/api/${name}/${id}`).then(r => r.data)
})
export const companiesApi = resource('companies')
export const projectsApi = resource('projects')
export const dealsApi = resource('deals')
export const proposalsApi = resource('proposals')
export const statsApi = { get: () => api.get('/api/stats').then(r => r.data) }
export async function exportProposal(id: string|number, format: 'csv'|'docx') {
  const response = await api.get(`/api/proposals/${id}/export`, { params: { format }, responseType: 'blob' })
  const blob = new Blob([response.data], { type: format === 'csv' ? 'text/csv;charset=utf-8' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = `proposal-${id}.${format}`; a.click()
  URL.revokeObjectURL(url)
}