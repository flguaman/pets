import React, { useState, useEffect } from 'react';
import { RealTimeTracking } from './components/RealTimeTracking';
import { PatrullaCanina } from './components/PatrullaCanina';
import { Header } from './components/Header';
import { PetSelect } from './components/PetSelect';
import { PetInfo } from './components/PetInfo';
import { PetEditor } from './components/PetEditor';
import { AdoptionStore } from './components/AdoptionStore';
import { Veterinaries } from './components/Veterinaries';
import { Alerts } from './components/Alerts';
import { FindAI } from './components/FindAI';
import { HomePage } from './components/Home/HomePage';
import { PetIDManager } from './components/PetProfile/PetIDManager';
import { UserAccount } from './components/UserAccount/UserAccount';
import { Login } from './components/Login';
import { PetIdentification } from './components/PetIdentification';
import { Pet } from './types';
import { useSettingsStore } from './store/settingsStore';
import { useAuthStore } from './store/authStore';
import { usePetStore } from './store/petStore';
import { PetService } from './services/petService';
import { Loader2 } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [viewingPetId, setViewingPetId] = useState<string | null>(null);
  const [viewingPet, setViewingPet] = useState<Pet | null>(null);
  const { isDarkMode, deviceMode } = useSettingsStore();
  const { isAuthenticated, loading: authLoading, initializeAuth } = useAuthStore();
  const { pets, loadPets } = usePetStore();

  const selectedPet = pets.find((pet) => pet.id === selectedPetId) || null;

  // Check if we're viewing a pet ID from URL
  useEffect(() => {
    const path = window.location.pathname;
    const petIdMatch = path.match(/\/pet\/([a-f0-9-]+)/);

    if (petIdMatch) {
      const petId = petIdMatch[1];
      setViewingPetId(petId);

      // Load pet data for viewing
      const loadPetForViewing = async () => {
        try {
          const pet = await PetService.getPetById(petId);
          if (pet) {
            setViewingPet(pet);
          }
        } catch (error) {
          console.error('Error loading pet for viewing:', error);
        }
      };

      loadPetForViewing();
    }
  }, []);

  useEffect(() => {
    document.documentElement.className = isDarkMode ? 'dark' : 'light';
  }, [isDarkMode]);

  // Initialize auth and load pets
  useEffect(() => {
    initializeAuth().then(() => {
      const { isAuthenticated: isAuth } = useAuthStore.getState();
      if (isAuth) {
        loadPets();
      }
    });
    // Create default accounts if they don't exist
    // const { createDefaultAccounts } = useAuthStore.getState();
    // createDefaultAccounts();
  }, [initializeAuth, loadPets]);

  // Set first pet as selected when pets load
  useEffect(() => {
    if (pets.length > 0 && !selectedPetId) {
      setSelectedPetId(pets[0].id);
    }
  }, [pets, selectedPetId]);

  // Show loading spinner while initializing auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-green-500 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  // Show pet identification view if viewing a specific pet
  if (viewingPetId && viewingPet) {
    return <PetIdentification pet={viewingPet} />;
  }

  return (
    <div className={`min-h-screen bg-gray-900 text-white transition-colors duration-200 ${deviceMode === 'mobile'
      ? 'px-2 py-2 sm:px-3 sm:py-3'
      : 'p-3 sm:p-6'
      }`}>
      <div className={`mx-auto ${deviceMode === 'mobile'
        ? 'max-w-full sm:max-w-md'
        : 'max-w-6xl'
        }`}>
        <Header active={activeTab} onTabChange={setActiveTab} />

        <main className={deviceMode === 'mobile' ? 'mt-3 sm:mt-4' : 'mt-8'}>
          {activeTab === 'home' && <HomePage />}

          {activeTab === 'database' && <PetEditor />}

          {activeTab === 'pet-ids' && (
            <PetIDManager
              pets={pets}
              selectedPetId={selectedPetId}
              onSelectPet={setSelectedPetId}
              onEdit={() => setIsEditing(true)}
            />
          )}

          {activeTab === 'real-time' && (
            selectedPet ? (
              <RealTimeTracking pet={{
                id: typeof selectedPet.id === 'string' ? parseInt(selectedPet.id) || 1 : selectedPet.id,
                name: selectedPet.name,
                type: selectedPet.type,
                image: selectedPet.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedPet.name)}&background=10b981&color=fff`,
                initialPosition: Array.isArray((selectedPet as any).location) ? (selectedPet as any).location : [-2.8974, -79.0045],
              }} />
            ) : (
              <RealTimeTracking pet={{
                id: 1,
                name: 'DemoPet',
                type: 'Perro',
                image: 'https://ui-avatars.com/api/?name=DemoPet&background=10b981&color=fff',
                initialPosition: [-2.8974, -79.0045],
              }} />
            )
          )}

          {activeTab === 'patrulla' && <PatrullaCanina />}

          {activeTab === 'account' && <UserAccount />}

          {activeTab === 'adoption' && <AdoptionStore />}
          {activeTab === 'vets' && <Veterinaries />}
          {activeTab === 'alerts' && <Alerts />}
          {activeTab === 'emotions' && <FindAI />}
        </main>
      </div>
    </div>
  );
}

export default App;