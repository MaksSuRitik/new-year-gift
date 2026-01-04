/**
 * CHRONICLES ANASTAXIAN: CORE ENGINE
 * Features: 3D Physics, Mobile Scaling, Video State Management
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. CONFIGURATION & STATE ---

    const CONFIG = {
        baseWidth: 480,  // Base width of one page in px
        baseHeight: 660, // Base height of page in px
        animDuration: 1400,
        debounceTime: 800,
    };

    const STATE = {
        currentPage: 0,
        totalPages: 0,
        isAnimating: false,
        isMobile: false,
        scale: 1,
        audioEnabled: true
    };

    // DOM Elements
    const dom = {
        book: document.getElementById('book'),
        pages: Array.from(document.querySelectorAll('.page')),
        videos: document.querySelectorAll('video'),
        audio: {
            flip: document.getElementById('sfx-flip')
        }
    };

    STATE.totalPages = dom.pages.length;

    // --- 2. AUDIO & VIDEO ENGINE ---

    const MediaManager = {
        init() {
            // Setup Videos
            dom.videos.forEach(vid => {
                vid.muted = true; // Start muted
                vid.pause();      // Start paused
                
                // Interaction Logic
                const wrapper = vid.closest('.video-frame');
                const icon = wrapper.querySelector('.sound-icon');

                // Desktop Hover
                wrapper.addEventListener('mouseenter', () => {
                    if(!STATE.isMobile) {
                        vid.muted = false;
                        if(icon) icon.textContent = '🔊';
                    }
                });
                wrapper.addEventListener('mouseleave', () => {
                    if(!STATE.isMobile) {
                        vid.muted = true;
                        if(icon) icon.textContent = '🔇';
                    }
                });

                // Mobile/Click Toggle
                wrapper.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent page flip
                    vid.muted = !vid.muted;
                    if(icon) icon.textContent = vid.muted ? '🔇' : '🔊';
                });
            });
        },

        playFlip() {
            if (!STATE.audioEnabled || !dom.audio.flip) return;
            dom.audio.flip.currentTime = 0;
            dom.audio.flip.volume = 0.3 + Math.random() * 0.2;
            dom.audio.flip.playbackRate = 0.9 + Math.random() * 0.2;
            dom.audio.flip.play().catch(() => {});
        },

        updateVideoState(pageIndex) {
            // Logic:
            // Page X (Front) Visible when CurrentPage == X
            // Page X (Back) Visible when CurrentPage == X + 1
            
            dom.pages.forEach((page, i) => {
                const frontVideos = page.querySelector('.page__face--front').querySelectorAll('video');
                const backVideos = page.querySelector('.page__face--back').querySelectorAll('video');

                // Front is visible if this is the current page (on right side) or cover
                const isFrontVisible = (i === STATE.currentPage);
                
                // Back is visible if we passed this page (it's on the left side)
                // AND it's the immediate previous page (i == currentPage - 1)
                const isBackVisible = (i === STATE.currentPage - 1);

                this.toggleVideos(frontVideos, isFrontVisible);
                this.toggleVideos(backVideos, isBackVisible);
            });
        },

        toggleVideos(nodeList, shouldPlay) {
            nodeList.forEach(vid => {
                if (shouldPlay) {
                    const promise = vid.play();
                    if(promise !== undefined) {
                        promise.catch(e => { /* Auto-play blocked */ });
                    }
                    vid.closest('.video-frame')?.classList.add('playing');
                } else {
                    vid.pause();
                    vid.closest('.video-frame')?.classList.remove('playing');
                }
            });
        }
    };

    // --- 3. PHYSICS & RENDERING ---

    function initBook() {
        checkMobile();
        MediaManager.init();

        // Stacking Order
        dom.pages.forEach((page, i) => {
            page.style.zIndex = STATE.totalPages - i;
        });

        updateBookPosition(true);
        MediaManager.updateVideoState(STATE.currentPage);
        attachEvents();
        
        // Entrance
        setTimeout(() => { dom.book.style.opacity = '1'; }, 100);
    }

    function updateZIndexes() {
        dom.pages.forEach((page, i) => {
            let zVal;
            if (i < STATE.currentPage) {
                zVal = i + 1; // Left stack growing up
            } else {
                zVal = STATE.totalPages - i; // Right stack growing down
            }
            page.style.zIndex = zVal;
        });
    }

    function calculateScale() {
        const padding = 40; // Safety margin
        const winW = window.innerWidth;
        const winH = window.innerHeight;
        
        // Calculate required width based on state
        // Mobile: Show 1 page width centered. Desktop: Show 2 pages width (spread)
        // Actually, for 3D effect, we need space for spread even on mobile if we rotate
        // But let's assume spread width for calculation to be safe
        
        const spreadWidth = CONFIG.baseWidth * 2; 
        const spreadHeight = CONFIG.baseHeight;

        let targetScale = 1;

        if (winW < 900) {
            // Mobile: Fit the single page width or height comfortably
            // Since we shift X, we essentially look at one page width mostly
            const scaleW = (winW - padding) / CONFIG.baseWidth;
            const scaleH = (winH - padding) / CONFIG.baseHeight;
            targetScale = Math.min(scaleW, scaleH);
        } else {
            // Desktop: Fit full spread
            const scaleW = (winW - padding) / spreadWidth;
            const scaleH = (winH - padding) / spreadHeight;
            targetScale = Math.min(scaleW, scaleH);
            // Cap max scale at 1.2 to avoid pixelation
            targetScale = Math.min(targetScale, 1.2); 
        }

        STATE.scale = targetScale;
        return targetScale;
    }

    function updateBookPosition(instant = false) {
        const isClosedStart = STATE.currentPage === 0;
        const isClosedEnd = STATE.currentPage === STATE.totalPages;
        
        let translateX = 0;
        let translateZ = 0;
        let rotateY = 0;

        // Recalculate Scale
        const scale = calculateScale();

        if (window.innerWidth < 900) {
            // --- MOBILE LOGIC ---
            // Center the "active" page
            if (isClosedStart) {
                translateX = -25; // Move Cover to Center (it's naturally on right)
            } else if (isClosedEnd) {
                translateX = 25; // Move Back Cover to Center
            } else {
                // Open book: We are looking at a spread. 
                // On narrow screens, we might want to shift depending on user focus?
                // For now, center the spine.
                translateX = 0;
            }
        } else {
            // --- DESKTOP LOGIC ---
            if (isClosedStart) {
                translateX = 25; // Cover center
                rotateY = -5;
            } else if (isClosedEnd) {
                translateX = -25; 
                rotateY = 5;
            } else {
                translateX = 0; // Spread center
                translateZ = -50;
            }
        }

        const transformString = `scale(${scale}) translateX(${translateX}%) translateZ(${translateZ}px) rotateY(${rotateY}deg)`;

        if (instant) {
            dom.book.style.transition = 'none';
            dom.book.style.transform = transformString;
            void dom.book.offsetWidth; // Force Reflow
            dom.book.style.transition = '';
        } else {
            dom.book.style.transform = transformString;
        }
    }

    // --- 4. ACTION HANDLERS ---

    function flipNext() {
        if (STATE.isAnimating || STATE.currentPage >= STATE.totalPages) return;
        
        startAnimationLock();
        MediaManager.playFlip();

        const page = dom.pages[STATE.currentPage];
        page.classList.add('flipped');
        
        STATE.currentPage++;
        
        updateZIndexes();
        updateBookPosition();
        MediaManager.updateVideoState(STATE.currentPage);
    }

    function flipPrev() {
        if (STATE.isAnimating || STATE.currentPage <= 0) return;

        startAnimationLock();
        MediaManager.playFlip();

        STATE.currentPage--;
        
        const page = dom.pages[STATE.currentPage];
        page.classList.remove('flipped');
        
        updateZIndexes();
        updateBookPosition();
        MediaManager.updateVideoState(STATE.currentPage);
    }

    function handlePageClick(index) {
        if (STATE.currentPage === index) {
            flipNext();
        } else if (STATE.currentPage === index + 1) {
            flipPrev();
        }
    }

    function startAnimationLock() {
        STATE.isAnimating = true;
        setTimeout(() => {
            STATE.isAnimating = false;
        }, CONFIG.debounceTime);
    }

    // --- 5. EVENTS ---

    function checkMobile() {
        STATE.isMobile = window.innerWidth < 900;
    }

    function attachEvents() {
        dom.pages.forEach((page, index) => {
            page.addEventListener('click', (e) => {
                if (e.target.closest('.video-frame') || e.target.closest('a')) return;
                handlePageClick(index);
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight' || e.key === ' ') flipNext();
            if (e.key === 'ArrowLeft') flipPrev();
        });

        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                checkMobile();
                updateBookPosition(true);
            }, 100);
        });
    }

    // Launch
    initBook();

