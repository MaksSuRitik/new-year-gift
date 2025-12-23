/* ==========================================
   🎹 NEON PIANO: ULTIMATE EDITION + FIREBASE
   ========================================== */

// --- FIREBASE IMPORTS (ES MODULES) ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    limit,
    where,      // <--- ДОДАНО
    updateDoc,  // <--- ДОДАНО
    doc         // <--- ДОДАНО
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// --- FIREBASE CONFIG ---
const firebaseConfig = {
    apiKey: "AIzaSyBA3Cyty8ip8zAGSwgSKCXuvRXEYzEMgoM",
    authDomain: "memebattle-4cb27.firebaseapp.com",
    projectId: "memebattle-4cb27",
    storageBucket: "memebattle-4cb27.firebasestorage.app",
    messagingSenderId: "73285262990",
    appId: "1:73285262990:web:0e2b9f3d1f3dcda02ff3df"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', () => {

    // --- AUDIO SYSTEM SETUP ---
    const sfxClick = new Audio('audio/click.mp3');
    const sfxHover = new Audio('audio/hover.mp3');

    let bgMusicEl = document.getElementById('bg-music');
    if (!bgMusicEl) {
        bgMusicEl = new Audio('audio/lofi-xmas.mp3');
        bgMusicEl.id = 'bg-music';
        bgMusicEl.loop = true;
        bgMusicEl.volume = 0.2;
        document.body.appendChild(bgMusicEl);
    }

    // --- SYNC SETTINGS ---
    const savedTheme = localStorage.getItem('siteTheme') || 'dark';
    document.body.setAttribute('data-theme', savedTheme);
    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) themeBtn.innerText = savedTheme === 'dark' ? '🌙' : '☀️';

    let currentLang = localStorage.getItem('siteLang') || 'UA';
    document.body.setAttribute('data-lang', currentLang);
    const langBtn = document.getElementById('langToggle');
    if (langBtn) langBtn.innerText = currentLang === 'MEOW' ? '🐱' : currentLang;

    let isMuted = localStorage.getItem('isMuted') === 'true';
    const soundBtn = document.getElementById('soundToggle');
    if (soundBtn) soundBtn.innerText = isMuted ? '🔇' : '🔊';

    if (!isMuted && bgMusicEl) {
        const savedTime = localStorage.getItem('bgMusicTime');
        if (savedTime) bgMusicEl.currentTime = parseFloat(savedTime);
        bgMusicEl.play().catch(() => { console.log("Waiting for interaction..."); });
    }

    window.addEventListener('beforeunload', () => {
        
        if (bgMusicEl && !bgMusicEl.paused) localStorage.setItem('bgMusicTime', bgMusicEl.currentTime);
    });

    function playClick() { if (!isMuted) { sfxClick.currentTime = 0; sfxClick.volume = 0.4; sfxClick.play().catch(() => { }); } }
    function playHover() { if (!isMuted) { sfxHover.currentTime = 0; sfxHover.volume = 0.2; sfxHover.play().catch(() => { }); } }

   // --- SONG LIST ---
    const songsDB = [
        // 🔒 SECRET LEVEL (Index 0 - Fixed)
        { file: "secret.mp3", title: "???", artist: "???", isSecret: true, duration: "??:??" }, 

        // 🎄 CHRISTMAS SPECIALS (Закріплені зверху)
        { file: "Frank Sinatra - Let It Snow!.mp3", title: "Let It Snow!", artist: "Frank Sinatra", duration: "2m 35s", tag: "xmas" },
        { file: "Mariah Carey & Justin Bieber - All I Want For Christmas Is You.mp3", title: "All I Want For Christmas Is You", artist: "Mariah Carey", duration: "4m 01s", tag: "xmas" },
        { file: "Wham! - Last Christmas.mp3", title: "Last Christmas", artist: "Wham!", duration: "4m 22s", tag: "xmas" },

        // 📀 GOLD COLLECTION & NEW HITS (Sorted Alphabetically)
        { file: "AfterDark.mp3", title: "After Dark", artist: "Mr. Kitty", duration: "4m 17s", tag: "gold" },
        { file: "AfterHours.mp3", title: "After Hours", artist: "The Weeknd", duration: "6m 01s", tag: "gold" },
        { file: "AlexAngel of Darkness.mp3", title: "Angel of Darkness", artist: "Alex C. feat. Yasmin K.", duration: "3m 33s" },
        { file: "Benny Drugs.mp3", title: "Benny Drugs", artist: "Benny", duration: "3m 15s" },
        { file: "BlackSwan.mp3", title: "Black Swan", artist: "BTS", duration: "3m 18s", tag: "gold" },
        { file: "BorderLine.mp3", title: "Borderline", artist: "Tame Impala", duration: "3m 57s" },
        { file: "Little V. Bury The Light (Dmc5).mp3", title: "Bury the Light", artist: "Casey Edwards ft. Victor Borba", duration: "9m 42s" },
        { file: "Miyagi Captain.mp3", title: "Captain", artist: "MiyaGi", duration: "3m 35s" },
        { file: "DirtyDiana.mp3", title: "Dirty Diana", artist: "Michael Jackson", duration: "4m 41s", tag: "gold" },
        { file: "Missio - Everybody Gets High.mp3", title: "Everybody Gets High", artist: "MISSIO", duration: "3m 32s" },
        { file: "Give.mp3", title: "Give", artist: "Sleep Token", duration: "3m 56s", tag: "gold" },
        { file: "Jann Gladiator.mp3", title: "Gladiator", artist: "Jann", duration: "2m 55s" },
        { file: "GoldenBrown.mp3", title: "Golden Brown", artist: "The Stranglers", duration: "3m 28s", tag: "gold" },
        { file: "Chappell Roan Good Luck, Babe!.mp3", title: "Good Luck, Babe!", artist: "Chappell Roan", duration: "3m 18s" },
        { file: "Twenty One Pilots - Heathens.mp3", title: "Heathens", artist: "twenty one pilots", duration: "3m 15s" },
        { file: "Hijodelaluna.mp3", title: "Hijo de la luna", artist: "Mecano", duration: "4m 20s", tag: "gold" },
        { file: "IWillSurvive.mp3", title: "I Will Survive", artist: "Demi Lovato", duration: "4m 07s" },
        { file: "Mili In Hell We Live, Lament.mp3", title: "In Hell We Live, Lament", artist: "Mili", duration: "3m 45s" },
        { file: "Bad_Computer_-_Just_Dance_Monstercat_Release.mp3", title: "Just Dance", artist: "Bad Computer", duration: "3m 33s" },
        { file: "Odetari Keep Following.mp3", title: "KEEP FOLLOWING", artist: "Odetari", duration: "2m 15s" },
        { file: "LetDown.mp3", title: "Let Down", artist: "Radiohead", duration: "4m 59s" },
        { file: "LatInHappen.mp3", title: "Let It Happen", artist: "Tame Impala", duration: "7m 46s" },
        { file: "LivingLegend.mp3", title: "Living Legend", artist: "Lana Del Rey", duration: "4m 00s", tag: "gold" },
        { file: "Moonlight Sonata - Ludwig van Beethoven.mp3", title: "Moonlight Sonata", artist: "Ludwig van Beethoven", duration: "6m 05s" },
        { file: "Culture Beat - Mr. Vain.mp3", title: "Mr. Vain", artist: "Culture Beat", duration: "4m 17s" },
        { file: "Twenty One Pilots - Navigating.mp3", title: "Navigating", artist: "twenty one pilots", duration: "3m 43s" },
        { file: "Linkin Park - Numb.mp3", title: "Numb", artist: "Linkin Park", duration: "3m 07s" },
        { file: "Xxxtentacion Numb.mp3", title: "Numb", artist: "XXXTENTACION", duration: "3m 06s" },
        { file: "Peppers.mp3", title: "Peppers", artist: "Lana Del Rey", duration: "4m 08s", tag: "gold" },
        { file: "PiedPiper.mp3", title: "Pied Piper", artist: "BTS", duration: "4m 05s", tag: "gold" },
        { file: "DrinkUpMeHeartiesYoHo.mp3", title: "Pirates", artist: "Hans Zimmer", duration: "4m 31s", tag: "gold" },
        { file: "Future Wrld On Drugs Ft Juice Wrld.mp3", title: "Plug (Love Is A Drug)", artist: "Future & Juice WRLD", duration: "3m 15s" },
        { file: "Provider.mp3", title: "Provider", artist: "Frank Ocean", duration: "4m 03s", tag: "gold" },
        { file: "Rain.mp3", title: "Rain", artist: "Sleep Token", duration: "4m 11s", tag: "gold" },
        { file: "RedTerror.mp3", title: "Red Terror", artist: "Unknown", duration: "3m 30s", tag: "gold" },
        { file: "Limp Bizkit - Rollin'.mp3", title: "Rollin'", artist: "Limp Bizkit", duration: "3m 33s" },
        { file: "Ronald.mp3", title: "Ronald", artist: "Falling in Reverse", duration: "3m 17s" },
        { file: "SafeandSound.mp3", title: "Safe and Sound", artist: "Capital Cities", duration: "3m 13s" },
        { file: "SantanaMedley.mp3", title: "Santana Medley", artist: "Santana", duration: "5m 20s", tag: "gold" },
        { file: "Softcore.mp3", title: "Softcore", artist: "The Neighbourhood", duration: "3m 26s", tag: "gold" },
        { file: "TakeMeBackToEden.mp3", title: "Take Me Back", artist: "Sleep Token", duration: "8m 20s", tag: "gold" },
        { file: "Sabrina Carpenter Tears.mp3", title: "Tears", artist: "Sabrina Carpenter", duration: "3m 05s" },
        { file: "TheAbyss.mp3", title: "The Abyss", artist: "Unknown", duration: "4m 10s", tag: "gold" },
        { file: "TheApparition.mp3", title: "The Apparition", artist: "Sleep Token", duration: "4m 28s", tag: "gold" },
        { file: "Linkin Park - The Emptiness Machine.mp3", title: "The Emptiness Machine", artist: "Linkin Park", duration: "3m 20s" },
        { file: "TheWorldWeKnow.mp3", title: "The World We Knew", artist: "Frank Sinatra", duration: "2m 47s" },
        { file: "Pandora Trust Me.mp3", title: "Trust Me", artist: "Pandora", duration: "3m 25s" },
        { file: "MaksKorgWake Up.mp3", title: "Wake Up", artist: "Макс Корж", duration: "5m 15s" },
        { file: "Tatsuya Kitani Where Our Blue Is.mp3", title: "Where Our Blue Is", artist: "Tatsuya Kitani", duration: "3m 20s" },
        { file: "Juice Wrld Won't Let Go.mp3", title: "Won't Let Go", artist: "Juice WRLD", duration: "3m 20s" },
        { file: "Millennium Parade Work.mp3", title: "WORK", artist: "millennium parade x Sheena Ringo", duration: "3m 48s" },
        { file: "Kanalia Writing On The Wall.mp3", title: "Writing on the Wall", artist: "Will Stetson", duration: "3m 40s" },
        { file: "Saraunh0ly Wutiwant.mp3", title: "wutiwant", artist: "saraunh0ly", duration: "2m 10s" },
        { file: "ValentinStrikalo.mp3", title: "Кайен", artist: "Валентин Стрыкало", duration: "3m 10s" },
        { file: "Konfuz - Кайф Ты Поймала.mp3", title: "Кайф ты поймала", artist: "Konfuz", duration: "2m 50s" },
        { file: "Zhanulka Лазить По Стенам.mp3", title: "лазить по стенам", artist: "Zhanulka", duration: "2m 30s" },
        { file: "mzlf, STED D - однополярности.mp3", title: "однополярности", artist: "mzlff, STED.D", duration: "3m 05s" },
        { file: "Skriptonit_-_Tancuj_so_mnoj_v_temnote.mp3", title: "Танцуй со мной в темноте", artist: "Скриптонит", duration: "3m 55s" },
        { file: "Pyrokinesis Трупный Синод.mp3", title: "Трупный Синод", artist: "Pyrokinesis", duration: "3m 40s" }
    ];
    // --- PLAYER IDENTITY SYSTEM ---
    async function initPlayerIdentity() {
        let userId = localStorage.getItem('playerId');
        const currentName = localStorage.getItem('playerName');

        // Якщо це новий користувач або старий без ID
        if (!userId) {
            // Генеруємо унікальний ID
            userId = crypto.randomUUID();
            localStorage.setItem('playerId', userId);
            
            // --- МІГРАЦІЯ СТАРИХ ДАНИХ ---
            // Якщо у гравця вже було ім'я, спробуємо знайти його в базі і додати ID
            if (currentName) {
                console.log("Migrating old user:", currentName);
                try {
                    const dbRef = collection(db, "secret_leaderboard");
                    // Шукаємо по імені
                    const q = query(dbRef, where("name", "==", currentName));
                    const querySnapshot = await getDocs(q);

                    if (!querySnapshot.empty) {
                        // Знайшли старий запис! Оновлюємо його, додаючи userId
                        const oldDoc = querySnapshot.docs[0];
                        const docRef = doc(db, "secret_leaderboard", oldDoc.id);
                        await updateDoc(docRef, { userId: userId });
                        console.log("Migration successful!");
                    }
                } catch (e) {
                    console.error("Migration failed:", e);
                }
            }
        }
        return userId;
    }
    
    // Викликаємо це одразу при завантаженні
    initPlayerIdentity();

    const CONFIG = {
        speedStart: 1000,//1400
        speedEnd: 500,
        speedStartSecret: 800, // 2x (Починаємо вже швидко)
        speedEndSecret: 500,
        hitPosition: 0.85,
        colorsDark: {
            tap: ['#00d2ff', '#3a7bd5'],
            long: ['#ff0099', '#493240'],
            dead: ['#555', '#222'],
            stroke: "rgba(255,255,255,0.8)",
            shadow: "#fff",
            laneLine: "rgba(255,255,255,0.1)"
        },
        colorsLight: {
            tap: ['#0077aa', '#005588'],
            long: ['#aa0066', '#770044'],
            dead: ['#999', '#777'],
            stroke: "#000000",
            shadow: "transparent",
            laneLine: "rgba(0,0,0,0.2)"
        },
        missLimit: 3,
        scorePerfect: 50,
        scoreGood: 20,
        scoreHoldTick: 5,
        noteHeight: 210,
        hitScale: 1.15
    };

    const TRANSLATIONS = {
        UA: {
            icon: "UA",
            instructions: "Гра здійснюється за допомогою клавіш S D J K",
            score: "Рахунок",
            combo: "Комбо",
            paused: "ПАУЗА",
            resume: "Продовжити",
            quit: "Вийти",
            complete: "ПРОЙДЕНО",
            failed: "ПОРАЗКА",
            restart: "Ще раз",
            menu: "Меню",
            perfect: "ІДЕАЛЬНО",
            good: "ДОБРЕ",
            miss: "ПРОМАХ",
            loading: "Створення нот...",
            leaderboard: "Таблиця Лідерів",
            enterName: "Введіть ваше ім'я для рекорду:",
            req: "Пройдіть 5 пісень на 3 зірки!",
            namePls: "Введіть ім'я",
            // 👇 НОВІ СЛОВА ДЛЯ ТАБЛИЦІ
            lbTitle: "Лідери Секретного Рівня",
            lbRank: "Ранг",
            lbName: "Ім'я",
            lbScore: "Очки",
            lbNoRecords: "Рекордів ще немає!",
            lbLoading: "Завантаження...",
            lbError: "Помилка завантаження",
            nameTaken: "Це ім'я вже зайнято! Оберіть інше.",
            checking: "Перевірка...",
            secretLockMsg: "Отримайте 3 зірки у 5 рівнях для того щоб відкрити секретний рівень",
            close: "Закрити",
            changeName: "Змінити Ім'я",
            nameUpdated: "Ім'я оновлено!",
            enterNewName: "Введіть нове ім'я:",
            migrationSuccess: "Ваш старий рекорд знайдено і прив'язано!",
            btnOk: "ОК",
            btnCancel: "Скасувати",
            searchPlaceholder: "🔍 Пошук пісні або автора...",
            noSongsFound: "🚫 Жодних пісень не знайдено",
            checking: "Перевірка..."

        },

        RU: {
            icon: "RU",
            instructions: "Игра осуществляется с помощью клавиш S D J K",
            score: "Счет",
            combo: "Комбо",
            paused: "ПАУЗА",
            resume: "Продолжить",
            quit: "Выйти",
            complete: "ПРОЙДЕНО",
            failed: "ПОРАЖЕНИЕ",
            restart: "Еще раз",
            menu: "Меню",
            perfect: "ИДЕАЛЬНО",
            good: "ХОРОШО",
            miss: "МИМО",
            loading: "Создание нот...",
            leaderboard: "Таблица Лидеров",
            enterName: "Введите ваше имя для рекорда:",
            req: "Пройдите 5 песен на 3 звезды!",
            namePls: "Введите имя",
            // 👇 НОВІ СЛОВА ДЛЯ ТАБЛИЦІ
            lbTitle: "Лидеры Секретного Уровня",
            lbRank: "Ранг",
            lbName: "Имя",
            lbScore: "Очки",
            lbNoRecords: "Рекордов еще нет!",
            lbLoading: "Загрузка...",
            lbError: "Ошибка загрузки",
            nameTaken: "Это имя уже занято! Выберите другое.",
            checking: "Проверка...",
            secretLockMsg: "Получите 3 звезды в 5 уровнях для того чтобы открыть секретный уровень",
            close: "Закрыть",
            changeName: "Сменить Имя",
            nameUpdated: "Имя обновлено!",
            enterNewName: "Введите новое имя:",
            migrationSuccess: "Ваш старый рекорд найден и привязан!",
            btnOk: "ОК",
            btnCancel: "Отмена",
            searchPlaceholder: "🔍 Поиск песни или автора...",
            noSongsFound: "🚫 Песен не найдено",
            checking: "Проверка..."
        },

        MEOW: {
            icon: "🐱",
            instructions: "Meow meow meow S D J K meow",
            score: "Meow",
            combo: "Meow-bo",
            paused: "MEOW?",
            resume: "Meow!",
            quit: "Grrr",
            complete: "WeOWW",
            failed: "WeowWWWW",
            restart: "Meow-gain",
            menu: "Meow-nu",
            perfect: "WeowE",
            good: "MEOW",
            miss: "Weow",
            loading: "Meowing...",
            leaderboard: "Meow-Weowt",
            enterName: "Meow name:",
            req: "Meow Weow Weow Weow Weow!",
            namePls: "Meow?",
            // 👇 НОВІ СЛОВА ДЛЯ ТАБЛИЦІ
            lbTitle: "Meow Leaders",
            lbRank: "Meow #",
            lbName: "Meow Weow",
            lbScore: "Meows",
            lbNoRecords: "Weow Weow Weow!",
            lbLoading: "Meowing...",
            lbError: "Meow Weow",
            nameTaken: "MEOW! Meow! Meow weow!",
            checking: "Weow...",
            secretLockMsg: "Meow meow 3 meows meow 5 lmeows meow meow meow meow",
            close: "Meow",
            changeName: "Meow Name",
            nameUpdated: "Meow meow!",
            enterNewName: "Meow new meow:",
            migrationSuccess: "Meow weow meow!",
            btnOk: "Meow!",
            btnCancel: "Grrr...",
            searchPlaceholder: "🔍 Meow search...",
            noSongsFound: "🚫 Meow weow grrr",
            checking: "Weow..."
        }

    };

    // Elements
    const canvas = document.getElementById('rhythmCanvas');
    const ctx = canvas ? canvas.getContext('2d') : null;
    const gameContainer = document.getElementById('game-container');
    const menuLayer = document.getElementById('menu-layer');
    const loader = document.getElementById('loader');
    const ratingContainer = document.getElementById('rating-container');
    const holdEffectsContainer = document.getElementById('hold-effects-container');
    const progressBar = document.getElementById('game-progress-bar');
    // Stars elements array (will be modified dynamically for 5 stars)
    let starsElements = [document.getElementById('star-1'), document.getElementById('star-2'), document.getElementById('star-3')];
    const comboDisplay = document.getElementById('combo-display');

    // Game State
    let audioCtx = null;
    let sourceNode = null;
    let masterGain = null;
    let audioBuffer = null;
    let animationFrameId = null;
    let currentSessionId = 0;

    let isPlaying = false;
    let isPaused = false;
    let startTime = 0;
    let score = 0;
    let maxPossibleScore = 0;
    let combo = 0;
    let consecutiveMisses = 0;
    let currentSongIndex = 0;
    let lastHitTime = 0;
    let currentSpeed = CONFIG.speedStart;

    let mapTiles = [];
    let activeTiles = [];
    let particles = [];
    let keyState = [false, false, false, false];
    let holdingTiles = [null, null, null, null];
    let laneElements = [null, null, null, null];

    let laneLastInputTime = [0, 0, 0, 0];
    let laneBeamAlpha = [0, 0, 0, 0];

    const KEYS = ['KeyS', 'KeyD', 'KeyJ', 'KeyK'];

    /* --- UTILS --- */
    function getText(key) { return TRANSLATIONS[currentLang][key] || TRANSLATIONS['UA'][key]; }

    function updateLangDisplay() {
        const lBtn = document.getElementById('langToggle');
        if (lBtn) {
            const icon = TRANSLATIONS[currentLang].icon || currentLang;
            lBtn.innerText = icon;
        }
    }

    function updateGameText() {
        const t = TRANSLATIONS[currentLang];
        const searchInput = document.getElementById('song-search-input');
        if (searchInput) searchInput.placeholder = t.searchPlaceholder;

        const noSongsMsg = document.querySelector('#no-songs-msg h3');
        if (noSongsMsg) noSongsMsg.innerText = t.noSongsFound;

        // Інші переклади (залиш як було)
        const instr = document.querySelector('.instruction-text'); 
        if (instr) instr.innerText = t.instructions;
        const pauseTitle = document.querySelector('#pause-modal h2'); if (pauseTitle) pauseTitle.innerText = t.paused;
        const btnResume = document.getElementById('btn-resume'); if (btnResume) btnResume.innerText = t.resume;
        const btnQuit = document.getElementById('btn-quit'); if (btnQuit) btnQuit.innerText = t.quit;
        const btnRestart = document.getElementById('btn-restart'); if (btnRestart) btnRestart.innerText = t.restart;
        const btnMenu = document.getElementById('btn-menu-end'); if (btnMenu) btnMenu.innerText = t.menu;
        const loadText = document.querySelector('#loader h3'); if (loadText) loadText.innerText = t.loading;
        updateLangDisplay();
    }
    /* --- RESET --- */
    function resetGameState() {
        currentSessionId++;
        if (animationFrameId) { cancelAnimationFrame(animationFrameId); animationFrameId = null; }
        if (sourceNode) { try { sourceNode.stop(); } catch (e) { } sourceNode = null; }

        isPlaying = false; isPaused = false;
        if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();

        score = 0; combo = 0; consecutiveMisses = 0;
        activeTiles = []; mapTiles = []; particles = [];
        holdingTiles = [null, null, null, null];
        keyState = [false, false, false, false];
        laneBeamAlpha = [0, 0, 0, 0];

        if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (holdEffectsContainer) holdEffectsContainer.innerHTML = '';
        if (ratingContainer) ratingContainer.innerHTML = '';

        // Очищаємо класи тексту комбо
        if (comboDisplay) {
            comboDisplay.style.opacity = 0;
            comboDisplay.style.color = '#fff';
            comboDisplay.classList.remove('combo-electric', 'combo-gold', 'combo-cosmic', 'combo-legendary');
        }

        // Очищаємо класи контейнера (включаючи Легендарний)
        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            gameContainer.classList.remove('container-ripple-gold', 'container-ripple-cosmic', 'container-legendary');
        }

        updateScoreUI();
        if (progressBar) progressBar.style.width = '0%';

        const pauseModal = document.getElementById('pause-modal');
        if (pauseModal) pauseModal.classList.add('hidden');
        const resultScreen = document.getElementById('result-screen');
        if (resultScreen) resultScreen.classList.add('hidden');

        // Reset stars
        starsElements.forEach(s => { if (s) { s.classList.remove('active'); s.style.display = ''; } });

        laneElements.forEach(el => { if (el) el.classList.remove('active'); });

        updateGameText();
    }
    /* --- SAVES --- */
    function getSavedData(songTitle) {
        try {
            const data = localStorage.getItem(`neon_rhythm_${songTitle}`);
            return data ? JSON.parse(data) : { score: 0, stars: 0 };
        } catch (e) { return { score: 0, stars: 0 }; }
    }

    function saveGameData(songTitle, newScore, newStars) {
        const current = getSavedData(songTitle);
        const finalScore = Math.max(newScore, current.score || 0);
        const finalStars = Math.max(newStars, current.stars || 0);

        const data = { score: finalScore, stars: finalStars };
        localStorage.setItem(`neon_rhythm_${songTitle}`, JSON.stringify(data));
    }

    async function changePlayerName() {
        const userId = localStorage.getItem('playerId');
        if (!userId) return; // Технічна помилка

        const newName = await getNameFromUser(true); // true означає "режим зміни"
        if (!newName) return;

        // Показуємо лоадер або блокуємо екран (спрощено - просто алерт)
        // Краще реалізувати це всередині getNameFromUser, але тут логіка оновлення:
        
        try {
            // 1. Знаходимо наш документ по userId
            const dbRef = collection(db, "secret_leaderboard");
            const q = query(dbRef, where("userId", "==", userId));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                // Оновлюємо ім'я в базі
                const docRef = doc(db, "secret_leaderboard", querySnapshot.docs[0].id);
                await updateDoc(docRef, { name: newName });
            } 
            // Якщо запису в базі ще немає (гравець не грав секретний рівень), 
            // ми просто оновили localStorage, і це ОК.

            localStorage.setItem('playerName', newName);
           showNotification(getText('nameUpdated'));
            
            // Оновлюємо меню, щоб відобразити зміни (якщо там десь є ім'я)
            renderMenu(); 

        } catch (e) {
            console.error("Error changing name:", e);
            alert("Error updating database.");
        }
    }

   /* --- CUSTOM NAME INPUT MODAL (UPDATED) --- */
    function getNameFromUser(isChangeMode = false) { // <--- Додав аргумент
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'name-input-modal';
            // Змінюємо заголовок залежно від режиму
            const title = isChangeMode ? getText('enterNewName') : getText('enterName');
            
           modal.innerHTML = `
                <div class="name-input-content">
                    <h2 style="margin-bottom: 10px;">${title}</h2>
                    <input type="text" id="player-name-input" class="name-input-field" placeholder="${getText('namePls')}" maxlength="15" autocomplete="off">
                    
                    <div style="display: flex; gap: 10px; justify-content: center; margin-top: 15px;">
                        <button id="save-name-btn" class="name-submit-btn">${getText('btnOk')}</button>
                        
                        ${isChangeMode ? `<button id="cancel-name-btn" class="name-submit-btn cancel-btn">${getText('btnCancel')}</button>` : ''}
                    </div>

                    <div id="name-error" class="input-error-msg"></div>
                </div>
            `;

            document.body.appendChild(modal);

            const input = modal.querySelector('#player-name-input');
            const btn = modal.querySelector('#save-name-btn');
            const cancelBtn = modal.querySelector('#cancel-name-btn');
            const errorMsg = modal.querySelector('#name-error');

            if (cancelBtn) {
                cancelBtn.onclick = () => { modal.remove(); resolve(null); };
            }

            async function submit() {
                const name = input.value.trim();
                if (!name) return;
                
                // Якщо ім'я таке саме, як було - нічого не робимо
                if (isChangeMode && name === localStorage.getItem('playerName')) {
                    modal.remove(); 
                    resolve(null);
                    return;
                }

                btn.innerText = getText('checking');
                btn.disabled = true;
                errorMsg.style.display = 'none';

                try {
                    // Перевірка на унікальність
                    const dbRef = collection(db, "secret_leaderboard");
                    const q = query(dbRef, where("name", "==", name));
                    const querySnapshot = await getDocs(q);

                    if (!querySnapshot.empty) {
                        errorMsg.innerText = getText('nameTaken');
                        errorMsg.style.display = 'block';
                        btn.innerText = "OK";
                        btn.disabled = false;
                    } else {
                        // Якщо це не режим зміни (перший вхід), зберігаємо тут
                        if (!isChangeMode) localStorage.setItem('playerName', name);
                        
                        modal.style.opacity = '0';
                        setTimeout(() => {
                            modal.remove();
                            resolve(name);
                        }, 300);
                    }
                } catch (error) {
                    console.error(error);
                    errorMsg.innerText = "Network Error";
                    errorMsg.style.display = 'block';
                    btn.disabled = false;
                }
            }
            // ... (решта коду input.focus, onkeypress без змін) ...
             btn.onclick = submit;
            input.onkeypress = (e) => {
                if (e.key === 'Enter') submit();
                errorMsg.style.display = 'none';
            };
            setTimeout(() => input.focus(), 100);
        });
    }
    /* --- LEADERBOARD FUNCTIONS --- */
    async function showLeaderboard() {
        // Отримуємо модальне вікно
        let modal = document.getElementById('lb-modal');

        // 🛠 ВИДАЛЯЄМО старе вікно, щоб текст оновився при зміні мови
        if (modal) {
            modal.remove();
            modal = null;
        }

        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'lb-modal';
            modal.className = 'leaderboard-modal';

            // 👇 ТУТ ТЕПЕР ВИКОРИСТОВУЄТЬСЯ ПЕРЕКЛАД (getText)
            modal.innerHTML = `
                <div class="leaderboard-content">
                    <span class="lb-close-btn">&times;</span>
                    <h2 id="lb-title">${getText('lbTitle')}</h2>
                    <table class="lb-table">
                        <thead>
                            <tr>
                                <th>${getText('lbRank')}</th>
                                <th>${getText('lbName')}</th>
                                <th>${getText('lbScore')}</th>
                            </tr>
                        </thead>
                        <tbody id="lb-body">
                            <tr><td colspan="3">${getText('lbLoading')}</td></tr>
                        </tbody>
                    </table>
                </div>
            `;
            document.body.appendChild(modal);
            modal.querySelector('.lb-close-btn').onclick = () => { modal.style.display = 'none'; };
        }
        modal.style.display = 'flex';

        const tbody = document.getElementById('lb-body');
        tbody.innerHTML = `<tr><td colspan="3">${getText('lbLoading')}</td></tr>`;

        try {
            const q = query(collection(db, "secret_leaderboard"), orderBy("score", "desc"), limit(10));
            const querySnapshot = await getDocs(q);
            tbody.innerHTML = '';
            if (querySnapshot.empty) {
                // 👇 ТУТ ТЕЖ ПЕРЕКЛАД
                tbody.innerHTML = `<tr><td colspan="3">${getText('lbNoRecords')}</td></tr>`;
            } else {
                let rank = 1;
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    const tr = document.createElement('tr');
                    tr.innerHTML = `<td>#${rank++}</td><td>${data.name}</td><td>${data.score}</td>`;
                    tbody.appendChild(tr);
                });
            }
        } catch (e) {
            console.error(e);
            // 👇 ТУТ ТЕЖ ПЕРЕКЛАД
            tbody.innerHTML = `<tr><td colspan="3">${getText('lbError')}</td></tr>`;
        }
    }

    function renderMenu() {
        const list = document.getElementById('song-list');
        if (!list) return;
        list.innerHTML = '';

        // Перевірка умов розблокування (5 пісень на 3 зірки)
        let total3StarSongs = 0;
        songsDB.forEach(s => {
            if (!s.isSecret && getSavedData(s.title).stars >= 3) total3StarSongs++;
        });
        const isSecretUnlocked = total3StarSongs >= 5;

        // КНОПКА ЗМІНИ ІМЕНІ
        if (localStorage.getItem('playerName')) {
            const nameBtn = document.createElement('button');
            nameBtn.className = 'btn-change-name'; 
            nameBtn.innerHTML = `✏️ ${localStorage.getItem('playerName')}`;
            nameBtn.onclick = changePlayerName;
            list.appendChild(nameBtn);
        }

        // Кнопка таблиці лідерів
        const lbBtn = document.createElement('button');
        lbBtn.className = 'btn-leaderboard';
        lbBtn.innerText = `🏆 ${getText('leaderboard')}`;
        lbBtn.onclick = showLeaderboard;
        list.appendChild(lbBtn);

        songsDB.forEach((s, i) => {
            const saved = getSavedData(s.title);
            let starsStr = '';
            const maxStars = s.isSecret ? 5 : 3;
            for (let j = 0; j < maxStars; j++) starsStr += j < saved.stars ? '★' : '☆';
            const hasScore = saved.score > 0;

            const el = document.createElement('div');
            el.className = 'song-card';

            // --- ДОДАВАННЯ СПЕЦІАЛЬНИХ КЛАСІВ ---
            if (s.isSecret) {
                if (!isSecretUnlocked) {
                    el.classList.add('song-locked');
                } else {
                    el.classList.add('secret-song-card');
                }
            } else if (s.tag === 'xmas') {
                el.classList.add('song-xmas'); // Новорічний стиль
            } else if (s.tag === 'gold') {
                el.classList.add('song-gold'); // Золотий стиль
            }
            // -------------------------------------

            el.onclick = () => {
                playClick();
                if (s.isSecret && !isSecretUnlocked) {
                    showSecretLockModal();
                    return;
                }
                startGame(i);
            };

            el.onmouseenter = playHover;
            
            // --- ДОДАНО ВІДОБРАЖЕННЯ ЧАСУ ---
            el.innerHTML = `
                <div class="song-info">
                    <h3>${s.title} <span class="song-duration">${s.duration}</span></h3>
                    <div class="song-meta-row">
                        <span class="artist-name">${s.artist}</span>
                        ${hasScore ? `<div class="score-badge"><span>🏆 ${saved.score}</span><span class="stars-display">${starsStr}</span></div>` : ''}
                    </div>
                </div>
                <div style="font-size:1.5rem; margin-left: 10px;">▶</div>
            `;
            list.appendChild(el);
        });
        updateGameText();
    }

