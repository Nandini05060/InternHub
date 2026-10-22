import React, { useEffect } from 'react';
import { AlertTriangle, AlertCircle, X, Check } from 'lucide-react';

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed? This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'danger', // 'danger' | 'primary' | 'warning'
  loading = false,
  icon
}) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      button: 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-sm',
      iconBg: 'bg-rose-50 text-rose-600 border-rose-200',
      defaultIcon: AlertTriangle
    },
    warning: {
      button: 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white shadow-sm',
      iconBg: 'bg-amber-50 text-amber-600 border-amber-200',
      defaultIcon: AlertCircle
    },
    primary: {
      button: 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-sm',
      iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-200',
      defaultIcon: Check
    }
  };

  const style = variantStyles[confirmVariant] || variantStyles.danger;
  const IconComponent = icon || style.defaultIcon;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
    >
      <div
        className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 ${style.iconBg}`}>
              <IconComponent className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 id="confirm-dialog-title" className="text-base font-bold text-slate-900 tracking-tight">
                {title}
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                {message}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="btn-secondary text-xs py-2 px-4"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${style.button}`}
          >
            {loading && (
              <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            )}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
