import React from 'react';
import { DatabaseView } from './Database/DatabaseView';
import { useAuthStore } from '../store/authStore';
import { Shield, AlertTriangle } from 'lucide-react';

export function PetEditor() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  if (!isAdmin) {
    return (
      <div className="mx-auto bg-gray-800 rounded-xl max-w-2xl p-6">
        <div className="text-center py-8">
          <AlertTriangle size={48} className="mx-auto text-yellow-500 mb-4" />
          <h2 className="text-xl font-bold mb-2">Acceso Restringido</h2>
          <p className="text-gray-400 mb-4">
            Esta sección está disponible solo para cuentas de Administrador.
          </p>
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="text-green-500" size={20} />
              <span className="font-semibold">Cuenta de Administrador</span>
            </div>
            <p className="text-sm text-gray-300">
              Las cuentas de Administrador tienen acceso completo para crear, editar y eliminar registros de mascotas, además de gestionar usuarios y moderar contenido.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <DatabaseView />;
}