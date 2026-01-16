import React, { useState } from 'react';
import {
  Brain,
  Camera,
  Upload,
  Search,
  MapPin,
  AlertTriangle,
  HeartPulse
} from 'lucide-react';
import { PetCareAssistant } from './PetCareAssistant';

interface MatchedPet {
  id: string;
  name: string;
  lastSeen: string;
  location: string;
  date: string;
  similarity: number;
  image: string;
  contact: string;
}

export function FindAI() {
  const [searchResult, setSearchResult] = useState<MatchedPet[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [activeFeature, setActiveFeature] = useState<'pet-search' | 'pet-care'>('pet-search');

  // Simulated database of lost pets
  const lostPetsDatabase: MatchedPet[] = [
    {
      id: '1',
      name: 'Max',
      lastSeen: 'Parque Calderón',
      location: 'Centro Histórico, Cuenca',
      date: '2024-03-10',
      similarity: 95,
      image: 'https://images.unsplash.com/photo-1552053831-71594a27632d',
      contact: '098-765-4321',
    },
    {
      id: '2',
      name: 'Luna',
      lastSeen: 'Sector Mall del Río',
      location: 'Av. Felipe II, Cuenca',
      date: '2024-03-12',
      similarity: 87,
      image: 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8',
      contact: '099-888-7777',
    },
  ];

  const handleImageUpload = () => {
    setIsSearching(true);
    // Simulamos búsqueda en la base de datos
    setTimeout(() => {
      // Simulamos encontrar coincidencias
      const randomMatches = lostPetsDatabase
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.random() > 0.5 ? 2 : 1);
      setSearchResult(randomMatches);
      setIsSearching(false);
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <Brain className="text-green-500" />
          <h2 className="text-2xl font-bold">IA para Mascotas</h2>
        </div>

        <div className="mb-6 flex space-x-4">
          <button
            onClick={() => setActiveFeature('pet-search')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              activeFeature === 'pet-search'
                ? 'bg-green-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Search size={20} />
            Búsqueda de Mascotas
          </button>
          <button
            onClick={() => setActiveFeature('pet-care')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              activeFeature === 'pet-care'
                ? 'bg-green-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <HeartPulse size={20} />
            Asistente de Cuidado
          </button>
        </div>

        {activeFeature === 'pet-search' && (
          <div className="space-y-6">
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-8">
              <div className="flex flex-col items-center gap-4">
                <Camera size={48} className="text-gray-400" />
                <div className="text-center">
                  <p className="text-gray-300 mb-2">
                    Sube una foto de la mascota que estás buscando para compararla
                    con nuestra base de datos
                  </p>
                  <button
                    onClick={handleImageUpload}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors inline-flex items-center gap-2"
                    disabled={isSearching}
                  >
                    <Upload size={20} />
                    {isSearching ? 'Analizando...' : 'Subir Imagen'}
                  </button>
                </div>
              </div>
            </div>

            {isSearching && (
              <div className="text-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                <p className="text-gray-300">
                  Comparando con la base de datos de mascotas perdidas...
                </p>
              </div>
            )}

            {searchResult && (
              <div className="space-y-4">
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Search className="text-green-500" />
                    <h3 className="text-xl font-bold">
                      {searchResult.length === 0
                        ? 'No se encontraron coincidencias'
                        : `Se encontraron ${searchResult.length} posibles coincidencias`}
                    </h3>
                  </div>

                  <div className="grid gap-4">
                    {searchResult.map((match) => (
                      <div key={match.id} className="bg-gray-800 rounded-lg p-4">
                        <div className="flex gap-4">
                          <img
                            src={match.image}
                            alt={match.name}
                            className="w-32 h-32 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <h4 className="text-lg font-semibold">
                                {match.name}
                              </h4>
                              <span className="bg-green-600 text-white px-2 py-1 rounded text-sm">
                                {match.similarity}% coincidencia
                              </span>
                            </div>
                            <div className="space-y-2 mt-2">
                              <p className="flex items-center gap-2 text-gray-300">
                                <MapPin size={16} />
                                Último avistamiento: {match.lastSeen}
                              </p>
                              <p className="text-gray-400">Fecha: {match.date}</p>
                              <p className="text-gray-400">
                                Contacto: {match.contact}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-700 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="text-yellow-500" />
                    <h3 className="font-bold">Recomendaciones:</h3>
                  </div>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-center gap-2">
                      • Verifica personalmente cualquier coincidencia
                    </li>
                    <li className="flex items-center gap-2">
                      • Contacta a las autoridades locales
                    </li>
                    <li className="flex items-center gap-2">
                      • Comparte la búsqueda en redes sociales
                    </li>
                    <li className="flex items-center gap-2">
                      • Visita refugios y veterinarias cercanas
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {activeFeature === 'pet-care' && (
          <PetCareAssistant />
        )}
      </div>
    </div>
  );
}