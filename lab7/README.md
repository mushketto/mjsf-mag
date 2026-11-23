# Лабораторна робота №7. Створення приватної сторінки редагування товарів із Pinia та Vue Router

## 1. Структура компонентів та модулів

Застосунок побудований на базі Vue 3.5.43 (Composition API, `<script setup>`), Vue Router 4.6.4 та Pinia 3.0.4 із розділенням на спільні сховища (`stores`), клієнтські модулі авторизації та чернеток (`auth`, `api`), композиційні функції (`composables`), гарди (`router/guards.js`), оболонки (`layouts`) і представлення (`views`):

```
src/
├── api/
│   ├── products.js — Формування URL каталогу й товару через URLSearchParams та валідація числового id
│   ├── http.js — Загальний JSON HTTP-клієнт (response.ok, статус помилки, AbortSignal, Bearer, credentials: 'omit')
│   └── productDraft.js — Нормалізація, перевіркаdirty-стану та валідація полів форми редагування
├── auth/
│   └── session.js — Збереження, читання та очищення виключно accessToken у sessionStorage
├── stores/
│   ├── index.js — Єдиний екземпляр createPinia
│   ├── auth.js — Setup Store сеансу (accessToken, user, status, error, isAuthenticated, isBusy, login, restore, request, logout)
│   └── products.js — Setup Store підтверджених змін поточного сеансу (overridesById, save, applyConfirmedChanges, reset)
├── composables/
│   ├── usePrivateResource.js — Реактивне приватне читання через auth.request із очищенням і скасуванням запитів
│   ├── useBreadcrumbs.js — Побудова масиву крихт за route.matched, meta.breadcrumb і реактивною назвою товару
│   ├── useFetch.js — Публічне завантаження з підтримкою null URL, очищенням старих даних та AbortController
│   ├── useDebouncedValue.js — Відкладене оновлення значення (400 мс) з очищенням попереднього таймера
│   └── useIntersectionObserver.js — Підписка на перетин нижнього маркера та disconnect() при розмонтуванні
├── router/
│   ├── index.js — Конфігурація маршрутів (публічні, /login, приватні /manage/products, redirect, catch-all)
│   └── guards.js — Глобальний beforeEach із очікуванням auth.restore() та перевіркою безпечного query.redirect
├── layouts/
│   ├── ManageLayout.vue — Приватна оболонка з RouterView, перевіркою сеансу та реакцією на завершення сеансу
│   ├── ProductLayout.vue — Спільна оболонка товару (огляд і відгуки) із накладанням підтверджених змін
│   └── ProductsLayout.vue — Оболонка розділу /products із вкладеним RouterView
├── views/
│   ├── LoginView.vue — Форма входу з локальним паролем, блокуванням повторного натискання та повтором перевірки сеансу
│   ├── ManageProductsView.vue — Приватний список товарів по 12 елементів із пагінацією skip та посиланнями на редактор
│   ├── ProductEditView.vue — Форма редагування товару з валідацією, фокусом на помилку та захистом виходу
│   ├── ProductCatalogView.vue — Публічний каталог із синхронізацією пошуку з query.q та дозавантаженням
│   ├── ProductOverviewView.vue — Опис і характеристики товару
│   ├── ProductReviewsView.vue — Відгуки покупців або порожній стан
│   ├── AboutView.vue — Відомості про застосунок
│   └── NotFoundView.vue — Сторінка 404 для невідомих маршрутів
├── components/
│   ├── Breadcrumbs.vue — Навігаційний ланцюжок (nav, ol, RouterLink, aria-current="page")
│   ├── ProductSearchForm.vue — Поле пошуку з контрактом v-model
│   ├── ProductCatalog.vue — Сітка товарів, скелетони, помилка та порожній стан
│   ├── ProductCard.vue — Картка товару з переходом на product-overview і збереженням query.q
│   └── CatalogLoadMore.vue — Нижній маркер дозавантаження
├── styles/
│   └── main.css — BEM-стилі каталогу, навігації, хлібних крихт, форм і приватного розділу
├── App.vue — Загальна оболонка застосунку (шапка з профілем/виходом, навігація, зовнішній RouterView, підвал)
└── main.js — Підключення pinia перед router до app.mount()

```