// --- 6. LANGUAGE SYSTEM (СИСТЕМА ПЕРЕКЛАДУ) ---

    const translations = {
        ua: {
            btn_exit: "Вихід",
            
            // COVER & INTRO
            preface_title: "Передмова",
            preface_p1: "<span class='drop-cap'>Т</span>ут, у темряві цифрових століть, ми зберігаємо свідчення. Ці сторінки містять правду про Детектор Брехні, Безодню та Велику Панду.",
            preface_p2: "Торкнись ілюстрацій, щоб почути їхній голос.",
            
            // PAGE 1: DETECTOR
            det_title: "Детектор Брехні",
            det_p1: "Вчені з Непалу та Дагестану винайшли детектор брехні, який б'є струмом за \"неправду\". Експеримент проводили на Анастасян.",
            det_p2: "Детектор виявився настільки чутливим, що реагував навіть на сарказм та філософські роздуми. Анастасян — теж була впевнена.",
            proof_title: "Докази",
            proof_caption: "Фіг 1.2: Процес калібрування істини.",
            
            // PAGE 2: CHAT & PANDA
            chat_title: "Експеримент Чату",
            chat_p1: "Після серії невдалих спостережень, було вирішено підключити нейромережу до загального чату.",
            chat_p2: "Результати вразили навіть скептиків. Хаос, що утворився, не піддається логічному опису, тому висновки з нього робити небезпечно.",
            panda_title: "Легенда Панди",
            panda_p1: "Під час перегляду відомого мультфільму про Кунг-Фу, реальність почала викривлятися.",
            panda_p2: "Озвучка змінилася настільки, що стародавні техніки перетворилися на абсурдний стендап з новинами без сценарію.",
            
            // PAGE 3: ABYSS
            abyss_title: "Безодня",
            abyss_p1: "Щомісячне оновлення Безодні викликає тремтіння навіть у найдосвідченіших мандрівників.",
            abyss_p2: "Але справжній жах ховається не в цифрах шкоди, а в тому, скільки часу витрачено даремно на шлях з Безодні до зірок.",
            end_text: "Кінець Першого Тому.",
            
            // BACK COVER
            colophon: "Автор тексту Володар Підвалу<br>Автор проекту та розробник Макс"
        },
        ru: {
            btn_exit: "Выход",
            
            // COVER & INTRO
            preface_title: "Предисловие",
            preface_p1: "<span class='drop-cap'>З</span>десь, во тьме цифровых веков, мы храним свидетельства. Эти страницы содержат правду о Детекторе Лжи, Бездне и Большой Панде.",
            preface_p2: "Коснись иллюстраций, чтобы услышать их голос.",
            
            // PAGE 1: DETECTOR
            det_title: "Детектор Лжи",
            det_p1: "Ученые из Непала и Дагестана изобрели детектор лжи, который бьет током за \"неправду\". Эксперимент проводили на Анастасян.",
            det_p2: "Детектор оказался настолько чувствительным, что реагировал даже на сарказм и философские размышления. Анастасян — тоже была уверена.",
            proof_title: "Доказательства",
            proof_caption: "Фиг 1.2: Процесс калибровки истины.",
            
            // PAGE 2: CHAT & PANDA
            chat_title: "Эксперимент Чата",
            chat_p1: "После серии неудачных наблюдений было решено подключить нейросеть к общему чату.",
            chat_p2: "Результаты поразили даже скептиков. Образовавшийся хаос не поддается логическому описанию, поэтому выводы из него делать опасно.",
            panda_title: "Легенда Панды",
            panda_p1: "Во время просмотра известного мультфильма про Кунг-Фу реальность начала искажаться.",
            panda_p2: "Озвучка изменилась настолько, что древние техники превратились в абсурдный стендап с новостями без сценария.",
            
            // PAGE 3: ABYSS
            abyss_title: "Бездна",
            abyss_p1: "Ежемесячное обновление Бездны вызывает дрожь даже у самых опытных путешественников.",
            abyss_p2: "Но настоящий ужас скрывается не в цифрах урона, а в том, сколько времени потрачено впустую на путь из Бездны к звездам.",
            end_text: "Конец Первого Тома.",
            
            // BACK COVER
            colophon: "Автор текста Властелин Подвала<br>Автор проекта и разработчик Макс"
        }
    };

    // Функція запуску зміни мови
    window.setLanguage = function(lang) {
        const elements = document.querySelectorAll('[data-i18n]');
        
        // Оновлюємо стиль кнопок
        document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
        if(lang === 'ua') document.querySelector('.lang-btn:nth-child(1)')?.classList.add('active');
        if(lang === 'ru') document.querySelector('.lang-btn:nth-child(2)')?.classList.add('active');
        if(lang === 'meow') document.querySelector('.lang-btn:nth-child(3)')?.classList.add('active');

        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            
            if (lang === 'meow') {
                // ЛОГІКА MEOW: Беремо UA текст і обробляємо
                let sourceText = translations['ua'][key];
                
                // Перевіряємо, чи є HTML теги всередині тексту (наприклад drop-cap)
                if (sourceText.includes('<')) {
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = sourceText;
                    processMeowNodes(tempDiv);
                    el.innerHTML = tempDiv.innerHTML;
                } else {
                    el.innerHTML = meowifyText(sourceText);
                }
            } else {
                // ЛОГІКА UA/RU
                if (translations[lang] && translations[lang][key]) {
                    el.innerHTML = translations[lang][key];
                }
            }
        });
    };

    // Допоміжна функція: перетворення слів на "meow"
    function meowifyText(text) {
        return text.replace(/[а-яА-ЯіІїЇєЄґҐa-zA-Z0-9]+/g, (match) => {
            // Якщо слово починається з великої літери -> Meow, інакше meow
            const isCap = match[0] === match[0].toUpperCase();
            return isCap ? "Meow" : "meow";
        });
    }

    // Допоміжна функція: обробка тексту без ламання HTML тегів
    function processMeowNodes(element) {
        element.childNodes.forEach(child => {
            if (child.nodeType === 3) { // Текстовий вузол
                // Пропускаємо порожні вузли
                if (child.nodeValue.trim() !== '') {
                    child.nodeValue = meowifyText(child.nodeValue);
                }
            } else if (child.nodeType === 1) { // Елемент (наприклад span)
                processMeowNodes(child);
            }
        });
    }
    
});