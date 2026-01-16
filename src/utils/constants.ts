// Application constants
export const APP_CONFIG = {
  NAME: 'Mascotas.ec',
  VERSION: '1.0.0',
  DESCRIPTION: 'Sistema de identificación digital para mascotas',
  SUPPORT_EMAIL: 'soporte@mascotas.ec',
  WEBSITE: 'https://mascotas.ec'
} as const;

// Database constants
export const DB_CONFIG = {
  CACHE_DURATION: {
    ONLINE: 5 * 60 * 1000, // 5 minutes
    OFFLINE: 30 * 60 * 1000, // 30 minutes
  },
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  BATCH_SIZE: 50,
} as const;

// UI constants
export const UI_CONFIG = {
  MOBILE_BREAKPOINT: 640,
  TABLET_BREAKPOINT: 768,
  DESKTOP_BREAKPOINT: 1024,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
} as const;

// QR Code constants
export const QR_CONFIG = {
  SIZES: {
    SMALL: 128,
    MEDIUM: 256,
    LARGE: 512,
  },
  LEVELS: ['L', 'M', 'Q', 'H'] as const,
  DEFAULT_LEVEL: 'H' as const,
  MARGIN: true,
} as const;

// Pet status constants
export const PET_STATUS = {
  HEALTHY: 'healthy',
  ADOPTION: 'adoption',
  LOST: 'lost',
  STOLEN: 'stolen',
  DISORIENTED: 'disoriented',
} as const;

// Post type constants
export const POST_TYPES = {
  GENERAL: 'general',
  ADOPTION: 'adoption',
  LOST: 'lost',
  STOLEN: 'stolen',
  DISORIENTED: 'disoriented',
} as const;

// User roles
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
} as const;

// Default permissions
export const DEFAULT_PERMISSIONS = {
  [USER_ROLES.USER]: {
    canCreatePets: false,
    canEditPets: false,
    canDeletePets: false,
    canManageUsers: false,
    canViewAnalytics: false,
    canModerateContent: false,
  },
  [USER_ROLES.ADMIN]: {
    canCreatePets: true,
    canEditPets: true,
    canDeletePets: true,
    canManageUsers: true,
    canViewAnalytics: true,
    canModerateContent: true,
  },
} as const;

// Default preferences
export const DEFAULT_PREFERENCES = {
  notifications: true,
  emailUpdates: true,
  publicProfile: false,
  language: 'es' as const,
  theme: 'dark' as const,
} as const;

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Error de conexión. Verifica tu conexión a internet.',
  AUTH_ERROR: 'Error de autenticación. Por favor inicia sesión nuevamente.',
  PERMISSION_ERROR: 'No tienes permisos para realizar esta acción.',
  VALIDATION_ERROR: 'Los datos proporcionados no son válidos.',
  NOT_FOUND: 'El recurso solicitado no fue encontrado.',
  SERVER_ERROR: 'Error del servidor. Intenta nuevamente más tarde.',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  PET_CREATED: 'Mascota creada exitosamente',
  PET_UPDATED: 'Mascota actualizada exitosamente',
  PET_DELETED: 'Mascota eliminada exitosamente',
  POST_CREATED: 'Publicación creada exitosamente',
  POST_UPDATED: 'Publicación actualizada exitosamente',
  POST_DELETED: 'Publicación eliminada exitosamente',
  PROFILE_UPDATED: 'Perfil actualizado exitosamente',
} as const;