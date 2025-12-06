/**
 * Blog Image Generator for Jengu
 * Creates branded blog images with logo overlay
 *
 * Usage: node scripts/generate-blog-images.cjs
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const OUTPUT_DIR = path.join(__dirname, '../public/images/blog');
const LOGO_PATH = path.join(__dirname, '../public/images/logo.png');

// Blog image configurations
const blogImages = [
  {
    name: 'best-ai-consultants-hospitality-2025',
    width: 1200,
    height: 630,
    lines: ['Best AI Consultants', 'for Hospitality 2025'],
    subtext: 'Expert Rankings and Comparison'
  },
  {
    name: 'how-to-choose-ai-consultant-hotels',
    width: 1200,
    height: 630,
    lines: ['How to Choose an', 'AI Consultant'],
    subtext: 'The Complete Hotel Guide'
  },
  {
    name: 'ai-transformation-hospitality-success-stories',
    width: 1200,
    height: 630,
    lines: ['AI Success Stories', 'in Hospitality'],
    subtext: 'Real ROI Data for 2025'
  }
];

async function generateGradientBackground(width, height) {
  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0a0a14" stop-opacity="1" />
        <stop offset="50%" stop-color="#1a1a2e" stop-opacity="1" />
        <stop offset="100%" stop-color="#0f0f1a" stop-opacity="1" />
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#grad)"/>
    <ellipse cx="200" cy="150" rx="300" ry="200" fill="#00d4ff" fill-opacity="0.15" />
    <ellipse cx="1000" cy="500" rx="400" ry="250" fill="#6366f1" fill-opacity="0.1" />
    <ellipse cx="600" cy="315" rx="200" ry="150" fill="#00d4ff" fill-opacity="0.05" />
  </svg>`;
  return Buffer.from(svg);
}

async function generateTextOverlay(lines, subtext, width, height) {
  const titleLines = lines.map((line, i) => {
    const y = 240 + (i * 80);
    return `<text x="80" y="${y}" fill="white" font-size="68" font-family="system-ui, -apple-system, BlinkMacSystemFont, sans-serif" font-weight="bold">${escapeXml(line)}</text>`;
  }).join('\n');

  const subtextY = 240 + (lines.length * 80) + 30;

  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    ${titleLines}
    <text x="80" y="${subtextY}" fill="#00d4ff" font-size="28" font-family="system-ui, -apple-system, BlinkMacSystemFont, sans-serif" font-weight="500">${escapeXml(subtext)}</text>
  </svg>`;
  return Buffer.from(svg);
}

function escapeXml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function generateBlogImage(config) {
  const { name, width, height, lines, subtext } = config;

  try {
    // Generate gradient background
    const background = await generateGradientBackground(width, height);

    // Generate text overlay
    const textOverlay = await generateTextOverlay(lines, subtext, width, height);

    // Load and resize logo
    const logo = await sharp(LOGO_PATH)
      .resize(160, 160, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();

    // Composite all layers
    const outputPath = path.join(OUTPUT_DIR, `${name}.webp`);

    await sharp(background)
      .composite([
        { input: textOverlay, top: 0, left: 0 },
        { input: logo, top: height - 180, left: width - 200 }
      ])
      .webp({ quality: 85 })
      .toFile(outputPath);

    console.log(`Created: ${outputPath}`);

    return outputPath;
  } catch (error) {
    console.error(`Error creating ${name}:`, error.message);
    throw error;
  }
}

async function main() {
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log('Generating blog images...\n');

  for (const config of blogImages) {
    await generateBlogImage(config);
  }

  console.log('\nAll blog images generated!');
  console.log('\n--- AI Image Generation Prompts (Optional) ---');
  console.log('\nFor photorealistic images, use these with free AI tools:');
  console.log('(Ideogram.ai, Leonardo.ai, or Microsoft Designer)\n');

  console.log('1. best-ai-consultants-hospitality-2025:');
  console.log('   "Modern luxury hotel lobby with holographic AI assistant, cyan and purple accent lighting, digital screens showing analytics, professional business setting, dark sophisticated atmosphere, photorealistic, 4K"');

  console.log('\n2. how-to-choose-ai-consultant-hotels:');
  console.log('   "Hotel manager reviewing AI consultant proposals on tablet in modern hotel office, digital screens with hotel data in background, professional business meeting, blue and cyan color scheme, contemporary design, photorealistic"');

  console.log('\n3. ai-transformation-hospitality-success-stories:');
  console.log('   "Successful hotel team celebrating with digital success metrics on screens around them, luxury hotel setting, happy diverse team, graphs showing upward trends, cyan blue accents, professional corporate photography style"');
}

main().catch(console.error);
