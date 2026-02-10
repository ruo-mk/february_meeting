class DigitalMascot {
  constructor() {
    this.mascotElement = document.getElementById('digital-mascot');
    this.mascotImage = document.getElementById('mascot-image');
    this.speechBubble = document.getElementById('mascot-speech');
    this.phrases = this.loadPhrases();
    this.currentMood = 'idle';
    this.isSpeaking = false;
    
    this.init();
  }
  
  init() {
    // Загрузка настроек талисмана
    this.loadSettings();
    
    // Начальная анимация
    setTimeout(() => {
      this.sayRandomGreeting();
    }, 1000);
    
    // Обработчик клика по талисману
    this.mascotImage.addEventListener('click', () => {
      this.onClick();
    });
    
    // Обработчики событий страницы
    this.setupEventListeners();
    
    // Периодические реакции
    setInterval(() => {
      if (!this.isSpeaking) {
        this.randomReaction();
      }
    }, 30000);
  }
  
  loadPhrases() {
    return {
      greetings: [
        //"Привет! Я - талисман 100-летия дошкольного образования.",
        //"Здравствуйте! Давайте узнаем историю вместе!",
        //"Приветствую! Хотите добавить свою историю?",
        "Рад вас видеть! Ждем вас на Февральском совещаним работников образования и педагогической общественности."
      ],
        history: [
        "Внимательно просмотрите программу совещаним.",
        //"Знаете ли вы, что первый детский сад в нашем улусе открылся в 1924 году?",
        //"За 100 лет дошкольное образование прошло огромный путь развития!",
        //"В разные годы детские сады назывались по-разному, но суть оставалась прежней - забота о детях."
      ],
        stories: [
            "Внимательно просмотрите программу совещаним.",
        //"Почитайте истории выпускников - они очень вдохновляют!",
        //"Каждая история - это частичка нашей общей памяти.",
        //"Вот история воспитателя с 40-летним стажем..."
      ],
        encouragement: [
            "Внимательно просмотрите программу совещаним.",
        //"Добавьте свою историю - она важна для будущих поколений!",
        //"Расскажите о своем детском саде - пусть другие тоже узнают о нем.",
        //"Ваши воспоминания помогут сохранить историю живой."
      ],
      offline: [
        //"Вы сейчас офлайн, но можете просматривать сохраненные истории!",
        //"Не беспокойтесь, ваша история будет отправлена, когда появится интернет."
      ],
      online: [
        //"Снова онлайн! Все истории синхронизированы.",
        //"Интернет восстановлен - можно загружать новые воспоминания!"
      ]
    };
  }
  
  say(text, duration = 3000) {
    this.isSpeaking = true;
    this.mascotElement.classList.add('talking');
    this.speechBubble.textContent = text;
    
    // Меняем выражение лица
    this.changeMood('talking');
    
    // Автоматически скрываем через заданное время
    setTimeout(() => {
      this.stopSpeaking();
    }, duration);
  }
  
  stopSpeaking() {
    this.mascotElement.classList.remove('talking');
    this.changeMood('idle');
    this.isSpeaking = false;
  }
  
  sayRandomGreeting() {
    const greetings = this.phrases.greetings;
    const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
    this.say(randomGreeting);
  }
  
  sayRandomPhrase(category) {
    if (this.phrases[category]) {
      const phrases = this.phrases[category];
      const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
      this.say(randomPhrase);
    }
  }
  
  changeMood(mood) {
    this.currentMood = mood;
    this.mascotElement.classList.remove('happy', 'sad', 'talking', 'listening');
    
    switch(mood) {
      case 'happy':
        this.mascotImage.src = 'images/mascot/horse-happy.png';
        this.mascotElement.classList.add('happy');
        break;
      case 'talking':
        this.mascotImage.src = 'images/mascot/horse-talking.png';
        this.mascotElement.classList.add('talking');
        break;
      default:
        this.mascotImage.src = 'images/mascot/horse-idle.png';
    }
  }
  
  onClick() {
    // Анимация клика
    this.mascotElement.classList.add('bouncing');
    setTimeout(() => {
      this.mascotElement.classList.remove('bouncing');
    }, 500);
    
    // Случайная реакция на клик
    const reactions = ['greetings', 'encouragement', 'stories'];
    const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
    this.sayRandomPhrase(randomReaction);
  }
  
  randomReaction() {
    const reactions = [
      () => this.sayRandomPhrase('history'),
      () => this.sayRandomPhrase('stories'),
      () => this.sayRandomPhrase('encouragement')
    ];
    
    const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
    randomReaction();
  }
  
  setupEventListeners() {
    // Реакция на изменение онлайн-статуса
    window.addEventListener('online', () => {
      this.changeMood('happy');
      this.sayRandomPhrase('online');
    });
    
    window.addEventListener('offline', () => {
      this.changeMood('sad');
      this.sayRandomPhrase('offline');
    });
    
    // Реакция на отправку истории
    document.addEventListener('storySubmitted', (event) => {
      this.changeMood('happy');
      this.say('Спасибо за вашу историю! Она скоро появится в общем архиве.', 4000);
    });
    
    // Реакция на переход между страницами
    window.addEventListener('pageChanged', (event) => {
      const page = event.detail.page;
      
      switch(page) {
        case 'history':
          setTimeout(() => {
            this.sayRandomPhrase('history');
          }, 1000);
          break;
        case 'stories':
          setTimeout(() => {
            this.sayRandomPhrase('stories');
          }, 1000);
          break;
        case 'add-story':
          this.changeMood('listening');
          this.say('Я внимательно слушаю вашу историю...');
          break;
      }
    });
  }
  
  loadSettings() {
    const savedSettings = localStorage.getItem('mascotSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      // Применение сохраненных настроек
      if (settings.lastMood) {
        this.changeMood(settings.lastMood);
      }
    }
  }
  
  saveSettings() {
    const settings = {
      lastMood: this.currentMood,
      lastInteraction: new Date().toISOString()
    };
    localStorage.setItem('mascotSettings', JSON.stringify(settings));
  }
}

// Инициализация талисмана при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  window.digitalMascot = new DigitalMascot();
});