// Performance optimization utilities
// Handles debouncing, throttling, loading states, and error handling

/**
 * Performance optimization utilities
 * Requirement 9.5: Implement performance optimizations
 * Requirement 10.3: Add error handling for data fetching
 */
class PerformanceManager {
    constructor() {
        this.loadingStates = new Map();
        this.errorStates = new Map();
        this.retryAttempts = new Map();
        this.maxRetries = 3;
        this.baseRetryDelay = 1000; // 1 second
    }

    /**
     * Debounce function for search input
     * Requirement 9.5: Implement debounced search to improve performance
     */
    static debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    /**
     * Throttle function for scroll events and frequent operations
     */
    static throttle(func, limit) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Request Animation Frame throttle for smooth animations
     */
    static rafThrottle(func) {
        let rafId = null;
        return function (...args) {
            if (rafId === null) {
                rafId = requestAnimationFrame(() => {
                    func.apply(this, args);
                    rafId = null;
                });
            }
        };
    }

    /**
     * Show loading state for a specific operation
     * Requirement 10.3: Add loading states for data fetching
     */
    showLoadingState(operationId, message = 'Loading...', container = null) {
        // Remove any existing error state
        this.hideErrorState(operationId);
        
        // Create loading element
        const loadingElement = this.createLoadingElement(message);
        loadingElement.setAttribute('data-loading-id', operationId);
        
        // Store loading state
        this.loadingStates.set(operationId, {
            element: loadingElement,
            container: container,
            startTime: Date.now()
        });
        
        // Add to container or body
        if (container) {
            // Clear container and add loading
            container.innerHTML = '';
            container.appendChild(loadingElement);
        } else {
            document.body.appendChild(loadingElement);
        }
        
        console.log(`Loading state shown for: ${operationId}`);
        return loadingElement;
    }

    /**
     * Hide loading state for a specific operation
     */
    hideLoadingState(operationId) {
        const loadingState = this.loadingStates.get(operationId);
        if (loadingState) {
            const duration = Date.now() - loadingState.startTime;
            console.log(`Loading completed for ${operationId} in ${duration}ms`);
            
            if (loadingState.element && loadingState.element.parentNode) {
                loadingState.element.parentNode.removeChild(loadingState.element);
            }
            this.loadingStates.delete(operationId);
        }
    }

    /**
     * Show error state with retry option
     * Requirement 10.3: Add error messages for data fetching
     */
    showErrorState(operationId, error, retryCallback = null, container = null) {
        // Hide any existing loading state
        this.hideLoadingState(operationId);
        
        // Create error element
        const errorElement = this.createErrorElement(error, retryCallback, operationId);
        errorElement.setAttribute('data-error-id', operationId);
        
        // Store error state
        this.errorStates.set(operationId, {
            element: errorElement,
            container: container,
            error: error,
            retryCallback: retryCallback
        });
        
        // Add to container or body
        if (container) {
            container.innerHTML = '';
            container.appendChild(errorElement);
        } else {
            document.body.appendChild(errorElement);
        }
        
        console.error(`Error state shown for ${operationId}:`, error);
        return errorElement;
    }

    /**
     * Hide error state for a specific operation
     */
    hideErrorState(operationId) {
        const errorState = this.errorStates.get(operationId);
        if (errorState) {
            if (errorState.element && errorState.element.parentNode) {
                errorState.element.parentNode.removeChild(errorState.element);
            }
            this.errorStates.delete(operationId);
        }
    }

