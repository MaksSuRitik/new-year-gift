const { src, dest, watch, parallel, series } = require('gulp');

const scss          = require('gulp-sass')(require('sass'));
const autoprefixer  = require('gulp-autoprefixer');
const browserSync   = require('browser-sync').create();

// 1. ЗАДАЧА: Перетворення SCSS -> CSS
function styles() {
    return src('app/scss/style.scss') // Беремо файл звідси
        .pipe(scss({ outputStyle: 'expanded' })) // Компілюємо красиво
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 version'],
            grid: true
        })) // Додаємо префікси для сумісності
        .pipe(dest('app/css')) // Кладемо готовий файл у папку css
        .pipe(browserSync.stream()); // Оновлюємо стилі в браузері
}

// 2. ЗАДАЧА: Слідкування за файлами
function watching() {
    watch(['app/scss/**/*.scss'], styles); // Якщо змінився стиль -> запустити styles
    watch(['app/js/**/*.js']).on('change', browserSync.reload); // Якщо JS -> перезавантажити
    watch(['app/*.html']).on('change', browserSync.reload); // Якщо HTML -> перезавантажити
}

// 3. ЗАДАЧА: Локальний сервер
function browsersync() {
    browserSync.init({
        server: {
            baseDir: "app/" // Папка, яку показувати у браузері
        }
    });
}

// Експорт задач (щоб Gulp їх бачив)
exports.styles = styles;
exports.watching = watching;
exports.browsersync = browsersync;

// ЗАДАЧА ЗА ЗАМОВЧУВАННЯМ (запуск командою 'gulp')
exports.default = parallel(styles, browsersync, watching);