import React, { useState, useEffect } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Stethoscope,
  MapPin,
  Phone,
  Clock,
  ShoppingBag,
  Shield,
  Plus,
  Filter,
  Search,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../../store/settingsStore';
import { usePosts } from '../../hooks/usePosts';
import { PostCard } from '../Posts/PostCard';
import { PostForm } from '../Posts/PostForm';
import { useAuthStore } from '../../store/authStore';
import { usePetStore } from '../../store/petStore';

// Datos de productos
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
    name: 'Collar Inteligente',
    price: '$29.99',
    image: 'https://www.infobae.com/new-resizer/RsiYz1SjSlQ6Mk-Nh2cj5a-KzLg=/arc-anglerfish-arc2-prod-infobae/public/A5JYDPFBHFBOTBE5CDMUCV45SA.jpg',
    description: 'Collar con GPS integrado para localizar a tu mascota',
  },
  {
    id: 3,
    name: 'Juguetes para Mascotas',
    price: '$9.99',
    image: 'https://citypet.ec/wp-content/uploads/2020/06/PA-6556-TOY-FOR-DOG-1.jpg',
    description: 'Paquete de juguetes para perros y gatos',
  },
  {
    id: 4,
    name: 'Cama para Mascotas',
    price: '$39.99',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTSjP302U_i9722UIv6xU2xBmqgIB3uHyYRCA&s',
    description: 'Cama acolchada con forro suave, ideal para perros y gatos',
  },
];

// Datos de veterinarias
const vets = [
  {
    id: 1,
    name: 'Clínica Veterinaria San Francisco',
    address: 'Av. Remigio Crespo 5-43, Cuenca',
    phone: '07-281-5432',
    hours: 'Lun-Sáb: 9:00 - 19:00',
    services: ['Emergencias 24/7', 'Cirugía', 'Vacunación', 'Peluquería'],
    image: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7',
  },
  {
    id: 2,
    name: 'Centro Veterinario El Vergel',
    address: 'Gran Colombia 12-22, Cuenca',
    phone: '07-425-6789',
    hours: 'Lun-Dom: 8:00 - 20:00',
    services: ['Laboratorio', 'Hospitalización', 'Farmacia', 'Rayos X'],
    image: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def',
  },
];

// Datos de fundaciones
const foundations = [
  {
    id: 1,
    name: 'Fundación Fauna Ecuatoriana',
    description: 'Apoyamos la rescate y rehabilitación de animales silvestres.',
    donateLink: 'https://www.faunaecuadoriana.org/donaciones',
    image: 'https://www.amarufundacion.com/logo-fundacion-amaru-dark.png',
  },
  {
    id: 2,
    name: 'Fundación Patitas de Corazón',
    description: 'Trabajamos por el rescate y adopción de perros y gatos en situación de calle.',
    donateLink: 'https://www.patitasdecorazon.org/donaciones',
    image: 'https://pae.ec/wp-content/uploads/2022/11/logo-sos-verde.png',
  },
];

// Datos de noticias
const news = [
  {
    id: 1,
    title: 'Campaña de Adopción de Mascotas',
    description: 'Este fin de semana se realizará una campaña de adopción en el parque central.',
    image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e',
  },
  {
    id: 2,
    title: 'Nueva Clínica Veterinaria en el Centro',
    description: 'Se inauguró una nueva clínica veterinaria con servicios de última generación.',
    image: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7',
  },
];

function ProductCard({ product }) {
  const { deviceMode } = useSettingsStore();
  
  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg">
      <img
        src={product.image}
        alt={product.name}
        className={`w-full object-cover ${
          deviceMode === 'mobile' 
            ? 'h-28 sm:h-32' 
            : 'h-48'
        }`}
      />
      <div className={deviceMode === 'mobile' ? 'p-2 sm:p-3' : 'p-4 sm:p-6'}>
        <h3 className={`font-bold mb-1 sm:mb-2 ${
          deviceMode === 'mobile' 
            ? 'text-sm sm:text-base line-clamp-1' 
            : 'text-lg sm:text-xl'
        }`}>{product.name}</h3>
        <p className={`text-green-500 font-bold mb-2 sm:mb-4 ${
          deviceMode === 'mobile' ? 'text-sm' : 'text-base'
        }`}>{product.price}</p>
        <p className={`text-gray-400 mb-2 sm:mb-4 ${
          deviceMode === 'mobile' 
            ? 'text-xs sm:text-sm line-clamp-2' 
            : 'text-sm'
        }`}>{product.description}</p>
        <button className={`w-full bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors ${
          deviceMode === 'mobile' 
            ? 'py-1.5 text-xs sm:py-2 sm:text-sm' 
            : 'py-2'
        }`}>
          Comprar Ahora
        </button>
      </div>
    </div>
  );
}

