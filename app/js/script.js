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
    videoDefault: 'Відео', btnOpen: 'РОЗПАКУВАТИ',
    btnBattle: '⚔️ АРХІВ МОМЕНТІВ',
    battleTitle: 'БИТВА МОМЕНТІВ ⚔️',
    battleSub: 'Обирай, що смішніше ',
    battleStats: 'Переглянуто пар:',
    winTitle: '🏆 ВАШ ФАВОРИТ 🏆',
    btnRestart: 'Зіграти ще раз'
  },
  RU: {
    title: 'С новым годом 😎', text: 'Жмякайте',
    btnMemes: 'Мемс', btnDance: 'Дэнс', btnSurprise: 'Сюрпрайз',
    spinTitle: 'НУ давайте лудоманы', spinSub: 'Крутите мемы',
    btnSpin: 'Спин', btnBack: '⬅ Назад',
    videoDefault: 'Видео', btnOpen: 'РАСПАКОВАТЬ',
    btnBattle: '⚔️ АРХИВ МОМЕНТОВ ',
    battleTitle: 'БИТВА МОМЕНТОВ⚔️',
    battleSub: 'Выбирай, что смешнее ',
    battleStats: 'Просмотрено пар:',
    winTitle: '🏆 ВАШ ФАВОРИТ 🏆',
    btnRestart: 'Сыграть еще раз'
  },
  MEOW: {
    title: 'Meow Meow 😎', text: 'Meow',
    btnMemes: 'Meow', btnDance: 'Meow', btnSurprise: 'Meow',
    spinTitle: 'MEOW MEOW', spinSub: 'Meow meow',
    btnSpin: 'Meow', btnBack: '⬅ Meow',
    videoDefault: 'Meow', btnOpen: 'MEOW!',
    btnBattle: '⚔️ MEOW MEOW',
    battleTitle: 'MEOW MEOW ⚔️',
    battleSub: 'Meow meow meow meow',
    battleStats: 'Meow MEOW:',
    winTitle: '🏆 MEOW KING 🏆',
    btnRestart: 'Meow again'
  }
};

// --- 1. ЗАВАНТАЖЕННЯ НАЛАШТУВАНЬ ---

const savedTheme = localStorage.getItem('siteTheme') || 'dark';
document.body.setAttribute('data-theme', savedTheme);
if(themeBtn) themeBtn.textContent = savedTheme === 'dark' ? '🌙' : '☀️';

const savedLang = localStorage.getItem('siteLang') || 'UA';
document.body.setAttribute('data-lang', savedLang);
if(langBtn) langBtn.textContent = savedLang === 'MEOW' ? '🐱' : savedLang;

// --- 🔊 ЛОГІКА ЗВУКУ ---

// Перевіряємо, чи користувач колись вимикав звук. Якщо ні - звук УВІМКНЕНО.
let isMuted = localStorage.getItem('isMuted') === 'true'; 

if(bgMusic) {
    bgMusic.volume = 0.2; 
    bgMusic.loop = true;  
    
    // Відновлюємо момент пісні
    const savedTime = localStorage.getItem('bgMusicTime');
    if(savedTime) bgMusic.currentTime = parseFloat(savedTime);
}

document.addEventListener('DOMContentLoaded', () => {
    applyLanguage(savedLang);
    updateSoundIcon();
    
    // Запускаємо "мисливця за кліком/рухом" для музики
    startMusicUnlocker();
});

window.addEventListener('beforeunload', () => {
    if(bgMusic && !bgMusic.paused) {
        localStorage.setItem('bgMusicTime', bgMusic.currentTime);
    }
});

function updateSoundIcon() {
    if(!soundBtn) return;
    if (isMuted) {
        soundBtn.textContent = '🔇';
        soundBtn.classList.remove('playing');
        if(bgMusic) bgMusic.pause();
    } else {
        soundBtn.textContent = '🔊';
        soundBtn.classList.add('playing');
        // Якщо іконка "гучно", пробуємо грати
        if(bgMusic && bgMusic.paused) startMusicUnlocker();
    }
}

