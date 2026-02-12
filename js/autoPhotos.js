// ФУНКЦИЯ ЗАГРУЗКИ ФОТО ИЗ ПАПКИ
(function () {
    const grid = document.getElementById('photoAlbumGrid');
    if (!grid) return;

    // ПУТЬ К ПАПКЕ С ФОТОГРАФИЯМИ
    // Для страницы в папке pages: ../images/albums/february2026/
    // Для страницы в корне: images/albums/february2026/
    const photoFolder = '../images/february2026/';

    // СПИСОК ФАЙЛОВ - УКАЖИТЕ ВАШИ РЕАЛЬНЫЕ ИМЕНА ФАЙЛОВ
    const photoFiles = [
        '1.jpg',
        '2.jpg',
        '3.jpg',
        '4.jpg',
        '5.jpg',
        '6.jpg',
        '7.jpg',
        '8.jpg',
        '9.jpg',
        '10.jpg',
        '11.jpg',
        '12.jpg'
    ];

    grid.innerHTML = '';

    // СОЗДАЕМ КАРТОЧКИ ФОТО
    photoFiles.forEach((fileName, index) => {
        const photoPath = photoFolder + fileName;

        const item = document.createElement('div');
        item.className = 'photo-simple-item';

        const img = document.createElement('img');
        img.src = photoPath;
        img.alt = `Фото ${index + 1} - Февральское совещание 2026`;
        img.loading = 'lazy';

        // Если фото не найдется - показываем заглушку
        img.onerror = function () {
            this.src = 'https://via.placeholder.com/400x300/f0f0f0/2c3e50?text=Фото+' + (index + 1);
            this.alt = 'Фото не загружено';
            console.log('Не найдено фото:', photoPath);
        };

        item.appendChild(img);
        grid.appendChild(item);
    });
})();