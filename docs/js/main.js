// Main JavaScript file for Buildly website - GitHub Pages ready

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initMobileNav();
    initSmoothScroll();
    initScrollAnimation();
    initFormHandling();
});

// Mobile navigation toggle
function initMobileNav() {
    const menuButton = document.querySelector('.mobile-menu-button');
    const mobileNav = document.querySelector('.mobile-nav');
    
    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', () => {
            mobileNav.classList.toggle('hidden');
            
            // Update aria-expanded attribute
            const isExpanded = !mobileNav.classList.contains('hidden');
            menuButton.setAttribute('aria-expanded', isExpanded.toString());
        });
        
        // Close mobile menu when clicking on links
        mobileNav.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                mobileNav.classList.add('hidden');
                menuButton.setAttribute('aria-expanded', 'false');
            }
        });
    }
}

// Smooth scrolling for anchor links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 80; // Account for fixed header
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Animation on scroll
function initScrollAnimation() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    elements.forEach(element => {
        observer.observe(element);
    });
}

// Form handling and validation
function initFormHandling() {
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Basic form validation
            let isValid = true;
            const requiredFields = form.querySelectorAll('input[required], textarea[required]');
            
            requiredFields.forEach(field => {
                field.classList.remove('form-error');
                
                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add('form-error');
                } else if (field.type === 'email' && !isValidEmail(field.value)) {
                    isValid = false;
                    field.classList.add('form-error');
                }
            });
            
            if (isValid) {
                // Simulate form submission
                const submitButton = form.querySelector('button[type="submit"]');
                const originalText = submitButton.textContent;
                
                submitButton.textContent = 'Submitting...';
                submitButton.disabled = true;
                
                // Simulate API call
                setTimeout(() => {
                    alert('Thank you for your submission! We\'ll be in touch soon.');
                    form.reset();
                    submitButton.textContent = originalText;
                    submitButton.disabled = false;
                }, 1000);
            } else {
                // Show error message
                showNotification('Please fill in all required fields correctly.', 'error');
            }
        });
    });
}

// Email validation helper
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Notification system
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg z-50 ${
        type === 'error' ? 'bg-red-500' : 'bg-green-500'
    } text-white`;
    notification.textContent = message;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Lazy loading for images
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}
