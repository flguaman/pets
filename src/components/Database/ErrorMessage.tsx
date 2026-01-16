import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';

interface ErrorMessageProps {
  // Accept string or any error-like object (Supabase errors are objects)
  message: string | any;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  const renderMessage = () => {
    if (!message) return '';
    if (typeof message === 'string') return message;
    if (typeof message === 'object') {
      // Prefer common fields
      return (message.message || message.error || JSON.stringify(message));
    }
    return String(message);
  };
  const { deviceMode } = useSettingsStore();

  return (
    <div className={`mx-auto bg-gray-800 rounded-xl max-w-4xl ${deviceMode === 'mobile' ? 'p-6' : 'p-8'
      }`}>
      <div className="text-center">
        <AlertTriangle
          size={deviceMode === 'mobile' ? 32 : 48}
          className="text-red-500 mx-auto mb-4"
        />
        <h3 className={`font-bold text-red-400 mb-2 ${deviceMode === 'mobile' ? 'text-base' : 'text-lg'
          }`}>
          Error al cargar los datos
        </h3>
        <p className={`text-gray-400 mb-4 ${deviceMode === 'mobile' ? 'text-sm' : 'text-base'
          }`}>{renderMessage()}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className={`bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2 mx-auto ${deviceMode === 'mobile'
                ? 'px-3 py-2 text-sm'
                : 'px-4 py-2'
              }`}
          >
            <RefreshCw size={deviceMode === 'mobile' ? 14 : 16} />
            Reintentar
          </button>
        )}
      </div>
    </div>
  );
}