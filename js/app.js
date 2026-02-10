class PreschoolEducationApp {
  constructor() {
    this.currentPage = 'home';
    this.offlineMode = false;
    this.stories = [];
    this.timelineData = [];
    this.benefitsData = [];
    
    this.init();
  }
  
  async init() {
    // Проверка онлайн-статуса
    this.checkOnlineStatus();
    
    // Загрузка данных
    await this.loadData();
    
    // Инициализация компонентов
    this.setupNavigation();
    this.setupEventListeners();
    this.updateStats();
    
    // Показ приветственного сообщения
    this.showWelcomeMessage();
    
    // Регистрация PWA установки
    this.setupPWAInstall();
  }
  
  async loadData() {
    try {
      // Загрузка данных временной шкалы
      const timelineResponse = await fetch('data/timeline-data.json');
      this.timelineData = await timelineResponse.json();
      
      // Загрузка историй
      const storiesResponse = await fetch('data/stories-data.json');
      this.stories = await storiesResponse.json();
      
      // Загрузка данных о пользе
      const benefitsResponse = await fetch('data/benefits-data.json');
      this.benefitsData = await benefitsResponse.json();
      
      // Сохранение в IndexedDB для офлайн-доступа
      await this.saveToIndexedDB();
      
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      // Пытаемся загрузить из IndexedDB
      await this.loadFromIndexedDB();
    }
  }
  
  async saveToIndexedDB() {
    // Реализация сохранения в IndexedDB
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('PreschoolHistoryDB', 1);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Создаем хранилища
        if (!db.objectStoreNames.contains('timeline')) {
          db.createObjectStore('timeline', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('stories')) {
          db.createObjectStore('stories', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('benefits')) {
          db.createObjectStore('benefits', { keyPath: 'id' });
        }
      };
      
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['timeline', 'stories', 'benefits'], 'readwrite');
        
        // Сохраняем данные временной шкалы
        const timelineStore = transaction.objectStore('timeline');
        this.timelineData.forEach(item => {
          timelineStore.put(item);
        });
        
        // Сохраняем истории
        const storiesStore = transaction.objectStore('stories');
        this.stories.forEach(story => {
          storiesStore.put(story);
        });
        
        // Сохраняем данные о пользе
        const benefitsStore = transaction.objectStore('benefits');
        this.benefitsData.forEach(benefit => {
          benefitsStore.put(benefit);
        });
        
        transaction.oncomplete = () => {
          console.log('Данные сохранены в IndexedDB');
          resolve();
        };
      };
      
      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }
  
  async loadFromIndexedDB() {
    // Реализация загрузки из IndexedDB
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('PreschoolHistoryDB', 1);
      
      request.onsuccess = (event) => {
        const db = event.target.result;
        
        const transaction = db.transaction(['timeline', 'stories', 'benefits'], 'readonly');
        
        // Загружаем данные временной шкалы
        const timelineStore = transaction.objectStore('timeline');
        const timelineRequest = timelineStore.getAll();
        
        timelineRequest.onsuccess = () => {
          this.timelineData = timelineRequest.result;
        };
        
        // Загружаем истории
        const storiesStore = transaction.objectStore('stories');
        const storiesRequest = storiesStore.getAll();
        
        storiesRequest.onsuccess = () => {
          this.stories = storiesRequest.result;
          this.updateStoriesDisplay();
        };
        
        // Загружаем данные о пользе
        const benefitsStore = transaction.objectStore('benefits');
        const benefitsRequest = benefitsStore.getAll();
        
        benefitsRequest.onsuccess = () => {
          this.benefitsData = benefitsRequest.result;
        };
        
        transaction.oncomplete = () => {
          console.log('Данные загружены из IndexedDB');
          resolve();
        };
      };
      
      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }
  
  setupNavigation() {
    // Обработка навигации
    document.querySelectorAll('a[href^="pages/"]').forEach(link => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        const page = event.target.getAttribute('href').replace('pages/', '').replace('.html', '');
        this.navigateTo(page);
      });
    });
    
    // Обработка кнопки "Назад"
    window.addEventListener('popstate', (event) => {
      this.handlePopState(event);
    });
  }
  
  navigateTo(page) {
    this.currentPage = page;
    
    // Обновление истории браузера
    history.pushState({ page }, '', `pages/${page}.html`);
    
    // Загрузка контента страницы
    this.loadPageContent(page);
    
    // Отправка события для талисмана
    this.dispatchPageChangeEvent(page);
  }
  
  async loadPageContent(page) {
    try {
      const response = await fetch(`pages/${page}.html`);
      const html = await response.text();
      
      // Извлекаем только основной контент
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const mainContent = doc.querySelector('.main-content') || doc.body;
      
      // Обновляем контент на странице
      const currentMain = document.querySelector('.main-content');
      currentMain.innerHTML = mainContent.innerHTML;
      
      // Инициализация специфичных для страницы скриптов
      this.initializePageScripts(page);
      
      // Добавляем анимацию появления
      currentMain.classList.add('fade-in');
      setTimeout(() => {
        currentMain.classList.remove('fade-in');
      }, 600);
      
    } catch (error) {
      console.error('Ошибка загрузки страницы:', error);
      this.showError('Не удалось загрузить страницу. Проверьте подключение к интернету.');
    }
  }
  
  initializePageScripts(page) {
    switch(page) {
      case 'history':
        if (window.HistoryTimeline) {
          new window.HistoryTimeline(this.timelineData);
        }
        break;
      case 'stories':
        if (window.StoriesManager) {
          new window.StoriesManager(this.stories);
        }
        break;
      case 'add-story':
        if (window.StoryFormHandler) {
          new window.StoryFormHandler();
        }
        break;
      case 'benefits':
        if (window.BenefitsDisplay) {
          new window.BenefitsDisplay(this.benefitsData);
        }
        break;
    }
  }
  
  dispatchPageChangeEvent(page) {
    const event = new CustomEvent('pageChanged', {
      detail: { page }
    });
    window.dispatchEvent(event);
  }
  
  handlePopState(event) {
    if (event.state && event.state.page) {
      this.currentPage = event.state.page;
      this.loadPageContent(event.state.page);
    } else {
      this.navigateTo('home');
    }
  }
  
  updateStats() {
    // Обновление статистики на главной странице
    const yearsElement = document.getElementById('years-count');
    const kindergartensElement = document.getElementById('kindergartens-count');
    const storiesElement = document.getElementById('stories-count');
    
    if (yearsElement) {
      // Анимация счетчика
      this.animateCounter(yearsElement, 100);
    }
    
    if (kindergartensElement) {
      this.animateCounter(kindergartensElement, 45);
    }
    
    if (storiesElement && this.stories.length > 0) {
      this.animateCounter(storiesElement, this.stories.length);
    }
  }
  
  animateCounter(element, target) {
    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      element.textContent = Math.floor(current) + (target === 45 ? '+' : '');
    }, 30);
  }
  
  checkOnlineStatus() {
    this.offlineMode = !navigator.onLine;
    
    if (this.offlineMode) {
      this.showOfflineWarning();
    }
    
    // Обновление статуса при изменении
    window.addEventListener('online', () => {
      this.offlineMode = false;
      this.hideOfflineWarning();
      this.showOnlineNotification();
      this.syncPendingData();
    });
    
    window.addEventListener('offline', () => {
      this.offlineMode = true;
      this.showOfflineWarning();
    });
  }
  
  showOfflineWarning() {
    // Удаляем предыдущее предупреждение
    const existingWarning = document.querySelector('.offline-warning');
    if (existingWarning) existingWarning.remove();
    
    // Создаем новое предупреждение
    const warning = document.createElement('div');
    warning.className = 'offline-warning';
    warning.innerHTML = `
      <span>⚠️ Вы в офлайн-режиме. Некоторые функции могут быть недоступны.</span>
      <button onclick="this.parentElement.remove()" style="margin-left: 10px; background: none; border: none; color: white; cursor: pointer;">
        ×
      </button>
    `;
    
    document.body.prepend(warning);
  }
  
  hideOfflineWarning() {
    const warning = document.querySelector('.offline-warning');
    if (warning) warning.remove();
  }
  
  showOnlineNotification() {
    const notification = document.createElement('div');
    notification.className = 'online-notification';
    notification.textContent = '✅ Соединение восстановлено';
    
    document.body.prepend(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
  
  async syncPendingData() {
    // Синхронизация данных, сохраненных в офлайне
    try {
      const pendingStories = JSON.parse(localStorage.getItem('pendingStories') || '[]');
      
      for (const story of pendingStories) {
        await this.submitStory(story);
      }
      
      // Очищаем pending stories после успешной синхронизации
      localStorage.removeItem('pendingStories');
      
      // Показываем уведомление о успешной синхронизации
      this.showNotification('Данные успешно синхронизированы!', 'success');
      
    } catch (error) {
      console.error('Ошибка синхронизации:', error);
    }
  }
  
  async submitStory(story) {
    // Здесь будет реальный API запрос
    console.log('Отправка истории:', story);
    
    // В демо-режиме просто добавляем в массив
    story.id = Date.now();
    story.date = new Date().toISOString();
    story.status = 'published';
    
    this.stories.push(story);
    this.updateStoriesDisplay();
    
    // Сохраняем в IndexedDB
    await this.saveStoryToIndexedDB(story);
    
    // Отправляем событие для талисмана
    const event = new CustomEvent('storySubmitted', { detail: story });
    window.dispatchEvent(event);
    
    return { success: true, id: story.id };
  }
  
  async saveStoryToIndexedDB(story) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('PreschoolHistoryDB', 1);
      
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['stories'], 'readwrite');
        const store = transaction.objectStore('stories');
        
        store.put(story);
        
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      };
      
      request.onerror = (event) => reject(event.target.error);
    });
  }
  
  updateStoriesDisplay() {
    // Обновление отображения историй на странице
    const storiesContainer = document.querySelector('.stories-container');
    if (storiesContainer && this.stories.length > 0) {
      // Создаем или обновляем список историй
      this.renderStories(storiesContainer);
    }
  }
  
  renderStories(container) {
    // Сортируем истории по дате (новые сначала)
    const sortedStories = [...this.stories].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );
    
    // Ограничиваем количество отображаемых историй
    const recentStories = sortedStories.slice(0, 10);
    
    container.innerHTML = recentStories.map(story => 
      <div class="story-card">
        <div class="story-header">
          <span class="story-author">${story.author}</span>
          <span class="story-date">${this.formatDate(story.date)}</span>
        </div>
        <div class="story-content">
          <p>${story.text}</p>
        </div>
        <div class="story-footer">
          <span class="story-kindergarten">${story.kindergarten}</span>
          <span class="story-year">${story.year || 'Не указан'}</span>
        </div>
      </div>
    ).join('');
  }
  
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }
  
  showWelcomeMessage() {
    // Проверяем, первый ли это визит
    const firstVisit = !localStorage.getItem('hasVisited');
    
    if (firstVisit) {
      setTimeout(() => {
        // Показываем приветственное сообщение через талисмана
        if (window.digitalMascot) {
          window.digitalMascot.say(
            'Добро пожаловать в Digital-талисман! Здесь вы найдете историю дошкольного образования нашего улуса и сможете поделиться своими воспоминаниями.',
            5000
          );
        }
        
        // Сохраняем факт посещения
        localStorage.setItem('hasVisited', 'true');
      }, 2000);
    }
  }
  
  setupPWAInstall() {
    // Отложенная установка PWA
    let deferredPrompt;
    
    window.addEventListener('beforeinstallprompt', (event) => {
      // Предотвращаем автоматическую установку
      event.preventDefault();
      deferredPrompt = event;
      
      // Показываем кнопку установки
      const installButton = document.getElementById('install-button');
      if (installButton) {
        installButton.style.display = 'block';
        
        installButton.addEventListener('click', () => {
          // Показываем запрос на установку
          deferredPrompt.prompt();
          
          // Ждем ответа пользователя
          deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
              console.log('Пользователь принял запрос на установку');
            } else {
              console.log('Пользователь отклонил запрос на установку');
            }
            deferredPrompt = null;
          });
        });
      }
    });
  }
  
  showError(message) {
    // Показ ошибки пользователю
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
      <span>❌ ${message}</span>
      <button onclick="this.parentElement.remove()" style="margin-left: 10px; background: none; border: none; cursor: pointer;">
        ×
      </button>
    `;
    
    errorDiv.style.cssText = 
      position: fixed;
      top: 20px;
      right: 20px;
      background: #e74c3c;
      color: white;
      padding: 15px;
      border-radius: 5px;
      z-index: 1000;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      animation: slideIn 0.3s ease-out;
    ;
    
    document.body.appendChild(errorDiv);
    
    // Автоматическое скрытие через 5 секунд
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.remove();
      }
    }, 5000);
  }
  
  showNotification(message, type = 'info') {
    // Показ уведомления
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
      <span>${type === 'success' ? '✅' : 'ℹ️'} ${message}</span>
      <button onclick="this.parentElement.remove()" style="margin-left: 10px; background: none; border: none; cursor: pointer;">
        ×
      </button>
    `;
    
    const backgroundColor = type === 'success' ? '#27ae60' : '#3498db';
    
    notification.style.cssText = 
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${backgroundColor};
      color: white;
      padding: 15px;
      border-radius: 5px;
      z-index: 1000;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      animation: slideIn 0.3s ease-out;
    ;
    
    document.body.appendChild(notification);
    
    // Автоматическое скрытие через 3 секунды
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 3000);
  }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
  window.app = new PreschoolEducationApp();
});