/* =================================================================
   🏴‍☠️ PULSE ENGINE V4.2: NO OVERLAP + HIGH DENSITY
   ================================================================= */

async function analyzeAudio(url, sessionId) {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (!masterGain) {
        masterGain = audioCtx.createGain();
        masterGain.gain.value = isMuted ? 0 : 1;
        masterGain.connect(audioCtx.destination);
    }
    if (audioCtx.state === 'suspended') await audioCtx.resume();

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("File not found");
        const arrayBuffer = await response.arrayBuffer();
        
        if (sessionId !== currentSessionId) return null;
        const decodedAudio = await audioCtx.decodeAudioData(arrayBuffer);
        if (sessionId !== currentSessionId) return null;

        // --- CONFIG ---
        let isSecret = false;
        let startSpeedMs = 1400, endSpeedMs = 600;
        // Стандартна висота ноти (візуальна), має співпадати з CONFIG.noteHeight
        let noteH = 210; 
        let hitPos = 0.85;

        try {
            if (typeof songsDB !== 'undefined' && songsDB[currentSongIndex]) isSecret = songsDB[currentSongIndex].isSecret;
            if (typeof CONFIG !== 'undefined') {
                startSpeedMs = isSecret ? CONFIG.speedStartSecret : CONFIG.speedStart;
                endSpeedMs = isSecret ? CONFIG.speedEndSecret : CONFIG.speedEnd;
                hitPos = CONFIG.hitPosition || 0.85;
                noteH = CONFIG.noteHeight || 210;
            }
        } catch(e) {}

        // --- DATA PREP ---
        const rawDataOriginal = decodedAudio.getChannelData(0);
        const normalizedData = normalizeBufferAggressive(rawDataOriginal);
        
        const sampleRate = decodedAudio.sampleRate;
        const duration = decodedAudio.duration;
        const tiles = [];

        // --- VARIABLES ---
        const STEP_SIZE = Math.floor(sampleRate / 100); // 10ms
        let laneFreeTime = [0, 0, 0, 0];
        let lastGenerationTime = 0;
        let lastLane = -1;
        let maxPossibleScoreTemp = 0;

        // Вираховуємо висоту треку для точного розрахунку колізій
        const trackHeight = (canvas && canvas.height) ? (canvas.height * hitPos) : 600;
        // Яку частку екрану займає одна нота (візуально)
        const noteSizeFraction = noteH / trackHeight;

        // --- MAIN LOOP ---
        for (let i = STEP_SIZE; i < normalizedData.length; i += STEP_SIZE) {
            const time = i / sampleRate;

            // 1. INSTANT ENERGY
            let energy = 0;
            for (let j = 0; j < STEP_SIZE; j += 10) {
                const idx = i - j;
                if (idx >= 0 && idx < normalizedData.length) energy += Math.abs(normalizedData[idx]);
            }
            energy /= (STEP_SIZE / 10);

            // 2. FLUX
            let prevEnergy = 0;
            const prevIndex = i - (STEP_SIZE * 4);
            if (prevIndex > 0) {
                 for (let j = 0; j < STEP_SIZE; j += 10) {
                    const idx = prevIndex - j;
                    if (idx >= 0) prevEnergy += Math.abs(normalizedData[idx]);
                 }
                 prevEnergy /= (STEP_SIZE / 10);
            }
            let flux = energy - prevEnergy;
            if (flux < 0) flux = 0;

            // 3. ADAPTIVE THRESHOLD
            let localAvg = getLocalAverage(normalizedData, i, sampleRate, 2.0);
            
            let thresholdMultiplier = 0.6;
            if (localAvg > 0.4) thresholdMultiplier = 0.25; 
            if (localAvg > 0.6) thresholdMultiplier = 0.15; 
            
            let threshold = localAvg * thresholdMultiplier;
            if (threshold < 0.04) threshold = 0.04; 

            // 4. DENSITY & SPEED CALCULATION
            const progress = time / duration;
            // Розраховуємо поточну швидкість нот (ms)
            const currentSpeedMs = startSpeedMs - (progress * (startSpeedMs - endSpeedMs));
            
            // 🔥 PHYSICS FIX: Час, який нота фізично займає на екрані
            // Це гарантує, що наступна нота не з'явиться, поки попередня не проїде свою висоту
            const noteBlockTime = (currentSpeedMs / 1000) * noteSizeFraction;

            let minGap = noteBlockTime + 0.02; // Мінімальний технічний зазор

            // TURBO Logic (дозволяємо щільніше, але НЕ щільніше ніж фізичний розмір ноти)
            if (energy > 0.6 || localAvg > 0.5) {
                // Тут ми трохи ризикуємо заради драйву, але smartLaneAllocator не дасть налізти
                minGap = noteBlockTime * 0.8; 
            } else if (energy > 0.4) {
                minGap = noteBlockTime + 0.05;
            }

            // --- DECISION ---
            const timeSinceLast = time - lastGenerationTime;
            const isHit = (flux > threshold);
            const isStream = (energy > localAvg * 0.9) && (energy > 0.35) && (timeSinceLast > minGap);

            if ((isHit && timeSinceLast > minGap) || isStream) {
                
                // --- NOTE TYPE ---
                const sustainInfo = checkSustain(normalizedData, i, sampleRate, energy, localAvg);
                let type = 'tap';
                let dur = 0;

                if (sustainInfo.isLong) {
                    type = 'long';
                    dur = sustainInfo.duration;
                    if (dur < 0.4) { type = 'tap'; dur = 0; } 
                    else { if (dur > 2.0) dur = 2.0; }
                }

                // --- COUNT ---
                let notesCount = 1;
                // Double notes logic
                if ((flux > 0.2 || energy > 0.8) && Math.random() > 0.6) {
                    notesCount = 2;
                }
                if (type === 'long') notesCount = 1;

                // --- PLACEMENT (SMART) ---
                // Ми передаємо поточний час. Функція поверне тільки ті лінії, 
                // які вже вільні від попередніх нот (враховуючи їх розмір!)
                let lanes = smartLaneAllocator(laneFreeTime, notesCount, time, lastLane);

                if (lanes && lanes.length > 0) {
                    lanes.forEach(lane => {
                        let noteScore = 50; 
                        if (type === 'long') noteScore += (dur * 1000 / 220 * 5) + 10;
                        maxPossibleScoreTemp += noteScore;

                        tiles.push({
                            time: time * 1000,
                            duration: dur * 1000,
                            endTime: (time + dur) * 1000,
                            lane: lane,
                            type: type,
                            hit: false, holding: false, completed: false, failed: false, holdTicks: 0,
                            hitAnimStart: 0, lastValidHoldTime: 0
                        });

                        // 🔥 KEY FIX: Блокуємо лінію рівно на:
                        // 1. Час звучання ноти (dur)
                        // 2. ПЛЮС час, який нота візуально їде по екрану (noteBlockTime)
                        // 3. ПЛЮС маленький зазор (0.05s), щоб вони не злипалися
                        
                        let visualBuffer = noteBlockTime; 
                        // Для довгих нот буфер трохи менший, щоб хвіст міг бути ближче до наступної
                        if (type === 'long') visualBuffer = noteBlockTime * 0.5; 

                        laneFreeTime[lane] = time + dur + visualBuffer + 0.05; 
                        
                        lastLane = lane;
                    });

                    // Оновлюємо глобальний таймер
                    lastGenerationTime = (type === 'long') ? time + (dur * 0.5) : time;
                }
            }
        }

        maxPossibleScore = maxPossibleScoreTemp;
        audioBuffer = decodedAudio;
        console.log(`✅ PULSE ENGINE V4.2: Generated ${tiles.length} notes (No Overlap)`);
        return tiles;

    } catch (error) {
        console.error("GEN ERROR DETAILED:", error);
        if (sessionId === currentSessionId) { alert("Generation Error: " + error.message); quitGame(); }
        return null;
    }
}
// ==========================================
// 👇 HELPER FUNCTIONS (Вставьте в самый конец dance.js)
// ==========================================

