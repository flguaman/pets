# ✅ Estructura de Supabase Consolidada - Mascotas.ec

## 🎯 Resumen de Cambios

Se ha consolidado y organizado toda la estructura de Supabase con las siguientes mejoras:

### ✨ Características Principales

1. **Políticas RLS Organizadas**
   - Políticas separadas para usuarios regulares y administradores
   - Acceso público para lectura (códigos QR)
   - Permisos especiales para administradores

2. **Campo `digital_id` Agregado**
   - Campo único para IDs digitales legibles
   - Índice optimizado para búsquedas rápidas
   - Compatible con datos existentes (nullable)

3. **Funciones Útiles**
   - `is_admin()` - Verifica si un usuario es administrador
   - `search_pets()` - Búsqueda avanzada de mascotas
   - `get_pet_statistics()` - Estadísticas de mascotas

4. **Índices Optimizados**
   - Índices en campos clave para mejor rendimiento
   - Índices compuestos para consultas complejas
   - Índice único en `digital_id`

## 📋 Estructura de Permisos

### Usuario Regular
```
✅ SELECT: Solo sus propias mascotas
✅ INSERT: Solo sus propias mascotas
✅ UPDATE: Solo sus propias mascotas
✅ DELETE: Solo sus propias mascotas
✅ SELECT (public): Todas las mascotas (para QR)
```

### Administrador
```
✅ SELECT: TODAS las mascotas (sin restricción)
✅ INSERT: Mascotas para cualquier usuario
✅ UPDATE: Cualquier mascota
✅ DELETE: Cualquier mascota
✅ SELECT (public): Todas las mascotas (para QR)
```

## 🔧 Cómo Aplicar

### Paso 1: Aplicar Migración Consolidada

Ejecuta en Supabase SQL Editor:

```sql
-- Copia y pega el contenido completo de:
-- supabase/migrations/20250120000001_consolidate_structure.sql
```

### Paso 2: Verificar Aplicación

```sql
-- Verificar que las políticas existen
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('pets', 'posts')
ORDER BY tablename, policyname;

-- Verificar que el campo digital_id existe
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'pets' AND column_name = 'digital_id';

-- Verificar función is_admin
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'is_admin';
```

### Paso 3: Verificar Usuario Admin

```sql
-- Ver usuarios admin
SELECT 
  id, 
  email, 
  raw_user_meta_data->>'role' as role,
  raw_user_meta_data->>'name' as name
FROM auth.users
WHERE raw_user_meta_data->>'role' = 'admin';
```

## 🧪 Pruebas

### Probar Permisos de Admin

1. **Como Admin - Ver todas las mascotas:**
```sql
-- Debe retornar TODAS las mascotas, no solo las del admin
SELECT * FROM pets;
```

2. **Como Admin - Crear mascota para otro usuario:**
```sql
-- Debe permitir insertar con cualquier user_id
INSERT INTO pets (name, owner, phone, address, type, breed, age, user_id)
VALUES ('Test Pet', 'Test Owner', '123456', 'Test Address', 'Perro', 'Test', 1, 'otro-user-id');
```

3. **Como Usuario Regular - Solo sus mascotas:**
```sql
-- Solo debe retornar mascotas del usuario autenticado
SELECT * FROM pets;
```

## 📊 Políticas RLS Creadas

### Tabla `pets` (9 políticas)
- `pets_select_public` - Lectura pública
- `pets_select_own` - Usuarios ven sus mascotas
- `pets_select_admin` - Admins ven todas
- `pets_insert_own` - Usuarios crean sus mascotas
- `pets_insert_admin` - Admins crean para cualquiera
- `pets_update_own` - Usuarios actualizan sus mascotas
- `pets_update_admin` - Admins actualizan cualquiera
- `pets_delete_own` - Usuarios eliminan sus mascotas
- `pets_delete_admin` - Admins eliminan cualquiera

### Tabla `posts` (9 políticas)
- Misma estructura que `pets`

## 🔍 Funciones Disponibles

### `is_admin(user_uuid uuid)`
```sql
SELECT is_admin('user-uuid-here');
-- Retorna: true/false
```

### `search_pets(search_term text, user_uuid uuid)`
```sql
SELECT * FROM search_pets('Max', 'user-uuid-here');
-- Busca en: name, owner, type, breed, digital_id
```

### `get_pet_statistics(user_uuid uuid)`
```sql
SELECT get_pet_statistics('user-uuid-here');
-- Retorna: JSON con estadísticas
```

## ⚠️ Notas Importantes

1. **La migración es idempotente**: Puede ejecutarse múltiples veces
2. **No afecta datos existentes**: Solo agrega estructura
3. **Compatible con código existente**: No requiere cambios en el frontend
4. **Las políticas se aplican automáticamente**: No requiere cambios en las consultas

## 🚨 Solución de Problemas

### Error: "permission denied"
- Verifica que el usuario esté autenticado
- Verifica que el usuario tenga el rol correcto en `raw_user_meta_data`

### Error: "policy already exists"
- La migración elimina políticas antes de crearlas
- Si persiste, ejecuta manualmente: `DROP POLICY IF EXISTS ...`

### Los admins no ven todas las mascotas
- Verifica que `raw_user_meta_data->>'role' = 'admin'`
- Verifica que la función `is_admin()` esté creada
- Verifica que la política `pets_select_admin` exista

## 📝 Checklist de Aplicación

- [ ] Migración consolidada aplicada
- [ ] Campo `digital_id` existe en tabla `pets`
- [ ] Función `is_admin()` creada
- [ ] Todas las políticas RLS creadas (18 total)
- [ ] Índices creados correctamente
- [ ] Usuario admin verificado
- [ ] Pruebas de permisos realizadas

## 🎉 Resultado Final

Después de aplicar la migración consolidada:

✅ Estructura organizada y documentada
✅ Permisos claros para usuarios y administradores
✅ Optimización de rendimiento con índices
✅ Funciones útiles disponibles
✅ Compatibilidad con código existente
✅ Campo `digital_id` listo para usar

---

**Fecha de creación**: 2025-01-20
**Versión**: 1.0.0
**Estado**: ✅ Listo para producción

