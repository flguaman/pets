import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  isDarkMode: boolean;
  language: 'es' | 'en';
  deviceMode: 'mobile' | 'desktop';
  toggleTheme: () => void;
  setLanguage: (lang: 'es' | 'en') => void;
  toggleDeviceMode: () => void;
  setDeviceMode: (mode: 'mobile' | 'desktop') => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      isDarkMode: true,
      language: 'es',
      deviceMode: 'desktop',
      toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      setLanguage: (language) => set({ language }),
      toggleDeviceMode: () => set((state) => ({ 
        deviceMode: state.deviceMode === 'mobile' ? 'desktop' : 'mobile' 
      })),
      setDeviceMode: (deviceMode) => set({ deviceMode }),
    }),
    {
      name: 'settings-storage',
    }
  )
);