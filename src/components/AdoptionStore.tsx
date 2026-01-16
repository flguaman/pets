import React, { useState, useEffect } from 'react';
import { Tag, ShoppingBag, Shield, Plus, Search, Filter, Heart } from 'lucide-react';
import { useSettingsStore } from '../store/settingsStore';
import { usePosts } from '../hooks/usePosts';
import { PostCard } from './Posts/PostCard';
import { PostForm } from './Posts/PostForm';
import { usePets } from '../hooks/usePets';
import { useAuthStore } from '../store/authStore';
import { usePetStore } from '../store/petStore';

const products = [
  {
    id: 1,
    name: 'Placa Personalizada Premium',
    price: '$15.99',
    image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119',
    description: 'Placa de acero inoxidable grabada a láser',
  },
  {
    id: 2,
    name: 'Placa ID Inteligente',
    price: '$24.99',
    image: 'https://images.unsplash.com/photo-1626285861696-9f0bf5a49c6d',
    description: 'Con código QR y GPS integrado',
  },
  {
    id: 3,
    name: 'Collar Personalizado',
    price: '$12.99',
    image: 'https://images.unsplash.com/photo-1619234444-0c98c89e8b26',
    description: 'Collar de cuero con nombre y fecha de nacimiento grabados a láser',
  },
  {
    id: 4,
    name: 'Juguetes para Mascotas',
    price: '$9.99',
    image: 'https://images.unsplash.com/photo-1594323149-1e35df8f6b5e',
    description: 'Paquete de juguetes para perros y gatos, incluyendo pelotas, muñecos y más',
  },
  {
    id: 5,
    name: 'Cama para Mascotas',
    price: '$39.99',
    image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e',
    description: 'Cama acolchada con forro suave, ideal para perros y gatos',
  },
  {
    id: 6,
    name: 'Comedero Automático',
    price: '$49.99',
    image: 'https://images.unsplash.com/photo-1594323149-1e35df8f6b5e',
    description: 'Comedero programable para alimentar a tu mascota a horarios fijos',
  },
];

function handleBuyProduct(productId) {
  // Lógica para manejar la compra del producto
}

export function AdoptionStore() {
  const { deviceMode } = useSettingsStore();
  const { posts, loading, createPost, loadAllPosts } = usePosts();
  const { pets } = usePetStore();
  const { isAuthenticated } = useAuthStore();
  const [showPostForm, setShowPostForm] = useState(false);
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

  // Filter posts for adoption
  const adoptionPosts = posts.filter(post => post.type === 'adoption');

  const filteredAdoptionPosts = adoptionPosts.filter(post => {
    const matchesSearch = !searchTerm || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

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
    <div className={`grid gap-4 sm:gap-8 ${
      deviceMode === 'mobile' ? 'grid-cols-1' : 'md:grid-cols-2'
    }`}>
      {/* Sección de Adopción */}
      <div className={`bg-gray-800 rounded-xl ${
        deviceMode === 'mobile' ? 'p-3 sm:p-4' : 'p-6'
      }`}>
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2">
            <Shield className="text-green-500" size={deviceMode === 'mobile' ? 20 : 24} />
            <h2 className={`font-bold ${
              deviceMode === 'mobile' ? 'text-lg sm:text-xl' : 'text-2xl'
            }`}>Adopción Legal de Mascotas</h2>
          </div>
          
          {isAuthenticated && (
            <button
              onClick={() => setShowPostForm(true)}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors"
            >
              <Plus size={16} />
              <span className={deviceMode === 'mobile' ? 'hidden sm:inline' : ''}>
                Publicar
              </span>
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="mb-4 relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar mascotas en adopción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white text-sm"
          />
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Cargando adopciones...</p>
          </div>
        ) : filteredAdoptionPosts.length > 0 ? (
          <div className="space-y-4">
            {filteredAdoptionPosts.map((post) => (
              <div key={post.id} className="transform scale-95">
                <PostCard post={post} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Heart size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay mascotas en adopción</h3>
            <p className="text-gray-400 mb-4">
              {searchTerm 
                ? 'No se encontraron mascotas con ese criterio de búsqueda'
                : 'No hay mascotas disponibles para adopción en este momento'
              }
            </p>
            {isAuthenticated && (
              <button
                onClick={() => setShowPostForm(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Publicar Primera Adopción
              </button>
            )}
          </div>
        )}
      </div>

      {/* Sección de Productos */}
      <div className={`bg-gray-800 rounded-xl ${
        deviceMode === 'mobile' ? 'p-3 sm:p-4' : 'p-6'
      }`}>
        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          <Tag className="text-green-500" size={deviceMode === 'mobile' ? 20 : 24} />
          <h2 className={`font-bold ${
            deviceMode === 'mobile' ? 'text-lg sm:text-xl' : 'text-2xl'
          }`}>Placas y Artículos</h2>
        </div>
        <div className="grid gap-3 sm:gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className={`bg-gray-700 rounded-lg flex gap-3 sm:gap-4 ${
                deviceMode === 'mobile' ? 'p-3' : 'p-4'
              }`}
            >
              <img
                src={product.image}
                alt={product.name}
                className={`object-cover rounded-lg ${
                  deviceMode === 'mobile' 
                    ? 'w-20 h-20 sm:w-24 sm:h-24' 
                    : 'w-32 h-32'
                }`}
              />
              <div className="flex-1">
                <h3 className={`font-semibold mb-1 sm:mb-2 ${
                  deviceMode === 'mobile' ? 'text-sm sm:text-base line-clamp-1' : 'text-xl'
                }`}>{product.name}</h3>
                <p className={`text-green-500 font-bold mb-1 sm:mb-2 ${
                  deviceMode === 'mobile' ? 'text-sm' : 'text-base'
                }`}>{product.price}</p>
                <p className={`text-gray-400 mb-2 sm:mb-4 ${
                  deviceMode === 'mobile' ? 'text-xs sm:text-sm line-clamp-2' : 'text-sm'
                }`}>{product.description}</p>
                <button
                  className={`bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors ${
                    deviceMode === 'mobile' 
                      ? 'px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm' 
                      : 'px-4 py-2'
                  }`}
                  onClick={() => handleBuyProduct(product.id)}
                >
                  Comprar Ahora
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}