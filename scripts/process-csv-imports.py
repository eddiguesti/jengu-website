#!/usr/bin/env python3
"""
Easy CSV to Blog Converter - Just drop CSV files in docs/csv-imports/ and run this script!

Usage:
    python scripts/process-csv-imports.py

The script will automatically:
1. Find all CSV files in docs/csv-imports/
2. Detect if it's a blog or news file (based on columns)
3. Convert to markdown files in the correct content folder
4. Move processed CSV to docs/csv-imports/processed/
"""

import csv
import os
import re
import shutil
from datetime import datetime
from pathlib import Path

def slugify(text):
    """Convert text to URL-friendly slug."""
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text)
    return text

def parse_date(date_str):
    """Parse date string from various formats."""
    if not date_str:
        return datetime.now().strftime('%Y-%m-%d')

    try:
        # Format: "Thu Feb 13 2025 16:28:49 GMT+0000 (Coordinated Universal Time)"
        date_part = ' '.join(date_str.split()[:4])
        return datetime.strptime(date_part, '%a %b %d %Y').strftime('%Y-%m-%d')
    except:
        try:
            # Format: YYYY-MM-DD
            return datetime.strptime(date_str, '%Y-%m-%d').strftime('%Y-%m-%d')
        except:
            return datetime.now().strftime('%Y-%m-%d')

def clean_content(html):
    """Clean and format content."""
    if not html:
        return ""
    html = re.sub(r'\n\s*\n', '\n\n', html)
    return html.strip()

def escape_yaml_string(text):
    """Escape special characters in YAML strings."""
    if not text:
        return '""'
    text = text.replace('"', '\\"')
    if any(char in text for char in [':', '#', '-', '>', '|', '[', ']', '{', '}', '&', '*', '!', '\n']):
        return f'"{text}"'
    return f'"{text}"'

def is_blog_csv(headers):
    """Detect if CSV is a blog file."""
    blog_indicators = ['Title', 'Main Content', 'Published On']
    return all(h in headers for h in blog_indicators)

def is_news_csv(headers):
    """Detect if CSV is a news file."""
    news_indicators = ['Title', 'Source', 'News date']
    return any(h in headers for h in news_indicators)

def convert_to_markdown(csv_path, content_type):
    """Convert CSV file to markdown files."""
    output_dir = Path(__file__).parent.parent / 'src' / 'content' / content_type
    output_dir.mkdir(parents=True, exist_ok=True)

    print(f"\n📄 Processing: {csv_path.name}")
    print(f"   Type: {content_type}")

    with open(csv_path, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        count = 0

        for row in reader:
            # Skip archived or draft posts if specified
            if row.get('Archived', 'false').lower() == 'true':
                continue

            slug = row.get('Slug', slugify(row.get('Title', 'untitled')))

            # Build frontmatter based on content type
            if content_type == 'blog':
                frontmatter = f"""---
title: {escape_yaml_string(row.get('Title', 'Untitled'))}
subtitle: {escape_yaml_string(row.get('Sub title', ''))}
description: {escape_yaml_string(row.get('Short', ''))}
publishedOn: {parse_date(row.get('Published On', ''))}
updatedOn: {parse_date(row.get('Updated On', row.get('Published On', '')))}
mainImage: {escape_yaml_string(row.get('Main image', ''))}
thumbnail: {escape_yaml_string(row.get('thumbnail', ''))}
altText: {escape_yaml_string(row.get('alt text (main IMage)', ''))}
draft: {row.get('Draft', 'false').lower()}
archived: {row.get('Archived', 'false').lower()}
---

"""
            else:  # news
                frontmatter = f"""---
title: {escape_yaml_string(row.get('Title', 'Untitled'))}
subtitle: {escape_yaml_string(row.get('Sub title', ''))}
description: {escape_yaml_string(row.get('Short', ''))}
publishedOn: {parse_date(row.get('Published On', ''))}
updatedOn: {parse_date(row.get('Updated On', row.get('Published On', '')))}
mainImage: {escape_yaml_string(row.get('Main image', ''))}
thumbnail: {escape_yaml_string(row.get('thumbnail', ''))}
altTextThumbnail: {escape_yaml_string(row.get('alt text thumbnail', ''))}
altTextMainImage: {escape_yaml_string(row.get('alt text main image', ''))}
source: {escape_yaml_string(row.get('Source', ''))}
newsDate: {parse_date(row.get('News date', row.get('Published On', '')))}
draft: {row.get('Draft', 'false').lower()}
archived: {row.get('Archived', 'false').lower()}
---

"""

            # Add main content
            content = clean_content(row.get('Main Content', ''))

            # Write to file
            output_path = output_dir / f"{slug}.md"
            with open(output_path, 'w', encoding='utf-8') as out_file:
                out_file.write(frontmatter + content)

            count += 1

    print(f"   ✅ Created {count} {content_type} posts")
    return count

def main():
    # Setup paths
    base_dir = Path(__file__).parent.parent
    import_dir = base_dir / 'docs' / 'csv-imports'
    processed_dir = import_dir / 'processed'

    # Create directories
    import_dir.mkdir(parents=True, exist_ok=True)
    processed_dir.mkdir(parents=True, exist_ok=True)

    print("=" * 70)
    print("🚀 JENGU.AI CSV IMPORT PROCESSOR")
    print("=" * 70)
    print(f"\n📁 Looking for CSV files in: {import_dir}")

    # Find all CSV files
    csv_files = list(import_dir.glob('*.csv'))

    if not csv_files:
        print("\n⚠️  No CSV files found!")
        print(f"\n💡 To use this tool:")
        print(f"   1. Drop your CSV files in: {import_dir}")
        print(f"   2. Run: python scripts/process-csv-imports.py")
        print(f"   3. Files will be converted and moved to: {processed_dir}")
        return

    print(f"\n📊 Found {len(csv_files)} CSV file(s)")

    total_posts = 0

    # Process each CSV file
    for csv_file in csv_files:
        try:
            # Read headers to detect type
            with open(csv_file, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                headers = reader.fieldnames

            # Determine content type
            if is_news_csv(headers):
                content_type = 'news'
            elif is_blog_csv(headers):
                content_type = 'blog'
            else:
                print(f"\n⚠️  Skipping {csv_file.name}: Unable to detect type")
                continue

            # Convert to markdown
            count = convert_to_markdown(csv_file, content_type)
            total_posts += count

            # Move to processed folder
            dest = processed_dir / csv_file.name
            # If file exists, add timestamp
            if dest.exists():
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                stem = dest.stem
                dest = processed_dir / f"{stem}_{timestamp}.csv"

            shutil.move(str(csv_file), str(dest))
            print(f"   📦 Moved to: processed/{dest.name}")

        except Exception as e:
            print(f"\n❌ Error processing {csv_file.name}: {e}")

    print("\n" + "=" * 70)
    print(f"✅ COMPLETE! Processed {total_posts} total posts")
    print("=" * 70)
    print("\n💡 Next steps:")
    print("   - Your markdown files are in src/content/blog/ or src/content/news/")
    print("   - Astro will automatically detect them")
    print("   - Refresh your browser to see new posts")
    print(f"   - Processed CSV files moved to: {processed_dir}")

if __name__ == "__main__":
    main()
