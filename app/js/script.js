const translations = {
    ua: {
        greeting: "Привіт! Це твій подарунок 😎",
        message: "Я вирішив не дарувати тобі шкарпетки, а зробити цей сайт. Тут трохи дивно, але весело. Тицяй кнопки, дивись навкруги!",
        footer: "Зроблено з любов'ю та HTML",
        btnEmoji: "🇺🇦"
    },
    ru: {
        greeting: "Привет! Это твой подарок 😎",
        message: "Я решил не дарить тебе носки, а сделать этот сайт. Тут немного странно, но весело. Тыкай кнопки, смотри по сторонам!",
        footer: "Сделано с любовью и HTML",
        btnEmoji: "🇷🇺"
    }
};

const mainBtn = document.getElementById('main-btn');
const themeBtn = document.getElementById('theme-btn');
const langMenu = document.getElementById('lang-menu');
const textElements = document.querySelectorAll('[data-key]');

// 1. Мовна логіка
function toMeowLanguage(text) {
    return text.replace(/[а-яА-ЯіІїЇєЄa-zA-Z0-9]+/g, (word) => {
        if (word.length <= 3) return "Мяу";
        if (word.length <= 5) return "Мрр";
        return Math.random() > 0.7 ? "Кусь" : "Мя" + "я".repeat(word.length - 2) + "у";
    });
}

mainBtn.addEventListener('click', () => langMenu.classList.toggle('active'));

document.querySelectorAll('.lang-dropdown button').forEach(btn => {
    btn.addEventListener('click', () => {
        const lang = btn.getAttribute('data-lang');
        setLanguage(lang);
        langMenu.classList.remove('active');
    });
});

function setLanguage(lang) {
    const isMeow = lang === 'meow';
    
    // Вмикаємо/вимикаємо клас кота для курсора
    document.body.classList.toggle('meow-mode', isMeow);

    // Оновлюємо текст головної кнопки (UA, RU або 🐱)
    if (isMeow) {
        mainBtn.textContent = "🐱";
    } else {
        mainBtn.textContent = lang.toUpperCase(); 
    }

    // Перекладаємо тексти
    textElements.forEach(el => {
        const key = el.getAttribute('data-key');
        const baseText = translations['ua'][key]; // Беремо UA за основу для Meow
        
        if (isMeow) {
            el.textContent = toMeowLanguage(baseText);
        } else {
            if (translations[lang][key]) {
                el.textContent = translations[lang][key];
            }
        }
    });
}

// 2. Анімація теми
themeBtn.addEventListener('click', (e) => {
    const toggle = () => {
        document.body.classList.toggle('light-theme');
        themeBtn.textContent = document.body.classList.contains('light-theme') ? '🔆' : '🌜';
    };

    if (!document.startViewTransition) {
        toggle();
        return;
    }

    const x = e.clientX;
    const y = e.clientY;
    const endRadius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

    const transition = document.startViewTransition(toggle);

    transition.ready.then(() => {
        document.documentElement.animate(
            { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`] },
            { duration: 500, easing: 'ease-in', pseudoElement: '::view-transition-new(root)' }
        );
    });
});