// Generate minimal valid PNG placeholder images
const fs = require('fs');
const path = require('path');

// Base64 encoded valid 1x1 pixel PNG
const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
const pngBuffer = Buffer.from(pngBase64, 'base64');

const assetsDir = path.join(__dirname, 'assets');
const files = ['icon.png', 'adaptive-icon.png', 'splash.png'];

files.forEach(f => {
  const fp = path.join(assetsDir, f);
  fs.writeFileSync(fp, pngBuffer);
  console.log('Created:', fp, '-', fs.statSync(fp).size, 'bytes');
});

console.log('Done generating placeholder assets.');
