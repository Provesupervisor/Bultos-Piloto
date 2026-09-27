/*  Carga en Patio · Piloto de bultos — service worker
    ---------------------------------------------------------------
    Está por dos razones: para que Chrome ofrezca instalar la app, y
    para que abra aunque el patio quede sin señal.

    TODO LO PROPIO VA A LA RED PRIMERO: las páginas, piloto-config.js,
    el manifest. La copia guardada solo entra si no hay señal. Así una
    versión nueva, o la dirección del piloto recién pegada en
    piloto-config.js, llega en la siguiente apertura y nunca queda una
    versión vieja pegada en el celular.

    LO QUE SÍ SE SIRVE DE CACHÉ es lo que no cambia y pesa: el motor de
    lectura de rótulos (Tesseract, varios MB, desde el CDN) y los íconos.

    LO QUE NUNCA SE GUARDA son las respuestas de los Apps Script
    (programaciones y bultos): cambian durante el día y llevan la clave.
*/

/*  Caché con prefijo propio. La app actual comparte el dominio y el almacén de
    cachés del navegador: si este service worker borrara "todo lo que no es
    mío", borraría la caché de la app actual. Solo borra versiones viejas del
    piloto. */
const PREFIJO = 'bultos-piloto-';
const VERSION = PREFIJO + 'v1';
const BASICOS = [
  './', './index.html', './registro-bultos.html', './piloto-config.js',
  './manifest.webmanifest', './icono-192.png', './icono-512.png'
];

self.addEventListener('install', ev => {
  ev.waitUntil(
    caches.open(VERSION)
      .then(c => Promise.all(BASICOS.map(u => c.add(u).catch(() => {}))))   // si falta uno, no se cae la instalación
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', ev => {
  ev.waitUntil(
    caches.keys()
      .then(ns => Promise.all(ns.filter(n => n.indexOf(PREFIJO) === 0 && n !== VERSION).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

function guardar(req, res) {
  if (res && res.status === 200 && (res.type === 'basic' || res.type === 'cors')) {
    const copia = res.clone();
    caches.open(VERSION).then(c => c.put(req, copia)).catch(() => {});
  }
  return res;
}

self.addEventListener('fetch', ev => {
  const req = ev.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // datos de la nube: nunca se tocan
  if (url.hostname.indexOf('script.google') >= 0 || url.hostname.indexOf('googleusercontent') >= 0) return;

  const propio = url.origin === self.location.origin;
  const icono = propio && /icono-.*\.png$/.test(url.pathname);

  if (propio && !icono) {
    // red primero; caché solo si no hay señal
    ev.respondWith(
      fetch(req).then(res => guardar(req, res))
        .catch(() => caches.match(req).then(r => r || (req.mode === 'navigate' ? caches.match('./index.html') : undefined)))
    );
    return;
  }

  // íconos y CDN: caché primero
  ev.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => guardar(req, res))));
});