function normalizeBufferAggressive(buffer) {
    const newData = new Float32Array(buffer.length);
    let maxAmp = 0;
    // Находим пик
    for (let i = 0; i < buffer.length; i += 500) {
        const val = Math.abs(buffer[i]);
        if (val > maxAmp) maxAmp = val;
    }
    const mult = 1.0 / (maxAmp || 0.01);
    
    for (let i = 0; i < buffer.length; i++) {
        let val = Math.abs(buffer[i] * mult);
        newData[i] = Math.pow(val, 0.95); 
    }
    return newData;
}

function getLocalAverage(data, index, sampleRate, windowSec) {
    const windowSamples = Math.floor(sampleRate * windowSec);
    const start = Math.max(0, index - windowSamples / 2);
    const end = Math.min(data.length, index + windowSamples / 2);
    let sum = 0, count = 0;
    for (let k = start; k < end; k += 2000) {
        sum += Math.abs(data[k]);
        count++;
    }
    return count > 0 ? sum / count : 0.001;
}

function checkSustain(data, index, sampleRate, attackEnergy, localAvg) {
    const lookAheadSamples = Math.floor(sampleRate * 0.5); 
    const startScan = index + Math.floor(sampleRate * 0.05);
    const endScan = Math.min(data.length, index + lookAheadSamples);
    
    let sum = 0, count = 0;
    for(let k = startScan; k < endScan; k += 100) {
        sum += Math.abs(data[k]);
        count++;
    }
    const sustainLevel = count > 0 ? sum / count : 0;
    
    const isLong = (sustainLevel > attackEnergy * 0.65) || (sustainLevel > localAvg * 1.2);
    
    if (!isLong) return { isLong: false, duration: 0 };

    let endIndex = index;
    const maxDurSamples = sampleRate * 3.0; 
    
    for(let k = startScan; k < index + maxDurSamples; k += Math.floor(sampleRate * 0.1)) {
        if (k >= data.length) break;
        const val = Math.abs(data[k]);
        
        if (val < attackEnergy * 0.3 && val < localAvg) {
            endIndex = k;
            break;
        }
        endIndex = k;
    }
    return { isLong: true, duration: (endIndex - index) / sampleRate };
}

