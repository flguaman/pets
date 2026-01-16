import React from 'react';
import { Pet } from '../types';
import { Phone, MapPin, AlertTriangle, User, Calendar, Stethoscope, FileText, QrCode, Shield } from 'lucide-react';

interface PetIdentificationProps {
  pet: Pet;
}

export function PetIdentification({ pet }: PetIdentificationProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 text-white p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header Card */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-2xl border border-green-500/20 mb-6">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <QrCode className="text-green-500" size={24} />
              <h1 className="text-2xl font-bold text-green-400">ID VIRTUAL MASCOTA</h1>
            </div>
            <div className="w-24 h-1 bg-gradient-to-r from-green-400 to-green-600 mx-auto rounded-full"></div>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="relative mb-6">
              <img
                src={pet.imageUrl}
                alt={pet.name}
                className="w-32 h-32 rounded-full border-4 border-green-500 object-cover shadow-lg"
              />
              <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2">
                <Shield size={16} className="text-white" />
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-center mb-2">{pet.name}</h2>
            <div className="flex items-center gap-2 text-green-400 mb-4">
              <span className="text-lg">{pet.type}</span>
              <span className="text-gray-400">•</span>
              <span className="text-lg">{pet.breed}</span>
            </div>
            
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Calendar size={16} />
              <span>{pet.age} años de edad</span>
            </div>
          </div>
        </div>

        {/* Emergency Contact Card */}
        <div className="bg-red-900/30 border-2 border-red-500 rounded-xl p-6 shadow-xl mb-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="text-red-400" size={24} />
            <h3 className="text-xl font-bold text-red-400">🚨 INFORMACIÓN DE EMERGENCIA</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-red-800/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="text-red-300" size={18} />
                <span className="text-red-300 font-medium">Dueño</span>
              </div>
              <p className="text-white font-bold text-lg">{pet.owner}</p>
            </div>
            
            <div className="bg-red-800/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Phone className="text-red-300" size={18} />
                <span className="text-red-300 font-medium">Teléfono</span>
              </div>
              <p className="text-white font-bold text-lg">{pet.phone}</p>
            </div>
          </div>
          
          <div className="mt-4 bg-red-800/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="text-red-300" size={18} />
              <span className="text-red-300 font-medium">Dirección</span>
            </div>
            <p className="text-white font-bold">{pet.address}</p>
          </div>
          
          <button
            onClick={() => window.location.href = `tel:${pet.phone}`}
            className="w-full mt-6 bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 text-lg"
          >
            <Phone size={20} />
            LLAMAR AL DUEÑO AHORA
          </button>
        </div>

        {/* Medical Information Card */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-xl border border-blue-500/20 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Stethoscope className="text-blue-400" size={24} />
            <h3 className="text-xl font-bold text-blue-400">Información Médica</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-gray-300 mb-2">Estado de Salud</h4>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                pet.status === 'healthy' ? 'bg-green-500/20 text-green-400' :
                pet.status === 'adoption' ? 'bg-blue-500/20 text-blue-400' :
                pet.status === 'lost' ? 'bg-orange-500/20 text-orange-400' :
                pet.status === 'stolen' ? 'bg-red-500/20 text-red-400' :
                'bg-yellow-500/20 text-yellow-400'
              }`}>
                {pet.status === 'healthy' ? '✅ Saludable' :
                 pet.status === 'adoption' ? '🏠 En adopción' :
                 pet.status === 'lost' ? '🔍 Perdido' :
                 pet.status === 'stolen' ? '🚨 Robado' :
                 '😵 Desorientado'}
              </span>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-gray-300 mb-2">Condiciones Médicas</h4>
              <p className="text-white">
                {pet.illness && pet.illness !== 'Ninguna' ? (
                  <span className="text-yellow-400 font-medium">⚠️ {pet.illness}</span>
                ) : (
                  <span className="text-green-400">✅ Sin condiciones conocidas</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Additional Information Card */}
        {pet.observations && (
          <div className="bg-gray-800 rounded-xl p-6 shadow-xl border border-purple-500/20 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="text-purple-400" size={24} />
              <h3 className="text-xl font-bold text-purple-400">Observaciones Adicionales</h3>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-gray-300 leading-relaxed">{pet.observations}</p>
            </div>
          </div>
        )}

        {/* Status Alert */}
        {pet.status === 'lost' && (
          <div className="bg-orange-900/50 border-2 border-orange-500 rounded-xl p-6 shadow-xl mb-6">
            <div className="flex items-center gap-2 text-orange-400 mb-4">
              <AlertTriangle size={24} />
              <h3 className="text-xl font-bold">🔍 ¡MASCOTA PERDIDA!</h3>
            </div>
            <div className="bg-orange-800/30 rounded-lg p-4">
              <p className="text-orange-200 font-medium">
                Si has encontrado esta mascota, por favor contacta INMEDIATAMENTE con su dueño. 
                Esta mascota está perdida y su familia la está buscando.
              </p>
            </div>
          </div>
        )}

        {pet.status === 'stolen' && (
          <div className="bg-red-900/50 border-2 border-red-500 rounded-xl p-6 shadow-xl mb-6">
            <div className="flex items-center gap-2 text-red-400 mb-4">
              <AlertTriangle size={24} />
              <h3 className="text-xl font-bold">🚨 ¡MASCOTA ROBADA!</h3>
            </div>
            <div className="bg-red-800/30 rounded-lg p-4">
              <p className="text-red-200 font-medium">
                Esta mascota ha sido reportada como ROBADA. Si la has encontrado, contacta 
                inmediatamente al dueño y considera notificar a las autoridades locales.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-xl border border-green-500/20 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <QrCode className="text-green-500" size={20} />
            <span className="text-green-400 font-medium">ID Virtual Mascotas.ec</span>
          </div>
          <p className="text-gray-400 text-sm">
            Sistema de identificación digital para mascotas
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Generado: {new Date().toLocaleDateString()} • ID: {pet.id}
          </p>
        </div>
      </div>
    </div>
  );
}