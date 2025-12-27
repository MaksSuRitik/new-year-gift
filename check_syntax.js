const fs = require('fs');
const path = 'app/js/dance.js';
const s = fs.readFileSync(path, 'utf8');
const count = (c) => s.split(c).length - 1;
console.log('file:', path);
console.log('curly {', count('{'), ' }', count('}'));
console.log('paren (', count('('), ' )', count(')'));
console.log('bracket [', count('['), ' ]', count(']'));
console.log('backtick `', count('`'));
console.log('template ${', count('${'));
// show last 200 chars for quick visual
console.log('\n--- tail ---\n' + s.slice(-800));
