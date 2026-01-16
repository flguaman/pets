import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Shield,
  Calendar,
  Settings,
  Heart,
  Database,
  PawPrint,
  Edit,
  Save,
  X,
  Plus,
  MessageSquare,
  Bell,
  Globe,
  Eye,
  TrendingUp,
  Award,
  Activity,
  Wifi,
  WifiOff,
  Lock,
  Users,
  BarChart3,
  Map
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useSettingsStore } from '../../store/settingsStore';
import { usePetStore } from '../../store/petStore';
import { usePosts } from '../../hooks/usePosts';
import { PostForm } from '../Posts/PostForm';
import { PostCard } from '../Posts/PostCard';
import { RealTimeTracking } from '../RealTimeTracking';
import { PatrullaCanina } from '../PatrullaCanina';

export function UserAccount() {
  const {
    user,
    updateUserPreferences,
    updateUserRole,
    updateUserPermissions,
    syncUserData,
    connectionStatus,
    checkConnection
  } = useAuthStore();
  const { deviceMode } = useSettingsStore();
  const { pets, getPetStatistics } = usePetStore((state) => state);
  const { posts, loading: postsLoading, createPost, deletePost } = usePosts();
  const [isEditing, setIsEditing] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'posts' | 'pets' | 'settings' | 'permissions' | 'real-time' | 'patrulla'>('real-time');
  const [petStats, setPetStats] = useState<any>(null);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    preferences: user?.preferences || {
      notifications: true,
      emailUpdates: true,
      publicProfile: false,
      language: 'es' as 'es' | 'en',
      theme: 'dark' as 'light' | 'dark'
    },
    permissions: user?.permissions || {
      canCreatePets: false,
      canEditPets: false,
      canDeletePets: false,
      canManageUsers: false,
      canViewAnalytics: false,
      canModerateContent: false,
    }
  });

  // Load pet statistics
  useEffect(() => {
    const loadStats = async () => {
      try {
        const stats = await getPetStatistics();
        setPetStats(stats);
      } catch (error) {
        console.error('Error loading pet statistics:', error);
      }
    };

    if (user) {
      loadStats();
    }
  }, [user, getPetStatistics]);

  // Sync user data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (connectionStatus === 'online') {
        syncUserData();
      }
    }, 60000); // Sync every minute

    return () => clearInterval(interval);
  }, [connectionStatus, syncUserData]);

  const handleSave = async () => {
    try {
      // Update preferences
      await updateUserPreferences(editData.preferences);

      // Update permissions if user is admin
      if (user?.role === 'admin') {
        await updateUserPermissions(editData.permissions);
      }

      setIsEditing(false);
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  const handleCancel = () => {
    setEditData({
      name: user?.name || '',
      email: user?.email || '',
      preferences: user?.preferences || {
        notifications: true,
        emailUpdates: true,
        publicProfile: false,
        language: 'es',
        theme: 'dark'
      },
      permissions: user?.permissions || {
        canCreatePets: false,
        canEditPets: false,
        canDeletePets: false,
        canManageUsers: false,
        canViewAnalytics: false,
        canModerateContent: false,
      }
    });
    setIsEditing(false);
  };

  const handleCreatePost = async (postData: any) => {
    try {
      await createPost(postData);
      setShowPostForm(false);
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta publicación?')) {
      try {
        await deletePost(postId);
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };

  const handleRoleChange = async (newRole: 'user' | 'admin') => {
    if (confirm(`¿Estás seguro de que quieres cambiar tu rol a ${newRole === 'admin' ? 'Administrador' : 'Usuario'}?`)) {
      try {
        await updateUserRole(newRole);
      } catch (error) {
        console.error('Error updating role:', error);
      }
    }
  };

  // Estadísticas de publicaciones
  const postStats = {
    total: posts.length,
    adoption: posts.filter(p => p.type === 'adoption').length,
    lost: posts.filter(p => p.type === 'lost').length,
    stolen: posts.filter(p => p.type === 'stolen').length,
    general: posts.filter(p => p.type === 'general').length,
  };

  if (showPostForm) {
    return (
      <PostForm
        pets={pets}
        onSave={handleCreatePost}
        onCancel={() => setShowPostForm(false)}
        loading={postsLoading}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Connection Status */}
      <div className={`flex items-center justify-between p-3 rounded-lg ${connectionStatus === 'online' ? 'bg-green-900/30 border border-green-500' :
        connectionStatus === 'offline' ? 'bg-red-900/30 border border-red-500' :
          'bg-yellow-900/30 border border-yellow-500'
        }`}>
        <div className="flex items-center gap-2">
          {connectionStatus === 'online' ? (
            <Wifi size={16} className="text-green-500" />
          ) : connectionStatus === 'offline' ? (
            <WifiOff size={16} className="text-red-500" />
          ) : (
            <Activity size={16} className="text-yellow-500 animate-pulse" />
          )}
          <span className={`text-sm font-medium ${connectionStatus === 'online' ? 'text-green-400' :
            connectionStatus === 'offline' ? 'text-red-400' :
              'text-yellow-400'
            }`}>
            {connectionStatus === 'online' ? 'Conectado' :
              connectionStatus === 'offline' ? 'Sin conexión' :
                'Reconectando...'}
          </span>
        </div>

        {connectionStatus === 'offline' && (
          <button
            onClick={checkConnection}
            className="text-sm text-blue-400 hover:text-blue-300 underline"
          >
            Verificar conexión
          </button>
        )}
      </div>

      {/* Header */}
      <div className="bg-gray-800 rounded-xl p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className={`font-bold flex items-center gap-2 ${deviceMode === 'mobile' ? 'text-lg sm:text-xl' : 'text-2xl'
            }`}>
            <User className="text-green-500" size={deviceMode === 'mobile' ? 20 : 24} />
            Mi Cuenta
          </h1>

          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <Edit size={16} />
              <span className={deviceMode === 'mobile' ? 'hidden sm:inline' : ''}>
                Editar Perfil
              </span>
            </button>
          )}
        </div>

        {/* User Profile */}
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative">
            <img
              src={user?.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=10b981&color=fff`}
              alt={user?.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-green-500"
            />
            {user?.isVerified && (
              <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                <Shield size={12} className="text-white" />
              </div>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                {/* Preferences */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-300">Preferencias</h4>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={editData.preferences.notifications}
                      onChange={(e) => setEditData(prev => ({
                        ...prev,
                        preferences: { ...prev.preferences, notifications: e.target.checked }
                      }))}
                      className="rounded"
                    />
                    <div className="flex items-center gap-2">
                      <Bell size={16} className="text-gray-400" />
                      <span className="text-sm">Recibir notificaciones</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={editData.preferences.emailUpdates}
                      onChange={(e) => setEditData(prev => ({
                        ...prev,
                        preferences: { ...prev.preferences, emailUpdates: e.target.checked }
                      }))}
                      className="rounded"
                    />
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-gray-400" />
                      <span className="text-sm">Actualizaciones por email</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={editData.preferences.publicProfile}
                      onChange={(e) => setEditData(prev => ({
                        ...prev,
                        preferences: { ...prev.preferences, publicProfile: e.target.checked }
                      }))}
                      className="rounded"
                    />
                    <div className="flex items-center gap-2">
                      <Globe size={16} className="text-gray-400" />
                      <span className="text-sm">Perfil público</span>
                    </div>
                  </label>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                  >
                    <Save size={16} />
                    Guardar
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X size={16} />
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-xl sm:text-2xl font-bold mb-2">{user?.name}</h2>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <Mail size={16} className="text-gray-400" />
                    <span className="text-gray-300">{user?.email}</span>
                    {user?.isVerified && (
                      <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                        Verificado
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    {user?.role === 'admin' ? (
                      <Shield size={16} className="text-green-500" />
                    ) : (
                      <User size={16} className="text-blue-500" />
                    )}
                    <span className="text-gray-300">
                      {user?.role === 'admin' ? 'Cuenta Administrador' : 'Cuenta Usuario'}
                    </span>
                    <button
                      onClick={() => handleRoleChange(user?.role === 'admin' ? 'user' : 'admin')}
                      className="text-xs text-blue-400 hover:text-blue-300 underline"
                    >
                      Cambiar
                    </button>
                  </div>
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="text-gray-300">
                      Miembro desde {new Date(user?.stats?.joinDate || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-gray-800 rounded-xl p-1">
        <div className="flex space-x-1 overflow-x-auto">
          {[
            { id: 'overview', label: 'Resumen', icon: TrendingUp },
            { id: 'posts', label: 'Publicaciones', icon: MessageSquare },
            { id: 'pets', label: 'Mascotas', icon: Heart },
            { id: 'real-time', label: 'Tiempo Real', icon: Map },
            { id: 'patrulla', label: 'Patrulla Canina', icon: Users },
            { id: 'settings', label: 'Configuración', icon: Settings },
            ...(user?.role === 'admin' ? [{ id: 'permissions', label: 'Permisos', icon: Lock }] : []),
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                console.log('Setting active tab to:', tab.id);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors flex-shrink-0 ${activeTab === tab.id
                ? 'bg-green-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
            >
              <tab.icon size={16} />
              <span className={deviceMode === 'mobile' ? 'hidden sm:inline' : ''}>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-gray-800 rounded-xl p-4 sm:p-6 space-y-8">
        {activeTab === 'real-time' && (
          pets.length > 0 ? (
            <RealTimeTracking pet={{
              id: typeof pets[0].id === 'string' ? parseInt(pets[0].id) || 1 : pets[0].id,
              name: pets[0].name,
              type: pets[0].type,
              image: pets[0].imageUrl,
              initialPosition: [-2.8974, -79.0045]
            }} />
          ) : (
            <div className="text-center text-gray-400 py-8">
              <Map size={48} className="mx-auto mb-4" />
              <p>No tienes mascotas registradas para el seguimiento en tiempo real.</p>
              <p>Por favor, registra una mascota para usar esta función.</p>
            </div>
          )
        )}
        {activeTab === 'patrulla' && (
          <PatrullaCanina />
        )}
      </div>
    </div>
  );
}