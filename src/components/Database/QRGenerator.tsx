import React, { useState, useRef } from 'react';
import { QrCode, Download, Share2, X, Copy, Check, Printer } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Pet } from '../../types';
import { useSettingsStore } from '../../store/settingsStore';

interface QRGeneratorProps {
  pet: Pet;
  onClose: () => void;
}

export function QRGenerator({ pet, onClose }: QRGeneratorProps) {
  const { deviceMode } = useSettingsStore();
  const [qrSize, setQrSize] = useState(256);
  const [includePhoto, setIncludePhoto] = useState(false);
  const [qrStyle, setQrStyle] = useState<'simple' | 'with-photo'>('simple');
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  // Generate unique QR data with pet information
  const qrData = JSON.stringify({
    id: pet.id,
    name: pet.name,
    owner: pet.owner,
    phone: pet.phone,
    type: pet.type,
    breed: pet.breed,
    url: `${window.location.origin}/pet/${pet.id}`,
    timestamp: Date.now()
  });

  const handleDownloadQR = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = qrSize;
    canvas.height = qrSize;

    img.onload = () => {
      ctx?.drawImage(img, 0, 0);
      const link = document.createElement('a');
      link.download = `${pet.name}-qr-code.png`;
      link.href = canvas.toDataURL();
      link.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const handlePrintQR = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Código QR - ${pet.name}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 20px;
              margin: 0;
            }
            .qr-container { 
              display: inline-block; 
              border: 2px solid #000; 
              padding: 20px; 
              margin: 20px;
              background: white;
            }
            .pet-info {
              margin-top: 15px;
              font-size: 14px;
              color: #333;
            }
            .pet-name {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            @media print {
              body { margin: 0; }
              .qr-container { 
                border: 2px solid #000; 
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            ${svgData}
            <div class="pet-info">
              <div class="pet-name">${pet.name}</div>
              <div>Tipo: ${pet.type} - ${pet.breed}</div>
              <div>Dueño: ${pet.owner}</div>
              <div>Teléfono: ${pet.phone}</div>
              <div style="margin-top: 10px; font-size: 12px;">
                Escanea para ver información completa
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleCopyData = async () => {
    try {
      await navigator.clipboard.writeText(qrData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: `Código QR de ${pet.name}`,
        text: `Información de ${pet.name} - ${pet.type} ${pet.breed}`,
        url: `${window.location.origin}/pet/${pet.id}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-gray-800 rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto ${
        deviceMode === 'mobile' ? 'w-full max-w-sm' : 'w-full max-w-2xl'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-700">
          <h2 className={`font-bold flex items-center gap-2 ${
            deviceMode === 'mobile' ? 'text-lg' : 'text-xl'
          }`}>
            <QrCode className="text-green-500" size={deviceMode === 'mobile' ? 20 : 24} />
            Generar Código QR
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-6">
          {/* Pet Info */}
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-4 mb-4">
              <img
                src={pet.imageUrl}
                alt={pet.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-green-500"
              />
              <div>
                <h3 className="text-lg font-semibold">{pet.name}</h3>
                <p className="text-gray-400">{pet.type} • {pet.breed}</p>
                <p className="text-sm text-gray-500">ID: {pet.id}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Dueño:</span>
                <p className="font-medium">{pet.owner}</p>
              </div>
              <div>
                <span className="text-gray-400">Teléfono:</span>
                <p className="font-medium">{pet.phone}</p>
              </div>
            </div>
          </div>

          {/* QR Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Configuración del QR</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Estilo del QR
                </label>
                <select
                  value={qrStyle}
                  onChange={(e) => {
                    const style = e.target.value as 'simple' | 'with-photo';
                    setQrStyle(style);
                    setIncludePhoto(style === 'with-photo');
                  }}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                >
                  <option value="simple">QR Simple (Sin foto)</option>
                  <option value="with-photo">QR con Foto de Mascota</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tamaño del QR
                </label>
                <select
                  value={qrSize}
                  onChange={(e) => setQrSize(Number(e.target.value))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                >
                  <option value={128}>Pequeño (128px)</option>
                  <option value={256}>Mediano (256px)</option>
                  <option value={512}>Grande (512px)</option>
                </select>
              </div>
            </div>
            
            <div className="bg-blue-900/30 border border-blue-500 rounded-lg p-4">
              <h4 className="font-medium text-blue-400 mb-2">Opciones de QR</h4>
              <div className="text-sm text-blue-200 space-y-1">
                <p><strong>QR Simple:</strong> Código limpio sin imagen, ideal para impresión masiva</p>
                <p><strong>QR con Foto:</strong> Incluye la foto de la mascota en el centro para fácil identificación</p>
              </div>
            </div>
          </div>

          {/* QR Code Display */}
          <div className="bg-white p-6 rounded-lg flex flex-col items-center">
            <div ref={qrRef}>
              <QRCodeSVG
                value={qrData}
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
            </div>
            
            <div className="mt-4 text-center text-gray-800">
              <h4 className="font-bold text-lg">{pet.name}</h4>
              <p className="text-sm">{pet.type} • {pet.breed}</p>
              <p className="text-xs mt-2">
                {qrStyle === 'simple' ? 'ID Virtual - Escanea para información completa' : 'Escanea para ver información completa'}
              </p>
            </div>
          </div>

          {/* QR Data Preview */}
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Datos del QR</h4>
              <button
                onClick={handleCopyData}
                className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copiado' : 'Copiar'}
              </button>
            </div>
            <pre className="text-xs text-gray-300 bg-gray-800 p-3 rounded overflow-x-auto">
              {JSON.stringify(JSON.parse(qrData), null, 2)}
            </pre>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={handleDownloadQR}
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg transition-colors"
            >
              <Download size={20} />
              Descargar
            </button>
            
            <button
              onClick={handlePrintQR}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors"
            >
              <Printer size={20} />
              Imprimir
            </button>
            
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg transition-colors"
            >
              <Share2 size={20} />
              Compartir
            </button>
          </div>

          {/* Usage Instructions */}
          <div className="bg-blue-900/30 border border-blue-500 rounded-lg p-4">
            <h4 className="font-medium text-blue-400 mb-2">Instrucciones de Uso</h4>
            <ul className="text-sm text-blue-200 space-y-1">
              <li>• Imprime el código QR y colócalo en el collar de la mascota</li>
              <li>• Cualquier persona puede escanear el código para ver la información</li>
              <li>• El código incluye datos de contacto para emergencias</li>
              <li>• Funciona sin conexión a internet una vez generado</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}