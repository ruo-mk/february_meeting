// js/stories-manager.js
class StoriesManager {
    constructor() {
        this.stories = [];
        this.filteredStories = [];
        this.currentFilters = {
            search: '',
            year: 'all',
            role: 'all',
            sort: 'newest'
        };
        this.currentView = 'grid';
        this.currentPage = 1;
        this.storiesPerPage = 6;
        
        this.init();
    }
    
    init() {
        console.log('Инициализация менеджера историй...');
        
        // Загрузка данных
        this.loadStories();
        
        // Настройка обработчиков событий
        this.setupEventListeners();
        
        // Применение начальных фильтров
        this.applyFilters();
        
        // Обновление статистики
        this.updateStatistics();
    }
    
    async loadStories() {
        try {
            // Пытаемся загрузить из API
            const response = await fetch('../data/stories-data.json');
            this.stories = await response.json();
            console.log(`Загружено ${this.stories.length} историй`);
        } catch (error) {
            console.warn('Не удалось загрузить истории, используем примеры:', error);
            this.loadSampleStories();
        }
    }
    
    loadSampleStories() {
        // Примеры историй, если не удалось загрузить из файла
        this.stories = [
            {
                id: 1,
                title: "Мои первые шаги в детском саду",
                author: "Мария Иванова",
                role: "graduate",
                kindergarten: "Солнышко",
                location: "с. Майя",
                year: 1978,
                content: "Помню, как мы в садике сажали первые деревья в нашем дворе...",
                image: "../images/stories/1978-tree.jpg",
                date: "2023-05-15",
                likes: 24,
                comments: 5,
                tags: ["первый день", "деревья", "воспитатели"],
                featured: true
            },
            {
                id: 2,
                title: "35 лет воспитателем",
                author: "Петр Семенов",
                role: "teacher",
                kindergarten: "Чэчир",
                location: "с. Майя",
                year: 1995,
                content: "35 лет работаю воспитателем. Помню, как в 1995 году мы впервые организовали якутский национальный праздник...",
                quote: "Дети - как чистый лист бумаги. Что нарисуешь, то и останется.",
                date: "2023-06-22",
                likes: 42,
                comments: 12,
                tags: ["воспитатели", "праздники", "традиции"]
            },
            // ... остальные истории из HTML
        ];
        
        console.log(`Загружено ${this.stories.length} примеров историй`);
    }
    
