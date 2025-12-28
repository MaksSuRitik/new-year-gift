/**
 * ARCHITECTURAL NOTES:
 * --------------------
 * Ми використовуємо подіє-орієнтований підхід.
 * Стан книги визначається індексом поточної сторінки (currentPage).
 * * 1. Z-Index Management:
 * У 3D просторі CSS, коли сторінки накладаються, браузер часто "мерехтить",
 * не знаючи, що відмальовувати зверху. Ми керуємо цим вручну:
 * - Сторінки праворуч (не перегорнуті) мають зворотний порядок z-index.
 * - Сторінки ліворуч (перегорнуті) мають прямий порядок z-index.
 * * 2. Mobile Centering:
 * На телефоні ми не бачимо розворот. Ми бачимо "вікно".
 * Ми зсуваємо весь контейнер #book вліво або вправо, 
 * залежно від того, яку сторінку читає користувач.
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- КОНФІГУРАЦІЯ ---
    const book = document.getElementById('book');
    // Перетворюємо NodeList на масив для зручності
    const pages = Array.from(document.querySelectorAll('.page')); 
    const totalPages = pages.length;
    
    // Стан системи
    let currentPage = 0; // 0 означає "книга закрита" (видно передню обкладинку)

    // --- ІНІЦІАЛІЗАЦІЯ ---
    
    function init() {
        // Встановлюємо початкові z-indexes
        updateZIndexes();
        
        // Навішуємо події на кожну сторінку
        pages.forEach((page, index) => {
            page.addEventListener('click', () => {
                handlePageClick(index);
            });
        });

        // Клавіатура (стрілки)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') flipNext();
            if (e.key === 'ArrowLeft') flipPrev();
        });

        // Адаптив при зміні розміру вікна
        window.addEventListener('resize', () => {
            updateBookPosition();
        });

        // Первинне позиціювання
        updateBookPosition();
    }

    // --- ЛОГІКА ГОРТАННЯ ---

    function handlePageClick(index) {
        // Логіка: 
        // Якщо клікнули на поточну активну сторінку (справа) -> гортаємо вперед
        // Якщо клікнули на попередню сторінку (зліва) -> гортаємо назад
        
        if (currentPage === index) {
            flipNext();
        } else if (currentPage === index + 1) {
            flipPrev();
        }
    }

    function flipNext() {
        if (currentPage < totalPages) {
            // Додаємо клас .flipped поточній сторінці
            pages[currentPage].classList.add('flipped');
            currentPage++;
            
            updateZIndexes();
            updateBookPosition();
        }
    }

    function flipPrev() {
        if (currentPage > 0) {
            currentPage--;
            // Прибираємо клас .flipped попередній сторінці
            pages[currentPage].classList.remove('flipped');
            
            updateZIndexes();
            updateBookPosition();
        }
    }

    // --- УПРАВЛІННЯ ГЛИБИНОЮ (Z-INDEX) ---

    function updateZIndexes() {
        // Це критична функція для коректного 3D відображення
        
        pages.forEach((page, index) => {
            let zIndex;

            if (index < currentPage) {
                // Сторінка зліва (вже перегорнута).
                // Чим більший індекс, тим вище вона лежить у лівому стосі.
                zIndex = index + 1; 
            } else {
                // Сторінка справа (ще не перегорнута).
                // Чим менший індекс, тим вище вона лежить у правому стосі.
                // (Сторінка 0 лежить поверх сторінки 1).
                zIndex = totalPages - index;
            }

            // Застосовуємо. 
            // Використовуємо таймаут для плавного переходу шарів під час анімації,
            // але для простоти і надійності тут ставимо відразу.
            // CSS transition-delay на z-index у файлі стилів зробить це плавним.
            page.style.zIndex = zIndex;
        });
    }

    // --- АДАПТИВНЕ ПОЗИЦІЮВАННЯ (MOBILE SHIFT) ---

    function updateBookPosition() {
        const isMobile = window.innerWidth < 900; // Поріг мобільної версії
        
        if (!isMobile) {
            // На ПК:
            // Якщо книга закрита (currentPage === 0), вона трохи зсунута вліво,
            // щоб корінець був по центру? Або просто по центру.
            // Якщо книга відкрита, вона стає ширшою (2 сторінки).
            
            if (currentPage === 0) {
                // Закрита книга -> зміщуємо трохи вправо, щоб виглядала по центру
                book.style.transform = 'translateX(25%)'; 
            } else if (currentPage === totalPages) {
                // Закрита задня обкладинка -> зміщуємо вліво
                book.style.transform = 'translateX(-25%)';
            } else {
                // Відкрита книга -> Центруємо корінець
                book.style.transform = 'translateX(0)';
            }
        } else {
            // На ТЕЛЕФОНІ (Ландшафт):
            // Ми показуємо тільки ОДНУ сторону.
            // Якщо ми на сторінці 0 (Обкладинка) -> показати праву частину.
            // Якщо ми перегорнули (стали на 1) -> ми бачимо ліву частину (зворот сторінки 0)
            // і праву частину (лице сторінки 1).
            
            // Але користувач не може бачити обидві.
            // Логіка: "Активна" сторінка має бути по центру.
            
            // Якщо currentPage = 0 -> Ми дивимось на Front Cover (це права частина книги).
            // Book container треба зсунути вліво (translateX -50% ширини книги).
            
            /* Оскільки transform-origin: left center, книга "росте" вправо від точки 0.
               Координата 0 - це корінець.
            */
            
            if (currentPage === 0) {
                // Бачимо обкладинку (вона справа від корінця)
                // Зсуваємо корінець вліво, щоб обкладинка стала по центру екрану
                 book.style.transform = 'translateX(-12vw)'; // Емпіричне значення для центрування
            } else if (currentPage === totalPages) {
                // Бачимо задню обкладинку (вона зліва від корінця, бо перегорнута)
                book.style.transform = 'translateX(62vw)';
            } else {
                // Книга розгорнута. Ми хочемо бачити контент.
                // Тут можна додати логіку "focus". 
                // Для простоти: центруємо корінець, користувач бачить дві половинки
                // обрізані краями екрану, і може трохи скролити пальцем (якщо ми дозволимо),
                // але в нашому CSS overflow:hidden.
                
                // Кращий UX для мобільного:
                // Завжди показувати ПРАВУ сторінку (нову), крім випадків повернення?
                // Ні, зробимо центрування корінця, так ми бачимо стик сторінок,
                // це найбільш "книжково".
                 book.style.transform = 'translateX(25vw)';
            }
        }
    }

    // Запуск
    init();
});