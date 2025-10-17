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
        
        // Fonts - preload for better performance
        { tag: 'link', attrs: { 
            href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap', 
            rel: 'stylesheet' 
        }},
        
        // Critical inline CSS to prevent FOUC completely
        { tag: 'style', content: `
            * { box-sizing: border-box; }
            body { 
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif; 
                margin: 0; 
                line-height: 1.6; 
            }
            .bg-white { background-color: #ffffff; }
            .bg-buildly-primary { background-color: #1b5fa3; }
            .text-white { color: #ffffff; }
            .text-gray-700 { color: #374151; }
            .flex { display: flex; }
            .items-center { align-items: center; }
            .justify-between { justify-content: space-between; }
            .max-w-7xl { max-width: 80rem; }
            .mx-auto { margin-left: auto; margin-right: auto; }
            .px-4 { padding-left: 1rem; padding-right: 1rem; }
            .h-16 { height: 4rem; }
            .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
        ` },
        
        // Full CSS loads after critical styles
        { tag: 'link', attrs: { rel: 'stylesheet', href: '/css/style.css' } },
        
        // Tailwind CSS as enhancement (loads after critical CSS)
        { tag: 'script', attrs: { src: 'https://cdn.tailwindcss.com' } },
        
        // Tailwind configuration script (must load after Tailwind)
        { tag: 'script', content: `
            // Configure Tailwind when it's ready
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
                                        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Noto Color Emoji"', '"Apple Color Emoji"', '"Segoe UI Emoji"', '"Segoe UI Symbol"', '"Android Emoji"', '"EmojiSymbols"', 'sans-serif'],
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
                        };
                    } else {
                        setTimeout(configureTailwind, 50);
                    }
                }
                // Wait for DOM and Tailwind
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', function() {
                        setTimeout(configureTailwind, 100);
                    });
                } else {
                    setTimeout(configureTailwind, 100);
                }
            })();
        ` }
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
    
    // Load common elements (includes critical CSS first)
    commonHeadElements.forEach(createHeadElement);
    

    
    // Load Google Analytics with error handling
    function loadGoogleAnalytics() {
        try {
            // First, create gtag script with async attribute and error handling
            const gtagScript = document.createElement('script');
            gtagScript.async = true;
            gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-YFY5W80XQX';
            
            // Handle loading errors (Safari privacy settings, ad blockers, etc.)
            gtagScript.onerror = function() {
                console.warn('Google Analytics script failed to load (blocked by privacy settings or ad blocker)');
            };
            
            gtagScript.onload = function() {
                console.log('Google Analytics loaded successfully');
            };
            
            document.head.appendChild(gtagScript);
            
            // Initialize gtag with error handling
            const initScript = document.createElement('script');
            initScript.innerHTML = `
                window.dataLayer = window.dataLayer || [];
                function gtag(){
                    if (typeof dataLayer !== 'undefined') {
                        dataLayer.push(arguments);
                    }
                }
                gtag('js', new Date());
                gtag('config', 'G-YFY5W80XQX');
            `;
            document.head.appendChild(initScript);
            
        } catch (error) {
            console.warn('Failed to initialize Google Analytics:', error.message);
        }
    }
    
    // Load Google Analytics with small delay to avoid Safari issues
    setTimeout(loadGoogleAnalytics, 200);
    
})();
