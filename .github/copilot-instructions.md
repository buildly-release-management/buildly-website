# Buildly Website Development Guide

## Project Overview
Buildly is an AI-powered product development platform that provides a comprehensive solution for software development teams. We offer an alternative to vibe coding with AI automation guided by developer oversight.

### Core Products & Services
- **Buildly Labs**: AI-driven product management, release planning, and insights platform
- **Buildly Core**: Component-driven architecture with open-source foundation
- **Collab Hub**: Network of technical co-founders and development agencies
- **RAD Core**: Open-source gateway and marketplace of microservice components

### Key URLs
- Main Website: https://www.buildly.io
- Labs Platform: https://labs.buildly.io
- Documentation: https://docs.buildly.io
- Collab Hub: https://collab.buildly.io (or https://market.buildly.io)

## Website Architecture

### Header System (IMPORTANT)
We use a centralized header system to avoid code duplication:

**For any new HTML page, add this single line in the `<head>`:**
```html
<script src="/js/buildly-head.js"></script>
```

This automatically includes:
- Google Analytics (G-YFY5W80XQX)
- Tailwind CSS with Buildly theme configuration
- Inter font family
- Common meta tags (charset, viewport, author, robots)
- Favicon and icons
- Custom CSS (/css/style.css)

### Page-Specific Customization
After the header script, add page-specific elements:
```html
<head>
    <!-- Load common elements -->
    <script src="/js/buildly-head.js"></script>
    
    <!-- Page-specific customization -->
    <title>Your Page Title - Buildly</title>
    <meta name="description" content="Page-specific description">
    <meta name="keywords" content="relevant, keywords, buildly">
    <link rel="canonical" href="https://www.buildly.io/your-page.html">
    
    <!-- Optional: Open Graph, Twitter Cards, Structured Data -->
</head>
```

### Templates Available
- `/templates/complete-page-template.html` - Full template with all SEO options
- `/templates/page-template.html` - Basic page template
- `/example-new-page.html` - Working example

## Brand & Design System

### Colors (Tailwind Classes)
- Primary: `buildly-primary` (#1b5fa3)
- Secondary: `buildly-secondary` (#144a84)
- Accent: `buildly-accent` (#f9943b)
- Dark: `buildly-dark` (#1F2937)
- Light: `buildly-light` (#F3F4F6)

### Typography
- Font Family: Inter (loaded automatically via header system)
- Headings: Use Tailwind typography classes (text-4xl, font-bold, etc.)

### Logo & Assets
- Logo: `/media/buildly-logo.svg`
- Team photos: `/media/team/`
- Customer logos: `/media/customers/`
- Icons: `/media/icons/`

## Content Guidelines

### Messaging & Positioning
- **What we are**: AI-powered product development platform
- **What we're NOT**: We are NOT a vibe coding platform
- **Our advantage**: Superior alternative to vibe coding with AI automation + developer oversight
- **Target audience**: Startups, SMBs, development teams, product managers

### Key Value Propositions
- 50% reduction in software development budget
- 40% time saved through reduced meeting times
- 75% time and money savings with AI release management
- AI-reviewed planning with human oversight

### Tone & Voice
- Professional but approachable
- Technical but accessible
- Innovation-focused
- Solution-oriented

## Development Standards

### File Structure
```
/
├── index.html (homepage)
├── labs.html, pricing.html, use-cases.html, etc.
├── articles/
│   └── [article-name].html
├── css/
│   ├── style.css (custom styles)
│   └── input.css (Tailwind source)
├── js/
│   ├── buildly-head.js (header loader - IMPORTANT)
│   ├── header-loader.js (alternative loader)
│   └── main.js (site functionality)
├── media/
│   ├── buildly-logo.svg
│   ├── team/, customers/, icons/
├── includes/
│   └── head.html (shared head elements)
└── templates/
    ├── complete-page-template.html
    └── page-template.html
```

### AMP Implementation
We have AMP versions for performance:
- Main AMP pages: `index.amp.html`, `labs.amp.html`
- Link regular pages to AMP: `<link rel="amphtml" href="page.amp.html">`
- Validation script: `/validate-amp.sh`

### SEO Standards
- Always include: title, description, keywords, canonical URL
- Use structured data (JSON-LD) for rich snippets
- Include Open Graph and Twitter Card meta tags
- Optimize for "AI development", "product management", "buildly" keywords

### Navigation Links
- All "Try for Free" buttons → https://labs.buildly.io
- Labs navigation → https://labs.buildly.io
- Documentation → https://docs.buildly.io
- Collab Hub → https://collab.buildly.io

## Code Patterns

### Common Button Styles
```html
<!-- Primary CTA -->
<a href="https://labs.buildly.io" class="bg-buildly-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-buildly-secondary transition-colors">
    Try for Free
</a>

<!-- Secondary CTA -->
<a href="#learn-more" class="border border-buildly-accent text-buildly-accent px-8 py-3 rounded-lg font-semibold hover:bg-buildly-accent hover:text-white transition-colors">
    Learn More
</a>
```

### Section Headers
```html
<section class="py-20 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
            <h2 class="text-3xl md:text-4xl font-bold text-buildly-dark mb-4">Section Title</h2>
            <p class="text-xl text-gray-600">Section description</p>
        </div>
        <!-- Content -->
    </div>
</section>
```

## Analytics & Tracking
- Google Analytics ID: G-YFY5W80XQX (loaded automatically via header system)
- Track key actions: "Try for Free" clicks, page views, form submissions

## Common Mistakes to Avoid
1. **Don't** manually add Google Analytics - it's in the header system
2. **Don't** duplicate Tailwind CSS - it's loaded automatically
3. **Don't** call us a "vibe coding platform" - we're an alternative to vibe coding
4. **Don't** use `/register` URLs - all should point to https://labs.buildly.io
5. **Don't** forget the header script on new pages

## Development Workflow
1. Start with a template from `/templates/`
2. Add the header script: `<script src="/js/buildly-head.js"></script>`
3. Customize page-specific meta tags
4. Build content using Buildly color scheme and messaging
5. Test on mobile and desktop
6. Validate AMP if creating AMP version
7. Check all links point to correct URLs

## Contact & Resources
- Repository: buildly-website (buildly-release-management org)
- Branch: main
- Team: Greg Lind (CEO), Radhika Patel (VP Engineering AI/ML), Maryna Mishchenko (VP Product/Marketing)

Remember: The header system (`/js/buildly-head.js`) is crucial for consistency. Always use it on new pages!
