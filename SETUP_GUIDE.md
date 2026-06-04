# Гайд: трекер лечения / здоровья питомца

Что есть: веб-приложение на GitHub Pages, синхронизация между устройствами через
Firebase Realtime Database. Открывается по ссылке с любого телефона/компа,
галочки и заметки видны обоим пользователям в реальном времени.

Время полной настройки с нуля: ~20–30 минут.

---

## Что используется

| Слой | Технология | Зачем |
|---|---|---|
| Клиент | React 18 + Vite | UI |
| Стили | Tailwind CSS | Утилитарные классы |
| Иконки | lucide-react | SVG-набор |
| Синхронизация | Firebase Realtime Database (Spark — бесплатный план) | Общая база |
| Хостинг | GitHub Pages (бесплатно для публичных репо) | Раздача статики |
| CI/CD | GitHub Actions | Сборка Vite + деплой на Pages по push |
| Git | gh CLI | Управление репо/секретами из терминала |

**Важно:** GitHub Pages на бесплатном тарифе требует **публичный репо**. Если
нужен приватный — либо платный GitHub Pro ($4/мес), либо Vercel (тоже бесплатно
для приватных, но это второй сервис).

---

## Подготовительные инструменты (один раз на Mac)

```bash
# Homebrew должен уже быть
brew install gh                 # GitHub CLI
npm install -g firebase-tools   # Firebase CLI
```

### Авторизация в GitHub

```bash
gh auth login --web --git-protocol https --hostname github.com
# Откроется код, ввести его на https://github.com/login/device
gh auth setup-git               # чтобы git push работал без логина/пароля
```

Когда дойдёт до `.github/workflows/*.yml` — потребуется доп. scope:
```bash
gh auth refresh -h github.com -s workflow
```

### Авторизация в Firebase

```bash
firebase login:ci
# Откроется браузер → войти в Google → скопировать выданный токен
# Дальше использовать его как FIREBASE_TOKEN в переменной окружения
export FIREBASE_TOKEN='1//...полный токен...'
```

**Подводный камень:** при первом создании проекта Firebase Google требует
вручную принять условия Cloud — иначе CLI выдаёт `Callers must accept Terms of
Service`. Решение: один раз зайти на https://console.firebase.google.com,
нажать «Get started by setting up a Firebase project», создать любой проект
через UI. После этого CLI работает.

Также **первый инстанс Realtime Database** в проекте надо создать через UI
(CLI выдаёт «Please run firebase init database»). Заходите в проект →
Build → Realtime Database → Create Database → europe-west1 → test mode.

---

## Создание Firebase-проекта

После того, как первый раз создали проект через UI (см. выше), всё остальное
делается через CLI.

```bash
# Создать проект (если ещё не через UI)
firebase projects:create <project-id> --display-name "<Имя>" --token "$FIREBASE_TOKEN"

# Создать web-приложение и получить SDK-конфиг
firebase apps:create WEB <nickname> --project <project-id> --token "$FIREBASE_TOKEN"
firebase apps:sdkconfig WEB <app-id> --project <project-id> --token "$FIREBASE_TOKEN" --json
```

В выводе будут `apiKey`, `authDomain`, `databaseURL`, `projectId`, `appId` —
запомнить, эти 5 значений станут секретами GitHub.

### Правила базы

Создать локально `database.rules.json`:

```json
{
  "rules": {
    "treatment": { ".read": true, ".write": true },
    "notes":     { ".read": true, ".write": true },
    "commands":  { ".read": true, ".write": true }
  }
}
```

Деплой через CLI (из папки с `firebase.json` + `.firebaserc`):

```bash
firebase deploy --only database --project <project-id> --token "$FIREBASE_TOKEN"
```

Структура `firebase.json`:
```json
{ "database": { "rules": "database.rules.json" } }
```

И `.firebaserc`:
```json
{ "projects": { "default": "<project-id>" } }
```

