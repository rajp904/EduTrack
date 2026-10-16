import React from 'react';

export default function StatCard({ title, value, subtext, icon: Icon, color = 'indigo', badge }) {
  const colorMap = {
    indigo: {
      bg: 'bg-indigo-50 text-indigo-600',
      border: 'border-indigo-100 hover:border-indigo-300',
      accent: 'text-indigo-600'
    },
    emerald: {
      bg: 'bg-emerald-50 text-emerald-600',
      border: 'border-emerald-100 hover:border-emerald-300',
      accent: 'text-emerald-600'
    },
    amber: {
      bg: 'bg-amber-50 text-amber-600',
      border: 'border-amber-100 hover:border-amber-300',
      accent: 'text-amber-600'
    },
    rose: {
      bg: 'bg-rose-50 text-rose-600',
      border: 'border-rose-100 hover:border-rose-300',
      accent: 'text-rose-600'
    },
    sky: {
      bg: 'bg-sky-50 text-sky-600',
      border: 'border-sky-100 hover:border-sky-300',
      accent: 'text-sky-600'
    }
  };

  const scheme = colorMap[color] || colorMap.indigo;

  return (
    <div className={`bg-white rounded-2xl p-6 border ${scheme.border} shadow-sm card-hover transition-all flex flex-col justify-between relative overflow-hidden group`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            {title}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {value}
            </span>
            {badge && (
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badge.type === 'danger' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                {badge.text}
              </span>
            )}
          </div>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${scheme.bg} transition-transform group-hover:scale-110 duration-200`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {subtext && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs text-slate-500 font-medium">
          {subtext}
        </div>
      )}
    </div>
  );
}
