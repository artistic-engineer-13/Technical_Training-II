import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { RiCheckLine, RiErrorWarningLine, RiInfoCardLine, RiCloseLine } from 'react-icons/ri';

const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleToast = (e) => {
      const { message, type } = e.detail;
      const id = Date.now() + Math.random().toString(36).substr(2, 9);
      
      setToasts((prev) => [...prev, { id, message, type }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    };

    window.addEventListener('app-toast', handleToast);
    return () => window.removeEventListener('app-toast', handleToast);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.15 } }}
              className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl shadow-lg border text-sm font-semibold select-none ${
                isSuccess
                  ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-950/90 dark:border-green-900 dark:text-green-200'
                  : isError
                  ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-955/90 dark:border-red-900 dark:text-red-200'
                  : 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/90 dark:border-blue-900 dark:text-blue-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {isSuccess && <RiCheckLine className="w-5 h-5 text-green-500" />}
                {isError && <RiErrorWarningLine className="w-5 h-5 text-red-500" />}
                {!isSuccess && !isError && <RiInfoCardLine className="w-5 h-5 text-blue-500" />}
                <span>{toast.message}</span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-4 p-0.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors"
              >
                <RiCloseLine className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
