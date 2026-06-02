import { useState } from 'react';
import { ChevronLeft, BookText, FlaskConical, ChevronRight } from 'lucide-react';
import Passport from './Passport.jsx';
import Analyses from './Analyses.jsx';

function BackBar({ onBack, title }) {
  return (
    <div className="max-w-md mx-auto px-4 mt-3">
      <button
        onClick={onBack}
        className="text-sm text-slate-600 hover:text-slate-800 flex items-center gap-1 py-1 px-2 -ml-2 rounded-lg transition"
      >
        <ChevronLeft className="w-4 h-4" />
        Назад
      </button>
    </div>
  );
}

function Card({ icon: Icon, title, desc, accent, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:border-slate-300 active:scale-[0.99] transition flex items-center gap-4`}
    >
      <div className={`w-14 h-14 rounded-2xl ${accent} flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-semibold text-slate-800 leading-tight">{title}</h3>
        <p className="text-xs text-slate-500 mt-1 leading-snug">{desc}</p>
      </div>
      <ChevronRight className="w-5 h-5 text-slate-300 flex-shrink-0" />
    </button>
  );
}

export default function Health() {
  const [view, setView] = useState('select');

  if (view === 'passport') {
    return (
      <>
        <BackBar onBack={() => setView('select')} />
        <Passport />
      </>
    );
  }
  if (view === 'analyses') {
    return (
      <>
        <BackBar onBack={() => setView('select')} />
        <Analyses />
      </>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 mt-4 space-y-3">
      <Card
        icon={BookText}
        accent="bg-gradient-to-br from-sky-400 to-indigo-500"
        title="Паспорт"
        desc="Основные данные, прививки, дегельминтизация"
        onClick={() => setView('passport')}
      />
      <Card
        icon={FlaskConical}
        accent="bg-gradient-to-br from-rose-400 to-amber-400"
        title="Анализы"
        desc="Результаты лабораторных исследований"
        onClick={() => setView('analyses')}
      />
    </div>
  );
}
