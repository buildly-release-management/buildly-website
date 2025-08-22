/**
 * Buildly Website Header Loader
 * Automatically loads common head elements on every page
 */

// Function to load external HTML content
function loadHeader() {
    // Get the current page's directory depth to adjust paths
    const pathDepth = (window.location.pathname.match(/\//g) || []).length - 1;
    const basePath = '../'.repeat(Math.max(0, pathDepth - 1));
    
    // Create the full path to the header file
    const headerPath = basePath + 'includes/head.html';
    
    fetch(headerPath)
        .then(response => {
            if (!response.ok) {
                // Try alternative path for root-level pages
                return fetch('includes/head.html');
            }
            return response;
        })
        .then(response => response.text())
        .then(html => {
            // Create a temporary container to parse the HTML
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            
            // Get all elements from the loaded HTML
            const elements = tempDiv.children;
            
            // Append each element to the document head
            for (let element of elements) {
                // Adjust relative paths based on current page location
                if (element.tagName === 'LINK' && element.href) {
                    element.href = adjustPath(element.href, pathDepth);
                } else if (element.tagName === 'SCRIPT' && element.src && element.src.includes('/')) {
                    element.src = adjustPath(element.src, pathDepth);
                }
                
                document.head.appendChild(element.cloneNode(true));
            }
        })
        .catch(error => {
            console.warn('Could not load header file:', error);
            // Fallback: load essential Google Analytics directly
            loadGoogleAnalytics();
        });
}

// Function to adjust relative paths based on directory depth
function adjustPath(path, depth) {
    if (path.startsWith('http') || path.startsWith('//')) {
        return path; // External URL, no adjustment needed
    }
    
    if (path.startsWith('/')) {
        return path; // Absolute path, no adjustment needed
    }
    
    // For relative paths, add appropriate number of "../"
    return '../'.repeat(Math.max(0, depth - 1)) + path;
}

// Fallback function to load Google Analytics if header file fails
function loadGoogleAnalytics() {
    // Load gtag script
    const gtagScript = document.createElement('script');
    gtagScript.async = true;
    gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-YFY5W80XQX';
    document.head.appendChild(gtagScript);
    
    // Initialize gtag
    const initScript = document.createElement('script');
    initScript.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-YFY5W80XQX');
    `;
    document.head.appendChild(initScript);
}

// Load header when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadHeader);
} else {
    loadHeader();
}
