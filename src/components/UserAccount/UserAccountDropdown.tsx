import React from 'react';
import { 
  User, 
  Heart, 
  Settings, 
  Shield, 
  Database,
  LogOut,
  Mail,
  Calendar,
  PawPrint
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useSettingsStore } from '../../store/settingsStore';
import { usePets } from '../../hooks/usePets';

interface UserAccountDropdownProps {
  onClose: () => void;
  onNavigate: (tab: string) => void;
}

export function UserAccountDropdown({ onClose, onNavigate }: UserAccountDropdownProps) {
  const { user, logout } = useAuthStore();
  const { deviceMode } = useSettingsStore();
  const { pets } = usePetStore();

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  const handleNavigate = (tab: string) => {
    onNavigate(tab);
    onClose();
  };

  return (
    <div className={`absolute right-0 top-full mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 ${
      deviceMode === 'mobile' ? 'w-72' : 'w-80'
    }`}>
      {/* User Info Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <img
            src={user?.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=10b981&color=fff`}
            alt={user?.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-white">{user?.name}</h3>
            <p className="text-sm text-gray-400">{user?.email}</p>
            <div className="flex items-center gap-1 mt-1">
              {user?.role === 'admin' ? (
                <Shield size={14} className="text-green-500" />
              ) : (
                <User size={14} className="text-blue-500" />
              )}
              <span className="text-xs text-gray-400">
                {user?.role === 'admin' ? 'Cuenta Administrador' : 'Cuenta Usuario'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pet Summary */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-white flex items-center gap-2">
            <PawPrint size={16} className="text-green-500" />
            Mis Mascotas
          </h4>
          <span className="text-sm text-gray-400">
            {pets.length} {pets.length === 1 ? 'mascota' : 'mascotas'}
          </span>
        </div>
        
        {pets.length > 0 ? (
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {pets.slice(0, 3).map((pet) => (
              <div key={pet.id} className="flex items-center gap-2 p-2 bg-gray-700 rounded-lg">
                <img
                  src={pet.imageUrl}
                  alt={pet.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{pet.name}</p>
                  <p className="text-xs text-gray-400">{pet.type} • {pet.breed}</p>
                </div>
                <span className={`w-2 h-2 rounded-full ${
                  pet.status === 'healthy' ? 'bg-green-500' :
                  pet.status === 'adoption' ? 'bg-blue-500' :
                  pet.status === 'lost' ? 'bg-orange-500' :
                  pet.status === 'stolen' ? 'bg-red-500' :
                  'bg-yellow-500'
                }`} />
              </div>
            ))}
            {pets.length > 3 && (
              <button
                onClick={() => handleNavigate('pet-ids')}
                className="w-full text-center text-sm text-green-500 hover:text-green-400 py-1"
              >
                Ver todas las mascotas ({pets.length - 3} más)
              </button>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <Heart size={24} className="mx-auto text-gray-500 mb-2" />
            <p className="text-sm text-gray-400">No tienes mascotas registradas</p>
            <button
              onClick={() => handleNavigate('pet-ids')}
              className="text-xs text-green-500 hover:text-green-400 mt-1"
            >
              Agregar primera mascota
            </button>
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <div className="p-2">
        <button
          onClick={() => handleNavigate('pet-ids')}
          className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-700 rounded-lg transition-colors"
        >
          <Heart size={16} className="text-green-500" />
          <span className="text-white">{user?.role === 'admin' ? 'ID de Mascotas' : 'Perfil de Mascotas'}</span>
        </button>

        {user?.role === 'admin' && (
          <button
            onClick={() => handleNavigate('database')}
            className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Database size={16} className="text-blue-500" />
            <span className="text-white">Base de Datos</span>
          </button>
        )}

        <div className="border-t border-gray-700 my-2"></div>

        {/* Account Info */}
        <div className="px-3 py-2">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
            <Mail size={14} />
            <span>Email: {user?.email}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Calendar size={14} />
            <span>Miembro desde: {new Date().toLocaleDateString()}</span>
          </div>
        </div>

        <div className="border-t border-gray-700 my-2"></div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-red-600/20 rounded-lg transition-colors text-red-400"
        >
          <LogOut size={16} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
}