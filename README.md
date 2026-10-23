# Экосистема коммерческого блока Ростелекома

Frontend на Vue 3 + Vite + TypeScript + Composition API. API-клиент читает `VITE_API_URL`; интерфейс не использует
фиктивные бизнес-данные вместо backend.

## Запуск

1. Установите Node.js 20+.
2. `npm install`
3. Скопируйте `.env.example` в `.env` и укажите URL FastAPI.
4. `npm run dev`
5. `npm run typecheck` и `npm run build`

## API-контракт

Клиент ожидает REST endpoints:

- `GET/POST /api/companies`, `GET/PUT/DELETE /api/companies/{id}`
- `GET/POST /api/projects`, `GET/PUT/DELETE /api/projects/{id}`
- `GET/POST /api/deals`, `GET/PUT/DELETE /api/deals/{id}`
- `GET/POST /api/proposals`, `GET/PUT/DELETE /api/proposals/{id}`
- `GET /api/stats`
- `GET /api/proposals/{id}/export?format=csv|docx` (backend возвращает файл)

Для коллекций поддерживаются стандартные query-параметры `search`, `region`, `industry`, `stage`, `revenue_min`,
`revenue_max`, `growth_min`, `page`, `page_size`. Ответ коллекции может быть массивом или
`{ items, total, page, page_size }`. Схему можно адаптировать в `src/api/client.ts`, не меняя страницы.

## CORS

Разрешите origin frontend в настройках FastAPI. Авторизация не зашита в проект: добавьте её в `src/api/client.ts`, если
backend использует токены.

## Возможности

- Dashboard с KPI и графиками Chart.js
- Радар присутствия: поиск, фильтры и карточка компании
- Инвестиционный навигатор: фильтры и карточка проекта
- Калькулятор сделок с проверкой формы и созданием сделки/КП через API
- Коммерческие предложения: просмотр и экспорт CSV/DOCX через backend
- Общие состояния загрузки, ошибок, пустых результатов и подтверждение удаления
