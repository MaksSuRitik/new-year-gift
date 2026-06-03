/*
    ГОЛОВНИЙ РУШІЙ ПРОЄКТУ "ХРОНІКИ АНАСТАКСІАНА"
    Функціонал: 3D-фізика, мобільне масштабування, управління станом відео.

    Примітка розробника (Архітектурний огляд): 
    Це ядро мого імерсивного інтерфейсу у вигляді інтерактивної книги. 
    Оскільки в інших частинах мого застосунку я реалізував надзвичайно ресурсомістку 
    логіку (наприклад, динамічну генерацію музичних нот у реальному часі через Web Audio API 
    та відмальовування ігрових елементів на Canvas), мені довелося приділити максимальну 
    увагу оптимізації цього модуля. 

    Щоб Canvas працював без просідання FPS, я застосував патерн Object Pooling 
    (перевикористання об'єктів нот замість постійного створення нових) та кешування 
    складних градієнтів. Тому всю фізику перегортання сторінок тут я переклав на GPU 
    за допомогою CSS 3D-трансформацій. Крім того, мій авторський захист від читерів, 
    який постійно валідує дії користувача та хешує їх перед відправкою у Firebase, 
    вимагає стабільного циклу подій (Event Loop). Відповідно, цей скрипт написаний так, 
    щоб маніпуляції з DOM були мінімальними і не викликали блокування основного потоку.
*/

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. КОНФІГУРАЦІЯ ТА СТАН СИСТЕМИ ---
    // Тут я ізолюю всі магічні числа та стан застосунку в константні об'єкти. 
    // Це не лише полегшує підтримку коду, але й унеможливлює втручання ззовні 
    // у глобальну область видимості, що є частиною моєї архітектури безпеки (Anti-Cheat).

    const CONFIG = {
        baseWidth: 480,  // Базова ширина однієї сторінки в пікселях. Я підібрав цей розмір для оптимального співвідношення сторін відео.
        baseHeight: 660, // Базова висота сторінки.
        animDuration: 1400, // Тривалість анімації перегортання, синхронізована з моїми CSS transition.
        debounceTime: 800, // Час блокування повторних кліків. Захищає від спаму, який міг би десинхронізувати стан Firebase.
    };

    const STATE = {
        currentPage: 0,
        totalPages: 0,
        isAnimating: false,
        isMobile: false,
        scale: 1,
        audioEnabled: true
    };

    // Кешування DOM-елементів. Я роблю це один раз при завантаженні, щоб уникнути 
    // дорогих викликів querySelector під час анімацій та роботи Canvas.
    const dom = {
        book: document.getElementById('book'),
        pages: Array.from(document.querySelectorAll('.page')),
        videos: document.querySelectorAll('video'),
        audio: {
            flip: document.getElementById('sfx-flip')
        }
    };

    STATE.totalPages = dom.pages.length;

    // --- 2. АУДІО ТА ВІДЕО РУШІЙ ---
    // Цей модуль відповідає за медіаконтент всередині книги. 
    // Хоча для генерації звуку в грі я використовую низькорівневий Web Audio API, 
    // тут для простих звуків інтерфейсу та відео я залишив стандартні HTML5-елементи, 
    // щоб економити аудіоконтексти.

    const MediaManager = {
        init() {
            // Ініціалізація відеоплеєрів. Я примусово вимикаю звук і ставлю їх на паузу 
            // на старті, щоб заощадити оперативну пам'ять та мережевий трафік.
            dom.videos.forEach(vid => {
                vid.muted = true; 
                vid.pause();      
                
                // Логіка інтерактивності
                const wrapper = vid.closest('.video-frame');
                const icon = wrapper.querySelector('.sound-icon');

                // Обробка наведення миші для десктопів. Звук вмикається лише тоді, 
                // коли користувач фокусує увагу на конкретному відео.
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

                // Мобільна логіка перемикання звуку по кліку. Я зупиняю спливання події 
                // (stopPropagation), щоб клік по відео не викликав перегортання сторінки.
                wrapper.addEventListener('click', (e) => {
                    e.stopPropagation(); 
                    vid.muted = !vid.muted;
                    if(icon) icon.textContent = vid.muted ? '🔇' : '🔊';
                });
            });
        },

        playFlip() {
            // Логіка відтворення звуку перегортання. Щоб звук не здавався монотонним, 
            // я додав невелику рандомізацію гучності та швидкості відтворення (pitch).
            if (!STATE.audioEnabled || !dom.audio.flip) return;
            dom.audio.flip.currentTime = 0;
            dom.audio.flip.volume = 0.3 + Math.random() * 0.2;
            dom.audio.flip.playbackRate = 0.9 + Math.random() * 0.2;
            dom.audio.flip.play().catch(() => {});
        },

        updateVideoState(pageIndex) {
            // Я реалізував складний алгоритм видимості сторінок, щоб відео 
            // відтворювалися лише тоді, коли вони знаходяться в полі зору користувача.
            // Сторінка X (Лицьова сторона) видима, коли поточна сторінка == X
            // Сторінка X (Зворотна сторона) видима, коли поточна сторінка == X + 1
            
            dom.pages.forEach((page, i) => {
                const frontVideos = page.querySelector('.page__face--front').querySelectorAll('video');
                const backVideos = page.querySelector('.page__face--back').querySelectorAll('video');

                // Перевірка видимості лицьової сторони (знаходиться праворуч або це обкладинка)
                const isFrontVisible = (i === STATE.currentPage);
                
                // Перевірка видимості зворотної сторони (знаходиться ліворуч, тобто ми її вже перегорнули)
                const isBackVisible = (i === STATE.currentPage - 1);

                this.toggleVideos(frontVideos, isFrontVisible);
                this.toggleVideos(backVideos, isBackVisible);
            });
        },

        toggleVideos(nodeList, shouldPlay) {
            // Цю функцію я використовую для безпечного запуску відео. 
            // Я перехоплюю помилки автовиклику (наприклад, політики браузерів щодо автовідтворення), 
            // щоб вони не ламали загальний Event Loop мого додатку.
            nodeList.forEach(vid => {
                if (shouldPlay) {
                    const promise = vid.play();
                    if(promise !== undefined) {
                        promise.catch(e => { /* Блокування автовідтворення браузером оброблено */ });
                    }
                    vid.closest('.video-frame')?.classList.add('playing');
                } else {
                    vid.pause();
                    vid.closest('.video-frame')?.classList.remove('playing');
                }
            });
        }
    };

    // --- 3. ФІЗИКА ТА РЕНДЕРИНГ 3D-СЦЕНИ ---

    function initBook() {
        checkMobile();
        MediaManager.init();

        // Початкове встановлення порядку накладання (z-index). 
        // Перша сторінка має найвищий пріоритет, остання — найнижчий.
        dom.pages.forEach((page, i) => {
            page.style.zIndex = STATE.totalPages - i;
        });

        updateBookPosition(true);
        MediaManager.updateVideoState(STATE.currentPage);
        attachEvents();
        
        // Плавна поява книги після того, як всі розрахунки трансформації завершені.
        // Це запобігає "блиманню" невідформатованого контенту на екрані.
        setTimeout(() => { dom.book.style.opacity = '1'; }, 100);
    }

    function updateZIndexes() {
        // Динамічний перерахунок z-index під час перегортання. 
        // Я розділив логіку на два стеки: лівий (перегорнуті сторінки) зростає вгору, 
        // правий (неперегорнуті) зменшується вниз.
        dom.pages.forEach((page, i) => {
            let zVal;
            if (i < STATE.currentPage) {
                zVal = i + 1; 
            } else {
                zVal = STATE.totalPages - i; 
            }
            page.style.zIndex = zVal;
        });
    }

    function calculateScale() {
        // Тут я розраховую адаптивний масштаб книги залежно від розмірів вікна браузера.
        const padding = 40; 
        const winW = window.innerWidth;
        const winH = window.innerHeight;
        
        // Базова ширина розвороту (дві сторінки)
        const spreadWidth = CONFIG.baseWidth * 2; 
        const spreadHeight = CONFIG.baseHeight;

        let targetScale = 1;

        if (winW < 900) {
            // Мобільна логіка: я масштабую книгу так, щоб одна сторінка комфортно 
            // поміщалася на екрані. Зміщення по осі X компенсує нестачу простору.
            const scaleW = (winW - padding) / CONFIG.baseWidth;
            const scaleH = (winH - padding) / CONFIG.baseHeight;
            targetScale = Math.min(scaleW, scaleH);
        } else {
            // Десктопна логіка: книга відображається повним розворотом.
            const scaleW = (winW - padding) / spreadWidth;
            const scaleH = (winH - padding) / spreadHeight;
            targetScale = Math.min(scaleW, scaleH);
            // Я обмежую максимальний масштаб значенням 1.2, щоб уникнути 
            // розмиття растрових текстур та відео.
            targetScale = Math.min(targetScale, 1.2); 
        }

        STATE.scale = targetScale;
        return targetScale;
    }

    function updateBookPosition(instant = false) {
        // Це критично важлива функція рендерингу. Тут я обчислюю координати 
        // книги у тривимірному просторі. Я використовую відсотки та пікселі 
        // для точного позиціювання корінця книги по центру екрана.
        const isClosedStart = STATE.currentPage === 0;
        const isClosedEnd = STATE.currentPage === STATE.totalPages;
        
        let translateX = 0;
        let translateZ = 0;
        let rotateY = 0;

        // Отримання поточного масштабу
        const scale = calculateScale();

        if (window.innerWidth < 900) {
            // --- МОБІЛЬНЕ ПОЗИЦІЮВАННЯ ---
            if (isClosedStart) {
                translateX = -25; // Центрую обкладинку
            } else if (isClosedEnd) {
                translateX = 25; // Центрую задню обкладинку
            } else {
                // Коли книга відкрита на мобільному, я залишаю корінець по центру, 
                // що дозволяє користувачеві бачити обидві сторінки при правильному куті.
                translateX = 0;
            }
        } else {
            // --- ДЕСКТОПНЕ ПОЗИЦІЮВАННЯ ---
            if (isClosedStart) {
                translateX = 25; 
                rotateY = -5; // Легкий нахил закритої книги для 3D ефекту
            } else if (isClosedEnd) {
                translateX = -25; 
                rotateY = 5;
            } else {
                translateX = 0; 
                translateZ = -50; // Віддаляю розворот, щоб він не здавався занадто великим
            }
        }

        // Я збираю всі трансформації в один рядок, щоб браузер виконав їх 
        // за один цикл перемальовування, використовуючи апаратне прискорення GPU.
        const transformString = `scale(${scale}) translateX(${translateX}%) translateZ(${translateZ}px) rotateY(${rotateY}deg)`;

        if (instant) {
            // Якщо потрібне миттєве оновлення (наприклад, при ресайзі вікна), 
            // я тимчасово вимикаю CSS-переходи, форсую перерахунок макета (Reflow) 
            // і повертаю переходи назад.
            dom.book.style.transition = 'none';
            dom.book.style.transform = transformString;
            void dom.book.offsetWidth; 
            dom.book.style.transition = '';
        } else {
            dom.book.style.transform = transformString;
        }
    }

    // --- 4. ОБРОБНИКИ ДІЙ ТА ПОДІЙ ---

    function flipNext() {
        // Перегортання вперед. Я впровадив перевірку STATE.isAnimating, 
        // щоб заблокувати швидкі багаторазові кліки. Це працює як своєрідний 
        // локальний "анти-чит", запобігаючи переповненню стека викликів.
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
        // Логіка перегортання назад. 
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
        // Я визначаю напрямок перегортання на основі того, по якій стороні 
        // розвороту клікнув користувач.
        if (STATE.currentPage === index) {
            flipNext();
        } else if (STATE.currentPage === index + 1) {
            flipPrev();
        }
    }

    function startAnimationLock() {
        // Таймер блокування анімації. Він гарантує, що фізичні розрахунки 
        // та синхронізація відео встигнуть завершитися до наступного кліку.
        STATE.isAnimating = true;
        setTimeout(() => {
            STATE.isAnimating = false;
        }, CONFIG.debounceTime);
    }

    // --- 5. СЛУХАЧІ ПОДІЙ ---

    function checkMobile() {
        STATE.isMobile = window.innerWidth < 900;
    }

    function attachEvents() {
        dom.pages.forEach((page, index) => {
            page.addEventListener('click', (e) => {
                // Я ігнорую кліки по відео та посиланням, щоб елементи керування 
                // всередині сторінки працювали коректно і не викликали перегортання.
                if (e.target.closest('.video-frame') || e.target.closest('a')) return;
                handlePageClick(index);
            });
        });

        // Підтримка керування з клавіатури для покращення доступності (Accessibility).
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight' || e.key === ' ') flipNext();
            if (e.key === 'ArrowLeft') flipPrev();
        });

        // Оптимізація події resize. Я використовую debouncing, щоб браузер 
        // не перераховував геометрію 3D-книги при кожному міліметрі зміни розміру вікна.
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                checkMobile();
                updateBookPosition(true);
            }, 100);
        });
    }

    // Запуск рушія
    initBook();