## 2. Версії залежностей

Проєкт використовує наступні версії ключових технологій:

* **Node.js**: 24.x LTS

* **Vue**: 3.5.43

* **Vue Router**: 4.6.4

* **Pinia**: 3.0.4

* **Vite**: за конфігурацією стартера

* **API**: DummyJSON Auth та Products API (`https://dummyjson.com`)

## 3. Команди запуску та збірки

Встановлення залежностей відповідно до `package-lock.json`:

```
npm ci

```

Встановлення точних версій Vue, Vue Router та Pinia:

```
npm install --save-exact vue@3.5.43 vue-router@4.6.4 pinia@3.0.4

```

Запуск локального сервера для розробки на порту `5177`:

```
npm run dev -- --port 5177 --strictPort

```

Створення оптимізованої виробничої збірки проєкту:

```
npm run build

```

Локальна перевірка зібраного проєкту та прямих приватних адрес через `vite preview`:

```
npm exec vite preview -- --port 5177 --strictPort

```

## 4. Дерево маршрутів

```
/                                      ──▶ redirect { name: 'products' }
/products                              ──▶ ProductsLayout (meta.breadcrumb: 'Каталог')
├── ''                                 ──▶ ProductCatalogView [name: 'products']
└── :id                                ──▶ ProductLayout (meta.breadcrumb: dynamic 'product')
    ├── ''                             ──▶ ProductOverviewView [name: 'product-overview']
    └── reviews                        ──▶ ProductReviewsView [name: 'product-reviews'] (meta.breadcrumb: 'Відгуки')
/login                                 ──▶ LoginView [name: 'login'] (meta.breadcrumb: 'Вхід')
/manage/products                       ──▶ ManageLayout [meta.requiresAuth: true] (meta.breadcrumb: 'Керування')
├── ''                                 ──▶ ManageProductsView [name: 'manage-products']
└── :id/edit                           ──▶ ProductEditView [name: 'manage-edit'] (meta.breadcrumb: dynamic 'manage-product')
/about                                 ──▶ AboutView [name: 'about'] (meta.breadcrumb: 'Про застосунок')
/:pathMatch(.*)*                       ──▶ NotFoundView [name: 'not-found'] (meta.breadcrumb: 'Сторінку не знайдено')

```

## 5. Відповідальність модулів та власники стану

