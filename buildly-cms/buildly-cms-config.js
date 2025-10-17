/**
 * Buildly CMS - Universal Content Management System
 * A drop-in AI-powered CMS for any HTML website
 * 
 * @version 1.0.0
 * @license MIT
 * @author Buildly Team
 */

// Default configuration - can be overridden by site-specific config
window.BuildlyCMS = window.BuildlyCMS || {};

window.BuildlyCMS.defaultConfig = {
    // System Configuration
    system: {
        name: "Buildly CMS",
        version: "1.0.0",
        basePath: detectBasePath(), // Auto-detect path for GitHub Pages
        apiEndpoint: "/api/", // API endpoint for backend operations
        authRequired: false, // Default to false for easier setup
        maxFileSize: "10MB",
        githubPages: detectGitHubPages()
    },

    // Site Configuration
    site: {
        name: "Your Website",
        url: detectSiteUrl(),
        description: "Content managed by Buildly CMS",
        logo: detectAssetPath("/logo.svg"), // Auto-detect asset paths
        favicon: detectAssetPath("/favicon.ico")
    },

    // Content Management
    content: {
        articlesFolder: "articles/",
        blogFolder: "blog/",
        pagesFolder: "pages/",
        indexFile: "index.html",
        defaultTemplate: "article",
        autoSave: true,
        autoSaveInterval: 30000, // 30 seconds
        categories: [
            { id: "general", name: "General", color: "#3B82F6" },
            { id: "technology", name: "Technology", color: "#10B981" },
            { id: "business", name: "Business", color: "#F59E0B" },
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
                models: ["llama3.2", "llama3.1", "mistral", "codellama"],
                defaultModel: "llama3.2",
                apiKeyRequired: false
            },
            gemini: {
                name: "Google Gemini",
                endpoint: "https://generativelanguage.googleapis.com/v1/models/",
                models: ["gemini-pro", "gemini-pro-vision"],
                defaultModel: "gemini-pro",
                apiKeyRequired: true
            }
        },
        defaultProvider: "openai",
        features: {
            contentGeneration: true,
            contentEditing: true,
            seoOptimization: true,
            imageGeneration: false, // Future feature
            translation: true
        }
    },

    // Theming & UI
    theme: {
        name: "default",
        colors: {
            primary: "#1B5FA3",
            secondary: "#144A84",
            accent: "#F9943B",
            success: "#10B981",
            warning: "#F59E0B",
            error: "#EF4444",
            dark: "#1F2937",
            light: "#F3F4F6"
        },
        fonts: {
            primary: "'Inter', system-ui, sans-serif",
            secondary: "'Inter', system-ui, sans-serif"
        },
        customCSS: "" // Additional CSS to inject
    },

    // File Management
    files: {
        allowedExtensions: ["html", "md", "txt", "json"],
        uploadFolder: "uploads/",
        imageFormats: ["jpg", "jpeg", "png", "svg", "webp"],
        videoFormats: ["mp4", "webm", "ogg"],
        maxImageSize: "5MB",
        backup: {
            enabled: true,
            frequency: "daily",
            retention: 30 // days
        }
    },

    // SEO Configuration
    seo: {
        generateMetaTags: true,
        generateOpenGraph: true,
        generateTwitterCards: true,
        generateStructuredData: true,
        defaultImagePath: "/media/og-image.jpg",
        analytics: {
            google: "", // GA tracking ID
            facebook: "", // Facebook Pixel ID
            custom: [] // Custom tracking scripts
        }
    },

    // Social Media Integration
    social: {
        platforms: {
            twitter: { enabled: true, handle: "" },
            facebook: { enabled: true, page: "" },
            linkedin: { enabled: true, company: "" },
            instagram: { enabled: false, handle: "" }
        },
        shareButtons: true,
        autoGenerate: true // Auto-generate social media posts
    },

    // Performance & Optimization
    performance: {
        lazyLoading: true,
        imageOptimization: true,
        minifyHTML: false,
        caching: true,
        cdn: {
            enabled: false,
            url: ""
        }
    },

    // Development Settings
    development: {
        debug: false,
        verbose: false,
        hotReload: true,
        sourceMap: true
    }
};

