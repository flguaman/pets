import React, { useState, useEffect } from 'react';
import {
  Home,
  Database,
  Heart,
  ShoppingBag,
  AlertTriangle,
  Brain,
  Sun,
  Moon,
  Languages,
  Menu,
  X,
  UserCircle,
  Monitor,
  Smartphone,
  LogOut,
  Shield,
  User,
  Users,
  Settings,
  ChevronDown,
  ChevronUp,
  Wifi,
  WifiOff,
  Activity,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../store/settingsStore';
import { useAuthStore } from '../store/authStore';
import { UserAccountDropdown } from './UserAccount/UserAccountDropdown';

interface TabProps {
  active: string;
  onTabChange: (tab: string) => void;
}

export function Header({ active, onTabChange }: TabProps) {
  const { t, i18n } = useTranslation();
  const { isDarkMode, toggleTheme, language, setLanguage, deviceMode, toggleDeviceMode } = useSettingsStore();
  const { user, logout, connectionStatus, checkConnection } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Check connection periodically
  useEffect(() => {
    const interval = setInterval(() => {
      checkConnection();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [checkConnection]);

  const tabs = [
    { id: 'home', icon: Home, label: t('nav.home') },
    ...(user?.role === 'admin' ? [{ id: 'database', icon: Database, label: 'Base de Datos' }] : []),
    { id: 'pet-ids', icon: UserCircle, label: user?.role === 'admin' ? 'ID de Mascotas' : 'Perfil de Mascota' },
    { id: 'adoption', icon: Heart, label: t('nav.adoption') },
    { id: 'vets', icon: ShoppingBag, label: t('nav.vets') },
    { id: 'alerts', icon: AlertTriangle, label: t('nav.alerts') },
    { id: 'emotions', icon: Brain, label: t('nav.emotions') },
    { id: 'real-time', icon: Monitor, label: 'Seguimiento en Tiempo Real' },
    ...(user?.role !== 'admin' ? [{ id: 'patrulla', icon: Users, label: 'Patrulla Canina' }] : []),
    { id: 'ia', icon: Brain, label: 'IA' },
  ];

  const toggleLanguage = () => {
    const newLang = language === 'es' ? 'en' : 'es';
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
  };

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'online':
        return <Wifi size={16} className="text-green-500" />;
      case 'offline':
        return <WifiOff size={16} className="text-red-500" />;
      case 'reconnecting':
        return <Activity size={16} className="text-yellow-500 animate-pulse" />;
      default:
        return <Wifi size={16} className="text-gray-400" />;
    }
  };

  const getConnectionText = () => {
    switch (connectionStatus) {
      case 'online':
        return 'En línea';
      case 'offline':
        return 'Sin conexión';
      case 'reconnecting':
        return 'Reconectando...';
      default:
        return 'Verificando...';
    }
  };

  return (
    <div className={deviceMode === 'mobile' ? 'mb-3 sm:mb-4' : 'mb-8'}>
      <div className={`flex ${deviceMode === 'mobile'
        ? 'flex-col gap-2 mb-3 sm:mb-4'
        : 'flex-col sm:flex-row justify-between items-center gap-4 mb-8'
        }`}>
        <h1 className={`font-bold text-center bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent ${deviceMode === 'mobile'
          ? 'text-xl sm:text-2xl'
          : 'text-3xl sm:text-4xl'
          }`}>
          {t('app.title')}
        </h1>

        <div className={`flex items-center justify-between ${deviceMode === 'mobile'
          ? 'gap-1 sm:gap-2'
          : 'gap-4'
          }`}>
          {/* Connection Status */}
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${connectionStatus === 'online' ? 'bg-green-900/30' :
            connectionStatus === 'offline' ? 'bg-red-900/30' :
              'bg-yellow-900/30'
            }`}>
            {getConnectionIcon()}
            <span className={`text-xs ${connectionStatus === 'online' ? 'text-green-400' :
              connectionStatus === 'offline' ? 'text-red-400' :
                'text-yellow-400'
              } ${deviceMode === 'mobile' ? 'hidden sm:inline' : ''}`}>
              {getConnectionText()}
            </span>
          </div>

          {/* User Account Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className={`flex items-center gap-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors ${deviceMode === 'mobile'
                ? 'px-2 py-1.5'
                : 'px-3 py-2'
                }`}
            >
              <img
                src={user?.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=10b981&color=fff`}
                alt={user?.name}
                className={`rounded-full object-cover ${deviceMode === 'mobile' ? 'w-6 h-6' : 'w-8 h-8'
                  }`}
              />
              <div className={`text-left ${deviceMode === 'mobile' ? 'hidden sm:block' : ''}`}>
                <p className={`font-medium truncate max-w-24 ${deviceMode === 'mobile' ? 'text-xs' : 'text-sm'
                  }`}>
                  {user?.name}
                </p>
                <div className="flex items-center gap-1">
                  {user?.role === 'admin' ? (
                    <Shield size={12} className="text-green-500" />
                  ) : (
                    <User size={12} className="text-blue-500" />
                  )}
                  <span className={`text-gray-400 ${deviceMode === 'mobile' ? 'text-xs' : 'text-xs'
                    }`}>
                    {user?.role === 'admin' ? 'Administrador' : 'Usuario'}
                  </span>
                </div>
              </div>
              {showUserDropdown ? (
                <ChevronUp size={16} className="text-gray-400" />
              ) : (
                <ChevronDown size={16} className="text-gray-400" />
              )}
            </button>

            {showUserDropdown && (
              <UserAccountDropdown
                onClose={() => setShowUserDropdown(false)}
                onNavigate={(tab) => {
                  onTabChange(tab);
                  setShowUserDropdown(false);
                }}
              />
            )}
          </div>

          <button
            onClick={toggleLanguage}
            className={`rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors ${deviceMode === 'mobile'
              ? 'p-1.5 sm:p-2'
              : 'p-2'
              }`}
            title={t(language === 'es' ? 'app.language.english' : 'app.language.spanish')}
          >
            <Languages size={deviceMode === 'mobile' ? 14 : 20} className="sm:w-4 sm:h-4" />
          </button>

          <button
            onClick={toggleTheme}
            className={`rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors ${deviceMode === 'mobile'
              ? 'p-1.5 sm:p-2'
              : 'p-2'
              }`}
            title={t(isDarkMode ? 'app.theme.light' : 'app.theme.dark')}
          >
            {isDarkMode ?
              <Sun size={deviceMode === 'mobile' ? 14 : 20} className="sm:w-4 sm:h-4" /> :
              <Moon size={deviceMode === 'mobile' ? 14 : 20} className="sm:w-4 sm:h-4" />
            }
          </button>

          <button
            onClick={toggleDeviceMode}
            className={`rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors ${deviceMode === 'mobile'
              ? 'p-1.5 sm:p-2'
              : 'p-2'
              }`}
            title={deviceMode === 'desktop' ? 'Cambiar a modo móvil' : 'Cambiar a modo escritorio'}
          >
            {deviceMode === 'desktop' ?
              <Smartphone size={deviceMode === 'mobile' ? 14 : 20} className="sm:w-4 sm:h-4" /> :
              <Monitor size={deviceMode === 'mobile' ? 14 : 20} className="sm:w-4 sm:h-4" />
            }
          </button>

          <button
            onClick={logout}
            className={`rounded-lg bg-red-600 hover:bg-red-700 transition-colors ${deviceMode === 'mobile'
              ? 'p-1.5 sm:p-2'
              : 'p-2'
              }`}
            title="Cerrar sesión"
          >
            <LogOut size={deviceMode === 'mobile' ? 14 : 20} className="sm:w-4 sm:h-4" />
          </button>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors ${deviceMode === 'mobile'
              ? 'p-1.5 sm:p-2 block'
              : 'p-2 md:hidden'
              }`}
          >
            {isMenuOpen ?
              <X size={deviceMode === 'mobile' ? 14 : 20} className="sm:w-4 sm:h-4" /> :
              <Menu size={deviceMode === 'mobile' ? 14 : 20} className="sm:w-4 sm:h-4" />
            }
          </button>
        </div>
      </div>

      <div className={`${isMenuOpen ? 'block' : 'hidden'
        } ${deviceMode === 'mobile' ? 'block' : 'md:block'}`}>
        <div className={`flex gap-1 sm:gap-2 ${deviceMode === 'mobile'
          ? 'flex-col'
          : 'flex-col md:flex-row flex-wrap justify-center'
          }`}>
          {tabs.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => {
                onTabChange(id);
                setIsMenuOpen(false);
              }}
              className={`flex items-center gap-1 sm:gap-2 rounded-lg transition-all w-full ${deviceMode === 'mobile'
                ? 'px-2 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm'
                : 'px-4 py-2 md:w-auto'
                } ${active === id
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
            >
              <Icon size={deviceMode === 'mobile' ? 14 : 20} className="sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="truncate">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}