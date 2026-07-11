import { createContext, useContext, useState, useCallback, useRef } from 'react';
import './toast.css';

const ToastContext = createContext(null);

let idSeq = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  // type: 'success' | 'error' | 'info'
  const showToast = useCallback(
    (message, type = 'success') => {
      const id = ++idSeq;
      setToasts((prev) => [...prev, { id, message, type }]);
      timers.current[id] = setTimeout(() => dismiss(id), 3000);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container" aria-live="polite" aria-atomic="true">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.type}`} role="status">
            <span className="toast__message">{t.message}</span>
            <button
              type="button"
              className="toast__close"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
};

export default ToastContext;
