import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputPath = path.join(__dirname, '7058f572-6ab0-48e4-9191-28d3ce1e7eb7.png');
const outputPath = path.join(__dirname, 'public', 'images', 'blog', 'best-ai-for-tourism-2025.webp');
const outputPathJpg = path.join(__dirname, 'public', 'images', 'blog', 'best-ai-for-tourism-2025.jpg');

async function compressImage() {
  try {
    // Ensure directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Create WebP version (good quality, ~100-200KB target)
    await sharp(inputPath)
      .resize(1200, null, { withoutEnlargement: true })
      .webp({ quality: 75 })
      .toFile(outputPath);

    // Create JPG fallback version
    await sharp(inputPath)
      .resize(1200, null, { withoutEnlargement: true })
      .jpeg({ quality: 70, mozjpeg: true })
      .toFile(outputPathJpg);

    const originalSize = fs.statSync(inputPath).size;
    const webpSize = fs.statSync(outputPath).size;
    const jpgSize = fs.statSync(outputPathJpg).size;

    console.log(`Original: ${(originalSize / 1024).toFixed(1)} KB`);
    console.log(`WebP: ${(webpSize / 1024).toFixed(1)} KB (${((1 - webpSize/originalSize) * 100).toFixed(1)}% reduction)`);
    console.log(`JPG: ${(jpgSize / 1024).toFixed(1)} KB (${((1 - jpgSize/originalSize) * 100).toFixed(1)}% reduction)`);
    console.log(`\nImages saved to:`);
    console.log(`- ${outputPath}`);
    console.log(`- ${outputPathJpg}`);
  } catch (err) {
    console.error('Error:', err);
  }
}

compressImage();
