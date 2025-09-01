// Enhanced loading states and skeleton screens
// Provides smooth loading experiences with skeleton screens and progress indicators

/**
 * Loading Manager for enhanced user experience
 * Requirement 9.2: Add loading spinners and skeleton screens for better UX
 * Requirement 9.5: Optimize DOM updates and implement efficient rendering
 */
class LoadingManager {
    constructor() {
        this.activeLoaders = new Map();
        this.skeletonTemplates = new Map();
        this.setupSkeletonTemplates();
    }

    /**
     * Set up skeleton screen templates
     */
    setupSkeletonTemplates() {
        // Company card skeleton
        this.skeletonTemplates.set('company-card', () => {
            const skeleton = document.createElement('div');
            skeleton.className = 'skeleton-card company-card-skeleton';
            skeleton.innerHTML = `
                <div class="skeleton-header">
                    <div class="skeleton-logo"></div>
                    <div class="skeleton-text skeleton-title"></div>
                </div>
                <div class="skeleton-stats">
                    <div class="skeleton-text skeleton-stat short"></div>
                    <div class="skeleton-progress-bar"></div>
                </div>
            `;
            return skeleton;
        });

        // Problem card skeleton
        this.skeletonTemplates.set('problem-card', () => {
            const skeleton = document.createElement('div');
            skeleton.className = 'skeleton-card problem-card-skeleton';
            skeleton.innerHTML = `
                <div class="skeleton-header">
                    <div class="skeleton-text skeleton-title medium"></div>
                    <div class="skeleton-badge"></div>
                </div>
                <div class="skeleton-topics">
                    <div class="skeleton-tag"></div>
                    <div class="skeleton-tag"></div>
                    <div class="skeleton-tag"></div>
                </div>
                <div class="skeleton-meta">
                    <div class="skeleton-text short"></div>
                    <div class="skeleton-text short"></div>
                </div>
            `;
            return skeleton;
        });

        // Search result skeleton
        this.skeletonTemplates.set('search-result', () => {
            const skeleton = document.createElement('div');
            skeleton.className = 'skeleton-card search-result-skeleton';
            skeleton.innerHTML = `
                <div class="skeleton-company-badge"></div>
                <div class="skeleton-text skeleton-title long"></div>
                <div class="skeleton-text medium"></div>
                <div class="skeleton-text short"></div>
            `;
            return skeleton;
        });
    }

    /**
     * Show loading state with optional skeleton screen
     */
    showLoading(containerId, options = {}) {
        const container = typeof containerId === 'string' 
            ? document.getElementById(containerId) 
            : containerId;

        if (!container) {
            console.warn('Loading container not found:', containerId);
            return null;
        }

        const loaderId = options.id || `loader_${Date.now()}`;
        
        // Remove existing loader if any
        this.hideLoading(containerId);

        let loader;

        if (options.skeleton) {
            loader = this.createSkeletonLoader(options.skeleton, options.count || 6);
        } else {
            loader = this.createSpinnerLoader(options.message || 'Loading...');
        }

        loader.setAttribute('data-loader-id', loaderId);
        
        // Clear container and add loader
        container.innerHTML = '';
        container.appendChild(loader);

        // Store loader reference
        this.activeLoaders.set(containerId, {
            element: loader,
            id: loaderId,
            startTime: Date.now()
        });

        // Add loading class to container
        container.classList.add('loading-state');

        return loaderId;
    }

    /**
     * Hide loading state
     */
    hideLoading(containerId) {
        const containerKey = typeof containerId === 'string' ? containerId : containerId.id;
        const loaderInfo = this.activeLoaders.get(containerKey);
        
        if (loaderInfo) {
            const container = typeof containerId === 'string' 
                ? document.getElementById(containerId) 
                : containerId;

            if (container) {
                // Calculate loading duration
                const duration = Date.now() - loaderInfo.startTime;
                console.log(`Loading completed for ${containerKey} in ${duration}ms`);

                // Remove loading class
                container.classList.remove('loading-state');

                // Fade out loader
                loaderInfo.element.style.opacity = '0';
                loaderInfo.element.style.transition = 'opacity 0.3s ease-out';

                setTimeout(() => {
                    if (loaderInfo.element.parentNode) {
                        loaderInfo.element.parentNode.removeChild(loaderInfo.element);
                    }
                }, 300);
            }

            this.activeLoaders.delete(containerKey);
        }
    }

    /**
     * Create skeleton loader
     */
    createSkeletonLoader(skeletonType, count = 6) {
        const container = document.createElement('div');
        container.className = `skeleton-container skeleton-${skeletonType}-container`;

        const template = this.skeletonTemplates.get(skeletonType);
        if (!template) {
            console.warn('Unknown skeleton type:', skeletonType);
            return this.createSpinnerLoader('Loading...');
        }

        // Create multiple skeleton items
        for (let i = 0; i < count; i++) {
            const skeleton = template();
            skeleton.style.animationDelay = `${i * 0.1}s`;
            container.appendChild(skeleton);
        }

        return container;
    }

    /**
     * Create spinner loader
     */
    createSpinnerLoader(message = 'Loading...') {
        const container = document.createElement('div');
        container.className = 'spinner-loader-container';
        container.innerHTML = `
            <div class="spinner-loader">
                <div class="spinner"></div>
                <div class="spinner-message">${message}</div>
            </div>
        `;
        return container;
    }

