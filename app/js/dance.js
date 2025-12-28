/* ==========================================
   🎹 NEON PIANO: ULTIMATE EDITION + FIREBASE
   // RENDERER: Canvas 2D (GPU/Memory Optimized)
   // ENGINEER: Gemini (Principal Game Eng)
   ========================================== */

// --- FIREBASE IMPORTS ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
    getFirestore, collection, addDoc, getDocs, query, orderBy, limit, where, updateDoc, doc, setDoc, serverTimestamp
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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ==========================================
// ⚙️ CONSTANTS & CONFIGURATION
// ==========================================

const KEYS = ['KeyS', 'KeyD', 'KeyJ', 'KeyK'];

const CONFIG = {
    speedStart: 800,
    speedEnd: 500,
    speedStartSecret: 700,
    speedEndSecret: 450,
    hitPosition: 0.85,
    noteHeight: 210,
    hitScale: 1.15,
    missLimit: 3,
    scorePerfect: 50,
    scoreGood: 20,
    scoreHoldTick: 5,
    // Colors maintained exactly for pixel-perfect match
    colorsDark: {
        tap: ['#00d2ff', '#3a7bd5'],
        long: ['#ff0099', '#493240'],
        dead: ['#555', '#222'],
        released: ['#666', '#444'],
        stroke: "rgba(255,255,255,0.8)",
        laneLine: "rgba(255,255,255,0.1)"
    },
    colorsLight: {
        tap: ['#0077aa', '#005588'],
        long: ['#aa0066', '#770044'],
        dead: ['#999', '#777'],
        released: ['#888', '#666'],
        stroke: "#000000",
        laneLine: "rgba(0,0,0,0.2)"
    }
};

const PALETTES = {
    STEEL: { light: '#cfd8dc', main: '#90a4ae', dark: '#263238', glow: '#90a4ae', border: '#eceff1' },
    GOLD: { black: '#1a1a1a', choco: '#2d1b15', amber: '#e6ca3fff', light: '#bcaaa4', glow: '#e6ca3fff', border: '#e6ca3fff' },
    COSMIC: { core: '#2a003b', accent: '#d500f9', glitch: '#00e5ff', glow: '#d500f9', border: '#00e5ff' },
    LEGENDARY: { body: '#3ef5b8ff', accent: '#7FFFD4', glow: '#7FFFD4', aura: 'rgba(153, 147, 102, 1)', tap1: '#26c691ff', tap2: '#08191dff', long1: '#26c691ff', long2: 'rgba(7, 80, 76, 0.99)' },
    ELECTRIC: { tap1: '#eceff1', tap2: '#607d8b', long1: '#607d8b', long2: '#37474f', glow: '#00bcd4', border: '#80deea' }
};

// TRANSLATIONS: added leaderboard-specific keys
const TRANSLATIONS = {
    UA: {
        icon: "UA",
        instructions: "Гра здійснюється за допомогою клавіш S D J K",
        score: "Рахунок",
        combo: "КОМБО",
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
        leaderboardGlobal: "Загальний рейтинг",
        leaderboardSecret: "Секретний рейтинг",
        lbGlobal: "Загальний",
        lbSecret: "Секретний",
        lbLevels: "Рівні",
        lbTotalScore: "Всього очок",
        namePls: "Введіть ім'я",
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
        noSongsFound: "🚫 Жодних пісень не знайдено"
    },
    RU: {
        icon: "RU",
        instructions: "Игра осуществляется с помощью клавиш S D J K",
        score: "Счет",
        combo: "КОМБО",
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
        leaderboardGlobal: "Общий рейтинг",
        leaderboardSecret: "Секретный рейтинг",
        lbGlobal: "Общий",
        lbSecret: "Секретный",
        lbLevels: "Уровни",
        lbTotalScore: "Всего очков",
        namePls: "Введите имя",
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
        noSongsFound: "🚫 Песен не найдено"
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
        leaderboardGlobal: "Meeeow",
        leaderboardSecret: "Shhh-Meow",
        lbGlobal: "Meeeow",
        lbSecret: "Shhh-Meow",
        lbLevels: "M-Lvls",
        lbTotalScore: "Sum-Meow",
        namePls: "Meow?",
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
        noSongsFound: "🚫 Meow weow grrr"
    }
};

const songsDB = [
    { file: "secret.mp3", title: "???", artist: "???", isSecret: true, duration: "??:??" },
    { file: "Frank Sinatra - Let It Snow!.mp3", title: "Let It Snow!", artist: "Frank Sinatra", duration: "2m 35s", tag: "xmas" },
    { file: "Mariah Carey & Justin Bieber - All I Want For Christmas Is You.mp3", title: "All I Want For Christmas Is You", artist: "Mariah Carey", duration: "4m 01s", tag: "xmas" },
    { file: "Wham! - Last Christmas.mp3", title: "Last Christmas", artist: "Wham!", duration: "4m 22s", tag: "xmas" },
    { file: "AfterDark.mp3", title: "After Dark", artist: "Mr. Kitty", duration: "4m 17s", tag: "gold" },
    { file: "AfterHours.mp3", title: "After Hours", artist: "The Weeknd", duration: "6m 01s", tag: "gold" },
    { file: "AlexAngelofDarkness.mp3", title: "Angel of Darkness", artist: "Alex C. feat. Yasmin K.", duration: "3m 33s" },
    { file: "Benny Drugs.mp3", title: "Benny Drugs", artist: "Benny", duration: "3m 15s" },
    { file: "BlackSwan.mp3", title: "Black Swan", artist: "BTS", duration: "3m 18s", tag: "gold" },
    { file: "BorderLine.mp3", title: "Borderline", artist: "Tame Impala", duration: "3m 57s" },
    { file: "Casey Edwards Bury The Light.mp3", title: "Bury the Light", artist: "Casey Edwards ft. Victor Borba", duration: "9m 42s" },
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
    { file: "OdetariKeep.mp3", title: "KEEP FOLLOWING", artist: "Odetari", duration: "2m 15s" },
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
    { file: "Plug (Love Is A Drug).mp3", title: "Plug (Love Is A Drug)", artist: "Future & Juice WRLD", duration: "3m 15s" },
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
    { file: "JuiceWrldWontLetGo.mp3", title: "Won't Let Go", artist: "Juice WRLD", duration: "3m 20s" },
    { file: "Millennium Parade Work.mp3", title: "WORK", artist: "millennium parade x Sheena Ringo", duration: "3m 48s" },
    { file: "Kanalia Writing On The Wall.mp3", title: "Writing on the Wall", artist: "Will Stetson", duration: "3m 40s" },
    { file: "SaraunhLyWutiwant.mp3", title: "wutiwant", artist: "saraunh0ly", duration: "2m 10s" },
    { file: "ValentinStrikalo.mp3", title: "Кайен", artist: "Валентин Стрыкало", duration: "3m 10s" },
    { file: "Konfuz - Кайф Ты Поймала.mp3", title: "Кайф ты поймала", artist: "Konfuz", duration: "2m 50s" },
    { file: "Zhanulka Лазить По Стенам.mp3", title: "лазить по стенам", artist: "Zhanulka", duration: "2m 30s" },
    { file: "mzlff,STEDD.mp3", title: "однополярності", artist: "mzlff, STED.D", duration: "3m 05s" },
    { file: "Skriptonit_-_Tancuj_so_mnoj_v_temnote.mp3", title: "Танцуй со мной в темноте", artist: "Скриптонит", duration: "3m 55s" },
    { file: "Pyrokinesis Трупный Синод.mp3", title: "Трупный Синод", artist: "Pyrokinesis", duration: "3m 40s" },
    { file: "...Baby One More Time (from Kung Fu Panda 4).mp3", title: "Baby One More Time", artist: "Tenacious D", duration: "3m 13s" },
    { file: "Barricades.mp3", title: "Barricades", artist: "Sawano Hiroyuki", duration: "3m 41s" },
    { file: "Bad Liar.mp3", title: "Bad Liar", artist: "Imagine Dragons", duration: "4m 21s" },
    { file: "Beethoven Virus - Ultimate Version.mp3", title: "Beethoven Virus", artist: "logan feece", duration: "3m 38s" },
    { file: "Black Catcher.mp3", title: "Black Catcher", artist: "VK Blanka", duration: "3m 17s" },
    { file: "Black Rover.mp3", title: "Black Rover", artist: "VK Blanka", duration: "3m 30s" },
    { file: "Bleach - Invasion - Main Theme.mp3", title: "Bleach Invasion Main Theme", artist: "Geek Music", duration: "4m 11s" },
    { file: "Blood Water.mp3", title: "Blood // Water", artist: "grandson", duration: "3m 37s" },
    { file: "Bones.mp3", title: "Bones", artist: "Imagine Dragons", duration: "2m 45s" },
    { file: "BRAIN.mp3", title: "BRAIN", artist: "Kanaria", duration: "2m 37s" },
    { file: "Bury Me Low.mp3", title: "Bury Me Low", artist: "8 Graves", duration: "3m 37s" },
    { file: "End of Me.mp3", title: "End of Me", artist: "Ashes Remain", duration: "2m 50s" },
    { file: "Est-ce que tu m'aimes - Pilule bleue.mp3", title: "Est-ce que tu m'aimes ?", artist: "GIMS", duration: "3m 57s" },
    { file: "Fallen Angel.mp3", title: "Fallen Angel", artist: "Three Days Grace", duration: "3m 06s" },
    { file: "GASSHOW.mp3", title: "GASSHOW", artist: "illion", duration: "3m 04s" },
    { file: "GOSSIP (feat. Tom Morello).mp3", title: "GOSSIP", artist: "Måneskin, Tom Morello", duration: "2m 48s" },
    { file: "Hard Drive.mp3", title: "Hard Drive", artist: "Griffinilla", duration: "3m 00s" },
    { file: "Hate Me!.mp3", title: "Hate Me!", artist: "MASN", duration: "2m 35s" },
    { file: "Hero.mp3", title: "Hero", artist: "Skillet", duration: "3m 07s" },
    { file: "House of Memories.mp3", title: "House of Memories", artist: "Panic! At The Disco", duration: "3m 29s" },
    { file: "I Ain't Worried.mp3", title: "I Ain't Worried", artist: "OneRepublic", duration: "2m 28s" },
    { file: "It's Time.mp3", title: "It's Time", artist: "Imagine Dragons", duration: "4m 00s" },
    { file: "JUNGE BALLER.mp3", title: "JUNGE BALLER", artist: "6PM RECORDS, Ski Aggu, Haaland936, SIRA", duration: "2m 11s" },
    { file: "Kyouran Hey Kids!! - Noragami Aragoto.mp3", title: "Kyouran Hey Kids!!", artist: "Animelmack", duration: "3m 45s" },
    { file: "Lay All Your Love On Me.mp3", title: "Lay All Your Love On Me", artist: "ABBA", duration: "4m 34s" },
    { file: "Leave a Light On - Jayson DeZuzio Remix.mp3", title: "Leave a Light On Remix", artist: "Tom Walker, Jayson DeZuzio", duration: "3m 11s" },
    { file: "Mary On A Cross.mp3", title: "Mary On A Cross", artist: "Ghost", duration: "4m 05s" },
    { file: "Me and the Devil - Nightcore.mp3", title: "Me and the Devil", artist: "neko, Tazzy", duration: "2m 32s" },
    { file: "phantasmagoria.mp3", title: "phantasmagoria", artist: "mzlff", duration: "2m 13s" },
    { file: "ReawakeR (feat. Felix of Stray Kids).mp3", title: "ReawakeR ", artist: "LiSA, Felix", duration: "3m 05s" },
    { file: "Royalty.mp3", title: "Royalty", artist: "Egzod, Maestro Chives, Neoni", duration: "3m 44s" },
    { file: "Shinzo wo Sasageyo !.mp3", title: "Shinzo wo Sasageyo !", artist: "Linked Horizon", duration: "5m 41s" },
    { file: "Sold Out.mp3", title: "Sold Out", artist: "Hawk Nelson", duration: "3m 33s" },
    { file: "Still Worth Fighting For.mp3", title: "Still Worth Fighting For", artist: "My Darkest Days", duration: "3m 16s" },
    { file: "Sweat.mp3", title: "Sweat", artist: "DJSM", duration: "2m 13s" },
    { file: "Take Me to the Beach (feat. Ado).mp3", title: "Take Me to the Beach", artist: "Imagine Dragons, Ado", duration: "2m 47s" },
    { file: "The Death of God's Will.mp3", title: "The Death of God's Will", artist: "Heaven Pierce Her", duration: "5m 11s" },
    { file: "Treachery (Aizen's Theme).mp3", title: "Treachery", artist: "Crystilo", duration: "4m 43s" },
    { file: "Unendlichkeit (Remix).mp3", title: "Unendlichkeit (Remix)", artist: "MilleniumKid, JBS, The Boy The G", duration: "2m 53s" },
    { file: "Vielleicht Vielleicht.mp3", title: "Vielleicht Vielleicht", artist: "MilleniumKid, JBS", duration: "2m 23s" },
    { file: "Warriors.mp3", title: "Warriors", artist: "Imagine Dragons", duration: "2m 51s" },
    { file: "Whatever It Takes.mp3", title: "Whatever It Takes", artist: "Imagine Dragons", duration: "3m 21s" },
    { file: "Ruler Of My Heart (FromеAlien Stage) AmaLee.mp3", title: "Ruler Of My Heart ", artist: "AmaLee", duration: "3:38" },
    { file: "空想メソロギヰ.mp3", title: "空想メソロギヰ", artist: "Yousei Teikoku", duration: "4m 03s" }
];

