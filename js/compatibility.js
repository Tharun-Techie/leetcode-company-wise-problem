// Cross-browser compatibility and polyfills
// Ensures the application works across different browsers and devices

/**
 * Browser Compatibility Manager
 * Requirement 9.5: Test cross-browser compatibility and fix any issues
 */
class CompatibilityManager {
    constructor() {
        this.browserInfo = this.detectBrowser();
        this.featureSupport = this.checkFeatureSupport();
        this.setupPolyfills();
        this.setupCompatibilityFixes();
    }

    /**
     * Detect browser and version
     */
    detectBrowser() {
        const userAgent = navigator.userAgent;
        let browser = 'unknown';
        let version = 'unknown';

        if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
            browser = 'chrome';
            version = userAgent.match(/Chrome\/(\d+)/)?.[1] || 'unknown';
        } else if (userAgent.includes('Firefox')) {
            browser = 'firefox';
            version = userAgent.match(/Firefox\/(\d+)/)?.[1] || 'unknown';
        } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
            browser = 'safari';
            version = userAgent.match(/Version\/(\d+)/)?.[1] || 'unknown';
        } else if (userAgent.includes('Edg')) {
            browser = 'edge';
            version = userAgent.match(/Edg\/(\d+)/)?.[1] || 'unknown';
        } else if (userAgent.includes('MSIE') || userAgent.includes('Trident')) {
            browser = 'ie';
            version = userAgent.match(/(?:MSIE |rv:)(\d+)/)?.[1] || 'unknown';
        }

        return { browser, version: parseInt(version) };
    }

    /**
     * Check feature support
     */
    checkFeatureSupport() {
        return {
            fetch: typeof fetch !== 'undefined',
            localStorage: this.testLocalStorage(),
            sessionStorage: this.testSessionStorage(),
            intersectionObserver: 'IntersectionObserver' in window,
            requestAnimationFrame: 'requestAnimationFrame' in window,
            customElements: 'customElements' in window,
            cssCustomProperties: this.testCSSCustomProperties(),
            cssGrid: this.testCSSGrid(),
            flexbox: this.testFlexbox(),
            webp: this.testWebPSupport(),
            touchEvents: 'ontouchstart' in window,
            pointerEvents: 'PointerEvent' in window,
            passiveEventListeners: this.testPassiveEventListeners(),
            es6Modules: this.testES6Modules(),
            promises: typeof Promise !== 'undefined',
            arrow: this.testArrowFunctions(),
            const: this.testConstLet(),
            templateLiterals: this.testTemplateLiterals()
        };
    }

    /**
     * Set up polyfills for missing features
     */
    setupPolyfills() {
        // Fetch polyfill
        if (!this.featureSupport.fetch) {
            this.polyfillFetch();
        }

        // RequestAnimationFrame polyfill
        if (!this.featureSupport.requestAnimationFrame) {
            this.polyfillRequestAnimationFrame();
        }

        // IntersectionObserver polyfill
        if (!this.featureSupport.intersectionObserver) {
            this.polyfillIntersectionObserver();
        }

        // Promise polyfill
        if (!this.featureSupport.promises) {
            this.polyfillPromise();
        }

        // Array methods polyfills
        this.polyfillArrayMethods();

        // Object methods polyfills
        this.polyfillObjectMethods();

        // String methods polyfills
        this.polyfillStringMethods();
    }

    /**
     * Set up browser-specific compatibility fixes
     */
    setupCompatibilityFixes() {
        // Safari-specific fixes
        if (this.browserInfo.browser === 'safari') {
            this.applySafariFixes();
        }

        // Firefox-specific fixes
        if (this.browserInfo.browser === 'firefox') {
            this.applyFirefoxFixes();
        }

        // Edge-specific fixes
        if (this.browserInfo.browser === 'edge') {
            this.applyEdgeFixes();
        }

        // IE-specific fixes (if still needed)
        if (this.browserInfo.browser === 'ie') {
            this.applyIEFixes();
        }

        // Mobile-specific fixes
        if (this.isMobile()) {
            this.applyMobileFixes();
        }

        // Touch device fixes
        if (this.featureSupport.touchEvents) {
            this.applyTouchFixes();
        }
    }

    /**
     * Test localStorage availability
     */
    testLocalStorage() {
        try {
            const test = 'test';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Test sessionStorage availability
     */
    testSessionStorage() {
        try {
            const test = 'test';
            sessionStorage.setItem(test, test);
            sessionStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Test CSS custom properties support
     */
    testCSSCustomProperties() {
        return window.CSS && CSS.supports && CSS.supports('color', 'var(--test)');
    }

    /**
     * Test CSS Grid support
     */
    testCSSGrid() {
        return window.CSS && CSS.supports && CSS.supports('display', 'grid');
    }

    /**
     * Test Flexbox support
     */
    testFlexbox() {
        return window.CSS && CSS.supports && CSS.supports('display', 'flex');
    }

    /**
     * Test WebP support
     */
    testWebPSupport() {
        return new Promise((resolve) => {
            const webP = new Image();
            webP.onload = webP.onerror = () => {
                resolve(webP.height === 2);
            };
            webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
        });
    }

    /**
     * Test passive event listeners support
     */
    testPassiveEventListeners() {
        let passiveSupported = false;
        try {
            const options = {
                get passive() {
                    passiveSupported = true;
                    return false;
                }
            };
            window.addEventListener('test', null, options);
            window.removeEventListener('test', null, options);
        } catch (err) {
            passiveSupported = false;
        }
        return passiveSupported;
    }

    /**
     * Test ES6 modules support
     */
    testES6Modules() {
        try {
            new Function('import("")');
            return true;
        } catch (err) {
            return false;
        }
    }

    /**
     * Test arrow functions support
     */
    testArrowFunctions() {
        try {
            new Function('() => {}');
            return true;
        } catch (err) {
            return false;
        }
    }

    /**
     * Test const/let support
     */
    testConstLet() {
        try {
            new Function('const test = 1; let test2 = 2;');
            return true;
        } catch (err) {
            return false;
        }
    }

    /**
     * Test template literals support
     */
    testTemplateLiterals() {
        try {
            new Function('`template ${literal}`');
            return true;
        } catch (err) {
            return false;
        }
    }

    /**
     * Fetch polyfill
     */
    polyfillFetch() {
        window.fetch = function(url, options = {}) {
            return new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open(options.method || 'GET', url);
                
                // Set headers
                if (options.headers) {
                    Object.keys(options.headers).forEach(key => {
                        xhr.setRequestHeader(key, options.headers[key]);
                    });
                }
                
                xhr.onload = () => {
                    const response = {
                        ok: xhr.status >= 200 && xhr.status < 300,
                        status: xhr.status,
                        statusText: xhr.statusText,
                        text: () => Promise.resolve(xhr.responseText),
                        json: () => Promise.resolve(JSON.parse(xhr.responseText))
                    };
                    resolve(response);
                };
                
                xhr.onerror = () => reject(new Error('Network error'));
                xhr.send(options.body);
            });
        };
    }

    /**
     * RequestAnimationFrame polyfill
     */
    polyfillRequestAnimationFrame() {
        let lastTime = 0;
        window.requestAnimationFrame = function(callback) {
            const currTime = new Date().getTime();
            const timeToCall = Math.max(0, 16 - (currTime - lastTime));
            const id = window.setTimeout(() => {
                callback(currTime + timeToCall);
            }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
        
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
    }

    /**
     * IntersectionObserver polyfill (simplified)
     */
    polyfillIntersectionObserver() {
        if (!window.IntersectionObserver) {
            window.IntersectionObserver = class {
                constructor(callback, options = {}) {
                    this.callback = callback;
                    this.options = options;
                    this.elements = new Set();
                }
                
                observe(element) {
                    this.elements.add(element);
                    // Simplified: assume all elements are intersecting
                    setTimeout(() => {
                        this.callback([{
                            target: element,
                            isIntersecting: true,
                            intersectionRatio: 1
                        }]);
                    }, 100);
                }
                
                unobserve(element) {
                    this.elements.delete(element);
                }
                
                disconnect() {
                    this.elements.clear();
                }
            };
        }
    }

    /**
     * Promise polyfill (simplified)
     */
    polyfillPromise() {
        if (!window.Promise) {
            window.Promise = class {
                constructor(executor) {
                    this.state = 'pending';
                    this.value = undefined;
                    this.handlers = [];
                    
                    const resolve = (value) => {
                        if (this.state === 'pending') {
                            this.state = 'fulfilled';
                            this.value = value;
                            this.handlers.forEach(handler => handler.onFulfilled(value));
                        }
                    };
                    
                    const reject = (reason) => {
                        if (this.state === 'pending') {
                            this.state = 'rejected';
                            this.value = reason;
                            this.handlers.forEach(handler => handler.onRejected(reason));
                        }
                    };
                    
                    try {
                        executor(resolve, reject);
                    } catch (error) {
                        reject(error);
                    }
                }
                
                then(onFulfilled, onRejected) {
                    return new Promise((resolve, reject) => {
                        const handler = {
                            onFulfilled: (value) => {
                                try {
                                    const result = onFulfilled ? onFulfilled(value) : value;
                                    resolve(result);
                                } catch (error) {
                                    reject(error);
                                }
                            },
                            onRejected: (reason) => {
                                try {
                                    const result = onRejected ? onRejected(reason) : reason;
                                    reject(result);
                                } catch (error) {
                                    reject(error);
                                }
                            }
                        };
                        
                        if (this.state === 'fulfilled') {
                            setTimeout(() => handler.onFulfilled(this.value), 0);
                        } else if (this.state === 'rejected') {
                            setTimeout(() => handler.onRejected(this.value), 0);
                        } else {
                            this.handlers.push(handler);
                        }
                    });
                }
                
                catch(onRejected) {
                    return this.then(null, onRejected);
                }
                
                static resolve(value) {
                    return new Promise(resolve => resolve(value));
                }
                
                static reject(reason) {
                    return new Promise((resolve, reject) => reject(reason));
                }
            };
        }
    }

    /**
     * Array methods polyfills
     */
    polyfillArrayMethods() {
        // Array.from
        if (!Array.from) {
            Array.from = function(arrayLike, mapFn, thisArg) {
                const result = [];
                for (let i = 0; i < arrayLike.length; i++) {
                    const value = mapFn ? mapFn.call(thisArg, arrayLike[i], i) : arrayLike[i];
                    result.push(value);
                }
                return result;
            };
        }

        // Array.includes
        if (!Array.prototype.includes) {
            Array.prototype.includes = function(searchElement, fromIndex = 0) {
                return this.indexOf(searchElement, fromIndex) !== -1;
            };
        }

        // Array.find
        if (!Array.prototype.find) {
            Array.prototype.find = function(predicate, thisArg) {
                for (let i = 0; i < this.length; i++) {
                    if (predicate.call(thisArg, this[i], i, this)) {
                        return this[i];
                    }
                }
                return undefined;
            };
        }

        // Array.findIndex
        if (!Array.prototype.findIndex) {
            Array.prototype.findIndex = function(predicate, thisArg) {
                for (let i = 0; i < this.length; i++) {
                    if (predicate.call(thisArg, this[i], i, this)) {
                        return i;
                    }
                }
                return -1;
            };
        }
    }

    /**
     * Object methods polyfills
     */
    polyfillObjectMethods() {
        // Object.assign
        if (!Object.assign) {
            Object.assign = function(target, ...sources) {
                sources.forEach(source => {
                    if (source) {
                        Object.keys(source).forEach(key => {
                            target[key] = source[key];
                        });
                    }
                });
                return target;
            };
        }

        // Object.keys (for older browsers)
        if (!Object.keys) {
            Object.keys = function(obj) {
                const keys = [];
                for (const key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        keys.push(key);
                    }
                }
                return keys;
            };
        }

        // Object.values
        if (!Object.values) {
            Object.values = function(obj) {
                return Object.keys(obj).map(key => obj[key]);
            };
        }

        // Object.entries
        if (!Object.entries) {
            Object.entries = function(obj) {
                return Object.keys(obj).map(key => [key, obj[key]]);
            };
        }
    }

    /**
     * String methods polyfills
     */
    polyfillStringMethods() {
        // String.includes
        if (!String.prototype.includes) {
            String.prototype.includes = function(search, start = 0) {
                return this.indexOf(search, start) !== -1;
            };
        }

        // String.startsWith
        if (!String.prototype.startsWith) {
            String.prototype.startsWith = function(search, pos = 0) {
                return this.substr(pos, search.length) === search;
            };
        }

        // String.endsWith
        if (!String.prototype.endsWith) {
            String.prototype.endsWith = function(search, length = this.length) {
                return this.substr(length - search.length, search.length) === search;
            };
        }

        // String.repeat
        if (!String.prototype.repeat) {
            String.prototype.repeat = function(count) {
                let result = '';
                for (let i = 0; i < count; i++) {
                    result += this;
                }
                return result;
            };
            }
    }

    /**
     * Safari-specific fixes
     */
    applySafariFixes() {
        // Fix Safari date parsing
        const originalDateParse = Date.parse;
        Date.parse = function(dateString) {
            // Convert YYYY-MM-DD to YYYY/MM/DD for Safari
            if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateString)) {
                dateString = dateString.replace(/-/g, '/');
            }
            return originalDateParse.call(this, dateString);
        };

        // Fix Safari flexbox issues
        const style = document.createElement('style');
        style.textContent = `
            .safari-flex-fix {
                -webkit-flex-shrink: 0;
                flex-shrink: 0;
            }
        `;
        document.head.appendChild(style);

        // Add Safari-specific class
        document.documentElement.classList.add('safari');
    }

    /**
     * Firefox-specific fixes
     */
    applyFirefoxFixes() {
        // Firefox scrollbar styling
        const style = document.createElement('style');
        style.textContent = `
            @-moz-document url-prefix() {
                .custom-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: var(--border-color) transparent;
                }
            }
        `;
        document.head.appendChild(style);

        // Add Firefox-specific class
        document.documentElement.classList.add('firefox');
    }

    /**
     * Edge-specific fixes
     */
    applyEdgeFixes() {
        // Edge CSS Grid fixes
        const style = document.createElement('style');
        style.textContent = `
            @supports (-ms-grid-row: 1) {
                .grid-container {
                    display: -ms-grid;
                }
            }
        `;
        document.head.appendChild(style);

        // Add Edge-specific class
        document.documentElement.classList.add('edge');
    }

    /**
     * IE-specific fixes (legacy support)
     */
    applyIEFixes() {
        // IE11 and below fixes
        const style = document.createElement('style');
        style.textContent = `
            .ie-flex-fix {
                -ms-flex: 1 1 auto;
                flex: 1 1 auto;
            }
            .ie-grid-fallback {
                display: table;
                width: 100%;
            }
            .ie-grid-fallback > * {
                display: table-cell;
                vertical-align: top;
            }
        `;
        document.head.appendChild(style);

        // Add IE-specific class
        document.documentElement.classList.add('ie');

        // Show IE warning
        this.showIEWarning();
    }

    /**
     * Mobile-specific fixes
     */
    applyMobileFixes() {
        // Prevent zoom on input focus (iOS)
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.setAttribute('content', 
                viewport.getAttribute('content') + ', user-scalable=no'
            );
        }

        // Fix iOS Safari 100vh issue
        const style = document.createElement('style');
        style.textContent = `
            .mobile-vh-fix {
                height: 100vh;
                height: -webkit-fill-available;
            }
        `;
        document.head.appendChild(style);

        // Add mobile-specific class
        document.documentElement.classList.add('mobile');
    }

    /**
     * Touch device fixes
     */
    applyTouchFixes() {
        // Improve touch scrolling
        const style = document.createElement('style');
        style.textContent = `
            .touch-scroll {
                -webkit-overflow-scrolling: touch;
                overflow-scrolling: touch;
            }
            
            .touch-action-none {
                touch-action: none;
            }
            
            .touch-action-pan-y {
                touch-action: pan-y;
            }
        `;
        document.head.appendChild(style);

        // Add touch-specific class
        document.documentElement.classList.add('touch');

        // Prevent double-tap zoom
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (event) => {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
    }

    /**
     * Check if device is mobile
     */
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    /**
     * Show IE warning
     */
    showIEWarning() {
        const warning = document.createElement('div');
        warning.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: #f59e0b;
            color: white;
            padding: 10px;
            text-align: center;
            z-index: 10000;
            font-family: Arial, sans-serif;
        `;
        warning.innerHTML = `
            <strong>Outdated Browser Detected:</strong> 
            This website may not work properly in Internet Explorer. 
            Please consider upgrading to a modern browser like Chrome, Firefox, or Edge.
            <button onclick="this.parentNode.style.display='none'" style="margin-left: 10px; background: white; color: #f59e0b; border: none; padding: 5px 10px; cursor: pointer;">
                Dismiss
            </button>
        `;
        document.body.insertBefore(warning, document.body.firstChild);
    }

    /**
     * Get compatibility report
     */
    getCompatibilityReport() {
        return {
            browser: this.browserInfo,
            features: this.featureSupport,
            isMobile: this.isMobile(),
            recommendations: this.getRecommendations()
        };
    }

    /**
     * Get recommendations based on browser capabilities
     */
    getRecommendations() {
        const recommendations = [];

        if (!this.featureSupport.fetch) {
            recommendations.push('Consider upgrading your browser for better network performance');
        }

        if (!this.featureSupport.localStorage) {
            recommendations.push('Local storage is not available - your progress will not be saved');
        }

        if (!this.featureSupport.cssGrid) {
            recommendations.push('CSS Grid is not supported - layout may appear different');
        }

        if (this.browserInfo.browser === 'ie') {
            recommendations.push('Internet Explorer is not fully supported - please use a modern browser');
        }

        return recommendations;
    }

    /**
     * Log compatibility information
     */
    logCompatibilityInfo() {
        console.group('Browser Compatibility Report');
        console.log('Browser:', this.browserInfo);
        console.log('Feature Support:', this.featureSupport);
        console.log('Is Mobile:', this.isMobile());
        console.log('Recommendations:', this.getRecommendations());
        console.groupEnd();
    }
}

// Create global compatibility manager instance
window.compatibilityManager = new CompatibilityManager();

// Log compatibility info in development
if (console.debug) {
    window.compatibilityManager.logCompatibilityInfo();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CompatibilityManager };
}