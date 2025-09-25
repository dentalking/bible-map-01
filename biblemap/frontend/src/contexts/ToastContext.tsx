'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ToastContainer, ToastProps, ToastType } from '@/components/ui/Toast';

interface ToastContextValue {
  showToast: (options: Omit<ToastProps, 'id'>) => void;
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((options: Omit<ToastProps, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const toast: ToastProps = {
      id,
      ...options,
    };
    setToasts((prev) => [...prev, toast]);
  }, []);

  const showSuccess = useCallback((message: string, title?: string) => {
    showToast({ type: 'success', message, title });
  }, [showToast]);

  const showError = useCallback((message: string, title?: string) => {
    showToast({ type: 'error', message, title });
  }, [showToast]);

  const showWarning = useCallback((message: string, title?: string) => {
    showToast({ type: 'warning', message, title });
  }, [showToast]);

  const showInfo = useCallback((message: string, title?: string) => {
    showToast({ type: 'info', message, title });
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showWarning, showInfo }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// 전역 토스트 헬퍼 함수들
let globalShowToast: ((options: Omit<ToastProps, 'id'>) => void) | null = null;

export function setGlobalToast(showToast: (options: Omit<ToastProps, 'id'>) => void) {
  globalShowToast = showToast;
}

export const toast = {
  success: (message: string, title?: string) => {
    globalShowToast?.({ type: 'success', message, title });
  },
  error: (message: string, title?: string) => {
    globalShowToast?.({ type: 'error', message, title });
  },
  warning: (message: string, title?: string) => {
    globalShowToast?.({ type: 'warning', message, title });
  },
  info: (message: string, title?: string) => {
    globalShowToast?.({ type: 'info', message, title });
  },
  custom: (options: Omit<ToastProps, 'id'>) => {
    globalShowToast?.(options);
  },
};