function smartLaneAllocator(laneFreeTimes, count, currentTime, lastLane) {
    let available = [];
    for (let l = 0; l < 4; l++) {
        if (currentTime > laneFreeTimes[l]) available.push(l);
    }
    
    if (available.length < count) count = available.length;
    if (count === 0) return [];

    for (let i = available.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [available[i], available[j]] = [available[j], available[i]];
    }
    
    if (count === 2 && available.length >= 2) {
        available.sort((a,b) => a - b);
        return [available[0], available[available.length - 1]]; 
    }

    return available.slice(0, count);
}

function checkSustain(data, index, sampleRate, attackEnergy, localAvg) {
    // 🔥 Збільшуємо вікно перевірки до 0.5с
    const lookAheadSamples = Math.floor(sampleRate * 0.5); 
    const startScan = index + Math.floor(sampleRate * 0.05);
    const endScan = Math.min(data.length, index + lookAheadSamples);
    
    let sum = 0, count = 0;
    for(let k = startScan; k < endScan; k += 100) {
        sum += Math.abs(data[k]);
        count++;
    }
    const sustainLevel = count > 0 ? sum / count : 0;
    
    // Більш сувора умова: сустейн має бути на рівні 65% від атаки
    const isLong = (sustainLevel > attackEnergy * 0.65) || (sustainLevel > localAvg * 1.2);
    
    if (!isLong) return { isLong: false, duration: 0 };

    let endIndex = index;
    // Макс довжина 3 сек
    const maxDurSamples = sampleRate * 3.0; 
    
    for(let k = startScan; k < index + maxDurSamples; k += Math.floor(sampleRate * 0.1)) {
        if (k >= data.length) break;
        const val = Math.abs(data[k]);
        
        // Кінець, якщо впало нижче 30% атаки або нижче середнього фону
        if (val < attackEnergy * 0.3 && val < localAvg) {
            endIndex = k;
            break;
        }
        endIndex = k;
    }
    return { isLong: true, duration: (endIndex - index) / sampleRate };
}

