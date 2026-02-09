# Automated Daily Blog Generation

This system automatically generates SEO-optimized blog posts daily using Claude AI.

## Overview

- **Schedule**: Runs daily at 8 AM UTC via GitHub Actions
- **Content**: AI-generated posts targeting hospitality/AI keywords
- **Topics**: Hotels, campsites, resorts, vacation rentals, and hospitality tech

## Setup (One-Time)

### 1. Add Anthropic API Key to GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `ANTHROPIC_API_KEY`
5. Value: Your Anthropic API key (get one at https://console.anthropic.com/)

### 2. Install Dependencies Locally (Optional)

```bash
npm install
```

## Usage

### Automatic (Scheduled)

The GitHub Action runs daily and:
1. Generates a new SEO-optimized blog post
2. Commits it to the `main` branch
3. Cloudflare automatically rebuilds and deploys

### Manual Trigger

**From GitHub:**
1. Go to **Actions** → **Daily Blog Post Generator**
2. Click **Run workflow**
3. Optionally enable "Dry run" to generate without committing

**Locally:**
```bash
# Set your API key
export ANTHROPIC_API_KEY=your-key-here

# Generate a post
npm run generate-blog
```

## SEO Keywords Covered

The system rotates through 40+ high-value keywords including:

**Hotel Keywords:**
- AI chatbot for hotels
- hotel automation software
- AI concierge service
- smart hotel technology
- hotel revenue management AI
- automated hotel check-in

**Campsite Keywords:**
- campsite booking software
- campground management AI
- glamping automation
- RV park management software
- holiday park automation

**General Hospitality:**
- hospitality AI solutions
- vacation rental automation
- hospitality chatbot
- AI pricing optimization hotel
- contactless hospitality

## Customization

### Add New Keywords/Topics

Edit [scripts/generate-daily-blog.mjs](../scripts/generate-daily-blog.mjs) and add to the `SEO_TOPICS` array:

```javascript
{
  keyword: "your target keyword",
  topic: "Description of the blog topic to write about"
}
```

### Change Schedule

Edit [.github/workflows/daily-blog.yml](../.github/workflows/daily-blog.yml):

```yaml
schedule:
  - cron: '0 8 * * *'  # 8 AM UTC daily
```

Common schedules:
- `'0 8 * * *'` - Daily at 8 AM UTC
- `'0 8 * * 1-5'` - Weekdays only at 8 AM UTC
- `'0 8 * * 1,3,5'` - Mon, Wed, Fri at 8 AM UTC

### Adjust Content Style

Modify the prompt in `generateBlogPost()` function to change:
- Writing tone
- Article length
- Section structure
- Call-to-action style

## Monitoring

### Check Workflow Status

1. Go to **Actions** tab in GitHub
2. Click on "Daily Blog Post Generator"
3. View run history and logs

### Failed Runs

Common issues:
- **API key not set**: Add `ANTHROPIC_API_KEY` to GitHub Secrets
- **API quota exceeded**: Check your Anthropic usage limits
- **Build failure**: Review the workflow logs

## Cost Estimate

Each blog post uses approximately:
- ~4,000 tokens input
- ~2,500 tokens output
- **Cost**: ~$0.02-0.04 per post with Claude Sonnet

Monthly (30 posts): ~$0.60-1.20

## Files

| File | Purpose |
|------|---------|
| [scripts/generate-daily-blog.mjs](../scripts/generate-daily-blog.mjs) | Main generation script |
| [.github/workflows/daily-blog.yml](../.github/workflows/daily-blog.yml) | GitHub Actions workflow |
| [package.json](../package.json) | NPM scripts and dependencies |

## Troubleshooting

**"ANTHROPIC_API_KEY not set"**
- Locally: `export ANTHROPIC_API_KEY=your-key`
- GitHub: Add secret in repository settings

**"No new file generated"**
- Check if a similar post already exists
- Review the topic selection logic

**Posts not deploying**
- Verify Cloudflare is connected to your GitHub repo
- Check the Cloudflare Pages dashboard for build status
