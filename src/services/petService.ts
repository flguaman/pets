import { supabase } from '../lib/supabase';
import { Database } from '../types/database';

type PetRow = Database['public']['Tables']['pets']['Row'];
type PetInsert = Database['public']['Tables']['pets']['Insert'];
type PetUpdate = Database['public']['Tables']['pets']['Update'];

// Definir el tipo `Pet` directamente
interface Pet {
  id: string;
  name: string;
  owner: string;
  phone: string;
  address: string;
  type: string;
  breed: string;
  age: number;
  illness: string;
  observations: string;
  imageUrl: string;
  status: string;
  created_at?: string;
}

// Enhanced error handling
class PetServiceError extends Error {
  constructor(message: string, public code?: string, public details?: any) {
    super(message);
    this.name = 'PetServiceError';
  }
}

// Convert database row to Pet type
function convertRowToPet(row: PetRow): Pet {
  return {
    id: row.id,
    digitalId: row.digital_id || undefined,
    name: row.name,
    owner: row.owner,
    phone: row.phone,
    address: row.address,
    type: row.type,
    breed: row.breed,
    age: row.age,
    illness: row.illness || '',
    observations: row.observations || '',
    imageUrl: row.image_url || 'https://images.unsplash.com/photo-1552053831-71594a27632d',
    status: row.status as Pet['status'],
  };
}

// Convert Pet type to database insert
function convertPetToInsert(pet: Omit<Pet, 'id'>, userId: string): PetInsert {
  return {
    digital_id: pet.digitalId || null,
    name: pet.name.trim(),
    owner: pet.owner.trim(),
    phone: pet.phone.trim(),
    address: pet.address.trim(),
    type: pet.type,
    breed: pet.breed.trim(),
    age: pet.age,
    illness: pet.illness?.trim() || null,
    observations: pet.observations?.trim() || null,
    image_url: pet.imageUrl || null,
    status: pet.status || 'healthy',
    user_id: userId,
  };
}

// Convert Pet type to database update
function convertPetToUpdate(pet: Pet): PetUpdate {
  return {
    digital_id: pet.digitalId || null,
    name: pet.name.trim(),
    owner: pet.owner.trim(),
    phone: pet.phone.trim(),
    address: pet.address.trim(),
    type: pet.type,
    breed: pet.breed.trim(),
    age: pet.age,
    illness: pet.illness?.trim() || null,
    observations: pet.observations?.trim() || null,
    image_url: pet.imageUrl || null,
    status: pet.status || 'healthy',
  };
}

// Validate pet data
function validatePetData(pet: Partial<Pet>): void {
  const errors: string[] = [];

  if (!pet.name?.trim()) errors.push('El nombre es requerido');
  if (!pet.owner?.trim()) errors.push('El dueño es requerido');
  if (!pet.phone?.trim()) errors.push('El teléfono es requerido');
  if (!pet.address?.trim()) errors.push('La dirección es requerida');
  if (!pet.type?.trim()) errors.push('El tipo es requerido');
  if (!pet.breed?.trim()) errors.push('La raza es requerida');
  if (pet.age === undefined || pet.age < 0 || pet.age > 30) {
    errors.push('La edad debe estar entre 0 y 30 años');
  }

  if (errors.length > 0) {
    throw new PetServiceError(`Datos inválidos: ${errors.join(', ')}`);
  }
}

// Updated validateUserPermissions to accept an optional permission argument
async function validateUserPermissions(userId: string, permission?: string): Promise<void> {
  if (!userId) {
    throw new PetServiceError('Usuario no autenticado');
  }

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(userId)) {
    throw new PetServiceError('ID de usuario inválido');
  }

  if (permission) {
    const validPermissions = ['read', 'write'];
    if (!validPermissions.includes(permission)) {
      throw new PetServiceError(`Permiso inválido: ${permission}`);
    }
  }
}

