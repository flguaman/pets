import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import {
  signInWithPassword,
  signUpWithEmail,
  signUpAsAdmin,
  signUpAsUser,
  supabaseSignOut,
  getSupabaseSession,
  getSupabaseUser,
  supabaseRefreshSession,
  updateUserMetadata,
  createSupabaseDefaultAccounts
} from '../services/supabaseAuth';
import {
  getDefaultPermissions,
  updateUserRoleInSupabase,
  getUserRoleFromSupabase,
  isUserAdmin,
  validateUserRole
} from '../services/roleService';
import type { User, AuthChangeEvent, Session } from '@supabase/supabase-js';
import { DEFAULT_ACCOUNTS, buildLocalDemoAppUser } from '../services/demoAuth';

export type UserRole = 'user' | 'admin';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  picture: string;
  role: UserRole;
  isVerified: boolean;
  lastLogin: string;
  permissions: {
    canCreatePets: boolean;
    canEditPets: boolean;
    canDeletePets: boolean;
    canManageUsers: boolean;
    canViewAnalytics: boolean;
    canModerateContent: boolean;
  };
  preferences: {
    notifications: boolean;
    emailUpdates: boolean;
    publicProfile: boolean;
    language: 'es' | 'en';
    theme: 'light' | 'dark';
  };
  stats: {
    petsCreated: number;
    postsCreated: number;
    joinDate: string;
    lastActivity: string;
  };
}

interface AuthState {
  isAuthenticated: boolean;
  user: AppUser | null;
  loading: boolean;
  error: string | null;
  sessionChecked: boolean;
  connectionStatus: 'online' | 'offline' | 'reconnecting';
  login: (provider: 'google' | 'email', credentials?: { email: string; password: string; role?: UserRole }) => Promise<void>;
  signup: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  clearError: () => void;
  updateUserRole: (role: UserRole) => Promise<void>;
  updateUserPreferences: (preferences: Partial<AppUser['preferences']>) => Promise<void>;
  updateUserPermissions: (permissions: Partial<AppUser['permissions']>) => Promise<void>;
  refreshSession: () => Promise<void>;
  checkConnection: () => Promise<boolean>;
  syncUserData: () => Promise<void>;
  validateSession: () => Promise<boolean>;
  loginAsDefaultUser: () => Promise<void>;
  loginAsDefaultAdmin: () => Promise<void>;
  createDefaultAccounts: () => Promise<void>;
  createLocalDemoSession?: (role?: UserRole) => void;
}

// Demo accounts and helpers are provided by `src/services/demoAuth.ts`

// Helper function to validate UUID format
const isValidUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

// Local demo session builder is implemented in `demoAuth.buildLocalDemoAppUser`.

// Helper function to get default permissions based on role
const getDefaultPermissionsForRole = (role: UserRole): AppUser['permissions'] => {
  return getDefaultPermissions(role);
};

