/*
  # Estructura Consolidada de Supabase para Mascotas.ec
  
  Esta migración consolida y organiza toda la estructura de la base de datos:
  
  1. Tablas principales
  2. Campos y restricciones
  3. Políticas RLS (incluyendo permisos especiales para admin)
  4. Índices para optimización
  5. Funciones y triggers
  6. Configuración de seguridad
*/

-- ============================================================================
-- 1. TABLAS
-- ============================================================================

-- Tabla de mascotas
CREATE TABLE IF NOT EXISTS pets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  digital_id text UNIQUE,
  name text NOT NULL,
  owner text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  type text NOT NULL,
  breed text NOT NULL,
  age integer NOT NULL DEFAULT 1 CHECK (age >= 0 AND age <= 30),
  illness text DEFAULT '',
  observations text DEFAULT '',
  image_url text DEFAULT 'https://images.unsplash.com/photo-1552053831-71594a27632d',
  status text DEFAULT 'healthy' CHECK (status IN ('healthy', 'adoption', 'lost', 'stolen', 'disoriented')),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla de publicaciones
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  type text NOT NULL CHECK (type IN ('adoption', 'lost', 'stolen', 'disoriented', 'general')),
  pet_id uuid REFERENCES pets(id) ON DELETE SET NULL,
  image_url text,
  location text,
  contact_info text,
  reward text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'closed')),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 2. COMENTARIOS Y DOCUMENTACIÓN
-- ============================================================================

COMMENT ON TABLE pets IS 'Tabla principal para almacenar información de mascotas';
COMMENT ON COLUMN pets.digital_id IS 'ID digital legible para identificación de mascotas (formato: MASC-XXXX-XXXX)';
COMMENT ON COLUMN pets.status IS 'Estado de la mascota: healthy, adoption, lost, stolen, disoriented';
COMMENT ON TABLE posts IS 'Tabla para publicaciones de usuarios (adopción, perdidos, etc.)';

-- ============================================================================
-- 3. ÍNDICES PARA OPTIMIZACIÓN
-- ============================================================================

-- Índices para tabla pets
CREATE INDEX IF NOT EXISTS pets_user_id_idx ON pets(user_id);
CREATE INDEX IF NOT EXISTS pets_digital_id_idx ON pets(digital_id) WHERE digital_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS pets_name_idx ON pets(name);
CREATE INDEX IF NOT EXISTS pets_owner_idx ON pets(owner);
CREATE INDEX IF NOT EXISTS pets_type_idx ON pets(type);
CREATE INDEX IF NOT EXISTS pets_status_idx ON pets(status);
CREATE INDEX IF NOT EXISTS pets_created_at_idx ON pets(created_at DESC);
CREATE INDEX IF NOT EXISTS pets_user_status_idx ON pets(user_id, status);

-- Índices para tabla posts
CREATE INDEX IF NOT EXISTS posts_user_id_idx ON posts(user_id);
CREATE INDEX IF NOT EXISTS posts_type_idx ON posts(type);
CREATE INDEX IF NOT EXISTS posts_status_idx ON posts(status);
CREATE INDEX IF NOT EXISTS posts_created_at_idx ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS posts_pet_id_idx ON posts(pet_id);
CREATE INDEX IF NOT EXISTS posts_user_type_idx ON posts(user_id, type);

-- ============================================================================
-- 4. FUNCIONES
-- ============================================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para verificar si un usuario es administrador
CREATE OR REPLACE FUNCTION is_admin(user_uuid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = user_uuid
      AND raw_user_meta_data->>'role' = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para búsqueda de mascotas
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
      breed ILIKE '%' || search_term || '%' OR
      digital_id ILIKE '%' || search_term || '%'
    )
  ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener estadísticas de mascotas
CREATE OR REPLACE FUNCTION get_pet_statistics(user_uuid uuid)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total', COUNT(*),
    'byStatus', jsonb_object_agg(status, count),
    'byType', jsonb_object_agg(type, count),
    'recentCount', COUNT(*) FILTER (WHERE created_at > now() - interval '30 days')
  )
  INTO result
  FROM (
    SELECT status, type, COUNT(*) as count
    FROM pets
    WHERE user_id = user_uuid
    GROUP BY status, type
  ) subquery;
  
  RETURN COALESCE(result, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 5. TRIGGERS
-- ============================================================================

-- Trigger para actualizar updated_at en pets
DROP TRIGGER IF EXISTS update_pets_updated_at ON pets;
CREATE TRIGGER update_pets_updated_at
  BEFORE UPDATE ON pets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para actualizar updated_at en posts
DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Habilitar RLS en ambas tablas
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 7. POLÍTICAS RLS PARA PETS
-- ============================================================================

-- Eliminar políticas existentes para empezar limpio
DROP POLICY IF EXISTS "Users can manage their own pets" ON pets;
DROP POLICY IF EXISTS "Public can read pets" ON pets;
DROP POLICY IF EXISTS "Enable read access for all users" ON pets;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON pets;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON pets;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON pets;

-- Política 1: Lectura pública (necesaria para códigos QR)
CREATE POLICY "pets_select_public"
  ON pets FOR SELECT
  TO public
  USING (true);

-- Política 2: Los usuarios pueden leer sus propias mascotas
CREATE POLICY "pets_select_own"
  ON pets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Política 3: Los administradores pueden leer todas las mascotas
CREATE POLICY "pets_select_admin"
  ON pets FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

-- Política 4: Los usuarios pueden insertar sus propias mascotas
CREATE POLICY "pets_insert_own"
  ON pets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Política 5: Los administradores pueden insertar mascotas para cualquier usuario
CREATE POLICY "pets_insert_admin"
  ON pets FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));

-- Política 6: Los usuarios pueden actualizar sus propias mascotas
CREATE POLICY "pets_update_own"
  ON pets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política 7: Los administradores pueden actualizar cualquier mascota
CREATE POLICY "pets_update_admin"
  ON pets FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Política 8: Los usuarios pueden eliminar sus propias mascotas
CREATE POLICY "pets_delete_own"
  ON pets FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Política 9: Los administradores pueden eliminar cualquier mascota
CREATE POLICY "pets_delete_admin"
  ON pets FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));

-- ============================================================================
-- 8. POLÍTICAS RLS PARA POSTS
-- ============================================================================

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Enable read access for all users" ON posts;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON posts;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON posts;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON posts;

-- Política 1: Lectura pública
CREATE POLICY "posts_select_public"
  ON posts FOR SELECT
  TO public
  USING (true);

-- Política 2: Los usuarios pueden leer sus propias publicaciones
CREATE POLICY "posts_select_own"
  ON posts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Política 3: Los administradores pueden leer todas las publicaciones
CREATE POLICY "posts_select_admin"
  ON posts FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

-- Política 4: Los usuarios pueden insertar sus propias publicaciones
CREATE POLICY "posts_insert_own"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Política 5: Los administradores pueden insertar publicaciones
CREATE POLICY "posts_insert_admin"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));

-- Política 6: Los usuarios pueden actualizar sus propias publicaciones
CREATE POLICY "posts_update_own"
  ON posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política 7: Los administradores pueden actualizar cualquier publicación
CREATE POLICY "posts_update_admin"
  ON posts FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Política 8: Los usuarios pueden eliminar sus propias publicaciones
CREATE POLICY "posts_delete_own"
  ON posts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Política 9: Los administradores pueden eliminar cualquier publicación
CREATE POLICY "posts_delete_admin"
  ON posts FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));

-- ============================================================================
-- 9. VERIFICACIONES FINALES
-- ============================================================================

-- Verificar que RLS está habilitado
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'pets' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'posts' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