// ==========================================
// 🛠 GLOBAL STATE & PERFORMANCE CACHE
// ==========================================

const State = {
    audioCtx: null,
    sourceNode: null,
    masterGain: null,
    audioBuffer: null,
    animationFrameId: null,
    currentSessionId: 0,
    isPlaying: false,
    isPaused: false,
    isMuted: localStorage.getItem('isMuted') === 'true',
    currentLang: localStorage.getItem('siteLang') || 'UA',
    isMobile: window.innerWidth < 768,
    
    // Game Logic
    startTime: 0,
    score: 0,
    maxPossibleScore: 0,
    combo: 0,
    maxCombo: 0,
    lastComboUpdateTime: 0,
    consecutiveMisses: 0,
    currentSongIndex: 0,
    lastHitTime: 0,
    currentSpeed: 1000,
    
    // Visuals
    gameWidth: 0,
    gameHeight: 0,
    comboScale: 1.0,
    currentComboTier: 'none',
    activeRatings: [], // Array of objects
    
    // Input
    keyState: [false, false, false, false],
    holdingTiles: [null, null, null, null],
    laneLastInputTime: [0, 0, 0, 0],
    laneBeamAlpha: [0, 0, 0, 0],
    laneLastType: ['tap', 'tap', 'tap', 'tap'],
    
    // Render Arrays
    mapTiles: [],
    activeTiles: [],
    
    // Ripple physics (visual hit-line disturbances)
    ripples: [],
    
    // Performance: Random Jitter Table (Deterministic Noise)
    shakeTable: new Float32Array(256),

    // NEW: pre-rendered glow sprite (single image used for taps/heads)
    glowSprite: null
};

// PRE-COMPUTE JITTER TABLE (Replaces Math.random() in draw loop)
for(let i = 0; i < State.shakeTable.length; i++) {
    State.shakeTable[i] = (Math.random() - 0.5);
}
function getDeterministicShake(offset = 0, magnitude = 1) {
    const idx = (Date.now() + offset) & 255; // Fast modulo 256
    return State.shakeTable[idx] * magnitude;
}

// OBJECT POOLING: PARTICLES
const MAX_PARTICLES = 300;
const particlePool = new Array(MAX_PARTICLES).fill(null).map(() => ({
    active: false,
    x: 0, y: 0,
    vx: 0, vy: 0,
    life: 0,
    color: '#fff',
    angle: 0,
    spin: 0
}));
let particlePoolIndex = 0;

// CACHING: GRADIENTS & PATHS
const GRADIENT_CACHE = {
    tap: {},
    longHead: {},
    longTail: {} // Cache tail gradients? (Depends on length, maybe dynamic)
};

// DOM ELEMENTS
let canvas, ctx, gameContainer, menuLayer, loader, holdEffectsContainer, progressBar, bgMusicEl, scoreEl;
let starsElements = [];
let laneElements = [null, null, null, null];

// ==========================================
// 🛠 AUDIO PROCESSING CORE
// ==========================================
// (Preserved exactly to maintain chart generation logic)

