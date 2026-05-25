import { useState, useEffect } from 'react';
import { Check, ChevronLeft, ChevronRight, RotateCcw, Droplets, Eye, Syringe, Pill, Sparkles } from 'lucide-react';

const PLAN_START = new Date(2026, 4, 25); // 25 мая 2026
const PLAN_DAYS = 10;
const STORAGE_KEY = 'treatment-tracker-v1';

const medications = [
  {
    id: 1,
    name: 'Промывание глаз',
    detail: 'Физ. раствор, от внешнего к внутреннему уголку',
    note: 'После 10 дней — продолжать постоянно',
    dosesPerDay: 5,
    icon: Droplets,
    color: 'sky',
  },
  {
    id: 2,
    name: 'Данцил',
    detail: 'Глазные капли, по 1 капле',
    dosesPerDay: 4,
    icon: Eye,
    color: 'indigo',
  },
  {
    id: 3,
    name: 'Здак',
    detail: '0,1 мл через шприц в пасть',
    dosesPerDay: 1,
    icon: Syringe,
    color: 'amber',
  },
  {
    id: 4,
    name: 'Прококолин',
    detail: 'Пребиотик, по 1 мл',
    dosesPerDay: 2,
    icon: Pill,
    color: 'emerald',
  },
];

const colors = {
  sky:     { soft: 'bg-sky-50',     softer: 'bg-sky-100/60',     text: 'text-sky-700',     border: 'border-sky-200',     solid: 'bg-sky-500',     ring: 'ring-sky-200' },
  indigo:  { soft: 'bg-indigo-50',  softer: 'bg-indigo-100/60',  text: 'text-indigo-700',  border: 'border-indigo-200',  solid: 'bg-indigo-500',  ring: 'ring-indigo-200' },
  amber:   { soft: 'bg-amber-50',   softer: 'bg-amber-100/60',   text: 'text-amber-700',   border: 'border-amber-200',   solid: 'bg-amber-500',   ring: 'ring-amber-200' },
  emerald: { soft: 'bg-emerald-50', softer: 'bg-emerald-100/60', text: 'text-emerald-700', border: 'border-emerald-200', solid: 'bg-emerald-500', ring: 'ring-emerald-200' },
};

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function getTodayIndex() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(PLAN_START);
  start.setHours(0, 0, 0, 0);
  const diff = Math.floor((today - start) / 86400000);
  return Math.max(0, Math.min(diff, PLAN_DAYS - 1));
}

function formatDate(d) {
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
}

function formatWeekday(d) {
  return d.toLocaleDateString('ru-RU', { weekday: 'long' });
}