// 🔥 ФУНКЦІЯ АГРЕСИВНОГО ЗАПУСКУ МУЗИКИ
function startMusicUnlocker() {
    if(isMuted || !bgMusic) return;

    // Спроба 1: Чесний запуск (іноді працює, якщо сайт перезавантажили)
    bgMusic.play().catch(() => {
        console.log("Автоплей чекає на дію...");
    });

    // Спроба 2: Ловимо БУДЬ-ЯКУ дію користувача
    // Музика запуститься не тільки від кліку, а й від руху миші чи скролу!
    const events = ['click', 'touchstart', 'mousemove', 'scroll', 'keydown'];

    function unlock() {
        if(!isMuted && bgMusic) {
            bgMusic.play().then(() => {
                // Успіх! Прибираємо слухачі, щоб не вантажити систему
                events.forEach(e => document.removeEventListener(e, unlock, { capture: true }));
            }).catch(() => {}); 
        }
    }

    events.forEach(e => document.addEventListener(e, unlock, { capture: true, once: true }));
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
        localStorage.setItem('isMuted', isMuted);
        updateSoundIcon();
        if (!isMuted) playSfx(sfxClick);
    });
}

document.querySelectorAll('button, .action-btn, .mega-button').forEach(btn => {
    btn.addEventListener('mouseenter', () => playSfx(sfxHover));
});

// --- ІНШІ ОБРОБНИКИ ---

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

// --- ФОНОВИЙ СНІГ (З ВИПРАВЛЕННЯМ ЗНИКНЕННЯ) ---
const snowContainer = document.getElementById('snow-container');
if (snowContainer) {
    function createSnowflake(isInstant = false) {
        const snowflake = document.createElement('div');
        snowflake.classList.add('snowflake');
        const size = Math.random() * 5 + 3 + 'px';
        const left = Math.random() * 100 + 'vw';
        const duration = Math.random() * 5 + 5 + 's';
        
        snowflake.style.width = size;
        snowflake.style.height = size;
        snowflake.style.left = left;
        
        // Якщо це "миттєвий" сніг (після повернення на вкладку)
        if (isInstant) {
            snowflake.style.top = Math.random() * 100 + 'vh'; // Падає звідусіль
            snowflake.style.animationDuration = (parseFloat(duration) / 2) + 's';
        } else {
            snowflake.style.top = '-20px';
            snowflake.style.animationDuration = duration;
        }

        if (Math.random() > 0.5) snowflake.style.filter = `blur(${Math.random()}px)`;

        snowContainer.appendChild(snowflake);
        
        // Видалення
        setTimeout(() => {
            if(snowflake && snowflake.parentNode) snowflake.remove();
        }, parseFloat(duration) * 1000);
    }

    // Регулярний сніг
    setInterval(() => createSnowflake(false), 150);

    // 🔥 ФІКС: Насипаємо сніг, коли повернулися на вкладку
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
            // Генеруємо 40 сніжинок миттєво
            for(let i=0; i<40; i++) createSnowflake(true); 
        }
    });
    
    // При старті теж насипаємо, щоб не було пусто
    for(let i=0; i<30; i++) createSnowflake(true);
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
        // Додатковий шанс запустити музику (якщо рух миші не спрацював)
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
        spinBtn.disabled = true;
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
            if(!isMuted) {
                sfxWin.volume = 1.0; 
                playSfx(sfxWin);
            }
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
        spinBtn.disabled = false;
    });
}

// ==========================================
// 📱 PULL TO REFRESH
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const ptrContainer = document.getElementById('pull-to-refresh');
    const ptrSpinner = document.querySelector('.ptr-spinner');
    
    if (!ptrContainer) return;

    let startY = 0;
    let currentY = 0;
    let isPulling = false;
    const threshold = 150; 

    window.addEventListener('touchstart', (e) => {
        if (window.scrollY === 0) {
            startY = e.touches[0].clientY;
            isPulling = true;
        }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
        if (!isPulling) return;
        currentY = e.touches[0].clientY;
        const diff = currentY - startY;

        if (diff > 0 && window.scrollY === 0) {
            const move = Math.min(diff * 0.5, threshold); 
            ptrContainer.style.transform = `translateY(${move}px)`;
            ptrSpinner.style.transform = `rotate(${move * 2}deg)`;
            if (e.cancelable && diff > 10) e.preventDefault(); 
        } else {
            ptrContainer.style.transform = '';
            isPulling = false;
        }
    }, { passive: false });

    window.addEventListener('touchend', () => {
        if (!isPulling) return;
        isPulling = false;
        const diff = currentY - startY;
        if (diff * 0.5 >= 80) {
            ptrContainer.classList.add('loading');
            ptrContainer.style.transform = ''; 
            if (navigator.vibrate) navigator.vibrate(50);
            setTimeout(() => { location.reload(); }, 800);
        } else {
            ptrContainer.style.transform = '';
            ptrSpinner.style.transform = '';
        }
    });
});

