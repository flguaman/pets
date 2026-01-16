import { Pet } from '../types';
import { APP_CONFIG, QR_CONFIG } from './constants';

export interface QRData {
  id: string;
  name: string;
  owner: string;
  phone: string;
  address: string;
  type: string;
  breed: string;
  age: number;
  illness?: string;
  observations?: string;
  status: string;
  url: string;
  emergency: {
    contact: string;
    owner: string;
    address: string;
  };
  app: {
    name: string;
    version: string;
  };
  timestamp: number;
}

export class QRGenerator {
  static generatePetQRData(pet: Pet): string {
    const qrData: QRData = {
      id: pet.id,
      name: pet.name,
      owner: pet.owner,
      phone: pet.phone,
      address: pet.address,
      type: pet.type,
      breed: pet.breed,
      age: pet.age,
      illness: pet.illness || undefined,
      observations: pet.observations || undefined,
      status: pet.status || 'healthy',
      url: `${window.location.origin}/pet/${pet.id}`,
      emergency: {
        contact: pet.phone,
        owner: pet.owner,
        address: pet.address
      },
      app: {
        name: APP_CONFIG.NAME,
        version: APP_CONFIG.VERSION
      },
      timestamp: Date.now()
    };

    return JSON.stringify(qrData, null, 0);
  }

  static parseQRData(qrString: string): QRData | null {
    try {
      const data = JSON.parse(qrString);
      
      // Validate required fields
      if (!data.id || !data.name || !data.owner || !data.phone) {
        return null;
      }

      return data as QRData;
    } catch {
      return null;
    }
  }

  static generateQRConfig(size: number = QR_CONFIG.SIZES.MEDIUM, includeImage: boolean = false, imageUrl?: string) {
    return {
      size,
      level: QR_CONFIG.DEFAULT_LEVEL,
      includeMargin: QR_CONFIG.MARGIN,
      imageSettings: includeImage && imageUrl ? {
        src: imageUrl,
        x: undefined,
        y: undefined,
        height: size * 0.2,
        width: size * 0.2,
        excavate: true,
      } : undefined
    };
  }

