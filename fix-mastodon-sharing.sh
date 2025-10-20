#!/bin/bash

# Fix Mastodon sharing URLs in all articles
echo "🔧 Fixing Mastodon sharing URLs in all articles..."

# Find all HTML files with social sharing
article_files=$(find ./articles -name "*.html" -type f | xargs grep -l "share-mastodon")

fixed=0

for file in $article_files; do
    echo "⚡ Fixing Mastodon sharing in: $(basename "$file")"
    
    # Create a temporary file
    temp_file=$(mktemp)
    
    # Fix the Mastodon sharing function
    sed 's|window\.open(`https://${mastodonInstance}/share?text=${text} ${url}`|window.open(`https://${mastodonInstance}/share?text=${text}%20${url}`|g' "$file" > "$temp_file"
    
    # Replace original file with fixed version
    mv "$temp_file" "$file"
    
    fixed=$((fixed + 1))
    echo "✅ Fixed: $(basename "$file")"
done

echo ""
echo "🎉 Mastodon sharing fix complete!"
echo "📊 Fixed $fixed articles"