function normalizeBufferAggressive(buffer) {
    const newData = new Float32Array(buffer.length);
    let maxAmp = 0;
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

// ==========================================
// 🚀 INITIALIZATION & EVENTS
// ==========================================

document.addEventListener('DOMContentLoaded', () => {

    // DOM References
    canvas = document.getElementById('rhythmCanvas');
    ctx = canvas ? canvas.getContext('2d', { alpha: false, desynchronized: true }) : null;
    gameContainer = document.getElementById('game-container');
    menuLayer = document.getElementById('menu-layer');
    loader = document.getElementById('loader');
    holdEffectsContainer = document.getElementById('hold-effects-container');
    progressBar = document.getElementById('game-progress-bar');
    scoreEl = document.getElementById('score-display');
    
    starsElements = [
        document.getElementById('star-1'), document.getElementById('star-2'),
        document.getElementById('star-3'), document.getElementById('star-4'),
        document.getElementById('star-5')
    ].filter(el => el !== null);

    // Audio SFX
    const sfxClick = new Audio('audio/click.mp3');
    const sfxHover = new Audio('audio/hover.mp3');

    bgMusicEl = document.getElementById('bg-music');
    if (!bgMusicEl) {
        bgMusicEl = new Audio('audio/lofi-xmas.mp3');
        bgMusicEl.id = 'bg-music';
        bgMusicEl.loop = true;
        bgMusicEl.volume = 0.2;
        document.body.appendChild(bgMusicEl);
    }

    // Sync Settings
    const savedTheme = localStorage.getItem('siteTheme') || 'dark';
    document.body.setAttribute('data-theme', savedTheme);
    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) themeBtn.innerText = savedTheme === 'dark' ? '🌙' : '☀️';

    document.body.setAttribute('data-lang', State.currentLang);
    const langBtn = document.getElementById('langToggle');
    if (langBtn) langBtn.innerText = TRANSLATIONS[State.currentLang].icon || State.currentLang;

    const soundBtn = document.getElementById('soundToggle');
    if (soundBtn) soundBtn.innerText = State.isMuted ? '🔇' : '🔊';

    if (!State.isMuted && bgMusicEl) {
        const savedTime = localStorage.getItem('bgMusicTime');
        if (savedTime) bgMusicEl.currentTime = parseFloat(savedTime);
        bgMusicEl.play().catch(() => {});
    }

    window.addEventListener('beforeunload', () => {
        if (bgMusicEl && !bgMusicEl.paused) localStorage.setItem('bgMusicTime', bgMusicEl.currentTime);
    });

    function playClick() { if (!State.isMuted) { sfxClick.currentTime = 0; sfxClick.volume = 0.4; sfxClick.play().catch(() => { }); } }
    function playHover() { if (!State.isMuted) { sfxHover.currentTime = 0; sfxHover.volume = 0.2; sfxHover.play().catch(() => { }); } }

    /* --- HELPERS --- */
    function getText(key) { return TRANSLATIONS[State.currentLang][key] || TRANSLATIONS['UA'][key]; }

    function updateLangDisplay() {
        const lBtn = document.getElementById('langToggle');
        if (lBtn) {
            const icon = TRANSLATIONS[State.currentLang].icon || State.currentLang;
            lBtn.innerText = icon;
        }
    }

    function updateGameText() {
        const t = TRANSLATIONS[State.currentLang];
        
        // 1. Оновлення головного меню та гри
        const searchInput = document.getElementById('song-search-input');
        if (searchInput) searchInput.placeholder = t.searchPlaceholder;
        const noSongsMsg = document.querySelector('#no-songs-msg h3');
        if (noSongsMsg) noSongsMsg.innerText = t.noSongsFound;
        const instr = document.querySelector('.instruction-text'); 
        if (instr) instr.innerText = t.instructions;
        const pauseTitle = document.querySelector('#pause-modal h2'); if (pauseTitle) pauseTitle.innerText = t.paused;
        const btnResume = document.getElementById('btn-resume'); if (btnResume) btnResume.innerText = t.resume;
        const btnQuit = document.getElementById('btn-quit'); if (btnQuit) btnQuit.innerText = t.quit;
        const btnRestart = document.getElementById('btn-restart'); if (btnRestart) btnRestart.innerText = t.restart;
        const btnMenu = document.getElementById('btn-menu-end'); if (btnMenu) btnMenu.innerText = t.menu;
        const loadText = document.querySelector('#loader h3'); if (loadText) loadText.innerText = t.loading;
        
        // Кнопка в меню
        const lbBtn = document.querySelector('.btn-leaderboard');
        if (lbBtn) lbBtn.innerText = `🏆 ${getText('leaderboard')}`;

        updateLangDisplay();

        // 2. 🔥 ФІКС ДЛЯ ТАБЛИЦІ ЛІДЕРІВ (Живе оновлення)
        const lbModal = document.getElementById('lb-modal');
        if (lbModal) {
            // Оновлюємо заголовок вікна
            const titleEl = lbModal.querySelector('.lb-title');
            if (titleEl) titleEl.innerText = `🏆 ${getText('leaderboard')}`;

            // Оновлюємо кнопки вкладок
            const tabGlobal = lbModal.querySelector('[data-tab="global"]');
            const tabSecret = lbModal.querySelector('[data-tab="secret"]');
            if (tabGlobal) tabGlobal.innerText = getText('lbGlobal');
            if (tabSecret) tabSecret.innerText = getText('lbSecret');

            // Оновлюємо контент (перезавантажуємо поточну вкладку, щоб оновились заголовки таблиці TH)
            if (typeof loadLeaderboardData === 'function' && typeof currentLbTab !== 'undefined') {
                loadLeaderboardData(currentLbTab, lbModal);
            }
        }
    }

    // --- PLAYER IDENTITY (prompt name on first site visit) ---
    async function initPlayerIdentity() {
        let userId = localStorage.getItem('playerId');
        if (!userId) {
            userId = crypto.randomUUID();
            localStorage.setItem('playerId', userId);
        }

        // Prompt name on first site visit (modal, above menu)
        let playerName = localStorage.getItem('playerName');
        if (!playerName) {
            const name = await getNameFromUser(false);
            if (name) {
                localStorage.setItem('playerName', name);
                playerName = name;
            }
        }

        // Ensure global stats exist / synced
        try { await syncGlobalProgress(); } catch (e) { console.error("syncGlobalProgress:", e); }
    }
    initPlayerIdentity();

    // --- GLOBAL PROGRESS SYNC ---
    async function syncGlobalProgress() {
        const userId = localStorage.getItem('playerId');
        const playerName = localStorage.getItem('playerName');
        if (!userId || !playerName) return;

        let totalScore = 0;
        let levelsCompleted = 0;

        songsDB.forEach(song => {
            if (song.isSecret) return; // DO NOT count secret
            const data = getSavedData(song.title);
            if (data && data.stars > 0) {
                levelsCompleted++;
                totalScore += (data.score || 0);
            }
        });

        try {
            await setDoc(doc(db, "global_leaderboard", userId), {
                userId,
                name: playerName,
                levelsCompleted,
                totalScore,
                updatedAt: serverTimestamp()
            }, { merge: true });
        } catch (e) {
            console.error("Global Sync Error:", e);
        }
    }
    // ==========================================
// 🎨 GRADIENT INITIALIZATION (MISSING FIX)
// ==========================================
function initGradients() {
    if (!ctx) return;

    // Визначаємо пари кольорів для кожної теми, як у draw()
    const styles = [
        { name: 'steel', c1: PALETTES.STEEL.light, c2: PALETTES.STEEL.main },
        { name: 'electric', c1: PALETTES.ELECTRIC.tap1, c2: PALETTES.ELECTRIC.tap2 },
        { name: 'gold', c1: PALETTES.GOLD.black, c2: PALETTES.GOLD.choco },
        { name: 'cosmic', c1: '#000000', c2: PALETTES.COSMIC.core },
        { name: 'legendary', c1: PALETTES.LEGENDARY.tap1, c2: PALETTES.LEGENDARY.tap2 }
    ];

    styles.forEach(style => {
        // Створюємо градієнт для ноти (висота noteHeight)
        const h = CONFIG.noteHeight;
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, style.c1);
        grad.addColorStop(1, style.c2);
        
        // Зберігаємо в кеш, щоб гра не гальмувала
        GRADIENT_CACHE.tap[style.name] = grad;
    });
}

    // ==========================================
    // 🎮 GAME LOGIC & LOOP
    // ==========================================

    function resetGameState() {
        State.currentSessionId++;
        if (State.animationFrameId) { cancelAnimationFrame(State.animationFrameId); State.animationFrameId = null; }
        if (State.sourceNode) { try { State.sourceNode.stop(); } catch (e) { } State.sourceNode = null; }
        State.isPlaying = false; State.isPaused = false;
        if (State.audioCtx && State.audioCtx.state === 'suspended') State.audioCtx.resume();

        State.score = 0; State.combo = 0; State.maxCombo = 0; State.consecutiveMisses = 0;
        State.lastComboUpdateTime = 0;
        State.activeTiles = []; State.mapTiles = [];
        
        // Reset particles (Object Pool Reuse)
        for(let i=0; i<MAX_PARTICLES; i++) particlePool[i].active = false;
        State.activeRatings = [];
        
        State.comboScale = 1.0;
        State.currentComboTier = 'none';

        State.holdingTiles = [null, null, null, null];
        State.keyState = [false, false, false, false];
        State.laneLastType = ['tap', 'tap', 'tap', 'tap'];
        State.laneBeamAlpha = [0, 0, 0, 0];
        State.ripples = [];
        State.lastRippleUpdateMs = Date.now();
        // remove DOM hold-effects clearing (we no longer use #hold-effects-container)
        // if (holdEffectsContainer) holdEffectsContainer.innerHTML = '';
        
        if (gameContainer) {
            gameContainer.className = ''; 
            gameContainer.id = 'game-container';
        }
        
        const legendaryOverlay = document.getElementById('legendary-border-overlay');
        if (legendaryOverlay) legendaryOverlay.classList.remove('active');
        
        updateScoreUI(); 
        if (progressBar) progressBar.style.width = '0%';
        document.getElementById('pause-modal')?.classList.add('hidden');
        document.getElementById('result-screen')?.classList.add('hidden');
        starsElements.forEach(s => { if (s) { s.classList.remove('active'); s.style.display = ''; } });
        laneElements.forEach(el => { if (el) el.classList.remove('active'); });
        updateGameText();
        
        if(ctx) initGradients();
    }

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
        localStorage.setItem(`neon_rhythm_${songTitle}`, JSON.stringify({ score: finalScore, stars: finalStars }));
    }

    // --- PULSE ENGINE (Chart Generation) ---
    async function analyzeAudio(url, sessionId) {
        if (!State.audioCtx) State.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (!State.masterGain) {
            State.masterGain = State.audioCtx.createGain();
            State.masterGain.gain.value = State.isMuted ? 0 : 1;
            State.masterGain.connect(State.audioCtx.destination);
        }
        if (State.audioCtx.state === 'suspended') await State.audioCtx.resume();

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error("File not found");
            const arrayBuffer = await response.arrayBuffer();
            if (sessionId !== State.currentSessionId) return null;
            
            const decodedAudio = await State.audioCtx.decodeAudioData(arrayBuffer);
            if (sessionId !== State.currentSessionId) return null;

            let isSecret = songsDB[State.currentSongIndex].isSecret;
            let startSpeedMs = isSecret ? CONFIG.speedStartSecret : CONFIG.speedStart;
            let endSpeedMs = isSecret ? CONFIG.speedEndSecret : CONFIG.speedEnd;

            const rawData = decodedAudio.getChannelData(0);
            const normalizedData = normalizeBufferAggressive(rawData);
            const sampleRate = decodedAudio.sampleRate;
            const duration = decodedAudio.duration;
            const tiles = [];

            const STEP_SIZE = Math.floor(sampleRate / 100); 
            let laneFreeTime = [0, 0, 0, 0];
            let lastGenerationTime = 0;
            let lastLane = -1;
            let maxPossibleScoreTemp = 0;

            const trackHeight = (State.gameHeight > 0) ? (State.gameHeight * CONFIG.hitPosition) : 600;
            const noteSizeFraction = CONFIG.noteHeight / trackHeight;

            for (let i = STEP_SIZE; i < normalizedData.length; i += STEP_SIZE) {
                const time = i / sampleRate;
                let energy = 0;
                for (let j = 0; j < STEP_SIZE; j += 10) {
                    const idx = i - j;
                    if (idx >= 0 && idx < normalizedData.length) energy += Math.abs(normalizedData[idx]);
                }
                energy /= (STEP_SIZE / 10);

                let localAvg = getLocalAverage(normalizedData, i, sampleRate, 2.0);
                let threshold = Math.max(0.04, localAvg * (localAvg > 0.6 ? 0.15 : (localAvg > 0.4 ? 0.25 : 0.6)));
                
                let prevEnergy = 0;
                const prevIndex = i - (STEP_SIZE * 4);
                if (prevIndex > 0) {
                     for (let j = 0; j < STEP_SIZE; j += 10) {
                        const idx = prevIndex - j;
                        if (idx >= 0) prevEnergy += Math.abs(normalizedData[idx]);
                     }
                     prevEnergy /= (STEP_SIZE / 10);
                }
                let flux = Math.max(0, energy - prevEnergy);

                const progress = time / duration;
                const currentSpeedMs = startSpeedMs - (progress * (startSpeedMs - endSpeedMs));
                const noteBlockTime = (currentSpeedMs / 1000) * noteSizeFraction;
                let minGap = noteBlockTime + 0.02;

                if (energy > 0.6 || localAvg > 0.5) minGap = noteBlockTime * 0.8; 
                else if (energy > 0.4) minGap = noteBlockTime + 0.05;

                const timeSinceLast = time - lastGenerationTime;
                const isHit = (flux > threshold);
                const isStream = (energy > localAvg * 0.9) && (energy > 0.35) && (timeSinceLast > minGap);

                if ((isHit && timeSinceLast > minGap) || isStream) {
                    const sustainInfo = checkSustain(normalizedData, i, sampleRate, energy, localAvg);
                    let type = (sustainInfo.isLong && sustainInfo.duration >= 0.4) ? 'long' : 'tap';
                    let dur = type === 'long' ? Math.min(sustainInfo.duration, 2.0) : 0;

                    let notesCount = 1;
                    if ((flux > 0.2 || energy > 0.8) && Math.random() > 0.6 && type !== 'long') notesCount = 2;

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
                                hit: false, holding: false, completed: false, failed: false, released: false,
                                holdTicks: 0,
                                hitAnimStart: 0, lastValidHoldTime: 0
                            });

                            let visualBuffer = type === 'long' ? noteBlockTime * 0.5 : noteBlockTime;
                            laneFreeTime[lane] = time + dur + visualBuffer + 0.05; 
                            lastLane = lane;
                        });
                        lastGenerationTime = (type === 'long') ? time + (dur * 0.5) : time;
                    }
                }
            }

            State.maxPossibleScore = maxPossibleScoreTemp;
            State.audioBuffer = decodedAudio;
            return tiles;

        } catch (error) {
            console.error("GEN ERROR:", error);
            if (sessionId === State.currentSessionId) { alert("Generation Error: " + error.message); quitGame(); }
            return null;
        }
    }

    // --- GAME LOOP ---
    function gameLoop() {
        if (!State.isPlaying || State.isPaused) return;

        const songTime = (State.audioCtx.currentTime - State.startTime) * 1000;
        const durationMs = State.audioBuffer.duration * 1000;
        const progress = Math.min(1, songTime / durationMs);

        const isSecret = songsDB[State.currentSongIndex].isSecret;
        const startSpd = isSecret ? CONFIG.speedStartSecret : CONFIG.speedStart;
        const endSpd = isSecret ? CONFIG.speedEndSecret : CONFIG.speedEnd;
        State.currentSpeed = startSpd - (progress * (startSpd - endSpd));

        updateProgressBar(songTime, durationMs);

        // Optimization: Linear interpolation for smooth scaling without heavy physics engine
        State.comboScale += (1.0 - State.comboScale) * 0.15;

        if (songTime > durationMs + 1000) {
            endGame(true);
            return;
        }

        update(songTime);
        draw(songTime);
        State.animationFrameId = requestAnimationFrame(gameLoop);
    }

