const themeBtn = document.getElementById('themeToggle');
const langBtn = document.getElementById('langToggle');
const langWrapper = document.querySelector('.lang-wrapper');
const langItems = document.querySelectorAll('.lang-dropdown button');
const texts = document.querySelectorAll('[data-i18n]');

// --- Переклади ---
const translations = {
  UA: {
    title: 'З новим роком 😎', // Це тепер головний напис на кнопці
    text: 'тицяй сюди',
    btnMemes: 'Мемс',
    btnDance: 'Денс',
    btnSurprise: 'Сюрпрайз'
  },
  RU: {
    title: 'С новым годом 😎',
    text: 'жмякай сюда',
    btnMemes: 'Мемс',
    btnDance: 'Дэнс',
    btnSurprise: 'Сюрпрайз'
  },
  MEOW: {
    title: 'Meow Meow 😎',
    text: 'meow',
    btnMemes: 'Meow',
    btnDance: 'Meow',
    btnSurprise: 'Meow'
  }
};

// --- Логіка кнопки СТАРТ ---
const btnStart = document.getElementById('btnStart');
const viewStart = document.getElementById('view-start');
const viewHub = document.getElementById('view-hub');

btnStart.addEventListener('click', () => {
  viewStart.classList.add('hidden');
  viewStart.classList.remove('active');
  
  setTimeout(() => {
    viewHub.classList.remove('hidden');
    viewHub.classList.add('active');
  }, 400);
});

// --- Логіка Каруселі ---
const panels = document.querySelectorAll('.panel');

panels.forEach(panel => {
  panel.addEventListener('click', function(e) {
    if(e.target.classList.contains('action-btn')) return;

    if (this.classList.contains('left')) {
      rotateCarousel('right');
    } else if (this.classList.contains('right')) {
      rotateCarousel('left');
    }
  });
});

function rotateCarousel(direction) {
  const left = document.querySelector('.panel.left');
  const center = document.querySelector('.panel.center');
  const right = document.querySelector('.panel.right');

  left.classList.remove('left');
  center.classList.remove('center');
  right.classList.remove('right');

  if (direction === 'right') {
    left.classList.add('center');
    center.classList.add('right');
    right.classList.add('left');
  } else {
    right.classList.add('center');
    center.classList.add('left');
    left.classList.add('right');
  }
}

// --- Кнопки керування ---
themeBtn.addEventListener('click', () => {
  const body = document.body;
  const isDark = body.getAttribute('data-theme') === 'dark';
  body.setAttribute('data-theme', isDark ? 'light' : 'dark');
  themeBtn.textContent = isDark ? '☀️' : '🌙';
});

langBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  langWrapper.classList.toggle('open');
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
    langWrapper.classList.remove('open');
  });
});

function applyLanguage(lang) {
  texts.forEach(el => {
    const key = el.dataset.i18n;
    if (translations[lang] && translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });
}

// ==========================================
// --- СНІГ ---
// ==========================================
const snowContainer = document.getElementById('snow-container');

function createSnowflake() {
  const snowflake = document.createElement('div');
  snowflake.classList.add('snowflake');

  // Параметри
  const size = Math.random() * 5 + 3 + 'px'; // Трохи більші
  const left = Math.random() * 100 + 'vw';   
  const duration = Math.random() * 5 + 5 + 's'; 
  const delay = Math.random() * 5 + 's';     

  snowflake.style.width = size;
  snowflake.style.height = size;
  snowflake.style.left = left;
  snowflake.style.animationDuration = duration;
  snowflake.style.animationDelay = delay;
  
  if (Math.random() > 0.5) {
     snowflake.style.filter = `blur(${Math.random()}px)`;
  }

  snowContainer.appendChild(snowflake);

  setTimeout(() => {
    snowflake.remove();
  }, (parseFloat(duration) + parseFloat(delay)) * 1000);
}

setInterval(createSnowflake, 150); // Частіше падають

for(let i = 0; i < 50; i++) {
    setTimeout(createSnowflake, Math.random() * 2000);
}