// Configuration merging function
window.BuildlyCMS.init = function(userConfig = {}) {
    // Deep merge user config with defaults
    function deepMerge(target, source) {
        for (let key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                if (!target[key]) target[key] = {};
                deepMerge(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
        }
        return target;
    }

    // Merge configurations
    window.BuildlyCMS.config = deepMerge(
        JSON.parse(JSON.stringify(window.BuildlyCMS.defaultConfig)),
        userConfig
    );

    // Initialize Tailwind CSS with theme colors
    if (typeof tailwind !== 'undefined') {
        const colors = window.BuildlyCMS.config.theme.colors;
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        'cms': {
                            primary: colors.primary,
                            secondary: colors.secondary,
                            accent: colors.accent,
                            success: colors.success,
                            warning: colors.warning,
                            error: colors.error,
                            dark: colors.dark,
                            light: colors.light
                        }
                    },
                    fontFamily: {
                        sans: [window.BuildlyCMS.config.theme.fonts.primary]
                    }
                }
            }
        };
    }

    // Set up global CSS variables for easy theming
    const root = document.documentElement;
    const colors = window.BuildlyCMS.config.theme.colors;
    
    root.style.setProperty('--cms-primary', colors.primary);
    root.style.setProperty('--cms-secondary', colors.secondary);
    root.style.setProperty('--cms-accent', colors.accent);
    root.style.setProperty('--cms-success', colors.success);
    root.style.setProperty('--cms-warning', colors.warning);
    root.style.setProperty('--cms-error', colors.error);
    root.style.setProperty('--cms-dark', colors.dark);
    root.style.setProperty('--cms-light', colors.light);

    // Log initialization if debug mode
    if (window.BuildlyCMS.config.development.debug) {
        console.log('Buildly CMS initialized with config:', window.BuildlyCMS.config);
    }

    return window.BuildlyCMS.config;
};

// GitHub Pages Detection and Path Helpers
function detectGitHubPages() {
    const hostname = window.location.hostname;
    const pathname = window.location.pathname;
    
    // Check for GitHub Pages patterns
    const isGitHubPages = hostname.endsWith('.github.io') || 
                         hostname === 'github.io' ||
                         (hostname.includes('github') && hostname.includes('pages'));
    
    return {
        enabled: isGitHubPages,
        hostname: hostname,
        repository: isGitHubPages ? extractRepoFromPath(pathname) : null,
        baseUrl: isGitHubPages ? getGitHubPagesBaseUrl() : null
    };
}

function extractRepoFromPath(pathname) {
    // For user.github.io/repo-name format
    const parts = pathname.split('/').filter(Boolean);
    return parts.length > 0 ? parts[0] : null;
}

function getGitHubPagesBaseUrl() {
    const hostname = window.location.hostname;
    const pathname = window.location.pathname;
    
    if (hostname.endsWith('.github.io')) {
        const parts = pathname.split('/').filter(Boolean);
        if (parts.length > 0) {
            return `/${parts[0]}`;
        }
    }
    return '';
}

function detectBasePath() {
    const githubPages = detectGitHubPages();
    
    if (githubPages.enabled && githubPages.baseUrl) {
        return `${githubPages.baseUrl}/buildly-cms/`;
    }
    
    return "/buildly-cms/";
}

function detectSiteUrl() {
    const githubPages = detectGitHubPages();
    
    if (githubPages.enabled) {
        return `https://${window.location.hostname}${githubPages.baseUrl || ''}`;
    }
    
    return window.location.origin;
}

function detectAssetPath(assetPath) {
    const githubPages = detectGitHubPages();
    
    if (githubPages.enabled && githubPages.baseUrl) {
        return `${githubPages.baseUrl}${assetPath}`;
    }
    
    return assetPath;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.BuildlyCMS;
}