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


## Авторизация и OpenAPI

Интерфейс использует bearer-токен: после входа токен сохраняется в `localStorage` под ключом `rt_access_token` и автоматически добавляется к защищённым запросам. Защищённые страницы перенаправляют на `/login`, если токен отсутствует. Поддержаны регистрация, вход, проверка 2FA при входе, профиль пользователя и страница `/security` для настройки, подтверждения и отключения 2FA.

Списки и фильтры приведены к параметрам OpenAPI: `search`, `region`, `industry`, `potential_only`, `stage`, `status`, `project_id`, `deal_id`, `page`, `page_size`. Экспорт CSV подключён к серверным endpoint-ам компаний, проектов, сделок и предложений. Калькулятор передаёт `analog_prices` в `POST /api/deals/calculate`.

Проверьте `VITE_API_URL` в `.env` (базовый URL FastAPI без завершающего `/`). Для локальной разработки: `npm.cmd install`, затем `npm.cmd run dev`.

## Что изменено в версии с фиолетово-оранжевой темой

- Добавлен экран входа/регистрации и обязательный вход перед переходом к защищённым разделам.
- Bearer-токен автоматически добавляется к защищённым запросам.
- Добавлена страница безопасности аккаунта с настройкой и отключением 2FA.
- Компании: фильтры согласованы с OpenAPI, добавлен фильтр потенциальных клиентов и CSV-экспорт.
- Проекты: добавлен CSV-экспорт.
- Калькулятор: выбор проекта из API, передача цен аналогов в расчёт, список последних сделок и экспорт CSV.
- Коммерческие предложения: добавлен фильтр по ID сделки; доступны CSV и DOCX выгрузки.
- Полная спецификация API приложена в `docs/openapi.json`.
