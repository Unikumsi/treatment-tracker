const BIRTH_DATE = new Date(2026, 1, 12); // 12 февраля 2026

function formatAge(birth) {
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  let days = now.getDate() - birth.getDate();
  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  const parts = [];
  if (years > 0) parts.push(`${years} ${plural(years, 'год', 'года', 'лет')}`);
  if (months > 0) parts.push(`${months} ${plural(months, 'месяц', 'месяца', 'месяцев')}`);
  if (years === 0 && months < 2 && days > 0) parts.push(`${days} ${plural(days, 'день', 'дня', 'дней')}`);
  return parts.join(' ') || 'менее суток';
}

function plural(n, one, few, many) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

function buildInfo() {
  return [
    { label: 'Кличка', value: 'Ричи' },
    { label: 'Порода', value: 'Той-пудель' },
    { label: 'Пол', value: 'Кобель' },
    { label: 'Окрас', value: 'Ред-браун' },
    { label: 'Дата рождения', value: '12.02.2026' },
    { label: 'Возраст', value: formatAge(BIRTH_DATE) },
    { label: 'Клеймо', value: 'E6P7452' },
  ];
}

const vaccinations = [
  { date: '10.03.2026', name: 'Nobivac KC', note: 'питомниковый кашель' },
  { date: '12.04.2026', name: 'Мультикан-3' },
  { date: '10.05.2026', name: 'Мультикан-8', note: 'комплексная' },
];

const deworming = [
  { date: '09.04.2026', name: 'Фенпраз' },
];

function Section({ title, children }) {
  return (
    <div className="mt-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <h3 className="text-xs font-semibold tracking-wider uppercase text-slate-400 mb-3">{title}</h3>
      {children}
    </div>
  );
}

export default function Passport() {
  const info = buildInfo();
  return (
    <div className="max-w-md mx-auto px-4">
      {/* Шапка */}
      <div className="mt-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-rose-100 to-amber-100 flex items-center justify-center text-3xl">
            🐶
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 leading-tight">Ричи</h2>
            <p className="text-xs text-slate-500">Ветеринарный паспорт</p>
          </div>
        </div>
      </div>

      {/* Основное */}
      <Section title="Основная информация">
        <dl className="divide-y divide-slate-100">
          {info.map((row) => (
            <div key={row.label} className="flex items-center justify-between py-2.5">
              <dt className="text-sm text-slate-500">{row.label}</dt>
              <dd className="text-sm font-semibold text-slate-800">{row.value}</dd>
            </div>
          ))}
        </dl>
      </Section>

      {/* Прививки */}
      <Section title="Прививки">
        <ul className="space-y-2.5">
          {vaccinations.map((v) => (
            <li key={v.date + v.name} className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-slate-800 leading-tight">{v.name}</div>
                {v.note && <div className="text-xs text-slate-500 mt-0.5">{v.note}</div>}
              </div>
              <div className="text-xs text-slate-500 tabular-nums whitespace-nowrap pt-0.5">{v.date}</div>
            </li>
          ))}
        </ul>
      </Section>

      {/* Дегельминтизация */}
      <Section title="Дегельминтизация">
        <ul className="space-y-2.5">
          {deworming.map((d) => (
            <li key={d.date + d.name} className="flex items-start justify-between gap-3">
              <div className="text-sm font-semibold text-slate-800">{d.name}</div>
              <div className="text-xs text-slate-500 tabular-nums whitespace-nowrap pt-0.5">{d.date}</div>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}
