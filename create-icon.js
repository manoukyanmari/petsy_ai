/**
 * Generate app icon from emoji
 * Creates icon.png with a dog emoji centered on transparent background
 */
import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.join(__dirname, 'assets');

// Ensure assets directory exists
if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
}

const size = 512;
const canvas = createCanvas(size, size);
const ctx = canvas.getContext('2d');

// Transparent background
ctx.clearRect(0, 0, size, size);

// Draw dog emoji
ctx.font = `bold ${Math.floor(size * 0.8)}px Arial`;
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('🐕', size / 2, size / 2);

// Save as PNG
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync(path.join(assetsDir, 'icon.png'), buffer);

console.log('✅ Dog emoji icon created: assets/icon.png');
