import React from 'react';
import { Stethoscope, MapPin, Phone, Clock } from 'lucide-react';

export function Veterinaries() {
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
    {
      id: 3,
      name: 'Clínica Veterinaria Patitas Felices',
      address: 'Calle Larga 10-15, Cuenca',
      phone: '07-345-6789',
      hours: 'Lun-Vie: 10:00 - 18:00',
      services: ['Consultas', 'Vacunación', 'Odontología', 'Ecografías'],
      image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee',
    },
    {
      id: 4,
      name: 'Veterinaria Cuidado Animal',
      address: 'Av. Solano 20-30, Cuenca',
      phone: '07-567-8901',
      hours: 'Lun-Dom: 9:00 - 21:00',
      services: ['Emergencias', 'Cirugía', 'Laboratorio', 'Peluquería'],
      image: 'https://images.unsplash.com/photo-1594313255284-84f47fd1b795',
    },
  ];

  const foundations = [
    {
      id: 1,
      name: 'Fundación Fauna Ecuatoriana',
      description:
        'Apoyamos la rescate y rehabilitación de animales silvestres.',
      donateLink: 'https://www.faunaecuadoriana.org/donaciones',
      image: 'https://images.unsplash.com/photo-1560807708-99f28b1c1881',
    },
    {
      id: 2,
      name: 'Fundación Animalista',
      description: 'Promovemos la adopción y el bienestar animal.',
      donateLink: 'https://www.fundacionanimalista.org/donaciones',
      image: 'https://images.unsplash.com/photo-1574158622689-503f7661044c',
    },
    {
      id: 3,
      name: 'Fundación Patitas de Corazón',
      description:
        'Trabajamos por el rescate y adopción de perros y gatos en situación de calle.',
      donateLink: 'https://www.patitasdecorazon.org/donaciones',
      image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e',
    },
    {
      id: 4,
      name: 'Fundación Vida Silvestre Ecuador',
      description: 'Protegemos la biodiversidad y los ecosistemas del Ecuador.',
      donateLink: 'https://www.vidasilvestre.org/donaciones',
      image: 'https://images.unsplash.com/photo-1549471156-52ee71691122',
    },
  ];

  const openInGoogleMaps = (address) => {
    const url = `https://www.google.com/maps/search/${address.replace(
      /\s+/g,
      '+'
    )}`;
    window.open(url, '_blank');
  };

  return (
    <div className="grid gap-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Stethoscope className="text-green-500" />
        Veterinarias en Cuenca
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        {vets.map((vet) => (
          <div key={vet.id} className="bg-gray-800 rounded-xl overflow-hidden">
            <img
              src={vet.image}
              alt={vet.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">{vet.name}</h3>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-300">
                  <MapPin size={18} />
                  <span>{vet.address}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Phone size={18} />
                  <span>{vet.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Clock size={18} />
                  <span>{vet.hours}</span>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="font-semibold mb-2">Servicios:</h4>
                <div className="flex flex-wrap gap-2">
                  {vet.services.map((service) => (
                    <span
                      key={service}
                      className="bg-gray-700 px-3 py-1 rounded-full text-sm"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex gap-4">
                <button
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-colors"
                  onClick={() => openInGoogleMaps(vet.address)}
                >
                  Ver en Google Maps
                </button>
                <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-colors">
                  Agendar Cita
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sección de Fundaciones de Animales */}
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <span className="text-blue-500">🐾</span>
        Fundaciones de Animales en Ecuador
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        {foundations.map((foundation) => (
          <div
            key={foundation.id}
            className="bg-gray-800 rounded-xl overflow-hidden"
          >
            <img
              src={foundation.image}
              alt={foundation.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">{foundation.name}</h3>
              <p className="text-gray-300 mb-4">{foundation.description}</p>

              <button
                onClick={() => window.open(foundation.donateLink, '_blank')}
                className="mt-6 w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 rounded-lg transition-colors"
              >
                ¡Donar Ahora!
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
