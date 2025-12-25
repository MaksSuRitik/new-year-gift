/* ==========================================
   🎹 NEON PIANO: ULTIMATE EDITION + FIREBASE
   // RENDERER: Canvas 2D (DPI Optimized)
   ========================================== */

// --- FIREBASE IMPORTS (ES MODULES) ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
    getFirestore, collection, addDoc, getDocs, query, orderBy, limit, where, updateDoc, doc
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

// --- GLOBAL VARIABLES & STATE ---
let audioCtx = null;
let sourceNode = null;
let masterGain = null;
let audioBuffer = null;
let animationFrameId = null;
let currentSessionId = 0;

let isPlaying = false;
let isPaused = false;
let isMuted = localStorage.getItem('isMuted') === 'true';
let currentLang = localStorage.getItem('siteLang') || 'UA';

// OPTIMIZED: Cached environment variables
let isMobile = window.innerWidth < 768;
let gameWidth = 0;
let gameHeight = 0;

let startTime = 0;
let score = 0;
let maxPossibleScore = 0;
let combo = 0;
let maxCombo = 0;
let lastComboUpdateTime = 0;
let consecutiveMisses = 0;
let currentSongIndex = 0;
let lastHitTime = 0;
let currentSpeed = 1000;

// COMBO ANIMATION STATE
let comboScale = 1.0;
let currentComboTier = 'none';

// Game Objects
let mapTiles = [];
let activeTiles = [];

// OPTIMIZED: Object Pools & Render Arrays
const MAX_PARTICLES = 300;
let particlePool = [];
let particlePoolIndex = 0;
let activeRatings = [];

// PERFORMANCE: Gradient Cache
const GRADIENT_CACHE = {
    tap: {}, 
    longHead: {}
};

let keyState = [false, false, false, false];
let holdingTiles = [null, null, null, null];
let laneElements = [null, null, null, null];
let laneLastInputTime = [0, 0, 0, 0];
let laneBeamAlpha = [0, 0, 0, 0];
let starsElements = [];

// DOM Elements
let canvas, ctx, gameContainer, menuLayer, loader, holdEffectsContainer, progressBar, bgMusicEl;
let scoreEl; 

// Constants
const KEYS = ['KeyS', 'KeyD', 'KeyJ', 'KeyK'];
const CONFIG = {
    speedStart: 1000,
    speedEnd: 500,
    speedStartSecret: 800,
    speedEndSecret: 500,
    hitPosition: 0.85,
    noteHeight: 210,
    hitScale: 1.15,
    missLimit: 3,
    scorePerfect: 50,
    scoreGood: 20,
    scoreHoldTick: 5,
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
    GOLD: { black: '#1a1a1a', choco: '#2d1b15', amber: '#e6953f', light: '#bcaaa4', glow: '#e6953f', border: '#e6953f' },
    COSMIC: { core: '#2a003b', accent: '#d500f9', glitch: '#00e5ff', glow: '#d500f9', border: '#00e5ff' },
    LEGENDARY: { body: '#f4f4f4ff', accent: '#ffffffff', glow: '#ffffffff', aura: 'rgba(153, 147, 102, 1)', tap1: '#ffffffff', tap2: '#08191dff', long1: '#FFFFFF', long2: 'rgba(7, 80, 76, 0.99)' },
    ELECTRIC: { tap1: '#eceff1', tap2: '#607d8b', long1: '#607d8b', long2: '#37474f', glow: '#00bcd4', border: '#80deea' }
};

