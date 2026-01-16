import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Member {
    id: number;
    name: string;
    role: string;
    location: [number, number];
}

const initialMembers: Member[] = [
    { id: 1, name: 'Chase', role: 'Líder', location: [-2.8974, -79.0045] },
    { id: 2, name: 'Marshall', role: 'Bombero', location: [-2.8976, -79.0047] },
    { id: 3, name: 'Skye', role: 'Piloto', location: [-2.8972, -79.0042] },
];

export function PatrullaCanina() {
    const [members, setMembers] = useState<Member[]>(initialMembers);
    const [messages, setMessages] = useState<string[]>([]);
    const [input, setInput] = useState('');
    const [alerts, setAlerts] = useState<string[]>([]);
    const [isRequested, setIsRequested] = useState(false);
    const [patrolLocation, setPatrolLocation] = useState<[number, number]>([-2.8974, -79.0045]);
    const [locationHistory, setLocationHistory] = useState<[number, number][]>([[-2.8974, -79.0045]]);
    const [available, setAvailable] = useState(true);
    const [proximityAlert, setProximityAlert] = useState<string | null>(null);

    // Simular movimiento de la patrulla
    useEffect(() => {
        const interval = setInterval(() => {
            setPatrolLocation(([lat, lng]) => {
                const newLoc: [number, number] = [lat + (Math.random() - 0.5) * 0.0002, lng + (Math.random() - 0.5) * 0.0002];
                setLocationHistory(h => [...h, newLoc].slice(-20));
                // Simular alerta de proximidad
                if (Math.abs(newLoc[0] + 2.8974) < 0.0003 && Math.abs(newLoc[1] + 79.0045) < 0.0003) {
                    setProximityAlert('¡La patrulla está cerca de tu ubicación!');
                    setTimeout(() => setProximityAlert(null), 4000);
                }
                return newLoc;
            });
            setMembers(members => members.map(m => ({ ...m, location: [m.location[0] + (Math.random() - 0.5) * 0.0002, m.location[1] + (Math.random() - 0.5) * 0.0002] })));
            // Simular disponibilidad
            setAvailable(Math.random() > 0.1);
        }, 3000);
        return () => clearInterval(interval);
    }, []);
    // Icono personalizado para la patrulla
    const patrolIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="width:32px;height:32px;background:#2563eb;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid white;"><span style='color:white;font-weight:bold;'>PC</span></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
    });

    // Solicitar patrulla
    const handleRequestPatrol = () => {
        setIsRequested(true);
        setAlerts(a => [...a, '¡Patrulla Canina solicitada! En camino a tu ubicación.'].slice(-3));
        setTimeout(() => setIsRequested(false), 6000);
    };

    // Enviar mensaje
    const handleSendMessage = () => {
        if (input.trim()) {
            setMessages(msgs => [...msgs, `Tú: ${input}`].slice(-10));
            setAlerts(a => [...a, 'Mensaje enviado a la patrulla.'].slice(-3));
            setInput('');
        }
    };

    // Simular respuesta de la patrulla
    useEffect(() => {
        if (messages.length > 0) {
            const lastMsg = messages[messages.length - 1];
            if (lastMsg.startsWith('Tú:')) {
                setTimeout(() => {
                    setMessages(msgs => [...msgs, 'Patrulla: ¡Recibido! Estamos en camino.'].slice(-10));
                }, 2000);
            }
        }
    }, [messages]);

    return (
        <div className="space-y-6">
            <div className="bg-blue-900/30 rounded-xl p-4">
                <h2 className="font-bold text-xl mb-2 text-blue-300">Patrulla Canina</h2>
                <div className="mb-2 text-sm text-blue-200">Ubicación actual: Lat {patrolLocation[0].toFixed(4)}, Lng {patrolLocation[1].toFixed(4)}</div>
                <div className="mb-2 text-sm">
                    Estado: {available ? <span className="text-green-400">Disponible</span> : <span className="text-red-400">Ocupada</span>}
                </div>
                <button onClick={handleRequestPatrol} className="bg-blue-600 text-white px-4 py-2 rounded-lg mb-2">Solicitar patrulla</button>
                {isRequested && <div className="text-green-400">¡La patrulla está en camino!</div>}
                {proximityAlert && <div className="text-yellow-400 font-bold mt-2">{proximityAlert}</div>}
                {/* Mapa de ubicación en tiempo real */}
                <div className="mt-4 h-64 rounded-lg overflow-hidden">
                    <MapContainer center={patrolLocation} zoom={17} style={{ height: '100%', width: '100%' }}>
                        <TileLayer
                            attribution='© OpenStreetMap contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={patrolLocation} icon={patrolIcon}>
                            <Popup>
                                <div className="font-bold text-blue-700">Patrulla Canina</div>
                                <div>Lat: {patrolLocation[0].toFixed(4)}</div>
                                <div>Lng: {patrolLocation[1].toFixed(4)}</div>
                            </Popup>
                        </Marker>
                        {/* Miembros */}
                        {members.map(m => (
                            <Marker key={m.id} position={m.location}>
                                <Popup>
                                    <div className="font-bold text-blue-700">{m.name}</div>
                                    <div>{m.role}</div>
                                    <div>Lat: {m.location[0].toFixed(4)}</div>
                                    <div>Lng: {m.location[1].toFixed(4)}</div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-4">
                <h3 className="font-bold text-lg mb-2">Miembros de la patrulla</h3>
                <div className="flex gap-4">
                    {members.map(m => (
                        <div key={m.id} className="flex flex-col items-center">
                            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold mb-1">{m.name[0]}</div>
                            <span className="font-medium text-blue-300">{m.name}</span>
                            <span className="text-xs text-gray-400">{m.role}</span>
                            <span className="text-xs text-gray-400">Lat: {m.location[0].toFixed(4)}</span>
                            <span className="text-xs text-gray-400">Lng: {m.location[1].toFixed(4)}</span>
                        </div>
                    ))}
                </div>
                {/* Historial de ubicaciones */}
                <div className="mt-4">
                    <h4 className="font-bold text-sm mb-2">Historial de ubicaciones recientes</h4>
                    <ul className="text-xs text-gray-300 max-h-24 overflow-y-auto">
                        {locationHistory.map((loc, idx) => (
                            <li key={idx}>Lat: {loc[0].toFixed(4)}, Lng: {loc[1].toFixed(4)}</li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-4">
                <h3 className="font-bold text-lg mb-2">Enviar mensaje/denuncia/auxilio</h3>
                <div className="flex gap-2 mb-2">
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-lg bg-gray-700 text-white border border-gray-600"
                        placeholder="Escribe tu mensaje..."
                    />
                    <button onClick={handleSendMessage} className="bg-green-600 text-white px-4 py-2 rounded-lg">Enviar</button>
                </div>
                <div className="bg-gray-900 rounded-lg p-2 text-xs text-gray-200 h-24 overflow-y-auto">
                    {messages.map((msg, idx) => <div key={idx}>{msg}</div>)}
                </div>
                {/* Botón para enviar ubicación de emergencia */}
                <button
                    onClick={() => setAlerts(a => [...a, '¡Ubicación de emergencia enviada a la patrulla!'].slice(-5))}
                    className="mt-2 bg-red-600 text-white px-4 py-2 rounded-lg"
                >
                    Enviar ubicación de emergencia
                </button>
            </div>

            {alerts.length > 0 && (
                <div className="bg-yellow-900/30 border border-yellow-500 rounded-xl p-4">
                    <h3 className="font-bold text-lg mb-2 text-yellow-400">Notificaciones</h3>
                    <ul className="text-xs text-yellow-300">
                        {alerts.map((a, idx) => (
                            <li key={idx}>{a}</li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="bg-gray-800 rounded-xl p-4">
                <h3 className="font-bold text-lg mb-2">Historial de intervenciones</h3>
                <ul className="text-xs text-gray-300">
                    <li>28/08/2025 - Auxilio en parque central</li>
                    <li>27/08/2025 - Denuncia atendida en Av. Principal</li>
                    <li>26/08/2025 - Información sobre mascota perdida</li>
                </ul>
            </div>
        </div>
    );
}