// ==========================================
// ⚔️ ЛОГІКА БИТВИ (BATTLE.HTML)
// ==========================================

const cardLeft = document.getElementById('card-left');
const cardRight = document.getElementById('card-right');

if (cardLeft && cardRight) {
    const imgLeft = document.getElementById('img-left');
    const imgRight = document.getElementById('img-right');
    const counterEl = document.getElementById('round-counter');
    const winnerOverlay = document.getElementById('winner-overlay');
    const winnerImg = document.getElementById('winner-img');
    const restartBtn = document.getElementById('restartBtn');
    
    const TOTAL_PHOTOS = 75; 
    const ROUNDS_LIMIT = 15; 
    const PATH_PREFIX = 'img/screens/photo_'; 
    const FILE_EXT = '.jpg'; 
    
    let roundsPlayed = 0;
    let allIds = Array.from({length: TOTAL_PHOTOS}, (_, i) => i + 1);
    let currentLeftId, currentRightId;

    function getRandomId(exclude) {
        let available = allIds.filter(id => id !== exclude);
        return available[Math.floor(Math.random() * available.length)];
    }

    function setBattle() {
        if (!currentLeftId) currentLeftId = getRandomId(null);
        currentRightId = getRandomId(currentLeftId);
        imgLeft.src = `${PATH_PREFIX}${currentLeftId}${FILE_EXT}`;
        imgRight.src = `${PATH_PREFIX}${currentRightId}${FILE_EXT}`;
        cardLeft.className = 'fighter-card';
        cardRight.className = 'fighter-card';
    }

    function handleVote(winnerSide) {
        roundsPlayed++;
        counterEl.textContent = `${roundsPlayed} / ${ROUNDS_LIMIT}`; 

        let winnerCard, loserCard;
        let winnerId;
        let winnerSrc = winnerSide === 'left' ? imgLeft.src : imgRight.src;

        if (winnerSide === 'left') {
            winnerCard = cardLeft; loserCard = cardRight;
            winnerId = currentLeftId; 
        } else {
            winnerCard = cardRight; loserCard = cardLeft;
            winnerId = currentRightId; 
        }

        let votes = parseInt(localStorage.getItem(`vote_photo_${winnerId}`) || 0);
        localStorage.setItem(`vote_photo_${winnerId}`, votes + 1);

        winnerCard.classList.add('winner');
        loserCard.classList.add('loser');
        
        if(typeof playSfx === 'function') playSfx(document.getElementById('sfx-click'));

        if (roundsPlayed >= ROUNDS_LIMIT) {
            setTimeout(() => { showWinnerScreen(winnerSrc); }, 500);
            return; 
        }

        setTimeout(() => {
            if (winnerSide === 'left') {
                currentRightId = getRandomId(currentLeftId);
                imgRight.src = `${PATH_PREFIX}${currentRightId}${FILE_EXT}`;
            } else {
                currentLeftId = getRandomId(currentRightId);
                imgLeft.src = `${PATH_PREFIX}${currentLeftId}${FILE_EXT}`;
            }
            winnerCard.classList.remove('winner');
            loserCard.classList.remove('loser');
        }, 500);
    }

    function showWinnerScreen(imgSrc) {
        if(typeof playSfx === 'function') {
            const winSound = document.getElementById('sfx-win');
            if(winSound) { winSound.volume = 1.0; playSfx(winSound); }
        }
        winnerImg.src = imgSrc;
        winnerOverlay.classList.remove('hidden');
    }

    if(restartBtn) {
        restartBtn.addEventListener('click', () => {
            roundsPlayed = 0;
            counterEl.textContent = 0;
            winnerOverlay.classList.add('hidden');
            currentLeftId = null; 
            currentRightId = null;
            setBattle();
            if(typeof playSfx === 'function') playSfx(document.getElementById('sfx-click'));
        });
    }

    cardLeft.addEventListener('click', () => handleVote('left'));
    cardRight.addEventListener('click', () => handleVote('right'));

    setBattle();
}