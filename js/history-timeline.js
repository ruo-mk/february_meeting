class HistoryTimeline {
  constructor(timelineData) {
    this.timelineData = timelineData || [];
    this.currentYear = 1924;
    this.container = document.querySelector('.timeline-container');
    
    if (this.container) {
      this.init();
    }
  }
  
  init() {
    this.renderTimeline();
    this.setupEventListeners();
  }
  
  renderTimeline() {
    if (!this.container) return;
    
    // Сортируем данные по году
    const sortedData = [...this.timelineData].sort((a, b) => a.year - b.year);
    
    // Создаем HTML для временной шкалы
    this.container.innerHTML = 
      <div class="timeline-header">
        <h2>История дошкольного образования Мегино-Кангаласского улуса</h2>
        <div class="timeline-controls">
          <button id="prev-decade">← Предыдущее десятилетие</button>
          <span id="current-decade">1920-е</span>
          <button id="next-decade">Следующее десятилетие →</button>
        </div>
      </div>
      
      <div class="timeline">
        ${this.renderDecades(sortedData)}
      </div>
      
      <div class="timeline-details" id="timeline-details">
        <p>Выберите период на временной шкале, чтобы узнать подробности</p>
      </div>
    ;
  }
  
  renderDecades(data) {
    let html = '';
    const currentYear = new Date().getFullYear();
    
    // Создаем декады с 1920 по текущее время
    for (let decade = 1920; decade <= currentYear; decade += 10) {
      const decadeEvents = data.filter(event => 
        event.year >= decade && event.year < decade + 10
      );
      
      html += 
        <div class="decade" data-decade="${decade}">
          <div class="decade-label">
            ${decade}-е
          </div>
          <div class="decade-events">
            ${this.renderEvents(decadeEvents)}
          </div>
        </div>
      ;
    }
    
    return html;
  }
  
  renderEvents(events) {
    if (events.length === 0) {
      return '<div class="no-events">Нет данных за этот период</div>';
    }
    
    return events.map(event => `
      <div class="timeline-event" data-event-id="${event.id}">
        <div class="event-year">${event.year}</div>
        <div class="event-title">${event.title}</div>
      </div>
    `).join('');
  }
  
  setupEventListeners() {
    // Обработчики для событий временной шкалы
    document.querySelectorAll('.timeline-event').forEach(eventElement => {
      eventElement.addEventListener('click', (e) => {
        const eventId = e.currentTarget.dataset.eventId;
        this.showEventDetails(eventId);
      });
    });
    
    // Обработчики для кнопок навигации
    const prevButton = document.getElementById('prev-decade');
    const nextButton = document.getElementById('next-decade');
    
    if (prevButton) {
      prevButton.addEventListener('click', () => this.navigateDecade(-1));
    }
    
    if (nextButton) {
      nextButton.addEventListener('click', () => this.navigateDecade(1));
    }
    
    // Анимация при скролле
    this.setupScrollAnimation();
  }
  
  showEventDetails(eventId) {
    const event = this.timelineData.find(e => e.id == eventId);
    if (!event) return;
    
    const detailsContainer = document.getElementById('timeline-details');
    
    detailsContainer.innerHTML = 
      <div class="event-details">
        <div class="event-details-header">
          <h3>${event.title}</h3>
          <span class="event-year-badge">${event.year} год</span>
        </div>
        
        <div class="event-content">
          <p>${event.description}</p>
          
          ${event.image ? `<img src="${event.image}" alt="${event.title}" class="event-image">` : ''}
          
          ${event.stats ? 
            <div class="event-stats">
              <h4>Статистика периода:</h4>
              <ul>
                ${Object.entries(event.stats).map(([key, value]) => `
                  <li><strong>${key}:</strong> ${value}</li>
                `).join('')}
              </ul>
            </div>
           : ''}
          
          ${event.quote ? `
            <blockquote class="event-quote">
              "${event.quote}"
              ${event.quoteAuthor ? `<footer>— ${event.quoteAuthor}</footer>` : ''}
            </blockquote>
          ` : ''}
        </div>
        
        <div class="event-footer">
          <button class="btn btn-secondary" onclick="this.closest('.event-details').remove()">
            Закрыть
          </button>
        </div>
      </div>
    ;
    
    // Анимация появления
    detailsContainer.classList.add('fade-in');
    
    // Прокрутка к деталям
    detailsContainer.scrollIntoView({ behavior: 'smooth' });
  }
  
  navigateDecade(direction) {
    // Навигация по десятилетиям
    const decadeElements = document.querySelectorAll('.decade');
    const currentDecadeElement = document.querySelector('.decade.active');
    
    let currentIndex = 0;
    if (currentDecadeElement) {
      currentIndex = Array.from(decadeElements).indexOf(currentDecadeElement);
    }
    
    const newIndex = Math.max(0, Math.min(decadeElements.length - 1, currentIndex + direction));
    
    // Обновление активного элемента
    decadeElements.forEach(el => el.classList.remove('active'));
    decadeElements[newIndex].classList.add('active');
    
    // Обновление отображаемого десятилетия
    const decadeLabel = document.getElementById('current-decade');
    if (decadeLabel) {
      const decade = decadeElements[newIndex].dataset.decade;
      decadeLabel.textContent = `${decade}-е`;
    }
    
    // Прокрутка к активному десятилетию
    decadeElements[newIndex].scrollIntoView({
      behavior: 'smooth',
      block: 'nearest'
    });
  }
  
  setupScrollAnimation() {
    // Анимация элементов при скролле
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, {
      threshold: 0.1
    });
    
    document.querySelectorAll('.timeline-event').forEach(event => {
      observer.observe(event);
    });
  }
}

// Экспорт класса для глобального использования
if (typeof window !== 'undefined') {
  window.HistoryTimeline = HistoryTimeline;
}