function update(songTime) {
        const hitTimeWindow = State.currentSpeed;
        const hitY = State.gameHeight * CONFIG.hitPosition;
        const themeColors = (document.body.getAttribute('data-theme') === 'light') ? CONFIG.colorsLight : CONFIG.colorsDark;
        const now = Date.now();
        const dt = now - (State.lastRippleUpdateMs || now);
        State.lastRippleUpdateMs = now;
        updateRipples(dt);

        // Spawn
        for(let i = 0; i < State.mapTiles.length; i++) {
            const tile = State.mapTiles[i];
            if (!tile.spawned && tile.time - hitTimeWindow <= songTime) {
                tile.fadeStartTime = 0; 
                State.activeTiles.push(tile);
                tile.spawned = true;
            }
        }

        // Update active
        for (let i = State.activeTiles.length - 1; i >= 0; i--) {
            const tile = State.activeTiles[i];

            // 🔥 ФІКС 1: Миттєве видалення завершених нот
            // Якщо нота готова (completed), їй немає чого робити в масиві.
            if (tile.completed) {
                State.activeTiles.splice(i, 1);
                continue;
            }

            // 1. ЛОГІКА ЗНИКНЕННЯ (FADE OUT) ДЛЯ ВІДПУЩЕНИХ
            if (tile.released) {
                if (tile.fadeStartTime === 0) tile.fadeStartTime = now;
                if (now - tile.fadeStartTime > 200) {
                    State.activeTiles.splice(i, 1);
                    continue; 
                }
            }

            // Auto-Catch Long Note Start
            if (!tile.hit && !tile.completed && !tile.failed && tile.type === 'long') {
                if (State.keyState[tile.lane]) {
                    const diff = tile.time - songTime;
                    if (Math.abs(diff) < 50) {
                        tile.hit = true;
                        tile.lastValidHoldTime = now;
                        State.holdingTiles[tile.lane] = tile;
                        toggleHoldEffect(tile.lane, true);
                        State.score += CONFIG.scorePerfect;
                        State.lastComboUpdateTime = now;
                        showRating(getText('perfect'), "rating-perfect");
                        spawnSparks(tile.lane, hitY, '#ff00ff', 'perfect');
                        State.lastHitTime = now;
                        updateScoreUI();
                    }
                }
            }

            // Remove hit taps
            if (tile.type === 'tap' && tile.hit) {
                if (now - tile.hitAnimStart > 100) State.activeTiles.splice(i, 1);
                continue;
            }

            // Long Note Hold Logic
            const yStart = (1 - (tile.time - songTime) / State.currentSpeed) * hitY;
            let yEnd = yStart;
            if (tile.type === 'long') yEnd = (1 - (tile.endTime - songTime) / State.currentSpeed) * hitY;

            if (tile.type === 'long' && tile.hit && !tile.completed && !tile.failed && !tile.released) {
                const isKeyPressed = State.keyState[tile.lane];
                if (isKeyPressed) tile.lastValidHoldTime = now;

                if (isKeyPressed) {
                    // ГРАВЕЦЬ ТРИМАЄ КНОПКУ
                    if (songTime < tile.endTime) {
                        tile.holdTicks++;
                        if (tile.holdTicks % 10 === 0) {
                            const mult = getComboMultiplier();
                            State.score += Math.round(CONFIG.scoreHoldTick * mult);
                            State.combo += 7;
                            State.lastComboUpdateTime = now;
                            if (State.combo > State.maxCombo) State.maxCombo = State.combo;
                            updateScoreUI(true); 
                            spawnSparks(tile.lane, hitY, themeColors.long[1], 'good');
                        }
                        tile.holding = true;
                        State.lastHitTime = now;
                    } else {
                        // Успішне завершення (час вийшов)
                        completeLongNote(tile);
                    }
                } else {
                    // ГРАВЕЦЬ ВІДПУСТИВ КНОПКУ
                    
                    // 🔥 ФІКС 2: "Допуск на фініші"
                    // Якщо до кінця залишилось менше 100мс, зараховуємо як перемогу
                    if (tile.endTime - songTime < 100) {
                        completeLongNote(tile);
                    } else {
                        // Інакше - це зрив (released)
                        if (songTime < tile.endTime) {
                            tile.holding = false;
                            tile.released = true;
                            if (tile.fadeStartTime === 0) tile.fadeStartTime = now;
                            
                            if (State.holdingTiles[tile.lane] === tile) {
                                State.holdingTiles[tile.lane] = null;
                                toggleHoldEffect(tile.lane, false);
                            }
                        }
                    }
                }
            }

            const limitY = State.gameHeight + 50;
            if ((tile.type === 'tap' && yStart > limitY && !tile.hit) || (tile.type === 'long' && yEnd > limitY && !tile.hit && !tile.released)) {
                if (!tile.hit && !tile.completed && !tile.failed) {
                     missNote(tile, true);
                }
                State.activeTiles.splice(i, 1);
            }
        }
    }

    // Допоміжна функція для завершення довгої ноти (щоб не дублювати код)
    function completeLongNote(tile) {
        tile.completed = true;
        tile.holding = false;
        
        // Очищаємо глобальний стан
        if (State.holdingTiles[tile.lane] === tile) {
            State.holdingTiles[tile.lane] = null;
            toggleHoldEffect(tile.lane, false);
        }

        const mult = getComboMultiplier();
        State.score += Math.round((CONFIG.scoreHoldTick * 5) * mult);
        State.combo++; 
        State.lastComboUpdateTime = Date.now();
        if (State.combo > State.maxCombo) State.maxCombo = State.combo;
        updateScoreUI(true);
    }

    // --- DRAW LOOP (OPTIMIZED) ---
    function draw(songTime) {
        if (!ctx) return;
        const isLight = document.body.getAttribute('data-theme') === 'light';
        const colors = isLight ? CONFIG.colorsLight : CONFIG.colorsDark;

        // Optimization: Pre-determine style props to avoid lookups in loops
        let p = { tapColor: [], longColor: [], glow: '', border: '', name: 'steel' };
        if (State.combo < 100) {
            p.tapColor = [PALETTES.STEEL.light, PALETTES.STEEL.main];
            p.longColor = [PALETTES.STEEL.main, PALETTES.STEEL.dark];
            p.glow = PALETTES.STEEL.main; p.border = PALETTES.STEEL.border; p.name = 'steel';
        } else if (State.combo < 200) {
            p.tapColor = [PALETTES.ELECTRIC.tap1, PALETTES.ELECTRIC.tap2];
            p.longColor = [PALETTES.ELECTRIC.long1, PALETTES.ELECTRIC.long2];
            p.glow = PALETTES.ELECTRIC.glow; p.border = PALETTES.ELECTRIC.border; p.name = 'electric';
        } else if (State.combo < 400) {
            p.tapColor = [PALETTES.GOLD.black, PALETTES.GOLD.choco];
            p.longColor = [PALETTES.GOLD.amber, PALETTES.GOLD.light];
            p.glow = PALETTES.GOLD.glow; p.border = PALETTES.GOLD.border; p.name = 'gold';
        } else if (State.combo < 800) {
            p.tapColor = ['#000000', PALETTES.COSMIC.core];
            p.longColor = [PALETTES.COSMIC.accent, PALETTES.COSMIC.glitch];
            p.glow = PALETTES.COSMIC.glow; p.border = PALETTES.COSMIC.border; p.name = 'cosmic';
        } else {
            p.tapColor = [PALETTES.LEGENDARY.tap1, PALETTES.LEGENDARY.tap2];
            p.longColor = [PALETTES.LEGENDARY.long1, PALETTES.LEGENDARY.long2];
            p.glow = PALETTES.LEGENDARY.glow; p.border = PALETTES.LEGENDARY.accent; p.name = 'legendary';
        }

        // 1. Clear Canvas
        ctx.clearRect(0, 0, State.gameWidth, State.gameHeight);
        if (isLight) { ctx.fillStyle = "rgba(255,255,255,0.95)"; ctx.fillRect(0, 0, State.gameWidth, State.gameHeight); }

        const laneW = State.gameWidth / 4;
        const hitY = State.gameHeight * CONFIG.hitPosition;
        const padding = 6;
        const noteRadius = 10;
        
        const enableHeavyEffects = !State.isMobile && State.activeTiles.length < 50;

// ==========================================
        // 2. Lanes & Beams (FIXED LONG NOTE VISUALS)
        // ==========================================
        ctx.lineWidth = 2;
        const now = Date.now();
        let comboPower = Math.min(1, State.combo / 800);

        ctx.save();
        ctx.globalCompositeOperation = 'screen';

        for (let i = 0; i < 4; i++) {
            // Оновлюємо прозорість
            if (State.holdingTiles[i]) {
                State.laneBeamAlpha[i] = 1.0; 
            } else {
                State.laneBeamAlpha[i] = Math.max(0, State.laneBeamAlpha[i] - 0.05); 
            }

            if (State.laneBeamAlpha[i] < 0.05) continue;

            let shakeX = State.holdingTiles[i] ? getDeterministicShake(i * 10, 4) : 0;
            const beamX = (i * laneW) + shakeX;
            const laneAlpha = State.laneBeamAlpha[i];

            // 🔥 ФІКС: Перевіряємо ТИП останньої ноти, а не те, чи тримаємо ми її зараз
            // Якщо це була довга нота (навіть якщо ми її вже відпустили і вона згасає) -> малюємо СТОВП.
            if (State.laneLastType[i] === 'long') {
                
                // === A. HOLD STYLE (СТОВП) ===
                const beamGrad = ctx.createLinearGradient(0, 0, 0, hitY);
                beamGrad.addColorStop(0, "rgba(0,0,0,0)");
                beamGrad.addColorStop(0.4, p.glow);
                beamGrad.addColorStop(1, comboPower > 0.5 ? "#c7c7c7ff" : p.glow);

                // Якщо ми тримаємо - прозорість 100%, якщо відпустили - беремо згасаючу laneAlpha
                let currentAlpha = State.holdingTiles[i] ? (0.4 + (comboPower * 0.1)) : laneAlpha;
                
                ctx.globalAlpha = currentAlpha;
                ctx.fillStyle = beamGrad;
                ctx.fillRect(beamX, 0, laneW, hitY);

            } else {
                
                // === B. TAP STYLE (ПОСТРІЛ) ===
                const timeSinceHit = now - State.laneLastInputTime[i];
                const speed = 1.8 + (comboPower * 1.5);
                const beamLength = 350 + (comboPower * 400);

                const headPos = hitY - (timeSinceHit * speed);
                const tailPos = headPos + beamLength;

                if (tailPos > -100) {
                    const visibleTail = Math.min(tailPos, hitY);
                    const visibleHead = headPos;
                    const h = visibleTail - visibleHead;

                    if (h > 0) {
                        const beamGrad = ctx.createLinearGradient(0, visibleHead, 0, visibleTail);
                        let coreColor = comboPower > 0.3 ? "#ffffff" : p.glow;
                        if (State.combo >= 800) coreColor = "#26c691"; 

                        beamGrad.addColorStop(0, "rgba(0,0,0,0)"); 
                        beamGrad.addColorStop(0.2, coreColor);
                        beamGrad.addColorStop(0.5, p.glow);        
                        beamGrad.addColorStop(1, "rgba(0,0,0,0)"); 

                        let dynamicAlpha = 0.7 + (comboPower * 0.3);
                        ctx.globalAlpha = Math.min(1, laneAlpha * dynamicAlpha);

                        ctx.fillStyle = beamGrad;
                        ctx.fillRect(beamX, visibleHead, laneW, h);
                    }
                }
            }
        }
        ctx.restore();

// ==========================================
        // 2.1. VERTICAL EQUALIZER + STATIC GRID LINES
        // ==========================================
        if (State.analyser) {
            State.analyser.getByteFrequencyData(State.dataArray);
        }

        const eqWidth = 5; 
        const laneLineWidth = 3; // Товщина статичних ліній (як ти просив)
        
        // Кольори (Знизу -> Вгору)
        const cBase   = PALETTES.STEEL.main;   // Низ
        const cMid1   = PALETTES.GOLD.glow;    // Середина
        const cMid2   = '#d500f9';             // Вище (Пурпуровий)
        const cTop    = PALETTES.COSMIC.glitch;// Пік (Неон)

        // --- КРОК 1: МАЛЮЄМО ЕКВАЛАЙЗЕР (НА ФОНІ) ---
        // Цикл від 0 до 4 (включає рамки)
        for (let i = 0; i <= 4; i++) {
            let x = i * laneW;
            if (i === 0) x += eqWidth / 2;
            if (i === 4) x -= eqWidth / 2;
            
            // Налаштування чутливості (твої правки)
            let sensitivity = 1.0;
            let freqIndex = 0;

            if (i === 2) {
                // ЦЕНТР: +20% чутливості (Бас)
                sensitivity = 1.2; 
                freqIndex = 4; // Ти хотів поміняти індекс, я залишив твій варіант
            } else if (i === 1 || i === 3) {
                // ВНУТРІШНІ: -20% (Спокійніші)
                sensitivity = 0.8;
                freqIndex = 0; 
            } else {
                // РАМКИ: +50% (Високі частоти)
                sensitivity = 1.5; 
                freqIndex = 12; 
            }

            const rawValue = State.dataArray ? State.dataArray[freqIndex] : 0;
            let val = rawValue / 255.0; 
            
            // Степінь 3 для різкості
            let percent = Math.pow(val, 3) * sensitivity;
            if (percent > 1.0) percent = 1.0; 

            // Висота еквалайзера
            const h = State.gameHeight * (0.15 + (percent * 0.85)); 
            const yBottom = State.gameHeight;
            const yTop = yBottom - h;

            // Градієнт
            const grad = ctx.createLinearGradient(0, yBottom, 0, 0);
            grad.addColorStop(0.1, cBase);   
            grad.addColorStop(0.4, cMid1);   
            grad.addColorStop(0.7, cMid2);   
            grad.addColorStop(1.0, cTop);    

            ctx.lineWidth = eqWidth;
            ctx.lineCap = "round";

            ctx.beginPath();
            ctx.strokeStyle = grad;
            
            // Світіння
            if (percent > 0.5) {
                ctx.shadowBlur = percent * 20;
                ctx.shadowColor = (percent > 0.8) ? cTop : cMid2;
            } else {
                ctx.shadowBlur = 0;
            }

            ctx.moveTo(x, yBottom);
            ctx.lineTo(x, yTop);
            ctx.stroke();
            ctx.shadowBlur = 0; // Скидаємо блюр
        }

        // --- КРОК 2: МАЛЮЄМО СТАТИЧНІ ЛІНІЇ (ПОВЕРХ ЕКВАЛАЙЗЕРА) ---
        // Це ті самі лінії, що були раніше, щоб гравець бачив межі
        ctx.lineWidth = laneLineWidth; // Товщина 3px
        
        // Колір ліній (залежить від комбо або теми)
        ctx.strokeStyle = (State.combo >= 200) ? 'rgba(255,255,255,0.15)' : colors.laneLine;
        
        ctx.beginPath();
        for (let i = 1; i < 4; i++) {
            // Тільки внутрішні лінії (1, 2, 3), рамки малювати не треба, бо там бордер контейнера
            let shakeX = State.holdingTiles[i] ? getDeterministicShake(i * 10, 4) : 0;
            const lineX = i * laneW + shakeX;
            
            ctx.moveTo(lineX, 0);
            ctx.lineTo(lineX, State.gameHeight);
        }
        ctx.stroke();

// ==========================================
        // 3. Hit Line (RIPPLE EFFECT - ХВИЛІ)
        // ==========================================
        ctx.strokeStyle = (State.combo >= 200) ? p.border : p.glow;
        ctx.lineWidth = (State.combo >= 200) ? 3 : 2;
        ctx.lineJoin = "round";

        ctx.beginPath();
        const step = 6; // Оптимізація: малюємо кожні 6 пікселів
        
        for (let x = 0; x <= State.gameWidth; x += step) {
            let yOffset = 0;
            
            // Оптимізація: перевіряємо тільки 10 останніх хвиль, щоб не вантажити CPU
            const startRipple = Math.max(0, State.ripples.length - 10);
            
            for (let i = startRipple; i < State.ripples.length; i++) {
                const r = State.ripples[i];
                const dist = Math.abs(x - r.x);
                
                // Рахуємо вплив хвилі тільки якщо вона поруч (радіус + затухання)
                if (dist < r.radius + 100) { 
                    const wave = Math.sin(dist * 0.03 - r.age * 0.02);
                    const damping = 1 / (1 + dist * 0.01); 
                    yOffset += wave * r.power * damping;
                }
            }

            if (x === 0) ctx.moveTo(x, hitY + yOffset);
            else ctx.lineTo(x, hitY + yOffset);
        }
        ctx.stroke();
        // 4. Notes
        const tapGradient = GRADIENT_CACHE.tap[p.name];

        for (let i = 0; i < State.activeTiles.length; i++) {
            const tile = State.activeTiles[i];
            if (tile.type === 'long' && tile.completed) continue;

            let tileShake = (tile.type === 'long' && tile.holding) ? getDeterministicShake(i * 50, 3) : 0;
            const x = tile.lane * laneW + padding + tileShake;
            const w = laneW - (padding * 2);
            const progressStart = 1 - (tile.time - songTime) / State.currentSpeed;
            const visualY = tile.hit ? hitY : progressStart * hitY;
            let yTop = visualY - CONFIG.noteHeight;

            if (tile.type === 'tap') {
                let scale = tile.hit ? CONFIG.hitScale : 1;
                
                ctx.save();
                // Translate context to use cached gradient at 0,0
                const cx = x + w / 2; const cy = yTop + CONFIG.noteHeight / 2;
                ctx.translate(cx, cy); 
                ctx.scale(scale, scale); 
                ctx.translate(-w/2, -CONFIG.noteHeight/2); 

                if (enableHeavyEffects && State.glowSprite) {
                    // draw glow centered behind the note
                    const glowSize = w * 2.5;
                    ctx.globalCompositeOperation = 'screen';
                    ctx.globalAlpha = tile.hit ? 1 : 0.6;
                    // drawImage uses current transformed coordinate space
                    ctx.drawImage(State.glowSprite, -glowSize/2 + w/2, -glowSize/2 + CONFIG.noteHeight/2, glowSize, glowSize);
                    // restore composite and alpha before actual fill
                    ctx.globalAlpha = 1.0;
                    ctx.globalCompositeOperation = 'source-over';
                }

                ctx.fillStyle = tapGradient || p.tapColor[0];
                
                ctx.beginPath();
                if (ctx.roundRect) ctx.roundRect(0, 0, w, CONFIG.noteHeight, noteRadius);
                else ctx.fillRect(0, 0, w, CONFIG.noteHeight);
                ctx.fill();

                ctx.strokeStyle = p.border; ctx.lineWidth = (State.combo >= 200) ? 3 : 2; ctx.stroke();
                
                ctx.shadowBlur = 0; ctx.fillStyle = "rgba(255,255,255,0.2)";
                ctx.beginPath(); 
                ctx.ellipse(w/2, 10, w / 2 - 5, 4, 0, 0, Math.PI * 2); 
                ctx.fill();
                ctx.restore();

            } else if (tile.type === 'long') {
                const progressEnd = 1 - (tile.endTime - songTime) / State.currentSpeed;
                let yTail = Math.min(progressEnd * hitY, hitY);
                let yHead = (tile.hit && tile.holding) ? hitY : visualY;
                if (yTail > yHead) yTail = yHead;

                const headH = CONFIG.noteHeight;
                const actualYHeadTop = yHead - headH;
                const tailH = actualYHeadTop - yTail;
                
                let colorSet = p.longColor;
                if (tile.failed) colorSet = colors.dead;
                else if (tile.released) colorSet = colors.released;

                // Tail
                if (tailH > 1) {
                    let grad = ctx.createLinearGradient(0, yTail, 0, actualYHeadTop);
                    grad.addColorStop(0, "rgba(0,0,0,0)");
                    grad.addColorStop(0.2, colorSet[1]);
                    grad.addColorStop(1, colorSet[0]);
                   
                    if (tile.released) {
                    // Плавне зникнення за 200 мс
                    const fadeProgress = (Date.now() - tile.fadeStartTime) / 200;
                    ctx.globalAlpha = Math.max(0, 1 - fadeProgress);
                }
                    
                    ctx.fillStyle = grad;
                    ctx.fillRect(x + 10, yTail, w - 20, tailH + 10);
                    
                    ctx.fillStyle = (State.combo >= 200 && !tile.failed && !tile.released) ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.3)";
                    ctx.fillRect(x + w / 2 - 1, yTail, 2, tailH);
                    
                    ctx.globalAlpha = 1.0;
                }

                // Head
                let headColors = (State.combo >= 200 && !tile.failed && !tile.released) ? p.tapColor : colorSet;
                let hGrad = ctx.createLinearGradient(0, actualYHeadTop, 0, yHead);
                hGrad.addColorStop(0, headColors[0]); hGrad.addColorStop(1, headColors[1]);
                ctx.fillStyle = hGrad;
                
                if (enableHeavyEffects && !tile.released && State.glowSprite) {
                    const headCenterX = x + w/2;
                    const headCenterY = actualYHeadTop + headH/2;
                    const glowW = w * 2.2;
                    const glowH = headH * 2.2;
                    ctx.save();
                    ctx.globalCompositeOperation = 'screen';
                    ctx.globalAlpha = (tile.hit && tile.holding) ? 0.95 : 0.5;
                    ctx.drawImage(State.glowSprite, headCenterX - glowW/2, headCenterY - glowH/2, glowW, glowH);
                    ctx.restore();
                }
                
                if (tile.released) ctx.globalAlpha = 0.7;

                ctx.beginPath();
                if (ctx.roundRect) ctx.roundRect(x, actualYHeadTop, w, headH, noteRadius);
                else ctx.fillRect(x, actualYHeadTop, w, headH);
                ctx.fill();

                ctx.strokeStyle = tile.failed ? colors.dead[0] : (tile.released ? colors.released[0] : p.border); 
                ctx.lineWidth = 3; ctx.stroke();
                
                ctx.globalAlpha = 1.0;
            }
        }

        // 5. Particles
        ctx.shadowBlur = 0; 
        
        for (let i = 0; i < MAX_PARTICLES; i++) {
            let pt = particlePool[i];
            if (!pt.active) continue;

            pt.x += pt.vx; pt.y += pt.vy; pt.vy += 0.5; pt.life -= 0.03;
            if (State.combo >= 400) pt.angle += pt.spin; 
            
            if (pt.life <= 0.05) { pt.active = false; continue; }

            ctx.globalAlpha = Math.max(0, pt.life);
            ctx.fillStyle = pt.color;
            ctx.beginPath();
            
            if (State.combo >= 800 || State.combo >= 400) {
                 const size = State.combo >= 800 ? 6 : 8; 
                 const thickness = 2; 
                 
                 const c = Math.cos(pt.angle);
                 const s = Math.sin(pt.angle);
                 
                 // Manual Matrix Rotation for speed
                 const drawRotatedRect = (w, h) => {
                     const hw = w/2; const hh = h/2;
                     const p1x = (-hw)*c - (-hh)*s + pt.x; const p1y = (-hw)*s + (-hh)*c + pt.y;
                     const p2x = (hw)*c - (-hh)*s + pt.x;  const p2y = (hw)*s + (-hh)*c + pt.y;
                     const p3x = (hw)*c - (hh)*s + pt.x;   const p3y = (hw)*s + (hh)*c + pt.y;
                     const p4x = (-hw)*c - (hh)*s + pt.x;  const p4y = (-hw)*s + (hh)*c + pt.y;
                     ctx.moveTo(p1x, p1y); ctx.lineTo(p2x, p2y); ctx.lineTo(p3x, p3y); ctx.lineTo(p4x, p4y); ctx.lineTo(p1x, p1y);
                 };
                 
                 drawRotatedRect(size, thickness); 
                 drawRotatedRect(thickness, size); 
                 
            } else if (State.combo >= 200) {
                ctx.moveTo(pt.x, pt.y - 4); ctx.lineTo(pt.x + 4, pt.y); ctx.lineTo(pt.x, pt.y + 4); ctx.lineTo(pt.x - 4, pt.y);
            } else {
                ctx.arc(pt.x, pt.y, (i % 3) + 1, 0, Math.PI * 2); // Deterministic size based on index
            }
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // 6. UI
        drawRatings();
        drawComboDisplay();
        drawMultiplier(p.border); 
    }

    function drawMultiplier(color) {
        const mult = getComboMultiplier();
        if (mult <= 1.0) return;

        const timeSinceUpdate = Date.now() - State.lastComboUpdateTime;
        let alpha = 1.0;
        if (timeSinceUpdate > 2000) {
             alpha = Math.max(0, 1 - (timeSinceUpdate - 2000) / 1000);
        }
        if (alpha <= 0) return;

        ctx.save();
        ctx.globalAlpha = alpha;
        
        const cx = State.gameWidth / 2;
        const cy = State.isMobile ? 145 : 160; 

        ctx.translate(cx, cy);
        ctx.scale(State.comboScale, State.comboScale);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const fontSize = State.isMobile ? 24 : 28; 
        const text = `${mult.toFixed(1)}x`;

        ctx.font = `italic 900 ${fontSize}px 'Comic Sans MS'`;
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillText(text, 2, 2);

        ctx.fillStyle = color;
        ctx.fillText(text, 0, 0);

        ctx.restore();
        ctx.globalAlpha = 1.0;
    }

    function drawComboDisplay() {
        if (State.combo < 3) return; 

        const timeSinceUpdate = Date.now() - State.lastComboUpdateTime;
        let alpha = 1.0;
        if (timeSinceUpdate > 2000) {
             alpha = Math.max(0, 1 - (timeSinceUpdate - 2000) / 1000); 
        }
        if (alpha <= 0) return;
        
        let gradColors = ['#fff', '#ccc'];
        let fontSize = 60;
        let labelColor = '#fff';

        if (State.combo >= 800) {
            gradColors = ['#43dca9ff', '#1f7da2ff']; 
            fontSize = 70; labelColor = '#e1bee7a4';
        } else if (State.combo >= 400) {
            gradColors = ['#00e5ff', '#d500f9']; 
            fontSize = 68; labelColor = '#00e5ff';
        } else if (State.combo >= 200) {
            gradColors = ['#FFD700', '#FDB931']; 
            fontSize = 66; labelColor = '#FFF8E1';
        } else if (State.combo >= 100) {
            gradColors = ['#00bcd4', '#b2ebf2']; 
            fontSize = 64; labelColor = '#00bcd4';
        }

        ctx.save();
        ctx.globalAlpha = alpha;
        const cx = State.gameWidth / 2;
        const cy = State.gameHeight * 0.3; 
        
        ctx.translate(cx, cy);
        ctx.scale(State.comboScale, State.comboScale);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.font = "italic 900 24px 'Comic Sans MS'";
        ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.fillText(getText('combo'), 2, -40 + 2);
        ctx.fillStyle = labelColor; ctx.fillText(getText('combo'), 0, -40);

        ctx.font = `italic 900 ${fontSize}px 'Comic Sans MS'`;
        
        let gradient = ctx.createLinearGradient(0, -30, 0, 30);
        gradient.addColorStop(0, gradColors[0]);
        gradient.addColorStop(1, gradColors[1]);

        ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.fillText(State.combo, 4, 14);
        ctx.fillStyle = gradient; ctx.fillText(State.combo, 0, 10);

        ctx.restore();
        ctx.globalAlpha = 1.0;
    }

    function drawRatings() {
        if (State.activeRatings.length === 0) return;
        const now = Date.now();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        for (let i = State.activeRatings.length - 1; i >= 0; i--) {
            const r = State.activeRatings[i];
            const elapsed = now - r.startTime;
            const duration = 500; 
            
            if (elapsed > duration) {
                State.activeRatings.splice(i, 1);
                continue;
            }

            let progress = elapsed / duration;
            let alpha = 1;
            let scale = 1;
            let yOffset = 0;

            if (progress < 0.5) {
                let t = progress * 2;
                scale = 0.5 + (0.7 * t);
                alpha = t;
                yOffset = -30 * t;
            } else {
                let t = (progress - 0.5) * 2;
                scale = 1.2 - (0.2 * t);
                alpha = 1 - t;
                yOffset = -30 - (20 * t);
            }

            ctx.globalAlpha = Math.max(0, alpha);
            ctx.save();
            ctx.translate(r.x, r.y + yOffset);
            ctx.scale(scale, scale);

            let fontSize = 40;
            if (r.type === 'rating-perfect') fontSize = 56;
            
            ctx.font = `900 italic ${fontSize}px "Comic Sans MS", sans-serif`;
            
            if (!State.isMobile) {
                ctx.shadowColor = r.color;
                ctx.shadowBlur = 10; 
            }
            ctx.fillStyle = r.color;
            ctx.fillText(r.text, 0, 0);

            ctx.restore();
            ctx.globalAlpha = 1;
        }
    }

    // --- INPUT HANDLING ---
    function spawnSparks(lane, y, color, type = 'good') {
        const laneW = State.gameWidth / 4;
        const x = lane * laneW + laneW / 2;
        let finalColor = '#cfd8dc';
        if (State.combo >= 800) finalColor = Math.random() > 0.4 ? '#2cf5b2ff' : '#101006ff';
        else if (State.combo >= 400) finalColor = Math.random() > 0.5 ? '#d500f9' : '#0a6974ff';
        else if (State.combo >= 200) finalColor = '#e6953f';
        else if (State.combo >= 100) finalColor = '#00bcd4';
        
        const count = type === 'perfect' ? 20 : 10;
        let spawned = 0;
        
        for (let i = 0; i < MAX_PARTICLES; i++) {
            if (spawned >= count) break;
            let idx = (particlePoolIndex + i) % MAX_PARTICLES;
            if (!particlePool[idx].active) {
                const pt = particlePool[idx];
                pt.active = true;
                pt.x = x + (Math.random() - 0.5) * 40;
                pt.y = y;
                pt.vx = (Math.random() - 0.5) * 12;
                pt.vy = (Math.random() - 1) * 12 - 4;
                pt.life = 1.0;
                pt.color = finalColor;
                // Init rotation props
                pt.angle = Math.random() * Math.PI * 2;
                pt.spin = (Math.random() - 0.5) * 0.2;
                spawned++;
            }
        }
        particlePoolIndex = (particlePoolIndex + count) % MAX_PARTICLES;
    }

