# CSV Import Folder

Drop your blog or news CSV files here to convert them to markdown posts!

## 📋 Quick Start

1. **Drop CSV file** into this folder (`docs/csv-imports/`)
2. **Run the conversion script**:
   ```bash
   python scripts/process-csv-imports.py
   ```
3. **Done!** Your posts are now in `src/content/blog/` or `src/content/news/`

## 📊 CSV Format Requirements

### For Blog Posts

Your CSV must have these columns:
- `Title` - Blog post title (required)
- `Short` - Short description/excerpt
- `Main Content` - Full blog post content (HTML/Markdown)
- `Published On` - Publication date
- `Slug` - URL-friendly identifier (auto-generated if missing)

Optional columns:
- `Sub title` - Subtitle
- `Updated On` - Last update date
- `Main image` - Main image URL
- `thumbnail` - Thumbnail image URL
- `alt text (main IMage)` - Alt text for image
- `Draft` - Set to "true" to mark as draft
- `Archived` - Set to "true" to archive

### For News Articles

Your CSV must have these columns:
- `Title` - News article title (required)
- `Source` - News source
- `News date` - Date of the news
- `Short` - Short description
- `Main Content` - Full article content

Optional columns: (same as blog posts, plus)
- `alt text thumbnail` - Alt text for thumbnail
- `alt text main image` - Alt text for main image

## 🔄 What Happens During Processing

1. **Auto-Detection**: Script detects if CSV is blog or news content
2. **Conversion**: Creates markdown files with proper frontmatter
3. **File Naming**: Generates URL-friendly slugs automatically
4. **Archival**: Moves processed CSV to `docs/csv-imports/processed/`

## 📁 After Processing

- **Markdown files** → Created in `src/content/blog/` or `src/content/news/`
- **Original CSV** → Moved to `docs/csv-imports/processed/`
- **Astro** → Automatically detects new files (no restart needed in dev mode)

## 💡 Tips

- You can drop multiple CSV files at once
- Files are automatically categorized as blog or news
- Duplicate file names get timestamped to avoid conflicts
- CSV files in `processed/` folder are kept for your records

## 🆘 Troubleshooting

**"No CSV files found"**
- Make sure your CSV file is directly in `docs/csv-imports/` (not in a subfolder)
- Check that the file extension is `.csv`

**"Unable to detect type"**
- Verify your CSV has the required columns (Title, Main Content, etc.)
- Check that column names match exactly (case-sensitive)

**Posts not appearing on website**
- Check that `draft: false` and `archived: false` in the generated markdown
- Refresh your browser
- Check console for any Astro errors
