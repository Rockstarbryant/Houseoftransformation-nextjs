'use client';

import { useEffect } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle size={20} />,
    error: <XCircle size={20} />,
    info: <Info size={20} />,
    warning: <AlertTriangle size={20} />
  };

  const styles = {
    success: 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
    error: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
    info: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
    warning: 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200'
  };

  return (
    <div className="fixed top-4 right-4 z-[100] animate-slide-in-right">
      <div className={`${styles[type]} border rounded-lg p-4 shadow-lg flex items-center gap-3 min-w-[300px]`}>
        {icons[type]}
        <p className="font-semibold flex-1">{message}</p>
        <button onClick={onClose} className="text-lg font-bold opacity-50 hover:opacity-100">
          &times;
        </button>
      </div>
    </div>
  );
}