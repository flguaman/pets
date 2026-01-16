import { create } from 'zustand';
import { Pet } from '../types';
import { PetService } from '../services/petService';
import { useAuthStore } from './authStore';

// Utility function to validate UUID format
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

interface PetError {
  message: string;
  code?: string;
  timestamp: number;
  retryable: boolean;
}

interface CacheEntry {
  data: Pet[];
  timestamp: number;
}

interface PetState {
  pets: Pet[];
  loading: boolean;
  error: PetError | null;
  lastFetch: number;
  cache: Map<string, CacheEntry>;
  isOffline: boolean;
  hasCache: (userId: string) => boolean;
  initialize: (connectionStatus: 'online' | 'offline') => void;
  loadPets: (forceRefresh?: boolean) => Promise<void>;
  createPet: (petData: Omit<Pet, 'id'>, imageFile?: File) => Promise<Pet>;
  updatePet: (id: string, petData: Pet, imageFile?: File) => Promise<Pet>;
  deletePet: (id: string) => Promise<void>;
  searchPets: (searchTerm: string) => Promise<Pet[]>;
  getPetStatistics: () => Promise<any>; // Consider defining a type for stats
  refetch: () => Promise<void>;
  clearError: () => void;
}

const getCacheDuration = (isOffline: boolean) => isOffline ? 30 * 60 * 1000 : 5 * 60 * 1000;

