const themeBtn = document.getElementById('themeToggle');
const langBtn = document.getElementById('langToggle');
const langWrapper = document.querySelector('.lang-wrapper');
const langItems = document.querySelectorAll('.lang-dropdown button');
const texts = document.querySelectorAll('[data-i18n]');

const translations = {
  UA: {
    title: 'Привіт! Це твій подарунок 😎',
    text: 'Я вирішив не дарувати шкарпетки, а зробити цей сайт. Тут трохи дивно, але весело.'
  },
  RU: {
    title: 'Привет! Это твой подарок 😎',
    text: 'Я решил не дарить носки, а сделать этот сайт. Тут немного странно, но весело.'
  },
  MEOW: {
    title: 'Мяу 😼',
    text: 'Мрр. Мяу мяу. Кусь.'
  }
};

themeBtn.addEventListener('click', (e) => {
  if (!document.startViewTransition) {
    toggleTheme();
    return;
  }

  const x = e.clientX;
  const y = e.clientY;

  document.startViewTransition(() => {
    toggleTheme();
  });

  document.documentElement.animate(
    {
      clipPath: [
        `circle(0px at ${x}px ${y}px)`,
        `circle(150% at ${x}px ${y}px)`
      ]
    },
    {
      duration: 600,
      easing: 'ease-in-out',
      pseudoElement: '::view-transition-new(root)'
    }
  );
});

function toggleTheme() {
  const body = document.body;
  const isDark = body.getAttribute('data-theme') === 'dark';
  body.setAttribute('data-theme', isDark ? 'light' : 'dark');
  themeBtn.textContent = isDark ? '☀️' : '🌙';
}

langBtn.addEventListener('click', () => {
  langWrapper.classList.toggle('open');
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
    el.textContent = translations[lang][key];
  });
}

document.addEventListener('click', (e) => {
  if (!langWrapper.contains(e.target)) {
    langWrapper.classList.remove('open');
  }
});
