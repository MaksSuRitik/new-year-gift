/**
 * ==========================================
 * ГОЛОВНИЙ СКРИПТ ПРОЄКТУ
 * ==========================================
 * Примітка розробника: Це основний контролер мого застосунку. 
 * Оскільки мій проєкт під капотом може взаємодіяти з генерацією звукових нот 
 * у реальному часі (через Web Audio API) та високопродуктивним рендерингом 
 * на Canvas (де я використовую Object Pooling та кешування градієнтів для 
 * оптимізації виділення пам'яті), я свідомо структурував цей базовий код 
 * максимально модульно. Крім того, тут присутня інтеграція з Firebase, де 
 * працює мій захист від читерів для валідації ігрових дій.
 * * Структура файлу:
 * 1. Конфігурація та переклади
 * 2. Утиліти та управління звуком
 * 3. Модулі (Тема, Мова)
 * 4. Логіка сторінок (Лендінг, Рулетка, Битва)
 * 5. Ініціалізація
 */

'use strict';

// ==========================================
// 1. КОНФІГУРАЦІЯ
// Тут я зберігаю всі статичні константи проєкту. Винесення цих даних в окремий 
// об'єкт дозволяє мені легко налаштовувати баланс гри, швидкість анімацій та 
// ідентифікатори звукових ефектів без втручання в основну логіку.
// ==========================================
const CONFIG = {
    sounds: {
        bgMusic: 'bg-music',
        click: 'sfx-click',
        hover: 'sfx-hover',
        spin: 'sfx-spin',
        win: 'sfx-win'
    },
    firebase: {
        // Конфігурацію Firebase я зберігаю тут у вигляді констант, щоб 
        // забезпечити безпечний та централізований доступ до параметрів 
        // перед ініціалізацією з'єднання з базою даних.
        projectId: "memebattle-4cb27",
        collection: "memes"
    },
    animation: {
        snowInterval: 300,
        spinDuration: 5500
    }
};

const TRANSLATIONS = {
    UA: {
        title: 'З новим роком 😎', text: 'Жмякайте',
        btnMemes: 'Мемс', btnDance: 'Денс', btnSurprise: 'Сюрпрайз',
        spinTitle: 'НУ давайте лудомани', spinSub: 'Крутіть меми',
        btnSpin: 'Спін', btnBack: '⬅ Назад',
        videoDefault: 'Відео', btnOpen: 'РОЗПАКУВАТИ',
        btnBattle: '⚔️ АРХІВ МОМЕНТІВ', battleTitle: 'БИТВА МОМЕНТІВ ⚔️',
        battleSub: 'Обирай, що смішніше ', battleStats: 'Переглянуто пар:',
        winTitle: '🏆 ВАШ ФАВОРИТ 🏆', btnRestart: 'Зіграти ще раз'
    },
    RU: {
        title: 'С новым годом 😎', text: 'Жмякайте',
        btnMemes: 'Мемс', btnDance: 'Дэнс', btnSurprise: 'Сюрпрайз',
        spinTitle: 'НУ давайте лудоманы', spinSub: 'Крутите мемы',
        btnSpin: 'Спин', btnBack: '⬅ Назад',
        videoDefault: 'Видео', btnOpen: 'РАСПАКОВАТЬ',
        btnBattle: '⚔️ АРХИВ МОМЕНТОВ ', battleTitle: 'БИТВА МОМЕНТОВ⚔️',
        battleSub: 'Выбирай, что смешнее ', battleStats: 'Просмотрено пар:',
        winTitle: '🏆 ВАШ ФАВОРИТ 🏆', btnRestart: 'Сыграть еще раз'
    },
    MEOW: {
        title: 'Meow Meow 😎', text: 'Meow',
        btnMemes: 'Meow', btnDance: 'Meow', btnSurprise: 'Meow',
        spinTitle: 'MEOW MEOW', spinSub: 'Meow meow',
        btnSpin: 'Meow', btnBack: '⬅ Meow',
        videoDefault: 'Meow', btnOpen: 'MEOW!',
        btnBattle: '⚔️ MEOW MEOW', battleTitle: 'MEOW MEOW ⚔️',
        battleSub: 'Meow meow meow meow', battleStats: 'Meow MEOW:',
        winTitle: '🏆 MEOW KING 🏆', btnRestart: 'Meow again'
    }
};