    /**
     * Execute operation with retry logic
     * Requirement 10.3: Create retry mechanisms for failed CSV loads
     */
    async executeWithRetry(operationId, operation, options = {}) {
        const maxRetries = options.maxRetries || this.maxRetries;
        const baseDelay = options.baseDelay || this.baseRetryDelay;
        const exponentialBackoff = options.exponentialBackoff !== false;
        
        let lastError;
        let attempt = 0;
        
        // Reset retry count for this operation
        this.retryAttempts.set(operationId, 0);
        
        while (attempt <= maxRetries) {
            try {
                // Show loading state on first attempt
                if (attempt === 0 && options.showLoading) {
                    this.showLoadingState(operationId, options.loadingMessage, options.container);
                }
                
                const result = await operation();
                
                // Success - hide loading and return result
                this.hideLoadingState(operationId);
                this.hideErrorState(operationId);
                this.retryAttempts.delete(operationId);
                
                return result;
                
            } catch (error) {
                lastError = error;
                attempt++;
                this.retryAttempts.set(operationId, attempt);
                
                console.warn(`Attempt ${attempt} failed for ${operationId}:`, error.message);
                
                // If we have more attempts, wait and retry
                if (attempt <= maxRetries) {
                    const delay = exponentialBackoff 
                        ? baseDelay * Math.pow(2, attempt - 1)
                        : baseDelay;
                    
                    console.log(`Retrying ${operationId} in ${delay}ms... (attempt ${attempt + 1}/${maxRetries + 1})`);
                    await this.delay(delay);
                } else {
                    // All attempts failed
                    console.error(`All ${maxRetries + 1} attempts failed for ${operationId}`);
                    
                    // Hide loading and show error
                    this.hideLoadingState(operationId);
                    
                    if (options.showError) {
                        const retryCallback = options.allowManualRetry 
                            ? () => this.executeWithRetry(operationId, operation, options)
                            : null;
                        
                        this.showErrorState(operationId, lastError, retryCallback, options.container);
                    }
                }
            }
        }
        
        throw lastError;
    }

    /**
     * Batch DOM updates for better performance
     * Requirement 9.5: Optimize DOM updates and implement efficient rendering
     */
    batchDOMUpdates(updates) {
        return new Promise((resolve) => {
            requestAnimationFrame(() => {
                const fragment = document.createDocumentFragment();
                
                updates.forEach(update => {
                    if (typeof update === 'function') {
                        update(fragment);
                    } else if (update.element && update.parent) {
                        update.parent.appendChild(update.element);
                    }
                });
                
                resolve(fragment);
            });
        });
    }

    /**
     * Virtual scrolling for large lists
     * Requirement 9.5: Implement efficient rendering for large datasets
     */
    createVirtualScroller(container, items, renderItem, itemHeight = 100) {
        const visibleCount = Math.ceil(container.clientHeight / itemHeight) + 2;
        let startIndex = 0;
        
        const scrollContainer = document.createElement('div');
        scrollContainer.style.height = `${items.length * itemHeight}px`;
        scrollContainer.style.position = 'relative';
        
        const visibleContainer = document.createElement('div');
        visibleContainer.style.position = 'absolute';
        visibleContainer.style.top = '0';
        visibleContainer.style.width = '100%';
        
        scrollContainer.appendChild(visibleContainer);
        container.appendChild(scrollContainer);
        
        const updateVisibleItems = PerformanceManager.throttle(() => {
            const scrollTop = container.scrollTop;
            startIndex = Math.floor(scrollTop / itemHeight);
            const endIndex = Math.min(startIndex + visibleCount, items.length);
            
            // Clear visible container
            visibleContainer.innerHTML = '';
            visibleContainer.style.transform = `translateY(${startIndex * itemHeight}px)`;
            
            // Render visible items
            for (let i = startIndex; i < endIndex; i++) {
                const item = renderItem(items[i], i);
                visibleContainer.appendChild(item);
            }
        }, 16); // ~60fps
        
        container.addEventListener('scroll', updateVisibleItems);
        updateVisibleItems(); // Initial render
        
        return {
            update: (newItems) => {
                items = newItems;
                scrollContainer.style.height = `${items.length * itemHeight}px`;
                updateVisibleItems();
            },
            destroy: () => {
                container.removeEventListener('scroll', updateVisibleItems);
                container.innerHTML = '';
            }
        };
    }

