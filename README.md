# Ричи — план лечения

Веб-приложение для отслеживания приёма лекарств собакой Ричи.
Два пользователя могут отмечать выполнение с любых устройств — изменения
синхронизируются в реальном времени через Firebase Realtime Database.

## Стек

- **React 18 + Vite** — клиент
- **Tailwind CSS** — стили
- **Firebase Realtime Database** — общее хранилище + синхронизация
- **Vercel** — хостинг

## План лечения

1. **Промывание глаз** — физ. раствор, 5×/день, 10 дней (далее постоянно)
2. **Данцил** (глазные капли) — 4×/день, 10 дней
3. **Здак** — 0,1 мл через шприц в пасть, 1×/день
4. **Прококолин** (пребиотик) — 1 мл, 2×/день

Старт: 25 мая 2026. Длительность: 10 дней.

## Локальный запуск

```bash
npm install
cp .env.example .env.local   # заполните значениями из Firebase
npm run dev
```

## Настройка Firebase (одноразово)

1. Зайти на https://console.firebase.google.com → **Add project**
   (выключить Google Analytics — не нужен)
2. В проекте: **Build → Realtime Database → Create database**
   - регион: `europe-west1` (или ближайший)
   - режим: **Start in test mode** (правила открыты на 30 дней)
3. **Project settings (шестерёнка) → Your apps → Web (`</>`)**
   - имя: `richie-web`, регистрируем без Hosting
   - копируем значения из объекта `firebaseConfig` в `.env.local`
4. Правила доступа (Realtime Database → Rules):
   ```json
   {
     "rules": {
       "treatment": { ".read": true, ".write": true }
     }
   }
   ```
   Защита — секретный URL Vercel.

## Деплой на Vercel

1. https://vercel.com → войти через GitHub
2. **Add New → Project → Import** репозиторий `Unikumsi/treatment-tracker`
3. Framework: Vite (определит автоматически)
4. **Environment Variables** — вставить те же 5 переменных, что в `.env.local`
5. **Deploy** → получим URL вида `richie-tracker.vercel.app`

Этот URL открываем на телефоне, добавляем «На главный экран» — будет
выглядеть как обычное приложение.

## Структура

```
src/
  TreatmentTracker.jsx   — главный компонент
  firebase.js            — подписка/запись в Realtime Database
  main.jsx               — точка входа
  index.css              — Tailwind
```