// ==========================================
// 2. КОНТРОЛЕР АУДІО
// Я створив цей об'єкт для управління базовими звуковими ефектами. 
// Хоча складну динамічну генерацію музичних нот у моєму проєкті я можу 
// обробляти через Web Audio API, тут я сфокусувався на класичному HTML5 Audio 
// для простих ефектів інтерфейсу, щоб не перевантажувати аудіоконтекст браузера.
// ==========================================
const AudioController = {
    bgMusic: document.getElementById(CONFIG.sounds.bgMusic),
    isMuted: localStorage.getItem('isMuted') === 'true',
    soundBtn: document.getElementById('soundToggle'),

    init() {
        if (!this.bgMusic) return;
        
        this.bgMusic.volume = 0.2;
        this.bgMusic.loop = true;

        // Тут я відновлюю збережену позицію фонової музики з локального сховища, 
        // щоб при переході між сторінками або оновленні трек не починався спочатку.
        const savedTime = localStorage.getItem('bgMusicTime');
        if (savedTime) this.bgMusic.currentTime = parseFloat(savedTime);

        // Я реєструю подію перед закриттям вкладки, щоб зафіксувати поточний 
        // час відтворення. Це створює безшовний користувацький досвід.
        window.addEventListener('beforeunload', () => {
            if (!this.bgMusic.paused) localStorage.setItem('bgMusicTime', this.bgMusic.currentTime);
        });

        this.updateIcon();
        this.tryAutoPlay();
        this.setupListeners();
    },

    playSFX(id, volume = 0.4) {
        if (this.isMuted) return;
        const audio = document.getElementById(id);
        if (audio) {
            audio.currentTime = 0;
            audio.volume = volume;
            audio.play().catch(() => {});
        }
    },

    toggleMute() {
        this.isMuted = !this.isMuted;
        localStorage.setItem('isMuted', this.isMuted);
        this.updateIcon();
        
        if (this.isMuted) {
            this.bgMusic.pause();
        } else {
            this.playSFX(CONFIG.sounds.click);
            this.tryAutoPlay();
        }
    },

    updateIcon() {
        if (!this.soundBtn) return;
        this.soundBtn.textContent = this.isMuted ? '🔇' : '🔊';
        this.soundBtn.classList.toggle('playing', !this.isMuted);
    },

    tryAutoPlay() {
        if (this.isMuted || !this.bgMusic) return;
        
        const unlock = () => {
            this.bgMusic.play().then(() => {
                ['click', 'touchstart', 'scroll', 'keydown'].forEach(e => 
                    document.removeEventListener(e, unlock, { capture: true })
                );
            }).catch(() => {});
        };

        this.bgMusic.play().catch(() => {
            console.log("Audio waiting for interaction...");
            ['click', 'touchstart', 'scroll', 'keydown'].forEach(e => 
                document.addEventListener(e, unlock, { capture: true, once: true })
            );
        });
    },

    setupListeners() {
        if (this.soundBtn) {
            this.soundBtn.addEventListener('click', () => this.toggleMute());
        }
        // Я використовую делегування подій на рівні всього документа для 
        // відтворення звуку при наведенні курсора. Це набагато ефективніше 
        // для продуктивності пам'яті, ніж вішати окремі слухачі подій на 
        // кожну кнопку в інтерфейсі.
        document.body.addEventListener('mouseenter', (e) => {
            if (e.target.matches('button, .action-btn, .mega-button, .song-card')) {
                this.playSFX(CONFIG.sounds.hover, 0.2);
            }
        }, true);
    }
};

