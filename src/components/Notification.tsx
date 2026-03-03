'use client';

import { useEffect } from 'react';
import { XMarkIcon, CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationProps {
  message: string;
  type: NotificationType;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function Notification({
  message,
  type,
  isVisible,
  onClose,
  duration = 5000,
}: NotificationProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const typeStyles = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: CheckCircleIcon,
      iconColor: 'text-green-600',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: ExclamationCircleIcon,
      iconColor: 'text-red-600',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: ExclamationCircleIcon,
      iconColor: 'text-yellow-600',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: InformationCircleIcon,
      iconColor: 'text-blue-600',
    },
  };

  const styles = typeStyles[type];
  const Icon = styles.icon;

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-md w-full ${styles.bg} ${styles.border} border rounded-lg shadow-lg p-4 animate-fade-in flex items-start gap-3`}
      role="alert"
    >
      <Icon className={`h-6 w-6 ${styles.iconColor} flex-shrink-0 mt-0.5`} />
      <div className="flex-1">
        <p className={`text-sm font-medium ${styles.text}`}>{message}</p>
      </div>
      <button
        onClick={onClose}
        className={`flex-shrink-0 ${styles.text} hover:opacity-70 transition-opacity`}
        aria-label="Close notification"
      >
        <XMarkIcon className="h-5 w-5" />
      </button>
    </div>
  );
}
