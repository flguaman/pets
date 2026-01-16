
import React, { useState, useEffect, useRef } from 'react';
import { PetRealTimeMap } from './PetRealTimeMap';
import { simulatePetMovement } from '../utils/petLocationSimulator';

interface Pet {
  id: number;
  name: string;
  type: string;
  image: string;
  initialPosition: [number, number];
}

interface RealTimeTrackingProps {
  pet: Pet;
}

// Simulación de otras mascotas en la patrulla canina
const otherPets: Pet[] = [
  {
    id: 2,
    name: 'Rocky',
    type: 'Perro',
    image: 'https://ui-avatars.com/api/?name=Rocky&background=10b981&color=fff',
    initialPosition: [-2.8976, -79.0047],
  },
  {
    id: 3,
    name: 'Skye',
    type: 'Perro',
    image: 'https://ui-avatars.com/api/?name=Skye&background=10b981&color=fff',
    initialPosition: [-2.8972, -79.0042],
  },
];

export function RealTimeTracking({ pet }: RealTimeTrackingProps) {

  const [position, setPosition] = useState<[number, number]>(pet.initialPosition);
  const [isSimulating, setIsSimulating] = useState(false);
  const [gpsConnected, setGpsConnected] = useState(true);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [history, setHistory] = useState<[number, number][]>([pet.initialPosition]);
  const [patrolPositions, setPatrolPositions] = useState<{ [id: number]: [number, number] }>({
    [pet.id]: pet.initialPosition,
    ...Object.fromEntries(otherPets.map(p => [p.id, p.initialPosition]))
  });
  const [battery, setBattery] = useState(100);
  const [showShare, setShowShare] = useState(false);
  const [showFind, setShowFind] = useState(false);
  const [safeZone, setSafeZone] = useState<[number, number, number]>([pet.initialPosition[0], pet.initialPosition[1], 0.002]); // [lat, lng, radio]
  const [weather, setWeather] = useState({ temp: 22, condition: 'Soleado' });
  const [events, setEvents] = useState<string[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const simulator = simulatePetMovement(pet.initialPosition);
  const patrolSimulators = otherPets.map(p => simulatePetMovement(p.initialPosition));

  // Simulación de movimiento, conexión GPS, batería y clima
  useEffect(() => {
    if (isSimulating) {
      intervalRef.current = setInterval(() => {
        // Mascota principal
        const newPosArr = simulator.move();
        const newPos: [number, number] = [newPosArr[0], newPosArr[1]];
        setPosition(newPos);
        setHistory(h => [...h, newPos].slice(-10));
        setPatrolPositions(prev => ({
          ...prev,
          [pet.id]: newPos,
        }));
        // Patrulla canina
        otherPets.forEach((p, idx) => {
          const posArr = patrolSimulators[idx].move();
          const pos: [number, number] = [posArr[0], posArr[1]];
          setPatrolPositions(prev => ({
            ...prev,
            [p.id]: pos,
          }));
        });
        // Simular desconexión GPS aleatoria
        if (Math.random() < 0.05) setGpsConnected(false);
        else setGpsConnected(true);
        // Simular alerta si sale de zona segura
        const dist = Math.sqrt(Math.pow(newPos[0] - safeZone[0], 2) + Math.pow(newPos[1] - safeZone[1], 2));
        if (dist > safeZone[2]) {
          setAlerts(a => [...a, `¡Alerta! ${pet.name} salió de la zona segura.`].slice(-3));
          setEvents(e => [...e, `${pet.name} salió de la zona segura (${new Date().toLocaleTimeString()})`].slice(-10));
        }
        // Simular batería
        setBattery(b => Math.max(0, b - Math.random() * 2));
        if (battery < 20) {
          setAlerts(a => [...a, `¡Batería baja en el collar GPS!`].slice(-3));
        }
        // Simular clima
        if (Math.random() < 0.1) {
          const conditions = ['Soleado', 'Nublado', 'Lluvia', 'Tormenta', 'Viento'];
          setWeather({ temp: Math.round(18 + Math.random() * 10), condition: conditions[Math.floor(Math.random() * conditions.length)] });
        }
      }, 2000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isSimulating, simulator, patrolSimulators, pet, safeZone, battery]);

  // Llamar patrulla (simulado)
  const handleCallPatrol = () => {
    setAlerts(a => [...a, 'Patrulla Canina ha sido llamada y está en camino.'].slice(-3));
    setEvents(e => [...e, `Patrulla Canina llamada (${new Date().toLocaleTimeString()})`].slice(-10));
  };

  // Compartir ubicación (simulado)
  const handleShareLocation = () => {
    setShowShare(true);
    setEvents(e => [...e, `Ubicación compartida (${new Date().toLocaleTimeString()})`].slice(-10));
    setTimeout(() => setShowShare(false), 4000);
  };

  // Buscar mascota (simulado)
  const handleFindPet = () => {
    setShowFind(true);
    setEvents(e => [...e, `Función de búsqueda activada (${new Date().toLocaleTimeString()})`].slice(-10));
    setTimeout(() => setShowFind(false), 4000);
  };

  // Cambiar zona segura (simulado)
  const handleSafeZoneChange = () => {
    setSafeZone([position[0], position[1], 0.002]);
    setEvents(e => [...e, `Zona segura actualizada (${new Date().toLocaleTimeString()})`].slice(-10));
  };

  return (
    <div className="space-y-6">
      {/* Estado de conexión GPS y batería */}
      <div className={`flex items-center gap-4 p-2 rounded-lg ${gpsConnected ? 'bg-green-900/30 border border-green-500' : 'bg-red-900/30 border border-red-500'}`}>
        <span className={`font-bold ${gpsConnected ? 'text-green-400' : 'text-red-400'}`}>{gpsConnected ? 'GPS conectado' : 'GPS desconectado'}</span>
        <span className="text-xs">(Collar de {pet.name})</span>
        <div className="flex items-center gap-2">
          <span className="text-xs">Batería GPS:</span>
          <div className="w-20 h-3 bg-gray-700 rounded-full overflow-hidden">
            <div className={`h-3 rounded-full ${battery > 20 ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${battery}%` }}></div>
          </div>
          <span className="text-xs">{Math.round(battery)}%</span>
        </div>
      </div>

      {/* Clima simulado */}
      <div className="flex items-center gap-2 p-2 bg-blue-900/30 rounded-lg">
        <span className="font-bold text-blue-300">Clima actual:</span>
        <span className="text-xs text-blue-200">{weather.condition}, {weather.temp}°C</span>
      </div>

      {/* Mapa en tiempo real */}
      <PetRealTimeMap pet={pet} position={position} />

      {/* Panel de patrulla canina */}
      <div className="bg-gray-800 rounded-xl p-4">
        <h3 className="font-bold text-lg mb-2">Patrulla Canina</h3>
        <div className="flex gap-4">
          {[pet, ...otherPets].map(p => (
            <div key={p.id} className="flex flex-col items-center">
              <img src={p.image} alt={p.name} className="w-12 h-12 rounded-full border-2 border-green-500 mb-1" />
              <span className="font-medium text-green-300">{p.name}</span>
              <span className="text-xs text-gray-400">{p.type}</span>
              <span className="text-xs text-gray-400">Lat: {patrolPositions[p.id][0].toFixed(4)}</span>
              <span className="text-xs text-gray-400">Lng: {patrolPositions[p.id][1].toFixed(4)}</span>
            </div>
          ))}
        </div>
        <button onClick={handleCallPatrol} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg">Llamar Patrulla</button>
      </div>

      {/* Historial de ubicaciones */}
      <div className="bg-gray-800 rounded-xl p-4">
        <h3 className="font-bold text-lg mb-2">Historial de Ubicación</h3>
        <ul className="text-xs text-gray-300">
          {history.map((pos, idx) => (
            <li key={idx}>Lat: {pos[0].toFixed(4)}, Lng: {pos[1].toFixed(4)}</li>
          ))}
        </ul>
      </div>

      {/* Panel de eventos */}
      <div className="bg-gray-800 rounded-xl p-4">
        <h3 className="font-bold text-lg mb-2">Eventos recientes</h3>
        <ul className="text-xs text-gray-300">
          {events.map((ev, idx) => (
            <li key={idx}>{ev}</li>
          ))}
        </ul>
      </div>

      {/* Alertas */}
      {alerts.length > 0 && (
        <div className="bg-red-900/30 border border-red-500 rounded-xl p-4">
          <h3 className="font-bold text-lg mb-2 text-red-400">Alertas</h3>
          <ul className="text-xs text-red-300">
            {alerts.map((a, idx) => (
              <li key={idx}>{a}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Controles de simulación y servicios extra */}
      <div className="mt-4 flex flex-wrap gap-4">
        <button
          onClick={() => setIsSimulating(true)}
          disabled={isSimulating}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg disabled:bg-gray-400"
        >
          Iniciar Simulación
        </button>
        <button
          onClick={() => setIsSimulating(false)}
          disabled={!isSimulating}
          className="bg-red-500 text-white px-4 py-2 rounded-lg disabled:bg-gray-400"
        >
          Detener Simulación
        </button>
        <button
          onClick={handleShareLocation}
          className="bg-green-600 text-white px-4 py-2 rounded-lg"
        >
          Compartir ubicación
        </button>
        <button
          onClick={handleFindPet}
          className="bg-yellow-600 text-white px-4 py-2 rounded-lg"
        >
          Buscar mascota
        </button>
        <button
          onClick={handleSafeZoneChange}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg"
        >
          Definir zona segura aquí
        </button>
      </div>

      {/* Mensajes de servicios extra */}
      {showShare && (
        <div className="mt-4 p-3 bg-green-900/30 rounded-lg text-green-300 text-center">
          ¡Ubicación compartida! (Simulado: https://mascotas.ec/track/{pet.id})
        </div>
      )}
      {showFind && (
        <div className="mt-4 p-3 bg-yellow-900/30 rounded-lg text-yellow-300 text-center">
          ¡Función de búsqueda activada! (Simulado: collar emite sonido/luz)
        </div>
      )}
    </div>
  );
}
