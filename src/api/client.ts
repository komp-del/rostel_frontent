import axios, {type AxiosRequestConfig} from 'axios'

export const api = axios.create({
    baseURL: (import.meta.env.VITE_API_URL || '').replace(/\/$/, ''),
    timeout: 20000,
    headers: {Accept: 'application/json'}
})
api.interceptors.request.use(config => {
    const token = localStorage.getItem('rt_access_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

api.interceptors.response.use(r => r, error => {
    const detail = error?.response?.data?.detail
    const message = Array.isArray(detail) ? detail.map((item: any) => item.msg).filter(Boolean).join('. ') : detail || error?.response?.data?.message || error.message || 'Ошибка сети'
    error.userMessage = message
    return Promise.reject(error)
})
export type PageResult<T> = { items: T[]; total: number; page?: number; page_size?: number }

export function normalizeList<T>(data: T[] | PageResult<T>): PageResult<T> {
    if (Array.isArray(data)) return {items: data, total: data.length}
    return {
        items: data.items || [],
        total: data.total ?? data.items?.length ?? 0,
        page: data.page,
        page_size: data.page_size
    }
}

export const resource = (name: 'companies' | 'projects' | 'deals' | 'proposals') => ({
    list: (params: Record<string, unknown> = {}, config?: AxiosRequestConfig) => api.get(`/api/${name}`, {params, ...config}).then(r => normalizeList(r.data)),
    get: (id: string | number) => api.get(`/api/${name}/${id}`).then(r => r.data),
    create: (payload: unknown) => api.post(`/api/${name}`, payload).then(r => r.data),
    update: (id: string | number, payload: unknown) => api.put(`/api/${name}/${id}`, payload).then(r => r.data),
    remove: (id: string | number) => api.delete(`/api/${name}/${id}`).then(r => r.data)
})
export const companiesApi = resource('companies')
export const projectsApi = resource('projects')
export const dealsApi = resource('deals')
export const proposalsApi = resource('proposals')
export const statsApi = {get: () => api.get('/api/stats').then(r => r.data)}
export const authApi = {
    login: (payload: {email: string; password: string}) => api.post('/api/auth/login', payload).then(r => r.data),
    register: (payload: {email: string; password: string; full_name: string}) => api.post('/api/auth/register', payload).then(r => r.data),
    me: () => api.get('/api/auth/me').then(r => r.data),
    setup2fa: () => api.post('/api/auth/2fa/setup').then(r => r.data),
    confirm2fa: (code: string) => api.post('/api/auth/2fa/confirm', {code}).then(r => r.data),
    verify2fa: (challenge_token: string, code: string) => api.post('/api/auth/2fa/verify', {code}, {params: {challenge_token}}).then(r => r.data),
    disable2fa: (code: string, password: string) => api.post('/api/auth/2fa/disable', {code, password}).then(r => r.data)
}
export const dealsCalculatorApi = {preview: (payload: unknown) => api.post('/api/deals/calculate', payload).then(r => r.data)}

export async function downloadProposalDocument(id: string | number) {
    const response = await api.get(`/api/proposals/${id}/document.docx`, {responseType: 'blob'})
    const blob = new Blob([response.data], {type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a');
    a.href = url;
    a.download = `proposal-${id}.docx`;
    a.click()
    URL.revokeObjectURL(url)
}

export async function downloadCsv(resourceName: 'companies' | 'projects' | 'deals' | 'proposals') {
    const response = await api.get(`/api/${resourceName}/export.csv`, {responseType: 'blob'})
    const url = URL.createObjectURL(new Blob([response.data], {type: 'text/csv;charset=utf-8'}))
    const a = document.createElement('a')
    a.href = url
    a.download = `${resourceName}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export const downloadProposalsCsv = () => downloadCsv('proposals')
