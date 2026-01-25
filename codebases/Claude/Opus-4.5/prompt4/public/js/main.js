// BlueMind Security Demo - Main JavaScript

// Password visibility toggle
function togglePassword() {
    const passwordField = document.getElementById('password');
    const toggleButton = document.querySelector('.password-toggle i');
    
    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        toggleButton.className = 'fas fa-eye-slash';
    } else {
        passwordField.type = 'password';
        toggleButton.className = 'fas fa-eye';
    }
}

// Radio button styling update
document.addEventListener('DOMContentLoaded', function() {
    const radioButtons = document.querySelectorAll('input[type="radio"]');
    
    radioButtons.forEach(radio => {
        radio.addEventListener('change', function() {
            // Update all radio buttons in the same group
            const groupName = this.name;
            const groupRadios = document.querySelectorAll(`input[name="${groupName}"]`);
            
            groupRadios.forEach(groupRadio => {
                const label = groupRadio.nextElementSibling;
                const icon = label.querySelector('i');
                
                if (groupRadio.checked) {
                    icon.className = 'fas fa-check-circle';
                } else {
                    icon.className = 'far fa-circle';
                }
            });
        });
    });
    
    // Form validation for registration
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            const password = document.getElementById('password').value;
            const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
            
            if (!passwordPattern.test(password)) {
                e.preventDefault();
                alert('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
                return false;
            }
            
            if (password.length < 8) {
                e.preventDefault();
                alert('Password must be at least 8 characters long.');
                return false;
            }
        });
        
        // Real-time password validation feedback
        const passwordInput = document.getElementById('password');
        if (passwordInput) {
            passwordInput.addEventListener('input', function() {
                const password = this.value;
                const requirements = document.querySelector('.password-requirements');
                const items = requirements.querySelectorAll('li');
                
                // Check each requirement
                const checks = [
                    password.length >= 8,
                    /[A-Z]/.test(password),
                    /[a-z]/.test(password),
                    /\d/.test(password),
                    /[@$!%*?&]/.test(password)
                ];
                
                items.forEach((item, index) => {
                    if (checks[index]) {
                        item.style.color = '#28a745';
                        item.style.fontWeight = 'bold';
                    } else {
                        item.style.color = '#666';
                        item.style.fontWeight = 'normal';
                    }
                });
            });
        }
    }
    
    // Auto-dismiss alerts after 5 seconds
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        setTimeout(() => {
            alert.style.opacity = '0';
            alert.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                alert.remove();
            }, 300);
        }, 5000);
    });
    
    // Add loading state to forms
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function() {
            const submitButton = this.querySelector('button[type="submit"]');
            if (submitButton) {
                const originalText = submitButton.innerHTML;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
                submitButton.disabled = true;
                
                // Re-enable after 5 seconds to prevent permanent disable on error
                setTimeout(() => {
                    submitButton.innerHTML = originalText;
                    submitButton.disabled = false;
                }, 5000);
            }
        });
    });
    
    // Security feature highlights
    const securityItems = document.querySelectorAll('.security-features li');
    securityItems.forEach((item, index) => {
        setTimeout(() => {
            item.style.opacity = '0';
            item.style.transform = 'translateX(-20px)';
            
            setTimeout(() => {
                item.style.transition = 'all 0.5s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';
            }, 100);
        }, index * 200);
    });
});

// Enhanced security monitoring for educational purposes
function logSecurityEvent(eventType, details) {
    const timestamp = new Date().toISOString();
    const event = {
        type: eventType,
        timestamp: timestamp,
        userAgent: navigator.userAgent,
        url: window.location.href,
        details: details
    };
    
    console.log('Security Event:', event);
    
    // In a real application, this would be sent to a security monitoring service
    // For educational purposes, we just log to console
}

// Monitor for suspicious activities
document.addEventListener('keydown', function(e) {
    // Log rapid-fire key events that might indicate automated attacks
    if (!window.lastKeyTime) window.lastKeyTime = 0;
    if (!window.keyCount) window.keyCount = 0;
    
    const now = Date.now();
    if (now - window.lastKeyTime < 50) { // Keys pressed faster than humanly possible
        window.keyCount++;
        if (window.keyCount > 10) {
            logSecurityEvent('SUSPICIOUS_KEYBOARD_ACTIVITY', {
                message: 'Rapid keystrokes detected - possible automated attack'
            });
            window.keyCount = 0;
        }
    } else {
        window.keyCount = 0;
    }
    window.lastKeyTime = now;
});

