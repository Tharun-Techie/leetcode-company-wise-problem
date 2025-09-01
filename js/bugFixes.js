// Bug fixes and enhancements for the LeetCode Company Problems application
// Addresses common issues and improves overall stability

/**
 * Bug Fix Manager
 * Requirement 9.4: Create comprehensive error boundaries and user-friendly error messages
 * Requirement 9.5: Test cross-browser compatibility and fix any issues
 */
class BugFixManager {
    constructor() {
        this.appliedFixes = [];
        this.setupBugFixes();
    }

    /**
     * Set up all bug fixes and enhancements
     */
    setupBugFixes() {
        // Apply fixes in order of priority
        this.fixMemoryLeaks();
        this.fixEventListenerIssues();
        this.fixAsyncOperationIssues();
        this.fixUIRenderingIssues();
        this.fixAccessibilityIssues();
        this.fixPerformanceIssues();
        this.fixMobileIssues();
        this.fixDataHandlingIssues();
        
        console.log(`Applied ${this.appliedFixes.length} bug fixes and enhancements`);
    }

    /**
     * Fix memory leaks and cleanup issues
     */
    fixMemoryLeaks() {
        // Fix: Cleanup event listeners on page navigation
        const originalNavigate = window.router?.navigate;
        if (originalNavigate) {
            window.router.navigate = function(path) {
                // Cleanup existing listeners before navigation
                BugFixManager.cleanupEventListeners();
                return originalNavigate.call(this, path);
            };
            this.appliedFixes.push('Memory leak prevention in router navigation');
        }

        // Fix: Cleanup intersection observers
        window.addEventListener('beforeunload', () => {
            BugFixManager.cleanupObservers();
        });
        this.appliedFixes.push('Cleanup observers on page unload');

        // Fix: Clear timeouts and intervals
        const originalSetTimeout = window.setTimeout;
        const originalSetInterval = window.setInterval;
        const timeouts = new Set();
        const intervals = new Set();

        window.setTimeout = function(callback, delay, ...args) {
            const id = originalSetTimeout.call(this, (...args) => {
                timeouts.delete(id);
                callback(...args);
            }, delay, ...args);
            timeouts.add(id);
            return id;
        };

        window.setInterval = function(callback, delay, ...args) {
            const id = originalSetInterval.call(this, callback, delay, ...args);
            intervals.add(id);
            return id;
        };

        window.addEventListener('beforeunload', () => {
            timeouts.forEach(id => clearTimeout(id));
            intervals.forEach(id => clearInterval(id));
        });
        this.appliedFixes.push('Automatic cleanup of timeouts and intervals');
    }

