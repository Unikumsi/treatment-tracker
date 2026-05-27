import { useState } from 'react';
import { X } from 'lucide-react';

const photos = [
  'IMG_7743.jpeg',
  'IMG_7744.jpeg',
  'IMG_7745.jpeg',
  'IMG_7746.jpeg',
  'IMG_7747.jpeg',
  'IMG_7748.jpeg',
];

const base = import.meta.env.BASE_URL;

const info = [
  { label: 'Кличка', value: 'Ричи' },
  { label: 'Окрас', value: 'Ред-браун' },
];

export default function Passport() {
  const [zoom, setZoom] = useState(null);

  return (
    <div className="max-w-md mx-auto px-4">
      <div className="mt-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-100 to-amber-100 flex items-center justify-center text-2xl">
            🐶
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 leading-tight">Ричи</h2>
            <p className="text-xs text-slate-500">Международный ветеринарный паспорт</p>
          </div>
        </div>

        <dl className="mt-4 divide-y divide-slate-100">
          {info.map((row) => (
            <div key={row.label} className="flex items-center justify-between py-2.5">
              <dt className="text-sm text-slate-500">{row.label}</dt>
              <dd className="text-sm font-semibold text-slate-800">{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Фото паспорта</h3>
        <div className="grid grid-cols-2 gap-2">
          {photos.map((p) => (
            <button
              key={p}
              onClick={() => setZoom(p)}
              className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 active:scale-95 transition"
            >
              <img
                src={`${base}passport/${p}`}
                alt="Страница паспорта"
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
        <p className="text-[11px] text-slate-400 mt-3 text-center">
          Нажмите на фото, чтобы увеличить
        </p>
      </div>

      {zoom && (
        <div
          className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4"
          onClick={() => setZoom(null)}
        >
          <button
            onClick={() => setZoom(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur flex items-center justify-center text-white"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={`${base}passport/${zoom}`}
            alt="Страница паспорта"
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
