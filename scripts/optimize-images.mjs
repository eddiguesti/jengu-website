import sharp from 'sharp';
import { readdir } from 'fs/promises';
import { join, parse } from 'path';
import { existsSync } from 'fs';

const imagesDir = './public/images';
const quality = 85; // WebP quality (0-100)

async function optimizeImages() {
  try {
    const files = await readdir(imagesDir);
    const imageFiles = files.filter(file =>
      file.match(/\.(png|jpg|jpeg)$/i) && !file.startsWith('Screenshot')
    );

    console.log(`Found ${imageFiles.length} images to optimize\n`);

    for (const file of imageFiles) {
      const inputPath = join(imagesDir, file);
      const { name } = parse(file);
      const webpPath = join(imagesDir, `${name}.webp`);

      // Skip if WebP already exists
      if (existsSync(webpPath)) {
        console.log(`⏭️  Skipping ${file} (WebP already exists)`);
        continue;
      }

      try {
        // Convert to WebP
        await sharp(inputPath)
          .webp({ quality, effort: 6 }) // effort: 0-6 (6 = best compression, slower)
          .toFile(webpPath);

        // Also optimize the original PNG/JPG
        await sharp(inputPath)
          .png({ quality, compressionLevel: 9 })
          .jpeg({ quality, mozjpeg: true })
          .toFile(inputPath + '.optimized');

        // Get file sizes
        const originalSize = (await sharp(inputPath).metadata()).size;
        const webpSize = (await sharp(webpPath).metadata()).size;
        const savings = ((1 - webpSize / originalSize) * 100).toFixed(1);

        console.log(`✅ ${file} → ${name}.webp (${savings}% smaller)`);
      } catch (err) {
        console.error(`❌ Error processing ${file}:`, err.message);
      }
    }

    console.log('\n✨ Image optimization complete!');
    console.log('\nNote: Original PNG/JPG files are kept as fallbacks.');
    console.log('WebP files will be served to modern browsers automatically.');
  } catch (err) {
    console.error('Error reading images directory:', err);
  }
}

optimizeImages();
