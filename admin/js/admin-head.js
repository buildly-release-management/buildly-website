/**
 * Buildly Admin - Head Script
 * Standalone head loader for admin pages (doesn't include main site navigation)
 * Just add <script src="/admin/js/admin-head.js"></script> to admin pages
 */

(function() {
    'use strict';
    
    // Admin-specific head elements (no site navigation loader)
    const adminHeadElements = [
        // Meta tags
        { tag: 'meta', attrs: { name: 'viewport', content: 'width=device-width, initial-scale=1.0' } },
        { tag: 'meta', attrs: { name: 'author', content: 'Buildly' } },
        { tag: 'meta', attrs: { name: 'robots', content: 'noindex, nofollow' } }, // Admin should not be indexed
        
        // Favicon
        { tag: 'link', attrs: { rel: 'icon', type: 'image/svg+xml', href: '/media/buildly-logo.svg' } },
        
        // Fonts
        { tag: 'link', attrs: { 
            href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap', 
            rel: 'stylesheet' 
        }},
        
        // Emoji font support
        { tag: 'link', attrs: { 
            href: 'https://fonts.googleapis.com/css2?family=Noto+Color+Emoji&display=swap', 
            rel: 'stylesheet' 
        }},
        
        // Critical inline CSS
        { tag: 'style', content: `
            * { box-sizing: border-box; }
            body { 
                font-family: 'Inter', 'Noto Color Emoji', -apple-system, BlinkMacSystemFont, system-ui, sans-serif; 
                margin: 0; 
                padding: 0;
                line-height: 1.6; 
            }
            /* Hide main site nav if it somehow loads */
            body > nav:first-child,
            body > header:first-child,
            #main-nav,
            .site-header {
                display: none !important;
            }
        ` },
        
        // Tailwind CSS
        { tag: 'script', attrs: { src: 'https://cdn.tailwindcss.com' } },
        
        // Tailwind configuration for admin
        { tag: 'script', content: `
            (function() {
                function configureTailwind() {
                    if (typeof window.tailwind !== 'undefined') {
                        window.tailwind.config = {
                            theme: {
                                extend: {
                                    colors: {
                                        'buildly-primary': '#1b5fa3',
                                        'buildly-secondary': '#144a84',
                                        'buildly-accent': '#f9943b',
                                        'buildly-dark': '#1F2937',
                                        'buildly-light': '#F3F4F6',
                                    },
                                    fontFamily: {
                                        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Noto Color Emoji"', 'sans-serif'],
                                    }
                                }
                            }
                        };
                    } else {
                        setTimeout(configureTailwind, 50);
                    }
                }
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', configureTailwind);
                } else {
                    configureTailwind();
                }
            })();
        ` }
    ];
    
    // Helper function to create elements
    function createElement(config) {
        const element = document.createElement(config.tag);
        
        if (config.attrs) {
            Object.entries(config.attrs).forEach(([key, value]) => {
                element.setAttribute(key, value);
            });
        }
        
        if (config.content) {
            element.textContent = config.content;
        }
        
        return element;
    }
    
    // Add elements to head
    const head = document.head || document.getElementsByTagName('head')[0];
    
    adminHeadElements.forEach(config => {
        // Check if similar element already exists to avoid duplicates
        if (config.tag === 'meta' && config.attrs && config.attrs.name) {
            const existing = document.querySelector(`meta[name="${config.attrs.name}"]`);
            if (existing) return;
        }
        
        if (config.tag === 'link' && config.attrs && config.attrs.href) {
            const existing = document.querySelector(`link[href="${config.attrs.href}"]`);
            if (existing) return;
        }
        
        head.appendChild(createElement(config));
    });
    
    console.log('Buildly Admin head loaded');
})();
