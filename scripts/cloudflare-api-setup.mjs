/**
 * Cloudflare API Configuration Script
 * Enables performance optimizations via API
 *
 * IMPORTANT: Keep your API token secure!
 * Never commit this file with real credentials to git.
 */

// Configuration
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || 'YOUR_API_TOKEN_HERE';
const ZONE_ID = process.env.CLOUDFLARE_ZONE_ID || 'YOUR_ZONE_ID_HERE';

const CLOUDFLARE_API = 'https://api.cloudflare.com/client/v4';

// Headers for API requests
const headers = {
  'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
  'Content-Type': 'application/json'
};

/**
 * Make API request to Cloudflare
 */
async function cfRequest(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${CLOUDFLARE_API}${endpoint}`, options);
    const data = await response.json();

    if (!data.success) {
      console.error('❌ API Error:', data.errors);
      return null;
    }

    return data.result;
  } catch (error) {
    console.error('❌ Request failed:', error.message);
    return null;
  }
}

/**
 * Enable Brotli compression
 */
async function enableBrotli() {
  console.log('🔧 Enabling Brotli compression...');

  const result = await cfRequest(
    `/zones/${ZONE_ID}/settings/brotli`,
    'PATCH',
    { value: 'on' }
  );

  if (result) {
    console.log('✅ Brotli compression enabled');
  }
}

/**
 * Enable Auto Minify (HTML, CSS, JS)
 */
async function enableAutoMinify() {
  console.log('🔧 Enabling Auto Minify (HTML, CSS, JS)...');

  const result = await cfRequest(
    `/zones/${ZONE_ID}/settings/minify`,
    'PATCH',
    {
      value: {
        css: 'on',
        html: 'on',
        js: 'on'
      }
    }
  );

  if (result) {
    console.log('✅ Auto Minify enabled for HTML, CSS, and JavaScript');
  }
}

/**
 * Enable HTTP/3
 */
async function enableHTTP3() {
  console.log('🔧 Enabling HTTP/3 (with QUIC)...');

  const result = await cfRequest(
    `/zones/${ZONE_ID}/settings/http3`,
    'PATCH',
    { value: 'on' }
  );

  if (result) {
    console.log('✅ HTTP/3 (with QUIC) enabled');
  }
}

/**
 * Enable additional performance optimizations
 */
async function enableAdditionalOptimizations() {
  console.log('\n📊 Enabling additional optimizations...\n');

  // Enable Early Hints
  console.log('🔧 Enabling Early Hints...');
  await cfRequest(
    `/zones/${ZONE_ID}/settings/early_hints`,
    'PATCH',
    { value: 'on' }
  );
  console.log('✅ Early Hints enabled');

  // Enable 0-RTT
  console.log('🔧 Enabling 0-RTT...');
  await cfRequest(
    `/zones/${ZONE_ID}/settings/0rtt`,
    'PATCH',
    { value: 'on' }
  );
  console.log('✅ 0-RTT enabled');

  // Enable Always Online
  console.log('🔧 Enabling Always Online...');
  await cfRequest(
    `/zones/${ZONE_ID}/settings/always_online`,
    'PATCH',
    { value: 'on' }
  );
  console.log('✅ Always Online enabled');
}

/**
 * Get current zone information
 */
async function getZoneInfo() {
  console.log('📋 Fetching zone information...\n');

  const zone = await cfRequest(`/zones/${ZONE_ID}`);

  if (zone) {
    console.log(`Zone Name: ${zone.name}`);
    console.log(`Zone ID: ${zone.id}`);
    console.log(`Status: ${zone.status}`);
    console.log(`Plan: ${zone.plan.name}\n`);
    return zone;
  }

  return null;
}

/**
 * Verify current settings
 */
async function verifySettings() {
  console.log('\n🔍 Verifying current settings...\n');

  const settings = [
    'brotli',
    'minify',
    'http3',
    'early_hints',
    '0rtt',
    'always_online'
  ];

  for (const setting of settings) {
    const result = await cfRequest(`/zones/${ZONE_ID}/settings/${setting}`);
    if (result) {
      console.log(`${setting}: ${JSON.stringify(result.value)}`);
    }
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Cloudflare Performance Optimization Setup\n');
  console.log('='.repeat(50) + '\n');

  // Validate credentials
  if (CLOUDFLARE_API_TOKEN === 'YOUR_API_TOKEN_HERE' || ZONE_ID === 'YOUR_ZONE_ID_HERE') {
    console.error('❌ Error: Please set your Cloudflare credentials!');
    console.error('\nYou can either:');
    console.error('1. Set environment variables:');
    console.error('   export CLOUDFLARE_API_TOKEN="your_token"');
    console.error('   export CLOUDFLARE_ZONE_ID="your_zone_id"');
    console.error('\n2. Or edit this file and replace the placeholder values\n');
    process.exit(1);
  }

  // Get zone info
  const zone = await getZoneInfo();
  if (!zone) {
    console.error('❌ Failed to fetch zone information. Check your credentials.');
    process.exit(1);
  }

  console.log('⚙️  Applying performance optimizations...\n');

  // Core optimizations
  await enableBrotli();
  await enableAutoMinify();
  await enableHTTP3();

  // Additional optimizations
  await enableAdditionalOptimizations();

  // Verify all settings
  await verifySettings();

  console.log('\n' + '='.repeat(50));
  console.log('✨ All performance optimizations applied successfully!');
  console.log('='.repeat(50) + '\n');

  console.log('📈 Expected improvements:');
  console.log('  • 15-20% smaller file sizes (Brotli)');
  console.log('  • Faster page loads (HTTP/3)');
  console.log('  • Reduced bandwidth usage (Auto Minify)');
  console.log('  • Better performance scores\n');
}

// Run the script
main().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
