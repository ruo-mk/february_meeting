class StoryFormHandler {
  constructor() {
    this.form = document.getElementById('story-form');
    this.preview = document.getElementById('story-preview');
    this.photoInput = document.getElementById('story-photo');
    this.photoPreview = document.getElementById('photo-preview');
    
    if (this.form) {
      this.init();
    }
  }
  
  init() {
    this.setupEventListeners();
    this.loadFormDraft();
  }
  
  setupEventListeners() {
    // Обработка отправки формы
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });
    
    // Автосохранение черновика
    this.form.addEventListener('input', () => {
      this.saveFormDraft();
    });
    
    // Обработка загрузки фото
    if (this.photoInput) {
      this.photoInput.addEventListener('change', (e) => {
        this.handlePhotoUpload(e);
      });
    }
    
    // Предпросмотр истории
    const previewButton = document.getElementById('preview-story');
    if (previewButton) {
      previewButton.addEventListener('click', () => {
        this.showPreview();
      });
    }
  }
  
  handleSubmit() {
    // Валидация формы
    if (!this.validateForm()) {
      return;
    }
    
    // Сбор данных формы
    const formData = {
      author: document.getElementById('author-name').value,
      email: document.getElementById('author-email').value,
      kindergarten: document.getElementById('kindergarten').value,
      year: document.getElementById('year').value,
      role: document.getElementById('role').value,
      text: document.getElementById('story-text').value,
      photo: this.photoPreview ? this.photoPreview.src : null,
      privacy: document.getElementById('privacy-consent').checked,
      timestamp: new Date().toISOString()
    };
    
    // Проверка онлайн-статуса
    if (navigator.onLine) {
      // Отправка на сервер
      this.submitToServer(formData);
    } else {
      // Сохранение для офлайн-отправки
      this.saveForOffline(formData);
    }
  }
  
  validateForm() {
    const requiredFields = [
      'author-name',
      'kindergarten',
      'story-text',
      'privacy-consent'
    ];
    
    let isValid = true;
    const errors = [];
    
    requiredFields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (!field) return;
      
      if (field.type === 'checkbox') {
        if (!field.checked) {
          isValid = false;
          errors.push('Необходимо согласие на обработку данных');
        }
      } else if (!field.value.trim()) {
        isValid = false;
        field.classList.add('error');
        errors.push(`Поле "${field.previousElementSibling?.textContent || field.placeholder}" обязательно для заполнения`);
      } else {
        field.classList.remove('error');
      }
    });
    
    // Проверка года
    const yearField = document.getElementById('year');
    if (yearField.value) {
      const year = parseInt(yearField.value);
      const currentYear = new Date().getFullYear();
      
      if (year < 1920 || year > currentYear) {
        isValid = false;
        yearField.classList.add('error');
        errors.push(`Год должен быть между 1920 и ${currentYear}`);
      }
    }
    
    // Показ ошибок
    this.showErrors(errors);
    
    return isValid;
  }
  
  showErrors(errors) {
    // Удаление старых ошибок
    const oldErrors = document.querySelectorAll('.error-message');
    oldErrors.forEach(error => error.remove());
    
    // Показ новых ошибок
    if (errors.length > 0) {
      const errorList = document.createElement('div');
      errorList.className = 'error-message';
      errorList.innerHTML = `
        <h4>Исправьте следующие ошибки:</h4>
        <ul>
          ${errors.map(error => `<li>${error}</li>`).join('')}
        </ul>
      `;
      
      errorList.style.cssText = 
        background: #ffeaea;
        border-left: 4px solid #e74c3c;
        padding: 15px;
        margin: 15px 0;
        border-radius: 4px;
      ;
      
      this.form.prepend(errorList);
      
      // Анимация ошибки
      errorList.classList.add('shake-animation');
      setTimeout(() => {
        errorList.classList.remove('shake-animation');
      }, 500);
    }
  }
  
  async submitToServer(formData) {
    // Показ индикатора загрузки
    this.showLoading(true);
    
    try {
      // Здесь будет реальный API запрос
      // const response = await fetch('/api/stories', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify(formData)
      // });
      
      // Для демо-режима используем локальное сохранение
      await this.saveToLocalStorage(formData);
      
      // Успешная отправка
      this.showSuccess();
      
      // Очистка формы
      this.resetForm();
      
      // Очистка черновика
      this.clearFormDraft();
      
    } catch (error) {
      console.error('Ошибка отправки:', error);
      this.showError('Не удалось отправить историю. Попробуйте позже.');
    } finally {
      this.showLoading(false);
    }
  }
  
  async saveToLocalStorage(formData) {
    // Генерация ID для истории
    formData.id = `story_${Date.now()}_${Math.random().toString(36).substr(2, 9)};
    formData.status = 'pending';
    
    // Получение существующих историй
    const existingStories = JSON.parse(localStorage.getItem('userStories') || '[]');
    
    // Добавление новой истории
    existingStories.push(formData);
    
    // Сохранение обратно в localStorage
    localStorage.setItem('userStories', JSON.stringify(existingStories));
    
    // Сохранение для синхронизации с сервером
    this.saveForSync(formData);
    
    return formData;
  }
  
  saveForSync(formData) {
    // Сохранение истории для последующей синхронизации
    const pendingStories = JSON.parse(localStorage.getItem('pendingStories') || '[]');
    pendingStories.push(formData);
    localStorage.setItem('pendingStories', JSON.stringify(pendingStories));
    
    // Регистрация фоновой синхронизации
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready.then(registration => {
        return registration.sync.register('sync-stories');
      });
    }
  }
  
  saveForOffline(formData) {
    // Сохранение для офлайн-отправки
    formData.id = `offline_${Date.now()};
    formData.status = 'offline';
    
    const offlineStories = JSON.parse(localStorage.getItem('offlineStories') || '[]');
    offlineStories.push(formData);
    localStorage.setItem('offlineStories', JSON.stringify(offlineStories));
    
    // Показ уведомления
    this.showOfflineNotification();
    
    // Очистка формы
    this.resetForm();
    this.clearFormDraft();
  }
  
  showLoading(show) {
    const submitButton = this.form.querySelector('button[type="submit"]');
    const spinner = document.getElementById('submit-spinner');
    
    if (show) {
      submitButton.disabled = true;
      submitButton.innerHTML = '<span class="spinner"></span> Отправка...';
      
      if (!spinner) {
        const spinnerEl = document.createElement('div');
        spinnerEl.id = 'submit-spinner';
        spinnerEl.className = 'spinner-overlay';
        spinnerEl.innerHTML = '<div class="spinner"></div>';
        this.form.appendChild(spinnerEl);
      }
    } else {
      submitButton.disabled = false;
      submitButton.textContent = 'Отправить историю';
      
      if (spinner) {
        spinner.remove();
      }
    }
  }
  
  showSuccess() {
    // Показ сообщения об успехе
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.innerHTML = `
      <div class="success-content">
        <span class="success-icon">✅</span>
        <h3>Спасибо за вашу историю!</h3>
        <p>Ваше воспоминание успешно сохранено. После модерации оно появится в общем архиве.</p>
        <button onclick="this.closest('.success-message').remove()" class="btn btn-primary">
          Понятно
        </button>
      </div>
    ;
    
    successMessage.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      z-index: 1000;
      text-align: center;
      animation: fadeIn 0.3s ease-out;
    ;
    
    document.body.appendChild(successMessage);
    
    // Закрытие по клику на фон
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.cssText = 
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 999;
    ;
    
    overlay.addEventListener('click', () => {
      successMessage.remove();
      overlay.remove();
    });
    
    document.body.appendChild(overlay);
  }
  
  showError(message) {
    // Показ сообщения об ошибке
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-toast';
    errorDiv.textContent = message;
    
    errorDiv.style.cssText = 
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #e74c3c;
      color: white;
      padding: 15px 20px;
      border-radius: 5px;
      z-index: 1000;
      animation: slideInUp 0.3s ease-out;
    ;
    
    document.body.appendChild(errorDiv);
    
    // Автоматическое скрытие
    setTimeout(() => {
      errorDiv.style.animation = 'slideOutDown 0.3s ease-out';
      setTimeout(() => errorDiv.remove(), 300);
    }, 5000);
  }
  
  showOfflineNotification() {
    // Уведомление об офлайн-сохранении
    const notification = document.createElement('div');
    notification.className = 'offline-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">📱</span>
        <div>
          <h4>История сохранена офлайн</h4>
          <p>Ваша история будет отправлена автоматически, когда появится интернет-соединение.</p>
        </div>
        <button onclick="this.closest('.offline-notification').remove()" class="close-btn">
          ×
        </button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Автоматическое скрытие
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 300);
    }, 5000);
  }
  
  handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Проверка типа файла
    if (!file.type.match('image.*')) {
      this.showError('Пожалуйста, выберите изображение');
      return;
    }
    
    // Проверка размера файла (максимум 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.showError('Размер изображения не должен превышать 5MB');
      return;
    }
    
    // Чтение и отображение изображения
    const reader = new FileReader();
    reader.onload = (e) => {
      if (this.photoPreview) {
        this.photoPreview.src = e.target.result;
        this.photoPreview.style.display = 'block';
        
        // Кнопка удаления фото
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Удалить фото';
        removeButton.className = 'btn btn-secondary btn-sm';
        removeButton.type = 'button';
        removeButton.addEventListener('click', () => {
          this.photoPreview.style.display = 'none';
          this.photoInput.value = '';
          removeButton.remove();
        });
        
        this.photoPreview.parentNode.appendChild(removeButton);
      }
    };
    
    reader.readAsDataURL(file);
  }
  
  showPreview() {
    if (!this.preview) return;
    
    // Сбор данных для предпросмотра
    const previewData = {
      author: document.getElementById('author-name').value || 'Аноним',
      kindergarten: document.getElementById('kindergarten').value || 'Не указан',
      year: document.getElementById('year').value || 'Не указан',
      role: document.getElementById('role').value || 'Выпускник',
      text: document.getElementById('story-text').value || 'Текст истории не введен',
      photo: this.photoPreview ? this.photoPreview.src : null
    };
    
    // Отображение предпросмотра
    this.preview.innerHTML = 
      <div class="preview-card">
        <div class="preview-header">
          <h3>Предпросмотр вашей истории</h3>
          <button onclick="document.getElementById('story-preview').innerHTML = ''" class="btn btn-secondary btn-sm">
            Закрыть
          </button>
        </div>
        
        <div class="preview-content">
          ${previewData.photo ? 
            <div class="preview-photo">
              <img src="${previewData.photo}" alt="Фото к истории">
            </div>
           : ''}
          
          <div class="preview-meta">
            <span class="preview-author">${previewData.author}</span>
            <span class="preview-kindergarten">${previewData.kindergarten}</span>
            <span class="preview-year">${previewData.year}</span>
            <span class="preview-role">${previewData.role}</span>
          </div>
          
          <div class="preview-text">
            <p>${this.formatPreviewText(previewData.text)}</p>
          </div>
        </div>
        
        <div class="preview-footer">
          <p class="preview-note">
            Так будет выглядеть ваша история после публикации
          </p>
        </div>
      </div>
    ;
    
    // Прокрутка к предпросмотру
    this.preview.scrollIntoView({ behavior: 'smooth' });
  }
  
  formatPreviewText(text) {
    // Ограничение длины текста для предпросмотра
    const maxLength = 500;
    if (text.length <= maxLength) return text;
    
    return text.substring(0, maxLength) + '...';
  }
  
  saveFormDraft() {
    // Сохранение черновика формы
    const formData = {
      author: document.getElementById('author-name').value,
      kindergarten: document.getElementById('kindergarten').value,
      year: document.getElementById('year').value,
      role: document.getElementById('role').value,
      text: document.getElementById('story-text').value,
      timestamp: Date.now()
    };
    
    localStorage.setItem('storyDraft', JSON.stringify(formData));
  }
  
  loadFormDraft() {
    // Загрузка черновика формы
    const draft = localStorage.getItem('storyDraft');
    if (!draft) return;
    
    const formData = JSON.parse(draft);
    
    // Заполнение полей формы
    Object.keys(formData).forEach(key => {
      const field = document.getElementById(key);
      if (field && formData[key]) {
        field.value = formData[key];
      }
    });
    
    // Показ уведомления о черновике
    this.showDraftNotification();
  }
  
  showDraftNotification() {
    const notification = document.createElement('div');
    notification.className = 'draft-notification';
    notification.innerHTML = `
      <span>💾 Загружен черновик вашей истории</span>
      <button onclick="this.closest('.draft-notification').remove()" class="btn btn-secondary btn-sm">
        Скрыть
      </button>
    `;
    
    this.form.prepend(notification);
    
    // Автоматическое скрытие
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 5000);
  }
  
  clearFormDraft() {
    // Очистка черновика
    localStorage.removeItem('storyDraft');
  }
  
  resetForm() {
    // Сброс формы
    this.form.reset();
    
    // Очистка превью фото
    if (this.photoPreview) {
      this.photoPreview.style.display = 'none';
      this.photoPreview.src = '';
    }
    
    // Очистка превью истории
    if (this.preview) {
      this.preview.innerHTML = '';
    }
  }
}

// Экспорт класса
if (typeof window !== 'undefined') {
  window.StoryFormHandler = StoryFormHandler;
}