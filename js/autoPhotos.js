const YANDEX_CONFIG = {
    // Публичная ссылка на папку с фото на Яндекс.Диске
    publicFolder: 'https://disk.yandex.ru/d/cJ6RJigW_DJeZA',

    // Или??? список публичных ссылок на файлы
    photos: [
        'https://disk.yandex.ru/i/ССЫЛКА_1',
        'https://disk.yandex.ru/i/ССЫЛКА_2',
        'https://disk.yandex.ru/i/ССЫЛКА_3',
        'https://disk.yandex.ru/i/ССЫЛКА_4',
        'https://disk.yandex.ru/i/ССЫЛКА_5'
    ]
};

// Функция получения прямой ссылки на изображение
function getYandexPreviewUrl(publicUrl, width = 800, height = 600) {
    const fileId = publicUrl.split('/i/')[1];
    return `https://downloader.disk.yandex.ru/preview/${fileId}?width=${width}&height=${height}&crop=false`;
}

// Функция загрузки информации о публичной папке
async function loadYandexFolder() {
    const container = document.getElementById('yandexFolderContainer');
    container.innerHTML = '<div class="photo-loading">?? Загрузка фотографий с Яндекс.Диска...</div>';

    try {
        // Используем Яндекс API для получения списка файлов
        const folderUrl = YANDEX_CONFIG.publicFolder;
        const folderKey = folderUrl.split('/d/')[1];

        // Создаем iframe для получения списка файлов (альтернативный метод)
        const response = await fetch(`https://disk.yandex.ru/d/cJ6RJigW_DJeZA`);

        if (!response.ok) {
            throw new Error('Не удалось загрузить список фото');
        }

        const data = await response.json();
        const photos = data._embedded.items.filter(item =>
            item.media_type === 'image' &&
            item.mime_type.startsWith('image/')
        );

        container.innerHTML = '';

        photos.slice(0, 12).forEach(photo => {
            const previewUrl = `https://downloader.disk.yandex.ru/preview/${photo.preview.split('/preview/')[1]}&width=400&height=300`;

            const item = document.createElement('div');
            item.className = 'photo-simple-item';

            const img = document.createElement('img');
            img.src = previewUrl;
            img.alt = photo.name || 'Фото с Яндекс.Диска';
            img.loading = 'lazy';

            img.onerror = () => {
                img.src = 'https://via.placeholder.com/400x300/f0f0f0/2c3e50?text=Фото+с+Яндекс.Диска';
            };

            item.appendChild(img);
            container.appendChild(item);
        });

    } catch (error) {
        console.error('Ошибка загрузки с Яндекс.Диска:', error);
        container.innerHTML = `
                <div class="no-photos">
                    <p>? Не удалось загрузить фото с Яндекс.Диска</p>
                    <p style="font-size: 0.9rem; color: #666;">Используем прямые ссылки на фото</p>
                </div>
            `;

        // Загружаем фото по прямым ссылкам как запасной вариант
        loadDirectYandexLinks();
    }
}

// Загрузка по прямым ссылкам (запасной вариант)
function loadDirectYandexLinks() {
    const container = document.getElementById('yandexFolderContainer');
    container.innerHTML = '';

    YANDEX_CONFIG.photos.forEach((link, index) => {
        const previewUrl = getYandexPreviewUrl(link);

        const item = document.createElement('div');
        item.className = 'photo-simple-item';

        const img = document.createElement('img');
        img.src = previewUrl;
        img.alt = `Фото ${index + 1}`;
        img.loading = 'lazy';

        img.onerror = function () {
            this.src = 'https://via.placeholder.com/400x300/f0f0f0/2c3e50?text=Яндекс.Диск';
        };

        item.appendChild(img);
        container.appendChild(item);
    });
}

// Запуск
document.addEventListener('DOMContentLoaded', () => {
    // Выберите один из методов:

    // 1. Если есть публичная папка:
    loadYandexFolder();

    // 2. Если есть прямые ссылки на фото:
    //loadDirectYandexLinks();
});