| Модуль | Входи | Виходи | Власний стан / Ресурси | Відповідальність | 
| ----- | ----- | ----- | ----- | ----- | 
| **`stores/auth.js`** | Облікові дані `login`, токен із `sessionStorage`, запити `request` | `accessToken`, `user`, `status`, `error`, `isAuthenticated`, `isBusy`, `displayName` | `accessToken`, `user`, `status`, `error`, `endReason`, `sessionVersion`, контролер запиту | Керування сеансом, вхід (`POST /auth/login`), перевірка токена (`GET /auth/me`), авторизовані запити, обробка `401` та вихід | 
| **`stores/products.js`** | `id`, копія нормалізованої чернетки `draftPayload` | `overridesById`, `savingIds`, `saveError`, `hasConfirmedChanges`, `applyConfirmedChanges` | `overridesById`, `savingIds`, `saveError`, `activeControllers` | Зберігання лише підтверджених змін поточного сеансу, виконання `PATCH /auth/products/:id`, перевірка актуальності та `reset()` | 
| **`api/http.js`** | `path`, `method`, `token`, `body`, `signal` | Розпарсений JSON або `HttpError` зі збереженим `status` | Немає | Єдиний НТТР-клієнт із `credentials: 'omit'`, `Authorization: Bearer`, `AbortSignal` і розрізненням `401` | 
| **`api/productDraft.js`** | Об'єкт товару, чернетка та початкова копія | Стан `isDirty`, результат валідації `{ isValid, errors, normalized }` | Немає | Створення локальної чернетки, порівняння змін і перевірка `title`, `price`, `stock`, `description` | 
| **`auth/session.js`** | Рядок токена | Токен або `null` | `window.sessionStorage` (ключ `accessToken`) | Ізольована робота з `sessionStorage` виключно для `accessToken` | 
| **`composables/usePrivateResource.js`** | `pathSource` (`MaybeRefOrGetter<string | null>`) | `data`, `error`, `isLoading`, `abort`, `refetch` | `data`, `error`, `isLoading`, `reloadToken`, `activeController` | Реактивне приватне читання через `auth.request` із очищенням старих даних, підтримкою `null` та скасуванням | 
| **`router/guards.js`** | Екземпляри `router` та `pinia`, ціль `to` | Дозвіл або перенаправлення на `login` / безпечну ціль | Немає | Очікування `auth.restore()` у глобальному `beforeEach` і валідація `query.redirect` за дозволеними маршрутами | 
| **`layouts/ManageLayout.vue`** | `route.meta.requiresAuth`, `auth.isAuthenticated`, `auth.endReason` | Вкладений `RouterView` та пояснення моделі сеансу | Немає | Показ приватного вмісту лише для автентифікованого сеансу та перехід при `401` або виході | 
| **`views/LoginView.vue`** | Події форми, `route.query.redirect`, стан `auth` | Виклик `auth.login(...)` або `auth.restore(true)`, `router.replace(...)` | Локальні `username`, `password`, `localError` | Форма входу з очищенням пароля після відправки, показ помилок і повторна перевірка при мережевому збої | 
| **`views/ManageProductsView.vue`** | Сторінка через `skip`, підтверджені зміни `productsStore` | Список по 12 товарів, пагінація, посилання на `manage-edit` | Локальний `skip` | Відображення приватного списку з ціною, залишком і навігацією до редагування | 
| **`views/ProductEditView.vue`** | `route.params.id`, приватний товар, `productsStore` | Виклик `productsStore.save(...)`, скасування змін, гарди виходу/оновлення | Локальні `draft`, `initialDraft`, `fieldErrors`, `saveFeedback` | Редагування полів, валідація з фокусом на першу помилку, підтвердження втрати незбережених змін і `beforeunload` | 
| **`App.vue`** | Стан `authStore` | Шапка, основна навігація, зовнішній `RouterView`, підвал із даними автора | Немає | Загальна оболонка застосунку, виведення імені користувача та кнопки виходу через `storeToRefs` | 

## 6. Життєвий цикл сеансу та межі DummyJSON і sessionStorage

### Життєвий цикл сеансу
1. **Початкове завантаження / `reload`:** під час першого переходу глобальний гард `router.beforeEach` викликає `await auth.restore()` (після підключення `pinia` перед `router` у `main.js`). Якщо в `sessionStorage` є `accessToken`, виконується запит `GET /auth/me` із заголовком `Authorization: Bearer <token>`. Паралельні виклики `restore()` очікують один активний `Promise`.
2. **Обробка результату перевірки токена:** за успіху встановлюється статус `authenticated` та завантажується профіль `user`. За відповіді `401` або підробленого токена сеанс і токен очищаються (`guest`). За мережевої помилки токен зберігається в `sessionStorage` для повторної спроби, але доступ до приватних маршрутів залишається закритим зі станом `unavailable`.
3. **Вхід (`login`):** надсилає `POST /auth/login` із `credentials: 'omit'`; пароль залишається локальним у `LoginView` і очищається одразу після передавання. Повторний запуск під час активного входу заблоковано (`isBusy`).
4. **Завершення сеансу (`logout` або `401`):** інкрементується `sessionVersion`, скасовуються незавершені операції, очищається `accessToken` у `sessionStorage`, скидається стан `auth` і викликається `productsStore.reset()`. Пізні відповіді `login`, `restore`, `request` або `PATCH` із попереднім `sessionVersion` ігноруються й не відновлюють старий стан.

### Межі навчальної моделі DummyJSON та `sessionStorage`
* Навчальний API DummyJSON імітує операції `POST /auth/login`, `GET /auth/me`, `GET /auth/products` та `PATCH /auth/products/:id`, але **не зберігає зміни товарів у постійній базі на сервері**. Тому повторний `GET /auth/products/:id` або повне оновлення сторінки (`reload`) повертає початкові серверні значення товару, а підтверджені редагування живуть лише в реактивному стані `productsStore` поточного сеансу (без запису в `Web Storage`).
* У `sessionStorage` зберігається **лише `accessToken`** — сам по собі наявний у сховищі токен не вважається підтвердженим входом без перевірки через `/auth/me` на сервері, а пароль та `refreshToken` у `sessionStorage` не зберігаються.

