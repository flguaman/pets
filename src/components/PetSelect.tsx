import React from 'react';
import { Pet } from '../types';

interface PetSelectProps {
  pets: Pet[];
  selectedPetId: number;
  onSelectPet: (id: number) => void;
}

export function PetSelect({ pets, selectedPetId, onSelectPet }: PetSelectProps) {
  return (
    <div className="mb-6">
      <label htmlFor="pet-select" className="block text-sm font-medium text-gray-300 mb-2">
        Selecciona una mascota:
      </label>
      <select
        id="pet-select"
        className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
        value={selectedPetId}
        onChange={(e) => onSelectPet(Number(e.target.value))}
      >
        {pets.map((pet) => (
          <option key={pet.id} value={pet.id}>
            {pet.name} ({pet.type}) - Dueño: {pet.owner}
          </option>
        ))}
      </select>
    </div>
  );
}