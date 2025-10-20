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
        // Replace relative paths with adjusted paths
        return html
            .replace(/href="\.\.\/([^"]*)/g, `href="${basePath}$1`)
            .replace(/src="\.\.\/([^"]*)/g, `src="${basePath}$1`)
            .replace(/href="([^h][^"]*\.html)/g, `href="${basePath}$1`) // Non-absolute links
            .replace(/src="([^h][^"]*\.(svg|png|jpg|jpeg))/g, `src="${basePath}$1`); // Image sources
    }
    
    // Function to set active navigation state based on current page
    function setActiveNavigation(navigationHTML) {
        const currentPath = window.location.pathname;
        const parser = new DOMParser();
        const doc = parser.parseFromString(navigationHTML, 'text/html');
        
        // Remove active states first
        doc.querySelectorAll('a').forEach(link => {
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
                // Adjust paths and set active states
                const adjustedHTML = adjustPaths(html, basePath);
                const finalHTML = setActiveNavigation(adjustedHTML);
                
                // Insert navigation at the beginning of body
                const navContainer = document.createElement('div');
                navContainer.innerHTML = finalHTML;
                document.body.insertBefore(navContainer.firstElementChild, document.body.firstChild);
                
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