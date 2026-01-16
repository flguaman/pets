/*
  # Agregar campo digital_id a la tabla pets

  1. Nuevo campo
    - `digital_id` (text, nullable, unique)
    - ID digital legible para identificación de mascotas (formato: MASC-XXXX-XXXX)
  
  2. Índices
    - Índice único en digital_id para búsquedas rápidas
    - Índice para búsqueda por digital_id
*/

-- Agregar columna digital_id a la tabla pets
ALTER TABLE pets 
ADD COLUMN IF NOT EXISTS digital_id text;

-- Crear índice único en digital_id para búsquedas rápidas y garantizar unicidad
CREATE UNIQUE INDEX IF NOT EXISTS pets_digital_id_idx ON pets(digital_id) 
WHERE digital_id IS NOT NULL;

-- Crear índice para búsqueda por digital_id
CREATE INDEX IF NOT EXISTS pets_digital_id_search_idx ON pets(digital_id);

-- Comentario en la columna para documentación
COMMENT ON COLUMN pets.digital_id IS 'ID digital legible para identificación de mascotas (formato: MASC-XXXX-XXXX)';

