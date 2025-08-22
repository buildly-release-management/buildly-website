/**
 * Buildly Website - Universal Header Script
 * Just add <script src="/js/buildly-head.js"></script> to any page
 * This will automatically load all necessary head elements
 */

(function() {
    'use strict';
    
    // Common head elements that should be on every page
    const commonHeadElements = [
        // Meta tags
        { tag: 'meta', attrs: { charset: 'UTF-8' } },
        { tag: 'meta', attrs: { name: 'viewport', content: 'width=device-width, initial-scale=1.0' } },
        { tag: 'meta', attrs: { name: 'author', content: 'Buildly' } },
        { tag: 'meta', attrs: { name: 'robots', content: 'index, follow' } },
        
        // Favicon
        { tag: 'link', attrs: { rel: 'icon', type: 'image/svg+xml', href: '/media/buildly-logo.svg' } },
        
        // Fonts
        { tag: 'link', attrs: { 
            href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap', 
            rel: 'stylesheet' 
        }},
        
        // Tailwind CSS
        { tag: 'script', attrs: { src: 'https://cdn.tailwindcss.com' } },
        
        // Custom CSS
        { tag: 'link', attrs: { rel: 'stylesheet', href: '/css/style.css' } }
    ];
    
    // Function to create and append elements
    function createHeadElement(elementConfig) {
        const element = document.createElement(elementConfig.tag);
        
        // Set attributes
        Object.keys(elementConfig.attrs || {}).forEach(attr => {
            element.setAttribute(attr, elementConfig.attrs[attr]);
        });
        
        // Set content for script tags
        if (elementConfig.content) {
            element.textContent = elementConfig.content;
        }
        
        document.head.appendChild(element);
    }
    
    // Load common elements
    commonHeadElements.forEach(createHeadElement);
    
    // Load Tailwind config
    const tailwindConfig = document.createElement('script');
    tailwindConfig.textContent = `
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        'buildly': {
                            primary: '#1b5fa3',
                            secondary: '#144a84', 
                            accent: '#f9943b',
                            dark: '#1F2937',
                            light: '#F3F4F6',
                        }
                    },
                    fontFamily: {
                        sans: ['Inter', 'system-ui', 'sans-serif'],
                    },
                    animation: {
                        'scroll': 'scroll 30s linear infinite',
                    },
                    keyframes: {
                        scroll: {
                            '0%': { transform: 'translateX(0)' },
                            '100%': { transform: 'translateX(-50%)' },
                        }
                    }
                }
            }
        }
    `;
    document.head.appendChild(tailwindConfig);
    
    // Load Google Analytics
    function loadGoogleAnalytics() {
        // Create gtag script
        const gtagScript = document.createElement('script');
        gtagScript.async = true;
        gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-YFY5W80XQX';
        document.head.appendChild(gtagScript);
        
        // Initialize gtag
        const initScript = document.createElement('script');
        initScript.textContent = `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-YFY5W80XQX');
        `;
        document.head.appendChild(initScript);
    }
    
    // Load Google Analytics after a short delay to ensure gtag script loads first
    setTimeout(loadGoogleAnalytics, 100);
    
})();
