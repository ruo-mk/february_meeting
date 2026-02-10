//class videoContent {
	
//    constructor() {
//    this.videoContainer = document.getElementById('videoContainer');
//    this.toggleBtn = document.getElementById('toggleBtn');
//    this.toggleBtn = document.getElementById('toggleBtn');
//    this.btnText = toggleBtn.querySelector('.btn-text');
    
    
//    this.init();
//    }

//    document.addEventListener('DOMContentLoaded', function() {
//        const videoContainer = document.getElementById('videoContainer');
//        const toggleBtn = document.getElementById('toggleBtn');
//        const statusText = document.getElementById('statusText');
//        const btnText = toggleBtn.querySelector('.btn-text');
    
//        let isVideoVisible = true;
    
//        function toggleVideo() {
//            isVideoVisible = !isVideoVisible;
        
//            if (isVideoVisible) {
//                // Показываем видео
//                videoContainer.classList.remove('hidden');
//                btnText.textContent = 'Выключить видео';
//                statusText.textContent = 'Включено';
//                statusText.className = 'status-on';
//            } else {
//                // Скрываем видео
//                videoContainer.classList.add('hidden');
//                btnText.textContent = 'Включить видео';
//                statusText.textContent = 'Выключено';
//                statusText.className = 'status-off';
//            }
//        }
    
//        // Обработчик клика по кнопке
//        toggleBtn.addEventListener('click', toggleVideo);
    
//        // Обработчик клавиши пробела для переключения
//        document.addEventListener('keydown', function(event) {
//            if (event.code === 'Space') {
//                event.preventDefault(); // Предотвращаем прокрутку страницы
//                toggleVideo();
//            }
//        });
    
//        // Инициализация
//        console.log('Видеоплеер готов. Нажмите кнопку или пробел для переключения.');
//    });
//}

//document.addEventListener('DOMContentLoaded', () => {
//  window.app = new videoContent();
//});
