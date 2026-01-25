const fs = require('fs');
const path = require('path');

// Read index.html
const indexPath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// Write to public directory
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Copy all necessary files to public directory
fs.writeFileSync(path.join(publicDir, 'index.html'), html);
fs.copyFileSync(path.join(__dirname, 'app.js'), path.join(publicDir, 'app.js'));
fs.copyFileSync(path.join(__dirname, 'styles.css'), path.join(publicDir, 'styles.css'));

// Copy README if it exists
if (fs.existsSync(path.join(__dirname, 'README.md'))) {
  fs.copyFileSync(path.join(__dirname, 'README.md'), path.join(publicDir, 'README.md'));
}

console.log('✓ Build complete - files written to public/');
