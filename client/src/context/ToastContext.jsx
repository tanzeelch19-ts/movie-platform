import { createContext, useCallback, useContext, useState } from 'react'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

const ToastContext = createContext(null)
let counter = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id))
  }, [])

  // Usage: toast('Saved'), or toast('Something failed', 'error')
  const toast = useCallback(
    (message, type = 'success') => {
      counter += 1
      const id = counter
      setToasts((list) => [...list, { id, message, type }])
      setTimeout(() => dismiss(id), 3500)
    },
    [dismiss]
  )

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2"
      >
        {toasts.map((t) => {
          const isError = t.type === 'error'
          const Icon = isError ? AlertCircle : CheckCircle2
          return (
            <div
              key={t.id}
              role="status"
              className="pointer-events-auto flex animate-slide-up items-start gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm shadow-xl dark:border-white/10 dark:bg-cinema-800"
            >
              <Icon size={18} className={`mt-0.5 shrink-0 ${isError ? 'text-red-500' : 'text-green-500'}`} />
              <p className="flex-1">{t.message}</p>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}