// Helper function to convert Supabase user to AppUser
const convertToAppUser = (user: User, role: UserRole = 'user'): AppUser => {
  // Validate user ID
  if (!user.id || !isValidUUID(user.id)) {
    throw new Error('Invalid user ID format');
  }

  const userRole = user.user_metadata?.role || role;
  const permissions = user.user_metadata?.permissions || getDefaultPermissionsForRole(userRole);

  return {
    id: user.id,
    name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
    email: user.email || '',
    picture: user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.user_metadata?.name || user.email?.split('@')[0] || 'User')}&background=10b981&color=fff`,
    role: userRole,
    isVerified: user.email_confirmed_at !== null,
    lastLogin: new Date().toISOString(),
    permissions,
    preferences: {
      notifications: user.user_metadata?.preferences?.notifications ?? true,
      emailUpdates: user.user_metadata?.preferences?.emailUpdates ?? true,
      publicProfile: user.user_metadata?.preferences?.publicProfile ?? false,
      language: user.user_metadata?.preferences?.language ?? 'es',
      theme: user.user_metadata?.preferences?.theme ?? 'dark',
    },
    stats: {
      petsCreated: user.user_metadata?.stats?.petsCreated ?? 0,
      postsCreated: user.user_metadata?.stats?.postsCreated ?? 0,
      joinDate: user.created_at || new Date().toISOString(),
      lastActivity: new Date().toISOString(),
    }
  };
};

// Helper function to handle auth errors
const handleAuthError = (error: any): string => {
  if (error?.message) {
    // Handle specific Supabase auth errors
    switch (error.message) {
      case 'Invalid login credentials':
        return 'Credenciales incorrectas. Verifica tu email y contraseña.';
      case 'Email not confirmed':
        return 'Por favor confirma tu email antes de iniciar sesión.';
      case 'User not found':
        return 'No existe una cuenta con este email.';
      case 'Password should be at least 6 characters':
        return 'La contraseña debe tener al menos 6 caracteres.';
      case 'Unable to validate email address: invalid format':
        return 'Formato de email inválido.';
      case 'Signup is disabled':
        return 'El registro está deshabilitado temporalmente.';
      case 'Email rate limit exceeded':
        return 'Demasiados intentos. Espera unos minutos antes de intentar nuevamente.';
      case 'Invalid refresh token':
        return 'Sesión expirada. Por favor inicia sesión nuevamente.';
      case 'Network request failed':
        return 'Error de conexión. Verifica tu conexión a internet.';
      default:
        return error.message;
    }
  }
  return 'Error de autenticación desconocido';
};

// Helper function to check network connectivity
const checkNetworkConnectivity = async (): Promise<boolean> => {
  try {
    await fetch('https://www.google.com/favicon.ico', {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-cache',
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    return true;
  } catch {
    return navigator.onLine;
  }
};

// Helper function to update user metadata in Supabase
const updateUserMetadataLocal = async (updates: any): Promise<void> => {
  const { user } = get();
  if (!user) throw new Error('Usuario no autenticado');

  const result = await updateUserMetadata(user.id, updates);
  if (result.error) throw result.error;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      loading: false,
      error: null,
      sessionChecked: false,
      connectionStatus: 'online',

      // (no local session helper attached here; a module-scoped helper is used)

      login: async (provider, credentials) => {
        try {
          set({ loading: true, error: null });

          // Check network connectivity
          const isOnline = await checkNetworkConnectivity();
          if (!isOnline) {
            throw new Error('Sin conexión a internet. Verifica tu conexión y vuelve a intentar.');
          }

          if (provider === 'email' && credentials) {
            // Validate input
            if (!credentials.email || !credentials.password) {
              throw new Error('Email y contraseña son requeridos');
            }

            const { data, error } = await signInWithPassword(
              credentials.email.trim().toLowerCase(),
              credentials.password
            );

            if (error) throw error;

            if (data.user) {
              const appUser = convertToAppUser(data.user, credentials.role);

              // Update user metadata with role and last login
              if (credentials.role && credentials.role !== data.user.user_metadata?.role) {
                await updateUserMetadataLocal({
                  role: credentials.role,
                  permissions: getDefaultPermissionsForRole(credentials.role),
                  lastLogin: new Date().toISOString()
                });
                appUser.role = credentials.role;
                appUser.permissions = getDefaultPermissionsForRole(credentials.role);
              } else {
                await updateUserMetadataLocal({
                  lastLogin: new Date().toISOString(),
                  lastActivity: new Date().toISOString()
                });
              }

              set({
                isAuthenticated: true,
                user: appUser,
                loading: false,
                error: null,
                sessionChecked: true,
                connectionStatus: 'online'
              });
            }
          } else if (provider === 'google') {
            const { error } = await supabase.auth.signInWithOAuth({
              provider: 'google',
              options: {
                redirectTo: `${window.location.origin}/auth/callback`,
                queryParams: {
                  access_type: 'offline',
                  prompt: 'consent',
                }
              }
            });

            if (error) throw error;

            // OAuth will redirect, so we don't set state here
            set({ loading: false });
          } else {
            throw new Error('Método de autenticación no válido');
          }
        } catch (error) {
          const errorMessage = handleAuthError(error);
          set({
            error: errorMessage,
            loading: false,
            connectionStatus: navigator.onLine ? 'online' : 'offline'
          });
          throw new Error(errorMessage);
        }
      },

      // Public method: create a local demo session immediately (UI can call this)
      createLocalDemoSession: (role: UserRole = 'user') => {
        const appUser = buildLocalDemoAppUser(role);
        set({
          isAuthenticated: true,
          user: appUser as AppUser,
          loading: false,
          error: null,
          sessionChecked: true,
          connectionStatus: navigator.onLine ? 'online' : 'offline'
        });
      },

      // NOTE: we define a helper via set/get closure below by attaching a function
      // to the store after initialization. This is necessary because `set` is only
      // available inside the store factory. We'll overwrite this placeholder with
      // an actual function just after the store object is created.

      signup: async (email, password, name, role) => {
        try {
          set({ loading: true, error: null });

          // Check network connectivity
          const isOnline = await checkNetworkConnectivity();
          if (!isOnline) {
            throw new Error('Sin conexión a internet. Verifica tu conexión y vuelve a intentar.');
          }

          // Validate input
          if (!email || !password || !name) {
            throw new Error('Todos los campos son requeridos');
          }

          if (password.length < 6) {
            throw new Error('La contraseña debe tener al menos 6 caracteres');
          }

          const permissions = getDefaultPermissionsForRole(role);

          const { data, error } = await signUpWithEmail(email.trim().toLowerCase(), password, {
            data: {
              name: name.trim(),
              role,
              permissions,
              preferences: {
                notifications: true,
                emailUpdates: true,
                publicProfile: false,
                language: 'es',
                theme: 'dark',
              },
              stats: {
                petsCreated: 0,
                postsCreated: 0,
                joinDate: new Date().toISOString(),
                lastActivity: new Date().toISOString(),
              }
            }
          });

          if (error) throw error;

          if (data.user) {
            const appUser = convertToAppUser(data.user, role);
            set({
              isAuthenticated: true,
              user: appUser,
              loading: false,
              error: null,
              sessionChecked: true,
              connectionStatus: 'online'
            });
          }
        } catch (error) {
          const errorMessage = handleAuthError(error);
          set({
            error: errorMessage,
            loading: false,
            connectionStatus: navigator.onLine ? 'online' : 'offline'
          });
          throw new Error(errorMessage);
        }
      },

      logout: async () => {
        try {
          set({ loading: true, error: null });

          const { error } = await supabaseSignOut();

          if (error) throw error;

          set({
            isAuthenticated: false,
            user: null,
            loading: false,
            sessionChecked: true,
            connectionStatus: 'online'
          });
        } catch (error) {
          const errorMessage = handleAuthError(error);
          set({
            error: errorMessage,
            loading: false,
            connectionStatus: navigator.onLine ? 'online' : 'offline'
          });
          throw new Error(errorMessage);
        }
      },

      updateUserRole: async (role: UserRole) => {
        try {
          const { user } = get();
          if (!user) throw new Error('Usuario no autenticado');

          set({ loading: true, error: null });

          const permissions = getDefaultPermissionsForRole(role);

          await updateUserMetadataLocal({
            role,
            permissions
          });

          set({
            user: { ...user, role, permissions },
            loading: false
          });
        } catch (error) {
          const errorMessage = handleAuthError(error);
          set({ error: errorMessage, loading: false });
          throw new Error(errorMessage);
        }
      },

      updateUserPreferences: async (preferences: Partial<AppUser['preferences']>) => {
        try {
          const { user } = get();
          if (!user) throw new Error('Usuario no autenticado');

          set({ loading: true, error: null });

          const updatedPreferences = { ...user.preferences, ...preferences };

          await updateUserMetadataLocal({
            preferences: updatedPreferences
          });

          set({
            user: { ...user, preferences: updatedPreferences },
            loading: false
          });
        } catch (error) {
          const errorMessage = handleAuthError(error);
          set({ error: errorMessage, loading: false });
          throw new Error(errorMessage);
        }
      },

      updateUserPermissions: async (permissions: Partial<AppUser['permissions']>) => {
        try {
          const { user } = get();
          if (!user) throw new Error('Usuario no autenticado');

          // Only admins can update permissions
          if (user.role !== 'admin') {
            throw new Error('No tienes permisos para realizar esta acción');
          }

          set({ loading: true, error: null });

          const updatedPermissions = { ...user.permissions, ...permissions };

          await updateUserMetadataLocal({
            permissions: updatedPermissions
          });

          set({
            user: { ...user, permissions: updatedPermissions },
            loading: false
          });
        } catch (error) {
          const errorMessage = handleAuthError(error);
          set({ error: errorMessage, loading: false });
          throw new Error(errorMessage);
        }
      },

      validateSession: async () => {
        try {
          const { data: { session }, error } = await getSupabaseSession();

          if (error) {
            console.error('Session validation error:', error);
            return false;
          }

          if (!session || !session.user) {
            return false;
          }

          // Check if session is expired
          const now = Math.floor(Date.now() / 1000);
          if (session.expires_at && session.expires_at < now) {
            console.log('Session expired, attempting refresh...');
            const { data: refreshData, error: refreshError } = await supabaseRefreshSession();

            if (refreshError || !refreshData.session) {
              console.error('Session refresh failed:', refreshError);
              return false;
            }
          }

          return true;
        } catch (error) {
          console.error('Session validation error:', error);
          return false;
        }
      },

      refreshSession: async () => {
        try {
          set({ loading: true, error: null, connectionStatus: 'reconnecting' });

          const { data, error } = await supabaseRefreshSession();

          if (error) throw error;

          if (data.session?.user) {
            const currentUser = get().user;
            const appUser = convertToAppUser(data.session.user, currentUser?.role || 'user');

            // Update last activity
            await updateUserMetadataLocal({
              lastActivity: new Date().toISOString()
            });

            set({
              isAuthenticated: true,
              user: appUser,
              loading: false,
              connectionStatus: 'online'
            });
          }
        } catch (error) {
          console.error('Error refreshing session:', error);
          set({
            loading: false,
            connectionStatus: navigator.onLine ? 'online' : 'offline'
          });
        }
      },

      checkConnection: async () => {
        try {
          const isOnline = await checkNetworkConnectivity();
          set({ connectionStatus: isOnline ? 'online' : 'offline' });
          return isOnline;
        } catch {
          set({ connectionStatus: 'offline' });
          return false;
        }
      },

      syncUserData: async () => {
        try {
          const { user } = get();
          if (!user) return;

          set({ loading: true });

          // Validate session first
          const isValidSession = await get().validateSession();
          if (!isValidSession) {
            set({
              isAuthenticated: false,
              user: null,
              loading: false,
              error: 'Sesión expirada. Por favor inicia sesión nuevamente.'
            });
            return;
          }

          // Get updated user data from Supabase
          const { data: { user: supabaseUser }, error } = await getSupabaseUser();

          if (error) throw error;

          if (supabaseUser) {
            const updatedUser = convertToAppUser(supabaseUser, user.role);

            // Update last activity
            await updateUserMetadata({
              lastActivity: new Date().toISOString()
            });

            set({ user: updatedUser, loading: false });
          }
        } catch (error) {
          console.error('Error syncing user data:', error);
          set({ loading: false });
        }
      },

      initializeAuth: async () => {
        try {
          set({ loading: true, error: null });

          // Crear cuentas demo por defecto
          await get().createDefaultAccounts();

          // Check network connectivity first
          const isOnline = await checkNetworkConnectivity();
          set({ connectionStatus: isOnline ? 'online' : 'offline' });

          if (!isOnline) {
            // If offline, check if we have cached user data
            const cachedUser = get().user;
            if (cachedUser) {
              set({
                isAuthenticated: true,
                loading: false,
                sessionChecked: true,
                connectionStatus: 'offline'
              });
              return;
            }
          }

          // Get current session
          const { data: { session }, error } = await supabase.auth.getSession();

          if (error) {
            console.error('Session error:', error);
            set({
              isAuthenticated: false,
              user: null,
              loading: false,
              sessionChecked: true,
              connectionStatus: isOnline ? 'online' : 'offline'
            });
            return;
          }

          if (session?.user) {
            try {
              const appUser = convertToAppUser(session.user);

              // Update last activity
              await updateUserMetadataLocal({
                lastActivity: new Date().toISOString()
              });

              set({
                isAuthenticated: true,
                user: appUser,
                loading: false,
                sessionChecked: true,
                connectionStatus: 'online'
              });
            } catch (conversionError) {
              console.error('User conversion error:', conversionError);
              // Clear invalid session
              await supabase.auth.signOut();
              set({
                isAuthenticated: false,
                user: null,
                loading: false,
                sessionChecked: true,
                connectionStatus: 'online'
              });
            }
          } else {
            set({
              isAuthenticated: false,
              user: null,
              loading: false,
              sessionChecked: true,
              connectionStatus: isOnline ? 'online' : 'offline'
            });
          }

          // Listen for auth changes
          supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
            console.log('Auth state change:', event, session?.user?.id);

            try {
              if (event === 'SIGNED_IN' && session?.user) {
                const appUser = convertToAppUser(session.user);

                // Update last login
                await updateUserMetadata({
                  lastLogin: new Date().toISOString(),
                  lastActivity: new Date().toISOString()
                });

                set({
                  isAuthenticated: true,
                  user: appUser,
                  sessionChecked: true,
                  connectionStatus: 'online'
                });
              } else if (event === 'SIGNED_OUT') {
                set({
                  isAuthenticated: false,
                  user: null,
                  sessionChecked: true,
                  connectionStatus: 'online'
                });
              } else if (event === 'TOKEN_REFRESHED' && session?.user) {
                const currentUser = get().user;
                const appUser = convertToAppUser(session.user, currentUser?.role || 'user');

                // Update last activity
                await updateUserMetadata({
                  lastActivity: new Date().toISOString()
                });

                set({
                  isAuthenticated: true,
                  user: appUser,
                  connectionStatus: 'online'
                });
              }
            } catch (error) {
              console.error('Auth state change error:', error);
              set({
                isAuthenticated: false,
                user: null,
                error: 'Error en el estado de autenticación',
                connectionStatus: 'offline'
              });
            }
          });

          // Set up periodic connection checks
          setInterval(async () => {
            await get().checkConnection();
          }, 30000); // Check every 30 seconds

          // Set up periodic session validation
          setInterval(async () => {
            const { isAuthenticated } = get();
            if (isAuthenticated) {
              const isValid = await get().validateSession();
              if (!isValid) {
                set({
                  isAuthenticated: false,
                  user: null,
                  error: 'Sesión expirada. Por favor inicia sesión nuevamente.'
                });
              }
            }
          }, 5 * 60 * 1000); // Check every 5 minutes

        } catch (error) {
          const errorMessage = handleAuthError(error);
          set({
            error: errorMessage,
            loading: false,
            isAuthenticated: false,
            user: null,
            sessionChecked: true,
            connectionStatus: 'offline'
          });
        }
      },

      clearError: () => set({ error: null }),

      createDefaultAccounts: async () => {
        try {
          console.log('createDefaultAccounts: delegating to supabaseAuth');
          if (!navigator.onLine) {
            console.log('createDefaultAccounts: offline, skipping');
            return;
          }
          const results = await createSupabaseDefaultAccounts();
          console.debug('createDefaultAccounts results:', results);
        } catch (error) {
          console.debug('createDefaultAccounts failed:', error);
        }
      },

      loginAsDefaultUser: async () => {
        try {
          set({ loading: true, error: null });

          const { data, error } = await signInWithPassword(DEFAULT_ACCOUNTS.user.email, DEFAULT_ACCOUNTS.user.password);
          console.debug('loginAsDefaultUser - signIn result:', { data, error });

          if (error) {
            // If account doesn't exist, create it
            if (error.message.includes('Invalid login credentials')) {
              await get().createDefaultAccounts();
              // Try login again
              const { data: retryData, error: retryError } = await signInWithPassword(DEFAULT_ACCOUNTS.user.email, DEFAULT_ACCOUNTS.user.password);

              console.debug('loginAsDefaultUser - retry signIn result:', { retryData, retryError });

              if (retryError) throw retryError;

              if (retryData.user) {
                const appUser = convertToAppUser(retryData.user, 'user');
                set({
                  isAuthenticated: true,
                  user: appUser,
                  loading: false,
                  error: null,
                  sessionChecked: true,
                  connectionStatus: 'online'
                });
              }
            } else {
              throw error;
            }
          } else if (data.user) {
            const appUser = convertToAppUser(data.user, 'user');
            set({
              isAuthenticated: true,
              user: appUser,
              loading: false,
              error: null,
              sessionChecked: true,
              connectionStatus: 'online'
            });
          }
        } catch (error) {
          const errorMessage = handleAuthError(error);
          const msg = (error as any)?.message || '';

          // Fallback to local demo session if offline or Supabase disallows login/signup
          if (!navigator.onLine || msg.includes('Invalid login credentials') || msg.includes('User not found') || msg.includes('Email not confirmed') || msg.includes('Signup is disabled')) {
            const appUser = buildLocalDemoAppUser('user');
            set({
              isAuthenticated: true,
              user: appUser as AppUser,
              loading: false,
              error: null,
              sessionChecked: true,
              connectionStatus: navigator.onLine ? 'online' : 'offline'
            });
            return;
          }

          set({
            error: errorMessage,
            loading: false,
            connectionStatus: navigator.onLine ? 'online' : 'offline'
          });
          throw new Error(errorMessage);
        }
      },

      loginAsDefaultAdmin: async () => {
        try {
          set({ loading: true, error: null });

          const { data, error } = await signInWithPassword(DEFAULT_ACCOUNTS.admin.email, DEFAULT_ACCOUNTS.admin.password);

          console.debug('loginAsDefaultAdmin - signIn result:', { data, error });

          if (error) {
            const msg = (error as any)?.message || '';
            // If account doesn't exist or other auth issue, try to create and retry
            if (msg.includes('Invalid login credentials') || msg.includes('User not found') || msg.includes('Signup is disabled')) {
              try {
                await get().createDefaultAccounts();
                // Try login again with admin credentials
                const signInResult = await signInWithPassword(DEFAULT_ACCOUNTS.admin.email, DEFAULT_ACCOUNTS.admin.password);

                if (signInResult.error) {
                  console.error('Error signing in (admin retry):', signInResult.error);
                } else if (signInResult.data.user) {
                  const appUser = convertToAppUser(signInResult.data.user, 'admin');
                  set({
                    isAuthenticated: true,
                    user: appUser,
                    loading: false,
                    error: null,
                    sessionChecked: true,
                    connectionStatus: 'online'
                  });
                  return;
                }
              } catch (e) {
                console.warn('Admin retry/signup failed, falling back to local demo session', e);
              }

              // If we reach here, fallback locally
              const appUser = buildLocalDemoAppUser('admin');
              set({
                isAuthenticated: true,
                user: appUser as AppUser,
                loading: false,
                error: null,
                sessionChecked: true,
                connectionStatus: navigator.onLine ? 'online' : 'offline'
              });
              return;
            } else {
              throw error;
            }
          } else if (data.user) {
            const appUser = convertToAppUser(data.user, 'admin');
            set({
              isAuthenticated: true,
              user: appUser,
              loading: false,
              error: null,
              sessionChecked: true,
              connectionStatus: 'online'
            });
          }
        } catch (error) {
          const errorMessage = handleAuthError(error);
          // On unexpected errors, attempt local fallback for admin
          const appUser = buildLocalDemoAppUser('admin');
          set({
            isAuthenticated: true,
            user: appUser as AppUser,
            loading: false,
            error: null,
            sessionChecked: true,
            connectionStatus: navigator.onLine ? 'online' : 'offline'
          });
          set({
            error: errorMessage,
            loading: false,
            connectionStatus: navigator.onLine ? 'online' : 'offline'
          });
          // don't rethrow because we already provided a demo session
        }
      },

    }),
    {
      name: 'auth-storage', // unique name
      getStorage: () => localStorage, // (optional) by default the storage is sessionStorage
    }
  )
);
