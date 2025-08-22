# Buildly Website

Official website for Buildly - an AI-powered product development platform that provides a superior alternative to vibe coding with AI automation guided by developer oversight.

🌐 **Live Site**: [buildly.io](https://www.buildly.io)  
🚀 **Platform**: [labs.buildly.io](https://labs.buildly.io)  
📖 **Documentation**: [docs.buildly.io](https://docs.buildly.io)

## 🏗️ Architecture Overview

This website uses a **centralized header system** for consistency and easy maintenance. All common elements (Google Analytics, Tailwind CSS, fonts, meta tags) are loaded automatically.

### Core Philosophy
- **Shared Common Elements**: One header script loads everything needed on every page
- **Page-Specific Customization**: Each page can add unique meta tags, titles, and content
- **Performance Optimized**: AMP versions available for mobile speed
- **SEO Ready**: Structured data, Open Graph, and Twitter Cards built-in

## 🚀 Quick Start for New Pages

### Method 1: Use the Header Script (Recommended)
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <!-- This single line loads all common elements -->
    <script src="/js/buildly-head.js"></script>
    
    <!-- Add your page-specific elements -->
    <title>Your Page Title - Buildly</title>
    <meta name="description" content="Your page description">
    <link rel="canonical" href="https://www.buildly.io/your-page.html">
</head>
<body>
    <!-- Your content here -->
</body>
</html>
```

### Method 2: Use Templates
Copy and customize from available templates:
- `/templates/complete-page-template.html` - Full SEO template with all options
- `/templates/page-template.html` - Basic template
- `/example-new-page.html` - Working example

## 📋 What's Included Automatically

When you add `<script src="/js/buildly-head.js"></script>`, you get:

✅ **Google Analytics** (G-YFY5W80XQX)  
✅ **Tailwind CSS** with Buildly theme configuration  
✅ **Inter Font Family** loaded from Google Fonts  
✅ **Common Meta Tags** (charset, viewport, author, robots)  
✅ **Favicon** and app icons  
✅ **Custom CSS** (/css/style.css)  

## 🎨 Brand Guidelines

### Colors (Tailwind Classes)
```css
buildly-primary:   #1b5fa3  /* Main blue */
buildly-secondary: #144a84  /* Darker blue */
buildly-accent:    #f9943b  /* Orange */
buildly-dark:      #1F2937  /* Dark gray */
buildly-light:     #F3F4F6  /* Light gray */
```

### Typography
- **Font**: Inter (loaded automatically)
- **Headings**: Use Tailwind classes (`text-4xl`, `font-bold`, etc.)

### Key Messaging
- ❌ **NOT**: "vibe coding platform"
- ✅ **WE ARE**: "Superior alternative to vibe coding"
- ✅ **VALUE PROP**: "AI automation + developer oversight = better results"

## 🔗 Important URLs

### Navigation Links
- **Try for Free** → `https://labs.buildly.io`
- **Labs** → `https://labs.buildly.io`
- **Documentation** → `https://docs.buildly.io`
- **Collab Hub** → `https://collab.buildly.io`

### ⚠️ Avoid These URLs
- ❌ Don't use `/register` paths
- ❌ All registration should go to `https://labs.buildly.io`

## 📁 Project Structure

```
buildly-website/
├── 📄 index.html              # Homepage
├── 📄 labs.html               # Labs platform page
├── 📄 pricing.html            # Pricing page
├── 📄 use-cases.html          # Use cases page
├── 📁 articles/               # Blog articles
├── 📁 css/                    # Stylesheets
│   ├── style.css              # Custom styles
│   └── input.css              # Tailwind source
├── 📁 js/                     # JavaScript files
│   ├── 🔥 buildly-head.js     # Universal header loader (IMPORTANT)
│   ├── header-loader.js       # Alternative header system
│   └── main.js                # Site functionality
├── 📁 media/                  # Images and assets
│   ├── buildly-logo.svg       # Main logo
│   ├── team/                  # Team photos
│   ├── customers/             # Customer logos
│   └── icons/                 # Icon files
├── 📁 templates/              # Page templates
│   ├── complete-page-template.html
│   ├── page-template.html
│   └── example-new-page.html
├── 📁 docs/                   # 📖 Documentation
│   ├── README.md              # Documentation index
│   ├── AMP-Implementation-Guide.md
│   ├── SEO-Optimization-Report.md
│   └── ... (other docs)
└── 📁 .github/               # GitHub integration
    ├── copilot-instructions.md
    └── copilot-prompt.md
```

## 🤖 GitHub Copilot Integration

This repository includes **automatic GitHub Copilot prompts** that help with:

- ✅ **Header System**: Reminds to use `/js/buildly-head.js`
- ✅ **Brand Guidelines**: Correct colors and messaging
- ✅ **URL Standards**: Proper link destinations
- ✅ **Template Usage**: Available starting points
- ✅ **SEO Best Practices**: Meta tags and structured data

**Files:**
- `.github/copilot-instructions.md` - Comprehensive development guide
- `.github/copilot-prompt.md` - Quick reference for AI assistance

## 🚀 Performance Features

### AMP (Accelerated Mobile Pages)
- `index.amp.html` - AMP homepage
- `labs.amp.html` - AMP Labs page
- Validation script: `/validate-amp.sh`

### SEO Optimization
- Structured data (JSON-LD)
- Open Graph tags for social sharing
- Twitter Card support
- Canonical URLs
- Optimized for keywords: "AI development", "product management", "buildly"

## 🛠️ Development Workflow

1. **Start with a Template**
   ```bash
   cp templates/complete-page-template.html your-new-page.html
   ```

2. **Add Header Script** (if not using template)
   ```html
   <script src="/js/buildly-head.js"></script>
   ```

3. **Customize Page-Specific Elements**
   - Update title, description, keywords
   - Add Open Graph tags if needed
   - Include structured data for rich snippets

4. **Test Your Page**
   - Check mobile responsiveness
   - Validate AMP version if created
   - Verify all links work correctly

5. **Deploy**
   - Commit to main branch
   - Site automatically deploys

## 📖 Documentation

Comprehensive documentation is available in the `/docs/` folder:

- **[Documentation Index](docs/README.md)** - Overview of all documentation
- **[AMP Implementation Guide](docs/AMP-Implementation-Guide.md)** - AMP setup and validation
- **[SEO Optimization Reports](docs/)** - SEO implementation and results
- **[Positioning Guidelines](docs/Buildly-Positioning-Correction.md)** - Brand messaging standards

## 🔧 Tools & Scripts

### Available Scripts
```bash
# Validate AMP pages
./validate-amp.sh

# Check for broken links (if needed)
# Add your preferred link checker here
```

### Key JavaScript Files
- **`buildly-head.js`** - Universal header loader (use this!)
- **`header-loader.js`** - Alternative header system
- **`main.js`** - Site functionality and interactions

## ⚠️ Common Mistakes to Avoid

1. **❌ Manual Google Analytics** - It's loaded automatically
2. **❌ Duplicate Tailwind CSS** - It's included in header script
3. **❌ Wrong positioning** - We're NOT a vibe coding platform
4. **❌ Incorrect URLs** - Don't use `/register`, use `https://labs.buildly.io`
5. **❌ Missing header script** - Always include on new pages

## 🤝 Contributing

### For Team Members:
1. Use the header system for consistency
2. Follow brand guidelines (colors, messaging)
3. Use correct URLs for CTAs
4. Test on mobile and desktop
5. Update documentation if adding new features

### For External Contributors:
1. Fork the repository
2. Create a feature branch
3. Follow the development workflow above
4. Submit a pull request

## 🏢 Team & Contact

- **Greg Lind** - CEO
- **Radhika Patel** - VP Engineering AI/ML
- **Maryna Mishchenko** - VP Product/Marketing

**Repository**: buildly-release-management/buildly-website  
**Branch**: main  
**License**: [Add license information]

---

## 🎯 Remember: Header System is Key!

The most important thing to remember: **Always add `<script src="/js/buildly-head.js"></script>` to new pages**. This single line ensures consistency, performance, and proper tracking across the entire website.

Happy coding! 🚀
