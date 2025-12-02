# Cloudflare API Setup Guide

This guide shows you how to enable performance optimizations via the Cloudflare API.

---

## Prerequisites

1. **Cloudflare API Token**
   - Go to https://dash.cloudflare.com/profile/api-tokens
   - Click **Create Token**
   - Use template: **Edit zone settings**
   - Or create custom token with permissions:
     - Zone → Zone Settings → Edit
   - Copy the generated token

2. **Zone ID**
   - Go to your Cloudflare dashboard
   - Click on your domain (or Pages project)
   - Find **Zone ID** in the right sidebar (under API section)
   - Copy the Zone ID

---

## Setup Instructions

### Option 1: Using Environment Variables (Recommended)

1. **Create a `.env` file** (Git-ignored for security):
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` file**:
   ```env
   CLOUDFLARE_API_TOKEN=your_actual_api_token_here
   CLOUDFLARE_ZONE_ID=your_actual_zone_id_here
   ```

3. **Run the setup script**:
   ```bash
   node cloudflare-api-setup.mjs
   ```

### Option 2: Using Command Line

Run with environment variables inline:

**Windows (PowerShell):**
```powershell
$env:CLOUDFLARE_API_TOKEN="your_token"; $env:CLOUDFLARE_ZONE_ID="your_zone_id"; node cloudflare-api-setup.mjs
```

**Mac/Linux (Bash):**
```bash
CLOUDFLARE_API_TOKEN="your_token" CLOUDFLARE_ZONE_ID="your_zone_id" node cloudflare-api-setup.mjs
```

### Option 3: Edit Script Directly (Not Recommended)

1. Open `cloudflare-api-setup.mjs`
2. Replace placeholders:
   ```javascript
   const CLOUDFLARE_API_TOKEN = 'your_actual_token';
   const ZONE_ID = 'your_actual_zone_id';
   ```
3. Run: `node cloudflare-api-setup.mjs`
4. **Important**: Don't commit this file with real credentials!

---

## What the Script Does

The script enables these optimizations:

### Core Performance Settings:
1. ✅ **Brotli Compression**
   - Reduces file sizes by 15-20% vs gzip
   - Works on modern browsers
   - Fallback to gzip for older browsers

2. ✅ **Auto Minify**
   - Minifies HTML files
   - Minifies CSS files
   - Minifies JavaScript files
   - Reduces bandwidth and improves load times

3. ✅ **HTTP/3 (with QUIC)**
   - Faster connection establishment
   - Better performance on unreliable networks
   - Reduced latency

### Additional Optimizations:
4. ✅ **Early Hints**
   - Sends resource hints before full response
   - Faster page rendering

5. ✅ **0-RTT (Zero Round Trip Time)**
   - Resumes TLS sessions faster
   - Reduces connection time for repeat visitors

6. ✅ **Always Online**
   - Serves cached version if origin is down
   - Better uptime for visitors

---

## Expected Output

When you run the script successfully, you'll see:

```
🚀 Cloudflare Performance Optimization Setup

==================================================

📋 Fetching zone information...

Zone Name: jengu.ai
Zone ID: abc123...
Status: active
Plan: Free

⚙️  Applying performance optimizations...

🔧 Enabling Brotli compression...
✅ Brotli compression enabled
🔧 Enabling Auto Minify (HTML, CSS, JS)...
✅ Auto Minify enabled for HTML, CSS, and JavaScript
🔧 Enabling HTTP/3 (with QUIC)...
✅ HTTP/3 (with QUIC) enabled

📊 Enabling additional optimizations...

🔧 Enabling Early Hints...
✅ Early Hints enabled
🔧 Enabling 0-RTT...
✅ 0-RTT enabled
🔧 Enabling Always Online...
✅ Always Online enabled

🔍 Verifying current settings...

brotli: "on"
minify: {"css":"on","html":"on","js":"on"}
http3: "on"
early_hints: "on"
0rtt: "on"
always_online: "on"

==================================================
✨ All performance optimizations applied successfully!
==================================================

📈 Expected improvements:
  • 15-20% smaller file sizes (Brotli)
  • Faster page loads (HTTP/3)
  • Reduced bandwidth usage (Auto Minify)
  • Better performance scores
```

---

## Troubleshooting

### Error: "Invalid API Token"
- Check your API token is correct
- Verify token has "Zone Settings Edit" permission
- Try creating a new token

### Error: "Zone not found"
- Verify your Zone ID is correct
- Check you have access to the zone
- Ensure the domain is active in Cloudflare

### Error: "Failed to fetch zone information"
- Check your internet connection
- Verify Cloudflare API is accessible
- Check for typos in token/zone ID

---

## Verifying Settings Manually

After running the script, you can verify in the Cloudflare Dashboard:

1. **Brotli**: Speed → Optimization → Brotli (should be ON)
2. **Auto Minify**: Speed → Optimization → Auto Minify (all 3 should be checked)
3. **HTTP/3**: Network → HTTP/3 (should be ON)

---

## Security Notes

⚠️ **Important Security Practices:**

1. **Never commit `.env` to git**
   - Already in `.gitignore`
   - Contains sensitive credentials

2. **Rotate API tokens regularly**
   - Create new tokens every few months
   - Delete old unused tokens

3. **Use minimal permissions**
   - Only grant "Zone Settings Edit"
   - Don't use "Global API Key"

4. **Store tokens securely**
   - Use environment variables
   - Don't share tokens in messages/emails
   - Don't hardcode in scripts

---

## Alternative: Manual Setup

If you prefer not to use the API, you can enable these settings manually:

### Via Cloudflare Dashboard:

1. **Log into Cloudflare**: https://dash.cloudflare.com
2. **Select your domain** (or Pages project)
3. **Go to Speed → Optimization**:
   - Toggle **Brotli** to ON
   - Check all boxes under **Auto Minify**
4. **Go to Network**:
   - Toggle **HTTP/3** to ON

Takes about 3-5 minutes manually.

---

## Next Steps

After enabling optimizations:

1. **Test your site**:
   ```bash
   # Run Lighthouse audit
   # Target: Performance 95+
   ```

2. **Verify compression**:
   ```bash
   # Check response headers
   curl -I https://your-site.pages.dev
   # Should see: content-encoding: br
   ```

3. **Monitor improvements**:
   - Check Cloudflare Analytics
   - Run PageSpeed Insights
   - Test on WebPageTest

---

## Additional Resources

- Cloudflare API Docs: https://developers.cloudflare.com/api/
- Performance Settings: https://developers.cloudflare.com/speed/optimization/
- Zone Settings API: https://developers.cloudflare.com/api/operations/zone-settings-list
