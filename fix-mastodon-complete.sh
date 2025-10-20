#!/bin/bash

# Fix Mastodon sharing functionality in all articles
echo "🔧 Fixing Mastodon sharing functionality across all articles..."

# Find all HTML files with social sharing
article_files=$(find ./articles -name "*.html" -type f | xargs grep -l "share-mastodon")

fixed=0

for file in $article_files; do
    echo "⚡ Processing: $(basename "$file")"
    
    # Extract article title for the share text
    article_title=$(grep -o '<title>[^<]*</title>' "$file" | sed 's/<title>\(.*\) - Buildly<\/title>/\1/' | head -1)
    if [ -z "$article_title" ]; then
        article_title=$(grep -o '<title>[^<]*</title>' "$file" | sed 's/<title>\(.*\)<\/title>/\1/' | head -1)
    fi
    
    # Create a temporary file
    temp_file=$(mktemp)
    
    # Replace the Mastodon sharing function with the corrected version
    awk -v title="$article_title" '
    /share-mastodon.*:.*\(\) => \{/ {
        print "                        \"share-mastodon\": () => {"
        print "                            const text = \"" title " - Essential reading from Buildly\";"
        print "                            const url = window.location.href;"
        print "                            const mastodonInstance = prompt(\"Enter your Mastodon instance (e.g., mastodon.social):\");"
        print "                            if (mastodonInstance) {"
        print "                                // Clean the instance name (remove https:// if user added it)"
        print "                                const cleanInstance = mastodonInstance.replace(/^https?:\\/\\//, \"\");"
        print "                                const shareText = encodeURIComponent(`${text}\\n\\n${url}`);"
        print "                                window.open(`https://${cleanInstance}/share?text=${shareText}`, \"_blank\", \"width=550,height=420\");"
        print "                            }"
        print "                        },"
        
        # Skip until we find the next function or closing brace
        while (getline > 0) {
            if (/^\s*},$/ || /copy-link.*:.*\(\) => \{/) {
                if (/copy-link.*:.*\(\) => \{/) {
                    print $0
                }
                break
            }
        }
        next
    }
    { print }
    ' "$file" > "$temp_file"
    
    # Replace original file with fixed version
    mv "$temp_file" "$file"
    
    fixed=$((fixed + 1))
    echo "✅ Fixed: $(basename "$file")"
done

echo ""
echo "🎉 Mastodon sharing fix complete!"
echo "📊 Summary:"
echo "   - Articles processed: $fixed"
echo "   - Fixed URL encoding and instance handling"
echo "   - Added proper text formatting with line breaks"
echo "   - Handles user input sanitization"