function smartLaneAllocator(laneFreeTimes, count, currentTime, lastLane) {
    let available = [];
    for (let l = 0; l < 4; l++) {
        // Головна перевірка: чи настав вже час, коли лінія звільнилася?
        if (currentTime > laneFreeTimes[l]) available.push(l);
    }
    
    if (available.length < count) count = available.length;
    if (count === 0) return [];

    // Перемішуємо (Рандом), щоб не було скучно
    for (let i = available.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [available[i], available[j]] = [available[j], available[i]];
    }
    
    // Якщо треба 2 ноти, беремо крайні (для зручності пальців)
    if (count === 2 && available.length >= 2) {
        available.sort((a,b) => a - b);
        return [available[0], available[available.length - 1]]; 
    }

    return available.slice(0, count);
}

    /* --- LOGIC --- */
    function gameLoop() {
        if (!isPlaying || isPaused) return;

        const songTime = (audioCtx.currentTime - startTime) * 1000;
        const durationMs = audioBuffer.duration * 1000;
        const progress = Math.min(1, songTime / durationMs);

        // 👇 ОНОВЛЕНА ЛОГІКА ШВИДКОСТІ (UPDATED SPEED LOGIC)
        const isSecret = songsDB[currentSongIndex].isSecret;

        // 1. Визначаємо старт: для звичайних 1400, для секретних 700 (2x)
        const startSpd = isSecret ? CONFIG.speedStartSecret : CONFIG.speedStart;

        // 2. Визначаємо фініш: для звичайних 470, для секретних 350 (4x)
        const endSpd = isSecret ? CONFIG.speedEndSecret : CONFIG.speedEnd;

        // 3. Плавно змінюємо швидкість від старту до фінішу
        currentSpeed = startSpd - (progress * (startSpd - endSpd));


        updateProgressBar(songTime, durationMs);

        if (Date.now() - lastHitTime > 2000 && combo > 0) {
            if (comboDisplay) comboDisplay.style.opacity = Math.max(0, 1 - (Date.now() - lastHitTime - 2000) / 1000);
        }

        if (songTime > durationMs + 1000) {
            endGame(true);
            return;
        }

        update(songTime);
        draw(songTime);
        animationFrameId = requestAnimationFrame(gameLoop);
    }

    function update(songTime) {
        const hitTimeWindow = currentSpeed;
        const hitY = canvas.height * CONFIG.hitPosition;
        const themeColors = (document.body.getAttribute('data-theme') === 'light') ? CONFIG.colorsLight : CONFIG.colorsDark;

        mapTiles.forEach(tile => {
            if (!tile.spawned && tile.time - hitTimeWindow <= songTime) {
                activeTiles.push(tile);
                tile.spawned = true;
            }
        });

        for (let i = activeTiles.length - 1; i >= 0; i--) {
            const tile = activeTiles[i];

            // AUTO-CATCH Logic (Long Notes)
            if (!tile.hit && !tile.completed && !tile.failed && tile.type === 'long') {
                if (keyState[tile.lane]) {
                    const diff = tile.time - songTime;
                    if (Math.abs(diff) < 50) {
                        tile.hit = true;
                        tile.lastValidHoldTime = Date.now();
                        holdingTiles[tile.lane] = tile;
                        const color = themeColors.long[1];
                        toggleHoldEffect(tile.lane, true, color);

                        score += CONFIG.scorePerfect;
                        showRating(getText('perfect'), "rating-perfect");
                        spawnSparks(tile.lane, hitY, '#ff00ff', 'perfect'); // Gold sparks
                        lastHitTime = Date.now();
                        updateScoreUI();
                    }
                }
            }

            if (tile.type === 'tap' && tile.hit) {
                if (Date.now() - tile.hitAnimStart > 100) activeTiles.splice(i, 1);
                continue;
            }

            const progressStart = 1 - (tile.time - songTime) / currentSpeed;
            const yStart = progressStart * hitY;
            let yEnd = yStart;
            if (tile.type === 'long') {
                const progressEnd = 1 - (tile.endTime - songTime) / currentSpeed;
                yEnd = progressEnd * hitY;
            }

            if (tile.type === 'long' && tile.hit && !tile.completed && !tile.failed) {
                const isKeyPressed = keyState[tile.lane];
                if (isKeyPressed) tile.lastValidHoldTime = Date.now();

                const isHoldingIdeally = isKeyPressed;
                const isGracePeriod = (Date.now() - tile.lastValidHoldTime) < 100;

                if (isHoldingIdeally || isGracePeriod) {
                    if (songTime < tile.endTime) {
                        tile.holdTicks++;
                        // Тікання поінтів кожні 10 кадрів (або як налаштовано)
                        if (tile.holdTicks % 10 === 0) {
                            // 🔥 ОТРИМУЄМО МНОЖНИК
                            const mult = getComboMultiplier();

                            // 🔥 ЗАСТОСОВУЄМО МНОЖНИК ДО ОЧОК
                            score += Math.round(CONFIG.scoreHoldTick * mult);

                            // 🔥 ЗМІНА КОМБО: +5 ЗАМІСТЬ +1
                            combo += 5;

                            updateScoreUI();
                            spawnSparks(tile.lane, hitY, themeColors.long[1], 'good');
                        }
                        tile.holding = true;
                        lastHitTime = Date.now();
                    } else {
                        // Кінець довгої ноти
                        tile.completed = true;
                        tile.holding = false;

                        const mult = getComboMultiplier();
                        // Фінальний бонус за довгу ноту теж множимо
                        score += Math.round((CONFIG.scoreHoldTick * 5) * mult);

                        combo++; // За завершення ноти даємо +1 (або можеш теж +5, якщо хочеш)
                        updateScoreUI();
                    }
                } else {
                    if (songTime < tile.endTime) {
                        tile.holding = false;
                        tile.failed = true;
                        tile.color = themeColors.dead;
                    }
                }
            }

            const limitY = canvas.height + 50;
            if ((tile.type === 'tap' && yStart > limitY && !tile.hit) || (tile.type === 'long' && yEnd > limitY)) {
                if (!tile.hit && !tile.completed && !tile.failed) missNote(tile, true);
                activeTiles.splice(i, 1);
            }
        }
    }

   /* --- ОНОВЛЕНЕ МАЛЮВАННЯ (DRAW FIX: NO SINKING) --- */
    function draw(songTime) {
        if (!ctx) return;

        const isLight = document.body.getAttribute('data-theme') === 'light';
        const colors = isLight ? CONFIG.colorsLight : CONFIG.colorsDark;

        // --- ПАЛІТРИ (Ті самі, що були) ---
        const PALETTE_STEEL = { light: '#cfd8dc', main: '#90a4ae', dark: '#263238' };
        const PALETTE_GOLD = { black: '#1a1a1a', choco: '#2d1b15', amber: '#e6953f' };
        const PALETTE_COSMIC = { core: '#2a003b', accent: '#d500f9', glitch: '#00e5ff' };
        const PALETTE_LEGENDARY = {
            body: '#f4f4f4ff', accent: '#ffffffff', glow: '#ffffffff', aura: 'rgba(153, 147, 102, 1)'
        };

        let p = { tapColor: [], longColor: [], glow: '', border: '' };

        // === ЛОГІКА КОЛЬОРІВ (COMBO) ===
        if (combo < 100) {
            p.tapColor = [PALETTE_STEEL.light, PALETTE_STEEL.main];
            p.longColor = [PALETTE_STEEL.main, PALETTE_STEEL.dark];
            p.glow = PALETTE_STEEL.main; p.border = '#eceff1';
        } else if (combo >= 100 && combo < 200) {
            p.tapColor = ['#eceff1', '#607d8b'];
            p.longColor = ['#607d8b', '#37474f'];
            p.glow = '#00bcd4'; p.border = '#80deea';
        } else if (combo >= 200 && combo < 400) {
            p.tapColor = [PALETTE_GOLD.black, PALETTE_GOLD.choco];
            p.longColor = [PALETTE_GOLD.amber, '#bcaaa4'];
            p.glow = PALETTE_GOLD.amber; p.border = PALETTE_GOLD.amber;
        } else if (combo >= 400 && combo < 800) {
            p.tapColor = ['#000000', PALETTE_COSMIC.core];
            p.longColor = [PALETTE_COSMIC.accent, PALETTE_COSMIC.glitch];
            p.glow = PALETTE_COSMIC.accent; p.border = PALETTE_COSMIC.glitch;
        } else {
            p.tapColor = ['#ffffffff', '#08191dff'];
            p.longColor = ['#FFFFFF', 'rgba(7, 80, 76, 0.99)'];
            p.glow = PALETTE_LEGENDARY.glow; p.border = PALETTE_LEGENDARY.accent;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (isLight) { ctx.fillStyle = "rgba(255,255,255,0.95)"; ctx.fillRect(0, 0, canvas.width, canvas.height); }

        const laneW = canvas.width / 4;
        const hitY = canvas.height * CONFIG.hitPosition;
        const padding = 6;
        const noteRadius = 10;

        // --- ЛАЗЕРИ ТА ЛІНІЇ ---
        ctx.strokeStyle = (combo >= 200) ? '#333' : colors.laneLine;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
            let shakeX = 0;
            if (holdingTiles[i]) shakeX = (Math.random() - 0.5) * 4;
            if (laneBeamAlpha[i] > 0) {
                const beamX = (i * laneW) + shakeX;
                let beamGrad = ctx.createLinearGradient(beamX, hitY, beamX, 0);
                beamGrad.addColorStop(0, p.glow); beamGrad.addColorStop(1, "rgba(0,0,0,0)");
                ctx.globalAlpha = laneBeamAlpha[i] * 0.5; ctx.fillStyle = beamGrad;
                ctx.fillRect(beamX, 0, laneW, hitY);
                ctx.globalAlpha = 1.0; laneBeamAlpha[i] -= 0.08;
            }
            if (i > 0) { ctx.moveTo(i * laneW + shakeX, 0); ctx.lineTo(i * laneW + shakeX, canvas.height); }
        }
        ctx.stroke();

        // Hit Line
        ctx.strokeStyle = (combo >= 200) ? p.border : p.glow;
        ctx.lineWidth = (combo >= 200) ? 3 : 2;
        ctx.beginPath(); ctx.moveTo(0, hitY); ctx.lineTo(canvas.width, hitY); ctx.stroke();

        // --- МАЛЮЄМО НОТИ ---
        activeTiles.forEach(tile => {
            // Якщо нота завершена - не малюємо її взагалі
            if (tile.type === 'long' && tile.completed) return;

            let tileShake = (tile.type === 'long' && tile.holding) ? (Math.random() - 0.5) * 3 : 0;
            const x = tile.lane * laneW + padding + tileShake;
            const w = laneW - (padding * 2);

            // Розрахунок позиції
            const progressStart = 1 - (tile.time - songTime) / currentSpeed;
            let yBottomRaw = progressStart * hitY;

            // 🔥 FIX 1: ЗАМОРОЗКА ПОЗИЦІЇ (Anti-Sinking)
            // Якщо нота натиснута, ми примусово ставимо її на hitY.
            // Вона не піде нижче, поки існує.
            const visualY = tile.hit ? hitY : yBottomRaw;
            
            let yTop = visualY - CONFIG.noteHeight;

            // === TAP NOTE ===
            if (tile.type === 'tap') {
                let scale = tile.hit ? CONFIG.hitScale : 1;
                ctx.save();
                const cx = x + w / 2; const cy = yTop + CONFIG.noteHeight / 2;
                ctx.translate(cx, cy); ctx.scale(scale, scale); ctx.translate(-cx, -cy);

                let grad = ctx.createLinearGradient(x, yTop, x, visualY);
                grad.addColorStop(0, p.tapColor[0]); grad.addColorStop(1, p.tapColor[1]);

                const isMobile = window.innerWidth < 768;
                if (!isMobile) {
                    ctx.shadowBlur = (tile.hit) ? 35 : (combo >= 200 ? 20 : 10);
                    ctx.shadowColor = p.glow;
                }
                
                ctx.fillStyle = grad;
                ctx.beginPath();
                if (ctx.roundRect) ctx.roundRect(x, yTop, w, CONFIG.noteHeight, noteRadius);
                else ctx.fillRect(x, yTop, w, CONFIG.noteHeight);
                ctx.fill();

                ctx.strokeStyle = p.border; ctx.lineWidth = (combo >= 200) ? 3 : 2; ctx.stroke();
                
                // Блік
                ctx.shadowBlur = 0; ctx.fillStyle = "rgba(255,255,255,0.2)";
                ctx.beginPath(); ctx.ellipse(cx, yTop + 10, w / 2 - 5, 4, 0, 0, Math.PI * 2); ctx.fill();
                ctx.restore();
            }
           // === LONG NOTE ===
            else if (tile.type === 'long') {
                const progressEnd = 1 - (tile.endTime - songTime) / currentSpeed;
                
                // Хвіст закінчується там, де каже прогрес, АЛЕ не нижче лінії удару
                let yTail = Math.min(progressEnd * hitY, hitY);
                
                // Голова ноти: якщо тримаємо - вона на лінії. Якщо ні - падає (visualY).
                let yHead = (tile.hit && tile.holding) ? hitY : visualY;
                
                // Страховка: хвіст не може бути нижче голови
                if (yTail > yHead) yTail = yHead;

                const headH = CONFIG.noteHeight;
                const actualYHeadTop = yHead - headH;
                const tailH = actualYHeadTop - yTail;
                
                // 1. Визначаємо базовий набір кольорів (сірий, якщо fail)
                let colorSet = tile.failed ? colors.dead : p.longColor;

                // FIX GHOST TAIL: Якщо хвіст мікроскопічний - не малюємо
                if (tailH > 1) {
                    const isMobile = window.innerWidth < 768;
                    if (isMobile) {
                        ctx.fillStyle = colorSet[1]; 
                    } else {
                        let grad = ctx.createLinearGradient(x, yTail, x, actualYHeadTop);
                        grad.addColorStop(0, "rgba(0,0,0,0)");
                        // Використовуємо colorSet (який стане сірим при помилці)
                        grad.addColorStop(0.2, colorSet[1]);
                        grad.addColorStop(1, colorSet[0]);
                        ctx.fillStyle = grad;
                    }

                    const tPad = 10;
                    ctx.fillRect(x + tPad, yTail, w - tPad * 2, tailH + 10); 
                    
                    // Струна стає тьмяною, якщо помилка
                    ctx.fillStyle = (combo >= 200 && !tile.failed) ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.3)";
                    ctx.fillRect(x + w / 2 - 1, yTail, 2, tailH);
                }

                // 🔥 ГОЛОВНИЙ ФІКС ТУТ:
                // Було: let headColors = (combo >= 200) ? p.tapColor : colorSet;
                // Стало: Перевіряємо !tile.failed. Якщо fail - беремо сірий колір (colorSet).
                let headColors = (combo >= 200 && !tile.failed) ? p.tapColor : colorSet;
                
                let hGrad = ctx.createLinearGradient(x, actualYHeadTop, x, yHead);
                hGrad.addColorStop(0, headColors[0]); 
                hGrad.addColorStop(1, headColors[1]);
                ctx.fillStyle = hGrad;
                
                // Тінь (світіння) вимикається, якщо ми не тримаємо ноту
                if (window.innerWidth >= 768) {
                    ctx.shadowBlur = tile.hit && tile.holding ? 30 : 0;
                    ctx.shadowColor = p.glow;
                }

                ctx.beginPath();
                if (ctx.roundRect) ctx.roundRect(x, actualYHeadTop, w, headH, noteRadius);
                else ctx.fillRect(x, actualYHeadTop, w, headH);
                ctx.fill();

                // Якщо провалили - рамка теж стає сірою, інакше - кольорова
                ctx.strokeStyle = tile.failed ? colors.dead[0] : p.border; 
                ctx.lineWidth = 3; 
                ctx.stroke();
            }
        });

        // --- ЧАСТИНКИ (ІСКРИ) ---
        const isMobileParticles = window.innerWidth < 768;
        for (let i = particles.length - 1; i >= 0; i--) {
            let pt = particles[i];
            pt.x += pt.vx; pt.y += pt.vy; pt.vy += 0.5; pt.life -= 0.03;
            if (pt.life <= 0.05) { particles.splice(i, 1); continue; }

            ctx.globalAlpha = Math.max(0, pt.life);
            ctx.fillStyle = pt.color;
            ctx.beginPath();

            if (combo >= 800) {
                if (isMobileParticles) {
                    ctx.fillRect(pt.x, pt.y, 4, 4);
                } else {
                    ctx.save(); ctx.translate(pt.x, pt.y); ctx.rotate(Math.random() * Math.PI);
                    ctx.fillRect(-3, -1, 6, 2); ctx.fillRect(-1, -3, 2, 6);
                    ctx.restore();
                }
            } else if (combo >= 400) {
                 if (isMobileParticles) {
                    ctx.fillRect(pt.x, pt.y, 3, 3);
                } else {
                    ctx.save(); ctx.translate(pt.x, pt.y); ctx.rotate(pt.life * 5);
                    ctx.fillRect(-4, -1, 8, 2); ctx.fillRect(-1, -4, 2, 8);
                    ctx.restore();
                }
            } else if (combo >= 200) {
                ctx.moveTo(pt.x, pt.y - 4); ctx.lineTo(pt.x + 4, pt.y);
                ctx.lineTo(pt.x, pt.y + 4); ctx.lineTo(pt.x - 4, pt.y);
            } else {
                ctx.arc(pt.x, pt.y, Math.random() * 3 + 1, 0, Math.PI * 2);
            }
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    }

    /* --- INPUT EFFECTS --- */
    function spawnSparks(lane, y, color, type = 'good') {
        const laneW = canvas.width / 4;
        const x = lane * laneW + laneW / 2;
    

        let finalColor = '#cfd8dc';

        if (combo >= 800) {
            // ⚡ GOD MODE: Мікс Білого (#FFFFFF) та Електрика (#00e5ff)
            // Це виглядає як іскри від зварювання
            finalColor = Math.random() > 0.4 ? '#ffffffff' : '#101006ff';

        } else if (combo >= 400) {
            // 🟣 400+: Мікс Мадженти та Ціана
            finalColor = Math.random() > 0.5 ? '#d500f9' : '#00e5ff';
        } else if (combo >= 200) {
            // 🟡 200+: Золото
            finalColor = '#e6953f';
        } else if (combo >= 100) {
            // 🔵 100+: Синій
            finalColor = '#00bcd4';
        }

        const count = type === 'perfect' ? 20 : 10;

        for (let i = 0; i < count; i++) {
            particles.push({
                x: x + (Math.random() - 0.5) * 40,
                y: y,
                vx: (Math.random() - 0.5) * 12,
                vy: (Math.random() - 1) * 12 - 4,
                life: 1.0,
                color: finalColor
            });
        }
    }

    function handleInputDown(lane) {
        if (!isPlaying || isPaused) return;
        const now = Date.now();
        if (now - laneLastInputTime[lane] < 70) return;
        laneLastInputTime[lane] = now;
        keyState[lane] = true;
        if (laneElements[lane]) laneElements[lane].classList.add('active');

        laneBeamAlpha[lane] = 1.0;

        if (holdingTiles[lane]) return;

        const activeHold = activeTiles.find(t => t.lane === lane && t.type === 'long' && t.hit && !t.completed && !t.failed);
        if (activeHold) {
            holdingTiles[lane] = activeHold;
            activeHold.lastValidHoldTime = Date.now();
            const isLight = document.body.getAttribute('data-theme') === 'light';
            const colors = isLight ? CONFIG.colorsLight : CONFIG.colorsDark;
            const color = colors.long[1];
            toggleHoldEffect(lane, true, color);
            return;
        }

        const songTime = (audioCtx.currentTime - startTime) * 1000;
        const target = activeTiles.find(t => {
            if (t.hit || t.completed || t.failed) return false;
            if (t.lane !== lane) return false;
            if (t.type === 'tap' && t.hitAnimStart) return false;
            const diff = t.time - songTime;
            if (diff > 210 || diff < -240) return false;
            return true;
        });

        if (target) {
            const diff = Math.abs(target.time - songTime);

            target.hit = true;
            consecutiveMisses = 0;
            lastHitTime = Date.now();

            const isLight = document.body.getAttribute('data-theme') === 'light';
            const colors = isLight ? CONFIG.colorsLight : CONFIG.colorsDark;
            let color = target.type === 'long' ? colors.long[1] : colors.tap[1];

            if (target.type === 'tap') target.hitAnimStart = Date.now();

            // 🔥 ОТРИМУЄМО ПОТОЧНИЙ МНОЖНИК
            const mult = getComboMultiplier();

            if (diff < 70) {
                // PERFECT HIT
                // 🔥 МНОЖИМО ОЧКИ
                score += Math.round(CONFIG.scorePerfect * mult);

                showRating(getText('perfect'), "rating-perfect");
                spawnSparks(lane, canvas.height * CONFIG.hitPosition, '#ff00ff', 'perfect');
            } else {
                // GOOD HIT
                // 🔥 МНОЖИМО ОЧКИ
                score += Math.round(CONFIG.scoreGood * mult);

                showRating(getText('good'), "rating-good");
                spawnSparks(lane, canvas.height * CONFIG.hitPosition, '#00ffff', 'good');
            }

            if (target.type === 'long') {
                holdingTiles[lane] = target;
                target.lastValidHoldTime = Date.now();
                toggleHoldEffect(lane, true, color);

                // Довга нота при старті теж дає очки (як Perfect), множимо і їх
                score += Math.round(CONFIG.scorePerfect * mult);
                showRating(getText('perfect'), "rating-perfect");

            } else {
                combo++;
            }
            updateScoreUI(true);
        } else {
            missNote({ lane: lane }, false);
        }
    }

    function handleInputUp(lane) {
        keyState[lane] = false;
        if (laneElements[lane]) laneElements[lane].classList.remove('active');
        toggleHoldEffect(lane, false);
        const tile = holdingTiles[lane];
        if (tile) holdingTiles[lane] = null;
    }

    function missNote(tile, isSpawnedMiss) {
        consecutiveMisses++;
        combo = 0;
        updateScoreUI();
        showRating(getText('miss'), "rating-miss");
        if (gameContainer) {
            gameContainer.classList.add('shake-screen');
            setTimeout(() => gameContainer.classList.remove('shake-screen'), 300);
        }
        if (consecutiveMisses >= CONFIG.missLimit) endGame(false);
    }

    /* --- SCORING MULTIPLIER LOGIC --- */
    function getComboMultiplier() {
        if (combo >= 400) return 5.0; // +400%
        if (combo >= 200) return 3.0; // +200%
        if (combo >= 100) return 2.0; // +100%
        if (combo >= 50) return 1.5; // +50%
        return 1.0; // База
    }
    /* --- ОНОВЛЕНИЙ UI РАХУНКУ З ЕФЕКТАМИ КОНТЕЙНЕРА --- */
    function updateScoreUI(isHit = false) {
        const scoreEl = document.getElementById('score-display');
        if (scoreEl) scoreEl.innerText = score;

        const gameContainer = document.getElementById('game-container');
        // Отримуємо наш новий шар для рамки
        const legendaryOverlay = document.getElementById('legendary-border-overlay');

        if (comboDisplay) {
            const mult = getComboMultiplier();
            const textStr = `${getText('combo')} ${combo} (x${mult})`;
            comboDisplay.innerText = textStr;
            comboDisplay.setAttribute('data-text', textStr);

            // 1. Очищення старих класів
            comboDisplay.classList.remove('combo-electric', 'combo-gold', 'combo-cosmic', 'combo-legendary');
            if (gameContainer) {
                // Видаляємо старі класи рамок контейнера (бо тепер у нас окремий div для 800+)
                gameContainer.classList.remove('container-ripple-gold', 'container-ripple-cosmic');
                gameContainer.style.border = ''; // Скидаємо бордер, якщо він був
            }
            // Вимикаємо легендарний оверлей
            if (legendaryOverlay) legendaryOverlay.classList.remove('active');

            // 2. Логіка класів
            if (combo >= 800) {
                // 🔥 LEGENDARY (800+)
                comboDisplay.classList.add('combo-legendary');

                // Вмикаємо новий HTML шар
                if (legendaryOverlay) legendaryOverlay.classList.add('active');

            } else if (combo >= 400) {
                // 🟣 COSMIC (400+)
                comboDisplay.classList.add('combo-cosmic');
                if (gameContainer) gameContainer.classList.add('container-ripple-cosmic');

            } else if (combo >= 200) {
                // 🟡 GOLD (200+)
                comboDisplay.classList.add('combo-gold');
                if (gameContainer) gameContainer.classList.add('container-ripple-gold');

            } else if (combo >= 100) {
                // 🔵 ELECTRIC (100+)
                comboDisplay.classList.add('combo-electric');
            }

            comboDisplay.style.opacity = combo > 2 ? 1 : 0;

            if (isHit) {
                comboDisplay.classList.remove('combo-pop');
                void comboDisplay.offsetWidth;
                comboDisplay.classList.add('combo-pop');
            }
        }
    }

    function showRating(text, cssClass) {
        if (!ratingContainer) return;
        const el = document.createElement('div');
        el.className = `hit-rating ${cssClass}`;
        el.innerText = text;
        ratingContainer.appendChild(el);
        setTimeout(() => el.remove(), 500);
    }

    function toggleHoldEffect(lane, active, color) {
        if (!holdEffectsContainer) return;
        let effect = document.getElementById(`hold-effect-${lane}`);
        if (!effect) {
            effect = document.createElement('div');
            effect.id = `hold-effect-${lane}`;
            effect.className = 'long-note-hold-effect';
            effect.style.left = (lane * 25) + '%';
            holdEffectsContainer.appendChild(effect);
        }
        if (active) {
            effect.style.background = `linear-gradient(to top, ${color}, transparent)`;
            effect.style.display = 'block';
        } else {
            effect.style.display = 'none';
        }
    }

    function updateProgressBar(current, total) {
        if (!progressBar) return;

        // Розраховуємо відсоток (0.0 - 1.0)
        const ratio = Math.min(1, current / total);
        const pct = ratio * 100;

        progressBar.style.width = `${pct}%`;

        const isSecret = songsDB[currentSongIndex].isSecret;

        if (isSecret) {
            // ЛОГІКА ДЛЯ 5 ЗІРОК (Секретна пісня)
            // 20% = 1, 40% = 2, 60% = 3, 80% = 4, ~98% = 5
            if (starsElements[0]) ratio > 0.2 ? starsElements[0].classList.add('active') : starsElements[0].classList.remove('active');
            if (starsElements[1]) ratio > 0.4 ? starsElements[1].classList.add('active') : starsElements[1].classList.remove('active');
            if (starsElements[2]) ratio > 0.6 ? starsElements[2].classList.add('active') : starsElements[2].classList.remove('active');
            if (starsElements[3]) ratio > 0.8 ? starsElements[3].classList.add('active') : starsElements[3].classList.remove('active');
            // Останню зірку даємо майже в самому кінці
            if (starsElements[4]) ratio > 0.98 ? starsElements[4].classList.add('active') : starsElements[4].classList.remove('active');
        } else {
            // ЛОГІКА ДЛЯ 3 ЗІРОК (Звичайна пісня)
            // 33% = 1, 66% = 2, ~98% = 3
            if (starsElements[0]) ratio > 0.33 ? starsElements[0].classList.add('active') : starsElements[0].classList.remove('active');
            if (starsElements[1]) ratio > 0.66 ? starsElements[1].classList.add('active') : starsElements[1].classList.remove('active');
            if (starsElements[2]) ratio > 0.98 ? starsElements[2].classList.add('active') : starsElements[2].classList.remove('active');
        }
    }

    async function endGame(victory) {
        isPlaying = false;
        if (sourceNode) sourceNode.stop();
        if (animationFrameId) cancelAnimationFrame(animationFrameId);

        if (bgMusicEl && !isMuted) bgMusicEl.play().catch(() => { });

        const title = document.getElementById('end-title');
        if (title) {
            title.innerText = victory ? getText('complete') : getText('failed');
            title.style.color = victory ? "#66FCF1" : "#FF0055";
        }
        const scoreEl = document.getElementById('final-score');
        if (scoreEl) scoreEl.innerText = score;


        // --- 🌟 НОВИЙ РОЗРАХУНОК ЗІРОК (ЗА ПРОГРЕСОМ) ---
        let starsCount = 0;
        const isSecret = songsDB[currentSongIndex].isSecret;

        if (victory) {
            // ЯКЩО ПЕРЕМОГА - ЗАВЖДИ МАКСИМУМ ЗІРОК
            starsCount = isSecret ? 5 : 3;
        } else {
            // ЯКЩО ПОРАЗКА - РАХУЄМО ПО ВІДСОТКУ ПРОГРЕСУ
            // Скільки часу пройшло / Загальна довжина
            const currentTime = audioCtx ? (audioCtx.currentTime - startTime) : 0;
            const totalDuration = audioBuffer ? audioBuffer.duration : 1;
            const progress = currentTime / totalDuration;

            if (isSecret) {
                // Шкала для 5 зірок
                if (progress > 0.8) starsCount = 4;
                else if (progress > 0.6) starsCount = 3;
                else if (progress > 0.4) starsCount = 2;
                else if (progress > 0.2) starsCount = 1;
            } else {
                // Шкала для 3 зірок
                if (progress > 0.66) starsCount = 2;
                else if (progress > 0.33) starsCount = 1;
            }
        }
    
        // 2. ЛОГІКА ЗБЕРЕЖЕННЯ (High Score Logic)
        if (isSecret && starsCount >= 1) {
            // Отримуємо ID, який ми згенерували при старті
            const userId = localStorage.getItem('playerId');
            const playerName = localStorage.getItem('playerName'); 

            if (userId && playerName) {
                try {
                    const dbRef = collection(db, "secret_leaderboard");
                    
                    // 🔥 ГОЛОВНА ЗМІНА: Шукаємо по userId, а не по імені!
                    const q = query(dbRef, where("userId", "==", userId));
                    const querySnapshot = await getDocs(q);

                    if (!querySnapshot.empty) {
                        // Оновлюємо існуючий запис
                        const userDoc = querySnapshot.docs[0];
                        const oldScore = userDoc.data().score;
                        const docId = userDoc.id;

                        // Оновлюємо ім'я теж (на випадок розсинхрону), рахунок і дату
                        if (score > oldScore) {
                            const userDocRef = doc(db, "secret_leaderboard", docId);
                            await updateDoc(userDocRef, { 
                                score: score, 
                                date: new Date(),
                                name: playerName // Актуалізуємо ім'я
                            });
                        }
                    } else {
                        // Створюємо новий запис з userId
                        await addDoc(dbRef, { 
                            userId: userId, // 🔥 Зберігаємо ID
                            name: playerName, 
                            score: score, 
                            date: new Date() 
                        });
                    }
                } catch (e) { console.error("Error updating leaderboard: ", e); }
            }
        }

        // Зберігаємо локально (Оновлюємо зірки та очки)
        if (score > 0) saveGameData(songsDB[currentSongIndex].title, score, starsCount);

        // Малюємо зірки на екрані результатів
        let starsStr = "";
        const totalStarsToShow = isSecret ? 5 : 3;
        for (let i = 0; i < totalStarsToShow; i++) starsStr += i < starsCount ? "★" : "☆";
        const starEl = document.getElementById('final-stars');
        if (starEl) starEl.innerText = starsStr;

        const resScreen = document.getElementById('result-screen');
        if (resScreen) resScreen.classList.remove('hidden');

        updateGameText();
    }

    /* --- INIT --- */
  function initControls() {
        const lanesContainer = document.getElementById('lanes-bg');
        if (lanesContainer) {
            for (let i = 0; i < 4; i++) laneElements[i] = lanesContainer.children[i];
        }

        // Блокуємо перехоплення кліків декором
        const ignoreElements = ['.hit-line', '.lane-hints', '#hold-effects-container', '#legendary-border-overlay'];
        ignoreElements.forEach(selector => {
            const el = document.querySelector(selector);
            if (el) el.style.pointerEvents = 'none';
        });

        // --- ПОШУК ---
        const searchInput = document.getElementById('song-search-input');
        const noSongsMsg = document.getElementById('no-songs-msg');

        if (searchInput) {
            // Зупиняємо "спливання" кліку, щоб не натиснути на пісню під пошуком
            searchInput.onclick = (e) => e.stopPropagation();
            
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.trim();
                const cards = document.querySelectorAll('.song-card');
                let visibleCount = 0;

                cards.forEach(card => {
                    const match = isFuzzyMatch(query, card.innerText);
                    card.style.display = match ? 'flex' : 'none';
                    if (match) visibleCount++;
                });

                if (noSongsMsg) {
                    if (visibleCount === 0 && query !== '') noSongsMsg.classList.remove('hidden');
                    else noSongsMsg.classList.add('hidden');
                }
            });
        }

        // --- ГРА: КЛІКИ (КАНВАС) ---
        if (canvas) {
            // Очищуємо старі події (якщо були) через клонування або просто додаємо нові
            const handleTouch = (e, isDown) => {
                e.preventDefault();
                const rect = canvas.getBoundingClientRect();
                const touches = e.changedTouches;
                for (let i = 0; i < touches.length; i++) {
                    const lane = Math.floor((touches[i].clientX - rect.left) / (rect.width / 4));
                    if (lane >= 0 && lane < 4) isDown ? handleInputDown(lane) : handleInputUp(lane);
                }
            };

            canvas.addEventListener('touchstart', (e) => handleTouch(e, true), { passive: false });
            canvas.addEventListener('touchend', (e) => handleTouch(e, false), { passive: false });

            canvas.addEventListener('mousedown', (e) => {
                const rect = canvas.getBoundingClientRect();
                const lane = Math.floor((e.clientX - rect.left) / (rect.width / 4));
                if (lane >= 0 && lane < 4) {
                    handleInputDown(lane);
                    const mouseUpHandler = () => {
                        handleInputUp(lane);
                        window.removeEventListener('mouseup', mouseUpHandler);
                    };
                    window.addEventListener('mouseup', mouseUpHandler);
                }
            });
        }

        // --- КЛАВІАТУРА ---
        window.addEventListener('keydown', e => {
            if (e.code === 'Space') {
                if (document.activeElement.id === 'song-search-input') return;
                e.preventDefault();
                togglePauseGame();
                return;
            }
            if (!e.repeat) {
                const lane = KEYS.indexOf(e.code);
                if (lane !== -1) handleInputDown(lane);
            }
        });

        window.addEventListener('keyup', e => {
            const lane = KEYS.indexOf(e.code);
            if (lane !== -1) handleInputUp(lane);
        });

        // --- КНОПКИ ІНТЕРФЕЙСУ (ТЕМА / ЗВУК / МОВА) ---
        const setupBtn = (id, fn) => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.onclick = (e) => { e.stopPropagation(); playClick(); fn(btn); };
                btn.onmouseenter = playHover;
            }
        };

        setupBtn('themeToggle', (btn) => {
            const isDark = document.body.getAttribute('data-theme') === 'dark';
            const next = isDark ? 'light' : 'dark';
            document.body.setAttribute('data-theme', next);
            localStorage.setItem('siteTheme', next);
            btn.innerText = next === 'dark' ? '🌙' : '☀️';
        });

        setupBtn('soundToggle', (btn) => {
            isMuted = !isMuted;
            localStorage.setItem('isMuted', isMuted);
            if (masterGain) masterGain.gain.value = isMuted ? 0 : 1;
            btn.innerText = isMuted ? '🔇' : '🔊';
            if (bgMusicEl) isMuted ? bgMusicEl.pause() : (!isPlaying && bgMusicEl.play().catch(() => {}));
        });

        const langToggle = document.getElementById('langToggle');
        if (langToggle) {
            langToggle.onclick = (e) => {
                e.stopPropagation();
                playClick();
                document.querySelector('.lang-wrapper').classList.toggle('open');
            };
        }

        document.querySelectorAll('.lang-dropdown button').forEach(b => {
            b.onclick = () => {
                playClick();
                currentLang = b.dataset.lang;
                localStorage.setItem('siteLang', currentLang);
                document.body.setAttribute('data-lang', currentLang);
                updateGameText();
                updateLangDisplay();
            };
        });

        document.addEventListener('click', () => {
            const lw = document.querySelector('.lang-wrapper');
            if (lw) lw.classList.remove('open');
        });

       // НАВІГАЦІЯ (dance.js)
        const setupNav = (id, fn) => {
            const btn = document.getElementById(id);
            if (btn) btn.onclick = () => { playClick(); fn(); };
        };

        // ТУТ МАЄ БУТИ ТІЛЬКИ ЦЕ:
        setupNav('global-back-btn', () => isPlaying ? quitGame() : window.location.href = 'index.html');
        setupNav('btn-quit', quitGame);
        setupNav('btn-menu-end', quitGame);
        setupNav('btn-pause', togglePauseGame);
        setupNav('btn-resume', togglePauseGame);
        setupNav('btn-restart', () => {
            document.getElementById('result-screen').classList.add('hidden');
            resetGameState();
            setTimeout(() => startGame(currentSongIndex), 50);
        });

        function togglePauseGame() {
            if (!isPlaying) return;
            isPaused = !isPaused;
            const m = document.getElementById('pause-modal');
            if (isPaused) {
                audioCtx.suspend();
                m?.classList.remove('hidden');
            } else {
                audioCtx.resume();
                m?.classList.add('hidden');
                gameLoop();
            }
        }
    }

    function resizeCanvas() { if (gameContainer && gameContainer.clientWidth && canvas) { canvas.width = gameContainer.clientWidth; canvas.height = gameContainer.clientHeight; } }
    window.addEventListener('resize', resizeCanvas);

    if (localStorage.getItem('siteLang')) { currentLang = localStorage.getItem('siteLang'); document.body.setAttribute('data-lang', currentLang); }

    async function startGame(idx) {
        // ASK FOR NAME IF SECRET LEVEL
        const song = songsDB[idx];
        if (song.isSecret) {
            let playerName = localStorage.getItem('playerName');
            if (!playerName) {
                // Використовуємо наш новий кастомний модал
                playerName = await getNameFromUser();
                if (!playerName) return; // Якщо якимось дивом нічого не повернулось
            }
        }

        if (bgMusicEl) bgMusicEl.pause();
        resetGameState();

        // INJECT EXTRA STARS FOR 5-STAR UI IF SECRET
        if (song.isSecret) {
            const starContainer = document.querySelector('.stars-container');
            if (starContainer) {
                // Remove existing to rebuild correctly
                starContainer.innerHTML = '';
                // Create 5 stars
                for (let i = 1; i <= 5; i++) {
                    const s = document.createElement('div');
                    s.id = `star-${i}`;
                    // 🔥 ВИПРАВЛЕНО: Був клас 'star', а в CSS 'star-marker'
                    s.className = 'star-marker';
                    s.innerHTML = '★';
                    // 🔥 ВИПРАВЛЕНО: Додано позиціювання, щоб не висіли вертикально
                    s.style.left = `${(i) * 19}%`; // 19%, 38%, 57%...
                    starContainer.appendChild(s);
                }
                // Update reference array
                starsElements = [
                    document.getElementById('star-1'), document.getElementById('star-2'),
                    document.getElementById('star-3'), document.getElementById('star-4'),
                    document.getElementById('star-5')
                ];
            }
        } else {
            // Revert to 3 stars if normal song
            const starContainer = document.querySelector('.stars-container');
            if (starContainer && starsElements.length === 5) {
                starContainer.innerHTML = '';
                for (let i = 1; i <= 3; i++) {
                    const s = document.createElement('div');
                    s.id = `star-${i}`;
                    s.className = 'star-marker';
                    s.innerHTML = '★';
                    // Відновлюємо стандартні позиції
                    if (i === 1) s.style.left = '33%';
                    if (i === 2) s.style.left = '66%';
                    if (i === 3) s.style.left = '95%';
                    starContainer.appendChild(s);
                }
                starsElements = [document.getElementById('star-1'), document.getElementById('star-2'), document.getElementById('star-3')];
            }
        }

        const mySession = currentSessionId;
        currentSongIndex = idx;

        if (menuLayer) menuLayer.classList.add('hidden');
        if (gameContainer) gameContainer.classList.remove('hidden');
        if (loader) loader.classList.remove('hidden');
        resizeCanvas();
        updateGameText();
        analyzeAudio(`audio/tracks/${song.file}`, mySession).then(generatedTiles => {
            if (mySession !== currentSessionId) return;
            if (generatedTiles) { mapTiles = generatedTiles; if (loader) loader.classList.add('hidden'); playMusic(); }
        });
    }
    /* --- CUSTOM NOTIFICATION SYSTEM --- */
    function showNotification(text, type = 'success') {
        const el = document.createElement('div');
        el.className = 'game-notification';
        
        // Додаємо іконку залежно від типу (опціонально)
        const icon = type === 'error' ? '❌' : '✨';
        el.innerHTML = `${icon} ${text}`;
        
        document.body.appendChild(el);

        // Звук успіху (тихий "дзинь")
        // Якщо хочеш, можна розкоментувати і додати звук
        // const audio = new Audio('audio/success.mp3'); audio.volume = 0.3; audio.play().catch(()=>{});

        // Видаляємо через 3 секунди
        setTimeout(() => {
            el.style.animation = 'toastFadeOut 0.5s forwards';
            setTimeout(() => el.remove(), 500); // Чекаємо завершення анімації
        }, 2500);
    }

    function playMusic() {
        if (sourceNode) sourceNode.stop();
        sourceNode = audioCtx.createBufferSource();
        sourceNode.buffer = audioBuffer;
        sourceNode.connect(masterGain);

        const startDelay = 2;
        startTime = audioCtx.currentTime + startDelay;
        sourceNode.start(startTime);

        isPlaying = true; isPaused = false;
        animationFrameId = requestAnimationFrame(gameLoop);
    }
    // ... (попередня функція startGame закінчилася тут)

   function quitGame() {
        if (bgMusicEl && !isMuted) bgMusicEl.play().catch(() => { });

        resetGameState();
        if (gameContainer) gameContainer.classList.add('hidden');
        if (menuLayer) menuLayer.classList.remove('hidden');
        renderMenu();

        // Очищення пошуку при виході
        const searchInput = document.getElementById('song-search-input');
        if (searchInput) {
            searchInput.value = ''; 
            // Оновлюємо список, щоб показати всі пісні
            const noSongsMsg = document.getElementById('no-songs-msg');
            if (noSongsMsg) noSongsMsg.classList.add('hidden');
        }
    }
    // Функція модального вікна (має бути ТУТ, всередині DOMContentLoaded)
    function showSecretLockModal() {
        const modal = document.createElement('div');
        modal.className = 'secret-lock-modal';
        modal.innerHTML = `
            <div class="secret-lock-content">
                <span class="secret-lock-close">&times;</span>
                <div class="secret-lock-icon">🔒</div>
                <p>${getText('secretLockMsg')}</p>
                <button class="secret-lock-btn">${getText('close')}</button>
            </div>
        `;
        document.body.appendChild(modal);

        const close = () => modal.remove();
        modal.querySelector('.secret-lock-close').onclick = close;
        modal.querySelector('.secret-lock-btn').onclick = close;
        modal.onclick = (e) => { if (e.target === modal) close(); };
    }

    // Ініціалізація управління
    initControls();

    // ПЕРШИЙ ЗАПУСК МЕНЮ (якщо цього рядка немає, список не з'явиться)
    renderMenu();

    /* ==========================================
   🔍 FUZZY SEARCH LOGIC (TRIGRAMS)
   ========================================== */