function VetCard({ vet }) {
  const { deviceMode } = useSettingsStore();
  
  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg">
      <img
        src={vet.image}
        alt={vet.name}
        className={`w-full object-cover ${
          deviceMode === 'mobile' 
            ? 'h-28 sm:h-32' 
            : 'h-48'
        }`}
      />
      <div className={deviceMode === 'mobile' ? 'p-2 sm:p-3' : 'p-4 sm:p-6'}>
        <h3 className={`font-bold mb-2 sm:mb-4 ${
          deviceMode === 'mobile' 
            ? 'text-sm sm:text-base line-clamp-1' 
            : 'text-lg sm:text-xl'
        }`}>{vet.name}</h3>

        <div className="space-y-1 sm:space-y-3">
          <div className="flex items-center gap-1 sm:gap-2 text-gray-300">
            <MapPin size={deviceMode === 'mobile' ? 12 : 18} className="flex-shrink-0" />
            <span className={`${
              deviceMode === 'mobile' 
                ? 'text-xs sm:text-sm line-clamp-1' 
                : 'text-sm'
            }`}>{vet.address}</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 text-gray-300">
            <Phone size={deviceMode === 'mobile' ? 12 : 18} className="flex-shrink-0" />
            <span className={deviceMode === 'mobile' ? 'text-xs sm:text-sm' : 'text-sm'}>{vet.phone}</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 text-gray-300">
            <Clock size={deviceMode === 'mobile' ? 12 : 18} className="flex-shrink-0" />
            <span className={deviceMode === 'mobile' ? 'text-xs sm:text-sm' : 'text-sm'}>{vet.hours}</span>
          </div>
        </div>

        <div className="mt-2 sm:mt-4">
          <h4 className={`font-semibold mb-1 sm:mb-2 ${
            deviceMode === 'mobile' ? 'text-xs sm:text-sm' : 'text-sm'
          }`}>Servicios:</h4>
          <div className="flex flex-wrap gap-1">
            {vet.services.slice(0, deviceMode === 'mobile' ? 2 : 4).map((service) => (
              <span
                key={service}
                className={`bg-gray-700 rounded-full ${
                  deviceMode === 'mobile' 
                    ? 'px-1.5 py-0.5 text-xs' 
                    : 'px-3 py-1 text-sm'
                }`}
              >
                {service}
              </span>
            ))}
            {deviceMode === 'mobile' && vet.services.length > 2 && (
              <span className="bg-gray-700 rounded-full px-1.5 py-0.5 text-xs">
                +{vet.services.length - 2}
              </span>
            )}
          </div>
        </div>

        <button className={`mt-3 sm:mt-6 w-full bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors ${
          deviceMode === 'mobile' 
            ? 'py-1.5 text-xs sm:py-2 sm:text-sm' 
            : 'py-2'
        }`}>
          Agendar Cita
        </button>
      </div>
    </div>
  );
}

function FoundationCard({ foundation }) {
  const { deviceMode } = useSettingsStore();
  
  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg">
      <img
        src={foundation.image}
        alt={foundation.name}
        className={`w-full object-cover ${
          deviceMode === 'mobile' 
            ? 'h-28 sm:h-32' 
            : 'h-48'
        }`}
      />
      <div className={deviceMode === 'mobile' ? 'p-2 sm:p-3' : 'p-4 sm:p-6'}>
        <h3 className={`font-bold mb-2 sm:mb-4 ${
          deviceMode === 'mobile' 
            ? 'text-sm sm:text-base line-clamp-1' 
            : 'text-lg sm:text-xl'
        }`}>{foundation.name}</h3>
        <p className={`text-gray-300 mb-2 sm:mb-4 ${
          deviceMode === 'mobile' 
            ? 'text-xs sm:text-sm line-clamp-2' 
            : 'text-sm'
        }`}>{foundation.description}</p>

        <button
          onClick={() => window.open(foundation.donateLink, '_blank')}
          className={`mt-3 sm:mt-6 w-full bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors ${
            deviceMode === 'mobile' 
              ? 'py-1.5 text-xs sm:py-2 sm:text-sm' 
              : 'py-2'
          }`}
        >
          ¡Donar Ahora!
        </button>
      </div>
    </div>
  );
}