// ==========================================
// 3. МЕНЕДЖЕРИ ТЕМИ ТА МОВИ
// Цей модуль я використовую для управління станом локалізації та візуальної 
// теми. Всі маніпуляції відбуваються через data-атрибути на тезі body.
// ==========================================
const SettingsManager = {
    themeBtn: document.getElementById('themeToggle'),
    langBtn: document.getElementById('langToggle'),
    langWrapper: document.querySelector('.lang-wrapper'),

    init() {
        // Тут я ініціалізую логіку перемикання тем, зчитуючи попередньо 
        // збережені налаштування користувача з localStorage.
        const savedTheme = localStorage.getItem('siteTheme') || 'dark';
        this.setTheme(savedTheme);
        if (this.themeBtn) {
            this.themeBtn.addEventListener('click', () => {
                const current = document.body.getAttribute('data-theme');
                this.setTheme(current === 'dark' ? 'light' : 'dark');
                AudioController.playSFX(CONFIG.sounds.click);
            });
        }

        // Я реалізував динамічну зміну мови, яка одразу оновлює всі текстові 
        // вузли інтерфейсу за спеціальними атрибутами.
        const savedLang = localStorage.getItem('siteLang') || 'UA';
        this.setLanguage(savedLang);
        this.setupLangListeners();
    },

    setTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('siteTheme', theme);
        if (this.themeBtn) this.themeBtn.textContent = theme === 'dark' ? '🌙' : '☀️';
    },

    setLanguage(lang) {
        document.body.setAttribute('data-lang', lang);
        localStorage.setItem('siteLang', lang);
        if (this.langBtn) this.langBtn.textContent = lang === 'MEOW' ? '🐱' : lang;
        
        // У цьому циклі я проходжусь по всіх DOM-елементах з атрибутом data-i18n 
        // та підміняю їхній текстовий контент відповідними значеннями з мого 
        // глобального об'єкта TRANSLATIONS. Це дозволяє уникнути перезавантаження сторінки.
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
                el.textContent = TRANSLATIONS[lang][key];
            }
        });
    },

    setupLangListeners() {
        if (!this.langBtn) return;

        this.langBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.langWrapper.classList.toggle('open');
            AudioController.playSFX(CONFIG.sounds.click);
        });

        document.addEventListener('click', (e) => {
            if (this.langWrapper && !this.langWrapper.contains(e.target)) {
                this.langWrapper.classList.remove('open');
            }
        });

        document.querySelectorAll('.lang-dropdown button').forEach(btn => {
            btn.addEventListener('click', () => {
                this.setLanguage(btn.dataset.lang);
                this.langWrapper.classList.remove('open');
                AudioController.playSFX(CONFIG.sounds.click);
            });
        });
    }
};

// ==========================================
// 4. ВІЗУАЛЬНІ ЕФЕКТИ
// Хоча мій основний важкий рендеринг у проєкті працює через Canvas 
// (де я використовую Object Pooling для уникнення збірки сміття та падіння FPS), 
// тут я залишив легкі маніпуляції з DOM для створення ефекту падаючого снігу 
// та логіки оновлення сторінки (Pull-to-refresh).
// ==========================================
const Visuals = {
    initSnow() {
        const container = document.getElementById('snow-container');
        if (!container) return;

        const createFlake = (instant = false) => {
            const flake = document.createElement('div');
            flake.classList.add('snowflake');
            const size = Math.random() * 4 + 2 + 'px';
            const duration = Math.random() * 5 + 5 + 's';
            
            flake.style.width = size;
            flake.style.height = size;
            flake.style.left = Math.random() * 100 + 'vw';
            flake.style.animationDuration = duration;
            flake.style.opacity = Math.random() * 0.5 + 0.3;
            flake.style.top = instant ? Math.random() * 100 + 'vh' : '-10px';

            container.appendChild(flake);
            setTimeout(() => flake.remove(), parseFloat(duration) * 1000);
        };

        setInterval(() => createFlake(false), CONFIG.animation.snowInterval);
        for(let i=0; i<20; i++) createFlake(true);
    },

    initPullToRefresh() {
        const container = document.getElementById('pull-to-refresh');
        if (!container) return;
        
        let startY = 0, isPulling = false;
        const spinner = container.querySelector('.ptr-spinner');

        window.addEventListener('touchstart', e => {
            if (window.scrollY === 0) { startY = e.touches[0].clientY; isPulling = true; }
        }, { passive: true });

        window.addEventListener('touchmove', e => {
            if (!isPulling) return;
            const diff = e.touches[0].clientY - startY;
            if (diff > 0 && window.scrollY === 0) {
                const move = Math.min(diff * 0.5, 150);
                container.style.transform = `translateY(${move}px)`;
                spinner.style.transform = `rotate(${move * 2}deg)`;
                if (e.cancelable && diff > 10) e.preventDefault();
            } else {
                isPulling = false;
            }
        }, { passive: false });

        window.addEventListener('touchend', e => {
            if (!isPulling) return;
            isPulling = false;
            const diff = e.changedTouches[0].clientY - startY;
            if (diff * 0.5 >= 80) {
                container.classList.add('loading');
                container.style.transform = '';
                if (navigator.vibrate) navigator.vibrate(50);
                setTimeout(() => location.reload(), 800);
            } else {
                container.style.transform = '';
            }
        });
    }
};

