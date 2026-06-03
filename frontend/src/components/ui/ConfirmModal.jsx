import { AlertTriangle } from 'lucide-react';

export default function ConfirmModal({ title, message, confirmLabel = 'Delete', cancelLabel = 'Cancel', onConfirm, onCancel, loading = false, danger = true }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 animate-fade-in">
        <div className="flex flex-col items-center text-center">
          <div className={`h-14 w-14 rounded-full flex items-center justify-center mb-4 ${danger ? 'bg-red-100' : 'bg-amber-100'}`}>
            <AlertTriangle className={`h-7 w-7 ${danger ? 'text-red-500' : 'text-amber-500'}`} />
          </div>
          <h3 className="text-lg font-bold text-surface-900 mb-1">{title || 'Confirm'}</h3>
          <p className="text-sm text-surface-500 mb-6">{message || 'Are you sure?'}</p>
          <div className="flex gap-3 w-full">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-xl border border-surface-200 px-4 py-2.5 text-sm font-semibold text-surface-700 hover:bg-surface-50 transition-colors"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700'}`}
            >
              {loading ? 'Deleting...' : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
