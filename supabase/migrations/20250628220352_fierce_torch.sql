/*
  # Actualizar políticas de autenticación

  1. Políticas de seguridad
    - Permitir que usuarios autenticados gestionen sus propias mascotas
    - Mantener acceso público para lectura (códigos QR)
    - Agregar función para actualizar timestamp automáticamente

  2. Índices
    - Agregar índices para mejorar rendimiento de consultas
*/

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Users can manage their own pets" ON pets;
DROP POLICY IF EXISTS "Public can read pets" ON pets;

-- Política para que usuarios autenticados gestionen sus propias mascotas
CREATE POLICY "Users can manage their own pets"
  ON pets
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política para acceso público de lectura (para códigos QR)
CREATE POLICY "Public can read pets"
  ON pets
  FOR SELECT
  TO public
  USING (true);

-- Agregar índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS pets_user_id_idx ON pets(user_id);
CREATE INDEX IF NOT EXISTS pets_name_idx ON pets(name);
CREATE INDEX IF NOT EXISTS pets_owner_idx ON pets(owner);
CREATE INDEX IF NOT EXISTS pets_type_idx ON pets(type);
CREATE INDEX IF NOT EXISTS pets_status_idx ON pets(status);
CREATE INDEX IF NOT EXISTS pets_created_at_idx ON pets(created_at DESC);

-- Función para búsqueda de texto
CREATE OR REPLACE FUNCTION search_pets(search_term text, user_uuid uuid)
RETURNS SETOF pets AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM pets
  WHERE user_id = user_uuid
    AND (
      name ILIKE '%' || search_term || '%' OR
      owner ILIKE '%' || search_term || '%' OR
      type ILIKE '%' || search_term || '%' OR
      breed ILIKE '%' || search_term || '%'
    )
  ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;