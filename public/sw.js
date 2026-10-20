// Cache only the public offline screen and generic icons. Never cache business data,
// authentication, application HTML, API responses, PDFs or uploaded documents.
const CACHE='siparis-offline-0.9.4';
const STATIC=['/offline.html','/icons/icon-192.png','/icons/icon-512.png','/icons/icon-maskable-512.png','/icons/apple-touch-icon.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(STATIC)));});
// No skipWaiting: an update never reloads a user's unfinished form.
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('siparis-offline-')&&key!==CACHE).map(key=>caches.delete(key)))));});
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method==='GET'&&url.origin===self.location.origin&&STATIC.includes(url.pathname)&&!url.search){event.respondWith(caches.match(request,{cacheName:CACHE}).then(cached=>cached||fetch(request)));return;}
 if(request.method!=='GET'||url.origin!==self.location.origin||request.mode!=='navigate'||url.pathname.startsWith('/api/')||url.searchParams.has('code')||url.searchParams.has('reset'))return;
 event.respondWith(fetch(request).catch(async()=>{
  const fallback=await caches.match('/offline.html',{cacheName:CACHE});
  return fallback||new Response('İnternet bağlantısı yok. Bağlantınızı kontrol edip yeniden deneyin.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
 }));
});
