import React from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  loading?: boolean;
}

export function SearchBar({ searchTerm, onSearchChange, loading = false }: SearchBarProps) {
  const { deviceMode } = useSettingsStore();

  return (
    <div className="mb-4 sm:mb-6 relative">
      <div className="relative">
        <Search 
          size={deviceMode === 'mobile' ? 16 : 20} 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
        />
        <input
          type="text"
          placeholder="Buscar por nombre, dueño o tipo..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className={`w-full bg-gray-700 border border-gray-600 rounded-lg text-white ${
            deviceMode === 'mobile' 
              ? 'pl-8 pr-10 py-2 text-sm' 
              : 'pl-10 pr-12 py-3'
          }`}
        />
        {loading && (
          <Loader2 
            size={deviceMode === 'mobile' ? 14 : 16} 
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 animate-spin" 
          />
        )}
      </div>
    </div>
  );
}