export default function TreatmentTracker() {
  const [data, setData] = useState({});
  const [currentDay, setCurrentDay] = useState(getTodayIndex());
  const [confirmReset, setConfirmReset] = useState(false);
  const [celebrated, setCelebrated] = useState({});

  useEffect(() => {
    const loadFromStorage = async () => {
      try {
        const result = await window.storage.get(STORAGE_KEY, true);
        if (result?.value) setData(JSON.parse(result.value));
      } catch (e) {
        // нет сохранённых данных — это нормально
      }
    };
    loadFromStorage();
    const onVisible = () => {
      if (document.visibilityState === 'visible') loadFromStorage();
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', loadFromStorage);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', loadFromStorage);
    };
  }, []);

  const saveData = async (newData) => {
    setData(newData);
    try {
      await window.storage.set(STORAGE_KEY, JSON.stringify(newData), true);
    } catch (e) {
      console.error('Не удалось сохранить', e);
    }
  };

  const dayKey = String(currentDay);
  const dayData = data[dayKey] || {};

  const toggleDose = (medId, doseIdx) => {
    const newData = { ...data };
    if (!newData[dayKey]) newData[dayKey] = {};
    if (!newData[dayKey][medId]) newData[dayKey][medId] = [];
    const arr = [...newData[dayKey][medId]];
    arr[doseIdx] = !arr[doseIdx];
    newData[dayKey][medId] = arr;
    saveData(newData);
  };

  const isChecked = (medId, doseIdx) => !!dayData[medId]?.[doseIdx];

  const medCompleted = (med) => {
    const arr = dayData[med.id] || [];
    let n = 0;
    for (let i = 0; i < med.dosesPerDay; i++) if (arr[i]) n++;
    return n;
  };

  const dayTotalDoses = medications.reduce((s, m) => s + m.dosesPerDay, 0);
  const dayCompleted = medications.reduce((s, m) => s + medCompleted(m), 0);
  const dayPercent = Math.round((dayCompleted / dayTotalDoses) * 100);
  const dayFullyDone = dayCompleted === dayTotalDoses;

  const dayDate = addDays(PLAN_START, currentDay);
  const todayIdx = getTodayIndex();
  const isToday = currentDay === todayIdx;

  const reset = async () => {
    await saveData({});
    setConfirmReset(false);
  };

  // Прогресс по всем дням для мини-полоски сверху
  const allDaysProgress = Array.from({ length: PLAN_DAYS }, (_, i) => {
    const dd = data[String(i)] || {};
    let done = 0;
    medications.forEach(m => {
      const arr = dd[m.id] || [];
      for (let j = 0; j < m.dosesPerDay; j++) if (arr[j]) done++;
    });
    return done / dayTotalDoses;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-50 to-white pb-12">
      {/* Заголовок */}
      <div className="bg-white/80 backdrop-blur border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-3.5">
          <div className="flex items-baseline justify-between">
            <h1 className="text-lg font-bold text-slate-800">План лечения</h1>
            <span className="text-xs text-slate-400">10 дней</span>
          </div>
          {/* Полоска прогресса по всем дням */}
          <div className="mt-3 flex gap-1">
            {allDaysProgress.map((p, i) => (
              <button
                key={i}
                onClick={() => setCurrentDay(i)}
                className={`flex-1 h-1.5 rounded-full overflow-hidden transition ${
                  i === currentDay ? 'ring-2 ring-slate-400 ring-offset-1' : ''
                }`}
                aria-label={`День ${i + 1}`}
              >
                <div className="w-full h-full bg-slate-200 relative">
                  <div
                    className={`h-full transition-all ${p === 1 ? 'bg-emerald-500' : 'bg-slate-400'}`}
                    style={{ width: `${p * 100}%` }}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4">
        {/* Навигация по дням */}
        <div className="mt-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentDay(Math.max(0, currentDay - 1))}
              disabled={currentDay === 0}
              className="w-10 h-10 rounded-full bg-slate-100 disabled:opacity-30 hover:bg-slate-200 active:scale-95 transition flex items-center justify-center"
            >
              <ChevronLeft className="w-5 h-5 text-slate-700" />
            </button>

            <div className="text-center">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
                День {currentDay + 1} из {PLAN_DAYS}
                {isToday && <span className="ml-1.5 text-emerald-600">• сегодня</span>}
              </div>
              <div className="text-lg font-semibold text-slate-800 leading-tight mt-0.5">
                {formatDate(dayDate)}
              </div>
              <div className="text-xs text-slate-500 capitalize">{formatWeekday(dayDate)}</div>
            </div>

            <button
              onClick={() => setCurrentDay(Math.min(PLAN_DAYS - 1, currentDay + 1))}
              disabled={currentDay === PLAN_DAYS - 1}
              className="w-10 h-10 rounded-full bg-slate-100 disabled:opacity-30 hover:bg-slate-200 active:scale-95 transition flex items-center justify-center"
            >
              <ChevronRight className="w-5 h-5 text-slate-700" />
            </button>
          </div>

          {/* Полоска прогресса дня */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-500">Прогресс дня</span>
              <span className="font-semibold text-slate-700">
                {dayCompleted} / {dayTotalDoses}
              </span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  dayFullyDone
                    ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                    : 'bg-gradient-to-r from-slate-400 to-slate-500'
                }`}
                style={{ width: `${dayPercent}%` }}
              />
            </div>
          </div>

          {dayFullyDone && (
            <div className="mt-3 flex items-center justify-center gap-1.5 text-emerald-600 text-sm font-medium animate-in fade-in">
              <Sparkles className="w-4 h-4" />
              Все процедуры на сегодня выполнены
            </div>
          )}
        </div>

        {/* Карточки лекарств */}
        <div className="mt-4 space-y-3">
          {medications.map((med, idx) => {
            const c = colors[med.color];
            const Icon = med.icon;
            const done = medCompleted(med);
            const allDone = done === med.dosesPerDay;

            return (
              <div
                key={med.id}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
                  allDone ? 'border-emerald-200 ring-1 ring-emerald-100' : 'border-slate-200'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-11 h-11 rounded-xl ${c.soft} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${c.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-800 leading-tight">
                          <span className="text-slate-400 mr-1">{idx + 1}.</span>
                          {med.name}
                        </h3>
                        {allDone && (
                          <div className="ml-auto w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                            <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-snug">{med.detail}</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {med.dosesPerDay}× в день
                        {med.note && ` • ${med.note}`}
                      </p>
                    </div>
                  </div>

                  {/* Чекбоксы доз */}
                  <div className="flex gap-2 mt-3.5">
                    {Array.from({ length: med.dosesPerDay }).map((_, i) => {
                      const checked = isChecked(med.id, i);
                      return (
                        <button
                          key={i}
                          onClick={() => toggleDose(med.id, i)}
                          className={`flex-1 h-12 rounded-xl border-2 transition-all active:scale-95 flex items-center justify-center font-semibold text-sm ${
                            checked
                              ? `${c.solid} border-transparent text-white shadow-sm`
                              : `bg-white ${c.border} ${c.text}`
                          }`}
                          aria-label={`Доза ${i + 1}`}
                        >
                          {checked ? <Check className="w-5 h-5" strokeWidth={3} /> : i + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Сброс */}
        <div className="mt-8 flex justify-center">
          {!confirmReset ? (
            <button
              onClick={() => setConfirmReset(true)}
              className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1.5 transition py-2 px-3"
            >
              <RotateCcw className="w-3 h-3" />
              Сбросить весь прогресс
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-full p-1 shadow-sm">
              <span className="text-xs text-slate-600 pl-3">Точно сбросить?</span>
              <button
                onClick={reset}
                className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-full font-medium hover:bg-red-600 transition"
              >
                Да, сбросить
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="text-xs text-slate-500 px-2 py-1.5 hover:text-slate-700 transition"
              >
                Отмена
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
