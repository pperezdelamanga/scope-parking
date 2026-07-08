# Plazas de garaje — app de gestión

App de una sola página (`index.html`) para gestionar las 6 plazas de parking de la empresa. Se aloja gratis en GitHub Pages y se sincroniza en tiempo real entre todos los usuarios mediante Firebase Realtime Database.

- Plazas por defecto: 65 Cristina · 66 Nacho · 69 Sergio · 70 Juanma · 78 Ángela · 79 Furgo
- Cualquiera puede liberar **su propia** plaza si no va en coche
- Cualquier otro empleado puede ocupar una plaza libre
- Cada semana (lunes) se reinician automáticamente las plazas a sus dueños por defecto
- El cambio se ve al instante en todos los móviles/ordenadores, sin recargar

---

## Paso 1 — Crear el proyecto de Firebase (10 min, gratis)

1. Ve a https://console.firebase.google.com y crea un proyecto nuevo (no hace falta tarjeta, el plan gratuito "Spark" es suficiente).
2. En el menú lateral, entra en **Compilación → Realtime Database** → "Crear base de datos".
   - Elige una región cercana (por ejemplo `europe-west1`).
   - Selecciona modo de reglas y luego sustituye las reglas por estas (solo lectura/escritura, sin login, adecuado para una herramienta interna de confianza):

   ```json
   {
     "rules": {
       ".read": true,
       ".write": true
     }
   }
   ```

   > Esto es intencionadamente abierto porque es una app interna para ~6-20 compañeros sin sistema de login. Si prefieres más seguridad, se puede añadir Firebase Authentication más adelante.

3. Ve a **Configuración del proyecto** (icono del engranaje) → pestaña **General** → sección "Tus apps" → botón `</>` (Web) → registra la app (no hace falta Hosting).
4. Copia el objeto `firebaseConfig` que te muestra (apiKey, authDomain, databaseURL, etc.).

## Paso 2 — Pegar la configuración en `index.html`

Abre `index.html` y busca este bloque cerca del final del archivo:

```js
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  databaseURL: "https://TU_PROYECTO-default-rtdb.europe-west1.firebasedatabase.app",
  ...
};
```

Sustitúyelo por el que copiaste de Firebase. Guarda el archivo.

## Paso 3 — Subirlo a GitHub Pages

1. Crea un repositorio nuevo en GitHub (puede ser público o privado; si es privado necesitarás plan que permita Pages, o usa público ya que no hay datos sensibles en el código).
2. Sube **todos** estos archivos a la raíz del repositorio: `index.html`, `manifest.json`, `service-worker.js`, `icon-192.png`, `icon-512.png`, `icon-512-maskable.png` (y este `README.md`).
3. En el repo: **Settings → Pages** → en "Build and deployment" elige **Deploy from a branch**, rama `main`, carpeta `/root`. Guarda.
4. En 1-2 minutos GitHub te dará un enlace tipo:
   `https://tu-usuario.github.io/tu-repo/`

Ese es el enlace único que compartes con los 6 compañeros (o con toda la empresa). Todos verán los mismos datos en tiempo real.

## Paso 4 — (opcional) Cambiar las plazas o los dueños

Edita el array `DEFAULT_SPOTS` al principio del script en `index.html`:

```js
const DEFAULT_SPOTS = [
  { num: 65, owner: "Cristina" },
  { num: 66, owner: "Nacho" },
  ...
];
```

Vuelve a subir el cambio a GitHub; se reflejará la próxima vez que la base de datos se reinicie (cada semana) o puedes forzarlo borrando el nodo `parking` en la consola de Firebase (Realtime Database → los tres puntos → eliminar).

---

## Cómo funciona el reinicio semanal

La app no necesita ningún servidor ni tarea programada: cada vez que alguien abre la página, comprueba en qué semana ISO estamos (lunes a domingo). Si la base de datos todavía tiene guardada una semana antigua, la reinicia automáticamente a las plazas por defecto antes de mostrar nada. Como alguien del equipo abre la app cada semana, el reinicio ocurre solo, sin que nadie tenga que hacer nada.

## Instalarla como app en el móvil

La app funciona directamente en el navegador del móvil, pero también se puede "instalar" para que quede como un icono más en la pantalla de inicio, se abra a pantalla completa (sin la barra del navegador) y cargue al instante:

**Android (Chrome):** abre el enlace → menú (⋮) → **"Instalar aplicación"** o **"Añadir a pantalla de inicio"**.

**iPhone (Safari):** abre el enlace → botón de compartir (□↑) → **"Añadir a pantalla de inicio"**.

No requiere subirla a ninguna tienda de apps ni nada adicional: los archivos `manifest.json`, `service-worker.js`, `icon-192.png`, `icon-512.png` e `icon-512-maskable.png` ya están preparados para esto — solo asegúrate de subirlos todos junto con `index.html` al mismo repositorio de GitHub Pages.

> El service worker solo cachea la interfaz (para que abra rápido y sin pantalla en blanco). El estado de las plazas siempre se lee en vivo desde Firebase, así que hace falta conexión a internet para ver o cambiar quién ocupa cada plaza.

## Cómo se identifica cada persona

No hay contraseñas. La primera vez que alguien entra, escribe su nombre y la app lo recuerda en ese navegador (localStorage). Es una identificación de confianza, pensada para un equipo pequeño — no impide que alguien escriba un nombre que no es el suyo, igual que nada impide coger físicamente la llave de otro.
