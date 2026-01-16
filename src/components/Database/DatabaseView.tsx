import React, { useState, useEffect } from 'react';
import { Pet } from '../../types';
import { PetList } from './PetList';
import { PetForm } from './PetForm';
import { PetDetails } from './PetDetails';
import { QRGenerator } from './QRGenerator';
import { SearchBar } from './SearchBar';
import { DatabaseHeader } from './DatabaseHeader';
import { EmptyState } from './EmptyState';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import { usePetStore } from '../../store/petStore';
import { useAuthStore } from '../../store/authStore';
import { AlertTriangle, Wifi, WifiOff } from 'lucide-react';

export function DatabaseView() {
  const {
    pets, loading, error, createPet, updatePet, deletePet,
    searchPets, refetch, clearError, isOffline
  } = usePetStore();
  const { user } = useAuthStore();
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [qrPet, setQrPet] = useState<Pet | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPets, setFilteredPets] = useState<Pet[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const isAdmin = user?.role === 'admin';

  // Debug: Log para verificar el estado del usuario y admin
  useEffect(() => {
    if (user) {
      console.log('DatabaseView - User state:', {
        id: user.id,
        email: user.email,
        role: user.role,
        isAdmin: isAdmin,
        permissions: user.permissions
      });
    }
  }, [user, isAdmin]);

  // The store now handles online/offline status and retries internally
  // so the useEffects for that are no longer needed here.

  // Update filtered pets when pets or search term changes
  useEffect(() => {
    const filterPets = async () => {
      if (!searchTerm.trim()) {
        setFilteredPets(pets);
        return;
      }

      try {
        setSearchLoading(true);
        const results = await searchPets(searchTerm);
        setFilteredPets(results);
      } catch (err) {
        console.error('Search error:', err);
        setFilteredPets([]);
      } finally {
        setSearchLoading(false);
      }
    };

    const debounceTimer = setTimeout(filterPets, 300);
    return () => clearTimeout(debounceTimer);
  }, [pets, searchTerm, searchPets]);

  const handleCreatePet = () => {
    if (!isAdmin) return;
    setIsCreating(true);
    setSelectedPet(null);
    setQrPet(null);
    clearError();
  };

  const handleEditPet = (pet: Pet) => {
    if (!isAdmin) return;
    setSelectedPet(pet);
    setIsEditing(true);
    setIsCreating(false);
    setQrPet(null);
    clearError();
  };

  const handleViewPet = (pet: Pet) => {
    setSelectedPet(pet);
    setIsEditing(false);
    setIsCreating(false);
    setQrPet(null);
    clearError();
  };

  const handleGenerateQR = (pet: Pet) => {
    if (!isAdmin) return;
    setQrPet(pet);
    setSelectedPet(null);
    setIsEditing(false);
    setIsCreating(false);
  };

  const handleSavePet = async (petData: Partial<Pet>, imageFile?: File) => {
    if (!isAdmin) return;

    // Check if user is authenticated and has a valid ID
    if (!user || !user.id) {
      console.error('User not authenticated');
      return;
    }

    try {
      setSaveLoading(true);
      clearError();

      // Asegurar que el ID digital esté presente al crear
      if (isCreating && !petData.digitalId) {
        console.warn('handleSavePet: No digitalId found, this should have been generated in the form');
        const { generateDigitalId } = await import('../../utils/digitalIdGenerator');
        petData.digitalId = generateDigitalId();
      }

      console.log('handleSavePet: Saving pet with data:', {
        isCreating,
        name: petData.name,
        digitalId: petData.digitalId,
        hasImage: !!imageFile
      });

      if (isCreating) {
        const newPet = await createPet(petData as Omit<Pet, 'id'>, imageFile);
        console.log('handleSavePet: Pet created, will appear in ID MASCOTAS:', {
          id: newPet.id,
          digitalId: newPet.digitalId,
          name: newPet.name
        });
        
        // Recargar mascotas para asegurar que aparezca en ID MASCOTAS
        await refetch();
      } else if (selectedPet) {
        await updatePet(selectedPet.id, { ...petData, id: selectedPet.id } as Pet, imageFile);
        // Recargar mascotas después de actualizar
        await refetch();
      }

      handleCancel();

    } catch (err: any) {
      console.error('Error saving pet:', err);
      // El error ya se maneja en el store y se muestra en la UI
      // No necesitamos hacer nada más aquí, el store ya tiene el error
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeletePet = async (petId: string) => {
    if (!isAdmin) return;

    if (confirm('¿Estás seguro de que quieres eliminar esta mascota?')) {
      try {
        await deletePet(petId);
        console.log('Pet deleted successfully');

        if (selectedPet?.id === petId) {
          setSelectedPet(null);
        }

      } catch (err) {
        console.error('Error deleting pet:', err);
        // Error is handled by the hook and displayed in the UI
      }
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsCreating(false);
    setSelectedPet(null);
    setQrPet(null);
    clearError();
  };

  const handleRetry = () => {
    clearError();
    refetch();
  };

  // Show loading spinner
  if (loading && pets.length === 0) {
    return <LoadingSpinner />;
  }

  // Show connection status
  const ConnectionStatus = () => (
    <div className={`flex items-center gap-2 text-sm ${!isOffline ? 'text-green-500' : 'text-red-500'
      }`}>
      {!isOffline ? <Wifi size={16} /> : <WifiOff size={16} />}
      <span>{!isOffline ? 'Conectado' : 'Sin conexión'}</span>
    </div>
  );

  // Show error message with retry option
  if (error && pets.length === 0) {
    return (
      <div className="mx-auto bg-gray-800 rounded-xl max-w-4xl p-6">
        <div className="mb-4 flex justify-between items-center">
          <DatabaseHeader onCreatePet={handleCreatePet} />
          <ConnectionStatus />
        </div>
        <ErrorMessage message={error} onRetry={handleRetry} />
      </div>
    );
  }

  // Show QR Generator when a pet is selected for QR generation
  if (qrPet) {
    return <QRGenerator pet={qrPet} onClose={() => setQrPet(null)} />;
  }

  // Show form when editing or creating (only for admins)
  if ((isEditing || isCreating) && isAdmin) {
    return (
      <div className="mx-auto bg-gray-800 rounded-xl max-w-4xl p-6">
        <div className="mb-4 flex justify-between items-center">
          <ConnectionStatus />
        </div>
        <PetForm
          pet={selectedPet}
          isCreating={isCreating}
          onSave={handleSavePet}
          onCancel={handleCancel}
          loading={saveLoading}
        />
      </div>
    );
  }

  // Show pet details when a pet is selected
  if (selectedPet && !isEditing) {
    return (
      <div className="mx-auto bg-gray-800 rounded-xl max-w-4xl p-6">
        <div className="mb-4 flex justify-between items-center">
          <ConnectionStatus />
        </div>
        <PetDetails
          pet={selectedPet}
          onEdit={() => handleEditPet(selectedPet)}
          onBack={() => setSelectedPet(null)}
        />
      </div>
    );
  }

  // Show main database view
  return (
    <div className="mx-auto bg-gray-800 rounded-xl max-w-4xl p-3 sm:p-6">
      <div className="mb-4 flex justify-between items-center">
        <DatabaseHeader onCreatePet={handleCreatePet} />
        <ConnectionStatus />
      </div>

      {/* Show error banner if there's an error but we have cached data */}
      {error && pets.length > 0 && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg flex items-center gap-2">
          <AlertTriangle size={16} className="text-red-400" />
          <span className="text-red-200 text-sm">{typeof error === 'string' ? error : (error?.message ?? JSON.stringify(error))}</span>
          <button
            onClick={handleRetry}
            className="ml-auto text-red-200 hover:text-white text-sm underline"
          >
            Reintentar
          </button>
        </div>
      )}

      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        loading={searchLoading}
      />

      {filteredPets.length === 0 ? (
        <EmptyState hasSearchTerm={!!searchTerm} />
      ) : (
        <PetList
          pets={filteredPets}
          onViewPet={handleViewPet}
          onEditPet={handleEditPet}
          onDeletePet={handleDeletePet}
          onGenerateQR={handleGenerateQR}
        />
      )}

      {/* Loading indicator for background operations */}
      {loading && pets.length > 0 && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-2 text-gray-400">
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm">Actualizando...</span>
          </div>
        </div>
      )}
    </div>
  );
}