  static async downloadQRAsImage(
    qrElement: SVGElement, 
    pet: Pet, 
    size: number = QR_CONFIG.SIZES.MEDIUM
  ): Promise<void> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) throw new Error('Canvas context not available');

    const padding = 50;
    const infoHeight = 150;
    canvas.width = size + (padding * 2);
    canvas.height = size + infoHeight + (padding * 2);

    // White background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Convert SVG to image
    const svgData = new XMLSerializer().serializeToString(qrElement);
    const img = new Image();
    
    return new Promise((resolve, reject) => {
      img.onload = () => {
        try {
          // Draw QR code
          ctx.drawImage(img, padding, padding, size, size);
          
          // Add pet information
          ctx.fillStyle = '#10b981';
          ctx.font = 'bold 20px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(APP_CONFIG.NAME, canvas.width / 2, size + padding + 30);
          
          ctx.fillStyle = 'black';
          ctx.font = 'bold 18px Arial';
          ctx.fillText(pet.name, canvas.width / 2, size + padding + 60);
          
          ctx.font = '14px Arial';
          ctx.fillText(`${pet.type} • ${pet.breed}`, canvas.width / 2, size + padding + 80);
          ctx.fillText(`Dueño: ${pet.owner}`, canvas.width / 2, size + padding + 100);
          ctx.fillText(`Tel: ${pet.phone}`, canvas.width / 2, size + padding + 120);
          
          ctx.font = '12px Arial';
          ctx.fillStyle = '#666';
          ctx.fillText(`ID: ${pet.id}`, canvas.width / 2, size + padding + 140);
          
          // Download
          const link = document.createElement('a');
          link.download = `${pet.name}-id-virtual.png`;
          link.href = canvas.toDataURL('image/png', 1.0);
          link.click();
          
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = reject;
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    });
  }

  static generatePrintableHTML(pet: Pet, qrData: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>ID Virtual - ${pet.name}</title>
          <meta charset="UTF-8">
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              text-align: center; 
              padding: 20px;
              margin: 0;
              background: #f5f5f5;
            }
            .id-card { 
              display: inline-block; 
              border: 3px solid #10b981; 
              padding: 30px; 
              margin: 20px;
              background: white;
              border-radius: 15px;
              box-shadow: 0 8px 16px rgba(0,0,0,0.1);
              max-width: 400px;
              position: relative;
            }
            .header {
              color: #10b981;
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .pet-name {
              font-size: 22px;
              font-weight: bold;
              margin: 15px 0 5px 0;
              color: #333;
            }
            .pet-info {
              margin: 10px 0;
              font-size: 14px;
              color: #555;
              line-height: 1.6;
            }
            .emergency {
              background: linear-gradient(135deg, #fee2e2, #fecaca);
              border: 2px solid #ef4444;
              border-radius: 10px;
              padding: 15px;
              margin: 15px 0;
              box-shadow: 0 2px 4px rgba(239, 68, 68, 0.1);
            }
            .emergency-title {
              color: #dc2626;
              font-weight: bold;
              font-size: 16px;
              margin-bottom: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 8px;
            }
            .medical-info {
              background: linear-gradient(135deg, #fef3c7, #fde68a);
              border: 2px solid #f59e0b;
              border-radius: 8px;
              padding: 12px;
              margin: 10px 0;
            }
            .medical-title {
              color: #d97706;
              font-weight: bold;
              font-size: 14px;
              margin-bottom: 5px;
            }
            .footer {
              margin-top: 20px;
              font-size: 11px;
              color: #666;
              border-top: 1px solid #e5e7eb;
              padding-top: 15px;
            }
            .app-info {
              color: #10b981;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .qr-container {
              margin: 20px 0;
              padding: 10px;
              background: #f9fafb;
              border-radius: 8px;
              border: 1px solid #e5e7eb;
            }
            @media print {
              body { 
                margin: 0; 
                background: white;
              }
              .id-card { 
                page-break-inside: avoid;
                box-shadow: none;
                margin: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="id-card">
            <div class="header">🐾 ID Virtual Mascota</div>
            
            <div class="qr-container">
              <div id="qr-container"></div>
            </div>
            
            <div class="pet-name">${pet.name}</div>
            <div class="pet-info">
              <strong>Tipo:</strong> ${pet.type} - ${pet.breed}<br>
              <strong>Edad:</strong> ${pet.age} años<br>
              <strong>Estado:</strong> ${this.getStatusLabel(pet.status || 'healthy')}
            </div>
            
            <div class="emergency">
              <div class="emergency-title">🚨 INFORMACIÓN DE EMERGENCIA</div>
              <div style="font-size: 13px; line-height: 1.4;">
                <strong>Dueño:</strong> ${pet.owner}<br>
                <strong>Teléfono:</strong> ${pet.phone}<br>
                <strong>Dirección:</strong> ${pet.address}
              </div>
            </div>
            
            ${pet.illness && pet.illness !== 'Ninguna' ? `
              <div class="medical-info">
                <div class="medical-title">⚕️ CONDICIÓN MÉDICA IMPORTANTE</div>
                <div style="font-size: 12px;">${pet.illness}</div>
              </div>
            ` : ''}
            
            ${pet.observations ? `
              <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 6px; padding: 10px; margin: 10px 0;">
                <strong style="color: #0369a1;">Observaciones:</strong><br>
                <span style="font-size: 12px;">${pet.observations}</span>
              </div>
            ` : ''}
            
            <div class="footer">
              <div class="app-info">${APP_CONFIG.NAME}</div>
              <div>Sistema de Identificación Digital para Mascotas</div>
              <div style="margin-top: 8px;">
                <strong>ID:</strong> ${pet.id}<br>
                <strong>Generado:</strong> ${new Date().toLocaleDateString('es-ES', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
              <div style="margin-top: 8px; font-size: 10px;">
                Escanea el código QR para acceder a información actualizada
              </div>
            </div>
          </div>
          
          <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
          <script>
            QRCode.toCanvas(document.createElement('canvas'), '${qrData}', {
              width: 160,
              margin: 2,
              color: {
                dark: '#000000',
                light: '#ffffff'
              },
              errorCorrectionLevel: 'H'
            }, function (error, canvas) {
              if (error) {
                console.error(error);
                return;
              }
              
              canvas.style.border = '2px solid #10b981';
              canvas.style.borderRadius = '8px';
              document.getElementById('qr-container').appendChild(canvas);
              
              setTimeout(() => {
                window.print();
                window.close();
              }, 500);
            });
          </script>
        </body>
      </html>
    `;
  }

  private static getStatusLabel(status: string): string {
    const statusMap = {
      healthy: '✅ Saludable',
      adoption: '🏠 En Adopción',
      lost: '🔍 Perdido',
      stolen: '🚨 Robado',
      disoriented: '😵 Desorientado'
    };
    
    return statusMap[status] || status;
  }
}