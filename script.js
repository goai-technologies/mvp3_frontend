// LLMredi Audit Platform - JavaScript Functionality

// Global state management
const AppState = {
    currentUser: null,
    currentDomain: null,
    isLoggedIn: false,
    auditProgress: {
        scraping: 0,
        initialAudit: 0,
        optimizing: 0,
        finalAudit: 0
    }
};

// DOM utility functions
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// Screen management
function showScreen(screenId) {
    // Hide all screens
    $$('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show target screen
    const targetScreen = $(`#${screenId}-screen`);
    if (targetScreen) {
        targetScreen.classList.add('active');
    }
    
    // Show/hide header based on screen
    const header = $('#header');
    if (screenId === 'login') {
        header.style.display = 'none';
    } else {
        header.style.display = 'block';
    }
}

// Authentication functions
function handleLogin(event) {
    event.preventDefault();
    
    const email = $('#email').value;
    const password = $('#password').value;
    
    // Simulate login process
    if (email && password) {
        // Show loading state
        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';
        submitBtn.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
            AppState.isLoggedIn = true;
            AppState.currentUser = {
                email: email,
                name: 'John Doe',
                company: 'Acme Corp'
            };
            
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            
            // Redirect to dashboard
            showScreen('dashboard');
            updateWelcomeMessage();
        }, 1500);
    }
}

function logout() {
    AppState.isLoggedIn = false;
    AppState.currentUser = null;
    AppState.currentDomain = null;
    showScreen('login');
    
    // Reset forms
    $('#email').value = '';
    $('#password').value = '';
    $('#domain').value = '';
}

function updateWelcomeMessage() {
    if (AppState.currentUser) {
        const welcomeSection = $('.welcome-section h1');
        if (welcomeSection) {
            welcomeSection.textContent = `Welcome back, ${AppState.currentUser.name.split(' ')[0]}!`;
        }
    }
}

// Audit functionality
function startAudit(event) {
    event.preventDefault();
    
    const domain = $('#domain').value;
    if (!domain) return;
    
    AppState.currentDomain = domain;
    
    // Update processing screen with domain
    $('#current-domain').textContent = `Analyzing ${domain}...`;
    
    // Show processing screen
    showScreen('processing');
    
    // Start the audit simulation
    simulateAuditProcess();
}

function simulateAuditProcess() {
    // Reset progress
    AppState.auditProgress = {
        scraping: 0,
        initialAudit: 0,
        optimizing: 0,
        finalAudit: 0
    };
    
    // Reset all steps
    $$('.step').forEach(step => step.classList.remove('active'));
    $$('.progress-fill').forEach(fill => fill.style.width = '0%');
    
    // Step 1: Scraping
    setTimeout(() => {
        $('#step-scraping').classList.add('active');
        animateProgress('scraping-progress', 100, 3000);
    }, 500);
    
    // Step 2: Initial Audit
    setTimeout(() => {
        $('#step-scraping').classList.remove('active');
        $('#step-initial-audit').classList.add('active');
        animateProgress('initial-audit-progress', 100, 4000);
    }, 4000);
    
    // Step 3: Optimizing
    setTimeout(() => {
        $('#step-initial-audit').classList.remove('active');
        $('#step-optimizing').classList.add('active');
        animateProgress('optimizing-progress', 100, 5000);
    }, 8500);
    
    // Step 4: Final Audit
    setTimeout(() => {
        $('#step-optimizing').classList.remove('active');
        $('#step-final-audit').classList.add('active');
        animateProgress('final-audit-progress', 100, 3000);
    }, 14000);
    
    // Complete
    setTimeout(() => {
        $('#step-final-audit').classList.remove('active');
        showAuditComplete();
    }, 17500);
}

function animateProgress(elementId, targetWidth, duration) {
    const element = $(`#${elementId}`);
    if (!element) return;
    
    let currentWidth = 0;
    const increment = targetWidth / (duration / 50);
    
    const interval = setInterval(() => {
        currentWidth += increment;
        if (currentWidth >= targetWidth) {
            currentWidth = targetWidth;
            clearInterval(interval);
        }
        element.style.width = `${currentWidth}%`;
    }, 50);
}

function showAuditComplete() {
    // Update report screens with current domain
    $('#report-domain').textContent = `Report for ${AppState.currentDomain}`;
    $('#optimized-report-domain').textContent = `Report for ${AppState.currentDomain} (Optimized)`;
    
    // Show old report first
    showScreen('old-report');
    
    // Show success notification
    showNotification('Audit completed successfully!', 'success');
}

// Report functionality
function viewReport(domain) {
    AppState.currentDomain = domain;
    $('#report-domain').textContent = `Report for ${domain}`;
    $('#optimized-report-domain').textContent = `Report for ${domain} (Optimized)`;
    showScreen('comparison');
}

function downloadReport(type) {
    const filename = `${AppState.currentDomain}-audit-${type}-${new Date().toISOString().split('T')[0]}.pdf`;
    showNotification(`Downloading ${filename}...`, 'info');
    
    // Simulate download
    setTimeout(() => {
        showNotification('Report downloaded successfully!', 'success');
    }, 2000);
}

