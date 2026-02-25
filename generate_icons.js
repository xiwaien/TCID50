const fs = require('fs');
const path = require('path');

const base64Png = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="; // 1x1 transparent png
const buffer = Buffer.from(base64Png, 'base64');

const icons = [
    'home.png', 'home_active.png',
    'scan.png', 'scan_active.png',
    'history.png', 'history_active.png'
];

const dir = path.join(__dirname, 'assets', 'icons');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

icons.forEach(icon => {
    fs.writeFileSync(path.join(dir, icon), buffer);
});
console.log('Icons generated.');