function handleInputDown(lane) {
        if (!State.isPlaying || State.isPaused) return;
        const now = Date.now();
        
        // Анти-спам (залишаємо, щоб не можна було клікати 100 разів на сек)
        if (now - State.laneLastInputTime[lane] < 70) return;
        
        State.keyState[lane] = true;
        
        // Підсвітка самої кнопки знизу (UI) залишається для відгуку
        if (laneElements[lane]) laneElements[lane].classList.add('active');

        // --- ПЕРЕВІРКА 1: Чи ми перехоплюємо вже активну довгу ноту? ---
        const activeHold = State.activeTiles.find(t => t.lane === lane && t.type === 'long' && t.hit && !t.completed && !t.failed && !t.released);
        if (activeHold) {
            State.holdingTiles[lane] = activeHold;
            activeHold.lastValidHoldTime = now;
            toggleHoldEffect(lane, true);
            
            // 🔥 Вмикаємо ефект, бо ми успішно схопили ноту
            State.laneBeamAlpha[lane] = 1.0; 
            State.laneLastType[lane] = 'long'; // Оновлюємо тип
            return;
        }

        // --- ПЕРЕВІРКА 2: Шукаємо нову ціль ---
        const songTime = (State.audioCtx.currentTime - State.startTime) * 1000;
        const target = State.activeTiles.find(t => {
            if (t.hit || t.completed || t.failed || t.released) return false;
            if (t.lane !== lane) return false;
            if (t.type === 'tap' && t.hitAnimStart) return false;
            const diff = t.time - songTime;
            // Розширили вікно хіта трохи для зручності
            return diff <= 500 && diff >= -240;
        });

        if (target) {
            // === УСПІШНЕ ВЛУЧАННЯ ===
            
            // 🔥 Тільки тут запускаємо візуальні ефекти променя
            State.laneLastInputTime[lane] = now; 
            State.laneBeamAlpha[lane] = 1.0; 
            State.laneLastType[lane] = target.type; // Запам'ятовуємо тип для draw()

            const diff = Math.abs(target.time - songTime);
            target.hit = true;
            State.consecutiveMisses = 0;
            State.lastHitTime = now;
            State.lastComboUpdateTime = now;
            
            if (target.type === 'tap') target.hitAnimStart = now;
            const mult = getComboMultiplier();

            // Оцінка точності
            if (diff < 70) {
                State.score += Math.round(CONFIG.scorePerfect * mult);
                showRating(getText('perfect'), "rating-perfect");
                spawnSparks(lane, State.gameHeight * CONFIG.hitPosition, '#ff00ff', 'perfect');
            } else {
                State.score += Math.round(CONFIG.scoreGood * mult);
                showRating(getText('good'), "rating-good");
                spawnSparks(lane, State.gameHeight * CONFIG.hitPosition, '#00ffff', 'good');
            }

            if (target.type === 'long') {
                State.holdingTiles[lane] = target;
                target.lastValidHoldTime = now;
                toggleHoldEffect(lane, true);
                State.score += Math.round(CONFIG.scorePerfect * mult);
                showRating(getText('perfect'), "rating-perfect");
            } else {
                State.combo++;
                if(State.combo > State.maxCombo) State.maxCombo = State.combo;
            }

            // Хвиля тільки при влучанні
            try { spawnRipple(lane); } catch(e) { }
            updateScoreUI(true);

        } else {
            // === ПРОМАХ (КЛІК У ПУСТОТУ) ===
            // Тут ми НЕ вмикаємо laneBeamAlpha, тому променя не буде
            missNote({ lane: lane }, false);
        }
    }

    function handleInputUp(lane) {
        State.keyState[lane] = false;
        if (laneElements[lane]) laneElements[lane].classList.remove('active');
        toggleHoldEffect(lane, false);
        if (State.holdingTiles[lane]) State.holdingTiles[lane] = null;
    }

    function missNote(tile, isSpawnedMiss) {
        State.consecutiveMisses++;
        State.combo = 0;
        State.lastComboUpdateTime = 0; 
        updateScoreUI(); 
        showRating(getText('miss'), "rating-miss");
        if (gameContainer) {
            gameContainer.classList.add('shake-screen');
            setTimeout(() => gameContainer.classList.remove('shake-screen'), 300);
        }
        if (State.consecutiveMisses >= CONFIG.missLimit) endGame(false);
    }

    // --- UI UPDATES ---
    function getComboMultiplier() {
        if (State.combo >= 800) return 10.0;
        if (State.combo >= 400) return 5.0;
        if (State.combo >= 200) return 3.0;
        if (State.combo >=  100) return 2.0;
        if (State.combo >= 50) return 1.5;
        return 1.0;
    }

    // OPTIMIZED: Throttle score and DOM updates
    let lastRenderedScore = -1;
    function updateScoreUI(isHit = false) {
        if (scoreEl && State.score !== lastRenderedScore) {
            scoreEl.innerText = State.score;
            lastRenderedScore = State.score;
        }

        if (isHit && State.combo > 0) {
            State.comboScale = 1.3; 
        }

        updateContainerEffects();
    }

    function updateContainerEffects() {
        // Ми просто фіксуємо тір як 'none', щоб логіка гри працювала,
        // але візуальні ефекти рамки більше ніколи не застосовувалися.
        State.currentComboTier = 'none';

        // Якщо раптом якісь класи залишилися з минулого — прибираємо їх для гарантії
        if (gameContainer) {
            gameContainer.classList.remove('container-ripple-gold', 'container-ripple-cosmic', 'container-legendary');
        }

        // Прибираємо оверлей для легендарного режиму
        const legendaryOverlay = document.getElementById('legendary-border-overlay');
        if (legendaryOverlay) {
            legendaryOverlay.classList.remove('active');
        }
    }

    function showRating(text, cssClass) {
        let color = '#fff';
        if (cssClass === 'rating-perfect') color = '#ff00ff';
        else if (cssClass === 'rating-good') color = '#66FCF1';
        else if (cssClass === 'rating-miss') color = '#ff3333';

        State.activeRatings.push({
            text: text,
            type: cssClass,
            color: color,
            startTime: Date.now(),
            x: State.gameWidth / 2,
            y: State.gameHeight * 0.4
        });
    }

    // Simplified toggleHoldEffect: no color caching, draw() uses p.glow automatically
    function toggleHoldEffect(lane, active) {
        if (lane < 0 || lane > 3) return;
        if (active) {
            State.laneBeamAlpha[lane] = 1.0;
        } else {
            // fade handled by draw loop
        }
    }

    function updateProgressBar(current, total) {
        if (!progressBar) return;
        const ratio = Math.min(1, current / total);
        progressBar.style.width = `${ratio * 100}%`;
        
        // Simple check
        starsElements.forEach(s => s?.classList.remove('active'));
        const isSecret = songsDB[State.currentSongIndex].isSecret;
        const t = isSecret ? [0.2, 0.4, 0.6, 0.8, 0.98] : [0.33, 0.66, 0.98];
        t.forEach((limit, i) => {
             if (ratio > limit && starsElements[i]) starsElements[i].classList.add('active');
        });
    }

    // NEW: generate small radial glow sprite once (used by notes & beams)
    function createGlowSprite(size = 128) {
	if (!document) return;
	const c = document.createElement('canvas');
	c.width = size; c.height = size;
	const gctx = c.getContext('2d');
	const cx = size / 2, cy = size / 2, r = size / 2;
	const grad = gctx.createRadialGradient(cx, cy, 0, cx, cy, r);
	grad.addColorStop(0, "rgba(255,255,255,0.95)");
	grad.addColorStop(0.4, "rgba(255,255,255,0.25)");
	grad.addColorStop(1, "rgba(255,255,255,0)");
	gctx.fillStyle = grad;
	gctx.fillRect(0, 0, size, size);
	State.glowSprite = c;
}

