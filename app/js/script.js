// ==========================================
// --- ГЛОБАЛЬНА ЛОГІКА (Працює на всіх сторінках) ---
// ==========================================

const themeBtn = document.getElementById('themeToggle');
const langBtn = document.getElementById('langToggle');
const soundBtn = document.getElementById('soundToggle'); 
const langWrapper = document.querySelector('.lang-wrapper');
const langItems = document.querySelectorAll('.lang-dropdown button');

// 🎵 АУДІО ЕЛЕМЕНТИ
const bgMusic = document.getElementById('bg-music');
const sfxClick = document.getElementById('sfx-click');
const sfxHover = document.getElementById('sfx-hover');
const sfxSpin = document.getElementById('sfx-spin');
const sfxWin = document.getElementById('sfx-win');

const translations = {
  UA: {
    title: 'З новим роком 😎', text: 'Жмякайте',
    btnMemes: 'Мемс', btnDance: 'Денс', btnSurprise: 'Сюрпрайз',
    spinTitle: 'НУ давайте лудомани', spinSub: 'Крутіть меми',
    btnSpin: 'Спін', btnBack: '⬅ Назад',
    videoDefault: 'Відео', btnOpen: 'РОЗПАКУВАТИ'
  },
  RU: {
    title: 'С новым годом 😎', text: 'Жмякайте',
    btnMemes: 'Мемс', btnDance: 'Дэнс', btnSurprise: 'Сюрпрайз',
    spinTitle: 'НУ давайте лудоманы', spinSub: 'Крутите мемы',
    btnSpin: 'Спин', btnBack: '⬅ Назад',
    videoDefault: 'Видео', btnOpen: 'РАСПАКОВАТЬ'
  },
  MEOW: {
    title: 'Meow Meow 😎', text: 'Meow',
    btnMemes: 'Meow', btnDance: 'Meow', btnSurprise: 'Meow',
    spinTitle: 'MEOW MEOW', spinSub: 'Meow meow',
    btnSpin: 'Meow', btnBack: '⬅ Meow',
    videoDefault: 'Meow', btnOpen: 'MEOW!'
  }
};

// --- 1. ЗАВАНТАЖЕННЯ НАЛАШТУВАНЬ ---

// Тема
const savedTheme = localStorage.getItem('siteTheme') || 'dark';
document.body.setAttribute('data-theme', savedTheme);
if(themeBtn) themeBtn.textContent = savedTheme === 'dark' ? '🌙' : '☀️';

// Мова
const savedLang = localStorage.getItem('siteLang') || 'UA';
document.body.setAttribute('data-lang', savedLang);
if(langBtn) langBtn.textContent = savedLang === 'MEOW' ? '🐱' : savedLang;

// --- 🔊 ЛОГІКА ЗВУКУ (ВИПРАВЛЕНА) ---

// 1. За замовчуванням звук УВІМКНЕНО (false), якщо в localStorage нічого немає
// localStorage повертає рядок 'true', тому порівнюємо з рядком.
let isMuted = localStorage.getItem('isMuted') === 'true'; 

if(bgMusic) {
    bgMusic.volume = 0.2; // Гучність фону
    
    // 2. Відновлюємо момент пісні, щоб не починалася спочатку
    const savedTime = localStorage.getItem('bgMusicTime');
    if(savedTime) bgMusic.currentTime = parseFloat(savedTime);
}

document.addEventListener('DOMContentLoaded', () => {
    applyLanguage(savedLang);
    updateSoundIcon();
    
    // Спроба автозапуску
    tryPlayMusic();
});

// Зберігаємо час пісні перед виходом зі сторінки
window.addEventListener('beforeunload', () => {
    if(bgMusic && !bgMusic.paused) {
        localStorage.setItem('bgMusicTime', bgMusic.currentTime);
    }
});


// --- ФУНКЦІЇ ЗВУКУ ---

function updateSoundIcon() {
    if(!soundBtn) return;
    if (isMuted) {
        soundBtn.textContent = '🔇';
        soundBtn.classList.remove('playing');
        if(bgMusic) bgMusic.pause();
    } else {
        soundBtn.textContent = '🔊';
        soundBtn.classList.add('playing');
        tryPlayMusic();
    }
}

// 🪄 МАГІЯ АВТОЗАПУСКУ
function tryPlayMusic() {
    if(isMuted || !bgMusic) return;

    // Браузер повертає проміс (обіцянку). Якщо він відхиляє автоплей - ми ловимо помилку.
    const playPromise = bgMusic.play();

    if (playPromise !== undefined) {
        playPromise.catch(error => {
            console.log("Автоплей заблоковано браузером. Чекаємо кліку...");
            // Якщо браузер не дав запустити, вішаємо одноразовий слухач на ВЕСЬ документ
            document.addEventListener('click', unlockAudio, { once: true });
        });
    }
}

