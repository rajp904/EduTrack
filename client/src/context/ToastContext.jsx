import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full px-4 pointer-events-none">
        {toasts.map((toast) => {
          let bgColor = 'bg-emerald-600';
          let Icon = CheckCircle2;
          if (toast.type === 'error') {
            bgColor = 'bg-rose-600';
            Icon = AlertCircle;
          } else if (toast.type === 'info') {
            bgColor = 'bg-indigo-600';
            Icon = Info;
          }

          return (
            <div
              key={toast.id}
              className={`${bgColor} text-white px-4 py-3 rounded-xl shadow-xl flex items-center justify-between gap-3 text-sm font-medium pointer-events-auto transform transition-all duration-300 animate-in fade-in slide-in-from-bottom-5`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{toast.message}</span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-white/80 hover:text-white transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