// Ripple system: spawn and update
function spawnRipple(lane) {
    const laneW = State.gameWidth / 4;
    const x = lane * laneW + laneW / 2;
    let power = 2;
    if (State.combo >= 800) power = 5;
    else if (State.combo >= 400) power = 4;
    else if (State.combo >= 200) power = 3;
    else if (State.combo >= 100) power = 2;

    State.ripples.push({ x: x, power: power, age: 0, life: 1400, radius: 0 });
    if (State.ripples.length > 20) {
        State.ripples.shift(); // Видаляє найстарішу хвилю, якщо їх більше 30
    }
}

function updateRipples(dt) {
    if (!State.ripples || State.ripples.length === 0) return;
    const out = [];
    for (let i = 0; i < State.ripples.length; i++) {
        const r = State.ripples[i];
        r.age += dt;
        // simple damping: reduce power over time
        r.power = Math.max(0, r.power - (0.0015 * dt));
        // expand radius linearly (pixels per second scaled by power)
        r.radius += 200 * (dt / 1000) * (0.5 + r.power * 0.5);
        if (r.age < r.life && r.power > 0.03) out.push(r);
    }
    State.ripples = out;
}

    // --- GAME FLOW ---
    async function startGame(idx) {
        const song = songsDB[idx];
        // NOTE: name prompt removed here; name is asked during initPlayerIdentity()

        if (bgMusicEl) bgMusicEl.pause();
        resetGameState();

        const starContainer = document.querySelector('.stars-container');
        if (starContainer) {
            starContainer.innerHTML = '';
            const count = song.isSecret ? 5 : 3;
            starsElements = [];
            for (let i = 1; i <= count; i++) {
                const s = document.createElement('div');
                s.id = `star-${i}`;
                s.className = 'star-marker';
                s.innerHTML = '★';
                s.style.left = song.isSecret ? `${i * 19}%` : (i === 1 ? '33%' : (i === 2 ? '66%' : '95%'));
                starContainer.appendChild(s);
                starsElements.push(s);
            }
        }

        const mySession = State.currentSessionId;
        State.currentSongIndex = idx;
        if (menuLayer) menuLayer.classList.add('hidden');
        if (gameContainer) gameContainer.classList.remove('hidden');
        if (loader) loader.classList.remove('hidden');
        resizeCanvas();
        updateGameText();

        analyzeAudio(`audio/tracks/${song.file}`, mySession).then(generatedTiles => {
            if (mySession !== State.currentSessionId) return;
            if (generatedTiles) { State.mapTiles = generatedTiles; if (loader) loader.classList.add('hidden'); playMusic(); }
        });
    }

