# 🔍 Verificación de Conexión a Supabase

## Error Actual: `ERR_NAME_NOT_RESOLVED`

Este error significa que el navegador **no puede resolver el DNS** de la URL de Supabase.

## ✅ Pasos para Solucionar

### 1. Verificar Archivo `.env`

Crea un archivo `.env` en la raíz del proyecto (`project/.env`):

```env
VITE_SUPABASE_URL=https://imghbqntnyyncqkuwncv.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

**⚠️ IMPORTANTE:**
- El archivo debe llamarse exactamente `.env` (con el punto al inicio)
- Debe estar en la carpeta `project/` (mismo nivel que `package.json`)
- Las variables DEBEN empezar con `VITE_`
- NO uses comillas alrededor de los valores
- NO dejes espacios alrededor del `=`

### 2. Obtener las Credenciales de Supabase

1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Selecciona tu proyecto
3. Ve a **Settings** → **API**
4. Copia:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

### 3. Reiniciar el Servidor

**CRÍTICO:** Después de crear/modificar `.env`:

```bash
# 1. Detén el servidor (Ctrl+C)

# 2. Elimina el caché
# Windows PowerShell:
Remove-Item -Recurse -Force node_modules\.vite

# Linux/Mac:
rm -rf node_modules/.vite

# 3. Reinicia el servidor
npm run dev
```

### 4. Verificar en la Consola del Navegador

Abre la consola (F12) y busca:

```
Supabase Config: { url: "https://...", hasKey: true, keyLength: 100+ }
```

Si ves:
- `url: "NOT SET"` → El archivo `.env` no está o no se cargó
- `hasKey: false` → Falta `VITE_SUPABASE_ANON_KEY`
- `keyLength: 0` → La key está vacía

### 5. Probar Conexión Manualmente

En la consola del navegador:

```javascript
// Verificar variables de entorno
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'MISSING');

// Probar conexión
import { supabase } from './src/lib/supabase';
const { data, error } = await supabase.from('pets').select('*').limit(1);
console.log('Conexión:', { data, error });
```

## 🔧 Soluciones Alternativas

### Si el DNS no Resuelve

1. **Verifica tu conexión a internet**
2. **Prueba con otro navegador**
3. **Verifica el firewall/antivirus**
4. **Prueba desde otro dispositivo/red**

### Si las Variables No Se Cargan

1. **Verifica la ubicación del archivo `.env`**
   - Debe estar en `project/.env`
   - NO en `project/src/.env`

2. **Verifica el formato del archivo**
   ```env
   # ✅ CORRECTO
   VITE_SUPABASE_URL=https://...
   VITE_SUPABASE_ANON_KEY=eyJ...

   # ❌ INCORRECTO
   VITE_SUPABASE_URL = "https://..."  # Espacios y comillas
   SUPABASE_URL=https://...  # Falta VITE_
   ```

3. **Reinicia el servidor** después de cada cambio

### Si el Servidor de Supabase Está Caído

1. Verifica el estado en [status.supabase.com](https://status.supabase.com)
2. Verifica en tu Dashboard de Supabase si el proyecto está activo

## 📝 Ejemplo de Archivo `.env` Completo

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://imghbqntnyyncqkuwncv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltZ2hicW50bnl5bmNxa3V3bmN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTk5OTk5OTksImV4cCI6MjAxNTU3NTk5OX0.ejemplo-key-aqui
```

**⚠️ NUNCA subas el archivo `.env` a Git!** Ya está en `.gitignore`.

## ✅ Verificación Final

Después de configurar todo, deberías poder:

1. ✅ Ver logs en consola: `Supabase Config: { url: "https://...", hasKey: true }`
2. ✅ Cargar mascotas sin errores
3. ✅ Crear nuevas mascotas
4. ✅ Ver las mascotas en "ID MASCOTAS" con su ID digital

## 🆘 Si Nada Funciona

1. Verifica que el proyecto de Supabase esté activo
2. Verifica que la URL sea correcta (sin espacios, sin comillas)
3. Verifica que la anon key sea correcta (muy larga, empieza con `eyJ`)
4. Prueba crear un nuevo proyecto en Supabase si el actual tiene problemas