**Безопасность:** правила «всем читать/писать» защищены только тем, что URL базы
секретный. Для собачьего трекера — норм. Для серьёзных данных нужны Firebase Auth.

---

## Создание GitHub-репо

```bash
# Из папки с кодом
git init -b main
git add -A && git commit -m "Initial commit"

gh repo create <repo-name> --public --source=. --push

# Включить GitHub Pages с источником "GitHub Actions"
gh api -X POST repos/<user>/<repo-name>/pages -f build_type=workflow
```

### Секреты для GitHub Actions

```bash
gh secret set VITE_FIREBASE_API_KEY      --body "<значение>" --repo <user>/<repo>
gh secret set VITE_FIREBASE_AUTH_DOMAIN  --body "<значение>" --repo <user>/<repo>
gh secret set VITE_FIREBASE_DATABASE_URL --body "<значение>" --repo <user>/<repo>
gh secret set VITE_FIREBASE_PROJECT_ID   --body "<значение>" --repo <user>/<repo>
gh secret set VITE_FIREBASE_APP_ID       --body "<значение>" --repo <user>/<repo>
```

Готовый сайт будет на `https://<user>.github.io/<repo-name>/`.

---

## Структура проекта

```
treatment-tracker/
├── .github/workflows/deploy.yml    # CI: сборка Vite + публикация на Pages
├── public/                         # Статические файлы (favicon и т.п.)
├── src/
│   ├── main.jsx                    # Точка входа React
│   ├── index.css                   # Tailwind директивы
│   ├── firebase.js                 # Подключение к Firebase + хелперы
│   ├── TreatmentTracker.jsx        # Главный компонент с табами
│   ├── Health.jsx                  # Вкладка «Здоровье» (выбор паспорт/анализы)
│   ├── Passport.jsx                # Данные питомца, прививки, дегельминтизация
│   ├── Analyses.jsx                # Результаты анализов
│   ├── Notes.jsx                   # Заметки (синхрон. через Firebase)
│   └── Commands.jsx                # Список команд (синхрон. через Firebase)
├── index.html                      # Корневой HTML с meta-тегами
├── package.json
├── vite.config.js                  # base: '/<repo-name>/'  ← важно для Pages!
├── tailwind.config.js
├── postcss.config.js
├── .env.example                    # Шаблон переменных окружения
└── .gitignore                      # node_modules/, .env*, dist/ и т.п.
```

---

## Где что менять под нового питомца

### 1. Данные питомца — `src/Passport.jsx`

```js
function buildInfo() {
  return [
    { label: 'Кличка', value: '...' },
    { label: 'Порода', value: '...' },
    { label: 'Пол',    value: '...' },
    { label: 'Окрас',  value: '...' },
    { label: 'Дата рождения', value: 'DD.MM.YYYY' },
    { label: 'Возраст', value: formatAge(BIRTH_DATE) },
    { label: 'Клеймо', value: '...' },
  ];
}

const BIRTH_DATE = new Date(YYYY, MM-1, DD);  // месяц 0-based!

const vaccinations = [
  {
    name: '...',
    series: '...',
    expiry: 'MM.YYYY',       // срок годности препарата
    validFrom: 'DD.MM.YYYY', // когда сделали
    validUntil: 'DD.MM.YYYY', // до когда (опционально)
  },
  ...
];

const deworming = [
  { date: 'DD.MM.YYYY', name: '...' },
];
```

### 2. План лечения — `src/TreatmentTracker.jsx`

```js
const PLAN_START = new Date(YYYY, MM-1, DD);  // дата 1-го дня плана
const PLAN_DAYS = 730;                         // 2 года вперёд

const medications = [
  {
    id: 1,
    name: '...',
    detail: '...',
    note: '...',         // опционально
    dosesPerDay: 4,
    startDay: 0,         // индекс относительно PLAN_START
    durationDays: 10,
    recurMonths: 3,      // опц.: повтор каждые N месяцев
    recurEveryDays: 90,  // опц.: повтор каждые N дней
    icon: SomeIcon,      // из lucide-react
    color: 'sky',        // ключ из объекта colors
  },
];
```

