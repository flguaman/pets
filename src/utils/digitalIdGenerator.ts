/**
 * Generates a unique, human-readable digital ID for pets
 * Format: MASC-XXXX-XXXX where XXXX is alphanumeric
 */
export function generateDigitalId(): string {
  const prefix = 'MASC';
  const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Validates if a string is a valid digital ID format
 */
export function isValidDigitalId(id: string): boolean {
  const pattern = /^MASC-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
  return pattern.test(id);
}

/**
 * Formats a UUID to a more readable format (optional, for display)
 */
export function formatPetId(id: string): string {
  if (isValidDigitalId(id)) {
    return id;
  }
  // If it's a UUID, show first 8 characters
  return id.substring(0, 8).toUpperCase();
}

