import React from 'react';
import { Pet } from '../../types';
import { PetCard } from './PetCard';
import { useSettingsStore } from '../../store/settingsStore';

interface PetListProps {
  pets: Pet[];
  onViewPet: (pet: Pet) => void;
  onEditPet: (pet: Pet) => void;
  onDeletePet: (petId: string) => void;
  onGenerateQR: (pet: Pet) => void;
}

export function PetList({ pets, onViewPet, onEditPet, onDeletePet, onGenerateQR }: PetListProps) {
  const { deviceMode } = useSettingsStore();

  return (
    <div className={`grid gap-3 sm:gap-4 ${
      deviceMode === 'mobile' 
        ? 'grid-cols-1' 
        : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
    }`}>
      {pets.map((pet) => (
        <PetCard
          key={pet.id}
          pet={pet}
          onView={() => onViewPet(pet)}
          onEdit={() => onEditPet(pet)}
          onDelete={() => onDeletePet(pet.id)}
          onGenerateQR={() => onGenerateQR(pet)}
        />
      ))}
    </div>
  );
}