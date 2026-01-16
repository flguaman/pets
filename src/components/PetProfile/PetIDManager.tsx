import React, { useState, useEffect } from 'react';
import { Pet } from '../../types';
import { 
  QrCode, 
  Calendar, 
  MapPin, 
  Phone, 
  User, 
  Stethoscope, 
  Clipboard, 
  Share2,
  Download,
  Printer,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Shield,
  Eye,
  Grid,
  List,
  Search,
  Filter
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { PetService } from '../../services/petService';
import { LoadingSpinner } from '../Database/LoadingSpinner';
import { ErrorMessage } from '../Database/ErrorMessage';
import { useSettingsStore } from '../../store/settingsStore';
import { useAuthStore } from '../../store/authStore';
import { usePetStore } from '../../store/petStore';
import { QRGenerator } from '../Database/QRGenerator';
import { formatPetId } from '../../utils/digitalIdGenerator';

interface PetIDManagerProps {
  pets: Pet[];
  selectedPetId: string | null;
  onSelectPet: (petId: string) => void;
  onEdit?: () => void;
}

export function PetIDManager({ pets, selectedPetId, onSelectPet, onEdit }: PetIDManagerProps) {
  const { deviceMode } = useSettingsStore();
  const { user } = useAuthStore();
  const { loadPets } = usePetStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedPetForQR, setSelectedPetForQR] = useState<Pet | null>(null);
  
  const isAdmin = user?.role === 'admin';

  // Recargar mascotas cuando el componente se monta o cuando cambian las mascotas
  useEffect(() => {
    loadPets(true); // forceRefresh = true
  }, [loadPets]);

  // Log para debugging
  useEffect(() => {
    console.log('PetIDManager - Pets loaded:', {
      total: pets.length,
      withDigitalId: pets.filter(p => p.digitalId).length,
      pets: pets.map(p => ({ name: p.name, digitalId: p.digitalId, id: p.id }))
    });
  }, [pets]);

  // Sample Pet Data (for demonstration purposes)
  const SAMPLE_PET: Pet = {
    id: 'example-pet-id-12345',
    name: 'Max',
    owner: 'Ana García',
    phone: '+593991234567',
    address: 'Av. Principal 123, Cuenca, Ecuador',
    type: 'Perro',
    breed: 'Golden Retriever',
    age: 3,
    illness: 'Ninguna',
    observations: 'Amigable, le encanta jugar con la pelota. Vacunas al día.',
    allergies: 'Polen',
    fears: 'Ruidos fuertes',
    favoriteToys: 'Pelota de tenis, frisbee',
    imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    status: 'healthy',
  };

  // Filter pets based on search and status
  const filteredPets = pets.filter(pet => {
    const matchesSearch = !searchTerm || 
      pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || pet.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Add sample pet if no search term and no specific filter is applied
  const petsToDisplay = (searchTerm === '' && filterStatus === 'all') 
    ? [SAMPLE_PET, ...filteredPets] 
    : filteredPets;

  // Generate QR data for a pet
  const generateQRData = (pet: Pet) => {
    return JSON.stringify({
      id: pet.id,
      digitalId: pet.digitalId || pet.id,
      name: pet.name,
      owner: pet.owner,
      phone: pet.phone,
      address: pet.address,
      type: pet.type,
      breed: pet.breed,
      age: pet.age,
      illness: pet.illness,
      observations: pet.observations,
      allergies: pet.allergies,
      fears: pet.fears,
      favoriteToys: pet.favoriteToys,
      status: pet.status,
      url: `${window.location.origin}/pet/${pet.id}`,
      emergency: {
        contact: pet.phone,
        owner: pet.owner,
        address: pet.address
      },
      timestamp: Date.now()
    });
  };

  const handleDownloadQR = (pet: Pet) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    const qrData = generateQRData(pet);
    
    // Create QR code using a library or generate SVG
    const qrSize = 200;
    canvas.width = qrSize + 100;
    canvas.height = qrSize + 150;
    
    // White background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add pet information
    ctx.fillStyle = 'black';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(pet.name, canvas.width / 2, qrSize + 80);
    
    ctx.font = '12px Arial';
    ctx.fillText(`${pet.type} • ${pet.breed}`, canvas.width / 2, qrSize + 100);
    ctx.fillText(`ID: ${pet.digitalId || formatPetId(pet.id)}`, canvas.width / 2, qrSize + 120);
    
    // Download
    const link = document.createElement('a');
    link.download = `${pet.name}-id-virtual.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const handlePrintID = (pet: Pet) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const qrData = generateQRData(pet);
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>ID Virtual - ${pet.name}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 20px;
              margin: 0;
            }
            .id-card { 
              display: inline-block; 
              border: 3px solid #10b981; 
              padding: 30px; 
              margin: 20px;
              background: white;
              border-radius: 15px;
              box-shadow: 0 4px 8px rgba(0,0,0,0.1);
              max-width: 400px;
            }
            .header {
              color: #10b981;
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .pet-name {
              font-size: 20px;
              font-weight: bold;
              margin: 15px 0 5px 0;
              color: #333;
            }
            .pet-info {
              margin: 10px 0;
              font-size: 14px;
              color: #555;
              line-height: 1.4;
            }
            .emergency {
              background: #fee2e2;
              border: 2px solid #ef4444;
              border-radius: 8px;
              padding: 10px;
              margin: 15px 0;
            }
            .emergency-title {
              color: #dc2626;
              font-weight: bold;
              font-size: 14px;
            }
            @media print {
              body { margin: 0; }
              .id-card { 
                page-break-inside: avoid;
                box-shadow: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="id-card">
            <div class="header">🐾 ID VIRTUAL MASCOTA</div>
            
            <div style="margin: 20px 0;">
              <div id="qr-container"></div>
            </div>
            
            <div class="pet-name">${pet.name}</div>
            <div class="pet-info">
              <strong>Tipo:</strong> ${pet.type} - ${pet.breed}<br>
              <strong>Edad:</strong> ${pet.age} años<br>
              <strong>ID Digital:</strong> ${pet.digitalId || pet.id}
            </div>
            
            <div class="emergency">
              <div class="emergency-title">🚨 INFORMACIÓN DE EMERGENCIA</div>
              <div style="margin-top: 5px; font-size: 12px;">
                <strong>Dueño:</strong> ${pet.owner}<br>
                <strong>Teléfono:</strong> ${pet.phone}<br>
                <strong>Dirección:</strong> ${pet.address}
              </div>
            </div>
            
            ${pet.illness ? `
              <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 5px; padding: 8px; margin: 10px 0;">
                <strong style="color: #d97706;">Condición Médica:</strong><br>
                <span style="font-size: 12px;">${pet.illness}</span>
              </div>
            ` : ''}
          </div>
          
          <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
          <script>
            QRCode.toCanvas(document.createElement('canvas'), '${qrData}', {
              width: 150,
              margin: 2
            }, function (error, canvas) {
              if (error) console.error(error);
              document.getElementById('qr-container').appendChild(canvas);
              setTimeout(() => {
                window.print();
                window.close();
              }, 500);
            });
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={() => setError(null)} />;
  }

  // Show QR Generator when a pet is selected for QR generation
  if (selectedPetForQR) {
    return <QRGenerator pet={selectedPetForQR} onClose={() => setSelectedPetForQR(null)} />;
  }

  return (
    <div className="bg-gray-800 rounded-xl p-4 sm:p-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className={`font-bold flex items-center gap-2 ${
            deviceMode === 'mobile' ? 'text-lg sm:text-xl' : 'text-2xl'
          }`}>
            <QrCode className="text-green-500" size={deviceMode === 'mobile' ? 20 : 24} />
            {isAdmin ? 'Gestión de IDs Virtuales' : 'Perfil de Mascotas'}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {isAdmin 
              ? 'Genera y gestiona códigos QR para identificación de mascotas'
              : 'Información de tus mascotas registradas'
            }
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">
            {filteredPets.length} de {pets.length} mascotas
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, dueño o tipo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white text-sm"
          />
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <Filter size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-8 py-2 text-white text-sm appearance-none"
            >
              <option value="all">Todos los estados</option>
              <option value="healthy">Saludables</option>
              <option value="adoption">En adopción</option>
              <option value="lost">Perdidas</option>
              <option value="stolen">Robadas</option>
            </select>
          </div>
          
          <div className="flex bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded ${viewMode === 'grid' ? 'bg-green-600' : 'hover:bg-gray-600'}`}
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1 rounded ${viewMode === 'list' ? 'bg-green-600' : 'hover:bg-gray-600'}`}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {petsToDisplay.length === 0 ? (
        <div className="text-center py-12">
          <QrCode size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {searchTerm || filterStatus !== 'all' 
              ? 'No se encontraron mascotas' 
              : 'No hay mascotas registradas'
            }
          </h3>
          <p className="text-gray-400">
            {searchTerm || filterStatus !== 'all'
              ? 'Intenta cambiar los filtros de búsqueda'
              : 'Agrega mascotas para generar sus IDs virtuales'
            }
          </p>
        </div>
      ) : (
        /* Pet Cards */
        <div className={`grid gap-4 ${
          viewMode === 'grid' 
            ? deviceMode === 'mobile' 
              ? 'grid-cols-1 sm:grid-cols-2' 
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            : 'grid-cols-1'
        }`}>
          {petsToDisplay.map((pet) => (
            <PetIDCard
              key={pet.id}
              pet={pet}
              viewMode={viewMode}
              isAdmin={isAdmin}
              onGenerateQR={() => setSelectedPetForQR(pet)}
              onDownloadQR={() => handleDownloadQR(pet)}
              onPrintID={() => handlePrintID(pet)}
              deviceMode={deviceMode}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface PetIDCardProps {
  pet: Pet;
  viewMode: 'grid' | 'list';
  isAdmin: boolean;
  onGenerateQR: () => void;
  onDownloadQR: () => void;
  onPrintID: () => void;
  deviceMode: string;
}

function PetIDCard({ pet, viewMode, isAdmin, onGenerateQR, onDownloadQR, onPrintID, deviceMode }: PetIDCardProps) {
  const [showQR, setShowQR] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const generateQRData = () => {
    return JSON.stringify({
      id: pet.id,
      digitalId: pet.digitalId || pet.id,
      name: pet.name,
      owner: pet.owner,
      phone: pet.phone,
      address: pet.address,
      type: pet.type,
      breed: pet.breed,
      age: pet.age,
      illness: pet.illness,
      observations: pet.observations,
      allergies: pet.allergies,
      fears: pet.fears,
      favoriteToys: pet.favoriteToys,
      status: pet.status,
      url: `${window.location.origin}/pet/${pet.id}`,
      emergency: {
        contact: pet.phone,
        owner: pet.owner,
        address: pet.address
      },
      timestamp: Date.now()
    });
  };

  return (
    <div className={`bg-gray-700 rounded-lg overflow-hidden ${
      viewMode === 'list' ? 'flex gap-4 p-4' : 'p-4'
    }`}>
      {/* Pet Image */}
      <div className={viewMode === 'list' ? 'flex-shrink-0' : 'mb-4'}>
        <img
          src={pet.imageUrl}
          alt={pet.name}
          className={`object-cover rounded-lg ${
            viewMode === 'list' 
              ? 'w-20 h-20' 
              : 'w-full h-32 sm:h-40'
          }`}
        />
      </div>

      {/* Pet Info */}
      <div className="flex-1">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className={`font-bold ${
              deviceMode === 'mobile' ? 'text-sm sm:text-base' : 'text-lg'
            }`}>
              {pet.name}
            </h3>
            <p className="text-gray-400 text-sm">{pet.type} • {pet.breed}</p>
            <p className="text-gray-500 text-xs">
              ID: {pet.digitalId ? (
                <span className="text-green-400 font-mono font-semibold">{pet.digitalId}</span>
              ) : (
                formatPetId(pet.id)
              )}
            </p>
          </div>
          
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            pet.status === 'healthy' ? 'bg-green-500/20 text-green-400' :
            pet.status === 'adoption' ? 'bg-blue-500/20 text-blue-400' :
            pet.status === 'lost' ? 'bg-orange-500/20 text-orange-400' :
            pet.status === 'stolen' ? 'bg-red-500/20 text-red-400' :
            'bg-yellow-500/20 text-yellow-400'
          }`}>
            {pet.status === 'healthy' ? 'Saludable' :
             pet.status === 'adoption' ? 'Adopción' :
             pet.status === 'lost' ? 'Perdido' :
             pet.status === 'stolen' ? 'Robado' :
             'Desorientado'}
          </span>
        </div>

        {/* Basic Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <User size={14} />
            <span>{pet.owner}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Phone size={14} />
            <span>{pet.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Calendar size={14} />
            <span>{pet.age} años</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <MapPin size={14} />
            <span>{pet.address}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs transition-colors"
          >
            <Eye size={12} />
            {showDetails ? 'Ocultar' : 'Ver más'}
          </button>
          
          {isAdmin && (
            <>
              <button
                onClick={onGenerateQR}
                className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-xs transition-colors"
              >
                <QrCode size={12} />
                Generar QR
              </button>
              
              <button
                onClick={() => setShowQR(!showQR)}
                className="flex items-center gap-1 px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-xs transition-colors"
              >
                <QrCode size={12} />
                {showQR ? 'Ocultar' : 'Vista QR'}
              </button>
              
              <button
                onClick={onPrintID}
                className="flex items-center gap-1 px-3 py-1 bg-orange-600 hover:bg-orange-700 rounded text-xs transition-colors"
              >
                <Printer size={12} />
                Imprimir ID
              </button>
            </>
          )}
        </div>

        {/* Extended Details */}
        {showDetails && (
          <div className="mt-4 pt-4 border-t border-gray-600 space-y-2">
            {pet.illness && (
              <div className="flex items-center gap-2 text-sm text-yellow-400">
                <Stethoscope size={14} />
                <span>{pet.illness}</span>
              </div>
            )}
            {pet.allergies && (
              <div className="flex items-center gap-2 text-sm text-red-400">
                <AlertTriangle size={14} />
                <span>Alergias: {pet.allergies}</span>
              </div>
            )}
            {pet.fears && (
              <div className="flex items-center gap-2 text-sm text-purple-400">
                <Shield size={14} />
                <span>Miedos: {pet.fears}</span>
              </div>
            )}
            {pet.favoriteToys && (
              <div className="flex items-center gap-2 text-sm text-pink-400">
                <Clipboard size={14} /> {/* Consider a more fitting icon if available */}
                <span>Juguetes Favoritos: {pet.favoriteToys}</span>
              </div>
            )}
            {pet.observations && (
              <div className="flex items-start gap-2 text-sm text-gray-300">
                <Clipboard size={14} className="mt-0.5" />
                <span>{pet.observations}</span>
              </div>
            )}
          </div>
        )}

        {/* QR Code Preview */}
        {showQR && isAdmin && (
          <div className="mt-4 pt-4 border-t border-gray-600">
            <div className="bg-white p-4 rounded-lg inline-block">
              <QRCodeSVG
                value={generateQRData()}
                size={120}
                level="H"
                includeMargin
              />
            </div>
            <div className="mt-2 flex gap-2">
              <button
                onClick={onDownloadQR}
                className="flex items-center gap-1 px-2 py-1 bg-gray-600 hover:bg-gray-500 rounded text-xs transition-colors"
              >
                <Download size={12} />
                Descargar
              </button>
              <button
                onClick={() => {
                  const qrData = generateQRData();
                  navigator.clipboard.writeText(qrData);
                }}
                className="flex items-center gap-1 px-2 py-1 bg-gray-600 hover:bg-gray-500 rounded text-xs transition-colors"
              >
                <Share2 size={12} />
                Copiar datos
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}