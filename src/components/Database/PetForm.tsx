import React, { useState, useEffect } from 'react';
import { Edit, Save, X, Loader2, QrCode } from 'lucide-react';
import { Pet } from '../../types';
import { FormField } from './FormField';
import { useSettingsStore } from '../../store/settingsStore';
import { generateDigitalId } from '../../utils/digitalIdGenerator';

interface PetFormProps {
  pet: Pet | null;
  isCreating: boolean;
  onSave: (petData: Partial<Pet>, imageFile?: File) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function PetForm({ pet, isCreating, onSave, onCancel, loading = false }: PetFormProps) {
  const { deviceMode } = useSettingsStore();
  const [formData, setFormData] = useState<Partial<Pet>>({});
  const [imageFile, setImageFile] = useState<File | undefined>();
  const [imagePreview, setImagePreview] = useState<string | undefined>();

  useEffect(() => {
    if (isCreating) {
      const digitalId = generateDigitalId();
      setFormData({
        name: '',
        owner: '',
        phone: '',
        address: '',
        type: 'Perro',
        breed: '',
        age: 1,
        illness: '',
        observations: '',
        imageUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d',
        status: 'healthy',
        digitalId: digitalId
      });
    } else if (pet) {
      setFormData(pet);
      setImagePreview(pet.imageUrl);
    }
  }, [pet, isCreating]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    onSave(formData, imageFile);
  };

  const updateField = (field: keyof Pet, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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
          <Edit className="text-green-500" size={deviceMode === 'mobile' ? 20 : 24} />
          {isCreating ? 'Agregar Nueva Mascota' : 'Editar Mascota'}
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
        {/* ID Digital - Solo mostrar al crear */}
        {isCreating && formData.digitalId && (
          <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <QrCode className="text-green-500" size={20} />
              <label className="text-sm font-medium text-green-400">ID Digital Generado</label>
            </div>
            <div className="flex items-center gap-3">
              <code className="text-lg font-mono font-bold text-green-300 bg-gray-900 px-4 py-2 rounded">
                {formData.digitalId}
              </code>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(formData.digitalId || '');
                }}
                className="text-xs text-green-400 hover:text-green-300 underline"
              >
                Copiar
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Este ID digital se generará automáticamente y aparecerá en la sección "ID de Mascotas"
            </p>
          </div>
        )}

        {/* ID Digital - Solo lectura al editar */}
        {!isCreating && pet?.digitalId && (
          <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <QrCode className="text-gray-400" size={20} />
              <label className="text-sm font-medium text-gray-300">ID Digital</label>
            </div>
            <code className="text-lg font-mono font-bold text-gray-200 bg-gray-900 px-4 py-2 rounded">
              {pet.digitalId}
            </code>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <FormField
            label="Nombre"
            type="text"
            value={formData.name || ''}
            onChange={(value) => updateField('name', value)}
            placeholder="Nombre de la mascota"
            required
            disabled={loading}
          />

          <FormField
            label="Dueño"
            type="text"
            value={formData.owner || ''}
            onChange={(value) => updateField('owner', value)}
            placeholder="Nombre del dueño"
            required
            disabled={loading}
          />

          <FormField
            label="Teléfono"
            type="tel"
            value={formData.phone || ''}
            onChange={(value) => updateField('phone', value)}
            placeholder="Número de teléfono"
            required
            disabled={loading}
          />

          <FormField
            label="Tipo"
            type="select"
            value={formData.type || 'Perro'}
            onChange={(value) => updateField('type', value)}
            options={[
              { value: 'Perro', label: 'Perro' },
              { value: 'Gato', label: 'Gato' },
              { value: 'Hámster', label: 'Hámster' },
              { value: 'Pez', label: 'Pez' },
              { value: 'Ave', label: 'Ave' },
              { value: 'Otro', label: 'Otro' }
            ]}
            required
            disabled={loading}
          />

          <FormField
            label="Raza"
            type="text"
            value={formData.breed || ''}
            onChange={(value) => updateField('breed', value)}
            placeholder="Raza de la mascota"
            required
            disabled={loading}
          />

          <FormField
            label="Edad"
            type="number"
            value={formData.age || 1}
            onChange={(value) => updateField('age', parseInt(value))}
            min={0}
            max={30}
            required
            disabled={loading}
          />
        </div>

        <FormField
          label="Dirección"
          type="text"
          value={formData.address || ''}
          onChange={(value) => updateField('address', value)}
          placeholder="Dirección completa"
          required
          disabled={loading}
        />

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-300">Imagen</label>
          <div className="flex items-center gap-4">
            {imagePreview && <img src={imagePreview} alt="Vista previa" className="w-16 h-16 rounded-lg object-cover"/>}
            <input 
              type="file"
              onChange={handleImageChange}
              accept="image/png, image/jpeg, image/gif"
              className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-gray-300 hover:file:bg-gray-600 transition-colors" 
              disabled={loading}
            />
          </div>
        </div>

        <FormField
          label="Estado"
          type="select"
          value={formData.status || 'healthy'}
          onChange={(value) => updateField('status', value)}
          options={[
            { value: 'healthy', label: 'Saludable' },
            { value: 'adoption', label: 'En adopción' },
            { value: 'lost', label: 'Perdido' },
            { value: 'stolen', label: 'Robado' },
            { value: 'disoriented', label: 'Desorientado' }
          ]}
          disabled={loading}
        />

        <FormField
          label="Enfermedades"
          type="text"
          value={formData.illness || ''}
          onChange={(value) => updateField('illness', value)}
          placeholder="Enfermedades o condiciones médicas"
          disabled={loading}
        />

        <FormField
          label="Observaciones"
          type="textarea"
          value={formData.observations || ''}
          onChange={(value) => updateField('observations', value)}
          placeholder="Observaciones adicionales"
          rows={3}
          disabled={loading}
        />

        <div className={`grid gap-2 sm:gap-4 ${
          deviceMode === 'mobile' ? 'grid-cols-1' : 'grid-cols-2'
        }`}>
          <button
            type="submit"
            disabled={loading}
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
            {loading ? 'Guardando...' : (isCreating ? 'Crear Mascota' : 'Guardar Cambios')}
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