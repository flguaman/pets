import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';

interface EmptyStateProps {
  hasSearchTerm: boolean;
}

export function EmptyState({ hasSearchTerm }: EmptyStateProps) {
  const { deviceMode } = useSettingsStore();

  return (
    <div className="text-center py-8 sm:py-12">
      <AlertTriangle 
        size={deviceMode === 'mobile' ? 32 : 48} 
        className="mx-auto text-gray-400 mb-4" 
      />
      <p className={`text-gray-400 ${
        deviceMode === 'mobile' ? 'text-sm' : 'text-lg'
      }`}>
        {hasSearchTerm 
          ? 'No se encontraron mascotas con ese criterio de búsqueda' 
          : 'No hay mascotas registradas'
        }
      </p>
    </div>
  );
}