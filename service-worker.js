const CACHE_NAME = 'megino-kangalasy-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/style.css',
  '/css/mascot.css',
  '/css/responsive.css',
  '/js/app.js',
  '/js/mascot.js',
  '/js/history-timeline.js',
  '/js/stories.js',
  '/js/form-handler.js',
  '/js/pwa-install.js',
  '/images/mascot/horse-idle.png',
  '/images/mascot/horse-happy.png',
  '/images/mascot/horse-talking.png',
  '/pages/history.html',
  '/pages/stories.html',
  '/pages/add-story.html',
  '/pages/benefits.html',
  '/pages/about.html',
  '/data/timeline-data.json',
  '/data/stories-data.json',
  '/data/benefits-data.json'
];

// Установка Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Кэширование файлов');
        return cache.addAll(urlsToCache);
      })
  );
});

// Активация и очистка старых кэшей
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Удаление старого кэша:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Обработка запросов
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Возвращаем кэшированный response, если он есть
        if (response) {
          return response;
        }
        
        // Клонируем запрос
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then(response => {
          // Проверяем валидность response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Клонируем response
          const responseToCache = response.clone();
          
          // Кэшируем новый ресурс
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        });
      })
      .catch(() => {
        // Офлайн-страница или fallback
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('/index.html');
        }
      })
  );
});

// Фоновая синхронизация для отправки историй
self.addEventListener('sync', event => {
  if (event.tag === 'sync-stories') {
    event.waitUntil(syncStories());
  }
});

// Функция синхронизации историй
async function syncStories() {
  try {
    const db = await openStoriesDB();
    const pendingStories = await getPendingStories(db);
    
    for (const story of pendingStories) {
      const response = await fetch('/api/stories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(story)
      });
      
      if (response.ok) {
        await markStoryAsSynced(db, story.id);
      }
    }
  } catch (error) {
    console.error('Ошибка синхронизации:', error);
  }
}