/**
 * CHRONICLES: INTERACTIVE BOOK ENGINE (CORE)
 * ------------------------------------------
 * Цей скрипт керує фізикою книги, станом сторінок,
 * 3D-трансформаціями та аудіо-супроводом.
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. CONFIGURATION & STATE ---

    const CONFIG = {
        totalSpreadWidth: 920, // Ширина розвороту в px (базова)
        mobileBreakpoint: 900,
        animDuration: 1400, // ms (має співпадати з CSS transition)
        debounceTime: 600,  // ms (заборона кліку під час анімації)
    };

    const STATE = {
        currentPage: 0,
        totalPages: 0,
        isAnimating: false,
        isMobile: false,
        audioEnabled: true // Можна вимкнути, якщо треба
    };

    // DOM Elements
    const dom = {
        book: document.getElementById('book'),
        pages: Array.from(document.querySelectorAll('.page')),
        frames: document.querySelectorAll('.magic-frame'),
        audio: {
            flip: document.getElementById('sfx-flip')
        }
    };

    STATE.totalPages = dom.pages.length;

    // --- 2. AUDIO ENGINE ---

    const AudioManager = {
        playFlip() {
            if (!STATE.audioEnabled || !dom.audio.flip) return;
            
            // Скидаємо час на 0, щоб грати швидко повторно
            dom.audio.flip.currentTime = 0;
            
            // Рандомізація швидкості відтворення (імітація різних звуків)
            // playbackRate від 0.9 до 1.1
            dom.audio.flip.playbackRate = 0.9 + Math.random() * 0.2;
            
            // Рандомізація гучності
            dom.audio.flip.volume = 0.4 + Math.random() * 0.2;
            
            // Спроба відтворення (браузер може блокувати без взаємодії)
            dom.audio.flip.play().catch(e => console.log('Audio blocked:', e));
        },
        
        playMagicError() {
            // Тут можна додати звук "помилки" або "магії"
            // Поки що просто лог
            console.log('✨ Magic Locked');
        }
    };

    // --- 3. PHYSICS & RENDERING ---

    function initBook() {
        checkMobile();
        
        // Встановлюємо початковий порядок шарів (Stacking Order)
        // Сторінки справа: 0 зверху, потім 1, 2...
        dom.pages.forEach((page, i) => {
            page.style.zIndex = STATE.totalPages - i;
        });

        updateBookPosition(true); // true = force instant update
        attachEvents();
        
        // Анімація "появи" (Entrance)
        setTimeout(() => {
            dom.book.style.opacity = '1';
        }, 100);
    }

    function updateZIndexes() {
        // Алгоритм Z-сортування для 3D книги
        dom.pages.forEach((page, i) => {
            let zVal;
            if (i < STATE.currentPage) {
                // Ліві сторінки (вже перегорнуті)
                // Чим більший індекс, тим вище сторінка (1 накриває 0)
                zVal = i + 1;
            } else {
                // Праві сторінки (ще не перегорнуті)
                // Чим менший індекс, тим вище сторінка (2 накриває 3)
                zVal = STATE.totalPages - i;
            }
            page.style.zIndex = zVal;
        });
    }

    function updateBookPosition(instant = false) {
        // Логіка камери: центруємо важливу частину
        
        const isClosedStart = STATE.currentPage === 0;
        const isClosedEnd = STATE.currentPage === STATE.totalPages;
        const isOpen = !isClosedStart && !isClosedEnd;

        let translateX = 0;
        let translateZ = 0;
        let rotateY = 0;

        if (STATE.isMobile) {
            // --- МОБІЛЬНА ЛОГІКА (Ландшафт) ---
            // Ми завжди тримаємо корінець майже по центру, 
            // але трохи зсуваємо, щоб компенсувати перспективу
            translateX = 0; // Корінець по центру
            
            if (isClosedStart) translateX = -15; // Показати обкладинку (вона справа)
            if (isClosedEnd) translateX = 15;   // Показати задню (вона зліва)
            
            // На мобільному не використовуємо 3D поворот всієї книги, тільки сторінок
        } else {
            // --- DESKTOP LOGIC ---
            if (isClosedStart) {
                translateX = 25; // Зсув вправо (обкладинка по центру екрану)
                translateZ = 0;
                rotateY = -5;    // Легкий нахил до глядача
            } else if (isClosedEnd) {
                translateX = -25; // Зсув вліво
                rotateY = 5;
            } else {
                translateX = 0;   // Розгорнута книга по центру
                translateZ = -50; // Трохи віддаляємо, щоб вліз розворот
            }
        }

        const transformString = `translateX(${translateX}%) translateZ(${translateZ}px) rotateY(${rotateY}deg)`;

        if (instant) {
            dom.book.style.transition = 'none';
            dom.book.style.transform = transformString;
            // Force Reflow
            void dom.book.offsetWidth;
            dom.book.style.transition = '';
        } else {
            dom.book.style.transform = transformString;
        }
    }

    // --- 4. ACTION HANDLERS ---

    function flipNext() {
        if (STATE.isAnimating || STATE.currentPage >= STATE.totalPages) return;
        
        startAnimationLock();
        AudioManager.playFlip();

        const page = dom.pages[STATE.currentPage];
        page.classList.add('flipped');
        
        STATE.currentPage++;
        
        updateZIndexes();
        updateBookPosition();
    }

    function flipPrev() {
        if (STATE.isAnimating || STATE.currentPage <= 0) return;

        startAnimationLock();
        AudioManager.playFlip();

        STATE.currentPage--;
        
        const page = dom.pages[STATE.currentPage];
        page.classList.remove('flipped');
        
        updateZIndexes();
        updateBookPosition();
    }

    function handlePageClick(index) {
        // Розумний клік: визначаємо намір користувача
        if (STATE.currentPage === index) {
            // Клік по правій сторінці (активній) -> Вперед
            flipNext();
        } else if (STATE.currentPage === index + 1) {
            // Клік по лівій сторінці (попередній) -> Назад
            flipPrev();
        }
    }

    function startAnimationLock() {
        STATE.isAnimating = true;
        setTimeout(() => {
            STATE.isAnimating = false;
        }, CONFIG.debounceTime); // Дозволяємо клікати трохи раніше, ніж закінчиться повна анімація (для плавності)
    }

    // --- 5. EVENTS & UTILS ---

    function checkMobile() {
        // Перевіряємо ширину або орієнтацію
        STATE.isMobile = window.innerWidth <= CONFIG.mobileBreakpoint;
    }

    function attachEvents() {
        // 1. Page Clicks
        dom.pages.forEach((page, index) => {
            page.addEventListener('click', (e) => {
                // Ігноруємо кліки по інтерактивних елементах всередині сторінки (кнопки, посилання)
                if (e.target.closest('.magic-frame') || e.target.closest('a')) return;
                handlePageClick(index);
            });
        });

        // 2. Keyboard Navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight' || e.key === ' ') flipNext();
            if (e.key === 'ArrowLeft') flipPrev();
        });

        // 3. Resize Handling (Debounced)
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                checkMobile();
                updateBookPosition(true); // Миттєве оновлення при ресайзі
            }, 100);
        });

        // 4. Magic Frames Interaction
        dom.frames.forEach(frame => {
            frame.addEventListener('click', () => {
                frame.classList.add('shake-anim');
                AudioManager.playMagicError();
                
                // Remove class after animation
                setTimeout(() => {
                    frame.classList.remove('shake-anim');
                }, 500);
            });
        });
    }

    // Запуск
    initBook();
});