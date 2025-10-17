# Buildly CMS - Universal Content Management System

## 🚀 Quick Start

Buildly CMS is a **drop-in AI-powered content management system** that can be added to any HTML website with minimal setup. No backend required!

### Installation (3 Easy Steps)

1. **Download and Extract**
   ```bash
   # Download the buildly-cms folder to your website
   cp -r buildly-cms /your-website/
   ```

2. **Configure Your Site**
   ```javascript
   // In your HTML page, add:
   <script>
   const mySiteConfig = {
       site: {
           name: "My Website",
           url: "https://mysite.com",
           description: "My awesome website"
       },
       theme: {
           colors: {
               primary: "#1B5FA3",    // Your brand color
               accent: "#F9943B"      // Your accent color
           }
       }
   };
   </script>
   ```

3. **Add CMS to Your Site**
   ```html
   <!-- Add to your admin page -->
   <!DOCTYPE html>
   <html>
   <head>
       <title>Admin Dashboard</title>
   </head>
   <body>
       <div id="cms-container"></div>
       
       <!-- Load Buildly CMS -->
       <script src="buildly-cms/buildly-cms-config.js"></script>
       <link rel="stylesheet" href="buildly-cms/css/buildly-cms.css">
       
       <script>
           // Initialize with your config
           BuildlyCMS.init(mySiteConfig);
       </script>
       
       <!-- Load the CMS interface -->
       <iframe src="buildly-cms/index.html" width="100%" height="800px"></iframe>
   </body>
   </html>
   ```

## 🎯 Features

### ✨ Core Features
- **🤖 AI-Powered Content Creation** - Generate articles, optimize SEO, translate content
- **📝 Visual Content Editor** - Rich text editing with live preview
- **📁 File Management** - Organize and manage your website files
- **🎨 Theme Customization** - Match your brand colors and styling
- **📱 Responsive Design** - Works on desktop, tablet, and mobile
- **🔍 SEO Optimization** - Built-in SEO tools and meta tag generation
- **📊 Analytics Dashboard** - Track content performance and usage
- **🌐 Multi-language Support** - Content translation capabilities

### 🔧 Technical Features
- **Zero Dependencies** - Self-contained CSS and JavaScript
- **No Backend Required** - Works with static sites and file systems
- **Tailwind-inspired CSS** - Utility-first styling system
- **Local Storage** - Settings persist across sessions
- **API Ready** - Easy integration with existing backends
- **Mobile-first Design** - Responsive from the ground up

## 📖 Configuration Reference

### Complete Configuration Object

```javascript
const fullConfig = {
    // System Configuration
    system: {
        name: "Buildly CMS",
        version: "1.0.0",
        basePath: "/buildly-cms/",
        apiEndpoint: "/api/",
        authRequired: true,
        maxFileSize: "10MB"
    },

    // Site Configuration
    site: {
        name: "Your Website",
        url: "https://yoursite.com",
        description: "Content managed by Buildly CMS",
        logo: "/logo.svg",
        favicon: "/favicon.ico"
    },

    // Content Management
    content: {
        articlesFolder: "articles/",
        blogFolder: "blog/",
        pagesFolder: "pages/",
        indexFile: "index.html",
        defaultTemplate: "article",
        autoSave: true,
        autoSaveInterval: 30000,
        categories: [
            { id: "general", name: "General", color: "#3B82F6" },
            { id: "technology", name: "Technology", color: "#10B981" },
            { id: "ai", name: "AI & Innovation", color: "#8B5CF6" }
        ]
    },

    // AI Integration
    ai: {
        providers: {
            openai: {
                name: "OpenAI",
                endpoint: "https://api.openai.com/v1/chat/completions",
                models: ["gpt-4o", "gpt-4", "gpt-3.5-turbo"],
                defaultModel: "gpt-4o",
                apiKeyRequired: true
            },
            ollama: {
                name: "Ollama (Local)",
                endpoint: "http://localhost:11434/api/generate",
                models: ["llama3.2", "mistral", "codellama"],
                defaultModel: "llama3.2",
                apiKeyRequired: false
            }
        },
        defaultProvider: "openai",
        features: {
            contentGeneration: true,
            contentEditing: true,
            seoOptimization: true,
            translation: true
        }
    },

    // Theming & UI
    theme: {
        colors: {
            primary: "#1B5FA3",
            secondary: "#144A84",
            accent: "#F9943B",
            success: "#10B981",
            warning: "#F59E0B",
            error: "#EF4444"
        },
        fonts: {
            primary: "'Inter', system-ui, sans-serif"
        },
        customCSS: ""
    },

    // SEO Configuration
    seo: {
        generateMetaTags: true,
        generateOpenGraph: true,
        generateTwitterCards: true,
        defaultImagePath: "/og-image.jpg",
        analytics: {
            google: "GA-XXXXXX-X"
        }
    }
};
```

## 🎨 Styling System

Buildly CMS includes a comprehensive utility-first CSS framework:

### Color Classes
```css
.cms-text-primary     /* Primary brand color */
.cms-text-accent      /* Accent color */
.cms-bg-primary       /* Primary background */
.cms-bg-gray-100      /* Light gray background */
```

### Layout Classes
```css
.cms-flex            /* Flexbox container */
.cms-grid            /* Grid container */
.cms-grid-cols-2     /* 2-column grid */
.cms-container       /* Centered container */
```

