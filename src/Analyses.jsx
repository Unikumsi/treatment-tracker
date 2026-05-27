import { AlertTriangle, CheckCircle2 } from 'lucide-react';

const analyses = [
  {
    title: 'Паразитология',
    number: '№ 260511997',
    date: '27.05.2026',
    clinic: 'Ветцентр Море',
    lab: 'Зайцев+',
    doctor: 'Дуплякова Е.Е.',
    results: [
      {
        metric: 'Яйцеглист / простейшие',
        method: 'формалин-эфирное концентрирование',
        value: 'обнаружено',
        abnormal: true,
      },
    ],
    notes: 'В исследуемом материале обнаружены цисты Giardia spp. (+)',
    abnormal: true,
  },
];

function Section({ title, children }) {
  return (
    <div className="mt-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <h3 className="text-xs font-semibold tracking-wider uppercase text-slate-400 mb-3">{title}</h3>
      {children}
    </div>
  );
}

function AnalysisCard({ a }) {
  return (
    <div
      className={`mt-4 bg-white rounded-2xl border shadow-sm overflow-hidden ${
        a.abnormal ? 'border-rose-200 ring-1 ring-rose-100' : 'border-slate-200'
      }`}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-base font-bold text-slate-800 leading-tight">{a.title}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{a.number}</p>
          </div>
          <div className="text-xs text-slate-500 tabular-nums whitespace-nowrap pt-0.5">{a.date}</div>
        </div>

        <div className="mt-4 space-y-2.5">
          {a.results.map((r, i) => (
            <div
              key={i}
              className={`rounded-xl border p-3 ${
                r.abnormal ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2 min-w-0">
                  {r.abnormal ? (
                    <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="text-sm font-semibold text-slate-800 leading-tight">{r.metric}</div>
                    {r.method && <div className="text-[11px] text-slate-500 mt-0.5">метод: {r.method}</div>}
                  </div>
                </div>
                <div
                  className={`text-sm font-semibold whitespace-nowrap ${
                    r.abnormal ? 'text-rose-700' : 'text-emerald-700'
                  }`}
                >
                  {r.value}
                </div>
              </div>
            </div>
          ))}
        </div>

        {a.notes && (
          <div className="mt-3 text-xs text-slate-600 leading-snug">
            <span className="font-semibold text-slate-500">Заключение: </span>
            {a.notes}
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 space-y-0.5">
          <div>Клиника: <span className="text-slate-600">{a.clinic}</span></div>
          <div>Лаборатория: <span className="text-slate-600">{a.lab}</span></div>
          <div>Врач: <span className="text-slate-600">{a.doctor}</span></div>
        </div>
      </div>
    </div>
  );
}

export default function Analyses() {
  if (analyses.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4">
        <Section title="Анализы">
          <p className="text-sm text-slate-500">Пока нет результатов</p>
        </Section>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4">
      {analyses.map((a, i) => (
        <AnalysisCard key={i} a={a} />
      ))}
    </div>
  );
}
