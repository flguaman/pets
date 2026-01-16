import React, { useState } from 'react';
import { Pet } from '../types';
import { Cat, QrCode, Download, Share2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface PetInfoProps {
  pet: Pet;
}

export function PetInfo({ pet }: PetInfoProps) {
  const [showQR, setShowQR] = useState(false);

  const fields = [
    { label: 'ID', value: pet.id },
    { label: 'Nombre', value: pet.name },
    { label: 'Dueño', value: pet.owner },
    { label: 'Celular', value: pet.phone },
    { label: 'Dirección', value: pet.address },
    { label: 'Tipo', value: pet.type },
    { label: 'Raza', value: pet.breed },
    { label: 'Edad', value: `${pet.age} años` },
    { label: 'Enfermedad', value: pet.illness },
    { label: 'Observaciones', value: pet.observations },
  ];

  // Generate a unique URL for the pet's identification page
  const qrValue = `${window.location.origin}/pet/${pet.id}`;

  const downloadQR = () => {
    const canvas = document.getElementById('pet-qr-canvas') as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${pet.name}-qr.png`;
      link.href = url;
      link.click();
    }
  };

  const shareQR = async () => {
    try {
      await navigator.share({
        title: `Código QR de ${pet.name}`,
        text: `Escanea este código QR para ver la información de ${pet.name}`,
        url: qrValue,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-6 shadow-lg">
      <div className="flex flex-col items-center mb-6">
        <div className="w-48 h-48 mb-4 overflow-hidden rounded-lg border-4 border-green-600 flex items-center justify-center">
          <img
            src={pet.imageUrl}
            alt={pet.name}
            className="w-full h-full object-cover"
          />
        </div>
        <h2 className="text-white text-xl font-bold">{pet.name}</h2>
      </div>

      <table className="w-full border-collapse mb-6 text-left">
        <tbody>
          {fields.map(({ label, value }) => (
            <tr key={label} className="border-b border-gray-700">
              <td className="py-3 px-4 text-gray-400 font-medium">{label}</td>
              <td className="py-3 px-4 text-white">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex flex-col items-center gap-4">
        <button
          onClick={() => setShowQR(!showQR)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <QrCode size={20} />
          {showQR ? 'Ocultar QR' : 'Mostrar QR'}
        </button>

        {showQR && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-center mb-4">
              <h3 className="text-gray-800 font-bold">Identificación de {pet.name}</h3>
              <p className="text-gray-600 text-sm">Escanea este código para ver la información completa</p>
            </div>
            <QRCodeSVG
              id="pet-qr"
              value={qrValue}
              size={200}
              level="H"
              includeMargin
              imageSettings={{
                src: pet.imageUrl,
                x: undefined,
                y: undefined,
                height: 40,
                width: 40,
                excavate: true,
              }}
            />
            <canvas id="pet-qr-canvas" style={{ display: 'none' }} />
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={downloadQR}
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Download size={20} />
                Descargar
              </button>
              <button
                onClick={shareQR}
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Share2 size={20} />
                Compartir
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}