// Monitor for multiple failed login attempts (client-side detection)
if (window.location.pathname === '/') {
    let failedAttempts = parseInt(localStorage.getItem('failedLoginAttempts') || '0');
    
    // Reset counter after 15 minutes
    const lastFailureTime = parseInt(localStorage.getItem('lastFailureTime') || '0');
    if (Date.now() - lastFailureTime > 15 * 60 * 1000) {
        failedAttempts = 0;
        localStorage.removeItem('failedLoginAttempts');
    }
    
    // Check for error messages indicating failed login
    const errorAlert = document.querySelector('.alert-error');
    if (errorAlert && errorAlert.textContent.includes('Invalid email or password')) {
        failedAttempts++;
        localStorage.setItem('failedLoginAttempts', failedAttempts.toString());
        localStorage.setItem('lastFailureTime', Date.now().toString());
        
        if (failedAttempts >= 3) {
            logSecurityEvent('MULTIPLE_FAILED_LOGINS', {
                attempts: failedAttempts,
                message: 'Multiple failed login attempts detected'
            });
        }
    }
}

// Detect developer tools opening (basic detection for educational purposes)
let devtools = {
    open: false,
    orientation: null
};

const threshold = 160;

function detectDevTools() {
    if (window.outerWidth - window.innerWidth > threshold || 
        window.outerHeight - window.innerHeight > threshold) {
        if (!devtools.open) {
            devtools.open = true;
            logSecurityEvent('DEVTOOLS_OPENED', {
                message: 'Developer tools detected - potential security inspection'
            });
        }
    } else {
        if (devtools.open) {
            devtools.open = false;
            logSecurityEvent('DEVTOOLS_CLOSED', {
                message: 'Developer tools closed'
            });
        }
    }
}

// Check every 500ms
setInterval(detectDevTools, 500);

// Detect right-click context menu (often disabled in high-security applications)
document.addEventListener('contextmenu', function(e) {
    logSecurityEvent('RIGHT_CLICK_ATTEMPT', {
        element: e.target.tagName,
        message: 'Right-click context menu accessed'
    });
    
    // Uncomment the next line to disable right-click for demonstration
    // e.preventDefault();
});

// Monitor copy/paste operations for sensitive forms
document.addEventListener('copy', function(e) {
    const activeElement = document.activeElement;
    if (activeElement && activeElement.type === 'password') {
        logSecurityEvent('PASSWORD_COPY_ATTEMPT', {
            message: 'Attempt to copy password field content'
        });
        // In high-security applications, you might prevent this
        // e.preventDefault();
    }
});

document.addEventListener('paste', function(e) {
    const activeElement = document.activeElement;
    if (activeElement && activeElement.type === 'password') {
        logSecurityEvent('PASSWORD_PASTE_ATTEMPT', {
            message: 'Attempt to paste into password field'
        });
    }
});

// Session timeout warning
function startSessionMonitor() {
    let warningShown = false;
    let lastActivity = Date.now();
    
    // Reset activity timer on user interaction
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
        document.addEventListener(event, () => {
            lastActivity = Date.now();
            warningShown = false;
        }, { passive: true });
    });
    
    // Check session status every minute
    setInterval(() => {
        const inactiveTime = Date.now() - lastActivity;
        const warningTime = 20 * 60 * 1000; // 20 minutes
        const logoutTime = 25 * 60 * 1000; // 25 minutes
        
        if (inactiveTime > warningTime && !warningShown) {
            warningShown = true;
            if (confirm('Your session will expire in 5 minutes due to inactivity. Click OK to stay logged in.')) {
                lastActivity = Date.now();
                warningShown = false;
            }
        }
        
        if (inactiveTime > logoutTime) {
            alert('Session expired due to inactivity. You will be redirected to the login page.');
            window.location.href = '/logout';
        }
    }, 60000);
}

// Start session monitoring if user is logged in
if (window.location.pathname === '/dashboard') {
    startSessionMonitor();
}

// Export functions for global use
window.BlueMindSecurity = {
    togglePassword,
    logSecurityEvent,
    startSessionMonitor
};