### Spacing Classes
```css
.cms-p-4            /* Padding: 1rem */
.cms-m-6            /* Margin: 1.5rem */
.cms-px-4           /* Horizontal padding */
.cms-py-2           /* Vertical padding */
```

### Component Classes
```css
.cms-btn            /* Base button */
.cms-btn-primary    /* Primary button */
.cms-card           /* Card component */
.cms-input          /* Form input */
```

## 🔌 Integration Examples

### WordPress Integration
```php
<?php
// wp-admin/buildly-cms.php
function buildly_cms_admin_page() {
    ?>
    <div class="wrap">
        <h1>Buildly CMS</h1>
        <iframe src="<?php echo plugin_dir_url(__FILE__); ?>buildly-cms/index.html" 
                width="100%" height="800px"></iframe>
    </div>
    <?php
}

add_action('admin_menu', function() {
    add_menu_page('Buildly CMS', 'Content AI', 'manage_options', 'buildly-cms', 'buildly_cms_admin_page');
});
?>
```

### Static Site Integration
```html
<!-- admin.html -->
<!DOCTYPE html>
<html>
<head>
    <title>Site Admin</title>
    <link rel="stylesheet" href="buildly-cms/css/buildly-cms.css">
</head>
<body>
    <script src="buildly-cms/buildly-cms-config.js"></script>
    <script>
        BuildlyCMS.init({
            site: {
                name: "My Static Site",
                url: window.location.origin
            },
            content: {
                articlesFolder: "blog/",
                pagesFolder: "pages/"
            }
        });
    </script>
    
    <div style="height: 100vh;">
        <iframe src="buildly-cms/index.html" width="100%" height="100%"></iframe>
    </div>
</body>
</html>
```

### React Integration
```jsx
import React, { useEffect } from 'react';

function CMSAdmin() {
    useEffect(() => {
        // Load Buildly CMS
        const script = document.createElement('script');
        script.src = '/buildly-cms/buildly-cms-config.js';
        document.head.appendChild(script);
        
        script.onload = () => {
            window.BuildlyCMS.init({
                site: { name: "My React App" }
            });
        };
    }, []);
    
    return (
        <div style={{ height: '100vh' }}>
            <iframe 
                src="/buildly-cms/index.html" 
                width="100%" 
                height="100%"
                frameBorder="0"
            />
        </div>
    );
}
```

## 🛠️ Customization

### Custom Themes
Create your own theme by overriding CSS variables:

```css
/* custom-theme.css */
:root {
    --cms-primary: #your-brand-color;
    --cms-accent: #your-accent-color;
    --cms-font-primary: 'Your Font', sans-serif;
}

/* Custom component styling */
.cms-nav {
    background: linear-gradient(45deg, #your-color-1, #your-color-2);
}
```

### Custom Components
Extend the CMS with your own components:

```javascript
// custom-components.js
window.CMSCore.addComponent('customButton', {
    render: function(props) {
        return `<button class="cms-btn custom-btn">${props.text}</button>`;
    }
});
```

## 📡 API Integration

### File System API
```javascript
// Example backend integration
const CMSBackend = {
    async saveFile(filename, content) {
        const response = await fetch('/api/files', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename, content })
        });
        return response.json();
    },
    
    async loadFile(filename) {
        const response = await fetch(`/api/files/${filename}`);
        return response.text();
    }
};
```

### AI Provider Integration
```javascript
// Custom AI provider
BuildlyCMS.addAIProvider('custom', {
    name: "Custom AI",
    async generate(prompt, options) {
        const response = await fetch('/your-ai-endpoint', {
            method: 'POST',
            body: JSON.stringify({ prompt, ...options })
        });
        return response.json();
    }
});
```

## 🚀 Deployment

### Static Site Deployment
1. Copy `buildly-cms` folder to your site
2. Create `admin.html` with iframe integration
3. Deploy to any static hosting (Netlify, Vercel, GitHub Pages)

### Server Deployment
1. Set up file system API endpoints
2. Configure authentication
3. Deploy with your preferred backend (Node.js, Python, PHP)

### CDN Deployment
```html
<!-- Use from CDN -->
<link rel="stylesheet" href="https://cdn.buildly.io/cms/v1/buildly-cms.css">
<script src="https://cdn.buildly.io/cms/v1/buildly-cms.js"></script>
```

## 🔒 Security

### Authentication
```javascript
BuildlyCMS.init({
    system: {
        authRequired: true,
        authProvider: 'custom'
    },
    auth: {
        loginUrl: '/admin/login',
        validateToken: async (token) => {
            // Your validation logic
            return await validateUserToken(token);
        }
    }
});
```

### File Permissions
```javascript
const config = {
    files: {
        allowedExtensions: ['html', 'md', 'txt'],
        restrictedPaths: ['/config/', '/admin/'],
        maxFileSize: '5MB'
    }
};
```

## 📊 Analytics & Monitoring

Track CMS usage and performance:

```javascript
BuildlyCMS.analytics.track('content_created', {
    type: 'article',
    category: 'technology',
    ai_assisted: true
});
```

## 🆘 Support & Community

- **Documentation**: https://docs.buildly.io/cms
- **GitHub**: https://github.com/buildly-release-management/buildly-cms
- **Discord**: https://discord.gg/buildly
- **Email**: support@buildly.io

## 📄 License

MIT License - Use freely in commercial and personal projects.

---

**Made with ❤️ by the Buildly Team**

*Transform any website into a powerful content management system with AI assistance!*