export const usePetStore = create<PetState>((set, get) => ({
  pets: [],
  loading: true,
  error: null,
  lastFetch: 0,
  cache: new Map(),
  isOffline: false,

  initialize: (connectionStatus) => {
    set({ isOffline: connectionStatus === 'offline' });
  },

  hasCache: (userId) => {
    const cacheKey = `pets_${userId}`;
    return get().cache.has(cacheKey);
  },

  loadPets: async (forceRefresh = false) => {
    const { sessionChecked, isAuthenticated, user, logout } = useAuthStore.getState();

    if (!sessionChecked || !isAuthenticated || !user?.id) {
      set({ pets: [], loading: false, error: null });
      return;
    }

    if (!isValidUUID(user.id)) {
      console.warn('Invalid UUID in auth store, logging out.');
      logout();
      set({ pets: [], loading: false });
      return;
    }
    const userId = user.id;
    const cacheKey = `pets_${userId}`;
    const { cache, isOffline } = get();
    const cachedEntry = cache.get(cacheKey);

    if (!forceRefresh && cachedEntry && (Date.now() - cachedEntry.timestamp) < getCacheDuration(isOffline)) {
      set({ pets: cachedEntry.data, loading: false });
      return;
    }

    if (isOffline) {
      if (cachedEntry) {
        set({
          pets: cachedEntry.data,
          loading: false,
          error: {
            message: 'Mostrando datos guardados (sin conexión)',
            code: 'OFFLINE',
            timestamp: Date.now(),
            retryable: true
          }
        });
      } else {
         set({ pets: [], loading: false, error: { message: 'No hay datos disponibles sin conexión', code: 'OFFLINE_NO_CACHE', timestamp: Date.now(), retryable: true } });
      }
      return;
    }

    try {
      set({ loading: true, error: null });
      const data = await PetService.getUserPets(userId);
      set({
        pets: data,
        cache: new Map(get().cache).set(cacheKey, { data, timestamp: Date.now() }),
        lastFetch: Date.now(),
        loading: false,
      });
    } catch (err: any) {
      const retryable = !['401', '403', 'PGRST301'].includes(err.code);
      set({
        error: { message: err.message, code: err.code, timestamp: Date.now(), retryable },
        loading: false
      });
      if (!retryable) logout();
      // Fallback to cache if fetch fails
      if (cachedEntry) set({ pets: cachedEntry.data });
    }
  },

  createPet: async (petData, imageFile) => {
    const { user } = useAuthStore.getState();
    if (!user?.id) throw new Error('Usuario no autenticado');
    const userId = user.id;

    // Asegurar que el ID digital esté presente
    if (!petData.digitalId) {
      console.warn('petStore.createPet: No digitalId in petData, this should be generated in the form');
      const { generateDigitalId } = await import('../utils/digitalIdGenerator');
      petData.digitalId = generateDigitalId();
    }

    console.log('petStore.createPet: Creating pet with digitalId:', petData.digitalId);

    const tempId = `temp_${Date.now()}`;
    const tempPet: Pet = { 
      ...petData, 
      id: tempId, 
      imageUrl: imageFile ? URL.createObjectURL(imageFile) : petData.imageUrl 
    };
    
    // Optimistic update
    set(state => ({ pets: [tempPet, ...state.pets] }));

    try {
      const newPet = await PetService.createPet(petData, userId, imageFile);
      
      console.log('petStore.createPet: Pet created successfully:', {
        id: newPet.id,
        digitalId: newPet.digitalId,
        name: newPet.name
      });

      // Replace temp pet with real one and update cache
      set(state => {
        const updatedPets = state.pets.map(p => p.id === tempId ? newPet : p);
        const cacheKey = `pets_${userId}`;
        const newCache = new Map(state.cache);
        newCache.set(cacheKey, { data: updatedPets, timestamp: Date.now() });
        return { pets: updatedPets, cache: newCache };
      });
      
      return newPet;
    } catch (err: any) {
      console.error('petStore.createPet: Error creating pet:', err);
      // Revert on error
      set(state => ({ pets: state.pets.filter(p => p.id !== tempId) }));
      
      // Mejorar mensaje de error
      if (err?.message?.includes('fetch') || err?.code === 'NETWORK_ERROR') {
        throw new Error('Error de conexión: No se pudo conectar con Supabase. Verifica:\n1. Tu conexión a internet\n2. Las variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY\n3. Que el servidor de Supabase esté funcionando');
      }
      
      // Propagate error to the component
      throw err;
    }
  },

  updatePet: async (id, petData, imageFile) => {
    const { user } = useAuthStore.getState();
    if (!user?.id) throw new Error('Usuario no autenticado');
    const userId = user.id;

    const previousPets = get().pets;
    const optimisticData = { 
      ...petData, 
      imageUrl: imageFile ? URL.createObjectURL(imageFile) : petData.imageUrl 
    };

    // Optimistic update
    set(state => ({ pets: state.pets.map(p => p.id === id ? optimisticData : p) }));

    try {
      const updatedPet = await PetService.updatePet(id, petData, userId, imageFile);
      // Update with server response and update cache
      set(state => {
        const updatedPets = state.pets.map(p => p.id === id ? updatedPet : p);
        const cacheKey = `pets_${userId}`;
        const newCache = new Map(state.cache);
        newCache.set(cacheKey, { data: updatedPets, timestamp: Date.now() });
        return { pets: updatedPets, cache: newCache };
      });
      return updatedPet;
    } catch (err) {
      // Revert on error
      set({ pets: previousPets });
      throw err;
    }
  },

  deletePet: async (id) => {
    const { user } = useAuthStore.getState();
    if (!user?.id) throw new Error('Usuario no autenticado');
    const userId = user.id;

    const previousPets = get().pets;
    // Optimistic update
    set(state => ({ pets: state.pets.filter(p => p.id !== id) }));

    try {
      await PetService.deletePet(id, userId);
      // Update cache
      set(state => {
        const updatedPets = state.pets.filter(p => p.id !== id);
        const cacheKey = `pets_${userId}`;
        const newCache = new Map(state.cache);
        newCache.set(cacheKey, { data: updatedPets, timestamp: Date.now() });
        return { pets: updatedPets, cache: newCache };
      });
    } catch (err) {
      // Revert on error
      set({ pets: previousPets });
      throw err;
    }
  },

  searchPets: async (searchTerm) => {
    const { user } = useAuthStore.getState();
    if (!user?.id) throw new Error('Usuario no autenticado');
    const userId = user.id;

    if (!searchTerm.trim()) {
      return get().pets;
    }
    
    if (get().isOffline) {
      const cacheKey = `pets_${userId}`;
      const cachedEntry = get().cache.get(cacheKey);
      if (cachedEntry) {
        return cachedEntry.data.filter(pet => 
          pet.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      return [];
    }

    return await PetService.searchPets(searchTerm, userId);
  },

  getPetStatistics: async () => {
      const { user } = useAuthStore.getState();
      if (!user?.id) throw new Error('Usuario no autenticado');
      const userId = user.id;

      if (get().isOffline) {
          const cacheKey = `pets_${userId}`;
          const cachedEntry = get().cache.get(cacheKey);
          if (cachedEntry) {
              const total = cachedEntry.data.length;
              const byStatus: Record<string, number> = {};
              const byType: Record<string, number> = {};
              cachedEntry.data.forEach(pet => {
                  byStatus[pet.status || 'healthy'] = (byStatus[pet.status || 'healthy'] || 0) + 1;
                  byType[pet.type] = (byType[pet.type] || 0) + 1;
              });
              return { total, byStatus, byType, recentCount: 0 };
          }
          throw new Error('No hay datos disponibles sin conexión');
      }

      return await PetService.getPetStatistics(userId);
  },

  refetch: async () => {
    await get().loadPets(true);
  },

  clearError: () => {
    set({ error: null });
  },
}));
