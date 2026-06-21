import React, { createContext, useContext, useMemo, useRef, useState } from "react";

const ToastContext = createContext(null);

function ToastItem({ t, onClose }) {
  const styles = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-900",
    error: "border-rose-200 bg-rose-50 text-rose-900",
    info: "border-slate-200 bg-white text-slate-900"
  };
  return (
    <div
      className={`pointer-events-auto flex w-full items-start gap-3 rounded-2xl border px-4 py-3 shadow-soft transition ${styles[t.type]}`}
    >
      <div className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full bg-current opacity-70" />
      <div className="flex-1">
        {t.title ? <div className="text-sm font-semibold">{t.title}</div> : null}
        <div className="text-sm opacity-90">{t.message}</div>
      </div>
      <button onClick={onClose} className="rounded-lg px-2 py-1 text-sm font-semibold opacity-70 hover:opacity-100">
        ✕
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(1);

  const api = useMemo(() => {
    function push({ type = "info", title = "", message = "", duration = 2500 }) {
      const id = idRef.current++;
      const t = { id, type, title, message };
      setToasts((prev) => [t, ...prev].slice(0, 4));
      if (duration > 0) setTimeout(() => remove(id), duration);
      return id;
    }
    function remove(id) {
      setToasts((prev) => prev.filter((x) => x.id !== id));
    }
    return {
      toast: {
        success: (message, opts) => push({ type: "success", message, ...opts }),
        error: (message, opts) => push({ type: "error", message, ...opts }),
        info: (message, opts) => push({ type: "info", message, ...opts })
      },
      remove
    };
  }, []);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed right-4 top-20 z-[60] w-[min(420px,calc(100vw-2rem))] space-y-2">
        {toasts.map((t) => (
          <ToastItem key={t.id} t={t} onClose={() => api.remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx.toast;
}

