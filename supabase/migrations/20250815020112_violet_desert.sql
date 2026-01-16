/*
  # Crear usuarios por defecto

  1. Nuevas funciones
    - Función para crear usuarios por defecto
    - Función para verificar si los usuarios existen
  
  2. Usuarios por defecto
    - Usuario demo: usuario@mascotas.ec
    - Administrador demo: admin@mascotas.ec
  
  3. Configuración
    - Permisos apropiados para cada rol
    - Preferencias por defecto
    - Estadísticas iniciales
*/

-- Función para crear usuarios por defecto si no existen
CREATE OR REPLACE FUNCTION create_default_users()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Crear usuario demo si no existe
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE email = 'usuario@mascotas.ec'
  ) THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'usuario@mascotas.ec',
      crypt('usuario123', gen_salt('bf')),
      now(),
      '{"provider": "email", "providers": ["email"]}',
      jsonb_build_object(
        'name', 'Usuario Demo',
        'role', 'user',
        'permissions', jsonb_build_object(
          'canCreatePets', false,
          'canEditPets', false,
          'canDeletePets', false,
          'canManageUsers', false,
          'canViewAnalytics', false,
          'canModerateContent', false
        ),
        'preferences', jsonb_build_object(
          'notifications', true,
          'emailUpdates', true,
          'publicProfile', false,
          'language', 'es',
          'theme', 'dark'
        ),
        'stats', jsonb_build_object(
          'petsCreated', 0,
          'postsCreated', 0,
          'joinDate', now(),
          'lastActivity', now()
        )
      ),
      now(),
      now(),
      '',
      '',
      '',
      ''
    );
  END IF;

  -- Crear administrador demo si no existe
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE email = 'admin@mascotas.ec'
  ) THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'admin@mascotas.ec',
      crypt('admin123', gen_salt('bf')),
      now(),
      '{"provider": "email", "providers": ["email"]}',
      jsonb_build_object(
        'name', 'Administrador Demo',
        'role', 'admin',
        'permissions', jsonb_build_object(
          'canCreatePets', true,
          'canEditPets', true,
          'canDeletePets', true,
          'canManageUsers', true,
          'canViewAnalytics', true,
          'canModerateContent', true
        ),
        'preferences', jsonb_build_object(
          'notifications', true,
          'emailUpdates', true,
          'publicProfile', false,
          'language', 'es',
          'theme', 'dark'
        ),
        'stats', jsonb_build_object(
          'petsCreated', 0,
          'postsCreated', 0,
          'joinDate', now(),
          'lastActivity', now()
        )
      ),
      now(),
      now(),
      '',
      '',
      '',
      ''
    );
  END IF;
END;
$$;

-- Ejecutar la función para crear usuarios por defecto
SELECT create_default_users();