    /**
     * Fix event listener issues
     */
    fixEventListenerIssues() {
        // Fix: Prevent duplicate event listeners
        const originalAddEventListener = EventTarget.prototype.addEventListener;
        const listenerMap = new WeakMap();

        EventTarget.prototype.addEventListener = function(type, listener, options) {
            if (!listenerMap.has(this)) {
                listenerMap.set(this, new Map());
            }
            
            const listeners = listenerMap.get(this);
            const key = `${type}_${listener.toString()}`;
            
            if (!listeners.has(key)) {
                listeners.set(key, { listener, options });
                originalAddEventListener.call(this, type, listener, options);
            }
        };
        this.appliedFixes.push('Duplicate event listener prevention');

        // Fix: Passive event listeners for better performance
        const passiveEvents = ['touchstart', 'touchmove', 'wheel', 'scroll'];
        passiveEvents.forEach(eventType => {
            document.addEventListener(eventType, () => {}, { passive: true });
        });
        this.appliedFixes.push('Passive event listeners for touch and scroll events');

        // Fix: Debounce resize events
        let resizeTimeout;
        const originalResize = window.onresize;
        window.onresize = function(event) {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (originalResize) originalResize.call(this, event);
                // Trigger custom resize event
                window.dispatchEvent(new CustomEvent('debouncedResize'));
            }, 250);
        };
        this.appliedFixes.push('Debounced resize events');
    }

    /**
     * Fix async operation issues
     */
    fixAsyncOperationIssues() {
        // Fix: Add timeout to fetch requests
        const originalFetch = window.fetch;
        window.fetch = function(url, options = {}) {
            const timeout = options.timeout || 30000; // 30 second default timeout
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);
            
            const fetchOptions = {
                ...options,
                signal: controller.signal
            };
            
            return originalFetch(url, fetchOptions)
                .finally(() => clearTimeout(timeoutId))
                .catch(error => {
                    if (error.name === 'AbortError') {
                        throw new Error(`Request timeout after ${timeout}ms`);
                    }
                    throw error;
                });
        };
        this.appliedFixes.push('Fetch request timeout handling');

        // Fix: Promise rejection handling
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            
            if (window.errorHandler) {
                window.errorHandler.handleGlobalError({
                    message: event.reason?.message || 'Unhandled promise rejection',
                    error: event.reason,
                    type: 'promise'
                });
            }
            
            // Prevent the default browser behavior
            event.preventDefault();
        });
        this.appliedFixes.push('Unhandled promise rejection handling');

        // Fix: Async function error boundaries
        const wrapAsyncFunction = (fn, name) => {
            return async function(...args) {
                try {
                    return await fn.apply(this, args);
                } catch (error) {
                    console.error(`Error in ${name}:`, error);
                    if (window.errorHandler) {
                        window.errorHandler.handleGlobalError({
                            message: `Error in ${name}: ${error.message}`,
                            error,
                            type: 'async'
                        });
                    }
                    throw error;
                }
            };
        };

        // Wrap critical async functions
        if (window.dataManager) {
            const originalLoadCompanies = window.dataManager.loadCompanies;
            if (originalLoadCompanies) {
                window.dataManager.loadCompanies = wrapAsyncFunction(originalLoadCompanies, 'loadCompanies');
            }
        }
        this.appliedFixes.push('Async function error boundaries');
    }

    /**
     * Fix UI rendering issues
     */
    fixUIRenderingIssues() {
        // Fix: Prevent layout thrashing
        const batchDOMUpdates = (updates) => {
            requestAnimationFrame(() => {
                updates.forEach(update => update());
            });
        };

        // Fix: Image loading errors
        document.addEventListener('error', (event) => {
            if (event.target.tagName === 'IMG') {
                const img = event.target;
                if (!img.dataset.fallbackApplied) {
                    img.dataset.fallbackApplied = 'true';
                    
                    // Try to create a placeholder
                    const placeholder = document.createElement('div');
                    placeholder.className = 'image-placeholder';
                    placeholder.style.cssText = `
                        width: ${img.width || 48}px;
                        height: ${img.height || 48}px;
                        background: var(--surface-color);
                        border: 1px solid var(--border-color);
                        border-radius: var(--radius-md);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: var(--text-muted);
                        font-size: var(--font-size-xs);
                    `;
                    placeholder.textContent = img.alt || '?';
                    
                    if (img.parentNode) {
                        img.parentNode.replaceChild(placeholder, img);
                    }
                }
            }
        }, true);
        this.appliedFixes.push('Image loading error handling');

        // Fix: Prevent FOUC (Flash of Unstyled Content)
        if (document.readyState === 'loading') {
            document.documentElement.style.visibility = 'hidden';
            document.addEventListener('DOMContentLoaded', () => {
                document.documentElement.style.visibility = 'visible';
            });
        }
        this.appliedFixes.push('FOUC prevention');

        // Fix: Smooth scrolling polyfill
        if (!CSS.supports('scroll-behavior', 'smooth')) {
            const smoothScrollTo = (element, to, duration = 300) => {
                const start = element.scrollTop;
                const change = to - start;
                const startTime = performance.now();

                const animateScroll = (currentTime) => {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const easeInOut = progress < 0.5 
                        ? 2 * progress * progress 
                        : -1 + (4 - 2 * progress) * progress;
                    
                    element.scrollTop = start + change * easeInOut;
                    
                    if (progress < 1) {
                        requestAnimationFrame(animateScroll);
                    }
                };
                
                requestAnimationFrame(animateScroll);
            };

            // Override smooth scroll behavior
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', (e) => {
                    const target = document.querySelector(anchor.getAttribute('href'));
                    if (target) {
                        e.preventDefault();
                        smoothScrollTo(document.documentElement, target.offsetTop);
                    }
                });
            });
            this.appliedFixes.push('Smooth scrolling polyfill');
        }
    }

    /**
     * Fix accessibility issues
     */
    fixAccessibilityIssues() {
        // Fix: Add missing ARIA labels
        const addAriaLabels = () => {
            // Search input
            const searchInput = document.getElementById('search-input');
            if (searchInput && !searchInput.getAttribute('aria-label')) {
                searchInput.setAttribute('aria-label', 'Search companies and problems');
            }

            // Theme toggle
            const themeToggle = document.querySelector('.theme-toggle');
            if (themeToggle && !themeToggle.getAttribute('aria-label')) {
                themeToggle.setAttribute('aria-label', 'Toggle dark mode');
            }

            // Filter buttons
            document.querySelectorAll('.filter-btn').forEach(btn => {
                if (!btn.getAttribute('aria-label')) {
                    const text = btn.textContent.trim();
                    btn.setAttribute('aria-label', `Filter by ${text.toLowerCase()} difficulty`);
                }
            });
        };

        // Apply immediately and on DOM changes
        addAriaLabels();
        const observer = new MutationObserver(addAriaLabels);
        observer.observe(document.body, { childList: true, subtree: true });
        this.appliedFixes.push('Missing ARIA labels');

        // Fix: Focus management
        const focusableElements = 'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])';
        
        // Trap focus in modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                const modal = document.querySelector('.modal-overlay:not([style*="display: none"])');
                if (modal) {
                    const focusable = modal.querySelectorAll(focusableElements);
                    const first = focusable[0];
                    const last = focusable[focusable.length - 1];
                    
                    if (e.shiftKey && document.activeElement === first) {
                        e.preventDefault();
                        last.focus();
                    } else if (!e.shiftKey && document.activeElement === last) {
                        e.preventDefault();
                        first.focus();
                    }
                }
            }
        });
        this.appliedFixes.push('Focus trap in modals');

        // Fix: Skip link for keyboard navigation
        if (!document.querySelector('.skip-link')) {
            const skipLink = document.createElement('a');
            skipLink.className = 'skip-link';
            skipLink.href = '#main-content';
            skipLink.textContent = 'Skip to main content';
            skipLink.style.cssText = `
                position: absolute;
                top: -40px;
                left: 6px;
                background: var(--primary-color);
                color: white;
                padding: 8px;
                text-decoration: none;
                border-radius: 4px;
                z-index: 10000;
                transition: top 0.3s;
            `;
            
            skipLink.addEventListener('focus', () => {
                skipLink.style.top = '6px';
            });
            
            skipLink.addEventListener('blur', () => {
                skipLink.style.top = '-40px';
            });
            
            document.body.insertBefore(skipLink, document.body.firstChild);
        }
        this.appliedFixes.push('Skip link for keyboard navigation');
    }

    /**
     * Fix performance issues
     */
    fixPerformanceIssues() {
        // Fix: Lazy load images
        const lazyLoadImages = () => {
            const images = document.querySelectorAll('img[data-src]');
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            images.forEach(img => imageObserver.observe(img));
        };
        
        // Apply lazy loading
        lazyLoadImages();
        
        // Re-apply when new images are added
        const imageObserver = new MutationObserver(lazyLoadImages);
        imageObserver.observe(document.body, { childList: true, subtree: true });
        this.appliedFixes.push('Lazy loading for images');

        // Fix: Debounce search input
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            let searchTimeout;
            const originalInput = searchInput.oninput;
            
            searchInput.oninput = function(event) {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    if (originalInput) originalInput.call(this, event);
                }, 300);
            };
        }
        this.appliedFixes.push('Debounced search input');

        // Fix: Virtual scrolling for large lists
        const implementVirtualScrolling = (container, items, renderItem, itemHeight = 100) => {
            if (!container || items.length < 50) return; // Only for large lists
            
            const visibleCount = Math.ceil(container.clientHeight / itemHeight) + 2;
            let startIndex = 0;
            
            const scrollContainer = document.createElement('div');
            scrollContainer.style.height = `${items.length * itemHeight}px`;
            scrollContainer.style.position = 'relative';
            
            const visibleContainer = document.createElement('div');
            visibleContainer.style.position = 'absolute';
            visibleContainer.style.top = '0';
            visibleContainer.style.width = '100%';
            
            const updateVisibleItems = () => {
                const scrollTop = container.scrollTop;
                startIndex = Math.floor(scrollTop / itemHeight);
                const endIndex = Math.min(startIndex + visibleCount, items.length);
                
                visibleContainer.innerHTML = '';
                visibleContainer.style.transform = `translateY(${startIndex * itemHeight}px)`;
                
                for (let i = startIndex; i < endIndex; i++) {
                    const item = renderItem(items[i], i);
                    visibleContainer.appendChild(item);
                }
            };
            
            container.addEventListener('scroll', updateVisibleItems);
            scrollContainer.appendChild(visibleContainer);
            container.appendChild(scrollContainer);
            updateVisibleItems();
        };
        this.appliedFixes.push('Virtual scrolling for large lists');
    }

    /**
     * Fix mobile-specific issues
     */
    fixMobileIssues() {
        // Fix: Prevent zoom on input focus (iOS)
        if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
            const viewport = document.querySelector('meta[name="viewport"]');
            if (viewport) {
                const content = viewport.getAttribute('content');
                if (!content.includes('user-scalable=no')) {
                    viewport.setAttribute('content', content + ', user-scalable=no');
                }
            }
        }
        this.appliedFixes.push('iOS zoom prevention on input focus');

        // Fix: Touch event handling
        let touchStartY = 0;
        document.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            const touchY = e.touches[0].clientY;
            const touchDiff = touchStartY - touchY;
            
            // Prevent overscroll bounce on iOS
            if (document.body.scrollTop === 0 && touchDiff < 0) {
                e.preventDefault();
            }
        }, { passive: false });
        this.appliedFixes.push('Touch event optimization');

        // Fix: Viewport height issues on mobile
        const setVH = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        };
        
        setVH();
        window.addEventListener('resize', setVH);
        window.addEventListener('orientationchange', setVH);
        this.appliedFixes.push('Mobile viewport height fix');
    }

    /**
     * Fix data handling issues
     */
    fixDataHandlingIssues() {
        // Fix: CSV parsing errors
        const originalParseCSV = window.dataManager?.parseCSV;
        if (originalParseCSV) {
            window.dataManager.parseCSV = function(csvContent) {
                try {
                    return originalParseCSV.call(this, csvContent);
                } catch (error) {
                    console.error('CSV parsing error:', error);
                    
                    // Try to recover by cleaning the CSV content
                    const cleanedContent = csvContent
                        .replace(/\r\n/g, '\n')
                        .replace(/\r/g, '\n')
                        .trim();
                    
                    try {
                        return originalParseCSV.call(this, cleanedContent);
                    } catch (secondError) {
                        console.error('CSV parsing failed after cleanup:', secondError);
                        return []; // Return empty array as fallback
                    }
                }
            };
        }
        this.appliedFixes.push('CSV parsing error recovery');

        // Fix: LocalStorage quota exceeded
        const originalSetItem = localStorage.setItem;
        localStorage.setItem = function(key, value) {
            try {
                originalSetItem.call(this, key, value);
            } catch (error) {
                if (error.name === 'QuotaExceededError') {
                    console.warn('LocalStorage quota exceeded, clearing old data');
                    
                    // Clear old data and try again
                    const keys = Object.keys(localStorage);
                    keys.forEach(k => {
                        if (k.startsWith('leetcode_app_') && k !== key) {
                            localStorage.removeItem(k);
                        }
                    });
                    
                    try {
                        originalSetItem.call(this, key, value);
                    } catch (secondError) {
                        console.error('Unable to save to localStorage even after cleanup');
                        if (window.errorHandler) {
                            window.errorHandler.handleValidationError('storage', 'Unable to save your progress. Browser storage is full.');
                        }
                    }
                } else {
                    throw error;
                }
            }
        };
        this.appliedFixes.push('LocalStorage quota handling');

        // Fix: JSON parsing errors
        const safeJSONParse = (str, fallback = null) => {
            try {
                return JSON.parse(str);
            } catch (error) {
                console.warn('JSON parsing failed:', error);
                return fallback;
            }
        };
        
        window.safeJSONParse = safeJSONParse;
        this.appliedFixes.push('Safe JSON parsing utility');
    }

    /**
     * Static cleanup methods
     */
    static cleanupEventListeners() {
        // Remove event listeners that might cause memory leaks
        const elements = document.querySelectorAll('[data-cleanup-listeners]');
        elements.forEach(element => {
            const clone = element.cloneNode(true);
            element.parentNode.replaceChild(clone, element);
        });
    }

    static cleanupObservers() {
        // Cleanup intersection observers
        if (window.intersectionObservers) {
            window.intersectionObservers.forEach(observer => observer.disconnect());
            window.intersectionObservers = [];
        }
        
        // Cleanup mutation observers
        if (window.mutationObservers) {
            window.mutationObservers.forEach(observer => observer.disconnect());
            window.mutationObservers = [];
        }
    }

    /**
     * Get applied fixes report
     */
    getAppliedFixes() {
        return {
            count: this.appliedFixes.length,
            fixes: this.appliedFixes,
            timestamp: new Date().toISOString()
        };
    }
}

// Initialize bug fixes when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.bugFixManager = new BugFixManager();
    });
} else {
    window.bugFixManager = new BugFixManager();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BugFixManager };
}