function unlockAudio() {
    if(!isMuted && bgMusic) {
        bgMusic.play();
    }
}

function playSfx(audioEl) {
    if (isMuted || !audioEl) return;
    audioEl.currentTime = 0;
    audioEl.volume = 0.4;
    audioEl.play().catch(() => {});
}

if(soundBtn) {
    soundBtn.addEventListener('click', () => {
        isMuted = !isMuted;
        localStorage.setItem('isMuted', isMuted); // Зберігаємо вибір
        updateSoundIcon();
        if (!isMuted) playSfx(sfxClick);
    });
}

// Глобальні звуки
document.querySelectorAll('button, .action-btn, .mega-button').forEach(btn => {
    btn.addEventListener('mouseenter', () => playSfx(sfxHover));
});


// --- ІНШІ ОБРОБНИКИ (ТЕМА, МОВА) ---

if (themeBtn) {
    themeBtn.addEventListener('click', () => {
        const body = document.body;
        const isDark = body.getAttribute('data-theme') === 'dark';
        const newTheme = isDark ? 'light' : 'dark';
        body.setAttribute('data-theme', newTheme);
        themeBtn.textContent = isDark ? '☀️' : '🌙';
        localStorage.setItem('siteTheme', newTheme);
        playSfx(sfxClick);
    });
}

if (langBtn) {
    langBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        langWrapper.classList.toggle('open');
        playSfx(sfxClick);
    });
    
    document.addEventListener('click', (e) => {
        if (!langWrapper.contains(e.target)) langWrapper.classList.remove('open');
    });

    langItems.forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.dataset.lang;
            document.body.setAttribute('data-lang', lang);
            langBtn.textContent = lang === 'MEOW' ? '🐱' : lang;
            applyLanguage(lang);
            localStorage.setItem('siteLang', lang);
            langWrapper.classList.remove('open');
            playSfx(sfxClick);
        });
    });
}

