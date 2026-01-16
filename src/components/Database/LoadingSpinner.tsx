import React from 'react';
import { Loader2 } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';

export function LoadingSpinner() {
  const { deviceMode } = useSettingsStore();

  return (
    <div className={`mx-auto bg-gray-800 rounded-xl max-w-4xl flex items-center justify-center ${
      deviceMode === 'mobile' ? 'p-8' : 'p-12'
    }`}>
      <div className="text-center">
        <Loader2 
          size={deviceMode === 'mobile' ? 32 : 48} 
          className="animate-spin text-green-500 mx-auto mb-4" 
        />
        <p className={`text-gray-400 ${
          deviceMode === 'mobile' ? 'text-sm' : 'text-lg'
        }`}>
          Cargando mascotas...
        </p>
      </div>
    </div>
  );
}