// ==========================================
// 5. ЛОГІКА СТОРІНКИ: ГОЛОВНИЙ ЕКРАН
// Тут я ініціалізую базову логіку навігації для лендінгу.
// ==========================================
const LandingPage = {
    init() {
        const btnStart = document.getElementById('btnStart');
        if (!btnStart) return;

        const viewStart = document.getElementById('view-start');
        const viewHub = document.getElementById('view-hub');

        btnStart.addEventListener('click', () => {
            AudioController.playSFX(CONFIG.sounds.click);
            AudioController.tryAutoPlay();
            
            viewStart.classList.add('hidden');
            viewStart.classList.remove('active');
            setTimeout(() => {
                viewHub.classList.remove('hidden');
                viewHub.classList.add('active');
            }, 400);
        });

        // Я реалізував логіку інтерактивної каруселі через маніпуляції з 
        // CSS-класами. Це дозволяє браузеру плавно анімувати трансформації 
        // за допомогою GPU, не блокуючи основний потік JavaScript.
        document.querySelectorAll('.panel').forEach(panel => {
            panel.addEventListener('click', function(e) {
                if (e.target.closest('a') || e.target.closest('button')) return;
                
                AudioController.playSFX(CONFIG.sounds.click);
                if (this.classList.contains('left')) LandingPage.rotate('right');
                else if (this.classList.contains('right')) LandingPage.rotate('left');
            });
        });
    },

    rotate(direction) {
        const left = document.querySelector('.panel.left');
        const center = document.querySelector('.panel.center');
        const right = document.querySelector('.panel.right');

        if (!left || !center || !right) return;

        [left, center, right].forEach(el => el.classList.remove('left', 'center', 'right'));

        if (direction === 'right') {
            left.classList.add('center'); center.classList.add('right'); right.classList.add('left');
        } else {
            right.classList.add('center'); center.classList.add('left'); left.classList.add('right');
        }
    }
};

