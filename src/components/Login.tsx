import React, { useState, useEffect } from 'react';
import { useAuthStore, UserRole } from '../store/authStore';
import { DEFAULT_ACCOUNTS } from '../services/demoAuth';
import { User, Shield, Mail, Lock, Eye, EyeOff, Loader2, Wifi, WifiOff, AlertTriangle, Settings } from 'lucide-react';

export function Login() {
  const {
    login,
    signup,
    loading,
    error,
    clearError,
    connectionStatus,
    checkConnection,
    loginAsDefaultUser,
    loginAsDefaultAdmin,
    createDefaultAccounts
  } = useAuthStore();
  const createLocalDemoSession = useAuthStore(s => s.createLocalDemoSession);
  const [selectedRole, setSelectedRole] = useState<UserRole>('user');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Pre-fill email/password based on selected role (demo credentials)
  useEffect(() => {
    const creds = selectedRole === 'admin' ? DEFAULT_ACCOUNTS.admin : DEFAULT_ACCOUNTS.user;
    setFormData(prev => ({ ...prev, email: creds.email, password: creds.password }));
  }, [selectedRole]);

  const handleLocalDemo = async () => {
    try {
      // If store exposes the helper, use it. Otherwise fallback to loginAsDefault
      if (createLocalDemoSession) {
        createLocalDemoSession(selectedRole);
      } else {
        if (selectedRole === 'admin') await loginAsDefaultAdmin();
        else await loginAsDefaultUser();
      }
    } catch (err) {
      console.error('Local demo login error:', err);
    }
  };

  // Check connection on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const isOnline = await checkConnection();
        if (!mounted) return;
        if (isOnline) {
          await createDefaultAccounts();
        }
      } catch (e) {
        console.warn('createDefaultAccounts skipped or failed:', e);
      }
    })();
    return () => { mounted = false; };
  }, [checkConnection]);

  // Validate form data
  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (isSignUp) {
      if (!formData.name.trim()) {
        errors.push('El nombre es requerido');
      }
      if (formData.password !== formData.confirmPassword) {
        errors.push('Las contraseñas no coinciden');
      }
    }

    if (!formData.email.trim()) {
      errors.push('El email es requerido');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.push('El formato del email es inválido');
    }

    if (!formData.password) {
      errors.push('La contraseña es requerida');
    } else if (formData.password.length < 6) {
      errors.push('La contraseña debe tener al menos 6 caracteres');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleGoogleLogin = async () => {
    try {
      clearError();
      setValidationErrors([]);

      if (connectionStatus === 'offline') {
        setValidationErrors(['Sin conexión a internet. Verifica tu conexión.']);
        return;
      }

      // Use default accounts for demo
      if (selectedRole === 'admin') {
        await loginAsDefaultAdmin();
      } else {
        await loginAsDefaultUser();
      }
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (connectionStatus === 'offline') {
      setValidationErrors(['Sin conexión a internet. Verifica tu conexión.']);
      return;
    }

    try {
      clearError();
      setValidationErrors([]);

      if (isSignUp) {
        await signup(formData.email, formData.password, formData.name, selectedRole);
      } else {
        await login('email', {
          email: formData.email,
          password: formData.password,
          role: selectedRole
        });
      }
    } catch (error) {
      console.error('Email auth error:', error);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation errors when user starts typing
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const handleRetryConnection = async () => {
    const isOnline = await checkConnection();
    if (isOnline) {
      clearError();
      setValidationErrors([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-xl shadow-2xl">
        <div className="text-center">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent mb-4">
            Mascotas.ec
          </h1>
          <p className="text-gray-400 text-lg">
            Conecta con la comunidad de amantes de mascotas
          </p>
        </div>

        {/* Connection Status */}
        <div className={`flex items-center justify-between p-3 rounded-lg ${connectionStatus === 'online' ? 'bg-green-900/30 border border-green-500' :
          connectionStatus === 'offline' ? 'bg-red-900/30 border border-red-500' :
            'bg-yellow-900/30 border border-yellow-500'
          }`}>
          <div className="flex items-center gap-2">
            {connectionStatus === 'online' ? (
              <Wifi size={16} className="text-green-500" />
            ) : connectionStatus === 'offline' ? (
              <WifiOff size={16} className="text-red-500" />
            ) : (
              <Loader2 size={16} className="text-yellow-500 animate-spin" />
            )}
            <span className={`text-sm ${connectionStatus === 'online' ? 'text-green-400' :
              connectionStatus === 'offline' ? 'text-red-400' :
                'text-yellow-400'
              }`}>
              {connectionStatus === 'online' ? 'Conectado' :
                connectionStatus === 'offline' ? 'Sin conexión' :
                  'Reconectando...'}
            </span>
          </div>

          {connectionStatus === 'offline' && (
            <button
              onClick={handleRetryConnection}
              className="text-sm text-blue-400 hover:text-blue-300 underline"
            >
              Reintentar
            </button>
          )}
        </div>

        {/* Error Messages */}
        {(error || validationErrors.length > 0) && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-4">
            {error && (
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={16} className="text-red-400" />
                <p className="text-red-200 text-sm">{typeof error === 'string' ? error : (error?.message ?? JSON.stringify(error))}</p>
              </div>
            )}
            {validationErrors.map((err, index) => (
              <p key={index} className="text-red-200 text-sm">• {err}</p>
            ))}
          </div>
        )}

        {/* Demo notice */}
        <div className="bg-blue-900/50 border border-blue-500 rounded-lg p-4">
          <p className="text-blue-200 text-sm text-center">
            <strong>Modo Demo:</strong> Usa las cuentas predeterminadas o crea una nueva. Los datos se guardan en Supabase.
          </p>
        </div>

        {/* Selector de tipo de cuenta */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-center text-white">
            Selecciona el tipo de cuenta
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setSelectedRole('user')}
              disabled={loading}
              className={`p-4 rounded-lg border-2 transition-all ${selectedRole === 'user'
                ? 'border-green-500 bg-green-500/20 text-white'
                : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <User className="mx-auto mb-2" size={32} />
              <div className="text-center">
                <h4 className="font-semibold">Usuario</h4>
                <p className="text-sm opacity-80">Acceso básico</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole('admin')}
              disabled={loading}
              className={`p-4 rounded-lg border-2 transition-all ${selectedRole === 'admin'
                ? 'border-green-500 bg-green-500/20 text-white'
                : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Shield className="mx-auto mb-2" size={32} />
              <div className="text-center">
                <h4 className="font-semibold">Administrador</h4>
                <p className="text-sm opacity-80">Gestión completa</p>
              </div>
            </button>
          </div>
        </div>

        {/* Quick access buttons */}
        <div className="space-y-2">
          <button
            onClick={handleGoogleLogin}
            disabled={loading || connectionStatus === 'offline'}
            className="w-full flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:opacity-50 text-white font-medium py-4 px-4 rounded-lg transition-colors text-lg"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <img
                src="https://www.google.com/favicon.ico"
                alt="Google"
                className="w-6 h-6"
              />
            )}
            Acceso Rápido como {selectedRole === 'user' ? 'Usuario' : 'Administrador'}
          </button>
          <button
            onClick={handleLocalDemo}
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-3 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-800 disabled:opacity-50 text-white font-medium py-3 px-4 rounded-lg transition-colors text-md"
          >
            Iniciar sesión Demo local como {selectedRole === 'user' ? 'Usuario' : 'Administrador'}
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-800 text-gray-400">O usa el formulario</span>
          </div>
        </div>

        {/* Formulario de email */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nombre completo
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Tu nombre completo"
                required
                disabled={loading}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Correo electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData('email', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="tu@email.com"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => updateFormData('password', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-12 py-3 text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="••••••••"
                required
                disabled={loading}
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                disabled={loading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirmar contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  minLength={6}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || connectionStatus === 'offline' || validationErrors.length > 0}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white font-medium py-4 px-4 rounded-lg transition-colors text-lg flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Mail size={20} />
            )}
            {isSignUp ? 'Crear cuenta (Demo)' : 'Iniciar sesión (Demo)'}
          </button>
        </form>

        {/* Toggle between login/signup */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              clearError();
              setValidationErrors([]);
              setFormData({ email: '', password: '', name: '', confirmPassword: '' });
            }}
            className="text-green-500 hover:text-green-400 transition-colors"
            disabled={loading}
          >
            {isSignUp
              ? '¿Ya tienes cuenta? Inicia sesión'
              : '¿No tienes cuenta? Regístrate'
            }
          </button>
        </div>

        <div className="bg-gray-700 p-4 rounded-lg">
          <h4 className="font-semibold mb-2 text-white flex items-center gap-2">
            {selectedRole === 'user' ? (
              <User size={16} className="text-blue-500" />
            ) : (
              <Shield size={16} className="text-green-500" />
            )}
            {selectedRole === 'user' ? 'Cuenta de Usuario' : 'Cuenta de Administrador'}
          </h4>
          <ul className="text-sm text-gray-300 space-y-1">
            {selectedRole === 'user' ? (
              <>
                <li>• Ver información de mascotas</li>
                <li>• Crear publicaciones</li>
                <li>• Escanear códigos QR</li>
                <li>• Acceder a adopciones y tienda</li>
                <li>• Ver veterinarias y alertas</li>
              </>
            ) : (
              <>
                <li>• Todas las funciones de usuario</li>
                <li>• Crear y gestionar mascotas</li>
                <li>• Editar información existente</li>
                <li>• Eliminar registros</li>
                <li>• Gestión completa de la base de datos</li>
                <li>• Estadísticas y análisis avanzados</li>
                <li>• Moderar contenido y usuarios</li>
              </>
            )}
          </ul>
        </div>

        <p className="text-sm text-center text-gray-400">
          Al continuar, aceptas nuestros términos de servicio y política de privacidad
        </p>
      </div>
    </div>
  );
}