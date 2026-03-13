const fs = require('fs');
const path = require('path');

const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="64" fill="#16a34a"/>
  <text x="256" y="300" font-family="Arial,sans-serif" font-size="240" font-weight="bold" text-anchor="middle" fill="white">W</text>
</svg>`;

const publicDir = path.join(__dirname, '..', 'public');

// Write SVG versions that will work as PWA icons
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), svgIcon);
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), svgIcon);
fs.writeFileSync(path.join(publicDir, 'pwa-icon.svg'), svgIcon);

console.log('PWA icon files created (SVG-based)');
