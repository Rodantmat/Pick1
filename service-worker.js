const CACHE='amazon-flex-ui-v3';
const ASSETS=['./','./index.html','./style.css','./script.js','./logo-white.png','./profile.png','./pickup.png','./app-icon.png','./apple-touch-icon.png','./icon-192.png','./icon-512.png','./manifest.json'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).catch(()=>caches.match('./index.html'))));});
