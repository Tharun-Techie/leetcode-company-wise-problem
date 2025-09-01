// Enhanced error handling and user feedback system
// Provides comprehensive error management with user-friendly messages and recovery options

/**
 * Enhanced Error Handler for better user experience
 * Requirement 9.4: Create comprehensive error boundaries and user-friendly error messages
 * Requirement 10.3: Add error handling for data fetching
 */
class ErrorHandler {
    constructor() {
        this.errorLog = [];
        this.maxLogSize = 100;
        this.errorContainer = null;
        this.setupGlobalErrorHandling();
    }

    /**
     * Set up global error handling
     */
    setupGlobalErrorHandling() {
        // Handle uncaught JavaScript errors
        window.addEventListener('error', (event) => {
            this.handleGlobalError({
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error,
                type: 'javascript'
            });
        });

        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.handleGlobalError({
                message: event.reason?.message || 'Unhandled promise rejection',
                error: event.reason,
                type: 'promise'
            });
        });

        // Handle resource loading errors
        window.addEventListener('error', (event) => {
            if (event.target !== window) {
                this.handleResourceError(event);
            }
        }, true);
    }

    /**
     * Handle global JavaScript errors
     */
    handleGlobalError(errorInfo) {
        console.error('Global error caught:', errorInfo);
        
        // Log the error
        this.logError(errorInfo);
        
        // Show user-friendly error message
        this.showErrorNotification(
            'Something went wrong',
            'An unexpected error occurred. The page will continue to work, but some features may be limited.',
            'warning'
        );
    }

    /**
     * Handle resource loading errors (images, scripts, etc.)
     */
    handleResourceError(event) {
        const target = event.target;
        const resourceType = target.tagName.toLowerCase();
        const resourceUrl = target.src || target.href;
        
        console.warn(`Failed to load ${resourceType}:`, resourceUrl);
        
        // Handle specific resource types
        switch (resourceType) {
            case 'img':
                this.handleImageError(target);
                break;
            case 'script':
                this.handleScriptError(target, resourceUrl);
                break;
            case 'link':
                this.handleStylesheetError(target, resourceUrl);
                break;
        }
    }

    /**
     * Handle image loading errors
     */
    handleImageError(imgElement) {
        // Replace with placeholder or hide
        if (imgElement.classList.contains('company-logo')) {
            // Replace company logo with initials
            const companyName = imgElement.alt.replace(' logo', '');
            const initials = this.getCompanyInitials(companyName);
            
            const placeholder = document.createElement('div');
            placeholder.className = 'company-logo-placeholder';
            placeholder.textContent = initials;
            placeholder.setAttribute('title', companyName);
            
            imgElement.parentNode.replaceChild(placeholder, imgElement);
        } else {
            // Hide broken images
            imgElement.style.display = 'none';
        }
    }

    /**
     * Handle script loading errors
     */
    handleScriptError(scriptElement, url) {
        const errorInfo = {
            message: `Failed to load script: ${url}`,
            type: 'resource',
            resource: 'script',
            url: url
        };
        
        this.logError(errorInfo);
        
        // Show critical error if it's a core script
        if (this.isCoreScript(url)) {
            this.showCriticalError(
                'Core functionality unavailable',
                'Some essential features may not work properly. Please refresh the page.',
                () => window.location.reload()
            );
        }
    }

    /**
     * Handle stylesheet loading errors
     */
    handleStylesheetError(linkElement, url) {
        console.warn(`Failed to load stylesheet: ${url}`);
        
        // Add fallback styles if main CSS fails
        if (url.includes('main.css')) {
            this.addFallbackStyles();
        }
    }

    /**
     * Show user-friendly error notification
     */
    showErrorNotification(title, message, type = 'error', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `error-notification ${type}`;
        notification.innerHTML = `
            <div class="error-notification-content">
                <div class="error-notification-icon">
                    ${this.getNotificationIcon(type)}
                </div>
                <div class="error-notification-text">
                    <div class="error-notification-title">${title}</div>
                    <div class="error-notification-message">${message}</div>
                </div>
                <button class="error-notification-close" aria-label="Close notification">×</button>
            </div>
        `;

        // Add styles
        this.addNotificationStyles(notification, type);

        // Add to page
        document.body.appendChild(notification);

        // Auto-remove after duration
        const timeoutId = setTimeout(() => {
            this.removeNotification(notification);
        }, duration);

        // Manual close handler
        const closeBtn = notification.querySelector('.error-notification-close');
        closeBtn.addEventListener('click', () => {
            clearTimeout(timeoutId);
            this.removeNotification(notification);
        });

        // Animate in
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });

        return notification;
    }

    /**
     * Show critical error modal
     */
    showCriticalError(title, message, retryCallback = null) {
        const modal = document.createElement('div');
        modal.className = 'error-modal-overlay';
        modal.innerHTML = `
            <div class="error-modal">
                <div class="error-modal-header">
                    <div class="error-modal-icon">⚠️</div>
                    <h2 class="error-modal-title">${title}</h2>
                </div>
                <div class="error-modal-body">
                    <p class="error-modal-message">${message}</p>
                </div>
                <div class="error-modal-footer">
                    ${retryCallback ? '<button class="btn btn-primary retry-btn">Retry</button>' : ''}
                    <button class="btn btn-secondary close-btn">Close</button>
                </div>
            </div>
        `;

        // Add styles
        this.addModalStyles(modal);

        // Add event listeners
        const retryBtn = modal.querySelector('.retry-btn');
        const closeBtn = modal.querySelector('.close-btn');

        if (retryBtn && retryCallback) {
            retryBtn.addEventListener('click', () => {
                document.body.removeChild(modal);
                retryCallback();
            });
        }

        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });

        document.body.appendChild(modal);
        return modal;
    }

    /**
     * Handle data loading errors with retry options
     */
    handleDataError(operation, error, retryCallback = null) {
        console.error(`Data error in ${operation}:`, error);
        
        const errorInfo = {
            message: error.message,
            operation: operation,
            type: 'data',
            timestamp: new Date().toISOString()
        };
        
        this.logError(errorInfo);
        
        // Determine error type and show appropriate message
        let title, message;
        
        if (error.message.includes('fetch') || error.message.includes('network')) {
            title = 'Connection Error';
            message = 'Unable to load data. Please check your internet connection and try again.';
        } else if (error.message.includes('CSV') || error.message.includes('parse')) {
            title = 'Data Format Error';
            message = 'There was a problem with the data format. Some information may be missing.';
        } else if (error.message.includes('404')) {
            title = 'Data Not Found';
            message = 'The requested data could not be found. It may have been moved or deleted.';
        } else {
            title = 'Loading Error';
            message = 'Unable to load data. Please try again later.';
        }
        
        if (retryCallback) {
            return this.showCriticalError(title, message, retryCallback);
        } else {
            return this.showErrorNotification(title, message, 'error');
        }
    }

    /**
     * Handle validation errors
     */
    handleValidationError(field, message) {
        console.warn(`Validation error for ${field}:`, message);
        
        // Find the field element and show inline error
        const fieldElement = document.querySelector(`[name="${field}"], #${field}`);
        if (fieldElement) {
            this.showInlineError(fieldElement, message);
        } else {
            this.showErrorNotification('Validation Error', message, 'warning');
        }
    }

    /**
     * Show inline error for form fields
     */
    showInlineError(fieldElement, message) {
        // Remove existing error
        const existingError = fieldElement.parentNode.querySelector('.inline-error');
        if (existingError) {
            existingError.remove();
        }

        // Create error element
        const errorElement = document.createElement('div');
        errorElement.className = 'inline-error';
        errorElement.textContent = message;
        errorElement.style.cssText = `
            color: var(--error-color, #ef4444);
            font-size: 0.875rem;
            margin-top: 0.25rem;
            display: block;
        `;

        // Add after field
        fieldElement.parentNode.insertBefore(errorElement, fieldElement.nextSibling);

        // Add error styling to field
        fieldElement.classList.add('error');
        fieldElement.style.borderColor = 'var(--error-color, #ef4444)';

        // Remove error after 5 seconds
        setTimeout(() => {
            if (errorElement.parentNode) {
                errorElement.remove();
            }
            fieldElement.classList.remove('error');
            fieldElement.style.borderColor = '';
        }, 5000);
    }

    /**
     * Log error for debugging
     */
    logError(errorInfo) {
        const logEntry = {
            ...errorInfo,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        this.errorLog.push(logEntry);
        
        // Limit log size
        if (this.errorLog.length > this.maxLogSize) {
            this.errorLog = this.errorLog.slice(-this.maxLogSize);
        }
        
        // Store in localStorage for debugging
        try {
            localStorage.setItem('leetcode_app_errors', JSON.stringify(this.errorLog.slice(-10)));
        } catch (e) {
            // Ignore localStorage errors
        }
    }

    /**
     * Get error log for debugging
     */
    getErrorLog() {
        return [...this.errorLog];
    }

    /**
     * Clear error log
     */
    clearErrorLog() {
        this.errorLog = [];
        try {
            localStorage.removeItem('leetcode_app_errors');
        } catch (e) {
            // Ignore localStorage errors
        }
    }

    /**
     * Utility methods
     */
    getCompanyInitials(companyName) {
        if (!companyName) return '?';
        return companyName
            .split(' ')
            .map(word => word.charAt(0).toUpperCase())
            .slice(0, 2)
            .join('');
    }

    isCoreScript(url) {
        const coreScripts = ['app.js', 'router.js', 'dataManager.js', 'stateManager.js'];
        return coreScripts.some(script => url.includes(script));
    }

    getNotificationIcon(type) {
        const icons = {
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️',
            success: '✅'
        };
        return icons[type] || icons.error;
    }

    removeNotification(notification) {
        notification.classList.add('hide');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    addNotificationStyles(notification, type) {
        const colors = {
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6',
            success: '#10b981'
        };

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            border-left: 4px solid ${colors[type]};
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            padding: 16px;
            max-width: 400px;
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease-in-out;
        `;

        const content = notification.querySelector('.error-notification-content');
        content.style.cssText = `
            display: flex;
            align-items: flex-start;
            gap: 12px;
        `;

        const icon = notification.querySelector('.error-notification-icon');
        icon.style.cssText = `
            font-size: 20px;
            flex-shrink: 0;
        `;

        const text = notification.querySelector('.error-notification-text');
        text.style.cssText = `
            flex: 1;
        `;

        const title = notification.querySelector('.error-notification-title');
        title.style.cssText = `
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 4px;
        `;

        const message = notification.querySelector('.error-notification-message');
        message.style.cssText = `
            color: #6b7280;
            font-size: 14px;
            line-height: 1.4;
        `;

        const closeBtn = notification.querySelector('.error-notification-close');
        closeBtn.style.cssText = `
            background: none;
            border: none;
            font-size: 18px;
            color: #9ca3af;
            cursor: pointer;
            padding: 0;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        `;
    }

    addModalStyles(modal) {
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10001;
            backdrop-filter: blur(2px);
        `;

        const modalContent = modal.querySelector('.error-modal');
        modalContent.style.cssText = `
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
            max-width: 500px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
        `;

        const header = modal.querySelector('.error-modal-header');
        header.style.cssText = `
            padding: 24px 24px 0;
            text-align: center;
        `;

        const icon = modal.querySelector('.error-modal-icon');
        icon.style.cssText = `
            font-size: 48px;
            margin-bottom: 16px;
        `;

        const title = modal.querySelector('.error-modal-title');
        title.style.cssText = `
            font-size: 20px;
            font-weight: 600;
            color: #1f2937;
            margin: 0;
        `;

        const body = modal.querySelector('.error-modal-body');
        body.style.cssText = `
            padding: 16px 24px;
        `;

        const message = modal.querySelector('.error-modal-message');
        message.style.cssText = `
            color: #6b7280;
            line-height: 1.5;
            margin: 0;
        `;

        const footer = modal.querySelector('.error-modal-footer');
        footer.style.cssText = `
            padding: 0 24px 24px;
            display: flex;
            gap: 12px;
            justify-content: center;
        `;

        // Style buttons
        const buttons = modal.querySelectorAll('.btn');
        buttons.forEach(btn => {
            btn.style.cssText = `
                padding: 8px 16px;
                border-radius: 6px;
                border: none;
                font-weight: 500;
                cursor: pointer;
                transition: background-color 0.2s;
            `;

            if (btn.classList.contains('btn-primary')) {
                btn.style.backgroundColor = '#3b82f6';
                btn.style.color = 'white';
            } else {
                btn.style.backgroundColor = '#f3f4f6';
                btn.style.color = '#374151';
            }
        });
    }

    addFallbackStyles() {
        const fallbackCSS = `
            body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
            .error-notification.show { transform: translateX(0); }
            .error-notification.hide { transform: translateX(100%); }
        `;

        const style = document.createElement('style');
        style.textContent = fallbackCSS;
        document.head.appendChild(style);
    }
}

// Create global error handler instance
window.errorHandler = new ErrorHandler();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ErrorHandler };
}