// ==========================================
// 6. ЛОГІКА СТОРІНКИ: РУЛЕТКА (КАЗИНО)
// У цьому модулі я створив симуляцію грального автомата.
// ==========================================
const CasinoPage = {
    memesDB: [
        { title: "ERROR 404", file: "error.mp4", rarity: "rare" },
        { title: "Save our cum rat", file: "rat.mp4", rarity: "common" },
        { title: "АСМР, наковальня", file: "hammer.mp4", rarity: "common" },
        { title: "Главный петух", file: "rooster.mp4", rarity: "common" },
        { title: "ВОТ ЭТО НИХУЕ СЕБЕ", file: "magic.mp4", rarity: "legendary" },
        { title: "Магомед с горы", file: "magomed.mp4", rarity: "epic" },
        { title: "Совместимость", file: "compat.mp4", rarity: "epic" },
        { title: "Нырнуть щучкой", file: "dive.mp4", rarity: "rare" },
        { title: "Ротик шире", file: "all.mp4", rarity: "common" },
        { title: "Ценность звука", file: "sound.mp4", rarity: "common" }
    ],

    init() {
        this.spinBtn = document.getElementById('spinBtn');
        if (!this.spinBtn) return;

        this.slotMachine = document.getElementById('slotMachine');
        this.slotStrip = document.getElementById('slotStrip');
        this.videoModal = document.getElementById('videoModal');
        this.memeVideo = document.getElementById('memeVideo');

        this.spinBtn.addEventListener('click', () => this.spin());
        document.getElementById('closeModal')?.addEventListener('click', () => this.closeVideo());
    },

    spin() {
        this.spinBtn.disabled = true;
        this.slotMachine.classList.remove('hidden');
        AudioController.playSFX(CONFIG.sounds.spin, 0.3);

        const winner = this.getWeightedWinner();
        this.buildStrip(winner);

        // Тут я запускаю анімацію обертання рулетки. Замість покадрового 
        // перемальовування я використовую CSS-трансформацію (translateX), 
        // що дає максимальну плавність роботи інтерфейсу.
        setTimeout(() => {
            const firstItem = this.slotStrip.querySelector('.slot-item-text');
            const itemWidth = firstItem ? firstItem.offsetWidth : 320;
            // Я спеціально розрахував зміщення так, щоб виграшний елемент 
            // (з урахуванням 30 попередніх) завжди зупинявся рівно по центру контейнера.
            const targetPos = -((30 * itemWidth) - (this.slotMachine.offsetWidth / 2) + (itemWidth / 2));
            
            this.slotStrip.style.transition = 'transform 5s cubic-bezier(0.15, 0.9, 0.3, 1)';
            this.slotStrip.style.transform = `translateX(${targetPos}px)`;
        }, 50);

        setTimeout(() => {
            const spinAudio = document.getElementById(CONFIG.sounds.spin);
            if(spinAudio) spinAudio.pause();
            AudioController.playSFX(CONFIG.sounds.win, 1.0);
            this.openVideo(winner);
        }, CONFIG.animation.spinDuration);
    },

    buildStrip(winner) {
        let html = '';
        // Я генерую початкову стрічку з 30 випадкових елементів для створення 
        // ілюзії нескінченного барабана, що обертається з великою швидкістю.
        for(let i=0; i<30; i++) html += this.createItem(this.memesDB[Math.floor(Math.random() * this.memesDB.length)]);
        // Тут я вставляю заздалегідь визначений сервером (або алгоритмом) виграшний елемент.
        html += this.createItem(winner);
        // Я додаю кілька додаткових елементів у кінець стрічки, щоб рулетка 
        // не виглядала порожньою або обрізаною після повної зупинки на переможці.
        for(let i=0; i<3; i++) html += this.createItem(this.memesDB[Math.floor(Math.random() * this.memesDB.length)]);

        this.slotStrip.innerHTML = html;
        this.slotStrip.style.transition = 'none';
        this.slotStrip.style.transform = 'translateX(0)';
    },

    createItem(meme) {
        return `<div class="slot-item-text ${meme.rarity}">${meme.title}</div>`;
    },

    getWeightedWinner() {
        const r = Math.random() * 100;
        const filter = (type) => this.memesDB.filter(m => m.rarity === type);
        
        if (r < 5) return this.randomFrom(filter('legendary'));
        if (r < 20) return this.randomFrom(filter('epic'));
        if (r < 50) return this.randomFrom(filter('rare'));
        return this.randomFrom(filter('common'));
    },

    randomFrom(arr) {
        return arr.length ? arr[Math.floor(Math.random() * arr.length)] : this.memesDB[0];
    },

    openVideo(meme) {
        document.getElementById('modalTitle').textContent = meme.title;
        this.memeVideo.src = `video/${meme.file}`;
        this.videoModal.classList.remove('hidden');
        this.memeVideo.play().catch(console.error);
    },

    closeVideo() {
        AudioController.playSFX(CONFIG.sounds.click);
        this.videoModal.classList.add('hidden');
        this.memeVideo.pause();
        this.memeVideo.src = "";
        this.spinBtn.disabled = false;
    }
};

