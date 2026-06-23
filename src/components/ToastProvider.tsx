import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

type ToastType = 'success' | 'error';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextProps {
  addToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        zIndex: 9999,
      }}>
        {toasts.map(toast => (
          <div
            key={toast.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              backgroundColor: 'var(--bg-surface-solid)',
              border: `1px solid ${toast.type === 'success' ? 'var(--accent)' : 'var(--danger)'}`,
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-xl)',
              animation: 'toastSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards',
              minWidth: '280px',
              maxWidth: '400px',
            }}
          >
            {toast.type === 'success' ? (
              <CheckCircle size={20} color="var(--accent)" style={{ flexShrink: 0 }} />
            ) : (
              <XCircle size={20} color="var(--danger)" style={{ flexShrink: 0 }} />
            )}
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>
              {toast.message}
            </span>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                padding: '4px',
              }}
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
