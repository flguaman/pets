import React from 'react';
import { User, Edit, Trash2, QrCode } from 'lucide-react';
import { Pet } from '../../types';
import { useSettingsStore } from '../../store/settingsStore';
import { useAuthStore } from '../../store/authStore';

interface PetCardProps {
  pet: Pet;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onGenerateQR: () => void;
}

export function PetCard({ pet, onView, onEdit, onDelete, onGenerateQR }: PetCardProps) {
  const { deviceMode } = useSettingsStore();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="bg-gray-700 rounded-lg overflow-hidden">
      <div className="flex gap-3 sm:gap-4 p-3 sm:p-4">
        <img
          src={pet.imageUrl}
          alt={pet.name}
          className={`object-cover rounded-lg ${
            deviceMode === 'mobile' 
              ? 'w-16 h-16 sm:w-20 sm:h-20' 
              : 'w-24 h-24'
          }`}
        />
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold mb-1 truncate ${
            deviceMode === 'mobile' 
              ? 'text-sm sm:text-base' 
              : 'text-lg'
          }`}>
            {pet.name}
          </h3>
          <p className={`text-gray-300 mb-1 ${
            deviceMode === 'mobile' 
              ? 'text-xs sm:text-sm' 
              : 'text-sm'
          }`}>
            {pet.type} • {pet.breed}
          </p>
          <p className={`text-gray-400 mb-2 truncate ${
            deviceMode === 'mobile' 
              ? 'text-xs sm:text-sm' 
              : 'text-sm'
          }`}>
            Dueño: {pet.owner}
          </p>
          <div className={`flex gap-1 sm:gap-2 ${
            deviceMode === 'mobile' ? 'flex-col sm:flex-row' : 'flex-row'
          }`}>
            <button
              onClick={onView}
              className={`bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors flex items-center justify-center gap-1 ${
                deviceMode === 'mobile' 
                  ? 'px-2 py-1 text-xs flex-1' 
                  : 'px-3 py-1 text-sm'
              }`}
            >
              <User size={deviceMode === 'mobile' ? 12 : 16} />
              Ver
            </button>
            
            {isAdmin && (
              <>
                <button
                  onClick={onGenerateQR}
                  className={`bg-green-600 hover:bg-green-700 text-white rounded transition-colors flex items-center justify-center gap-1 ${
                    deviceMode === 'mobile' 
                      ? 'px-2 py-1 text-xs flex-1' 
                      : 'px-3 py-1 text-sm'
                  }`}
                >
                  <QrCode size={deviceMode === 'mobile' ? 12 : 16} />
                  QR
                </button>
                
                <button
                  onClick={onEdit}
                  className={`bg-yellow-600 hover:bg-yellow-700 text-white rounded transition-colors flex items-center justify-center gap-1 ${
                    deviceMode === 'mobile' 
                      ? 'px-2 py-1 text-xs flex-1' 
                      : 'px-3 py-1 text-sm'
                  }`}
                >
                  <Edit size={deviceMode === 'mobile' ? 12 : 16} />
                  Editar
                </button>
                
                <button
                  onClick={onDelete}
                  className={`bg-red-600 hover:bg-red-700 text-white rounded transition-colors flex items-center justify-center gap-1 ${
                    deviceMode === 'mobile' 
                      ? 'px-2 py-1 text-xs flex-1' 
                      : 'px-3 py-1 text-sm'
                  }`}
                >
                  <Trash2 size={deviceMode === 'mobile' ? 12 : 16} />
                  {deviceMode === 'mobile' ? '' : 'Eliminar'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}