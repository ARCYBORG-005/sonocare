import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

/**
 * Global Toast Event Emitter to allow calling toast.success() anywhere
 */
class ToastManager {
  listeners = new Set();

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  show(message, type = 'success', duration = 3500) {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    this.listeners.forEach((listener) => listener({ id, message, type, duration }));
  }

  success(message, duration = 3500) {
    this.show(message, 'success', duration);
  }

  error(message, duration = 3500) {
    this.show(message, 'error', duration);
  }

  info(message, duration = 3500) {
    this.show(message, 'info', duration);
  }
}

export const toast = new ToastManager();

/**
 * Toast Container Component
 * Renders floating toast notifications on the screen
 */
export const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const unsubscribe = toast.subscribe((newToast) => {
      setToasts((prev) => [...prev, newToast]);

      if (newToast.duration > 0) {
        setTimeout(() => {
          removeToast(newToast.id);
        }, newToast.duration);
      }
    });

    return () => unsubscribe();
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '380px',
        width: 'calc(100vw - 40px)',
        pointerEvents: 'none'
      }}
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((t) => {
        let bg = '#10B981'; // emerald success
        let IconComponent = CheckCircle2;

        if (t.type === 'error') {
          bg = '#EF4444';
          IconComponent = AlertCircle;
        } else if (t.type === 'info') {
          bg = '#3B82F6';
          IconComponent = Info;
        }

        return (
          <div
            key={t.id}
            style={{
              backgroundColor: '#ffffff',
              color: '#1E293B',
              borderRadius: '8px',
              padding: '12px 16px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
              borderLeft: `4px solid ${bg}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              pointerEvents: 'auto',
              animation: 'sonocareToastSlideIn 0.3s ease-out forwards',
              fontSize: '0.9rem',
              fontWeight: 500
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <IconComponent size={20} style={{ color: bg, flexShrink: 0 }} />
              <span>{t.message}</span>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              style={{
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px'
              }}
              title="Close"
              aria-label="Close Toast"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
      <style>{`
        @keyframes sonocareToastSlideIn {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default toast;
