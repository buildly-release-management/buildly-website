/**
 * Buildly Website - Universal Navigation Loader
 * Automatically loads consistent navigation on all pages
 * Just add <script src="/js/nav-loader.js"></script> to any page after the opening <body> tag
 */

(function() {
    'use strict';
    
    // Function to determine the correct path depth and adjust relative paths
    function getBasePath() {
        const pathSegments = window.location.pathname.split('/').filter(segment => segment !== '');
        // Remove the filename from the count if it exists
        const depth = pathSegments.length > 0 && pathSegments[pathSegments.length - 1].includes('.') 
                      ? pathSegments.length - 1 
                      : pathSegments.length;
        return depth > 0 ? '../'.repeat(depth) : './';
    }
    
    // Function to adjust paths in the loaded HTML based on current page depth
    function adjustPaths(html, basePath) {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        doc.querySelectorAll('[href], [src]').forEach(element => {
            ['href', 'src'].forEach(attribute => {
                const value = element.getAttribute(attribute);
                if (!value || /^(?:[a-z]+:|\/|#)/i.test(value)) return;
                element.setAttribute(attribute, basePath + value.replace(/^(?:\.\.\/|\.\/)+/, ''));
            });
        });
        return doc.body.innerHTML;
    }
    
    // Function to set active navigation state based on current page
    function setActiveNavigation(navigationHTML) {
        const currentPath = window.location.pathname;
        const parser = new DOMParser();
        const doc = parser.parseFromString(navigationHTML, 'text/html');
        
        // Remove active states first
        doc.querySelectorAll('a').forEach(link => {
            if (link.classList.contains('text-white')) return;
            link.classList.remove('text-buildly-primary', 'font-semibold');
            link.classList.add('text-gray-700');
        });
        
        // Set active state based on current page
        if (currentPath.includes('/articles/')) {
            const articlesLinks = doc.querySelectorAll('a[href*="articles.html"]');
            articlesLinks.forEach(link => {
                link.classList.remove('text-gray-700');
                link.classList.add('text-buildly-primary', 'font-semibold');
            });
        } else if (currentPath.includes('/platform')) {
            const platformLinks = doc.querySelectorAll('a[href*="platform"]');
            platformLinks.forEach(link => {
                link.classList.remove('text-gray-700');
                link.classList.add('text-buildly-primary', 'font-semibold');
            });
        } else if (currentPath.includes('/labs.html')) {
            const labsLinks = doc.querySelectorAll('a[href*="labs.html"]');
            labsLinks.forEach(link => {
                link.classList.remove('text-gray-700');
                link.classList.add('text-buildly-primary', 'font-semibold');
            });
        } else if (currentPath.includes('/use-cases.html')) {
            const useCasesLinks = doc.querySelectorAll('a[href*="use-cases.html"]');
            useCasesLinks.forEach(link => {
                link.classList.remove('text-gray-700');
                link.classList.add('text-buildly-primary', 'font-semibold');
            });
        } else if (currentPath.includes('/pricing.html')) {
            const pricingLinks = doc.querySelectorAll('a[href*="pricing.html"]');
            pricingLinks.forEach(link => {
                link.classList.remove('text-gray-700');
                link.classList.add('text-buildly-primary', 'font-semibold');
            });
        }
        
        return doc.body.innerHTML;
    }
    
    // Main function to load navigation
    function loadNavigation() {
        // Skip injection if this page has its own custom navigation (.nav-dark)
        // This allows new ecosystem pages to manage their own nav without conflict
        if (document.documentElement.hasAttribute('data-no-nav-loader') || document.querySelector('.nav-dark') || document.querySelector('[data-skip-nav-loader]')) {
            return;
        }

        const basePath = getBasePath();
        const navPath = basePath + 'includes/nav.html';
        
        fetch(navPath)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(html => {
                // Don't inject if the page already has its own nav (checked again after async fetch)
                if (document.documentElement.hasAttribute('data-no-nav-loader') || document.querySelector('.nav-dark') || document.querySelector('[data-skip-nav-loader]')) {
                    return;
                }

                // Adjust paths and set active states
                const adjustedHTML = adjustPaths(html, basePath);
                const finalHTML = setActiveNavigation(adjustedHTML);
                
                // Insert navigation at the beginning of body
                const navContainer = document.createElement('div');
                navContainer.innerHTML = finalHTML;
                const existingNav = document.querySelector('nav');
                if (existingNav) existingNav.replaceWith(navContainer.firstElementChild);
                else document.body.insertBefore(navContainer.firstElementChild, document.body.firstChild);
                
                // Initialize mobile menu functionality
                initializeMobileMenu();
            })
            .catch(error => {
                console.warn('Could not load navigation:', error);
                // Fallback: you could create a minimal navigation here if needed
            });
    }
    
    // Function to initialize mobile menu toggle
    function initializeMobileMenu() {
        const mobileMenuButton = document.querySelector('.mobile-menu-button');
        const mobileNav = document.querySelector('.mobile-nav');
        
        if (mobileMenuButton && mobileNav) {
            mobileMenuButton.addEventListener('click', function() {
                mobileNav.classList.toggle('hidden');
                mobileMenuButton.setAttribute('aria-expanded', String(!mobileNav.classList.contains('hidden')));
            });
        }
    }
    
    // Load navigation when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadNavigation);
    } else {
        loadNavigation();
    }
    
})();