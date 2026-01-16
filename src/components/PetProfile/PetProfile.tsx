import React, { useState, useEffect } from 'react';
import { Pet } from '../../types';
import { 
  Heart, 
  Calendar, 
  MapPin, 
  Phone, 
  User, 
  Stethoscope, 
  Clipboard, 
  Camera,
  Share2,
  Edit,
  QrCode,
  Medal,
  Syringe,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Download,
  Printer
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useTranslation } from 'react-i18next';
import { PetService } from '../../services/petService';
import { LoadingSpinner } from '../Database/LoadingSpinner';
import { ErrorMessage } from '../Database/ErrorMessage';
import { useSettingsStore } from '../../store/settingsStore';
import { useAuthStore } from '../../store/authStore';

interface PetProfileProps {
  pets: Pet[];
  selectedPetId: string | null;
  onSelectPet: (petId: string) => void;
  onEdit?: () => void;
}

export function PetProfile({ pets, selectedPetId, onSelectPet, onEdit }: PetProfileProps) {
  const { t } = useTranslation();
  const { deviceMode } = useSettingsStore();
  const { user } = useAuthStore();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'medical' | 'gallery'>('info');
  const [showPetSelector, setShowPetSelector] = useState(false);
  const [qrSize, setQrSize] = useState(200);
  const [qrStyle, setQrStyle] = useState<'simple' | 'with-photo'>('simple');
  
  const isAdmin = user?.role === 'admin';
  
  // Load pet data when selectedPetId changes
  useEffect(() => {
    if (selectedPetId) {
      const selectedPet = pets.find(p => p.id === selectedPetId);
      if (selectedPet) {
        setPet(selectedPet);
        setError(null);
      } else {
        loadPetData(selectedPetId);
      }
    } else {
      setPet(null);
    }
  }, [selectedPetId, pets]);

  const loadPetData = async (petId: string) => {
    try {
      setLoading(true);
      setError(null);
      const petData = await PetService.getPetById(petId);
      if (petData) {
        setPet(petData);
      } else {
        setError('Mascota no encontrada');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading pet data');
    } finally {
      setLoading(false);
    }
  };

  // Generate QR data with comprehensive pet information
  const generateQRData = () => {
    if (!pet) return '';
    
    return JSON.stringify({
      id: pet.id,
      name: pet.name,
      owner: pet.owner,
      phone: pet.phone,
      address: pet.address,
      type: pet.type,
      breed: pet.breed,
      age: pet.age,
      illness: pet.illness,
      observations: pet.observations,
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

  const handleDownloadQR = () => {
    if (!pet) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const svg = document.getElementById('pet-qr-svg');
    
    if (!svg || !ctx) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    
    canvas.width = qrSize + 100;
    canvas.height = qrSize + 150;
    
    img.onload = () => {
      // White background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw QR code
      ctx.drawImage(img, 50, 50, qrSize, qrSize);
      
      // Add pet information
      ctx.fillStyle = 'black';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(pet.name, canvas.width / 2, qrSize + 80);
      
      ctx.font = '12px Arial';
      ctx.fillText(`${pet.type} • ${pet.breed}`, canvas.width / 2, qrSize + 100);
      ctx.fillText(`Dueño: ${pet.owner}`, canvas.width / 2, qrSize + 120);
      ctx.fillText(`Tel: ${pet.phone}`, canvas.width / 2, qrSize + 140);
      
      // Download
      const link = document.createElement('a');
      link.download = `${pet.name}-qr-id.png`;
      link.href = canvas.toDataURL();
      link.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const handlePrintQR = () => {
    if (!pet) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const qrData = generateQRData();
    
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
            .footer {
              margin-top: 15px;
              font-size: 10px;
              color: #666;
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
              <strong>Estado:</strong> ${pet.status === 'healthy' ? 'Saludable' : pet.status}
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
            
            <div class="footer">
              Escanea el código QR para ver información completa<br>
              Generado: ${new Date().toLocaleDateString()}
            </div>
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

  // Simulated vaccination records
  const vaccinations = [
    { name: 'Rabia', date: '2024-01-15', nextDue: '2025-01-15' },
    { name: 'Parvovirus', date: '2023-12-10', nextDue: '2024-12-10' },
    { name: 'Moquillo', date: '2023-11-20', nextDue: '2024-11-20' },
  ];

  // Simulated medical history
  const medicalHistory = [
    { date: '2024-02-15', type: 'Checkup', description: 'Control de rutina' },
    { date: '2023-12-20', type: 'Treatment', description: 'Tratamiento antipulgas' },
    { date: '2023-11-05', type: 'Emergency', description: 'Dolor estomacal' },
  ];

  // Simulated achievements/badges
  const achievements = [
    { name: 'Entrenamiento Básico', date: '2023-10-15' },
    { name: 'Socialización', date: '2023-11-20' },
    { name: 'Obediencia Avanzada', date: '2024-01-10' },
  ];

  const handleShare = async () => {
    if (!pet) return;
    
    try {
      await navigator.share({
        title: `Perfil de ${pet.name}`,
        text: `Conoce a ${pet.name}, un ${pet.breed} de ${pet.age} años`,
        url: window.location.href,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={() => selectedPetId && loadPetData(selectedPetId)} />;
  }

  // Show empty state if no pets
  if (pets.length === 0) {
    return (
      <div className="bg-gray-800 rounded-xl p-4 sm:p-6 shadow-xl">
        <div className="text-center py-8">
          <Heart size={48} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-bold mb-2">No tienes mascotas registradas</h2>
          <p className="text-gray-400 mb-4">
            Agrega tu primera mascota para ver su perfil aquí.
          </p>
          {onEdit && (
            <button 
              onClick={onEdit}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Agregar Primera Mascota
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="bg-gray-800 rounded-xl p-4 sm:p-6 shadow-xl">
        <div className="text-center py-8">
          <AlertTriangle size={48} className="mx-auto text-yellow-500 mb-4" />
          <h2 className="text-xl font-bold mb-2">Selecciona una mascota</h2>
          <p className="text-gray-400">
            Elige una de tus mascotas para ver su perfil completo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-4 sm:p-6 shadow-xl">
      {/* Pet Selector */}
      {pets.length > 1 && (
        <div className="mb-6">
          <button
            onClick={() => setShowPetSelector(!showPetSelector)}
            className="w-full bg-gray-700 hover:bg-gray-600 rounded-lg p-3 flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-3">
              <img
                src={pet.imageUrl}
                alt={pet.name}
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="font-medium">{pet.name}</span>
              <span className="text-gray-400 text-sm">({pets.length} mascotas)</span>
            </div>
            {showPetSelector ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          
          {showPetSelector && (
            <div className="mt-2 bg-gray-700 rounded-lg max-h-48 overflow-y-auto">
              {pets.map((petOption) => (
                <button
                  key={petOption.id}
                  onClick={() => {
                    onSelectPet(petOption.id);
                    setShowPetSelector(false);
                  }}
                  className={`w-full p-3 flex items-center gap-3 hover:bg-gray-600 transition-colors ${
                    petOption.id === selectedPetId ? 'bg-gray-600' : ''
                  }`}
                >
                  <img
                    src={petOption.imageUrl}
                    alt={petOption.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="text-left">
                    <p className="font-medium">{petOption.name}</p>
                    <p className="text-sm text-gray-400">{petOption.type} • {petOption.breed}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
        <div className="relative">
          <img
            src={pet.imageUrl}
            alt={pet.name}
            className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-green-500"
          />
          <button 
            className="absolute bottom-0 right-0 p-2 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors"
            title="Actualizar foto"
          >
            <Camera size={20} />
          </button>
        </div>
        
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">{pet.name}</h1>
          <p className="text-gray-400 mb-4">{pet.type} • {pet.breed}</p>
          
          <div className="flex flex-wrap justify-center sm:justify-start gap-3">
            {onEdit && isAdmin && (
              <button 
                onClick={onEdit}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              >
                <Edit size={18} />
                <span>{t('common.edit')}</span>
              </button>
            )}
            
            <button 
              onClick={() => setShowQR(!showQR)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <QrCode size={18} />
              <span>{showQR ? 'Ocultar QR' : 'Mostrar QR'}</span>
            </button>
            
            <button 
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
            >
              <Share2 size={18} />
              <span>{t('common.share')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* QR Code Section */}
      {showQR && (
        <div className="mb-8 p-6 bg-white rounded-lg">
          <div className="flex flex-col items-center">
            <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
              <div>
                <label className="block text-gray-800 text-sm font-medium mb-2">
                  Estilo del QR:
                </label>
                <select
                  value={qrStyle}
                  onChange={(e) => setQrStyle(e.target.value as 'simple' | 'with-photo')}
                  className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-1 text-gray-800"
                >
                  <option value="simple">QR Simple</option>
                  <option value="with-photo">QR con Foto</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-800 text-sm font-medium mb-2">
                  Tamaño del QR:
                </label>
                <select
                  value={qrSize}
                  onChange={(e) => setQrSize(Number(e.target.value))}
                  className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-1 text-gray-800"
                >
                  <option value={150}>Pequeño (150px)</option>
                  <option value={200}>Mediano (200px)</option>
                  <option value={300}>Grande (300px)</option>
                </select>
              </div>
            </div>
            
            <QRCodeSVG
              id="pet-qr-svg"
              value={generateQRData()}
              size={qrSize}
              level="H"
              includeMargin
              imageSettings={qrStyle === 'with-photo' ? {
                src: pet.imageUrl,
                x: undefined,
                y: undefined,
                height: qrSize * 0.2,
                width: qrSize * 0.2,
                excavate: true,
              } : undefined}
            />
            
            <div className="mt-4 text-center text-gray-800">
              <h3 className="font-bold text-lg">{pet.name}</h3>
              <p className="text-sm">{pet.type} • {pet.breed}</p>
              <p className="text-xs mt-2">
                {qrStyle === 'simple' ? 'ID Virtual - Escanea para información completa' : 'Escanea para información completa'}
              </p>
            </div>
            
            <div className="flex gap-4 mt-4">
              <button
                onClick={handleDownloadQR}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Download size={16} />
                Descargar
              </button>
              
              <button
                onClick={handlePrintQR}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Printer size={16} />
                Imprimir ID
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-700 mb-6">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'info'
              ? 'border-b-2 border-green-500 text-green-500'
              : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('info')}
        >
          Información General
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'medical'
              ? 'border-b-2 border-green-500 text-green-500'
              : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('medical')}
        >
          Historial Médico
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'gallery'
              ? 'border-b-2 border-green-500 text-green-500'
              : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('gallery')}
        >
          Galería
        </button>
      </div>

      {/* Content Sections */}
      {activeTab === 'info' && (
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 bg-gray-700 p-4 rounded-lg">
              <User className="text-green-500" />
              <div>
                <p className="text-sm text-gray-400">Dueño</p>
                <p className="font-medium">{pet.owner}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-gray-700 p-4 rounded-lg">
              <Phone className="text-green-500" />
              <div>
                <p className="text-sm text-gray-400">Teléfono</p>
                <p className="font-medium">{pet.phone}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-gray-700 p-4 rounded-lg">
              <MapPin className="text-green-500" />
              <div>
                <p className="text-sm text-gray-400">Dirección</p>
                <p className="font-medium">{pet.address}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-gray-700 p-4 rounded-lg">
              <Calendar className="text-green-500" />
              <div>
                <p className="text-sm text-gray-400">Edad</p>
                <p className="font-medium">{pet.age} años</p>
              </div>
            </div>
          </div>

          {/* Status Information */}
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Stethoscope className="text-green-500" />
              Estado Actual
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-800 p-3 rounded-lg">
                <p className="text-sm text-gray-400">Estado</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  pet.status === 'healthy' ? 'bg-green-500/20 text-green-400' :
                  pet.status === 'adoption' ? 'bg-blue-500/20 text-blue-400' :
                  pet.status === 'lost' ? 'bg-orange-500/20 text-orange-400' :
                  pet.status === 'stolen' ? 'bg-red-500/20 text-red-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {pet.status === 'healthy' ? 'Saludable' :
                   pet.status === 'adoption' ? 'En adopción' :
                   pet.status === 'lost' ? 'Perdido' :
                   pet.status === 'stolen' ? 'Robado' :
                   'Desorientado'}
                </span>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg">
                <p className="text-sm text-gray-400">Condiciones Médicas</p>
                <p className="font-medium">{pet.illness || 'Ninguna'}</p>
              </div>
            </div>
          </div>

          {/* Achievements Section */}
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Medal className="text-green-500" />
              Logros y Certificaciones
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement, index) => (
                <div key={index} className="bg-gray-800 p-3 rounded-lg">
                  <p className="font-medium">{achievement.name}</p>
                  <p className="text-sm text-gray-400">{achievement.date}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Notes */}
          {pet.observations && (
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Clipboard className="text-green-500" />
                Observaciones
              </h3>
              <p className="text-gray-300">{pet.observations}</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'medical' && (
        <div className="space-y-6">
          {/* Current Health Status */}
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Stethoscope className="text-green-500" />
              Estado de Salud Actual
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-800 p-3 rounded-lg">
                <p className="text-sm text-gray-400">Condición General</p>
                <p className="font-medium">Saludable</p>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg">
                <p className="text-sm text-gray-400">Enfermedades</p>
                <p className="font-medium">{pet.illness || 'Ninguna'}</p>
              </div>
            </div>
          </div>

          {/* Vaccination Records */}
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Syringe className="text-green-500" />
              Registro de Vacunas
            </h3>
            <div className="space-y-3">
              {vaccinations.map((vaccination, index) => (
                <div key={index} className="bg-gray-800 p-3 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{vaccination.name}</p>
                      <p className="text-sm text-gray-400">
                        Aplicada: {vaccination.date}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Próxima dosis</p>
                      <p className="text-green-500">{vaccination.nextDue}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Medical History */}
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="text-green-500" />
              Historial Médico
            </h3>
            <div className="space-y-3">
              {medicalHistory.map((record, index) => (
                <div key={index} className="bg-gray-800 p-3 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{record.type}</p>
                      <p className="text-gray-300">{record.description}</p>
                    </div>
                    <p className="text-sm text-gray-400">{record.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Information */}
          <div className="bg-red-900/30 border border-red-500 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 text-red-400">
              <AlertTriangle />
              Información de Emergencia
            </h3>
            <div className="space-y-2">
              <p>Alergias: Ninguna conocida</p>
              <p>Grupo Sanguíneo: A+</p>
              <p>Veterinario de cabecera: Dr. Juan Pérez - Tel: 099-999-9999</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'gallery' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="aspect-square">
              <img
                src={pet.imageUrl}
                alt={`${pet.name} - Foto ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}