function applyLanguage(lang) {
    const allTexts = document.querySelectorAll('[data-i18n]');
    allTexts.forEach(el => {
        const key = el.dataset.i18n;
        if (translations[lang] && translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });
}


// --- ФОНОВИЙ СНІГ ---
const snowContainer = document.getElementById('snow-container');
if (snowContainer) {
    function createSnowflake() {
        const snowflake = document.createElement('div');
        snowflake.classList.add('snowflake');
        const size = Math.random() * 5 + 3 + 'px';
        const left = Math.random() * 100 + 'vw';
        const duration = Math.random() * 5 + 5 + 's';
        
        snowflake.style.width = size;
        snowflake.style.height = size;
        snowflake.style.left = left;
        snowflake.style.animationDuration = duration;
        if (Math.random() > 0.5) snowflake.style.filter = `blur(${Math.random()}px)`;

        snowContainer.appendChild(snowflake);
        setTimeout(() => snowflake.remove(), parseFloat(duration) * 1000);
    }
    setInterval(createSnowflake, 150);
}


// ==========================================
// --- ЛОГІКА INDEX.HTML ---
// ==========================================
const btnStart = document.getElementById('btnStart');
if (btnStart) {
    const viewStart = document.getElementById('view-start');
    const viewHub = document.getElementById('view-hub');
    const panels = document.querySelectorAll('.panel');

    btnStart.addEventListener('click', () => {
        playSfx(sfxClick);
        // Тут також пробуємо запустити музику, бо це клік користувача!
        if(!isMuted && bgMusic && bgMusic.paused) bgMusic.play(); 
        
        viewStart.classList.add('hidden');
        viewStart.classList.remove('active');
        setTimeout(() => {
            viewHub.classList.remove('hidden');
            viewHub.classList.add('active');
        }, 400);
    });

    panels.forEach(panel => {
        panel.addEventListener('click', function(e) {
            if(e.target.tagName === 'A' || e.target.closest('a')) return;
            if(e.target.classList.contains('action-btn')) return;

            playSfx(sfxClick);
            if (this.classList.contains('left')) rotateCarousel('right');
            else if (this.classList.contains('right')) rotateCarousel('left');
        });
    });

    function rotateCarousel(direction) {
        const left = document.querySelector('.panel.left');
        const center = document.querySelector('.panel.center');
        const right = document.querySelector('.panel.right');

        left.classList.remove('left'); center.classList.remove('center'); right.classList.remove('right');

        if (direction === 'right') {
            left.classList.add('center'); center.classList.add('right'); right.classList.add('left');
        } else {
            right.classList.add('center'); center.classList.add('left'); left.classList.add('right');
        }
    }
}


// ==========================================
// --- ЛОГІКА MEMES.HTML ---
// ==========================================
const spinBtn = document.getElementById('spinBtn');

if (spinBtn) {
    const slotMachine = document.getElementById('slotMachine');
    const slotStrip = document.getElementById('slotStrip');
    const videoModal = document.getElementById('videoModal');
    const closeModalBtn = document.getElementById('closeModal');
    const modalTitle = document.getElementById('modalTitle');
    const memeVideo = document.getElementById('memeVideo');

    const memesDB = [
        { title: "ERROR 404", file: "error.mp4", rarity: "rare" },
        { title: "Save our cum rat", file: "rat.mp4", rarity: "common" },
        { title: "АСМР,разслабляющий удар наковальней", file: "hammer.mp4", rarity: "common" },
        { title: "Даже салаги знают кто главный петух в чате", file: "rooster.mp4", rarity: "common" },
        { title: "ЕБАТЬ , ВОТ ЭТО НИХУЕ СЕБЕ", file: "magic.mp4", rarity: "legendary" }, 
        { title: "Если гора не идёт к Магомеду, то Магомед спускается с горы", file: "magomed.mp4", rarity: "epic" },
        { title: "Идеальная совместимость", file: "compat.mp4", rarity: "epic" },
        { title: "Иногда для счастья надо нырнуть щучкой", file: "dive.mp4", rarity: "rare" },
        { title: "Ну всё так всё", file: "all.mp4", rarity: "common" },
        { title: "Только в момент тишины осознаёшь ценность звука", file: "sound.mp4", rarity: "common" }
    ];

    spinBtn.addEventListener('click', () => {
        slotMachine.classList.remove('hidden');
        
        if (!isMuted && sfxSpin) {
            sfxSpin.currentTime = 0;
            sfxSpin.volume = 0.3;
            sfxSpin.play();
        }

        const winner = getWeightedWinner();

        let htmlContent = '';
        for(let i=0; i<30; i++) {
            const randomMeme = memesDB[Math.floor(Math.random() * memesDB.length)];
            htmlContent += createSlotItem(randomMeme);
        }
        htmlContent += createSlotItem(winner);
        for(let i=0; i<3; i++) {
             const randomMeme = memesDB[Math.floor(Math.random() * memesDB.length)];
             htmlContent += createSlotItem(randomMeme);
        }

        slotStrip.innerHTML = htmlContent;
        slotStrip.style.transition = 'none';
        slotStrip.style.transform = 'translateX(0)';
        slotStrip.offsetHeight; 

        const firstItem = slotStrip.querySelector('.slot-item-text');
        const itemWidth = firstItem ? firstItem.offsetWidth : 320; 
        const targetIndex = 30; 
        const containerWidth = slotMachine.offsetWidth;
        const centerOffset = (containerWidth / 2) - (itemWidth / 2);
        const finalPosition = -(targetIndex * itemWidth) + centerOffset;

        setTimeout(() => {
            slotStrip.style.transition = 'transform 5s cubic-bezier(0.15, 0.9, 0.3, 1)';
            slotStrip.style.transform = `translateX(${finalPosition}px)`;
        }, 50);
        
        setTimeout(() => {
            if(sfxSpin) sfxSpin.pause();
            if(!isMuted) playSfx(sfxWin);

            openVideo(winner);
        }, 5500);
    });

    function getWeightedWinner() {
        const rand = Math.random() * 100;
        const legendary = memesDB.filter(m => m.rarity === 'legendary');
        const epic = memesDB.filter(m => m.rarity === 'epic');
        const rare = memesDB.filter(m => m.rarity === 'rare');
        const common = memesDB.filter(m => m.rarity === 'common');

        if (rand < 5 && legendary.length) return legendary[Math.floor(Math.random() * legendary.length)];
        if (rand < 20 && epic.length) return epic[Math.floor(Math.random() * epic.length)];
        if (rand < 50 && rare.length) return rare[Math.floor(Math.random() * rare.length)];
        return common[Math.floor(Math.random() * common.length)];
    }

    function createSlotItem(meme) {
        return `<div class="slot-item-text ${meme.rarity}">${meme.title}</div>`;
    }

    function openVideo(meme) {
        modalTitle.textContent = meme.title;
        memeVideo.src = `video/${meme.file}`;
        videoModal.classList.remove('hidden');
        memeVideo.play().catch(e => console.error("Video error:", e));
    }

    closeModalBtn.addEventListener('click', () => {
        playSfx(sfxClick); 
        videoModal.classList.add('hidden');
        memeVideo.pause();
        memeVideo.src = "";
    });
}