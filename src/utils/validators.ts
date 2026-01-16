import { Pet } from '../types';
import { Post } from '../types/post';

// UUID validation
export function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

// Email validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Phone validation (Ecuador format)
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+593|0)[0-9]{9}$/;
  return phoneRegex.test(phone.replace(/\s|-/g, ''));
}

// Pet data validation
export interface PetValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validatePetData(pet: Partial<Pet>): PetValidationResult {
  const errors: string[] = [];

  // Required fields
  if (!pet.name?.trim()) errors.push('El nombre es requerido');
  if (!pet.owner?.trim()) errors.push('El dueño es requerido');
  if (!pet.phone?.trim()) errors.push('El teléfono es requerido');
  if (!pet.address?.trim()) errors.push('La dirección es requerida');
  if (!pet.type?.trim()) errors.push('El tipo es requerido');
  if (!pet.breed?.trim()) errors.push('La raza es requerida');

  // Age validation
  if (pet.age === undefined || pet.age < 0 || pet.age > 30) {
    errors.push('La edad debe estar entre 0 y 30 años');
  }

  // Phone validation
  if (pet.phone && !isValidPhone(pet.phone)) {
    errors.push('El formato del teléfono no es válido');
  }

  // Name length validation
  if (pet.name && pet.name.length > 50) {
    errors.push('El nombre no puede exceder 50 caracteres');
  }

  // Owner name validation
  if (pet.owner && pet.owner.length > 100) {
    errors.push('El nombre del dueño no puede exceder 100 caracteres');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Post data validation
export interface PostValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validatePostData(post: Partial<Post>): PostValidationResult {
  const errors: string[] = [];

  // Required fields
  if (!post.title?.trim()) errors.push('El título es requerido');
  if (!post.description?.trim()) errors.push('La descripción es requerida');
  if (!post.type?.trim()) errors.push('El tipo es requerido');

  // Length validations
  if (post.title && post.title.length > 200) {
    errors.push('El título no puede exceder 200 caracteres');
  }

  if (post.description && post.description.length > 2000) {
    errors.push('La descripción no puede exceder 2000 caracteres');
  }

  // URL validation
  if (post.image_url && !isValidURL(post.image_url)) {
    errors.push('La URL de la imagen no es válida');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// URL validation
export function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Password strength validation
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score += 1;
  else feedback.push('Debe tener al menos 8 caracteres');

  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Debe incluir letras minúsculas');

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Debe incluir letras mayúsculas');

  if (/[0-9]/.test(password)) score += 1;
  else feedback.push('Debe incluir números');

  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  else feedback.push('Debe incluir caracteres especiales');

  return {
    isValid: score >= 3 && password.length >= 6,
    score,
    feedback
  };
}