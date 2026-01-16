// Date formatting utilities
export function formatDate(date: string | Date, locale: string = 'es-ES'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function formatDateTime(date: string | Date, locale: string = 'es-ES'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatRelativeTime(date: string | Date, locale: string = 'es-ES'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Hace un momento';
  if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} minutos`;
  if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} horas`;
  if (diffInSeconds < 604800) return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
  
  return formatDate(dateObj, locale);
}

// Text formatting utilities
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

export function capitalizeFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

export function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format Ecuador phone numbers
  if (cleaned.startsWith('593')) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 4)} ${cleaned.slice(4, 8)} ${cleaned.slice(8)}`;
  }
  
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  
  return phone; // Return original if no pattern matches
}

// Pet status formatting
export function formatPetStatus(status: string): { label: string; color: string; icon: string } {
  const statusMap = {
    healthy: { label: 'Saludable', color: 'text-green-400', icon: '✅' },
    adoption: { label: 'En Adopción', color: 'text-blue-400', icon: '🏠' },
    lost: { label: 'Perdido', color: 'text-orange-400', icon: '🔍' },
    stolen: { label: 'Robado', color: 'text-red-400', icon: '🚨' },
    disoriented: { label: 'Desorientado', color: 'text-yellow-400', icon: '😵' },
  };
  
  return statusMap[status] || { label: status, color: 'text-gray-400', icon: '❓' };
}

// Post type formatting
export function formatPostType(type: string): { label: string; color: string; icon: string } {
  const typeMap = {
    general: { label: 'General', color: 'bg-blue-500', icon: '📝' },
    adoption: { label: 'En Adopción', color: 'bg-green-500', icon: '🏠' },
    lost: { label: 'Perdido', color: 'bg-orange-500', icon: '🔍' },
    stolen: { label: 'Robado', color: 'bg-red-500', icon: '🚨' },
    disoriented: { label: 'Desorientado', color: 'bg-yellow-500', icon: '😵' },
  };
  
  return typeMap[type] || { label: type, color: 'bg-gray-500', icon: '❓' };
}

// File size formatting
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Currency formatting
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}