    setupEventListeners() {
        // Поиск
        const searchInput = document.getElementById('story-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentFilters.search = e.target.value;
                this.applyFilters();
            });
        }
        
        // Очистка поиска
        const clearSearch = document.getElementById('clear-search');
        if (clearSearch) {
            clearSearch.addEventListener('click', () => {
                searchInput.value = '';
                this.currentFilters.search = '';
                this.applyFilters();
            });
        }
        
        // Фильтры
        document.getElementById('year-filter')?.addEventListener('change', (e) => {
            this.currentFilters.year = e.target.value;
            this.applyFilters();
        });
        
        document.getElementById('role-filter')?.addEventListener('change', (e) => {
            this.currentFilters.role = e.target.value;
            this.applyFilters();
        });
        
        document.getElementById('sort-filter')?.addEventListener('change', (e) => {
            this.currentFilters.sort = e.target.value;
            this.applyFilters();
        });
        
        // Переключение вида
        document.getElementById('grid-view')?.addEventListener('click', () => {
            this.switchView('grid');
        });
        
        document.getElementById('list-view')?.addEventListener('click', () => {
            this.switchView('list');
        });
        
        // Пагинация
        document.querySelectorAll('.page-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = parseInt(e.target.textContent);
                if (!isNaN(page)) {
                    this.goToPage(page);
                }
            });
        });
        
        document.querySelector('.prev-btn')?.addEventListener('click', () => {
            this.prevPage();
        });
        
        document.querySelector('.next-btn')?.addEventListener('click', () => {
            this.nextPage();
        });
        
        // Лайки
        document.addEventListener('click', (e) => {
            if (e.target.closest('.like-btn')) {
                this.handleLike(e.target.closest('.like-btn'));
            }
            
            if (e.target.closest('.comment-btn')) {
                this.handleComment(e.target.closest('.story-card'));
            }
            
            if (e.target.closest('.share-btn')) {
                this.handleShare(e.target.closest('.story-card'));
            }
            
            if (e.target.closest('.tag-cloud')) {
                e.preventDefault();
                const tag = e.target.closest('.tag-cloud').dataset.tag;
                this.filterByTag(tag);
            }
        });
        
        // Модальное окно
        const modal = document.getElementById('story-modal');
        const closeModal = modal?.querySelector('.modal-close');
        
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                modal.classList.remove('show');
            });
        }
        
        // Закрытие модального окна при клике вне его
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
    }
    
    applyFilters() {
        let filtered = [...this.stories];
        
        // Фильтр по поиску
        if (this.currentFilters.search) {
            const searchTerm = this.currentFilters.search.toLowerCase();
            filtered = filtered.filter(story => 
                story.content.toLowerCase().includes(searchTerm) ||
                story.author.toLowerCase().includes(searchTerm) ||
                story.kindergarten.toLowerCase().includes(searchTerm) ||
                story.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
            );
        }
        
        // Фильтр по году
        if (this.currentFilters.year !== 'all') {
            const decade = parseInt(this.currentFilters.year);
            filtered = filtered.filter(story => 
                story.year >= decade && story.year < decade + 10
            );
        }
        
        // Фильтр по роли
        if (this.currentFilters.role !== 'all') {
            filtered = filtered.filter(story => 
                story.role === this.currentFilters.role
            );
        }
        
        // Сортировка
        filtered.sort((a, b) => {
            switch (this.currentFilters.sort) {
                case 'newest':
                    return new Date(b.date) - new Date(a.date);
                case 'oldest':
                    return new Date(a.date) - new Date(b.date);
                case 'popular':
                    return b.likes - a.likes;
                case 'random':
                    return Math.random() - 0.5;
                default:
                    return 0;
            }
        });
        
        this.filteredStories = filtered;
        this.displayStories();
        this.updateActiveFilters();
    }
    
    displayStories() {
        const container = document.getElementById('stories-grid');
        if (!container) return;
        
        // Показать/скрыть сообщение об отсутствии историй
        const noStoriesMsg = document.getElementById('no-stories-message');
        if (noStoriesMsg) {
            noStoriesMsg.style.display = this.filteredStories.length === 0 ? 'block' : 'none';
        }
        
        // Рассчитать какие истории показывать на текущей странице
        const startIndex = (this.currentPage - 1) * this.storiesPerPage;
        const endIndex = startIndex + this.storiesPerPage;
        const storiesToShow = this.filteredStories.slice(startIndex, endIndex);
        
        // Очистить контейнер
        container.innerHTML = '';
        
        // Добавить истории
        storiesToShow.forEach(story => {
            const storyElement = this.createStoryElement(story);
            container.appendChild(storyElement);
        });
        
        // Обновить пагинацию
        this.updatePagination();
        
        // Обновить счетчик
        this.updateCounter();
    }
    
    createStoryElement(story) {
        const article = document.createElement('article');
        article.className = 'story-card';
        article.dataset.id = story.id;
        article.dataset.year = story.year;
        article.dataset.role = story.role;
        article.dataset.kindergarten = story.kindergarten;
        
        if (story.featured) {
            article.classList.add('featured');
        }
        
        // Определяем иконку роли
        let roleIcon, roleText;
        switch (story.role) {
            case 'graduate':
                roleIcon = 'fa-graduation-cap';
                roleText = 'Выпускник';
                break;
            case 'teacher':
                roleIcon = 'fa-chalkboard-teacher';
                roleText = 'Воспитатель';
                break;
            case 'parent':
                roleIcon = 'fa-user-friends';
                roleText = 'Родитель';
                break;
            case 'veteran':
                roleIcon = 'fa-award';
                roleText = 'Ветеран';
                break;
            default:
                roleIcon = 'fa-user';
                roleText = 'Участник';
        }
        
        // Создаем HTML структуру
        article.innerHTML = `
            <div class="story-badge">
                ${story.featured ? '<span class="badge featured-badge"><i class="fas fa-star"></i> Избранное</span>' : ''}
                <span class="badge year-badge">${story.year}</span>
                <span class="badge role-badge">
                    <i class="fas ${roleIcon}"></i> ${roleText}
                </span>
            </div>
            
            <div class="story-header">
                <div class="author-avatar">
                    ${story.avatar ? 
                        `<img src="${story.avatar}" alt="${story.author}">` : 
                        `<div class="avatar-initials">${this.getInitials(story.author)}</div>`
                    }
                </div>
                <div class="author-info">
                    <h3 class="author-name">${story.author}</h3>
                    <span class="author-role">
                        <i class="fas ${roleIcon}"></i> ${roleText}
                    </span>
                    <span class="story-kindergarten">
                        <i class="fas fa-school"></i> Д/с "${story.kindergarten}", ${story.location}
                    </span>
                </div>
            </div>
            
            <div class="story-content">
                <p>${this.truncateText(story.content, 200)}</p>
                
                ${story.quote ? `
                    <blockquote class="story-quote">
                        "${story.quote}"
                    </blockquote>
                ` : ''}
                
                ${story.image ? `
                    <div class="story-photos">
                        <img src="${story.image}" alt="Иллюстрация к истории" class="story-photo">
                    </div>
                ` : ''}
                
                ${story.tags?.length ? `
                    <div class="story-tags">
                        ${story.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
            
            <div class="story-footer">
                <div class="story-meta">
                    <span class="story-date">
                        <i class="far fa-calendar"></i> ${this.formatDate(story.date)}
                    </span>
                    <span class="story-reading-time">
                        <i class="far fa-clock"></i> ${this.calculateReadingTime(story.content)} мин чтения
                    </span>
                </div>
                
                <div class="story-actions">
                    <button class="action-btn like-btn" data-likes="${story.likes || 0}">
                        <i class="far fa-heart"></i> <span>${story.likes || 0}</span>
                    </button>
                    <button class="action-btn comment-btn">
                        <i class="far fa-comment"></i> <span>${story.comments || 0}</span>
                    </button>
                    <button class="action-btn share-btn">
                        <i class="fas fa-share-alt"></i>
                    </button>
                </div>
            </div>
        ;
        
        // Добавляем обработчик клика для открытия полной истории
        article.addEventListener('click', (e) => {
            if (!e.target.closest('.action-btn')) {
                this.showStoryDetails(story);
            }
        });
        
        return article;
    }
    
    showStoryDetails(story) {
        const modal = document.getElementById('story-modal');
        const modalContent = document.getElementById('modal-story-content');
        
        if (!modal || !modalContent) return;
        
        // Определяем иконку роли
        let roleIcon, roleText;
        switch (story.role) {
            case 'graduate':
                roleIcon = 'fa-graduation-cap';
                roleText = 'Выпускник';
                break;
            case 'teacher':
                roleIcon = 'fa-chalkboard-teacher';
                roleText = 'Воспитатель';
                break;
            case 'parent':
                roleIcon = 'fa-user-friends';
                roleText = 'Родитель';
                break;
            case 'veteran':
                roleIcon = 'fa-award';
                roleText = 'Ветеран';
                break;
            default:
                roleIcon = 'fa-user';
                roleText = 'Участник';
        }
        
        modalContent.innerHTML = `
            <div class="story-detail">
                <div class="detail-header">
                    <div class="author-avatar large">
                        ${story.avatar ? 
                            `<img src="${story.avatar}" alt="${story.author}">` : 
                            `<div class="avatar-initials">${this.getInitials(story.author)}</div>`
                        }
                    </div>
                    <div class="author-details">
                        <h3>${story.author}</h3>
                        <div class="detail-meta">
                            <span class="detail-role">
                                <i class="fas ${roleIcon}"></i> ${roleText}
                            </span>
                            <span class="detail-kindergarten">
                                <i class="fas fa-school"></i> Детский сад "${story.kindergarten}", ${story.location}
                            </span>
                            <span class="detail-year">
                                <i class="fas fa-calendar-alt"></i> ${story.year} год
                            </span>
                        </div>
                    </div>
                </div>
                
                <div class="detail-content">
                    <p>${story.content}</p>
                    
                    ${story.quote ? `
                        <blockquote class="detail-quote">
                            "${story.quote}"
                        </blockquote>
                    ` : ''}
                    
                    ${story.image ? `
                        <div class="detail-photo">
                            <img src="${story.image}" alt="Иллюстрация к истории">
                            <p class="photo-caption">Фото из архива</p>
                        </div>
                    ` : ''}
                    
                    ${story.tags?.length ? `
                        <div class="detail-tags">
                            <strong>Теги:</strong>
                            ${story.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
                
                <div class="detail-footer">
                    <div class="detail-stats">
                        <span class="detail-stat">
                            <i class="far fa-calendar"></i> Опубликовано: ${this.formatDate(story.date, true)}
                        </span>
                        <span class="detail-stat">
                            <i class="far fa-clock"></i> Время чтения: ${this.calculateReadingTime(story.content)} минут
                        </span>
                    </div>
                    
                    <div class="detail-actions">
                        <button class="btn btn-primary" onclick="StoriesManager.likeStory(${story.id})">
                            <i class="far fa-heart"></i> Нравится (${story.likes || 0})
                        </button>
                        <button class="btn btn-secondary" onclick="StoriesManager.shareStory(${story.id})">
                            <i class="fas fa-share-alt"></i> Поделиться
                        </button>
                    </div>
                </div>
            </div>
        ;
        
        modal.classList.add('show');
    }
    
    switchView(view) {
        this.currentView = view;
        const container = document.getElementById('stories-grid');
        const gridBtn = document.getElementById('grid-view');
        const listBtn = document.getElementById('list-view');
        
        if (view === 'grid') {
            container.classList.remove('list-view');
            gridBtn.classList.add('active');
            listBtn.classList.remove('active');
        } else {
            container.classList.add('list-view');
            gridBtn.classList.remove('active');
            listBtn.classList.add('active');
        }
    }
    
    goToPage(page) {
        this.currentPage = page;
        this.displayStories();
        this.updateActivePageButton();
    }
    
    prevPage() {
        if (this.currentPage > 1) {
            this.goToPage(this.currentPage - 1);
        }
    }
    
    nextPage() {
        const totalPages = Math.ceil(this.filteredStories.length / this.storiesPerPage);
        if (this.currentPage < totalPages) {
            this.goToPage(this.currentPage + 1);
        }
    }
    
    updatePagination() {
        const totalPages = Math.ceil(this.filteredStories.length / this.storiesPerPage);
        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');
        const pageNumbers = document.querySelector('.page-numbers');
        
        // Обновляем состояние кнопок
        if (prevBtn) {
            prevBtn.disabled = this.currentPage === 1;
        }
        
        if (nextBtn) {
            nextBtn.disabled = this.currentPage === totalPages;
        }
        
        // Обновляем номера страниц
        if (pageNumbers) {
            // Упрощенная логика отображения страниц
            pageNumbers.innerHTML = '';
            
            for (let i = 1; i <= Math.min(totalPages, 5); i++) {
                const btn = document.createElement('button');
                btn.className = `page-btn ${i === this.currentPage ? 'active' : ''}`;
                btn.textContent = i;
                btn.addEventListener('click', () => this.goToPage(i));
                pageNumbers.appendChild(btn);
            }
            
            if (totalPages > 5) {
                const dots = document.createElement('span');
                dots.className = 'page-dots';
                dots.textContent = '...';
                pageNumbers.appendChild(dots);
                
                const lastBtn = document.createElement('button');
                lastBtn.className = `page-btn ${totalPages === this.currentPage ? 'active' : ''}`;
                lastBtn.textContent = totalPages;
                lastBtn.addEventListener('click', () => this.goToPage(totalPages));
                pageNumbers.appendChild(lastBtn);
            }
        }
    }
    
    updateActivePageButton() {
        document.querySelectorAll('.page-btn').forEach(btn => {
            btn.classList.remove('active');
            if (parseInt(btn.textContent) === this.currentPage) {
                btn.classList.add('active');
            }
        });
    }
    
    updateCounter() {
        const shownElement = document.getElementById('shown-stories');
        const totalElement = document.getElementById('total-stories-count');
        
        if (shownElement) {
            const startIndex = (this.currentPage - 1) * this.storiesPerPage;
            const endIndex = Math.min(startIndex + this.storiesPerPage, this.filteredStories.length);
            shownElement.textContent = endIndex - startIndex;
        }
        
        if (totalElement) {
            totalElement.textContent = this.filteredStories.length;
        }
    }
    
    updateStatistics() {
        // Обновляем статистику в боковой панели
        document.getElementById('total-stories').textContent = this.stories.length;
        
        // Подсчитываем уникальных авторов
        const uniqueAuthors = [...new Set(this.stories.map(s => s.author))];
        document.getElementById('total-authors').textContent = uniqueAuthors.length;
        
        // Подсчитываем уникальные детские сады
        const uniqueKindergartens = [...new Set(this.stories.map(s => s.kindergarten))];
        document.getElementById('total-kindergartens').textContent = uniqueKindergartens.length;
        
        // Находим самый ранний год
        const oldestYear = Math.min(...this.stories.map(s => s.year));
        document.getElementById('oldest-year').textContent = oldestYear;
    }
    
    updateActiveFilters() {
        const container = document.getElementById('active-filters');
        if (!container) return;
        
        container.innerHTML = '';
        
        // Добавляем фильтры
        if (this.currentFilters.search) {
            this.addFilterTag('search', `Поиск: "${this.currentFilters.search}"`);
        }
        
        if (this.currentFilters.year !== 'all') {
            const decade = this.currentFilters.year;
            this.addFilterTag('year', `Годы: ${decade}-е`);
        }
        
        if (this.currentFilters.role !== 'all') {
            let roleText = '';
            switch (this.currentFilters.role) {
                case 'graduate': roleText = 'Выпускники'; break;
                case 'teacher': roleText = 'Воспитатели'; break;
                case 'parent': roleText = 'Родители'; break;
                case 'veteran': roleText = 'Ветераны'; break;
            }
            this.addFilterTag('role', `Роль: ${roleText}`);
        }
    }
    
    addFilterTag(type, text) {
        const container = document.getElementById('active-filters');
        const tag = document.createElement('div');
        tag.className = 'filter-tag';
        tag.innerHTML = `
            ${text}
            <button class="remove-tag" data-filter="${type}">&times;</button>
        ;
        
        tag.querySelector('.remove-tag').addEventListener('click', (e) => {
            this.removeFilter(type);
        });
        
        container.appendChild(tag);
    }
    
    removeFilter(type) {
        switch (type) {
            case 'search':
                this.currentFilters.search = '';
                document.getElementById('story-search').value = '';
                break;
            case 'year':
                this.currentFilters.year = 'all';
                document.getElementById('year-filter').value = 'all';
                break;
            case 'role':
                this.currentFilters.role = 'all';
                document.getElementById('role-filter').value = 'all';
                break;
        }
        
        this.applyFilters();
    }
    
    filterByTag(tag) {
        // Добавляем тег в поиск
        const searchInput = document.getElementById('story-search');
        searchInput.value = tag;
        this.currentFilters.search = tag;
        this.applyFilters();
    }
    
    handleLike(button) {
        const storyId = button.closest('.story-card').dataset.id;
        const likesSpan = button.querySelector('span');
        let likes = parseInt(likesSpan.textContent);
        
        if (button.classList.contains('active')) {
            // Убираем лайк
            likes--;
            button.classList.remove('active');
            button.querySelector('i').className = 'far fa-heart';
        } else {
            // Ставим лайк
            likes++;
            button.classList.add('active');
            button.querySelector('i').className = 'fas fa-heart';
        }
        
        likesSpan.textContent = likes;
        
        // Сохраняем в localStorage
        this.saveLike(storyId, button.classList.contains('active'));
    }
    
    saveLike(storyId, liked) {
        const likes = JSON.parse(localStorage.getItem('story-likes') || '{}');
        likes[storyId] = liked;
        localStorage.setItem('story-likes', JSON.stringify(likes));
    }
    
    handleComment(storyCard) {
        const storyId = storyCard.dataset.id;
        alert(`Комментарии к истории #${storyId}. В будущем здесь будет форма для комментариев.`);
    }
    
    handleShare(storyCard) {
        const storyId = storyCard.dataset.id;
        const story = this.stories.find(s => s.id == storyId);
        
        if (story && navigator.share) {
            navigator.share({
                title: `История: ${story.author}`,
                text: story.content.substring(0, 100) + '...',
                url: window.location.href + `?story=${storyId}`
            });
        } else {
            alert('Скопируйте ссылку для совместного использования истории!');
        }
    }
    
    // Вспомогательные методы
    getInitials(name) {
        return name.split(' ').map(word => word[0]).join('').toUpperCase();
    }
    
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
    
    formatDate(dateString, full = false) {
        const date = new Date(dateString);
        const options = full ? {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        } : {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        };
        
        return date.toLocaleDateString('ru-RU', options);
    }
    
    calculateReadingTime(text) {
        const wordsPerMinute = 200;
        const words = text.trim().split(/\s+/).length;
        return Math.ceil(words / wordsPerMinute);
    }
    
    // Статические методы для глобального доступа
    static likeStory(storyId) {
        alert(`Лайк для истории #${storyId}`);
    }
    
    static shareStory(storyId) {
        alert(`Поделиться историей #${storyId}`);
    }
}

// Инициализация при загрузке страницы
if (typeof window !== 'undefined') {
    window.StoriesManager = StoriesManager;
}