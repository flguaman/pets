import React from 'react';
import { User, Phone, MapPin, ArrowLeft, Edit } from 'lucide-react';
import { Pet } from '../../types';
import { useSettingsStore } from '../../store/settingsStore';
import { useAuthStore } from '../../store/authStore';

interface PetDetailsProps {
  pet: Pet;
  onEdit: () => void;
  onBack: () => void;
}

export function PetDetails({ pet, onEdit, onBack }: PetDetailsProps) {
  const { deviceMode } = useSettingsStore();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  return (
    <div className={`mx-auto bg-gray-800 rounded-xl ${
      deviceMode === 'mobile' 
        ? 'max-w-full p-3 sm:p-4' 
        : 'max-w-2xl p-6'
    }`}>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className={`font-bold flex items-center gap-2 ${
          deviceMode === 'mobile' 
            ? 'text-lg sm:text-xl' 
            : 'text-2xl'
        }`}>
          <User className="text-green-500" size={deviceMode === 'mobile' ? 20 : 24} />
          Información de {pet.name}
        </h2>
        <button
          onClick={onBack}
          className="flex items-center gap-1 sm:gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={deviceMode === 'mobile' ? 14 : 20} />
          <span className={deviceMode === 'mobile' ? 'text-xs sm:text-sm' : 'text-sm'}>
            Volver
          </span>
        </button>
      </div>

      <div className="space-y-3 sm:space-y-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <img
            src={pet.imageUrl}
            alt={pet.name}
            className={`rounded-full object-cover border-4 border-green-500 ${
              deviceMode === 'mobile' 
                ? 'w-12 h-12 sm:w-16 sm:h-16' 
                : 'w-24 h-24'
            }`}
          />
          <div>
            <h3 className={`font-bold ${
              deviceMode === 'mobile' 
                ? 'text-base sm:text-lg' 
                : 'text-xl'
            }`}>
              {pet.name}
            </h3>
            <p className={`text-gray-400 ${
              deviceMode === 'mobile' 
                ? 'text-xs sm:text-sm' 
                : 'text-sm'
            }`}>
              {pet.type} • {pet.breed}
            </p>
          </div>
        </div>

        <div className="grid gap-2 sm:gap-4">
          <InfoCard icon={User} label="Dueño" value={pet.owner} />
          <InfoCard icon={Phone} label="Teléfono" value={pet.phone} />
          <InfoCard icon={MapPin} label="Dirección" value={pet.address} />
          
          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            <InfoCard label="Edad" value={`${pet.age} años`} />
            <InfoCard label="Estado de Salud" value={pet.illness || 'Saludable'} />
          </div>

          {pet.observations && (
            <InfoCard label="Observaciones" value={pet.observations} />
          )}
        </div>

        <div className={`grid gap-2 sm:gap-4 ${
          deviceMode === 'mobile' ? 'grid-cols-1' : isAdmin ? 'grid-cols-2' : 'grid-cols-1'
        }`}>
          {isAdmin && (
            <button
              onClick={onEdit}
              className={`bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 ${
                deviceMode === 'mobile' 
                  ? 'py-2 text-xs sm:py-2 sm:text-sm' 
                  : 'py-3'
              }`}
            >
              <Edit size={deviceMode === 'mobile' ? 14 : 20} />
              Editar
            </button>
          )}
          
          <button
            onClick={() => window.location.href = `tel:${pet.phone}`}
            className={`bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 ${
              deviceMode === 'mobile' 
                ? 'py-2 text-xs sm:py-2 sm:text-sm' 
                : 'py-3'
            }`}
          >
            <Phone size={deviceMode === 'mobile' ? 14 : 20} />
            Llamar
          </button>
        </div>
      </div>
    </div>
  );
}

interface InfoCardProps {
  icon?: React.ComponentType<{ size: number }>;
  label: string;
  value: string;
}

function InfoCard({ icon: Icon, label, value }: InfoCardProps) {
  const { deviceMode } = useSettingsStore();

  return (
    <div className={`bg-gray-700 rounded-lg ${
      deviceMode === 'mobile' ? 'p-2 sm:p-3' : 'p-4'
    }`}>
      {Icon && (
        <div className="flex items-center gap-2 text-gray-400 mb-1">
          <Icon size={deviceMode === 'mobile' ? 14 : 18} />
          <p className={deviceMode === 'mobile' ? 'text-xs' : 'text-sm'}>{label}</p>
        </div>
      )}
      {!Icon && (
        <p className={`text-gray-400 mb-1 ${
          deviceMode === 'mobile' ? 'text-xs' : 'text-sm'
        }`}>
          {label}
        </p>
      )}
      <p className={deviceMode === 'mobile' ? 'text-sm' : 'text-base'}>{value}</p>
    </div>
  );
}