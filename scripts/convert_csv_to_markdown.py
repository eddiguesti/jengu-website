#!/usr/bin/env python3
"""
Convert Jengu.ai CSV files (Blogs and News) to Astro markdown files with frontmatter.
Follows best practices for content collections in Astro.
"""

import csv
import os
import re
from datetime import datetime
from pathlib import Path

def slugify(text):
    """Convert text to URL-friendly slug."""
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text)
    return text

def parse_date(date_str):
    """Parse date string from CSV format."""
    try:
        # Format: "Thu Feb 13 2025 16:28:49 GMT+0000 (Coordinated Universal Time)"
        date_part = ' '.join(date_str.split()[:4])
        return datetime.strptime(date_part, '%a %b %d %Y').strftime('%Y-%m-%d')
    except:
        return datetime.now().strftime('%Y-%m-%d')

def clean_html_content(html):
    """Clean and format HTML content."""
    if not html:
        return ""
    # Remove excessive newlines
    html = re.sub(r'\n\s*\n', '\n\n', html)
    return html.strip()

def escape_yaml_string(text):
    """Escape special characters in YAML strings."""
    if not text:
        return '""'
    # Replace quotes and add quotes if contains special chars
    text = text.replace('"', '\\"')
    if any(char in text for char in [':', '#', '-', '>', '|', '[', ']', '{', '}', '&', '*', '!', '\n']):
        return f'"{text}"'
    return f'"{text}"'

def convert_blog_csv(csv_path, output_dir):
    """Convert blogs CSV to markdown files."""
    print(f"Converting blogs from {csv_path}...")

    with open(csv_path, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        count = 0

        for row in reader:
            # Skip archived or draft posts
            if row.get('Archived', 'false').lower() == 'true':
                continue

            slug = row.get('Slug', slugify(row.get('Title', 'untitled')))

            # Create frontmatter
            frontmatter = f"""---
title: {escape_yaml_string(row.get('Title', 'Untitled'))}
subtitle: {escape_yaml_string(row.get('Sub title', ''))}
description: {escape_yaml_string(row.get('Short', ''))}
publishedOn: {parse_date(row.get('Published On', ''))}
updatedOn: {parse_date(row.get('Updated On', ''))}
mainImage: {escape_yaml_string(row.get('Main image', ''))}
thumbnail: {escape_yaml_string(row.get('thumbnail', ''))}
altText: {escape_yaml_string(row.get('alt text (main IMage)', ''))}
draft: {row.get('Draft', 'false').lower()}
archived: {row.get('Archived', 'false').lower()}
---

"""

            # Add main content
            content = clean_html_content(row.get('Main Content', ''))

            # Write to file
            output_path = Path(output_dir) / f"{slug}.md"
            with open(output_path, 'w', encoding='utf-8') as out_file:
                out_file.write(frontmatter + content)

            count += 1
            if count % 100 == 0:
                print(f"  Processed {count} blog posts...")

    print(f"[OK] Converted {count} blog posts to {output_dir}")
    return count

def convert_news_csv(csv_path, output_dir):
    """Convert news CSV to markdown files."""
    print(f"Converting news from {csv_path}...")

    with open(csv_path, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        count = 0

        for row in reader:
            # Skip archived or draft posts
            if row.get('Archived', 'false').lower() == 'true':
                continue

            slug = row.get('Slug', slugify(row.get('Title', 'untitled')))

            # Create frontmatter
            frontmatter = f"""---
title: {escape_yaml_string(row.get('Title', 'Untitled'))}
subtitle: {escape_yaml_string(row.get('Sub title', ''))}
description: {escape_yaml_string(row.get('Short', ''))}
publishedOn: {parse_date(row.get('Published On', ''))}
updatedOn: {parse_date(row.get('Updated On', ''))}
mainImage: {escape_yaml_string(row.get('Main image', ''))}
thumbnail: {escape_yaml_string(row.get('thumbnail', ''))}
altTextThumbnail: {escape_yaml_string(row.get('alt text thumbnail', ''))}
altTextMainImage: {escape_yaml_string(row.get('alt text main image', ''))}
source: {escape_yaml_string(row.get('Source', ''))}
newsDate: {parse_date(row.get('News date', ''))}
draft: {row.get('Draft', 'false').lower()}
archived: {row.get('Archived', 'false').lower()}
---

"""

            # Add main content
            content = clean_html_content(row.get('Main Content', ''))

            # Write to file
            output_path = Path(output_dir) / f"{slug}.md"
            with open(output_path, 'w', encoding='utf-8') as out_file:
                out_file.write(frontmatter + content)

            count += 1
            if count % 100 == 0:
                print(f"  Processed {count} news articles...")

    print(f"[OK] Converted {count} news articles to {output_dir}")
    return count

def main():
    # Paths
    base_dir = Path(r"C:\Users\eddgu\Documents\jengu astro website")
    blog_csv = base_dir / "Jengu.ai - Blogs.csv"
    news_csv = base_dir / "Jengu.ai - News.csv"

    output_base = Path(r"C:\Users\eddgu\Documents\jengu astro website\src\content")
    blog_output = output_base / "blog"
    news_output = output_base / "news"

    # Create output directories
    blog_output.mkdir(parents=True, exist_ok=True)
    news_output.mkdir(parents=True, exist_ok=True)

    print("=" * 60)
    print("Jengu.ai CSV to Markdown Converter")
    print("=" * 60)
    print()

    # Convert files
    blog_count = convert_blog_csv(blog_csv, blog_output)
    print()
    news_count = convert_news_csv(news_csv, news_output)

    print()
    print("=" * 60)
    print(f"[OK] Conversion Complete!")
    print(f"  - {blog_count} blog posts")
    print(f"  - {news_count} news articles")
    print(f"  - Total: {blog_count + news_count} files")
    print("=" * 60)

if __name__ == "__main__":
    main()
