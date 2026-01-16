import React, { useState } from 'react';
import {
  PawPrint,
  Heart,
  Bone,
  Dumbbell,
  MessageSquare,
} from 'lucide-react';

export function PetCareAssistant() {
  const [activeSection, setActiveSection] = useState<'general' | 'health' | 'nutrition' | 'training' | null>(null);

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'general':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Consejos Generales de Cuidado</h3>
            <p className="text-gray-300">
              Mantén a tu mascota hidratada, asegúrate de que tenga un lugar cómodo para descansar y bríndale mucho amor y atención.
              El cepillado regular ayuda a mantener su pelaje sano y reduce la caída del pelo.
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
              Obtener más consejos generales
            </button>
          </div>
        );
      case 'health':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Problemas de Salud Comunes</h3>
            <p className="text-gray-300">
              Presta atención a cambios en el apetito, letargo, vómitos o diarrea. Estos pueden ser signos de problemas de salud.
              Las visitas regulares al veterinario son cruciales para la detección temprana y la prevención de enfermedades.
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
              Consultar sobre problemas de salud
            </button>
          </div>
        );
      case 'nutrition':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Consejos de Nutrición</h3>
            <p className="text-gray-300">
              Una dieta equilibrada es fundamental para la salud de tu mascota. Consulta a tu veterinario para elegir el alimento adecuado según su edad, raza y nivel de actividad.
              Evita darle alimentos para humanos que puedan ser tóxicos para ellos.
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
              Obtener plan de nutrición
            </button>
          </div>
        );
      case 'training':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Consejos de Entrenamiento</h3>
            <p className="text-gray-300">
              El entrenamiento positivo refuerza el buen comportamiento. Sé paciente y consistente.
              Las sesiones cortas y divertidas son más efectivas para mantener a tu mascota comprometida.
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
              Obtener guías de entrenamiento
            </button>
          </div>
        );
      default:
        return (
          <p className="text-gray-300">Selecciona una opción para obtener consejos de cuidado de mascotas.</p>
        );
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h2 className="text-2xl font-bold mb-4">Asistente de Cuidado de Mascotas</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <button
          onClick={() => setActiveSection('general')}
          className={`flex flex-col items-center p-4 rounded-lg transition-colors ${
            activeSection === 'general' ? 'bg-green-600 text-white' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          <PawPrint size={24} className="mb-2" />
          <span className="text-sm font-medium">General</span>
        </button>
        <button
          onClick={() => setActiveSection('health')}
          className={`flex flex-col items-center p-4 rounded-lg transition-colors ${
            activeSection === 'health' ? 'bg-green-600 text-white' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          <Heart size={24} className="mb-2" />
          <span className="text-sm font-medium">Salud</span>
        </button>
        <button
          onClick={() => setActiveSection('nutrition')}
          className={`flex flex-col items-center p-4 rounded-lg transition-colors ${
            activeSection === 'nutrition' ? 'bg-green-600 text-white' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          <Bone size={24} className="mb-2" />
          <span className="text-sm font-medium">Nutrición</span>
        </button>
        <button
          onClick={() => setActiveSection('training')}
          className={`flex flex-col items-center p-4 rounded-lg transition-colors ${
            activeSection === 'training' ? 'bg-green-600 text-white' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          <Dumbbell size={24} className="mb-2" />
          <span className="text-sm font-medium">Entrenamiento</span>
        </button>
      </div>

      <div className="mt-6 p-4 bg-gray-700 rounded-lg">
        {renderSectionContent()}
      </div>
    </div>
  );
}