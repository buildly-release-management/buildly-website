#!/bin/bash

# AMP Validation Script for Buildly.io
echo "AMP Validation Results for Buildly.io"
echo "====================================="

# List of AMP pages to validate
AMP_PAGES=(
    "index.amp.html"
    "labs.amp.html"
    "articles/ai-powered-devops.amp.html"
)

echo "Created AMP pages:"
for page in "${AMP_PAGES[@]}"; do
    if [ -f "/home/glind/Projects/buildly/buildly-website/$page" ]; then
        echo "✅ $page - File exists"
        
        # Check for required AMP elements
        if grep -q "html amp" "/home/glind/Projects/buildly/buildly-website/$page"; then
            echo "   ✅ Contains <html amp> tag"
        else
            echo "   ❌ Missing <html amp> tag"
        fi
        
        if grep -q "cdn.ampproject.org/v0.js" "/home/glind/Projects/buildly/buildly-website/$page"; then
            echo "   ✅ Contains AMP runtime script"
        else
            echo "   ❌ Missing AMP runtime script"
        fi
        
        if grep -q "amp-boilerplate" "/home/glind/Projects/buildly/buildly-website/$page"; then
            echo "   ✅ Contains AMP boilerplate CSS"
        else
            echo "   ❌ Missing AMP boilerplate CSS"
        fi
        
        if grep -q "rel=\"canonical\"" "/home/glind/Projects/buildly/buildly-website/$page"; then
            echo "   ✅ Contains canonical URL"
        else
            echo "   ❌ Missing canonical URL"
        fi
        
        echo ""
    else
        echo "❌ $page - File not found"
        echo ""
    fi
done

echo "AMP Linking Verification:"
echo "========================"

# Check if original pages link to AMP versions
ORIGINAL_PAGES=(
    "index.html:index.amp.html"
    "labs.html:labs.amp.html"
    "articles/ai-powered-devops.html:articles/ai-powered-devops.amp.html"
)

for pair in "${ORIGINAL_PAGES[@]}"; do
    original="${pair%:*}"
    amp="${pair#*:}"
    
    if [ -f "/home/glind/Projects/buildly/buildly-website/$original" ]; then
        if grep -q "rel=\"amphtml\"" "/home/glind/Projects/buildly/buildly-website/$original"; then
            echo "✅ $original links to AMP version"
        else
            echo "❌ $original missing AMP link"
        fi
    else
        echo "❌ $original not found"
    fi
done

echo ""
echo "Sitemap Verification:"
echo "===================="

if [ -f "/home/glind/Projects/buildly/buildly-website/sitemap.xml" ]; then
    if grep -q ".amp.html" "/home/glind/Projects/buildly/buildly-website/sitemap.xml"; then
        echo "✅ Sitemap includes AMP pages"
        echo "AMP pages in sitemap:"
        grep -o "https://[^<]*\.amp\.html" "/home/glind/Projects/buildly/buildly-website/sitemap.xml" | sed 's/^/   /'
    else
        echo "❌ Sitemap missing AMP pages"
    fi
else
    echo "❌ Sitemap not found"
fi

echo ""
echo "Next Steps:"
echo "==========="
echo "1. Validate AMP pages using: https://validator.ampproject.org/"
echo "2. Test pages using: https://search.google.com/test/amp"
echo "3. Submit sitemap to Google Search Console"
echo "4. Monitor performance with AMP analytics"
echo ""
echo "Manual validation URLs:"
for page in "${AMP_PAGES[@]}"; do
    echo "   https://validator.ampproject.org/#url=https://www.buildly.io/$page"
done