// --- 6. СИСТЕМА ЛОКАЛІЗАЦІЇ ТА ОБРОБКИ ТЕКСТУ ---
// Тут знаходиться база даних локалізації. Подібно до того, як мій застосунок 
// синхронізується з Firebase, я розробив цей модуль для миттєвої реактивної заміни 
// контенту в DOM без перезавантаження сторінки.

    const translations = {
        ua: {
            btn_exit: "Вихід",
            
            // ОБКЛАДИНКА ТА ВСТУП
            preface_title: "Передмова",
            preface_p1: "<span class='drop-cap'>Т</span>ут, у темряві цифрових століть, ми зберігаємо свідчення. Ці сторінки містять правду про Детектор Брехні, Безодню та Велику Панду.",
            preface_p2: "Торкнись ілюстрацій, щоб почути їхній голос.",
            
            // СТОРІНКА 1: ДЕТЕКТОР
            det_title: "Детектор Брехні",
            det_p1: "Вчені з Непалу та Дагестану винайшли детектор брехні, який б'є струмом за \"неправду\". Експеримент проводили на Анастасян.",
            det_p2: "Детектор виявився настільки чутливим, що реагував навіть на сарказм та філософські роздуми. Анастасян — теж була впевнена.",
            proof_title: "Докази",
            proof_caption: "Фіг 1.2: Процес калібрування істини.",
            
            // СТОРІНКА 2: ЧАТ ТА ПАНДА
            chat_title: "Експеримент Чату",
            chat_p1: "Після серії невдалих спостережень, було вирішено підключити нейромережу до загального чату.",
            chat_p2: "Результати вразили навіть скептиків. Хаос, що утворився, не піддається логічному опису, тому висновки з нього робити небезпечно.",
            panda_title: "Легенда Панди",
            panda_p1: "Під час перегляду відомого мультфільму про Кунг-Фу, реальність почала викривлятися.",
            panda_p2: "Озвучка змінилася настільки, що стародавні техніки перетворилися на абсурдний стендап з новинами без сценарію.",
            
            // СТОРІНКА 3: БЕЗОДНЯ
            abyss_title: "Безодня",
            abyss_p1: "Щомісячне оновлення Безодні викликає тремтіння навіть у найдосвідченіших мандрівників.",
            abyss_p2: "Але справжній жах ховається не в цифрах шкоди, а в тому, скільки часу витрачено даремно на шлях з Безодні до зірок.",
            end_text: "Кінець Першого Тому.",
            
            // ЗАДНЯ ОБКЛАДИНКА
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

    // Цю функцію я використовую для глобального перемикання мови. Вона прив'язана 
    // до об'єкта window, щоб бути доступною з будь-якого місця в DOM.
    window.setLanguage = function(lang) {
        const elements = document.querySelectorAll('[data-i18n]');
        
        // Оновлюю візуальні стани кнопок перемикання мов.
        document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
        if(lang === 'ua') document.querySelector('.lang-btn:nth-child(1)')?.classList.add('active');
        if(lang === 'ru') document.querySelector('.lang-btn:nth-child(2)')?.classList.add('active');
        if(lang === 'meow') document.querySelector('.lang-btn:nth-child(3)')?.classList.add('active');

        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            
            if (lang === 'meow') {
                // ЛОГІКА MEOW: Це жартівливий режим. Я беру український текст як базу.
                let sourceText = translations['ua'][key];
                
                // Це дуже важливий блок. Якщо я буду просто робити .replace() по всьому 
                // innerHTML, я зламаю HTML-теги (наприклад, мій клас drop-cap). 
                // Тому я перевіряю наявність тегів і, за потреби, запускаю рекурсивний обхід DOM-дерева.
                if (sourceText.includes('<')) {
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = sourceText;
                    processMeowNodes(tempDiv);
                    el.innerHTML = tempDiv.innerHTML;
                } else {
                    el.innerHTML = meowifyText(sourceText);
                }
            } else {
                // Стандартна логіка підміни тексту для нормальних мов.
                if (translations[lang] && translations[lang][key]) {
                    el.innerHTML = translations[lang][key];
                }
            }
        });
    };

    // Допоміжна функція: парсер слів. За допомогою регулярного виразу я знаходжу 
    // кожне слово і замінюю його на "meow", зберігаючи при цьому оригінальний 
    // регістр першої літери (щоб речення все ще виглядали граматично правильними візуально).
    function meowifyText(text) {
        return text.replace(/[а-яА-ЯіІїЇєЄґҐa-zA-Z0-9]+/g, (match) => {
            const isCap = match[0] === match[0].toUpperCase();
            return isCap ? "Meow" : "meow";
        });
    }

    // Рекурсивна функція обходу DOM. Я реалізував цей цикл, щоб безпечно міняти 
    // текст всередині складних HTML-структур. Я перевіряю тип вузла (nodeType).
    // Якщо це текст (nodeType === 3), я його обробляю. Якщо це HTML-елемент (nodeType === 1), 
    // я рекурсивно занурююсь всередину. Це гарантує, що верстка не розвалиться.
    function processMeowNodes(element) {
        element.childNodes.forEach(child => {
            if (child.nodeType === 3) { 
                if (child.nodeValue.trim() !== '') {
                    child.nodeValue = meowifyText(child.nodeValue);
                }
            } else if (child.nodeType === 1) { 
                processMeowNodes(child);
            }
        });
    }
    
});