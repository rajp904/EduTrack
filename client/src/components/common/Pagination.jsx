import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, totalPages, totalRecords, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-white border border-slate-200/80 rounded-2xl text-xs text-slate-600 shadow-sm">
      <div>
        Showing page <span className="font-bold text-slate-900">{page}</span> of{' '}
        <span className="font-bold text-slate-900">{totalPages}</span> ({totalRecords} records)
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent text-slate-700 transition-colors"
          title="Previous Page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
          .map((p, idx, arr) => {
            const prev = arr[idx - 1];
            const showEllipsis = prev && p - prev > 1;

            return (
              <React.Fragment key={p}>
                {showEllipsis && <span className="px-1 text-slate-400">...</span>}
                <button
                  onClick={() => onPageChange(p)}
                  className={`w-7 h-7 rounded-lg font-bold text-xs transition-colors ${
                    page === p
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  {p}
                </button>
              </React.Fragment>
            );
          })}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent text-slate-700 transition-colors"
          title="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
