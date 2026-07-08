const CACHE_NAME = "parking-app-v2";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Solo gestionamos peticiones GET del mismo origen (el HTML, el manifest y los iconos).
// Todo lo demás (Firebase, fuentes de Google, etc.) va directo a la red:
// los datos de las plazas siempre deben ser en tiempo real, nunca cacheados.
//
// Estrategia "network-first": siempre intenta traer la versión más reciente
// de la red primero. Solo usa la copia guardada en caché si no hay conexión.
// Así, cualquier cambio que subas a GitHub se ve en el siguiente refresco,
// sin quedar "atascado" en una versión antigua.
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (req.method !== "GET" || url.origin !== self.location.origin) {
    return; // deja pasar tal cual
  }

  event.respondWith(
    fetch(req)
      .then((res) => {
        caches.open(CACHE_NAME).then((cache) => cache.put(req, res.clone()));
        return res;
      })
      .catch(() => caches.match(req))
  );
});
