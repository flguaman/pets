# Estructura de Base de Datos - Mascotas.ec

## 📋 Resumen

Esta carpeta contiene todas las migraciones de Supabase para el sistema de gestión de mascotas. La estructura está organizada y optimizada para permitir que los administradores gestionen todas las mascotas mientras que los usuarios regulares solo pueden gestionar las suyas.

## 🗂️ Estructura de Migraciones

### Migraciones Base
1. **20250628210430_hidden_fire.sql** - Creación inicial de tabla `pets`
2. **20250628220352_fierce_torch.sql** - Índices y función de búsqueda
3. **20250628221205_rapid_cloud.sql** - Corrección de políticas RLS
4. **20250628231102_sunny_heart.sql** - Creación de tabla `posts`
5. **20250815020112_violet_desert.sql** - Usuarios por defecto

### Migraciones Recientes
6. **20250120000000_add_digital_id.sql** - Agregar campo `digital_id` a pets
7. **20250120000001_consolidate_structure.sql** - **ESTRUCTURA CONSOLIDADA** ⭐

## ⚠️ Importante: Migración Consolidada

La migración `20250120000001_consolidate_structure.sql` consolida toda la estructura y debe aplicarse después de las migraciones anteriores. Esta migración:

- ✅ Organiza todas las políticas RLS
- ✅ Agrega permisos especiales para administradores
- ✅ Optimiza índices
- ✅ Crea funciones útiles
- ✅ Documenta la estructura completa

## 🔐 Permisos y Roles

### Usuario Regular
- ✅ Puede crear, leer, actualizar y eliminar sus propias mascotas
- ✅ Puede crear, leer, actualizar y eliminar sus propias publicaciones
- ✅ Puede leer todas las mascotas (para códigos QR)

### Administrador
- ✅ Puede hacer TODO lo que un usuario regular puede hacer
- ✅ **Puede leer TODAS las mascotas** (sin restricción de user_id)
- ✅ **Puede crear mascotas para cualquier usuario**
- ✅ **Puede actualizar cualquier mascota**
- ✅ **Puede eliminar cualquier mascota**
- ✅ **Puede gestionar todas las publicaciones**

## 📊 Estructura de Tablas

### Tabla `pets`
```sql
- id (uuid, PK)
- digital_id (text, UNIQUE) - ID digital legible
- name (text, NOT NULL)
- owner (text, NOT NULL)
- phone (text, NOT NULL)
- address (text, NOT NULL)
- type (text, NOT NULL)
- breed (text, NOT NULL)
- age (integer, 0-30)
- illness (text)
- observations (text)
- image_url (text)
- status (text: healthy, adoption, lost, stolen, disoriented)
- user_id (uuid, FK -> auth.users)
- created_at (timestamptz)
- updated_at (timestamptz)
```

### Tabla `posts`
```sql
- id (uuid, PK)
- title (text, NOT NULL)
- description (text, NOT NULL)
- type (text: adoption, lost, stolen, disoriented, general)
- pet_id (uuid, FK -> pets, nullable)
- image_url (text)
- location (text)
- contact_info (text)
- reward (text)
- status (text: active, resolved, closed)
- user_id (uuid, FK -> auth.users)
- created_at (timestamptz)
- updated_at (timestamptz)
```

## 🔍 Funciones Disponibles

### `is_admin(user_uuid uuid)`
Verifica si un usuario tiene rol de administrador.

### `search_pets(search_term text, user_uuid uuid)`
Busca mascotas por término de búsqueda (nombre, dueño, tipo, raza, digital_id).

### `get_pet_statistics(user_uuid uuid)`
Obtiene estadísticas de mascotas de un usuario (total, por estado, por tipo, recientes).

### `update_updated_at_column()`
Función trigger para actualizar automáticamente `updated_at`.

## 📈 Índices Optimizados

### Tabla `pets`
- `pets_user_id_idx` - Búsqueda por usuario
- `pets_digital_id_idx` - Búsqueda por ID digital (único)
- `pets_name_idx` - Búsqueda por nombre
- `pets_owner_idx` - Búsqueda por dueño
- `pets_type_idx` - Filtrado por tipo
- `pets_status_idx` - Filtrado por estado
- `pets_created_at_idx` - Ordenamiento por fecha
- `pets_user_status_idx` - Búsqueda compuesta usuario + estado

### Tabla `posts`
- `posts_user_id_idx` - Búsqueda por usuario
- `posts_type_idx` - Filtrado por tipo
- `posts_status_idx` - Filtrado por estado
- `posts_created_at_idx` - Ordenamiento por fecha
- `posts_pet_id_idx` - Relación con mascotas
- `posts_user_type_idx` - Búsqueda compuesta usuario + tipo

## 🚀 Cómo Aplicar las Migraciones

### Opción 1: Supabase Dashboard
1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **SQL Editor**
3. Copia y pega el contenido de cada migración en orden
4. Ejecuta cada migración

### Opción 2: Supabase CLI
```bash
# Aplicar todas las migraciones
supabase db push

# O aplicar una migración específica
supabase migration up
```

### Opción 3: Manualmente
Ejecuta las migraciones en este orden:
1. Todas las migraciones base (20250628...)
2. 20250815020112_violet_desert.sql (usuarios por defecto)
3. 20250120000000_add_digital_id.sql (campo digital_id)
4. **20250120000001_consolidate_structure.sql** (estructura consolidada) ⭐

## ⚙️ Configuración de Usuarios Admin

Para que un usuario sea administrador, debe tener en `raw_user_meta_data`:
```json
{
  "role": "admin"
}
```

Esto se puede configurar en:
- Supabase Dashboard → Authentication → Users → Edit User → User Metadata
- O mediante código al crear el usuario

## 🔒 Seguridad

- ✅ Row Level Security (RLS) habilitado en todas las tablas
- ✅ Políticas separadas para usuarios regulares y administradores
- ✅ Función `is_admin()` con `SECURITY DEFINER` para verificación segura
- ✅ Acceso público solo para lectura (necesario para códigos QR)
- ✅ Todas las operaciones de escritura requieren autenticación

## 📝 Notas Importantes

1. **La migración consolidada es idempotente**: Puede ejecutarse múltiples veces sin problemas
2. **Los índices se crean con `IF NOT EXISTS`**: No causarán errores si ya existen
3. **Las políticas se eliminan antes de crearse**: Evita duplicados
4. **El campo `digital_id` es único pero nullable**: Permite compatibilidad con datos existentes

## 🐛 Solución de Problemas

### Error: "policy already exists"
La migración consolidada elimina políticas existentes antes de crearlas. Si persiste el error, ejecuta manualmente:
```sql
DROP POLICY IF EXISTS "nombre_politica" ON tabla;
```

### Error: "index already exists"
Los índices usan `IF NOT EXISTS`, pero si hay conflicto:
```sql
DROP INDEX IF EXISTS nombre_indice;
```

### Verificar permisos de admin
```sql
SELECT id, email, raw_user_meta_data->>'role' as role
FROM auth.users
WHERE raw_user_meta_data->>'role' = 'admin';
```

## 📞 Soporte

Para más información sobre la estructura de la base de datos, consulta:
- [Documentación de Supabase](https://supabase.com/docs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

