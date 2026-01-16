import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface PetRealTimeMapProps {
  pet: {
    id: number;
    name: string;
    type: string;
    image: string;
  };
  position: [number, number];
}

export function PetRealTimeMap({ pet, position }: PetRealTimeMapProps) {
  const createCustomIcon = (pet: any) => {
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          width: 40px; 
          height: 40px; 
          border-radius: 50%; 
          background-color: #007bff;
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

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-4">Seguimiento en Tiempo Real de {pet.name}</h3>
      </div>

      <div className="h-[500px] rounded-lg overflow-hidden">
        <MapContainer
          center={position}
          zoom={16}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position} icon={createCustomIcon(pet)}>
            <Popup>
              <div className="p-2 flex flex-col items-center bg-blue-100 border-blue-300 border-2 rounded-lg">
                <img
                  src={pet.image}
                  alt={pet.name}
                  className="w-24 h-24 object-cover rounded-full mb-2 border-2 border-white shadow-md"
                />
                <h3 className="font-bold text-lg text-blue-900">
                  {pet.name}
                </h3>
                <p className="text-sm text-blue-900">{pet.type}</p>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
}