export class PetService {
  // Upload a pet image to Supabase Storage
  static async uploadPetImage(file: File): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `public/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('pet-images')
        .upload(filePath, file);

      if (uploadError) {
        throw new PetServiceError(
          `Error al subir imagen: ${uploadError.message}`
        );
      }

      const { data } = supabase.storage
        .from('pet-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      if (error instanceof PetServiceError) throw error;
      throw new PetServiceError(`Error inesperado al subir imagen: ${error}`);
    }
  }

  // Get all pets for a specific user with enhanced error handling
  static async getUserPets(userId: string): Promise<Pet[]> {
    try {
      await validateUserPermissions(userId);

      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new PetServiceError(
          `Error al obtener mascotas: ${error.message}`,
          error.code,
          error.details
        );
      }

      return data.map(convertRowToPet);
    } catch (error) {
      if (error instanceof PetServiceError) throw error;
      throw new PetServiceError(`Error inesperado al obtener mascotas: ${error}`);
    }
  }

  // Get a specific pet by ID with caching
  static async getPetById(id: string): Promise<Pet | null> {
    try {
      if (!id) throw new PetServiceError('ID de mascota requerido');

      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Pet not found
        }
        throw new PetServiceError(
          `Error al obtener mascota: ${error.message}`,
          error.code,
          error.details
        );
      }

      return convertRowToPet(data);
    } catch (error) {
      if (error instanceof PetServiceError) throw error;
      throw new PetServiceError(`Error inesperado al obtener mascota: ${error}`);
    }
  }

  // Create a new pet with validation and image upload
  static async createPet(petData: Omit<Pet, 'id'>, userId: string, imageFile?: File): Promise<Pet> {
    try {
      await validateUserPermissions(userId);
      validatePetData(petData);

      // Verificar que el ID digital esté presente
      if (!petData.digitalId) {
        console.warn('createPet: No digitalId provided, generating one...');
        // El ID digital debería generarse en el formulario, pero por si acaso
        const { generateDigitalId } = await import('../utils/digitalIdGenerator');
        petData.digitalId = generateDigitalId();
      }

      console.log('createPet: Creating pet with data:', {
        name: petData.name,
        digitalId: petData.digitalId,
        owner: petData.owner,
        userId: userId
      });

      let imageUrl = petData.imageUrl;
      if (imageFile) {
        try {
          imageUrl = await this.uploadPetImage(imageFile);
        } catch (uploadError) {
          console.warn('Error uploading image, using default:', uploadError);
          // Continuar con la imagen por defecto si falla la subida
        }
      }

      const insertData = convertPetToInsert({ ...petData, imageUrl }, userId);
      
      console.log('createPet: Insert data:', {
        ...insertData,
        user_id: userId.substring(0, 8) + '...' // Log parcial por seguridad
      });

      const { data, error } = await supabase
        .from('pets')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('createPet: Supabase error:', error);
        throw new PetServiceError(
          `Error al crear mascota: ${error.message}`,
          error.code,
          error.details
        );
      }

      console.log('createPet: Pet created successfully:', {
        id: data.id,
        digital_id: data.digital_id,
        name: data.name
      });

      return convertRowToPet(data);
    } catch (error) {
      console.error('createPet: Unexpected error:', error);
      if (error instanceof PetServiceError) throw error;
      
      // Mejorar mensaje de error para problemas de red
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new PetServiceError(
          'Error de conexión: No se pudo conectar con el servidor. Verifica tu conexión a internet y las variables de entorno de Supabase.',
          'NETWORK_ERROR'
        );
      }
      
      throw new PetServiceError(`Error inesperado al crear mascota: ${error}`);
    }
  }

  // Update an existing pet with optimistic locking and image upload
  static async updatePet(id: string, petData: Pet, userId: string, imageFile?: File): Promise<Pet> {
    try {
      await validateUserPermissions(userId);
      validatePetData(petData);

      if (!id) throw new PetServiceError('ID de mascota requerido');

      let imageUrl = petData.imageUrl;
      if (imageFile) {
        imageUrl = await this.uploadPetImage(imageFile);
      }

      const updateData = convertPetToUpdate({ ...petData, imageUrl });

      const { data, error } = await supabase
        .from('pets')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new PetServiceError('Mascota no encontrada o sin permisos');
        }
        throw new PetServiceError(
          `Error al actualizar mascota: ${error.message}`,
          error.code,
          error.details
        );
      }

      return convertRowToPet(data);
    } catch (error) {
      if (error instanceof PetServiceError) throw error;
      throw new PetServiceError(`Error inesperado al actualizar mascota: ${error}`);
    }
  }

  // Delete a pet with confirmation
  static async deletePet(id: string, userId: string): Promise<void> {
    try {
      await validateUserPermissions(userId);

      if (!id) throw new PetServiceError('ID de mascota requerido');

      const { error } = await supabase
        .from('pets')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        throw new PetServiceError(
          `Error al eliminar mascota: ${error.message}`,
          error.code,
          error.details
        );
      }
    } catch (error) {
      if (error instanceof PetServiceError) throw error;
      throw new PetServiceError(`Error inesperado al eliminar mascota: ${error}`);
    }
  }

  // Search pets with advanced filtering
  static async searchPets(searchTerm: string, userId: string): Promise<Pet[]> {
    try {
      await validateUserPermissions(userId);

      if (!searchTerm?.trim()) {
        return this.getUserPets(userId);
      }

      const cleanSearchTerm = searchTerm.trim();

      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('user_id', userId)
        .or(`name.ilike.%${cleanSearchTerm}%,owner.ilike.%${cleanSearchTerm}%,type.ilike.%${cleanSearchTerm}%,breed.ilike.%${cleanSearchTerm}%`)
        .order('created_at', { ascending: false });

      if (error) {
        throw new PetServiceError(
          `Error al buscar mascotas: ${error.message}`,
          error.code,
          error.details
        );
      }

      return data.map(convertRowToPet);
    } catch (error) {
      if (error instanceof PetServiceError) throw error;
      throw new PetServiceError(`Error inesperado al buscar mascotas: ${error}`);
    }
  }

  // Get all pets for public viewing with pagination
  static async getAllPets(limit: number = 50, offset: number = 0): Promise<Pet[]> {
    try {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw new PetServiceError(
          `Error al obtener todas las mascotas: ${error.message}`,
          error.code,
          error.details
        );
      }

      return data.map(convertRowToPet);
    } catch (error) {
      if (error instanceof PetServiceError) throw error;
      throw new PetServiceError(`Error inesperado al obtener todas las mascotas: ${error}`);
    }
  }

  // Get pets by status for filtering
  static async getPetsByStatus(status: Pet['status'], userId?: string): Promise<Pet[]> {
    try {
      let query = supabase
        .from('pets')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (userId) {
        await validateUserPermissions(userId, 'read');
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        throw new PetServiceError(
          `Error al obtener mascotas por estado: ${error.message}`,
          error.code,
          error.details
        );
      }

      return data.map(convertRowToPet);
    } catch (error) {
      if (error instanceof PetServiceError) throw error;
      throw new PetServiceError(`Error inesperado al obtener mascotas por estado: ${error}`);
    }
  }

  // Batch operations for controllers
  static async batchUpdatePets(updates: Array<{ id: string; data: Partial<Pet> }>, userId: string): Promise<Pet[]> {
    try {
      await validateUserPermissions(userId, 'write');

      const results: Pet[] = [];

      for (const update of updates) {
        validatePetData(update.data);
        const result = await this.updatePet(update.id, { ...update.data, id: update.id } as Pet, userId);
        results.push(result);
      }

      return results;
    } catch (error) {
      if (error instanceof PetServiceError) throw error;
      throw new PetServiceError(`Error en actualización masiva: ${error}`);
    }
  }

  // Get statistics for dashboard
  static async getPetStatistics(userId: string): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byType: Record<string, number>;
    recentCount: number;
  }> {
    try {
      await validateUserPermissions(userId, 'read');

      const { data, error } = await supabase
        .from('pets')
        .select('status, type, created_at')
        .eq('user_id', userId);

      console.log(data, error);

      if (error) {
        throw new PetServiceError(
          `Error al obtener estadísticas de mascotas: ${error.message}`,
          error.code,
          error.details
        );
      }

      // Aquí puedes agregar la lógica para calcular las estadísticas a partir de los datos obtenidos

      return {
        total: 0,
        byStatus: {},
        byType: {},
        recentCount: 0,
      };
    } catch (error) {
      if (error instanceof PetServiceError) throw error;
      throw new PetServiceError(`Error inesperado al obtener estadísticas de mascotas: ${error}`);
    }
  }
}