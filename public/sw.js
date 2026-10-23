/* V13: network first and immutable offline shell fallback, no API caching. */
const CACHE='nutrix-pro-v13-14-design-20261023';
const SHELL=['/','/index.html','/style.css','/script.js','/nutrix-v13.css','/nutrix-v13-1.css','/nutrix-v13-2.css','/nutrix-v13-2.js','/nutrix-v13-3.js','/nutrix-v13-3.css','/nutrix-premium-foundation.css','/nutrix-pulse-home.css','/nutrix-pulse-home.js','/nutrix-food-tracker.css','/nutrix-food-tracker.js','/nutrix-health-dashboard.css','/nutrix-health-dashboard.js','/nutrix-ai-copilot.css','/nutrix-ai-copilot.js','/nutrix-studio.js','/nutrix-studio.css','/nutrix-pro-final.css','/nutrix-pro-final.js','/nutrix-studio-vision.js','/nutrix-studio-vision.css','/assets/ai/nutrix-robot.glb','/nutrix-v13.js','/nutrix-v13-core.js','/manifest.json','/icon.svg'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{const req=e.request,url=new URL(req.url);if(req.method!=='GET'||url.origin!==self.location.origin||url.pathname.startsWith('/api/'))return;
 e.respondWith(fetch(req).then(response=>{if(response.ok){const cp=response.clone();caches.open(CACHE).then(c=>c.put(req,cp)).catch(()=>{});}return response;}).catch(()=>caches.match(req).then(r=>r||(req.mode==='navigate'?caches.match('/index.html'):Response.error()))));
});