// 1. Нормалізація тексту (прибираємо пробіли, спецсимволи, робимо маленькі літери)
// "Linkin Park - Numb" -> "linkinparknumb"
function normalizeSearchText(str) {
    return str.toLowerCase().replace(/[^a-zа-я0-9їієґ]/g, '');
}

// 2. Генерація триграм (розбивка по 3 літери)
// "hello" -> ['hel', 'ell', 'llo']
function getTrigrams(str) {
    const trigrams = [];
    if (str.length < 3) return [str]; // Якщо слово коротке, повертаємо як є
    for (let i = 0; i < str.length - 2; i++) {
        trigrams.push(str.slice(i, i + 3));
    }
    return trigrams;
}

// 3. Порівняння (твоя умова про 50%)
function isFuzzyMatch(query, target) {
    const qNorm = normalizeSearchText(query);
    const tNorm = normalizeSearchText(target);

    // Якщо запит порожній - показуємо все
    if (qNorm.length === 0) return true;

    // Якщо запит дуже короткий (1-2 літери), триграми не працюють, 
    // тому використовуємо звичайний пошук (includes)
    if (qNorm.length < 3) {
        return tNorm.includes(qNorm);
    }

    const qTrigrams = getTrigrams(qNorm);
    const tTrigrams = getTrigrams(tNorm);

    let matches = 0;
    
    // Рахуємо, скільки блоків з запиту є в назві пісні
    qTrigrams.forEach(tri => {
        if (tTrigrams.includes(tri)) {
            matches++;
        }
    });

    // Відсоток збігу (кількість знайдених блоків / кількість блоків у запиті)
    const similarity = matches / qTrigrams.length;

    // Якщо збіглося 50% (0.5) або більше блоків - це воно!
    return similarity >= 0.5;
}

}); // ЦЯ ДУЖКА ЗАКРИВАЄ document.addEventListener('DOMContentLoaded', ...