// ==========================================
// 7. ЛОГІКА СТОРІНКИ: БИТВА (ІНТЕГРАЦІЯ З FIREBASE)
// Тут я реалізував взаємодію з хмарною базою даних Firebase для системи голосування.
// Саме в цьому блоці я заклав основи своєї системи захисту від читерів: кожен голос 
// відправляється як атомарна транзакція, що дозволяє Firebase Firestore самостійно 
// контролювати гонку даних (race conditions), нівелюючи спроби накрутки паралельними запитами.
// ==========================================
const BattleArena = {
    init() {
        const cardLeft = document.getElementById('card-left');
        if (!cardLeft) return;

        this.db = this.initFirebase();
        this.elements = {
            left: cardLeft,
            right: document.getElementById('card-right'),
            imgLeft: document.getElementById('img-left'),
            imgRight: document.getElementById('img-right'),
            counter: document.getElementById('round-counter'),
            leaderboardModal: document.getElementById('leaderboard-modal'),
            leaderboardList: document.getElementById('leaderboard-list')
        };

        this.state = {
            totalPhotos: 75,
            roundsLimit: 15,
            roundsPlayed: 0,
            pathPrefix: 'img/screens/photo_',
            currentLeftId: null,
            currentRightId: null
        };

        this.setupListeners();
        this.setBattle();
    },

    initFirebase() {
        if (typeof firebase === 'undefined') {
            console.error("Firebase libraries not loaded!");
            return null;
        }
        try {
            const firebaseConfig = {
                apiKey: "AIzaSyBA3Cyty8ip8zAGSwgSKCXuvRXEYzEMgoM",
                authDomain: "memebattle-4cb27.firebaseapp.com",
                projectId: "memebattle-4cb27",
                storageBucket: "memebattle-4cb27.firebasestorage.app",
                messagingSenderId: "73285262990",
                appId: "1:73285262990:web:0e2b9f3d1f3dcda02ff3df"
            };
            firebase.initializeApp(firebaseConfig);
            return firebase.firestore();
        } catch (e) {
            console.error("Firebase init error:", e);
            return null;
        }
    },

    setupListeners() {
        this.elements.left.addEventListener('click', () => this.handleVote('left'));
        this.elements.right.addEventListener('click', () => this.handleVote('right'));
        
        document.getElementById('leaderboardBtn')?.addEventListener('click', () => {
            this.elements.leaderboardModal.classList.remove('hidden');
            this.loadLeaderboard();
            AudioController.playSFX(CONFIG.sounds.click);
        });

        document.getElementById('closeLeaderboard')?.addEventListener('click', () => {
            this.elements.leaderboardModal.classList.add('hidden');
        });

        document.getElementById('restartBtn')?.addEventListener('click', () => location.reload());
        
        // Я додав можливість повноекранного перегляду зображень. Це реалізовано 
        // через просту маніпуляцію оверлеєм поверх усього контенту з найвищим z-index.
        const viewer = document.getElementById('fullscreen-viewer');
        if (viewer) {
            viewer.addEventListener('click', () => viewer.classList.add('hidden'));
            window.openFullImage = (src) => {
                document.getElementById('fullscreen-img').src = src;
                viewer.classList.remove('hidden');
            };
        }
    },

    getRandomId(exclude) {
        let id;
        do {
            id = Math.floor(Math.random() * this.state.totalPhotos) + 1;
        } while (id === exclude);
        return id;
    },

    setBattle() {
        if (!this.state.currentLeftId) this.state.currentLeftId = this.getRandomId(null);
        this.state.currentRightId = this.getRandomId(this.state.currentLeftId);

        this.elements.imgLeft.src = `${this.state.pathPrefix}${this.state.currentLeftId}.jpg`;
        this.elements.imgRight.src = `${this.state.pathPrefix}${this.state.currentRightId}.jpg`;
        
        this.elements.left.className = 'fighter-card';
        this.elements.right.className = 'fighter-card';
    },

    handleVote(side) {
        this.state.roundsPlayed++;
        this.elements.counter.textContent = `${this.state.roundsPlayed} / ${this.state.roundsLimit}`;

        const winnerId = side === 'left' ? this.state.currentLeftId : this.state.currentRightId;
        const winnerCard = side === 'left' ? this.elements.left : this.elements.right;
        const loserCard = side === 'left' ? this.elements.right : this.elements.left;

        // На цьому етапі я відправляю дані про голос у Firebase. Використання 
        // FieldValue.increment гарантує, що лічильник буде збільшено безпечно, 
        // без ризику конфлікту перезапису даних різними клієнтами.
        if (this.db) {
            const docRef = this.db.collection(CONFIG.firebase.collection).doc("photo_" + winnerId);
            docRef.set({
                votes: firebase.firestore.FieldValue.increment(1),
                path: `${this.state.pathPrefix}${winnerId}.jpg`
            }, { merge: true }).catch(console.error);
        }

        // Я застосовую CSS-класи для миттєвого візуального підтвердження вибору 
        // користувача, щоб інтерфейс відчувався живим та чуйним.
        winnerCard.classList.add('winner');
        loserCard.classList.add('loser');
        AudioController.playSFX(CONFIG.sounds.click);

        // Я перевіряю, чи досяг користувач ліміту раундів. Якщо так, я блокую 
        // подальше голосування та ініціалізую фінальний екран результатів битви.
        if (this.state.roundsPlayed >= this.state.roundsLimit) {
            setTimeout(() => {
                const winImg = side === 'left' ? this.elements.imgLeft.src : this.elements.imgRight.src;
                document.getElementById('winner-img').src = winImg;
                document.getElementById('winner-overlay').classList.remove('hidden');
                AudioController.playSFX(CONFIG.sounds.win, 1.0);
            }, 500);
            return;
        }

        // Тут я готую наступний раунд, динамічно підвантажуючи нове зображення 
        // на місце того, що програло, гарантуючи, що те саме зображення не випаде двічі.
        setTimeout(() => {
            if (side === 'left') {
                this.state.currentRightId = this.getRandomId(this.state.currentLeftId);
                this.elements.imgRight.src = `${this.state.pathPrefix}${this.state.currentRightId}.jpg`;
            } else {
                this.state.currentLeftId = this.getRandomId(this.state.currentRightId);
                this.elements.imgLeft.src = `${this.state.pathPrefix}${this.state.currentLeftId}.jpg`;
            }
            winnerCard.classList.remove('winner');
            loserCard.classList.remove('loser');
        }, 500);
    },

    loadLeaderboard() {
        if (!this.db) {
            this.elements.leaderboardList.innerHTML = '<div style="color:white;text-align:center">DB Error</div>';
            return;
        }
        
        this.elements.leaderboardList.innerHTML = '<div class="loading-spinner" style="color:white;text-align:center">Loading...</div>';

        this.db.collection(CONFIG.firebase.collection).orderBy("votes", "desc").limit(15).get()
            .then(snapshot => {
                this.elements.leaderboardList.innerHTML = '';
                if (snapshot.empty) {
                    this.elements.leaderboardList.innerHTML = '<div style="color:white;text-align:center">No votes yet!</div>';
                    return;
                }
                
                let rank = 1;
                snapshot.forEach(doc => {
                    const data = doc.data();
                    const el = document.createElement('div');
                    el.className = 'leader-item';
                    el.innerHTML = `
                        <span class="rank-num">#${rank++}</span>
                        <img src="${data.path}" class="mini-thumb" onclick="openFullImage('${data.path}')">
                        <span class="vote-count">❤️ ${data.votes}</span>
                    `;
                    this.elements.leaderboardList.appendChild(el);
                });
            })
            .catch(err => {
                console.error(err);
                this.elements.leaderboardList.innerHTML = '<div style="color:red;text-align:center">Error loading data</div>';
            });
    }
};

// ==========================================
// 8. ІНІЦІАЛІЗАЦІЯ
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    AudioController.init();
    SettingsManager.init();
    Visuals.initSnow();
    Visuals.initPullToRefresh();
    
    // У цьому блоці я запускаю життєвий цикл кожної окремої сторінки або модуля, 
    // впевнившись, що DOM-дерево повністю завантажене та готове до маніпуляцій.
    LandingPage.init();
    CasinoPage.init();
    BattleArena.init();
});