import React, { useState, useEffect } from 'react';
import { AlertTriangle, Shield, MessageSquare, MapPin, Plus, Search, Filter } from 'lucide-react';
import { PetMap } from './PetMap';
import { usePosts } from '../hooks/usePosts';
import { PostCard } from './Posts/PostCard';
import { PostForm } from './Posts/PostForm';
import { usePets } from '../hooks/usePets';
import { useAuthStore } from '../store/authStore';
import { useSettingsStore } from '../store/settingsStore';
import { usePetStore } from '../store/petStore';

export function Alerts() {
  const { posts, loading, createPost, loadAllPosts } = usePosts();
  const { pets } = usePetStore();
  const { isAuthenticated } = useAuthStore();
  const { deviceMode } = useSettingsStore();
  const [showPostForm, setShowPostForm] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAllPosts();
  }, []);

  const handleCreatePost = async (postData: any) => {
    try {
      await createPost(postData);
      setShowPostForm(false);
      loadAllPosts();
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  // Filter posts for alerts (lost, stolen, disoriented)
  const alertPosts = posts.filter(post => 
    ['lost', 'stolen', 'disoriented'].includes(post.type)
  );

  const filteredPosts = alertPosts.filter(post => {
    const matchesType = filterType === 'all' || post.type === filterType;
    const matchesSearch = !searchTerm || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesType && matchesSearch;
  });

  const alertTypes = [
    { value: 'all', label: 'Todas las Alertas', count: alertPosts.length },
    { value: 'lost', label: 'Perdidas', count: posts.filter(p => p.type === 'lost').length },
    { value: 'stolen', label: 'Robadas', count: posts.filter(p => p.type === 'stolen').length },
    { value: 'disoriented', label: 'Desorientadas', count: posts.filter(p => p.type === 'disoriented').length },
  ];

  // Reportes de abuso (datos estáticos por ahora)
  const abuseReports = [
    {
      id: 1,
      location: 'Urbanización Las Orquídeas',
      date: '2024-03-20',
      description: 'Maltrato físico a un perro por parte de su dueño',
      status: 'En investigación',
    },
    {
      id: 2,
      location: 'Sector El Vergel',
      date: '2024-03-19',
      description: 'Abandono de gatos en condiciones precarias',
      status: 'Reportado',
    },
  ];

  if (showPostForm) {
    return (
      <PostForm
        pets={pets}
        onSave={handleCreatePost}
        onCancel={() => setShowPostForm(false)}
        loading={loading}
      />
    );
  }

  return (
    <div className="grid gap-8">
      {/* Mapa de Mascotas */}
      <PetMap />

      {/* Quick Actions for Alerts */}
      {isAuthenticated && (
        <div className="bg-gray-800 rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <AlertTriangle className="text-orange-500" />
              Reportar Alerta
            </h3>
            <button
              onClick={() => setShowPostForm(true)}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus size={16} />
              <span className={deviceMode === 'mobile' ? 'hidden sm:inline' : ''}>
                Nueva Alerta
              </span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => setShowPostForm(true)}
              className="p-4 bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors text-center"
            >
              <Search className="mx-auto mb-2" size={24} />
              <div className="font-medium">Mascota Perdida</div>
              <div className="text-sm opacity-80">Reportar pérdida</div>
            </button>
            
            <button
              onClick={() => setShowPostForm(true)}
              className="p-4 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-center"
            >
              <Shield className="mx-auto mb-2" size={24} />
              <div className="font-medium">Mascota Robada</div>
              <div className="text-sm opacity-80">Reportar robo</div>
            </button>
            
            <button
              onClick={() => setShowPostForm(true)}
              className="p-4 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors text-center"
            >
              <MapPin className="mx-auto mb-2" size={24} />
              <div className="font-medium">Desorientada</div>
              <div className="text-sm opacity-80">Mascota perdida</div>
            </button>
          </div>
        </div>
      )}

      {/* Alertas de Mascotas */}
      <div className="bg-gray-800 rounded-xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <AlertTriangle className="text-red-500" />
            Alertas de Mascotas
          </h2>
          
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar alertas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white text-sm w-full sm:w-64"
              />
            </div>
            
            <div className="relative">
              <Filter size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-8 py-2 text-white text-sm appearance-none"
              >
                {alertTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label} ({type.count})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Cargando alertas...</p>
          </div>
        ) : filteredPosts.length > 0 ? (
          <div className={`grid gap-4 sm:gap-6 ${
            deviceMode === 'mobile' 
              ? 'grid-cols-1' 
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}>
            {filteredPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <AlertTriangle size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay alertas activas</h3>
            <p className="text-gray-400 mb-4">
              {searchTerm || filterType !== 'all' 
                ? 'No se encontraron alertas con los filtros aplicados'
                : 'No hay alertas de mascotas en este momento'
              }
            </p>
            {isAuthenticated && (
              <button
                onClick={() => setShowPostForm(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Reportar Primera Alerta
              </button>
            )}
          </div>
        )}
      </div>

      {/* Sección de Historial de Denuncias */}
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="text-red-500" />
          <h2 className="text-2xl font-bold">Historial de Denuncias</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {abuseReports.map((report) => (
            <AbuseReportCard key={report.id} report={report} />
          ))}
        </div>
      </div>

      {/* Sección de Denuncias por Maltrato */}
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="text-green-500" />
          <h2 className="text-2xl font-bold">Denuncias por Maltrato</h2>
        </div>
        <form className="space-y-4">
          <InputField
            label="Ubicación del Incidente"
            placeholder="Dirección exacta"
          />
          <TextAreaField
            label="Descripción"
            rows={4}
            placeholder="Describe la situación"
          />
          <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors">
            Enviar Denuncia
          </button>
        </form>
      </div>
    </div>
  );
}

// Componente para las tarjetas de reportes de abuso
const AbuseReportCard = ({ report }) => (
  <div className="bg-gray-700 rounded-lg p-4">
    <div>
      <h3 className="text-xl font-semibold mb-2">Denuncia #{report.id}</h3>
      <p className="text-gray-400 mb-2">Ubicación: {report.location}</p>
      <p className="text-gray-400 mb-2">Fecha: {report.date}</p>
      <p className="text-gray-300 mb-4">{report.description}</p>
      <span
        className={`px-3 py-1 rounded-full text-sm font-bold ${
          report.status === 'En investigación'
            ? 'bg-yellow-500 text-yellow-900'
            : 'bg-red-500 text-red-100'
        }`}
      >
        {report.status}
      </span>
    </div>
  </div>
);

// Componente para inputs
const InputField = ({ label, placeholder }) => (
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-1">
      {label}
    </label>
    <input
      type="text"
      className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5"
      placeholder={placeholder}
    />
  </div>
);

// Componente para textareas
const TextAreaField = ({ label, rows, placeholder }) => (
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-1">
      {label}
    </label>
    <textarea
      className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5"
      rows={rows}
      placeholder={placeholder}
    />
  </div>
);