function downloadComparison() {
    const filename = `${AppState.currentDomain}-comparison-${new Date().toISOString().split('T')[0]}.pdf`;
    showNotification(`Downloading ${filename}...`, 'info');
    
    // Simulate download
    setTimeout(() => {
        showNotification('Comparison report downloaded successfully!', 'success');
    }, 2000);
}

function exportReport(format) {
    const filename = `${AppState.currentDomain}-audit.${format}`;
    showNotification(`Exporting to ${format.toUpperCase()}...`, 'info');
    
    // Simulate export
    setTimeout(() => {
        showNotification(`Report exported as ${filename}!`, 'success');
    }, 2000);
}

// FAQ functionality
function initializeFAQ() {
    $$('.faq-question').forEach(question => {
        question.addEventListener('click', () => {
            const faqItem = question.parentElement;
            const isActive = faqItem.classList.contains('active');
            
            // Close all other FAQ items
            $$('.faq-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Toggle current item
            if (!isActive) {
                faqItem.classList.add('active');
            }
        });
    });
}

// Form handling
function initializeForms() {
    // Profile form
    const profileForm = $('.profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            showNotification('Profile updated successfully!', 'success');
        });
    }
    
    // Support form
    const supportForm = $('.support-form');
    if (supportForm) {
        supportForm.addEventListener('submit', (e) => {
            e.preventDefault();
            showNotification('Support request submitted successfully!', 'success');
            supportForm.reset();
        });
    }
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = $('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add notification styles if not already added
    if (!$('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 100px;
                right: 20px;
                background: white;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                z-index: 1001;
                max-width: 400px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                animation: slideIn 0.3s ease-out;
            }
            
            .notification-success {
                border-left: 4px solid #10B981;
            }
            
            .notification-error {
                border-left: 4px solid #EF4444;
            }
            
            .notification-info {
                border-left: 4px solid #3B82F6;
            }
            
            .notification-warning {
                border-left: 4px solid #F59E0B;
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 0.75rem;
            }
            
            .notification-content i {
                font-size: 1.25rem;
            }
            
            .notification-success .notification-content i {
                color: #10B981;
            }
            
            .notification-error .notification-content i {
                color: #EF4444;
            }
            
            .notification-info .notification-content i {
                color: #3B82F6;
            }
            
            .notification-warning .notification-content i {
                color: #F59E0B;
            }
            
            .notification-close {
                background: none;
                border: none;
                cursor: pointer;
                padding: 0.25rem;
                color: #6B7280;
                margin-left: 1rem;
            }
            
            .notification-close:hover {
                color: #374151;
            }
            
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(styles);
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        info: 'info-circle',
        warning: 'exclamation-triangle'
    };
    return icons[type] || 'info-circle';
}

// Utility functions
function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Animation utilities
function animateScore(element, targetScore, duration = 2000) {
    let currentScore = 0;
    const increment = targetScore / (duration / 50);
    
    const interval = setInterval(() => {
        currentScore += increment;
        if (currentScore >= targetScore) {
            currentScore = targetScore;
            clearInterval(interval);
        }
        element.textContent = Math.floor(currentScore);
    }, 50);
}

// Initialize comparison animations
function initializeComparisons() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bars = entry.target.querySelectorAll('.fill');
                bars.forEach(bar => {
                    const width = bar.style.width;
                    bar.style.width = '0%';
                    setTimeout(() => {
                        bar.style.width = width;
                    }, 500);
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    $$('.comparison-metrics').forEach(metric => {
        observer.observe(metric);
    });
}

// Keyboard navigation
function initializeKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        // ESC to close modals/notifications
        if (e.key === 'Escape') {
            const notification = $('.notification');
            if (notification) {
                notification.remove();
            }
        }
        
        // Tab navigation improvements
        if (e.key === 'Tab') {
            // Add focus styles for better visibility
            document.body.classList.add('keyboard-nav');
        }
    });
    
    // Remove keyboard nav class on mouse use
    document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-nav');
    });
}

// Local storage utilities
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.warn('Failed to save to localStorage:', error);
    }
}

function loadFromLocalStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.warn('Failed to load from localStorage:', error);
        return null;
    }
}

// Initialize app
function initializeApp() {
    // Check if user is already logged in
    const savedUser = loadFromLocalStorage('currentUser');
    if (savedUser) {
        AppState.currentUser = savedUser;
        AppState.isLoggedIn = true;
        showScreen('dashboard');
        updateWelcomeMessage();
    } else {
        showScreen('login');
    }
    
    // Initialize components
    initializeFAQ();
    initializeForms();
    initializeComparisons();
    initializeKeyboardNavigation();
    
    // Add smooth scrolling
    document.documentElement.style.scrollBehavior = 'smooth';
    
    console.log('LLMredi Audit Platform initialized successfully!');
}

// Event listeners for DOMContentLoaded
document.addEventListener('DOMContentLoaded', initializeApp);

// Progressive Web App support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Export functions for global access
window.showScreen = showScreen;
window.handleLogin = handleLogin;
window.logout = logout;
window.startAudit = startAudit;
window.viewReport = viewReport;
window.downloadReport = downloadReport;
window.downloadComparison = downloadComparison;
window.exportReport = exportReport;
