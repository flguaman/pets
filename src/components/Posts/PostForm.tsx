import React, { useState, useEffect } from 'react';
import { Plus, Save, X, Loader2, MapPin, DollarSign, Phone } from 'lucide-react';
import { Post, PostType } from '../../types/post';
import { Pet } from '../../types';
import { useSettingsStore } from '../../store/settingsStore';

interface PostFormProps {
  pets: Pet[];
  onSave: (postData: Omit<Post, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function PostForm({ pets = [], onSave, onCancel, loading = false }: PostFormProps) {
  const { deviceMode } = useSettingsStore();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'general' as PostType,
    pet_id: '',
    image_url: '',
    location: '',
    contact_info: '',
    reward: '',
    status: 'active' as const
  });

  const postTypes = [
    { value: 'general', label: 'Publicación General', icon: '📝' },
    { value: 'adoption', label: 'Mascota en Adopción', icon: '🏠' },
    { value: 'lost', label: 'Mascota Perdida', icon: '🔍' },
    { value: 'stolen', label: 'Mascota Robada', icon: '🚨' },
    { value: 'disoriented', label: 'Mascota Desorientada', icon: '😵' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    try {
      await onSave({
        ...formData,
        pet_id: formData.pet_id || undefined,
        image_url: formData.image_url || undefined,
        location: formData.location || undefined,
        contact_info: formData.contact_info || undefined,
        reward: formData.reward || undefined,
      });
    } catch (error) {
      console.error('Error saving post:', error);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const selectedPet = pets.find(pet => pet.id === formData.pet_id);

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
          <Plus className="text-green-500" size={deviceMode === 'mobile' ? 20 : 24} />
          Nueva Publicación
        </h2>
        <button
          onClick={onCancel}
          disabled={loading}
          className="flex items-center gap-1 sm:gap-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
        >
          <X size={deviceMode === 'mobile' ? 14 : 20} />
          <span className={deviceMode === 'mobile' ? 'text-xs sm:text-sm' : 'text-sm'}>
            Cancelar
          </span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        {/* Post Type Selection */}
        <div>
          <label className={`block font-medium text-gray-300 mb-2 ${
            deviceMode === 'mobile' ? 'text-xs sm:text-sm' : 'text-sm'
          }`}>
            Tipo de Publicación *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {postTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => updateField('type', type.value)}
                disabled={loading}
                className={`p-3 rounded-lg border-2 transition-all text-left ${
                  formData.type === type.value
                    ? 'border-green-500 bg-green-500/20 text-white'
                    : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                } ${deviceMode === 'mobile' ? 'p-2 text-xs sm:p-3 sm:text-sm' : ''}`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{type.icon}</span>
                  <span className="font-medium">{type.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Pet Selection (for pet-related posts) */}
        {formData.type !== 'general' && (
          <div>
            <label className={`block font-medium text-gray-300 mb-2 ${
              deviceMode === 'mobile' ? 'text-xs sm:text-sm' : 'text-sm'
            }`}>
              Seleccionar Mascota
            </label>
            <select
              value={formData.pet_id}
              onChange={(e) => updateField('pet_id', e.target.value)}
              disabled={loading}
              className={`w-full bg-gray-700 border border-gray-600 rounded-lg text-white disabled:opacity-50 ${
                deviceMode === 'mobile' ? 'p-2 text-sm' : 'p-2.5'
              }`}
            >
              <option value="">Seleccionar mascota (opcional)</option>
              {pets.map((pet) => (
                <option key={pet.id} value={pet.id}>
                  {pet.name} - {pet.type} ({pet.breed})
                </option>
              ))}
            </select>
            {selectedPet && (
              <div className="mt-2 p-2 bg-gray-700 rounded-lg flex items-center gap-3">
                <img
                  src={selectedPet.imageUrl}
                  alt={selectedPet.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium">{selectedPet.name}</p>
                  <p className="text-sm text-gray-400">{selectedPet.type} • {selectedPet.breed}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Title */}
        <div>
          <label className={`block font-medium text-gray-300 mb-1 sm:mb-2 ${
            deviceMode === 'mobile' ? 'text-xs sm:text-sm' : 'text-sm'
          }`}>
            Título *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="Título de la publicación"
            required
            disabled={loading}
            className={`w-full bg-gray-700 border border-gray-600 rounded-lg text-white disabled:opacity-50 ${
              deviceMode === 'mobile' ? 'p-2 text-sm' : 'p-2.5'
            }`}
          />
        </div>

        {/* Description */}
        <div>
          <label className={`block font-medium text-gray-300 mb-1 sm:mb-2 ${
            deviceMode === 'mobile' ? 'text-xs sm:text-sm' : 'text-sm'
          }`}>
            Descripción *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="Describe los detalles de tu publicación..."
            required
            disabled={loading}
            rows={4}
            className={`w-full bg-gray-700 border border-gray-600 rounded-lg text-white disabled:opacity-50 ${
              deviceMode === 'mobile' ? 'p-2 text-sm' : 'p-2.5'
            }`}
          />
        </div>

        {/* Additional fields for specific post types */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Location */}
          <div>
            <label className={`block font-medium text-gray-300 mb-1 sm:mb-2 ${
              deviceMode === 'mobile' ? 'text-xs sm:text-sm' : 'text-sm'
            }`}>
              <MapPin size={14} className="inline mr-1" />
              Ubicación
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => updateField('location', e.target.value)}
              placeholder="Ubicación específica"
              disabled={loading}
              className={`w-full bg-gray-700 border border-gray-600 rounded-lg text-white disabled:opacity-50 ${
                deviceMode === 'mobile' ? 'p-2 text-sm' : 'p-2.5'
              }`}
            />
          </div>

          {/* Contact Info */}
          <div>
            <label className={`block font-medium text-gray-300 mb-1 sm:mb-2 ${
              deviceMode === 'mobile' ? 'text-xs sm:text-sm' : 'text-sm'
            }`}>
              <Phone size={14} className="inline mr-1" />
              Contacto
            </label>
            <input
              type="text"
              value={formData.contact_info}
              onChange={(e) => updateField('contact_info', e.target.value)}
              placeholder="Teléfono o email de contacto"
              disabled={loading}
              className={`w-full bg-gray-700 border border-gray-600 rounded-lg text-white disabled:opacity-50 ${
                deviceMode === 'mobile' ? 'p-2 text-sm' : 'p-2.5'
              }`}
            />
          </div>
        </div>

        {/* Reward (for lost/stolen pets) */}
        {(formData.type === 'lost' || formData.type === 'stolen') && (
          <div>
            <label className={`block font-medium text-gray-300 mb-1 sm:mb-2 ${
              deviceMode === 'mobile' ? 'text-xs sm:text-sm' : 'text-sm'
            }`}>
              <DollarSign size={14} className="inline mr-1" />
              Recompensa
            </label>
            <input
              type="text"
              value={formData.reward}
              onChange={(e) => updateField('reward', e.target.value)}
              placeholder="Ej: $100, Sin recompensa"
              disabled={loading}
              className={`w-full bg-gray-700 border border-gray-600 rounded-lg text-white disabled:opacity-50 ${
                deviceMode === 'mobile' ? 'p-2 text-sm' : 'p-2.5'
              }`}
            />
          </div>
        )}

        {/* Image URL */}
        <div>
          <label className={`block font-medium text-gray-300 mb-1 sm:mb-2 ${
            deviceMode === 'mobile' ? 'text-xs sm:text-sm' : 'text-sm'
          }`}>
            URL de Imagen
          </label>
          <input
            type="url"
            value={formData.image_url}
            onChange={(e) => updateField('image_url', e.target.value)}
            placeholder="URL de la imagen (opcional)"
            disabled={loading}
            className={`w-full bg-gray-700 border border-gray-600 rounded-lg text-white disabled:opacity-50 ${
              deviceMode === 'mobile' ? 'p-2 text-sm' : 'p-2.5'
            }`}
          />
          {formData.image_url && (
            <div className="mt-2">
              <img
                src={formData.image_url}
                alt="Preview"
                className="w-full h-32 object-cover rounded-lg"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className={`grid gap-2 sm:gap-4 ${
          deviceMode === 'mobile' ? 'grid-cols-1' : 'grid-cols-2'
        }`}>
          <button
            type="submit"
            disabled={loading || !formData.title || !formData.description}
            className={`bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center justify-center gap-2 ${
              deviceMode === 'mobile' 
                ? 'py-2 text-xs sm:py-2 sm:text-sm' 
                : 'py-3'
            }`}
          >
            {loading ? (
              <Loader2 size={deviceMode === 'mobile' ? 14 : 20} className="animate-spin" />
            ) : (
              <Save size={deviceMode === 'mobile' ? 14 : 20} />
            )}
            {loading ? 'Publicando...' : 'Publicar'}
          </button>
          
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className={`bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center justify-center gap-2 ${
              deviceMode === 'mobile' 
                ? 'py-2 text-xs sm:py-2 sm:text-sm' 
                : 'py-3'
            }`}
          >
            <X size={deviceMode === 'mobile' ? 14 : 20} />
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}