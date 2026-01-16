import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export function PetMap() {
  // Combinamos todas las mascotas de diferentes categorías
  const petLocations = [
    // Mascotas Perdidas
    {
      id: 1,
      name: 'Max',
      type: 'Perro',
      status: 'lost',
      position: [-2.8974, -79.0045],
      description: 'Labrador dorado, collar azul',
      image: 'https://images.unsplash.com/photo-1552053831-71594a27632d',
      location: 'Sector Totoracocha',
      reward: '$100',
    },
    {
      id: 2,
      name: 'Nina',
      type: 'Gato',
      status: 'lost',
      position: [-2.9015, -79.0035],
      description: 'Gata siamesa, collar rojo',
      image: 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8',
      location: 'Parque Calderón',
      reward: '$50',
    },
    // Mascotas Encontradas
    {
      id: 3,
      name: 'Rufus',
      type: 'Perro',
      status: 'found',
      position: [-2.8934, -79.0065],
      description: 'Perro mestizo, muy amistoso',
      image: 'https://images.unsplash.com/photo-1555685812-d918e6b2ef69',
      location: 'Calle 10',
    },
    {
      id: 4,
      name: 'Luna',
      type: 'Gato',
      status: 'found',
      position: [-2.8954, -79.0075],
      description: 'Gata negra con ojos amarillos',
      image: 'https://images.unsplash.com/photo-1590481848851-6d43e5deaf81',
      location: 'Calle Principal',
    },
    // Mascotas Desorientadas
    {
      id: 5,
      name: 'Toby',
      type: 'Perro',
      status: 'disoriented',
      position: [-2.8994, -79.0055],
      description: 'Perro desorientado, parece asustado',
      image: 'https://images.unsplash.com/photo-1517849845537-22b64a2406b5',
      location: 'Av. Solano',
    },
    {
      id: 6,
      name: 'Whiskers',
      type: 'Gato',
      status: 'disoriented',
      position: [-2.9005, -79.0025],
      description: 'Gato vagando solo, necesita ayuda',
      image: 'https://images.unsplash.com/photo-1592194996308-6b7280b7825b',
      location: 'Parque Miraflores',
    },
    // Mascotas Robadas
    {
      id: 7,
      name: 'Rocky',
      type: 'Perro',
      status: 'stolen',
      position: [-2.8914, -79.0095],
      description: 'Pastor Alemán, desapareció de su casa',
      image: 'https://images.unsplash.com/photo-1548247416-ec66f4900b2e',
      location: 'Urbanización Las Orquídeas',
    },
    // Mascotas en Adopción
    {
      id: 8,
      name: 'Pelusa',
      type: 'Gato',
      status: 'adoption',
      position: [-2.8984, -79.0115],
      description: 'Gatita blanca, muy cariñosa',
      image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba',
      location: 'Refugio Animal Cuenca',
    },
    // Mascotas en Condición de Calle
    {
      id: 9,
      name: 'Callejero',
      type: 'Perro',
      status: 'street',
      position: [-2.9025, -79.0085],
      description: 'Perro mestizo, necesita hogar',
      image: 'https://images.unsplash.com/photo-1537201872045-0531b85b03ad',
      location: 'Parque Central',
    },
  ];

  // Función para crear iconos personalizados basados en el estado
  const createCustomIcon = (pet) => {
    let color;
    switch (pet.status) {
      case 'lost':
        color = 'orange';
        break;
      case 'found':
        color = 'green';
        break;
      case 'disoriented':
        color = 'yellow';
        break;
      case 'stolen':
        color = 'red';
        break;
      case 'adoption':
        color = 'purple';
        break;
      case 'street':
        color = 'blue';
        break;
      default:
        color = 'gray';
    }

    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          width: 40px; 
          height: 40px; 
          border-radius: 50%; 
          background-color: ${color};
          display: flex;
          justify-content: center;
          align-items: center;
          border: 2px solid white;
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        ">
          <img 
            src="${pet.image}" 
            alt="${pet.name}" 
            style="
              width: 32px; 
              height: 32px; 
              border-radius: 50%; 
              object-fit: cover;
            "
          />
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });
  };

  // Función para obtener las clases de color del popup
  const getPopupColorClasses = (status) => {
    switch (status) {
      case 'lost':
        return {
          bg: 'bg-orange-100',
          border: 'border-orange-300',
          text: 'text-orange-900',
        };
      case 'found':
        return {
          bg: 'bg-green-100',
          border: 'border-green-300',
          text: 'text-green-900',
        };
      case 'disoriented':
        return {
          bg: 'bg-yellow-100',
          border: 'border-yellow-300',
          text: 'text-yellow-900',
        };
      case 'stolen':
        return {
          bg: 'bg-red-100',
          border: 'border-red-300',
          text: 'text-red-900',
        };
      case 'adoption':
        return {
          bg: 'bg-purple-100',
          border: 'border-purple-300',
          text: 'text-purple-900',
        };
      case 'street':
        return {
          bg: 'bg-blue-100',
          border: 'border-blue-300',
          text: 'text-blue-900',
        };
      default:
        return {
          bg: 'bg-gray-100',
          border: 'border-gray-300',
          text: 'text-gray-900',
        };
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-4">Mapa de Mascotas</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-sm">Perdidas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm">Encontradas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-sm">Desorientadas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-sm">Robadas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span className="text-sm">En Adopción</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-sm">Calle</span>
          </div>
        </div>
      </div>

      <div className="h-[500px] rounded-lg overflow-hidden">
        <MapContainer
          center={[-2.8974, -79.0045]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {petLocations.map((pet) => {
            const colorClasses = getPopupColorClasses(pet.status);

            return (
              <Marker
                key={pet.id}
                position={pet.position}
                icon={createCustomIcon(pet)}
              >
                <Popup>
                  <div
                    className={`p-2 flex flex-col items-center ${colorClasses.bg} ${colorClasses.border} border-2 rounded-lg`}
                  >
                    <img
                      src={pet.image}
                      alt={pet.name}
                      className="w-24 h-24 object-cover rounded-full mb-2 border-2 border-white shadow-md"
                    />
                    <h3 className={`font-bold text-lg ${colorClasses.text}`}>
                      {pet.name}
                    </h3>
                    <p className={`text-sm ${colorClasses.text}`}>{pet.type}</p>
                    <p className={`text-sm text-center ${colorClasses.text}`}>
                      {pet.description}
                    </p>
                    <p className={`text-sm ${colorClasses.text}`}>
                      Ubicación: {pet.location}
                    </p>
                    {pet.reward && (
                      <p className={`font-bold mt-2 ${colorClasses.text}`}>
                        Recompensa: {pet.reward}
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
