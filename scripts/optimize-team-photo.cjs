/**
 * Team Photo Optimization Script
 * Converts danny-smith.jpg (646KB) to optimized WebP versions
 * Target: ~30KB for nav logo (displayed at 36-63px)
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const inputPath = path.join(__dirname, '../public/images/team/danny-smith.jpg');
const outputDir = path.join(__dirname, '../public/images/team');

async function optimizeTeamPhoto() {
  console.log('Optimizing team photo...');

  // Check if input exists
  if (!fs.existsSync(inputPath)) {
    console.error('Input file not found:', inputPath);
    process.exit(1);
  }

  const metadata = await sharp(inputPath).metadata();
  console.log(`Original: ${metadata.width}x${metadata.height}`);

  // Create multiple sizes for srcset
  const sizes = [
    { width: 64, suffix: '-64' },   // 1x for 64px display
    { width: 128, suffix: '-128' }, // 2x for 64px display (retina)
    { width: 256, suffix: '-256' }, // 4x for highest quality
  ];

  for (const size of sizes) {
    // WebP version (primary)
    const webpOutput = path.join(outputDir, `danny-smith${size.suffix}.webp`);
    await sharp(inputPath)
      .resize(size.width, size.width, { fit: 'cover' })
      .webp({ quality: 85 })
      .toFile(webpOutput);

    const webpStats = fs.statSync(webpOutput);
    console.log(`Created ${webpOutput}: ${(webpStats.size / 1024).toFixed(2)} KB`);

    // JPEG fallback
    const jpgOutput = path.join(outputDir, `danny-smith${size.suffix}.jpg`);
    await sharp(inputPath)
      .resize(size.width, size.width, { fit: 'cover' })
      .jpeg({ quality: 85, mozjpeg: true })
      .toFile(jpgOutput);

    const jpgStats = fs.statSync(jpgOutput);
    console.log(`Created ${jpgOutput}: ${(jpgStats.size / 1024).toFixed(2)} KB`);
  }

  console.log('\nOptimization complete!');
  console.log('Original file size:', (fs.statSync(inputPath).size / 1024).toFixed(2), 'KB');
}

optimizeTeamPhoto().catch(console.error);