Логика `isMedActiveOnDay(med, dayIndex)`:
- одноразовое окно `[startDay, startDay+durationDays)`
- `recurMonths` — активен в день, совпадающий по числу с `startDay`, разница
  месяцев % N === 0
- `recurEveryDays` — `(day-startDay) % N < durationDays`

Скрипт автоматически вычисляет «рабочие» дни (где есть хоть один препарат)
и навигация стрелками перепрыгивает пустые.

### 3. Анализы — `src/Analyses.jsx`

```js
const analyses = [
  {
    title: '...',
    number: '№ ...',
    date: 'DD.MM.YYYY',
    clinic: '...',
    lab: '...',
    doctor: '...',
    results: [
      { metric: '...', method: '...', value: '...', abnormal: true|false },
    ],
    notes: '...',
    abnormal: true,  // подсветит карточку розовым
  },
];
```

### 4. Заметки и команды

Эти вкладки пустые при создании — данные пишутся пользователем в UI,
сохраняются в Firebase, путь `notes/v1` и `commands/v1`.

---

## Деплой при изменениях

```bash
git add -A
git commit -m "..."
git push
```

Push в `main` запускает workflow `.github/workflows/deploy.yml`, который:
1. `npm ci`
2. `npm run build` (с подставленными VITE_* секретами)
3. Артефакт публикуется на Pages

Можно следить: `gh run list --repo <user>/<repo> --limit 1`. Сборка ~1 минуту,
деплой ещё ~30 сек.

---

## Подводные камни и как чинить

| Проблема | Решение |
|---|---|
| `gh push` ругается на workflow scope | `gh auth refresh -h github.com -s workflow` |
| Firebase: `Callers must accept Terms of Service` | Один раз создать проект через console.firebase.google.com |
| Firebase: `It looks like you haven't created a Realtime Database instance` | Build → Realtime Database → Create Database через UI |
| GitHub Pages: 404 после деплоя | Проверить `base: '/<repo-name>/'` в `vite.config.js` |
| Pages не включается | `gh api -X POST repos/<user>/<repo>/pages -f build_type=workflow` |
| После пуша на телефоне старая версия | Закрыть вкладку Safari → открыть заново; на компе `Cmd+Shift+R` |
| Индикатор «офлайн» | Проверить, что 5 секретов VITE_* выставлены в Settings → Secrets |
| Pages не работает на приватном репо | На free-тарифе нужен публичный репо (или Vercel) |

---

## Текущие зависимости (`package.json`)

```json
{
  "dependencies": {
    "firebase": "^11.1.0",
    "lucide-react": "^0.469.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.17",
    "vite": "^6.0.7"
  }
}
```

---

## Промт для другого чата

> Я хочу сделать веб-приложение для трекинга лечения и здоровья моей собаки —
> аналогичное проекту https://github.com/Unikumsi/treatment-tracker (ссылка на
> рабочий сайт: https://unikumsi.github.io/treatment-tracker/). Стек тот же:
> React 18 + Vite + Tailwind + Firebase Realtime Database + GitHub Pages.
> Структура и логика — как в репозитории. Помоги мне:
> 1. Создать новый GitHub-репо
> 2. Создать новый Firebase-проект
> 3. Настроить деплой на GitHub Pages
> 4. Адаптировать данные питомца, план лечения, анализы под мою собаку
>
> Я могу залогиниться в GitHub и Firebase из терминала, gh и firebase CLI
> установлены. Все технические шаги — делай сам, я только подтверждаю
> авторизации и заполняю данные.
>
> Информация о моей собаке:
> - Кличка: ...
> - Порода: ...
> - Пол: ...
> - Окрас: ...
> - Дата рождения: ...
> - План лечения: ...
> - Анализы: ...
