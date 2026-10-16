import React from 'react';
import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Deletion',
  message = 'Are you sure you want to proceed? This action cannot be undone.',
  cascadeNotice = null,
  confirmText = 'Delete Record',
  isDeleting = false
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="text-sm text-slate-600 leading-relaxed">
            <p className="font-semibold text-slate-800 mb-1">Warning: Permanent Action</p>
            <p>{message}</p>
          </div>
        </div>

        {cascadeNotice && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-800 text-xs leading-relaxed">
            <span className="font-bold">Referential Integrity Note:</span> {cascadeNotice}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-sm disabled:opacity-60 flex items-center gap-2"
          >
            {isDeleting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Deleting...</span>
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