const TRANSLATIONS = {
    UA: {
        icon: "UA", instructions: "Гра здійснюється за допомогою клавіш S D J K", score: "Рахунок", combo: "КОМБО", paused: "ПАУЗА", resume: "Продовжити", quit: "Вийти", complete: "ПРОЙДЕНО", failed: "ПОРАЗКА", restart: "Ще раз", menu: "Меню", perfect: "ІДЕАЛЬНО", good: "ДОБРЕ", miss: "ПРОМАХ", loading: "Створення нот...", leaderboard: "Таблиця Лідерів", enterName: "Введіть ваше ім'я для рекорду:", req: "Пройдіть 5 пісень на 3 зірки!", namePls: "Введіть ім'я", lbTitle: "Лідери Секретного Рівня", lbRank: "Ранг", lbName: "Ім'я", lbScore: "Очки", lbNoRecords: "Рекордів ще немає!", lbLoading: "Завантаження...", lbError: "Помилка завантаження", nameTaken: "Це ім'я вже зайнято! Оберіть інше.", checking: "Перевірка...", secretLockMsg: "Отримайте 3 зірки у 5 рівнях для того щоб відкрити секретний рівень", close: "Закрити", changeName: "Змінити Ім'я", nameUpdated: "Ім'я оновлено!", enterNewName: "Введіть нове ім'я:", migrationSuccess: "Ваш старий рекорд знайдено і прив'язано!", btnOk: "ОК", btnCancel: "Скасувати", searchPlaceholder: "🔍 Пошук пісні або автора...", noSongsFound: "🚫 Жодних пісень не знайдено"
    },
    RU: {
        icon: "RU", instructions: "Игра осуществляется с помощью клавиш S D J K", score: "Счет", combo: "КОМБО", paused: "ПАУЗА", resume: "Продолжить", quit: "Выйти", complete: "ПРОЙДЕНО", failed: "ПОРАЖЕНИЕ", restart: "Еще раз", menu: "Меню", perfect: "ИДЕАЛЬНО", good: "ХОРОШО", miss: "МИМО", loading: "Создание нот...", leaderboard: "Таблица Лидеров", enterName: "Введите ваше имя для рекорда:", req: "Пройдите 5 песен на 3 звезды!", namePls: "Введите имя", lbTitle: "Лидеры Секретного Уровня", lbRank: "Ранг", lbName: "Имя", lbScore: "Очки", lbNoRecords: "Рекордов еще нет!", lbLoading: "Загрузка...", lbError: "Ошибка загрузки", nameTaken: "Это имя уже занято! Выберите другое.", checking: "Проверка...", secretLockMsg: "Получите 3 звезды в 5 уровнях для того чтобы открыть секретный уровень", close: "Закрыть", changeName: "Сменить Имя", nameUpdated: "Имя обновлено!", enterNewName: "Введите новое имя:", migrationSuccess: "Ваш старый рекорд найден и привязан!", btnOk: "ОК", btnCancel: "Отмена", searchPlaceholder: "🔍 Поиск песни или автора...", noSongsFound: "🚫 Песен не найдено"
    },
    MEOW: {
        icon: "🐱", instructions: "Meow meow meow S D J K meow", score: "Meow", combo: "Meow-bo", paused: "MEOW?", resume: "Meow!", quit: "Grrr", complete: "WeOWW", failed: "WeowWWWW", restart: "Meow-gain", menu: "Meow-nu", perfect: "WeowE", good: "MEOW", miss: "Weow", loading: "Meowing...", leaderboard: "Meow-Weowt", enterName: "Meow name:", req: "Meow Weow Weow Weow Weow!", namePls: "Meow?", lbTitle: "Meow Leaders", lbRank: "Meow #", lbName: "Meow Weow", lbScore: "Meows", lbNoRecords: "Weow Weow Weow!", lbLoading: "Meowing...", lbError: "Meow Weow", nameTaken: "MEOW! Meow! Meow weow!", checking: "Weow...", secretLockMsg: "Meow meow 3 meows meow 5 lmeows meow meow meow meow", close: "Meow", changeName: "Meow Name", nameUpdated: "Meow meow!", enterNewName: "Meow new meow:", migrationSuccess: "Meow weow meow!", btnOk: "Meow!", btnCancel: "Grrr...", searchPlaceholder: "🔍 Meow search...", noSongsFound: "🚫 Meow weow grrr"
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
    { file: "SaraunhLyWutiwant.mp3", title: "wutiwant", artist: "saraunh0ly", duration: "2m 10s" },
    { file: "ValentinStrikalo.mp3", title: "Кайен", artist: "Валентин Стрыкало", duration: "3m 10s" },
    { file: "Konfuz - Кайф Ты Поймала.mp3", title: "Кайф ты поймала", artist: "Konfuz", duration: "2m 50s" },
    { file: "Zhanulka Лазить По Стенам.mp3", title: "лазить по стенам", artist: "Zhanulka", duration: "2m 30s" },
    { file: "mzlff,STEDD.mp3", title: "однополярности", artist: "mzlff, STED.D", duration: "3m 05s" },
    { file: "Skriptonit_-_Tancuj_so_mnoj_v_temnote.mp3", title: "Танцуй со мной в темноте", artist: "Скриптонит", duration: "3m 55s" },
    { file: "Pyrokinesis Трупный Синод.mp3", title: "Трупный Синод", artist: "Pyrokinesis", duration: "3m 40s" }
];

/* ==========================================
   🛠 AUDIO PROCESSING HELPERS
   ========================================== */
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

// OPTIMIZED: Init Particle Pool
function initParticlePool() {
    particlePool = [];
    for (let i = 0; i < MAX_PARTICLES; i++) {
        particlePool.push({
            active: false,
            x: 0, y: 0,
            vx: 0, vy: 0,
            life: 0,
            color: '#fff',
            angle: 0, // For rotation
            spin: 0   // Spin speed
        });
    }
}

// --------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {

    // --- DOM REFERENCES ---
    canvas = document.getElementById('rhythmCanvas');
    ctx = canvas ? canvas.getContext('2d', { alpha: false, desynchronized: true }) : null;
    gameContainer = document.getElementById('game-container');
    menuLayer = document.getElementById('menu-layer');
    loader = document.getElementById('loader');
    holdEffectsContainer = document.getElementById('hold-effects-container');
    progressBar = document.getElementById('game-progress-bar');
    scoreEl = document.getElementById('score-display');
    
    // Init Stars Array
    starsElements = [
        document.getElementById('star-1'), document.getElementById('star-2'),
        document.getElementById('star-3'), document.getElementById('star-4'),
        document.getElementById('star-5')
    ].filter(el => el !== null);

    // Initialize pools
    initParticlePool();

    // --- AUDIO INIT ---
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

    // --- SYNC SETTINGS ---
    const savedTheme = localStorage.getItem('siteTheme') || 'dark';
    document.body.setAttribute('data-theme', savedTheme);
    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) themeBtn.innerText = savedTheme === 'dark' ? '🌙' : '☀️';

    document.body.setAttribute('data-lang', currentLang);
    const langBtn = document.getElementById('langToggle');
    if (langBtn) langBtn.innerText = TRANSLATIONS[currentLang].icon || currentLang;

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

    // --- PLAYER IDENTITY ---
    async function initPlayerIdentity() {
        let userId = localStorage.getItem('playerId');
        const currentName = localStorage.getItem('playerName');
        if (!userId) {
            userId = crypto.randomUUID();
            localStorage.setItem('playerId', userId);
            if (currentName) {
                try {
                    const dbRef = collection(db, "secret_leaderboard");
                    const q = query(dbRef, where("name", "==", currentName));
                    const querySnapshot = await getDocs(q);
                    if (!querySnapshot.empty) {
                        const oldDoc = querySnapshot.docs[0];
                        await updateDoc(doc(db, "secret_leaderboard", oldDoc.id), { userId: userId });
                    }
                } catch (e) { console.error("Migration failed:", e); }
            }
        }
    }
    initPlayerIdentity();

    // --- OPTIMIZED: CACHE GRADIENTS ---
    function initGradients() {
        // Clear cache
        for(let key in GRADIENT_CACHE.tap) delete GRADIENT_CACHE.tap[key];
        
        // Helper to create and cache
        const createTapGrad = (colors, key) => {
            const g = ctx.createLinearGradient(0, 0, 0, CONFIG.noteHeight);
            g.addColorStop(0, colors[0]);
            g.addColorStop(1, colors[1]);
            GRADIENT_CACHE.tap[key] = g;
        };

        const palettes = [
            {name: 'steel', cols: [PALETTES.STEEL.light, PALETTES.STEEL.main]},
            {name: 'electric', cols: [PALETTES.ELECTRIC.tap1, PALETTES.ELECTRIC.tap2]},
            {name: 'gold', cols: [PALETTES.GOLD.black, PALETTES.GOLD.choco]},
            {name: 'cosmic', cols: ['#000000', PALETTES.COSMIC.core]},
            {name: 'legendary', cols: [PALETTES.LEGENDARY.tap1, PALETTES.LEGENDARY.tap2]}
        ];

        palettes.forEach(p => createTapGrad(p.cols, p.name));
    }

    // --- GAME LOOP & LOGIC ---
    function resetGameState() {
        currentSessionId++;
        if (animationFrameId) { cancelAnimationFrame(animationFrameId); animationFrameId = null; }
        if (sourceNode) { try { sourceNode.stop(); } catch (e) { } sourceNode = null; }
        isPlaying = false; isPaused = false;
        if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();

        score = 0; combo = 0; maxCombo = 0; consecutiveMisses = 0;
        lastComboUpdateTime = 0;
        activeTiles = []; mapTiles = [];
        
        for(let i=0; i<MAX_PARTICLES; i++) particlePool[i].active = false;
        activeRatings = [];
        
        comboScale = 1.0;
        currentComboTier = 'none';

        holdingTiles = [null, null, null, null];
        keyState = [false, false, false, false];
        laneBeamAlpha = [0, 0, 0, 0];

        if (ctx && canvas) ctx.clearRect(0, 0, gameWidth, gameHeight);
        if (holdEffectsContainer) holdEffectsContainer.innerHTML = '';
        
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

    /* ----------------------------------
       PULSE ENGINE V4.2
       ---------------------------------- */
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

            let isSecret = songsDB[currentSongIndex].isSecret;
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

            const trackHeight = (gameHeight > 0) ? (gameHeight * CONFIG.hitPosition) : 600;
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

            maxPossibleScore = maxPossibleScoreTemp;
            audioBuffer = decodedAudio;
            return tiles;

        } catch (error) {
            console.error("GEN ERROR:", error);
            if (sessionId === currentSessionId) { alert("Generation Error: " + error.message); quitGame(); }
            return null;
        }
    }

    function gameLoop() {
        if (!isPlaying || isPaused) return;

        const songTime = (audioCtx.currentTime - startTime) * 1000;
        const durationMs = audioBuffer.duration * 1000;
        const progress = Math.min(1, songTime / durationMs);

        const isSecret = songsDB[currentSongIndex].isSecret;
        const startSpd = isSecret ? CONFIG.speedStartSecret : CONFIG.speedStart;
        const endSpd = isSecret ? CONFIG.speedEndSecret : CONFIG.speedEnd;
        currentSpeed = startSpd - (progress * (startSpd - endSpd));

        updateProgressBar(songTime, durationMs);

        // Update Combo Scale Animation
        comboScale += (1.0 - comboScale) * 0.15;

        if (songTime > durationMs + 1000) {
            endGame(true);
            return;
        }

        update(songTime);
        draw(songTime);
        animationFrameId = requestAnimationFrame(gameLoop);
    }

    function getCurrentBeamColor() {
        if (combo >= 800) return PALETTES.LEGENDARY.glow;
        if (combo >= 400) return PALETTES.COSMIC.glow;
        if (combo >= 200) return PALETTES.GOLD.glow;
        if (combo >= 100) return PALETTES.ELECTRIC.glow;
        const isLight = document.body.getAttribute('data-theme') === 'light';
        return isLight ? CONFIG.colorsLight.long[1] : CONFIG.colorsDark.long[1];
    }

    function update(songTime) {
        const hitTimeWindow = currentSpeed;
        const hitY = gameHeight * CONFIG.hitPosition;
        const themeColors = (document.body.getAttribute('data-theme') === 'light') ? CONFIG.colorsLight : CONFIG.colorsDark;

        // Spawn
        mapTiles.forEach(tile => {
            if (!tile.spawned && tile.time - hitTimeWindow <= songTime) {
                activeTiles.push(tile);
                tile.spawned = true;
            }
        });

        // Update active
        for (let i = activeTiles.length - 1; i >= 0; i--) {
            const tile = activeTiles[i];

            // Auto-Catch Long Note Start
            if (!tile.hit && !tile.completed && !tile.failed && tile.type === 'long') {
                if (keyState[tile.lane]) {
                    const diff = tile.time - songTime;
                    if (Math.abs(diff) < 50) {
                        tile.hit = true;
                        tile.lastValidHoldTime = Date.now();
                        holdingTiles[tile.lane] = tile;
                        toggleHoldEffect(tile.lane, true, getCurrentBeamColor());
                        score += CONFIG.scorePerfect;
                        lastComboUpdateTime = Date.now();
                        showRating(getText('perfect'), "rating-perfect");
                        spawnSparks(tile.lane, hitY, '#ff00ff', 'perfect');
                        lastHitTime = Date.now();
                        updateScoreUI();
                    }
                }
            }

            // Remove hit taps
            if (tile.type === 'tap' && tile.hit) {
                if (Date.now() - tile.hitAnimStart > 100) activeTiles.splice(i, 1);
                continue;
            }

            // Long Note Hold Logic
            const yStart = (1 - (tile.time - songTime) / currentSpeed) * hitY;
            let yEnd = yStart;
            if (tile.type === 'long') yEnd = (1 - (tile.endTime - songTime) / currentSpeed) * hitY;

            if (tile.type === 'long' && tile.hit && !tile.completed && !tile.failed && !tile.released) {
                const isKeyPressed = keyState[tile.lane];
                if (isKeyPressed) tile.lastValidHoldTime = Date.now();

                if (isKeyPressed || (Date.now() - tile.lastValidHoldTime) < 150) {
                    if (songTime < tile.endTime) {
                        tile.holdTicks++;
                        if (tile.holdTicks % 10 === 0) {
                            const mult = getComboMultiplier();
                            score += Math.round(CONFIG.scoreHoldTick * mult);
                            combo += 5;
                            lastComboUpdateTime = Date.now();
                            if (combo > maxCombo) maxCombo = combo;
                            updateScoreUI(true); 
                            spawnSparks(tile.lane, hitY, themeColors.long[1], 'good');
                        }
                        tile.holding = true;
                        lastHitTime = Date.now();
                    } else {
                        tile.completed = true;
                        tile.holding = false;
                        const mult = getComboMultiplier();
                        score += Math.round((CONFIG.scoreHoldTick * 5) * mult);
                        combo++; 
                        lastComboUpdateTime = Date.now();
                        if (combo > maxCombo) maxCombo = combo;
                        updateScoreUI(true);
                    }
                } else {
                    if (songTime < tile.endTime) {
                        tile.holding = false;
                        tile.released = true; 
                    }
                }
            }

            const limitY = gameHeight + 50;
            if ((tile.type === 'tap' && yStart > limitY && !tile.hit) || (tile.type === 'long' && yEnd > limitY)) {
                if (!tile.hit && !tile.completed && !tile.failed) {
                     missNote(tile, true);
                }
                activeTiles.splice(i, 1);
            }
        }
    }

    // OPTIMIZED: Draw Loop
    function draw(songTime) {
        if (!ctx) return;
        const isLight = document.body.getAttribute('data-theme') === 'light';
        const colors = isLight ? CONFIG.colorsLight : CONFIG.colorsDark;

        let p = { tapColor: [], longColor: [], glow: '', border: '', name: 'steel' };

        // Determine Palette based on Combo
        if (combo < 100) {
            p.tapColor = [PALETTES.STEEL.light, PALETTES.STEEL.main];
            p.longColor = [PALETTES.STEEL.main, PALETTES.STEEL.dark];
            p.glow = PALETTES.STEEL.main; p.border = PALETTES.STEEL.border; p.name = 'steel';
        } else if (combo < 200) {
            p.tapColor = [PALETTES.ELECTRIC.tap1, PALETTES.ELECTRIC.tap2];
            p.longColor = [PALETTES.ELECTRIC.long1, PALETTES.ELECTRIC.long2];
            p.glow = PALETTES.ELECTRIC.glow; p.border = PALETTES.ELECTRIC.border; p.name = 'electric';
        } else if (combo < 400) {
            p.tapColor = [PALETTES.GOLD.black, PALETTES.GOLD.choco];
            p.longColor = [PALETTES.GOLD.amber, PALETTES.GOLD.light];
            p.glow = PALETTES.GOLD.glow; p.border = PALETTES.GOLD.border; p.name = 'gold';
        } else if (combo < 800) {
            p.tapColor = ['#000000', PALETTES.COSMIC.core];
            p.longColor = [PALETTES.COSMIC.accent, PALETTES.COSMIC.glitch];
            p.glow = PALETTES.COSMIC.glow; p.border = PALETTES.COSMIC.border; p.name = 'cosmic';
        } else {
            p.tapColor = [PALETTES.LEGENDARY.tap1, PALETTES.LEGENDARY.tap2];
            p.longColor = [PALETTES.LEGENDARY.long1, PALETTES.LEGENDARY.long2];
            p.glow = PALETTES.LEGENDARY.glow; p.border = PALETTES.LEGENDARY.accent; p.name = 'legendary';
        }

        // Clear using logical coordinates
        ctx.clearRect(0, 0, gameWidth, gameHeight);
        if (isLight) { ctx.fillStyle = "rgba(255,255,255,0.95)"; ctx.fillRect(0, 0, gameWidth, gameHeight); }

        const laneW = gameWidth / 4;
        const hitY = gameHeight * CONFIG.hitPosition;
        const padding = 6;
        const noteRadius = 10;
        
        const enableHeavyEffects = !isMobile && activeTiles.length < 50;

        // --- DRAW LANES & BEAMS ---
        ctx.strokeStyle = (combo >= 200) ? '#333' : colors.laneLine;
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        for (let i = 0; i < 4; i++) {
            let shakeX = holdingTiles[i] ? (Math.random() - 0.5) * 4 : 0;
            if (laneBeamAlpha[i] > 0) {
                const beamX = (i * laneW) + shakeX;
                ctx.fillStyle = p.glow;
                ctx.globalAlpha = laneBeamAlpha[i] * 0.3; 
                ctx.fillRect(beamX, 0, laneW, hitY);
                ctx.globalAlpha = 1.0; laneBeamAlpha[i] -= 0.08;
            }
            if (i > 0) { ctx.moveTo(i * laneW + shakeX, 0); ctx.lineTo(i * laneW + shakeX, gameHeight); }
        }
        ctx.stroke();

        // Hit Line
        ctx.strokeStyle = (combo >= 200) ? p.border : p.glow;
        ctx.lineWidth = (combo >= 200) ? 3 : 2;
        ctx.beginPath(); ctx.moveTo(0, hitY); ctx.lineTo(gameWidth, hitY); ctx.stroke();

        // --- DRAW NOTES ---
        const tapGradient = GRADIENT_CACHE.tap[p.name];

        activeTiles.forEach(tile => {
            if (tile.type === 'long' && tile.completed) return;

            let tileShake = (tile.type === 'long' && tile.holding) ? (Math.random() - 0.5) * 3 : 0;
            const x = tile.lane * laneW + padding + tileShake;
            const w = laneW - (padding * 2);
            const progressStart = 1 - (tile.time - songTime) / currentSpeed;
            const visualY = tile.hit ? hitY : progressStart * hitY;
            let yTop = visualY - CONFIG.noteHeight;

            if (tile.type === 'tap') {
                let scale = tile.hit ? CONFIG.hitScale : 1;
                
                // Translate context to use cached gradient at 0,0
                ctx.save();
                const cx = x + w / 2; const cy = yTop + CONFIG.noteHeight / 2;
                ctx.translate(cx, cy); 
                ctx.scale(scale, scale); 
                ctx.translate(-w/2, -CONFIG.noteHeight/2); 

                // Shadow check
                if (enableHeavyEffects) {
                    ctx.shadowBlur = (tile.hit) ? 35 : (combo >= 200 ? 20 : 10);
                    ctx.shadowColor = p.glow;
                } else {
                    ctx.shadowBlur = 0; 
                }
                
                // Use Cached Gradient
                ctx.fillStyle = tapGradient || p.tapColor[0];
                
                ctx.beginPath();
                if (ctx.roundRect) ctx.roundRect(0, 0, w, CONFIG.noteHeight, noteRadius);
                else ctx.fillRect(0, 0, w, CONFIG.noteHeight);
                ctx.fill();

                // Border
                ctx.strokeStyle = p.border; ctx.lineWidth = (combo >= 200) ? 3 : 2; ctx.stroke();
                
                // Highlight
                ctx.shadowBlur = 0; ctx.fillStyle = "rgba(255,255,255,0.2)";
                ctx.beginPath(); 
                ctx.ellipse(w/2, 10, w / 2 - 5, 4, 0, 0, Math.PI * 2); 
                ctx.fill();
                ctx.restore();

            } else if (tile.type === 'long') {
                const progressEnd = 1 - (tile.endTime - songTime) / currentSpeed;
                let yTail = Math.min(progressEnd * hitY, hitY);
                let yHead = (tile.hit && tile.holding) ? hitY : visualY;
                if (yTail > yHead) yTail = yHead;

                const headH = CONFIG.noteHeight;
                const actualYHeadTop = yHead - headH;
                const tailH = actualYHeadTop - yTail;
                
                let colorSet = p.longColor;
                if (tile.failed) colorSet = colors.dead;
                else if (tile.released) colorSet = colors.released;

                // Long Note Tail
                if (tailH > 1) {
                    let grad = ctx.createLinearGradient(0, yTail, 0, actualYHeadTop);
                    grad.addColorStop(0, "rgba(0,0,0,0)");
                    grad.addColorStop(0.2, colorSet[1]);
                    grad.addColorStop(1, colorSet[0]);
                    
                    if (tile.released) ctx.globalAlpha = 0.5;
                    
                    ctx.fillStyle = grad;
                    ctx.fillRect(x + 10, yTail, w - 20, tailH + 10);
                    
                    ctx.fillStyle = (combo >= 200 && !tile.failed && !tile.released) ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.3)";
                    ctx.fillRect(x + w / 2 - 1, yTail, 2, tailH);
                    
                    ctx.globalAlpha = 1.0;
                }

                // Long Note Head
                let headColors = (combo >= 200 && !tile.failed && !tile.released) ? p.tapColor : colorSet;
                let hGrad = ctx.createLinearGradient(0, actualYHeadTop, 0, yHead);
                hGrad.addColorStop(0, headColors[0]); hGrad.addColorStop(1, headColors[1]);
                ctx.fillStyle = hGrad;
                
                if (enableHeavyEffects && !tile.released) {
                    ctx.shadowBlur = tile.hit && tile.holding ? 30 : 0;
                    ctx.shadowColor = p.glow;
                } else {
                    ctx.shadowBlur = 0;
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
        });

        // --- DRAW PARTICLES (OPTIMIZED) ---
        ctx.shadowBlur = 0; 
        
        for (let i = 0; i < MAX_PARTICLES; i++) {
            let pt = particlePool[i];
            if (!pt.active) continue;

            pt.x += pt.vx; pt.y += pt.vy; pt.vy += 0.5; pt.life -= 0.03;
            if (combo >= 400) pt.angle += pt.spin; 
            
            if (pt.life <= 0.05) { pt.active = false; continue; }

            ctx.globalAlpha = Math.max(0, pt.life);
            ctx.fillStyle = pt.color;
            ctx.beginPath();
            
            if (combo >= 800 || combo >= 400) {
                 const size = combo >= 800 ? 6 : 8; 
                 const thickness = 2; 
                 
                 const c = Math.cos(pt.angle);
                 const s = Math.sin(pt.angle);
                 
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
                 
            } else if (combo >= 200) {
                ctx.moveTo(pt.x, pt.y - 4); ctx.lineTo(pt.x + 4, pt.y); ctx.lineTo(pt.x, pt.y + 4); ctx.lineTo(pt.x - 4, pt.y);
            } else {
                ctx.arc(pt.x, pt.y, Math.random() * 3 + 1, 0, Math.PI * 2);
            }
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // --- DRAW RATINGS (CANVAS TEXT) ---
        drawRatings();

        // --- DRAW COMBO & MULTIPLIER (CANVAS) ---
        drawComboDisplay();
        drawMultiplier(p.border); 
    }

    function drawMultiplier(color) {
        const mult = getComboMultiplier();
        if (mult <= 1.0) return;

        const timeSinceUpdate = Date.now() - lastComboUpdateTime;
        let alpha = 1.0;
        if (timeSinceUpdate > 2000) {
             alpha = Math.max(0, 1 - (timeSinceUpdate - 2000) / 1000);
        }
        if (alpha <= 0) return;

        ctx.save();
        ctx.globalAlpha = alpha;
        
        const cx = gameWidth / 2;
        const cy = isMobile ? 145 : 160; 

        ctx.translate(cx, cy);
        ctx.scale(comboScale, comboScale);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const fontSize = isMobile ? 24 : 28; 
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
        if (combo < 3) return; 

        const timeSinceUpdate = Date.now() - lastComboUpdateTime;
        let alpha = 1.0;
        if (timeSinceUpdate > 2000) {
             alpha = Math.max(0, 1 - (timeSinceUpdate - 2000) / 1000); 
        }
        if (alpha <= 0) return;
        
        let gradColors = ['#fff', '#ccc'];
        let fontSize = 60;
        let labelColor = '#fff';

        if (combo >= 800) {
            gradColors = ['#ffffff', '#7b1fa2']; 
            fontSize = 70; labelColor = '#e1bee7';
        } else if (combo >= 400) {
            gradColors = ['#00e5ff', '#d500f9']; 
            fontSize = 68; labelColor = '#00e5ff';
        } else if (combo >= 200) {
            gradColors = ['#FFD700', '#FDB931']; 
            fontSize = 66; labelColor = '#FFF8E1';
        } else if (combo >= 100) {
            gradColors = ['#00bcd4', '#b2ebf2']; 
            fontSize = 64; labelColor = '#00bcd4';
        }

        ctx.save();
        ctx.globalAlpha = alpha;
        const cx = gameWidth / 2;
        const cy = gameHeight * 0.3; 
        
        ctx.translate(cx, cy);
        ctx.scale(comboScale, comboScale);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.font = "italic 900 24px 'Comic Sans MS'";
        ctx.fillStyle = labelColor;
        ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.fillText(getText('combo'), 2, -40 + 2);
        ctx.fillStyle = labelColor; ctx.fillText(getText('combo'), 0, -40);

        ctx.font = `italic 900 ${fontSize}px 'Comic Sans MS'`;
        
        let gradient = ctx.createLinearGradient(0, -30, 0, 30);
        gradient.addColorStop(0, gradColors[0]);
        gradient.addColorStop(1, gradColors[1]);

        ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.fillText(combo, 4, 14);
        ctx.fillStyle = gradient; ctx.fillText(combo, 0, 10);

        ctx.restore();
        ctx.globalAlpha = 1.0;
    }

    function drawRatings() {
        if (activeRatings.length === 0) return;
        const now = Date.now();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        for (let i = activeRatings.length - 1; i >= 0; i--) {
            const r = activeRatings[i];
            const elapsed = now - r.startTime;
            const duration = 500; 
            
            if (elapsed > duration) {
                activeRatings.splice(i, 1);
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
            
            if (!isMobile) {
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
        const laneW = gameWidth / 4;
        const x = lane * laneW + laneW / 2;
        let finalColor = '#cfd8dc';
        if (combo >= 800) finalColor = Math.random() > 0.4 ? '#ffffffff' : '#101006ff';
        else if (combo >= 400) finalColor = Math.random() > 0.5 ? '#d500f9' : '#00e5ff';
        else if (combo >= 200) finalColor = '#e6953f';
        else if (combo >= 100) finalColor = '#00bcd4';
        
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
        if (!isPlaying || isPaused) return;
        const now = Date.now();
        if (now - laneLastInputTime[lane] < 70) return;
        laneLastInputTime[lane] = now;
        keyState[lane] = true;
        if (laneElements[lane]) laneElements[lane].classList.add('active');
        laneBeamAlpha[lane] = 1.0;
        if (holdingTiles[lane]) return;

        const activeHold = activeTiles.find(t => t.lane === lane && t.type === 'long' && t.hit && !t.completed && !t.failed && !t.released);
        if (activeHold) {
            holdingTiles[lane] = activeHold;
            activeHold.lastValidHoldTime = Date.now();
            toggleHoldEffect(lane, true, getCurrentBeamColor());
            return;
        }

        const songTime = (audioCtx.currentTime - startTime) * 1000;
        const target = activeTiles.find(t => {
            if (t.hit || t.completed || t.failed || t.released) return false;
            if (t.lane !== lane) return false;
            if (t.type === 'tap' && t.hitAnimStart) return false;
            const diff = t.time - songTime;
            return diff <= 210 && diff >= -240;
        });

        if (target) {
            const diff = Math.abs(target.time - songTime);
            target.hit = true;
            consecutiveMisses = 0;
            lastHitTime = Date.now();
            lastComboUpdateTime = Date.now();
            
            if (target.type === 'tap') target.hitAnimStart = Date.now();
            const mult = getComboMultiplier();

            if (diff < 70) {
                score += Math.round(CONFIG.scorePerfect * mult);
                showRating(getText('perfect'), "rating-perfect");
                spawnSparks(lane, gameHeight * CONFIG.hitPosition, '#ff00ff', 'perfect');
            } else {
                score += Math.round(CONFIG.scoreGood * mult);
                showRating(getText('good'), "rating-good");
                spawnSparks(lane, gameHeight * CONFIG.hitPosition, '#00ffff', 'good');
            }

            if (target.type === 'long') {
                holdingTiles[lane] = target;
                target.lastValidHoldTime = Date.now();
                toggleHoldEffect(lane, true, getCurrentBeamColor());
                score += Math.round(CONFIG.scorePerfect * mult);
                showRating(getText('perfect'), "rating-perfect");
            } else {
                combo++;
                if(combo > maxCombo) maxCombo = combo;
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
        if (holdingTiles[lane]) holdingTiles[lane] = null;
    }

    function missNote(tile, isSpawnedMiss) {
        consecutiveMisses++;
        combo = 0;
        lastComboUpdateTime = 0; 
        updateScoreUI(); 
        showRating(getText('miss'), "rating-miss");
        if (gameContainer) {
            gameContainer.classList.add('shake-screen');
            setTimeout(() => gameContainer.classList.remove('shake-screen'), 300);
        }
        if (consecutiveMisses >= CONFIG.missLimit) endGame(false);
    }

    // --- UI UPDATES ---
    function getComboMultiplier() {
        if (combo >= 400) return 5.0;
        if (combo >= 200) return 3.0;
        if (combo >= 100) return 2.0;
        if (combo >= 50) return 1.5;
        return 1.0;
    }

    // OPTIMIZED: Throttle score and DOM updates
    let lastRenderedScore = -1;
    function updateScoreUI(isHit = false) {
        if (scoreEl && score !== lastRenderedScore) {
            scoreEl.innerText = score;
            lastRenderedScore = score;
        }

        if (isHit && combo > 0) {
            comboScale = 1.3; 
        }

        updateContainerEffects();
    }

    function updateContainerEffects() {
        let newTier = 'none';
        if (combo >= 800) newTier = 'legendary';
        else if (combo >= 400) newTier = 'cosmic';
        else if (combo >= 200) newTier = 'gold';
        else if (combo >= 100) newTier = 'electric';

        if (newTier !== currentComboTier) {
            currentComboTier = newTier;
            
            if (gameContainer) {
                gameContainer.classList.remove('container-ripple-gold', 'container-ripple-cosmic', 'container-legendary');
                if (newTier === 'gold') gameContainer.classList.add('container-ripple-gold');
                if (newTier === 'cosmic') gameContainer.classList.add('container-ripple-cosmic');
                if (newTier === 'legendary') gameContainer.classList.add('container-legendary');
            }

            const legendaryOverlay = document.getElementById('legendary-border-overlay');
            if (legendaryOverlay) {
                if (newTier === 'legendary') legendaryOverlay.classList.add('active');
                else legendaryOverlay.classList.remove('active');
            }
        }
    }

    function showRating(text, cssClass) {
        let color = '#fff';
        if (cssClass === 'rating-perfect') color = '#ff00ff';
        else if (cssClass === 'rating-good') color = '#66FCF1';
        else if (cssClass === 'rating-miss') color = '#ff3333';

        activeRatings.push({
            text: text,
            type: cssClass,
            color: color,
            startTime: Date.now(),
            x: gameWidth / 2,
            y: gameHeight * 0.4
        });
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
            if (effect.style.display !== 'block') effect.style.display = 'block';
            effect.style.background = `linear-gradient(to top, ${color}, transparent)`;
        } else {
            if (effect.style.display !== 'none') effect.style.display = 'none';
        }
    }

    function updateProgressBar(current, total) {
        if (!progressBar) return;
        const ratio = Math.min(1, current / total);
        progressBar.style.width = `${ratio * 100}%`;
        
        // Optimize: Only check stars when needed (simple check is fine)
        starsElements.forEach(s => s?.classList.remove('active'));
        const isSecret = songsDB[currentSongIndex].isSecret;
        const t = isSecret ? [0.2, 0.4, 0.6, 0.8, 0.98] : [0.33, 0.66, 0.98];
        t.forEach((limit, i) => {
             if (ratio > limit && starsElements[i]) starsElements[i].classList.add('active');
        });
    }

    // --- GAME FLOW ---
    async function startGame(idx) {
        const song = songsDB[idx];
        if (song.isSecret) {
            let playerName = localStorage.getItem('playerName');
            if (!playerName) {
                playerName = await getNameFromUser();
                if (!playerName) return;
            }
        }

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

    async function endGame(victory) {
        isPlaying = false;
        if (sourceNode) sourceNode.stop();
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        if (bgMusicEl && !isMuted) bgMusicEl.play().catch(() => {});

        const title = document.getElementById('end-title');
        if (title) {
            title.innerText = victory ? getText('complete') : getText('failed');
            title.style.color = victory ? "#66FCF1" : "#FF0055";
        }
        document.getElementById('final-score').innerText = score;

        let starsCount = 0;
        const isSecret = songsDB[currentSongIndex].isSecret;
        if (victory) {
            starsCount = isSecret ? 5 : 3;
        } else {
            const currentTime = audioCtx ? (audioCtx.currentTime - startTime) : 0;
            const progress = currentTime / (audioBuffer ? audioBuffer.duration : 1);
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
                        if (score > userDoc.data().score) {
                            await updateDoc(doc(db, "secret_leaderboard", userDoc.id), { score: score, date: new Date(), name: playerName });
                        }
                    } else {
                        await addDoc(dbRef, { userId: userId, name: playerName, score: score, date: new Date() });
                    }
                } catch (e) { console.error(e); }
            }
        }

        if (score > 0) saveGameData(songsDB[currentSongIndex].title, score, starsCount);

        let starsStr = "";
        const total = isSecret ? 5 : 3;
        for (let i = 0; i < total; i++) starsStr += i < starsCount ? "★" : "☆";
        document.getElementById('final-stars').innerText = starsStr;

        document.getElementById('result-screen').classList.remove('hidden');
        updateGameText();
    }

    function quitGame() {
        if (bgMusicEl && !isMuted) bgMusicEl.play().catch(() => {});
        resetGameState();
        if (gameContainer) gameContainer.classList.add('hidden');
        if (menuLayer) menuLayer.classList.remove('hidden');
        renderMenu();
        const searchInput = document.getElementById('song-search-input');
        if (searchInput) { searchInput.value = ''; document.getElementById('no-songs-msg')?.classList.add('hidden'); }
    }

    // --- MENUS & MODALS ---
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

    async function showLeaderboard() {
        let modal = document.getElementById('lb-modal');
        if (modal) modal.remove();
        
        modal = document.createElement('div');
        modal.id = 'lb-modal';
        modal.className = 'leaderboard-modal';
        modal.innerHTML = `
            <div class="leaderboard-content">
                <span class="lb-close-btn">&times;</span>
                <h2 id="lb-title">${getText('lbTitle')}</h2>
                <table class="lb-table">
                    <thead><tr><th>${getText('lbRank')}</th><th>${getText('lbName')}</th><th>${getText('lbScore')}</th></tr></thead>
                    <tbody id="lb-body"><tr><td colspan="3">${getText('lbLoading')}</td></tr></tbody>
                </table>
            </div>`;
        document.body.appendChild(modal);
        modal.querySelector('.lb-close-btn').onclick = () => { modal.remove(); };

        try {
            const q = query(collection(db, "secret_leaderboard"), orderBy("score", "desc"), limit(10));
            const querySnapshot = await getDocs(q);
            const tbody = document.getElementById('lb-body');
            tbody.innerHTML = '';
            if (querySnapshot.empty) tbody.innerHTML = `<tr><td colspan="3">${getText('lbNoRecords')}</td></tr>`;
            else {
                let rank = 1;
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    const tr = document.createElement('tr');
                    tr.innerHTML = `<td>#${rank++}</td><td>${data.name}</td><td>${data.score}</td>`;
                    tbody.appendChild(tr);
                });
            }
        } catch (e) { document.getElementById('lb-body').innerHTML = `<tr><td colspan="3">${getText('lbError')}</td></tr>`; }
    }

    function showSecretLockModal() {
        const modal = document.createElement('div');
        modal.className = 'secret-lock-modal';
        modal.innerHTML = `
            <div class="secret-lock-content">
                <span class="secret-lock-close">&times;</span>
                <div class="secret-lock-icon">🔒</div>
                <p>${getText('secretLockMsg')}</p>
                <button class="secret-lock-btn">${getText('close')}</button>
            </div>`;
        document.body.appendChild(modal);
        const close = () => modal.remove();
        modal.querySelector('.secret-lock-close').onclick = close;
        modal.querySelector('.secret-lock-btn').onclick = close;
        modal.onclick = (e) => { if (e.target === modal) close(); };
    }

    function showNotification(text, type = 'success') {
        const el = document.createElement('div');
        el.className = 'game-notification';
        el.innerHTML = `${type === 'error' ? '❌' : '✨'} ${text}`;
        document.body.appendChild(el);
        setTimeout(() => { el.style.animation = 'toastFadeOut 0.5s forwards'; setTimeout(() => el.remove(), 500); }, 2500);
    }

    // --- INIT INPUTS ---
    function initControls() {
        const lanesContainer = document.getElementById('lanes-bg');
        if (lanesContainer) for (let i = 0; i < 4; i++) laneElements[i] = lanesContainer.children[i];

        const ignore = ['.hit-line', '.lane-hints', '#hold-effects-container', '#legendary-border-overlay'];
        ignore.forEach(sel => { const el = document.querySelector(sel); if(el) el.style.pointerEvents = 'none'; });

        // Search
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

        // Canvas Input
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

        // Keys
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

        // UI Buttons
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
            isMuted = !isMuted;
            localStorage.setItem('isMuted', isMuted);
            if (masterGain) masterGain.gain.value = isMuted ? 0 : 1;
            btn.innerText = isMuted ? '🔇' : '🔊';
            if (bgMusicEl) isMuted ? bgMusicEl.pause() : (!isPlaying && bgMusicEl.play().catch(() => {}));
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
                currentLang = b.dataset.lang;
                localStorage.setItem('siteLang', currentLang);
                updateGameText();
                if (langWrapper) langWrapper.classList.remove('open');
            };
        });

        document.addEventListener('click', (e) => {
            if (langWrapper && !langWrapper.contains(e.target)) {
                langWrapper.classList.remove('open');
            }
        });

        // Nav
        const setupNav = (id, fn) => { const btn = document.getElementById(id); if (btn) btn.onclick = () => { playClick(); fn(); }; };
        setupNav('global-back-btn', () => isPlaying ? quitGame() : window.location.href = 'index.html');
        setupNav('btn-quit', quitGame);
        setupNav('btn-menu-end', quitGame);
        setupNav('btn-pause', togglePauseGame);
        setupNav('btn-resume', togglePauseGame);
        setupNav('btn-restart', () => { document.getElementById('result-screen').classList.add('hidden'); resetGameState(); setTimeout(() => startGame(currentSongIndex), 50); });

        function togglePauseGame() {
            if (!isPlaying) return;
            isPaused = !isPaused;
            const m = document.getElementById('pause-modal');
            if (isPaused) { audioCtx.suspend(); m?.classList.remove('hidden'); }
            else { audioCtx.resume(); m?.classList.add('hidden'); gameLoop(); }
        }
    }

    function resizeCanvas() { 
        if (gameContainer && gameContainer.clientWidth && canvas) { 
            const dpr = Math.min(window.devicePixelRatio || 1, 1.5); 
            gameWidth = gameContainer.clientWidth;
            gameHeight = gameContainer.clientHeight;
            
            canvas.width = gameWidth * dpr;
            canvas.height = gameHeight * dpr;
            
            ctx.setTransform(1, 0, 0, 1, 0, 0); 
            ctx.scale(dpr, dpr); 
            
            initGradients();
        }
        isMobile = window.innerWidth < 768;
    }
    window.addEventListener('resize', resizeCanvas);

    // Initial Start
    initControls();
    renderMenu();
    setTimeout(resizeCanvas, 100);

}); // END DOMContentLoaded