    /**
     * Memory-efficient search with result caching
     */
    createSearchCache(maxSize = 100) {
        const cache = new Map();
        
        return {
            get: (query) => cache.get(query),
            set: (query, results) => {
                if (cache.size >= maxSize) {
                    // Remove oldest entry
                    const firstKey = cache.keys().next().value;
                    cache.delete(firstKey);
                }
                cache.set(query, results);
            },
            clear: () => cache.clear(),
            size: () => cache.size
        };
    }

    /**
     * Create loading element
     */
    createLoadingElement(message) {
        const container = document.createElement('div');
        container.className = 'loading-overlay';
        
        const content = document.createElement('div');
        content.className = 'loading-content';
        
        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        
        const text = document.createElement('div');
        text.className = 'loading-text';
        text.textContent = message;
        
        content.appendChild(spinner);
        content.appendChild(text);
        container.appendChild(content);
        
        return container;
    }

    /**
     * Create error element with retry option
     */
    createErrorElement(error, retryCallback, operationId) {
        const container = document.createElement('div');
        container.className = 'error-overlay';
        
        const content = document.createElement('div');
        content.className = 'error-content';
        
        const icon = document.createElement('div');
        icon.className = 'error-icon';
        icon.innerHTML = '⚠️';
        
        const title = document.createElement('h3');
        title.textContent = 'Something went wrong';
        
        const message = document.createElement('p');
        message.className = 'error-message';
        message.textContent = this.getErrorMessage(error);
        
        content.appendChild(icon);
        content.appendChild(title);
        content.appendChild(message);
        
        // Add retry button if callback provided
        if (retryCallback) {
            const retryButton = document.createElement('button');
            retryButton.className = 'retry-button';
            retryButton.textContent = 'Try Again';
            retryButton.addEventListener('click', () => {
                console.log(`Manual retry triggered for: ${operationId}`);
                retryCallback();
            });
            content.appendChild(retryButton);
        }
        
        // Add details for debugging (in development)
        if (console.debug && error.stack) {
            const details = document.createElement('details');
            details.className = 'error-details';
            
            const summary = document.createElement('summary');
            summary.textContent = 'Technical Details';
            
            const stack = document.createElement('pre');
            stack.textContent = error.stack;
            
            details.appendChild(summary);
            details.appendChild(stack);
            content.appendChild(details);
        }
        
        container.appendChild(content);
        return container;
    }

    /**
     * Get user-friendly error message
     */
    getErrorMessage(error) {
        if (error.name === 'NetworkError' || error.message.includes('fetch')) {
            return 'Unable to load data. Please check your internet connection and try again.';
        } else if (error.message.includes('CSV') || error.message.includes('parse')) {
            return 'There was a problem loading the problem data. The file may be corrupted or in an unexpected format.';
        } else if (error.message.includes('localStorage') || error.message.includes('storage')) {
            return 'Unable to save your progress. Your browser storage may be full or disabled.';
        } else if (error.message.includes('company') || error.message.includes('Company')) {
            return 'Unable to load company information. Please try again later.';
        } else {
            return error.message || 'An unexpected error occurred. Please try again.';
        }
    }

    /**
     * Utility delay function
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Clean up all states
     */
    cleanup() {
        // Hide all loading states
        for (const operationId of this.loadingStates.keys()) {
            this.hideLoadingState(operationId);
        }
        
        // Hide all error states
        for (const operationId of this.errorStates.keys()) {
            this.hideErrorState(operationId);
        }
        
        // Clear retry attempts
        this.retryAttempts.clear();
    }

    /**
     * Get performance metrics
     */
    getMetrics() {
        return {
            activeLoadingStates: this.loadingStates.size,
            activeErrorStates: this.errorStates.size,
            activeRetryAttempts: this.retryAttempts.size
        };
    }
}

