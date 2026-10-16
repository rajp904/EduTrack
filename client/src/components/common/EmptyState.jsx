import React from 'react';
import { SearchX } from 'lucide-react';

export default function EmptyState({
  title = 'No records found',
  description = 'Try adjusting your search terms or filters to find what you are looking for.',
  icon: Icon = SearchX,
  actionText,
  onAction
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center flex flex-col items-center justify-center max-w-lg mx-auto shadow-sm my-6">
      <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-slate-800 tracking-tight mb-1">
        {title}
      </h3>
      <p className="text-xs text-slate-500 leading-relaxed mb-5 max-w-sm">
        {description}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
