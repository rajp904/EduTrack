import React from 'react';

export default function Badge({ children, variant = 'neutral', size = 'md' }) {
  const variantMap = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    warning: 'bg-amber-50 text-amber-700 border-amber-200/80',
    danger: 'bg-rose-50 text-rose-700 border-rose-200/80',
    info: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200'
  };

  const sizeMap = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5'
  };

  // Status mapping convenience
  let activeVariant = variant;
  if (children === 'Present') activeVariant = 'success';
  if (children === 'Absent') activeVariant = 'danger';

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-lg border ${variantMap[activeVariant]} ${sizeMap[size]}`}
    >
      {children}
    </span>
  );
}