/**
 * Enhanced search functionality with debouncing and caching
 */
class SearchManager {
    constructor(options = {}) {
        this.debounceDelay = options.debounceDelay || 300;
        this.minQueryLength = options.minQueryLength || 2;
        this.maxResults = options.maxResults || 100;
        this.cache = new Map();
        this.maxCacheSize = options.maxCacheSize || 50;
        
        // Create debounced search function
        this.debouncedSearch = PerformanceManager.debounce(
            this.performSearch.bind(this),
            this.debounceDelay
        );
    }

    /**
     * Execute search with debouncing and caching
     */
    search(query, searchFunction, callback) {
        const normalizedQuery = query.trim().toLowerCase();
        
        // Check cache first
        if (this.cache.has(normalizedQuery)) {
            const cachedResults = this.cache.get(normalizedQuery);
            callback(cachedResults, true); // true indicates cached result
            return;
        }
        
        // Use debounced search for new queries
        this.debouncedSearch(normalizedQuery, searchFunction, callback);
    }

    /**
     * Perform actual search operation
     */
    async performSearch(query, searchFunction, callback) {
        try {
            if (query.length < this.minQueryLength && query.length > 0) {
                callback([], false);
                return;
            }
            
            const results = await searchFunction(query);
            const limitedResults = results.slice(0, this.maxResults);
            
            // Cache results
            this.cacheResults(query, limitedResults);
            
            callback(limitedResults, false);
            
        } catch (error) {
            console.error('Search error:', error);
            callback([], false, error);
        }
    }

    /**
     * Cache search results
     */
    cacheResults(query, results) {
        // Remove oldest entries if cache is full
        if (this.cache.size >= this.maxCacheSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        
        this.cache.set(query, results);
    }

    /**
     * Clear search cache
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * Get cache statistics
     */
    getCacheStats() {
        return {
            size: this.cache.size,
            maxSize: this.maxCacheSize,
            hitRate: this.cacheHits / (this.cacheHits + this.cacheMisses) || 0
        };
    }
}

/**
 * DOM update optimizer for efficient rendering
 */
class DOMOptimizer {
    constructor() {
        this.pendingUpdates = [];
        this.isUpdateScheduled = false;
    }

    /**
     * Schedule a DOM update to be batched
     */
    scheduleUpdate(updateFunction) {
        this.pendingUpdates.push(updateFunction);
        
        if (!this.isUpdateScheduled) {
            this.isUpdateScheduled = true;
            requestAnimationFrame(() => {
                this.flushUpdates();
            });
        }
    }

    /**
     * Execute all pending updates in a single frame
     */
    flushUpdates() {
        const updates = this.pendingUpdates.splice(0);
        this.isUpdateScheduled = false;
        
        // Execute all updates
        updates.forEach(update => {
            try {
                update();
            } catch (error) {
                console.error('DOM update error:', error);
            }
        });
    }

    /**
     * Batch multiple element creations
     */
    createElementsBatch(elements, parent) {
        const fragment = document.createDocumentFragment();
        
        elements.forEach(elementConfig => {
            const element = document.createElement(elementConfig.tag);
            
            if (elementConfig.className) {
                element.className = elementConfig.className;
            }
            
            if (elementConfig.textContent) {
                element.textContent = elementConfig.textContent;
            }
            
            if (elementConfig.attributes) {
                Object.entries(elementConfig.attributes).forEach(([key, value]) => {
                    element.setAttribute(key, value);
                });
            }
            
            fragment.appendChild(element);
        });
        
        if (parent) {
            parent.appendChild(fragment);
        }
        
        return fragment;
    }
}

// Create global instances
window.performanceManager = new PerformanceManager();
window.searchManager = new SearchManager();
window.domOptimizer = new DOMOptimizer();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        PerformanceManager, 
        SearchManager, 
        DOMOptimizer 
    };
}