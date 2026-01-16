import React from 'react';
import { QrCode, Plus } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import { useAuthStore } from '../../store/authStore';

interface DatabaseHeaderProps {
  onCreatePet: () => void;
}

export function DatabaseHeader({ onCreatePet }: DatabaseHeaderProps) {
  const { deviceMode } = useSettingsStore();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  // Debug: Log para verificar el estado del usuario
  React.useEffect(() => {
    if (user) {
      console.log('DatabaseHeader - User:', {
        id: user.id,
        email: user.email,
        role: user.role,
        isAdmin: isAdmin,
        permissions: user.permissions
      });
    } else {
      console.log('DatabaseHeader - No user found');
    }
  }, [user, isAdmin]);

  return (
    <div className="flex items-center justify-between mb-4 sm:mb-6">
      <h2 className={`font-bold flex items-center gap-2 ${
        deviceMode === 'mobile' 
          ? 'text-lg sm:text-xl' 
          : 'text-2xl'
      }`}>
        <QrCode className="text-green-500" size={deviceMode === 'mobile' ? 20 : 24} />
        Base de Datos de Mascotas
      </h2>
      
      {isAdmin ? (
        <button
          onClick={onCreatePet}
          className={`bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2 ${
            deviceMode === 'mobile' 
              ? 'px-3 py-2 text-xs sm:px-4 sm:py-2 sm:text-sm' 
              : 'px-4 py-2'
          }`}
        >
          <Plus size={deviceMode === 'mobile' ? 14 : 20} />
          <span className={deviceMode === 'mobile' ? 'hidden sm:inline' : ''}>
            Agregar Mascota
          </span>
        </button>
      ) : (
        <div className="text-xs text-yellow-500">
          {user ? `Rol: ${user.role}` : 'No autenticado'}
        </div>
      )}
    </div>
  );
}