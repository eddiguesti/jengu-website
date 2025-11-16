// Helper script to extract CSS from landing-page.html
// Run with: node extract-css.js

const fs = require('fs');
const path = require('path');

const landingPagePath = path.join(__dirname, '..', 'landing-page.html');
const cssOutputPath = path.join(__dirname, 'src', 'styles', 'landing.css');

console.log('Reading landing-page.html...');
const html = fs.readFileSync(landingPagePath, 'utf8');

// Extract content between <style> and </style>
const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);

if (!styleMatch) {
  console.error('❌ Could not find <style> tags in landing-page.html');
  process.exit(1);
}

const css = styleMatch[1];

// Create styles directory if it doesn't exist
const stylesDir = path.dirname(cssOutputPath);
if (!fs.existsSync(stylesDir)) {
  fs.mkdirSync(stylesDir, { recursive: true });
}

// Write CSS file
fs.writeFileSync(cssOutputPath, css.trim(), 'utf8');

console.log('✅ CSS extracted successfully to:', cssOutputPath);
console.log(`📊 Extracted ${css.trim().split('\n').length} lines of CSS`);
