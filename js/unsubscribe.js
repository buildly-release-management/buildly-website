/**
 * Buildly Newsletter Unsubscribe Handler
 * Integrates with Google Sheets to manage unsubscribe requests
 */

// Configuration
const CONFIG = {
    // Google Apps Script Web App URL - updated deployment with CORS support
    GOOGLE_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbzqPRvpiCQM99uuIit1djETda_B1I0s-oAddIriRetY0_WHV7QhsVcOWv7S397wslKd/exec',
    
    // Spreadsheet configuration
    SPREADSHEET_ID: '1FaV09BMGFrcV7XkQijVIPkLYykafur_7p5IhC5kI510',
    
    // Action types
    ACTIONS: {
        UNSUBSCRIBE: 'unsubscribe',
        CHECK_EMAIL: 'check_email'
    }
};

// DOM Elements
let form, loadingState, successMessage, errorMessage, unsubscribeForm;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    setupEventListeners();
    handleURLParameters();
});

function initializeElements() {
    form = document.getElementById('unsubscribe-email-form');
    loadingState = document.getElementById('loading-state');
    successMessage = document.getElementById('success-message');
    errorMessage = document.getElementById('error-message');
    unsubscribeForm = document.getElementById('unsubscribe-form');
}

function setupEventListeners() {
    if (form) {
        form.addEventListener('submit', handleUnsubscribe);
    }
}

function handleURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');
    
    if (email) {
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.value = decodeURIComponent(email);
            // Automatically validate the email if it's pre-filled
            validateEmailInput(emailInput);
        }
    }
}

async function handleUnsubscribe(event) {
    event.preventDefault();
    
    const emailInput = document.getElementById('email');
    const email = emailInput.value.trim().toLowerCase();
    
    if (!email) {
        showError('Please enter a valid email address.');
        return;
    }
    
    if (!isValidEmail(email)) {
        showError('Please enter a valid email address format.');
        return;
    }
    
    setFormLoading(true);
    
    try {
        // First check if email exists in the sheet
        const emailExists = await checkEmailExists(email);
        
        if (!emailExists) {
            showError('Email address not found in our newsletter list. You may already be unsubscribed or never subscribed with this email address.');
            return;
        }
        
        // Process unsubscribe
        await processUnsubscribe(email);
        showSuccess();
        trackUnsubscribe(email);
        
    } catch (error) {
        console.error('Unsubscribe error:', error);
        showError('Unable to process your request. Please try again later or contact support at team@buildly.io');
    } finally {
        setFormLoading(false);
    }
}

async function checkEmailExists(email) {
    const response = await fetch(CONFIG.GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            action: CONFIG.ACTIONS.CHECK_EMAIL,
            email: email
        })
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return result.success && result.exists;
}

async function processUnsubscribe(email) {
    const response = await fetch(CONFIG.GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            action: CONFIG.ACTIONS.UNSUBSCRIBE,
            email: email,
            timestamp: new Date().toISOString(),
            source: 'website-unsubscribe-page',
            userAgent: navigator.userAgent,
            referrer: document.referrer || 'direct'
        })
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
        throw new Error(result.message || 'Unsubscribe failed');
    }
    
    return result;
}

function setFormLoading(loading) {
    const submitButton = form.querySelector('button[type="submit"]');
    const submitText = submitButton.querySelector('.submit-text');
    const loadingText = submitButton.querySelector('.loading-text');
    
    if (loading) {
        submitButton.disabled = true;
        submitText.classList.add('hidden');
        loadingText.classList.remove('hidden');
    } else {
        submitButton.disabled = false;
        submitText.classList.remove('hidden');
        loadingText.classList.add('hidden');
    }
}

function showLoading() {
    hideAll();
    loadingState.classList.remove('hidden');
}

function showSuccess() {
    hideAll();
    successMessage.classList.remove('hidden');
    
    // Scroll to success message
    successMessage.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
    });
}

function showError(message) {
    hideAll();
    const errorText = document.getElementById('error-text');
    if (errorText) {
        errorText.textContent = message;
    }
    errorMessage.classList.remove('hidden');
    
    // Scroll to error message
    errorMessage.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
    });
}

function showUnsubscribeForm() {
    hideAll();
    unsubscribeForm.classList.remove('hidden');
    
    // Reset form
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.focus();
    }
}

function hideAll() {
    unsubscribeForm.classList.add('hidden');
    loadingState.classList.add('hidden');
    successMessage.classList.add('hidden');
    errorMessage.classList.add('hidden');
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validateEmailInput(input) {
    const email = input.value.trim();
    
    if (email && !isValidEmail(email)) {
        input.setCustomValidity('Please enter a valid email address');
    } else {
        input.setCustomValidity('');
    }
}

function trackUnsubscribe(email) {
    // Track unsubscribe event in Google Analytics if available
    if (typeof gtag !== 'undefined') {
        gtag('event', 'unsubscribe', {
            'event_category': 'newsletter',
            'event_label': 'email_unsubscribe',
            'value': 1
        });
    }
    
    // Log for debugging (without exposing full email)
    const maskedEmail = email.replace(/(.{1,3}).*(@.*)/, '$1***$2');
    console.log('Unsubscribe tracked for:', maskedEmail);
}

// Add real-time email validation
document.addEventListener('DOMContentLoaded', function() {
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('input', function() {
            validateEmailInput(this);
        });
        
        emailInput.addEventListener('blur', function() {
            validateEmailInput(this);
        });
    }
});

// Export functions for testing and external access
window.BuildlyUnsubscribe = {
    handleUnsubscribe,
    showUnsubscribeForm,
    isValidEmail,
    checkEmailExists,
    processUnsubscribe
};