function NewsCard({ newsItem }) {
  const { deviceMode } = useSettingsStore();
  
  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg">
      <img
        src={newsItem.image}
        alt={newsItem.title}
        className={`w-full object-cover ${
          deviceMode === 'mobile' 
            ? 'h-28 sm:h-32' 
            : 'h-48'
        }`}
      />
      <div className={deviceMode === 'mobile' ? 'p-2 sm:p-3' : 'p-4 sm:p-6'}>
        <h3 className={`font-bold mb-2 sm:mb-4 ${
          deviceMode === 'mobile' 
            ? 'text-sm sm:text-base line-clamp-1' 
            : 'text-lg sm:text-xl'
        }`}>{newsItem.title}</h3>
        <p className={`text-gray-300 mb-2 sm:mb-4 ${
          deviceMode === 'mobile' 
            ? 'text-xs sm:text-sm line-clamp-2' 
            : 'text-sm'
        }`}>{newsItem.description}</p>
      </div>
    </div>
  );
}

export function HomePage() {
  const { t } = useTranslation();
  const { deviceMode } = useSettingsStore();
  const { isAuthenticated } = useAuthStore();
  const { posts, loading: postsLoading, loadAllPosts, createPost } = usePosts();
  const { pets, loadPets } = usePetStore();
  const [showPostForm, setShowPostForm] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Load all posts for home feed
  useEffect(() => {
    loadAllPosts();
    loadPets();
  }, []);

  const handleCreatePost = async (postData: any) => {
    try {
      await createPost(postData);
      setShowPostForm(false);
      loadAllPosts(); // Refresh posts
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  // Filter posts based on type and search
  const filteredPosts = posts.filter(post => {
    const matchesType = filterType === 'all' || post.type === filterType;
    const matchesSearch = !searchTerm || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesType && matchesSearch;
  });

  const postTypes = [
    { value: 'all', label: 'Todas', count: posts.length },
    { value: 'adoption', label: 'Adopción', count: posts.filter(p => p.type === 'adoption').length },
    { value: 'lost', label: 'Perdidas', count: posts.filter(p => p.type === 'lost').length },
    { value: 'stolen', label: 'Robadas', count: posts.filter(p => p.type === 'stolen').length },
    { value: 'disoriented', label: 'Desorientadas', count: posts.filter(p => p.type === 'disoriented').length },
    { value: 'general', label: 'General', count: posts.filter(p => p.type === 'general').length },
  ];

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
    <div className={`mx-auto ${
      deviceMode === 'mobile' 
        ? 'px-1 py-1 sm:px-2 sm:py-2' 
        : 'max-w-7xl px-2 sm:px-4 py-4 sm:py-8'
    }`}>
      {/* Quick Actions for Authenticated Users */}
      {isAuthenticated && (
        <div className="bg-gray-800 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className={`font-bold ${
              deviceMode === 'mobile' 
                ? 'text-base sm:text-lg' 
                : 'text-xl sm:text-2xl'
            }`}>
              ¿Qué quieres compartir hoy?
            </h2>
            <button
              onClick={() => setShowPostForm(true)}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus size={16} />
              <span className={deviceMode === 'mobile' ? 'hidden sm:inline' : ''}>
                Nueva Publicación
              </span>
            </button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => setShowPostForm(true)}
              className="p-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-center"
            >
              <Heart className="mx-auto mb-1" size={20} />
              <div className="text-xs font-medium">Adopción</div>
            </button>
            
            <button
              onClick={() => setShowPostForm(true)}
              className="p-3 bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors text-center"
            >
              <Search className="mx-auto mb-1" size={20} />
              <div className="text-xs font-medium">Perdida</div>
            </button>
            
            <button
              onClick={() => setShowPostForm(true)}
              className="p-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-center"
            >
              <Shield className="mx-auto mb-1" size={20} />
              <div className="text-xs font-medium">Robada</div>
            </button>
            
            <button
              onClick={() => setShowPostForm(true)}
              className="p-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-center"
            >
              <MessageCircle className="mx-auto mb-1" size={20} />
              <div className="text-xs font-medium">General</div>
            </button>
          </div>
        </div>
      )}

      {/* Posts Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h2 className={`font-bold ${
            deviceMode === 'mobile' 
              ? 'text-base sm:text-lg' 
              : 'text-xl sm:text-2xl'
          }`}>
            Publicaciones de la Comunidad
          </h2>
          
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar publicaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-800 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white text-sm w-full sm:w-64"
              />
            </div>
            
            <div className="relative">
              <Filter size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-gray-800 border border-gray-600 rounded-lg pl-10 pr-8 py-2 text-white text-sm appearance-none"
              >
                {postTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label} ({type.count})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        {postsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Cargando publicaciones...</p>
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
          <div className="text-center py-12 bg-gray-800 rounded-xl">
            <MessageCircle size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay publicaciones</h3>
            <p className="text-gray-400 mb-4">
              {searchTerm || filterType !== 'all' 
                ? 'No se encontraron publicaciones con los filtros aplicados'
                : 'Sé el primero en compartir algo con la comunidad'
              }
            </p>
            {isAuthenticated && (
              <button
                onClick={() => setShowPostForm(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Crear Primera Publicación
              </button>
            )}
          </div>
        )}
      </div>

      {/* Sección de productos */}
      <h2 className={`font-bold mb-2 sm:mb-4 ${
        deviceMode === 'mobile' 
          ? 'text-base sm:text-lg mb-2' 
          : 'text-xl sm:text-2xl mb-4 sm:mb-6'
      }`}>Productos</h2>
      <div className={`grid gap-2 sm:gap-4 mb-4 sm:mb-8 ${
        deviceMode === 'mobile' 
          ? 'grid-cols-1 gap-2 mb-4' 
          : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'
      }`}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Sección de veterinarias */}
      <h2 className={`font-bold mb-2 sm:mb-4 ${
        deviceMode === 'mobile' 
          ? 'text-base sm:text-lg mb-2' 
          : 'text-xl sm:text-2xl mb-4 sm:mb-6'
      }`}>Veterinarias</h2>
      <div className={`grid gap-2 sm:gap-4 mb-4 sm:mb-8 ${
        deviceMode === 'mobile' 
          ? 'grid-cols-1 gap-2 mb-4' 
          : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'
      }`}>
        {vets.map((vet) => (
          <VetCard key={vet.id} vet={vet} />
        ))}
      </div>

      {/* Sección de fundaciones */}
      <h2 className={`font-bold mb-2 sm:mb-4 ${
        deviceMode === 'mobile' 
          ? 'text-base sm:text-lg mb-2' 
          : 'text-xl sm:text-2xl mb-4 sm:mb-6'
      }`}>Fundaciones</h2>
      <div className={`grid gap-2 sm:gap-4 mb-4 sm:mb-8 ${
        deviceMode === 'mobile' 
          ? 'grid-cols-1 gap-2 mb-4' 
          : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'
      }`}>
        {foundations.map((foundation) => (
          <FoundationCard key={foundation.id} foundation={foundation} />
        ))}
      </div>

      {/* Sección de noticias */}
      <h2 className={`font-bold mb-2 sm:mb-4 ${
        deviceMode === 'mobile' 
          ? 'text-base sm:text-lg mb-2' 
          : 'text-xl sm:text-2xl mb-4 sm:mb-6'
      }`}>Noticias</h2>
      <div className={`grid gap-2 sm:gap-4 ${
        deviceMode === 'mobile' 
          ? 'grid-cols-1 gap-2' 
          : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'
      }`}>
        {news.map((newsItem) => (
          <NewsCard key={newsItem.id} newsItem={newsItem} />
        ))}
      </div>
    </div>
  );
}