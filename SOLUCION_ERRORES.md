# 🔧 Solución de Errores - Mascotas.ec

## ❌ Error: `ERR_NAME_NOT_RESOLVED` o `Failed to fetch`

### Síntomas
- Error al guardar mascotas
- Mensaje: "Error al crear mascota: TypeError: Failed to fetch"
- No se pueden cargar datos desde Supabase

### Soluciones

#### 1. Verificar Variables de Entorno

Crea o verifica el archivo `.env` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

**Importante:**
- Las variables deben empezar con `VITE_` para que Vite las cargue
- No uses comillas alrededor de los valores
- No dejes espacios antes o después del `=`

#### 2. Reiniciar el Servidor de Desarrollo

Después de crear o modificar el archivo `.env`:

1. Detén el servidor (Ctrl+C)
2. Elimina el caché: `rm -rf node_modules/.vite` (o en Windows: `rmdir /s node_modules\.vite`)
3. Reinicia: `npm run dev`

#### 3. Verificar Conexión a Internet

El error `ERR_NAME_NOT_RESOLVED` indica que no puede resolver el DNS. Verifica:
- Tu conexión a internet está activa
- No hay firewall bloqueando Supabase
- El DNS está funcionando correctamente

#### 4. Verificar URL de Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Ve a Settings → API
3. Copia la "Project URL" y "anon public" key
4. Actualiza tu archivo `.env`

#### 5. Verificar en la Consola del Navegador

Abre la consola (F12) y busca:
```
Supabase Config: { url: "https://...", hasKey: true, keyLength: ... }
```

Si ves `NOT SET` o `hasKey: false`, las variables no están cargadas.

## ✅ Verificar que el ID Digital se Guarde Correctamente

### Flujo Esperado

1. **Al crear mascota:**
   - Se genera automáticamente un ID digital (ej: `MASC-A1B2-C3D4`)
   - Se muestra en el formulario
   - Se guarda en la base de datos

2. **En la base de datos:**
   - El campo `digital_id` debe tener el valor
   - Se puede verificar en Supabase Dashboard → Table Editor → pets

3. **En ID MASCOTAS:**
   - La mascota aparece con su ID digital destacado en verde
   - Se puede generar QR con el ID digital

### Verificación en Consola

Al crear una mascota, deberías ver estos logs:

```
handleSavePet: Saving pet with data: { isCreating: true, name: "...", digitalId: "MASC-..." }
createPet: Creating pet with data: { name: "...", digitalId: "MASC-...", ... }
createPet: Pet created successfully: { id: "...", digital_id: "MASC-...", name: "..." }
petStore.createPet: Pet created successfully: { id: "...", digitalId: "MASC-...", name: "..." }
```

### Si el ID Digital No Aparece

1. **Verifica en Supabase:**
   ```sql
   SELECT id, name, digital_id FROM pets ORDER BY created_at DESC LIMIT 5;
   ```

2. **Verifica en la consola:**
   - Busca logs que mencionen `digitalId` o `digital_id`
   - Verifica que no haya errores

3. **Verifica el componente PetIDManager:**
   - Debe mostrar el `digitalId` si existe
   - Si no existe, muestra el ID UUID truncado

## 🔍 Debugging Avanzado

### Ver Estado del Usuario

En la consola del navegador:
```javascript
// Ver usuario actual
const authStore = useAuthStore.getState();
console.log('Usuario:', authStore.user);

// Verificar si es admin
console.log('Es admin?', authStore.user?.role === 'admin');
```

### Ver Estado de Mascotas

```javascript
// Ver mascotas en el store
const petStore = usePetStore.getState();
console.log('Mascotas:', petStore.pets);
console.log('Mascotas con ID digital:', petStore.pets.filter(p => p.digitalId));
```

### Probar Conexión a Supabase

En la consola:
```javascript
import { supabase } from './src/lib/supabase';

// Probar conexión
const { data, error } = await supabase.from('pets').select('*').limit(1);
console.log('Conexión:', { data, error });
```

## 📝 Checklist de Verificación

- [ ] Archivo `.env` existe y tiene las variables correctas
- [ ] Variables empiezan con `VITE_`
- [ ] Servidor de desarrollo reiniciado después de crear `.env`
- [ ] Caché de Vite limpiado
- [ ] Conexión a internet activa
- [ ] URL de Supabase es correcta
- [ ] Usuario está autenticado como admin
- [ ] Logs en consola muestran el flujo correcto
- [ ] ID digital se genera en el formulario
- [ ] ID digital se guarda en la base de datos
- [ ] Mascota aparece en ID MASCOTAS con ID digital

## 🆘 Si Nada Funciona

1. **Verifica el archivo `.env`:**
   ```bash
   cat .env  # Linux/Mac
   type .env  # Windows
   ```

2. **Verifica que Vite esté cargando las variables:**
   - Deben aparecer en `import.meta.env`
   - Revisa en la consola: `console.log(import.meta.env)`

3. **Prueba con una conexión directa:**
   ```bash
   curl https://tu-proyecto.supabase.co/rest/v1/
   ```

4. **Contacta soporte:**
   - Comparte los logs de la consola
   - Comparte el error exacto
   - Indica qué pasos ya intentaste

