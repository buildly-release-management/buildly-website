#!/usr/bin/env python3
"""
Buildly AI Content Manager - Setup Script
Helps configure the admin interface for any website.
"""

import os
import json
import shutil
import sys
from pathlib import Path

def setup_admin():
    print("🚀 Buildly AI Content Manager Setup")
    print("=====================================")
    
    # Get website information
    site_name = input("Website name: ").strip() or "My Website"
    site_url = input("Website URL (e.g., https://mysite.com): ").strip() or "http://localhost:8000"
    site_description = input("Website description: ").strip() or "My awesome website"
    
    # Content settings
    print("\n📁 Content Configuration")
    articles_folder = input("Articles folder (e.g., articles/, blog/, posts/): ").strip() or "articles/"
    if not articles_folder.endswith('/'):
        articles_folder += '/'
    
    index_file = input("Articles index file (e.g., articles.html, blog.html): ").strip() or "articles.html"
    
    # Categories
    print("\n🏷️  Content Categories")
    categories = []
    colors = ["blue-500", "green-500", "purple-500", "red-500", "yellow-500", "indigo-500"]
    
    while True:
        category_id = input("Category ID (or press Enter to finish): ").strip()
        if not category_id:
            break
        category_name = input(f"Display name for '{category_id}': ").strip() or category_id
        color = colors[len(categories) % len(colors)]
        categories.append({
            "id": category_id,
            "name": category_name,
            "color": color
        })
    
    if not categories:
        categories = [
            {"id": "General", "name": "General", "color": "blue-500"}
        ]
    
    # Branding
    print("\n🎨 Branding (optional)")
    primary_color = input("Primary color (hex, e.g., #1e40af): ").strip() or "#1e40af"
    secondary_color = input("Secondary color (hex): ").strip() or "#1e3a8a"
    accent_color = input("Accent color (hex): ").strip() or "#f59e0b"
    
    # Create configuration
    config = {
        "site": {
            "name": site_name,
            "url": site_url,
            "description": site_description,
            "logo": "/favicon.ico"
        },
        "content": {
            "articlesFolder": articles_folder,
            "indexFile": index_file,
            "defaultCategory": categories[0]["id"],
            "categories": categories,
            "folders": [
                {"id": articles_folder, "name": articles_folder, "description": "Main content folder"},
                {"id": "", "name": "root folder", "description": "Website root"},
                {"id": "content/", "name": "content/", "description": "General content"}
            ]
        },
        "branding": {
            "primaryColor": primary_color,
            "secondaryColor": secondary_color,
            "accentColor": accent_color,
            "darkColor": "#1F2937",
            "lightColor": "#F3F4F6",
            "font": "Inter"
        },
        "social": {
            "defaultHashtags": [f"#{site_name.replace(' ', '')}", "#Content", "#Blog"],
            "platforms": {
                "twitter": {
                    "enabled": True,
                    "characterLimit": 280,
                    "template": "New article: \"{title}\"\n\n{description}\n\n{hashtags}"
                },
                "linkedin": {
                    "enabled": True,
                    "characterLimit": 3000,
                    "template": "Just published: \"{title}\"\n\n{description}\n\nWhat are your thoughts on this topic?\n\n{hashtags}"
                },
                "facebook": {
                    "enabled": True,
                    "characterLimit": 63206,
                    "template": "Check out our latest article: \"{title}\"\n\n{description}\n\nWhat's your experience with this? Share your thoughts below!\n\n{hashtags}"
                }
            }
        },
        "features": {
            "aiEnabled": True,
            "socialEnabled": True,
            "fileEditing": True,
            "autoSave": True,
            "indexUpdating": True
        },
        "development": {
            "serverPort": 8000,
            "saveEndpoint": "/save-file",
            "corsEnabled": True
        }
    }
    
    # Create necessary directories
    os.makedirs(articles_folder, exist_ok=True)
    print(f"✅ Created {articles_folder} directory")
    
    # Save configuration
    with open('admin/site-config.json', 'w', encoding='utf-8') as f:
        json.dump(config, f, indent=2)
    print("✅ Created admin/site-config.json")
    
    # Create a simple index file if it doesn't exist
    if not os.path.exists(index_file):
        create_index = input(f"\n📄 Create a basic {index_file}? (y/n): ").strip().lower() == 'y'
        if create_index:
            create_articles_index(index_file, site_name, categories)
            print(f"✅ Created {index_file}")
    
    print("\n🎉 Setup Complete!")
    print("=" * 50)
    print("Next steps:")
    print("1. Start the development server:")
    print("   python admin/dev-server.py 8000")
    print("2. Open your browser to:")
    print("   http://localhost:8000/admin/")
    print("3. Configure AI providers in Settings")
    print("4. Start creating content!")
    print("\nFor more help, see admin/DEPLOYMENT.md")

def create_articles_index(filename, site_name, categories):
    """Create a basic articles index page"""
    html_content = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Articles - {site_name}</title>
    <meta name="description" content="Latest articles and content from {site_name}">
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body {{ font-family: 'Inter', sans-serif; }}
    </style>
</head>
<body class="bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="text-center mb-16">
            <h1 class="text-4xl font-bold text-gray-900 mb-4">Articles</h1>
            <p class="text-xl text-gray-600">Latest content from {site_name}</p>
        </div>
        
        <div class="space-y-16">
            <!-- Articles will be added here by the admin interface -->
            <div class="text-center py-12">
                <p class="text-gray-500">No articles yet. Use the admin interface to create your first article!</p>
                <a href="/admin/" class="inline-block mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                    Open Admin Interface
                </a>
            </div>
        </div>
    </div>
</body>
</html>'''
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(html_content)

if __name__ == '__main__':
    if not os.path.exists('admin'):
        print("❌ Error: admin folder not found in current directory")
        print("Make sure you're running this from your website root with the admin folder present.")
        sys.exit(1)
    
    setup_admin()