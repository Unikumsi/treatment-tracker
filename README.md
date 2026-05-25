# Ричи — план лечения

Веб-сайт для отслеживания приёма лекарств собакой Ричи.
Два человека отмечают выполнение с любых устройств — изменения
синхронизируются в реальном времени через Firebase Realtime Database.

## Стек

- **React 18 + Vite** — клиент
- **Tailwind CSS** — стили
- **Firebase Realtime Database** — общее хранилище + синхронизация
- **GitHub Pages** — хостинг (через GitHub Actions)

## План лечения

1. **Промывание глаз** — физ. раствор, 5×/день, 10 дней (далее постоянно)
2. **Данцил** (глазные капли) — 4×/день, 10 дней
3. **Здак** — 0,1 мл через шприц в пасть, 1×/день
4. **Прококолин** (пребиотик) — 1 мл, 2×/день

Старт: 25 мая 2026. Длительность: 10 дней.

## Локальный запуск

```bash
npm install
cp .env.example .env.local   # заполнить значениями из Firebase
npm run dev
```

## Настройка Firebase (одноразово)

1. https://console.firebase.google.com → **Add project** → `richie-tracker`
   (Google Analytics — выключить)
2. **Build → Realtime Database → Create Database**
   - регион: `europe-west1`
   - **Start in test mode**
3. **Project settings → Your apps → Web (`</>`)** → имя `richie-web`
4. Скопировать значения из `firebaseConfig` в `.env.local`
5. Realtime Database → **Rules**:
   ```json
   {
     "rules": {
       "treatment": { ".read": true, ".write": true }
     }
   }
   ```

## Деплой через GitHub Pages

1. **Settings → Pages → Build and deployment → Source: GitHub Actions**
2. **Settings → Secrets and variables → Actions → New repository secret**
   — добавить 5 секретов с теми же именами, что в `.env.example`
3. Любой push в `main` запускает `.github/workflows/deploy.yml`,
   собирает Vite и публикует на `https://<user>.github.io/treatment-tracker/`

## Структура

```
.github/workflows/deploy.yml — CI: сборка и деплой на GitHub Pages
src/
  TreatmentTracker.jsx       — главный компонент
  firebase.js                — подписка/запись в Realtime Database
  main.jsx                   — точка входа
  index.css                  — Tailwind
```
