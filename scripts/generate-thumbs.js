#!/usr/bin/env node
/**
 * generate-thumbs.js
 * 簡單腳本：掃描 src/assets/*.png 或 .jpg，為每張圖產生 64x64 縮圖到 src/assets/thumbs/
 * 需要安裝 sharp（npm install --save-dev sharp）
 */
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ASSETS_DIR = path.resolve(__dirname, '../src/assets');
const OUT_DIR = path.join(ASSETS_DIR, 'thumbs');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const exts = ['.png', '.jpg', '.jpeg', '.webp'];

function isImage(file) {
  return exts.includes(path.extname(file).toLowerCase());
}

const files = fs.readdirSync(ASSETS_DIR);
for (const file of files) {
  const full = path.join(ASSETS_DIR, file);
  const stat = fs.statSync(full);
  if (stat.isFile() && isImage(file)) {
    const outName = path.join(OUT_DIR, file);
    try {
      await sharp(full)
        .resize(64, 64, { fit: 'cover' })
        .toFile(outName);
      console.log('Thumb created:', outName);
    } catch (e) {
      console.error('Failed to create thumb for', full, e.message);
    }
  }
}
