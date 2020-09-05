const CACHE_NAME = "telebook-v1.0.5";
const urls = [
    '/',
    '/index.html',
    '/favicon.png',
    '/manifest.json',
    '/css/toastr.min.css',
    '/css/font-awesome.min.css',
    '/css/styles.css',
    '/fonts/FontAwesome.otf',
    '/fonts/fontawesome-webfont.eot',
    '/fonts/fontawesome-webfont.svg',
    '/fonts/fontawesome-webfont.ttf',
    '/fonts/fontawesome-webfont.woff',
    '/fonts/fontawesome-webfont.woff2',
    '/img/amigos.png',
    '/img/familia.png',
    '/img/otros.png',
    '/img/trabajo.png',
    '/img/ws-og.jpg',
    '/js/jquery-2.2.3.min.js',
    '/js/toastr.js.map',
    '/js/toastr.min.js',
    '/js/web-animations.min.js',
    '/js/muuri.min.js',
    '/js/main.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
      caches.open( CACHE_NAME ).then( cache => {
        return cache.addAll( urls );
      })
    );
});

this.addEventListener('activate', event => {
    let cacheWhitelist = [CACHE_NAME];
  
    event.waitUntil(
      caches.keys().then( keyList => {
        return Promise.all( keyList.map( key => {
          if (cacheWhitelist.indexOf(key) === -1) {
            return caches.delete(key);
          }
        }));
      })
    );
});
  
self.addEventListener('fetch', event => {
    event.respondWith( caches.match(event.request).then( response => {

        if (response)
            return response;
        else {
            let requestCopia = event.request.clone();

            return fetch(requestCopia).then( response => {
      
                let responseCopiada = response.clone();

                caches.open(CACHE_NAME).then( cache => {
                    cache.put(event.request, responseCopiada);
                });

                return response;

            }).catch(function () {
                console.log("Modo sin conexion no disponible!");
            });
        }

    }));
});
  