function playMusic() {
        if (State.sourceNode) State.sourceNode.stop();
        State.sourceNode = State.audioCtx.createBufferSource();
        State.sourceNode.buffer = State.audioBuffer;

        // Создаем анализатор для эквалайзера
        if (!State.analyser) {
            State.analyser = State.audioCtx.createAnalyser();
            State.analyser.fftSize = 64; // Маленький размер для скорости (нам нужно всего 3 полоски)
            State.dataArray = new Uint8Array(State.analyser.frequencyBinCount);
        }

        // Подключаем: Source -> Analyser -> Gain -> Destination
        State.sourceNode.connect(State.analyser);
        State.analyser.connect(State.masterGain);

        const startDelay = 2;
        State.startTime = State.audioCtx.currentTime + startDelay;
        State.sourceNode.start(State.startTime);
        State.isPlaying = true; State.isPaused = false;
        State.animationFrameId = requestAnimationFrame(gameLoop);
    }

    async function endGame(victory) {
        State.isPlaying = false;
        if (State.sourceNode) State.sourceNode.stop();
        if (State.animationFrameId) cancelAnimationFrame(State.animationFrameId);
        if (bgMusicEl && !State.isMuted) bgMusicEl.play().catch(() => {});

        const title = document.getElementById('end-title');
        if (title) {
            title.innerText = victory ? getText('complete') : getText('failed');
            title.style.color = victory ? "#66FCF1" : "#FF0055";
        }
        document.getElementById('final-score').innerText = State.score;

        let starsCount = 0;
        const isSecret = songsDB[State.currentSongIndex].isSecret;
        if (victory) {
            starsCount = isSecret ? 5 : 3;
        } else {
            const currentTime = State.audioCtx ? (State.audioCtx.currentTime - State.startTime) : 0;
            const progress = currentTime / (State.audioBuffer ? State.audioBuffer.duration : 1);
            if (isSecret) starsCount = progress > 0.8 ? 4 : (progress > 0.6 ? 3 : (progress > 0.4 ? 2 : (progress > 0.2 ? 1 : 0)));
            else starsCount = progress > 0.66 ? 2 : (progress > 0.33 ? 1 : 0);
        }

        if (isSecret && starsCount >= 1) {
            const userId = localStorage.getItem('playerId');
            const playerName = localStorage.getItem('playerName'); 
            if (userId && playerName) {
                try {
                    const dbRef = collection(db, "secret_leaderboard");
                    const q = query(dbRef, where("userId", "==", userId));
                    const querySnapshot = await getDocs(q);
                    if (!querySnapshot.empty) {
                        const userDoc = querySnapshot.docs[0];
                        if (State.score > userDoc.data().score) {
                            await updateDoc(doc(db, "secret_leaderboard", userDoc.id), { score: State.score, date: new Date(), name: playerName });
                        }
                    } else {
                        await addDoc(dbRef, { userId: userId, name: playerName, score: State.score, date: new Date() });
                    }
                } catch (e) { console.error(e); }
            }
        }

        if (State.score > 0) saveGameData(songsDB[State.currentSongIndex].title, State.score, starsCount);
        // Update global leaderboard for non-secret songs
        if (!songsDB[State.currentSongIndex].isSecret) {
            try { await syncGlobalProgress(); } catch (e) { console.error(e); }
        }

        let starsStr = "";
        const total = isSecret ? 5 : 3;
        for (let i = 0; i < total; i++) starsStr += i < starsCount ? "★" : "☆";
        document.getElementById('final-stars').innerText = starsStr;

        document.getElementById('result-screen').classList.remove('hidden');
        updateGameText();
    }

    function quitGame() {
        if (bgMusicEl && !State.isMuted) bgMusicEl.play().catch(() => {});
        resetGameState();
        if (gameContainer) gameContainer.classList.add('hidden');
        if (menuLayer) menuLayer.classList.remove('hidden');
        renderMenu();
        const searchInput = document.getElementById('song-search-input');
        if (searchInput) { searchInput.value = ''; document.getElementById('no-songs-msg')?.classList.add('hidden'); }
    }

    // ==========================================
    // 🔒 MODAL: SECRET LOCK MESSAGE
    // ==========================================
    function showSecretLockModal() {
        // Удаляем старое окно, если есть
        const existing = document.getElementById('lock-modal');
        if (existing) existing.remove();

        // Создаем контейнер оверлея
        const modal = document.createElement('div');
        modal.id = 'lock-modal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.6); z-index: 2000;
            display: flex; align-items: center; justify-content: center;
            backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px);
            opacity: 0; transition: opacity 0.3s ease;
        `;

        // Создаем контент (карточку)
        const content = document.createElement('div');
        content.style.cssText = `
            background: var(--glass-bg);
            border: 1px solid var(--highlight);
            box-shadow: 0 0 30px var(--accent-glow);
            padding: 30px; border-radius: 20px;
            text-align: center; max-width: 320px; width: 90%;
            color: var(--text-color);
            transform: scale(0.8); transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        `;

        // Наполняем текстом
        content.innerHTML = `
            <div style="font-size: 3.5rem; margin-bottom: 15px; text-shadow: 0 0 15px var(--accent-glow);">🔒</div>
            <h3 style="margin: 0 0 10px 0; color: var(--highlight); text-transform: uppercase;">Oops!</h3>
            <p style="font-size: 1rem; margin-bottom: 25px; line-height: 1.4; opacity: 0.9;">
                ${getText('secretLockMsg')}
            </p>
            <button id="lock-close-btn" style="
                background: var(--highlight); color: #000; border: none;
                padding: 12px 30px; border-radius: 50px; font-weight: bold; font-size: 1rem;
                cursor: pointer; font-family: inherit; box-shadow: 0 0 15px var(--accent-glow);
                transition: transform 0.2s;
            ">${getText('close')}</button>
        `;

        modal.appendChild(content);
        document.body.appendChild(modal);

        // Анимация появления
        requestAnimationFrame(() => {
            modal.style.opacity = '1';
            content.style.transform = 'scale(1)';
        });

        // Логика закрытия
        const close = () => {
            modal.style.opacity = '0';
            content.style.transform = 'scale(0.8)';
            setTimeout(() => modal.remove(), 300);
        };

        const btn = content.querySelector('#lock-close-btn');
        btn.onclick = (e) => {
            playClick(); // Используем ваш звук клика
            e.stopPropagation();
            close();
        };
        
        // Закрытие по клику вне окна
        modal.onclick = (e) => {
            if (e.target === modal) close();
        };
    }

    // --- MENUS ---
    function renderMenu() {
        const list = document.getElementById('song-list');
        if (!list) return;
        list.innerHTML = '';

        let total3StarSongs = 0;
        songsDB.forEach(s => { if (!s.isSecret && getSavedData(s.title).stars >= 3) total3StarSongs++; });
        const isSecretUnlocked = total3StarSongs >= 5;

        if (localStorage.getItem('playerName')) {
            const nameBtn = document.createElement('button');
            nameBtn.className = 'btn-change-name'; 
            nameBtn.innerHTML = `✏️ ${localStorage.getItem('playerName')}`;
            nameBtn.onclick = changePlayerName;
            list.appendChild(nameBtn);
        }

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

            const el = document.createElement('div');
            el.className = 'song-card';
            if (s.isSecret) {
                if (!isSecretUnlocked) el.classList.add('song-locked');
                else el.classList.add('secret-song-card');
            } else if (s.tag) el.classList.add(`song-${s.tag}`);

            el.onclick = () => {
                playClick();
                if (s.isSecret && !isSecretUnlocked) { showSecretLockModal(); return; }
                startGame(i);
            };
            el.onmouseenter = playHover;

            el.innerHTML = `
                <div class="song-info">
                    <h3>${s.title} <span class="song-duration">${s.duration}</span></h3>
                    <div class="song-meta-row">
                        <span class="artist-name">${s.artist}</span>
                        ${saved.score > 0 ? `<div class="score-badge"><span>🏆 ${saved.score}</span><span class="stars-display">${starsStr}</span></div>` : ''}
                    </div>
                </div>
                <div style="font-size:1.5rem; margin-left: 10px;">▶</div>
            `;
            list.appendChild(el);
        });
        updateGameText();
    }

    async function changePlayerName() {
        const userId = localStorage.getItem('playerId');
        if (!userId) return;
        const newName = await getNameFromUser(true);
        if (!newName) return;

        try {
            const dbRef = collection(db, "secret_leaderboard");
            const q = query(dbRef, where("userId", "==", userId));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                await updateDoc(doc(db, "secret_leaderboard", querySnapshot.docs[0].id), { name: newName });
            }
            localStorage.setItem('playerName', newName);
            showNotification(getText('nameUpdated'));
            renderMenu();
        } catch (e) { console.error(e); alert("Error updating database."); }
    }

    function getNameFromUser(isChangeMode = false) {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'name-input-modal';
            modal.innerHTML = `
                <div class="name-input-content">
                    <h2 style="margin-bottom: 10px;">${isChangeMode ? getText('enterNewName') : getText('enterName')}</h2>
                    <input type="text" id="player-name-input" class="name-input-field" placeholder="${getText('namePls')}" maxlength="15" autocomplete="off">
                    <div style="display: flex; gap: 10px; justify-content: center; margin-top: 15px;">
                        <button id="save-name-btn" class="name-submit-btn">${getText('btnOk')}</button>
                        ${isChangeMode ? `<button id="cancel-name-btn" class="name-submit-btn cancel-btn">${getText('btnCancel')}</button>` : ''}
                    </div>
                    <div id="name-error" class="input-error-msg"></div>
                </div>`;
            document.body.appendChild(modal);

            const input = modal.querySelector('#player-name-input');
            const btn = modal.querySelector('#save-name-btn');
            const errorMsg = modal.querySelector('#name-error');

            modal.querySelector('#cancel-name-btn')?.addEventListener('click', () => { modal.remove(); resolve(null); });

            async function submit() {
                const name = input.value.trim();
                if (!name) return;
                if (isChangeMode && name === localStorage.getItem('playerName')) { modal.remove(); resolve(null); return; }

                btn.innerText = getText('checking');
                btn.disabled = true;
                errorMsg.style.display = 'none';

                try {
                    const q = query(collection(db, "secret_leaderboard"), where("name", "==", name));
                    const querySnapshot = await getDocs(q);
                    if (!querySnapshot.empty) {
                        errorMsg.innerText = getText('nameTaken');
                        errorMsg.style.display = 'block';
                        btn.innerText = "OK";
                        btn.disabled = false;
                    } else {
                        if (!isChangeMode) localStorage.setItem('playerName', name);
                        modal.style.opacity = '0';
                        setTimeout(() => { modal.remove(); resolve(name); }, 300);
                    }
                } catch (e) {
                    errorMsg.innerText = "Network Error"; errorMsg.style.display = 'block'; btn.disabled = false;
                }
            }
            btn.onclick = submit;
            input.onkeypress = (e) => { if (e.key === 'Enter') submit(); errorMsg.style.display = 'none'; };
            setTimeout(() => input.focus(), 100);
        });
    }

    // --- Leaderboard: Fixed Size & Animations ---
    let currentLbTab = 'global';

    async function showLeaderboard() {
        // Видаляємо старе вікно, якщо є
        const existing = document.getElementById('lb-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'lb-modal';
        modal.className = 'leaderboard-modal';
        
        // Генеруємо HTML з фіксованою структурою
        modal.innerHTML = `
            <div class="lb-header-row">
                <div class="lb-title">🏆 ${getText('leaderboard')}</div>
                <button class="lb-close-btn">&times;</button>
            </div>
            
            <div class="lb-tabs">
              <button class="lb-tab-btn active" data-tab="global">${getText('lbGlobal')}</button>
              <button class="lb-tab-btn" data-tab="secret">${getText('lbSecret')}</button>
            </div>
            
            <div class="lb-content-wrapper">
                <div class="lb-scroll-area" id="lb-scroll-area">
                    <table class="lb-table">
                        <thead id="lb-header"></thead>
                        <tbody id="lb-body"></tbody>
                    </table>
                </div>
            </div>`;
            
        document.body.appendChild(modal);

        // Події
        modal.querySelector('.lb-close-btn').onclick = () => {
            modal.style.opacity = '0';
            modal.style.transform = 'translate(-50%, -45%) scale(0.95)';
            setTimeout(() => modal.remove(), 300);
        };

        const scrollArea = modal.querySelector('#lb-scroll-area');
        const btns = modal.querySelectorAll('.lb-tab-btn');

        btns.forEach(btn => {
            btn.onclick = () => {
                if (btn.classList.contains('active')) return;
                
                // Перемикання кнопок
                btns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Анімація зникнення контенту
                scrollArea.classList.add('fading');
                
                // Чекаємо поки зникне (200мс), тоді вантажимо нові дані
                setTimeout(() => {
                    currentLbTab = btn.dataset.tab;
                    loadLeaderboardData(currentLbTab, modal).then(() => {
                        // Анімація появи
                        scrollArea.classList.remove('fading');
                    });
                }, 200);
            };
        });

        // Завантажуємо першу вкладку
        await syncGlobalProgress().catch(e => console.error(e));
        loadLeaderboardData('global', modal);
    }

    async function loadLeaderboardData(type, modalRef) {
        const thead = modalRef.querySelector('#lb-header');
        const tbody = modalRef.querySelector('#lb-body');
        
        // Очистка перед завантаженням (щоб не було видно старої таблиці під час фейду)
        tbody.innerHTML = ''; 

        // Заголовки (Локалізовані)
        if (type === 'global') {
            thead.innerHTML = `<tr>
                <th width="15%">#</th>
                <th width="45%">${getText('lbName')}</th>
                <th width="20%">${getText('lbLevels')}</th>
                <th width="20%">${getText('lbTotalScore')}</th>
            </tr>`;
        } else {
            thead.innerHTML = `<tr>
                <th width="15%">#</th>
                <th width="55%">${getText('lbName')}</th>
                <th width="30%">${getText('lbScore')}</th>
            </tr>`;
        }

        // Лоудер
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 40px;">${getText('lbLoading')}</td></tr>`;

        try {
            const col = type === 'global' ? "global_leaderboard" : "secret_leaderboard";
            const orderField = type === 'global' ? "totalScore" : "score";
            
            const q = query(collection(db, col), orderBy(orderField, "desc"), limit(20)); // Більше записів, бо є скрол
            const snap = await getDocs(q);
            
            tbody.innerHTML = ''; // Прибираємо лоудер

            if (snap.empty) {
                tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 40px; opacity:0.6;">${getText('lbNoRecords')}</td></tr>`;
            } else {
                let rank = 1;
                snap.forEach(docSnap => {
                    const data = docSnap.data();
                    const tr = document.createElement('tr');
                    
                    // Стилізація рангу (1, 2, 3 місця)
                    let rankClass = '';
                    let rankDisplay = `#${rank}`;
                    if (rank === 1) { rankClass = 'rank-1'; rankDisplay = '🥇 1'; }
                    else if (rank === 2) { rankClass = 'rank-2'; rankDisplay = '🥈 2'; }
                    else if (rank === 3) { rankClass = 'rank-3'; rankDisplay = '🥉 3'; }

                    if (type === 'global') {
                        tr.innerHTML = `
                            <td class="${rankClass}"><b>${rankDisplay}</b></td>
                            <td>${escapeHtml(data.name)}</td>
                            <td>${data.levelsCompleted || 0}</td>
                            <td>${data.totalScore || 0}</td>
                        `;
                    } else {
                        tr.innerHTML = `
                            <td class="${rankClass}"><b>${rankDisplay}</b></td>
                            <td>${escapeHtml(data.name)}</td>
                            <td>${data.score || 0}</td>
                        `;
                    }
                    tbody.appendChild(tr);
                    rank++;
                });
            }
        } catch (e) {
            console.error(e);
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#ff4444;">${getText('lbError')}</td></tr>`;
        }
    }

    function escapeHtml(text) {
        if (!text) return 'Unknown';
        return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }

    // --- CONTROLS ---
    function initControls() {
        const lanesContainer = document.getElementById('lanes-bg');
        if (lanesContainer) for (let i = 0; i < 4; i++) laneElements[i] = lanesContainer.children[i];

        const ignore = ['.hit-line', '.lane-hints', '#hold-effects-container', '#legendary-border-overlay'];
        ignore.forEach(sel => { const el = document.querySelector(sel); if(el) el.style.pointerEvents = 'none'; });

        const searchInput = document.getElementById('song-search-input');
        if (searchInput) {
            searchInput.onclick = (e) => e.stopPropagation();
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.trim().toLowerCase().replace(/[^a-zа-я0-9їієґ]/g, '');
                const cards = document.querySelectorAll('.song-card');
                let visibleCount = 0;

                const getTrigrams = (str) => {
                    const t = [];
                    for(let i=0; i<str.length-2; i++) t.push(str.slice(i, i+3));
                    return t;
                };

                cards.forEach(card => {
                    const text = card.innerText.toLowerCase().replace(/[^a-zа-я0-9їієґ]/g, '');
                    let match = false;
                    if (query.length === 0) match = true;
                    else if (query.length < 3) match = text.includes(query);
                    else {
                        const qTri = getTrigrams(query);
                        const tTri = getTrigrams(text);
                        let matches = 0;
                        qTri.forEach(tr => { if(tTri.includes(tr)) matches++; });
                        match = (matches / qTri.length) >= 0.5;
                    }
                    card.style.display = match ? 'flex' : 'none';
                    if (match) visibleCount++;
                });
                const msg = document.getElementById('no-songs-msg');
                if (msg) msg.classList.toggle('hidden', visibleCount > 0 || query === '');
            });
        }

        if (canvas) {
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
                    const upHandler = () => { handleInputUp(lane); window.removeEventListener('mouseup', upHandler); };
                    window.addEventListener('mouseup', upHandler);
                }
            });
        }

        window.addEventListener('keydown', e => {
            if (e.code === 'Space') {
                if (document.activeElement.id === 'song-search-input') return;
                e.preventDefault(); togglePauseGame(); return;
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

        const setupBtn = (id, fn) => {
            const btn = document.getElementById(id);
            if (btn) { btn.onclick = (e) => { e.stopPropagation(); playClick(); fn(btn); }; btn.onmouseenter = playHover; }
        };
        setupBtn('themeToggle', (btn) => {
            const next = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            document.body.setAttribute('data-theme', next);
            localStorage.setItem('siteTheme', next);
            btn.innerText = next === 'dark' ? '🌙' : '☀️';
            if(ctx) initGradients();
        });
        setupBtn('soundToggle', (btn) => {
            State.isMuted = !State.isMuted;
            localStorage.setItem('isMuted', State.isMuted);
            if (State.masterGain) State.masterGain.gain.value = State.isMuted ? 0 : 1;
            btn.innerText = State.isMuted ? '🔇' : '🔊';
            if (bgMusicEl) State.isMuted ? bgMusicEl.pause() : (!State.isPlaying && bgMusicEl.play().catch(() => {}));
        });

        const langBtn = document.getElementById('langToggle');
        const langWrapper = document.querySelector('.lang-wrapper');

        if (langBtn && langWrapper) {
            langBtn.onclick = (e) => {
                e.stopPropagation();
                playClick();
                langWrapper.classList.toggle('open');
            };
        }

        document.querySelectorAll('.lang-dropdown button').forEach(b => {
            b.onclick = () => {
                playClick();
                State.currentLang = b.dataset.lang;
                localStorage.setItem('siteLang', State.currentLang);
                updateGameText();
                if (langWrapper) langWrapper.classList.remove('open');
            };
        });

        document.addEventListener('click', (e) => {
            if (langWrapper && !langWrapper.contains(e.target)) {
                langWrapper.classList.remove('open');
            }
        });

        const setupNav = (id, fn) => { const btn = document.getElementById(id); if (btn) btn.onclick = () => { playClick(); fn(); }; };
        setupNav('global-back-btn', () => State.isPlaying ? quitGame() : window.location.href = 'index.html');
        setupNav('btn-quit', quitGame);
        setupNav('btn-menu-end', quitGame);
        setupNav('btn-pause', togglePauseGame);
        setupNav('btn-resume', togglePauseGame);
        setupNav('btn-restart', () => { document.getElementById('result-screen').classList.add('hidden'); resetGameState(); setTimeout(() => startGame(State.currentSongIndex), 50); });

        function togglePauseGame() {
            if (!State.isPlaying) return;
            State.isPaused = !State.isPaused;
            const m = document.getElementById('pause-modal');
            if (State.isPaused) { State.audioCtx.suspend(); m?.classList.remove('hidden'); }
            else { State.audioCtx.resume(); m?.classList.add('hidden'); gameLoop(); }
        }
    }

    function resizeCanvas() { 
        if (gameContainer && gameContainer.clientWidth && canvas) { 
            const dpr = Math.min(window.devicePixelRatio || 1, 1.5); 
            State.gameWidth = gameContainer.clientWidth;
            State.gameHeight = gameContainer.clientHeight;
            
            canvas.width = State.gameWidth * dpr;
            canvas.height = State.gameHeight * dpr;
            
            ctx.setTransform(1, 0, 0, 1, 0, 0); 
            ctx.scale(dpr, dpr); 
            
            initGradients();
        }
        State.isMobile = window.innerWidth < 768;
    }
    window.addEventListener('resize', resizeCanvas);

    // Initial Start
    initControls();
    renderMenu();
    setTimeout(resizeCanvas, 100);

});