## 7. Таблиця сценаріїв перевірки

| № | Сценарій | Очікуваний результат | Фактичний результат | URL | HTTP-статус | Кількість операцій входу / PATCH | 
| ----- | ----- | ----- | ----- | ----- | ----- | ----- | 
| 1 | Прямий приватний маршрут гостя та повернення | Гість потрапляє на `/login?redirect=...` без показу редактора; після успіху відкривається цільовий маршрут | Відповідає очікуваному | `/manage/products/12/edit` → `/login` → `/manage/products/12/edit` | `200` (після входу) | 1 вхід (`POST /auth/login`) | 
| 2 | Неправильний пароль і повторний клік | Показується помилка без створення токена; швидкий повторний клік не створює другого `POST` | Відповідає очікуваному | `/login` | `400` | 1 спроба входу | 
| 3 | `Reload` із токеном та підроблений токен | Чинний токен перевіряється через `/auth/me`; підроблений токен вилучається й закриває доступ | Відповідає очікуваному | `/manage/products` | `200` / `401` | 0 входів, 0 `PATCH` | 
| 4 | Мережевий збій під час `restore` (`Offline` + повтор) | При помилці мережі під час `GET /auth/me` приватний вміст закритий, токен лишається; після повернення онлайн повтор відновлює доступ | Відповідає очікуваному | `/manage/products` | Мережева помилка → `200` | 0 входів, 0 `PATCH` | 
| 5 | Пагінація приватного списку та `id` | Список перегортається через `skip`, відкриває потрібний `:id/edit`; некоректний `id` не робить запиту, `404` показує окремий стан | Відповідає очікуваному | `/manage/products`, `/manage/products/12/edit`, `/manage/products/999999/edit` | `200` / `404` | 0 входів, 0 `PATCH` | 
| 6 | Валідація форми редагування | Порожня назва, `price <= 0`, дробовий/порожній `stock` і порожній опис виводять помилки без `PATCH`, фокус іде на перше поле з помилкою | Відповідає очікуваному | `/manage/products/12/edit` | Запит не надсилається | 0 `PATCH` | 
| 7 | Чернетка, «Скасувати зміни» та вихід | Зміна поля не мутує підтверджені дані до збереження; скасування відновлює без запиту; відмова лишає чернетку відкритою | Відповідає очікуваному | `/manage/products/12/edit` | Запит не надсилається | 0 `PATCH` | 
| 8 | Успішне збереження `PATCH` та `reload` | Оновлює приватний список, публічну сторінку й крихту в поточному сеансі; після `reload` повертаються серверні дані з повторною перевіркою сеансу | Відповідає очікуваному | `/manage/products/12/edit` | `200` | 1 `PATCH` | 
| 9 | Помилка `PATCH` і повтор збереження | За помилки збереження підтверджені дані та чернетка лишаються; після відновлення мережі збереження можна повторити | Відповідає очікуваному | `/manage/products/12/edit` | Помилка → `200` | 1 невдалий + 1 успішний `PATCH` | 
| 10 | Вихід під час активного `PATCH` | Пізня відповідь `PATCH` після виходу не повертає зміни або сеанс; повторний вхід починає роботу без старих локальних змін | Відповідає очікуваному | `/manage/products/12/edit` → `/products` | `200` (скасовано/ігноровано) | 1 `PATCH` (ігноровано після виходу) | 
| 11 | Обробка `401` на приватному запиті | За `401` клієнт завершує сеанс, очищає токен і зміни та переводить на `/login` | Відповідає очікуваному | `/manage/products` → `/login` | `401` | 0 входів, 0 `PATCH` | 
| 12 | Адаптивність (`360×800`, `768×1024`, `1440×900`, `844×390`) та клавіатура | Немає горизонтального скролу й обрізаних полів; навігація й форми доступні через `Tab`, `Shift+Tab` та `Enter` | Відповідає очікуваному | `/login`, `/manage/products`, `/manage/products/12/edit` | `200` | — | 
