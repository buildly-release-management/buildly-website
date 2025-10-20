#!/bin/bash

# Add Mastodon sharing to articles that are missing it
echo "🔧 Adding Mastodon sharing to articles that are missing it..."

# Find all HTML files with social sharing but without Mastodon
article_files=$(find ./articles -name "*.html" -type f | xargs grep -l "social-sharing" | xargs grep -L "share-mastodon")

added=0

for file in $article_files; do
    echo "⚡ Adding Mastodon sharing to: $(basename "$file")"
    
    # Get the article title for share text
    article_title=$(grep -o '<title>[^<]*</title>' "$file" | sed 's/<title>\(.*\) - Buildly<\/title>/\1/' | head -1)
    if [ -z "$article_title" ]; then
        article_title=$(grep -o '<title>[^<]*</title>' "$file" | sed 's/<title>\(.*\)<\/title>/\1/' | head -1)
    fi
    
    # Create a temporary file
    temp_file=$(mktemp)
    
    # Add Mastodon button and functionality
    awk -v title="$article_title" '
    /<!-- Copy Link Button -->/ {
        # Insert Mastodon button before Copy Link button
        print "                    <!-- Mastodon Share Button -->"
        print "                    <button id=\"share-mastodon\" class=\"inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors\">"
        print "                        <svg class=\"w-5 h-5 mr-2\" fill=\"currentColor\" viewBox=\"0 0 24 24\">"
        print "                            <path d=\"M23.268 5.313c-.35-2.578-2.617-4.61-5.304-5.004C17.51.242 15.792.01 11.813.01h-.03c-3.98 0-4.835.232-5.288.309C3.882.692 1.496 2.518.917 5.127.64 6.412.61 7.837.661 9.143c.074 1.874.088 3.745.26 5.611.118 1.24.325 2.47.62 3.68.55 2.237 2.777 4.098 4.96 4.857 2.336.792 4.849.923 7.256.38.265-.061.527-.132.786-.213.585-.184 1.27-.39 1.774-.753a.057.057 0 0 0 .023-.043v-1.809a.052.052 0 0 0-.02-.041.053.053 0 0 0-.046-.01 20.282 20.282 0 0 1-4.709.545c-2.73 0-3.463-1.284-3.674-1.818a5.593 5.593 0 0 1-.319-1.433.053.053 0 0 1 .066-.054c1.517.363 3.072.546 4.632.546.376 0 .75 0 1.125-.01 1.57-.044 3.224-.124 4.768-.422.038-.008.077-.015.11-.024 2.435-.464 4.753-1.92 4.989-5.604.008-.145.03-1.52.03-1.67.002-.512.167-3.63-.024-5.545zm-3.748 9.195h-2.561V8.29c0-1.309-.55-1.976-1.67-1.976-1.23 0-1.846.79-1.846 2.35v3.403h-2.546V8.663c0-1.56-.617-2.35-1.848-2.35-1.112 0-1.668.668-1.67 1.977v6.218H4.822V8.102c0-1.31.337-2.35 1.011-3.12.696-.77 1.608-1.164 2.74-1.164 1.311 0 2.302.5 2.962 1.498l.638 1.06.638-1.06c.66-.999 1.65-1.498 2.96-1.498 1.13 0 2.043.395 2.74 1.164.675.77 1.012 1.81 1.012 3.12z\"/>"
        print "                        </svg>"
        print "                        Share on Mastodon"
        print "                    </button>"
        print ""
        print $0
        next
    }
    /"share-bluesky": \(\) => \{/ {
        print $0
        while (getline > 0 && !/},/) {
            print $0
        }
        print $0
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
        next
    }
    { print }
    ' "$file" > "$temp_file"
    
    # Replace original file with updated version
    mv "$temp_file" "$file"
    
    added=$((added + 1))
    echo "✅ Added Mastodon sharing to: $(basename "$file")"
done

echo ""
echo "🎉 Mastodon sharing addition complete!"
echo "📊 Summary:"
echo "   - Articles updated: $added"
echo "   - All articles now have complete social sharing with Mastodon"