    /**
     * Show progress bar
     */
    showProgress(containerId, progress = 0, message = '') {
        const container = typeof containerId === 'string' 
            ? document.getElementById(containerId) 
            : containerId;

        if (!container) return null;

        let progressBar = container.querySelector('.progress-loader');
        
        if (!progressBar) {
            progressBar = document.createElement('div');
            progressBar.className = 'progress-loader';
            progressBar.innerHTML = `
                <div class="progress-message">${message}</div>
                <div class="progress-bar-container">
                    <div class="progress-bar-fill"></div>
                </div>
                <div class="progress-percentage">0%</div>
            `;
            container.appendChild(progressBar);
        }

        // Update progress
        const fill = progressBar.querySelector('.progress-bar-fill');
        const percentage = progressBar.querySelector('.progress-percentage');
        const messageEl = progressBar.querySelector('.progress-message');

        if (fill) {
            fill.style.width = `${Math.min(100, Math.max(0, progress))}%`;
        }
        
        if (percentage) {
            percentage.textContent = `${Math.round(progress)}%`;
        }
        
        if (messageEl && message) {
            messageEl.textContent = message;
        }

        return progressBar;
    }

    /**
     * Hide progress bar
     */
    hideProgress(containerId) {
        const container = typeof containerId === 'string' 
            ? document.getElementById(containerId) 
            : containerId;

        if (container) {
            const progressBar = container.querySelector('.progress-loader');
            if (progressBar) {
                progressBar.remove();
            }
        }
    }

    /**
     * Show inline loading for buttons
     */
    showButtonLoading(button, loadingText = 'Loading...') {
        if (!button) return;

        // Store original content
        button.dataset.originalContent = button.innerHTML;
        button.dataset.originalDisabled = button.disabled;

        // Set loading state
        button.disabled = true;
        button.innerHTML = `
            <span class="button-spinner"></span>
            ${loadingText}
        `;
        button.classList.add('loading');
    }

    /**
     * Hide button loading
     */
    hideButtonLoading(button) {
        if (!button) return;

        // Restore original content
        if (button.dataset.originalContent) {
            button.innerHTML = button.dataset.originalContent;
            delete button.dataset.originalContent;
        }

        // Restore disabled state
        button.disabled = button.dataset.originalDisabled === 'true';
        delete button.dataset.originalDisabled;

        button.classList.remove('loading');
    }

    /**
     * Create loading overlay for entire page
     */
    showPageLoading(message = 'Loading...') {
        // Remove existing overlay
        this.hidePageLoading();

        const overlay = document.createElement('div');
        overlay.className = 'page-loading-overlay';
        overlay.innerHTML = `
            <div class="page-loading-content">
                <div class="page-loading-spinner"></div>
                <div class="page-loading-message">${message}</div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Animate in
        requestAnimationFrame(() => {
            overlay.classList.add('show');
        });

        return overlay;
    }

    /**
     * Hide page loading overlay
     */
    hidePageLoading() {
        const overlay = document.querySelector('.page-loading-overlay');
        if (overlay) {
            overlay.classList.add('hide');
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
            }, 300);
        }
    }

    /**
     * Create lazy loading observer for images
     */
    createLazyLoader(options = {}) {
        const defaultOptions = {
            root: null,
            rootMargin: '50px',
            threshold: 0.1
        };

        const config = { ...defaultOptions, ...options };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    // Show loading placeholder
                    img.style.backgroundColor = '#f3f4f6';
                    
                    // Load actual image
                    const actualSrc = img.dataset.src;
                    if (actualSrc) {
                        img.src = actualSrc;
                        img.removeAttribute('data-src');
                        
                        img.onload = () => {
                            img.style.backgroundColor = '';
                            img.classList.add('loaded');
                        };
                        
                        img.onerror = () => {
                            img.style.backgroundColor = '';
                            img.classList.add('error');
                            // Handle image error through error handler
                            if (window.errorHandler) {
                                window.errorHandler.handleImageError(img);
                            }
                        };
                    }
                    
                    observer.unobserve(img);
                }
            });
        }, config);

        return {
            observe: (element) => observer.observe(element),
            unobserve: (element) => observer.unobserve(element),
            disconnect: () => observer.disconnect()
        };
    }

    /**
     * Batch DOM updates for better performance
     */
    batchUpdate(updates) {
        return new Promise((resolve) => {
            requestAnimationFrame(() => {
                const fragment = document.createDocumentFragment();
                
                updates.forEach(update => {
                    if (typeof update === 'function') {
                        update(fragment);
                    }
                });
                
                resolve(fragment);
            });
        });
    }

    /**
     * Get loading statistics
     */
    getStats() {
        return {
            activeLoaders: this.activeLoaders.size,
            loaderIds: Array.from(this.activeLoaders.keys())
        };
    }

    /**
     * Clean up all active loaders
     */
    cleanup() {
        for (const containerId of this.activeLoaders.keys()) {
            this.hideLoading(containerId);
        }
        this.hidePageLoading();
    }
}

// Create global loading manager instance
window.loadingManager = new LoadingManager();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LoadingManager };
}