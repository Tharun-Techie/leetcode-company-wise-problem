// Client-side routing system for hash-based navigation
// Handles navigation between homepage, company pages, and problem detail pages

class Router {
    constructor() {
        this.routes = new Map();
        this.currentRoute = null;
        this.currentParams = {};
        this.history = [];
        this.historyIndex = -1;
        this.beforeNavigateCallbacks = [];
        this.afterNavigateCallbacks = [];
        
        // Initialize router
        this.init();
    }

    /**
     * Initialize the router
     * Requirement 1.2: Navigate between pages
     * Requirement 10.1: Separate files for HTML, CSS, and JavaScript
     */
    init() {
        // Set up default routes
        this.setupDefaultRoutes();
        
        // Listen for hash changes
        window.addEventListener('hashchange', () => this.handleHashChange());
        window.addEventListener('popstate', () => this.handlePopState());
        
        // Handle initial route
        this.handleInitialRoute();
        
        console.log('Router initialized');
    }

    /**
     * Set up default application routes
     * Requirement 1.2: Navigate to company's problem list page
     * Requirement 3.4: Return to company's problem list from problem detail
     */
    setupDefaultRoutes() {
        // Homepage route
        this.addRoute('/', () => this.showHomepage());
        this.addRoute('/home', () => this.showHomepage());
        
        // Company page route - shows problems for a specific company
        this.addRoute('/company/:companyName', (params) => this.showCompanyPage(params.companyName));
        
        // Problem detail page route
        this.addRoute('/company/:companyName/problem/:problemId', (params) => 
            this.showProblemDetail(params.companyName, params.problemId));
        
        // Favorites/bookmarks page
        this.addRoute('/favorites', () => this.showFavoritesPage());
        
        // Search results page
        this.addRoute('/search', () => this.showSearchResults());
        
        console.log('Default routes configured');
    }    
/**
     * Add a route to the router
     * Requirement 10.2: Modular functions with clear responsibilities
     */
    addRoute(path, handler) {
        // Convert path with parameters to regex pattern
        const paramNames = [];
        const regexPath = path.replace(/:([^/]+)/g, (match, paramName) => {
            paramNames.push(paramName);
            return '([^/]+)';
        });
        
        const regex = new RegExp(`^${regexPath}$`);
        
        this.routes.set(path, {
            regex,
            handler,
            paramNames,
            originalPath: path
        });
        
        console.log(`Route added: ${path}`);
    }

    /**
     * Navigate to a specific route
     * Requirement 1.2: Navigate to company's problem list page
     * Requirement 3.4: Back button functionality
     */
    navigate(path, options = {}) {
        const { replace = false, state = null } = options;
        
        // Call before navigate callbacks
        const shouldContinue = this.callBeforeNavigateCallbacks(path, this.currentRoute);
        if (!shouldContinue) {
            return false;
        }
        
        // Update browser history
        if (!replace) {
            this.addToHistory(path, state);
        }
        
        // Update URL hash
        if (window.location.hash !== `#${path}`) {
            if (replace) {
                window.location.replace(`#${path}`);
            } else {
                window.location.hash = path;
            }
        }
        
        // Handle the route
        this.handleRoute(path);
        
        console.log(`Navigated to: ${path}`);
        return true;
    }

    /**
     * Handle hash change events
     * Requirement 3.4: Browser history management
     */
    handleHashChange() {
        const hash = window.location.hash.slice(1) || '/';
        this.handleRoute(hash);
    }

    /**
     * Handle browser back/forward button events
     * Requirement 3.4: Back button functionality
     */
    handlePopState() {
        const hash = window.location.hash.slice(1) || '/';
        this.handleRoute(hash);
    }

    /**
     * Handle initial route when page loads
     */
    handleInitialRoute() {
        const hash = window.location.hash.slice(1) || '/';
        this.handleRoute(hash);
    }

    /**
     * Handle a specific route
     * Requirement 10.2: Modular functions with clear responsibilities
     */
    handleRoute(path) {
        let matchedRoute = null;
        let params = {};
        
        // Find matching route
        for (const [, routeConfig] of this.routes) {
            const match = path.match(routeConfig.regex);
            if (match) {
                matchedRoute = routeConfig;
                
                // Extract parameters
                for (let i = 0; i < routeConfig.paramNames.length; i++) {
                    params[routeConfig.paramNames[i]] = decodeURIComponent(match[i + 1]);
                }
                break;
            }
        }
        
        if (matchedRoute) {
            // Update current route info
            this.currentRoute = path;
            this.currentParams = params;
            
            // Call the route handler
            try {
                matchedRoute.handler(params);
                
                // Call after navigate callbacks
                this.callAfterNavigateCallbacks(path, params);
                
            } catch (error) {
                console.error('Error handling route:', error);
                this.handleRouteError(path, error);
            }
        } else {
            console.warn(`No route found for: ${path}`);
            this.handle404(path);
        }
    }

    /**
     * Add entry to navigation history
     * Requirement 3.4: Browser history management
     */
    addToHistory(path, state = null) {
        // Remove any forward history if we're not at the end
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }
        
        this.history.push({ path, state, timestamp: Date.now() });
        this.historyIndex = this.history.length - 1;
        
        // Limit history size
        if (this.history.length > 50) {
            this.history = this.history.slice(-50);
            this.historyIndex = this.history.length - 1;
        }
    }

    /**
     * Go back in navigation history
     * Requirement 3.4: Back button functionality
     */
    goBack() {
        if (this.canGoBack()) {
            window.history.back();
            return true;
        }
        return false;
    }

    /**
     * Go forward in navigation history
     * Requirement 3.4: Browser history management
     */
    goForward() {
        if (this.canGoForward()) {
            window.history.forward();
            return true;
        }
        return false;
    }

    /**
     * Check if can go back
     */
    canGoBack() {
        return this.historyIndex > 0;
    }

    /**
     * Check if can go forward
     */
    canGoForward() {
        return this.historyIndex < this.history.length - 1;
    }

    /**
     * Get current route information
     */
    getCurrentRoute() {
        return {
            path: this.currentRoute,
            params: this.currentParams
        };
    }

    /**
     * Get navigation history
     */
    getHistory() {
        return [...this.history];
    }

    /**
     * Add before navigate callback
     */
    beforeNavigate(callback) {
        this.beforeNavigateCallbacks.push(callback);
    }

    /**
     * Add after navigate callback
     */
    afterNavigate(callback) {
        this.afterNavigateCallbacks.push(callback);
    }

    /**
     * Call before navigate callbacks
     */
    callBeforeNavigateCallbacks(newPath, currentPath) {
        for (const callback of this.beforeNavigateCallbacks) {
            try {
                const result = callback(newPath, currentPath);
                if (result === false) {
                    return false;
                }
            } catch (error) {
                console.error('Error in before navigate callback:', error);
            }
        }
        return true;
    }

    /**
     * Call after navigate callbacks
     */
    callAfterNavigateCallbacks(path, params) {
        for (const callback of this.afterNavigateCallbacks) {
            try {
                callback(path, params);
            } catch (error) {
                console.error('Error in after navigate callback:', error);
            }
        }
    }

    /**
     * Handle 404 errors
     */
    handle404(path) {
        console.warn(`404: Route not found - ${path}`);
        
        // Try to redirect to homepage
        if (path !== '/') {
            this.navigate('/', { replace: true });
        } else {
            // Show 404 page content
            this.show404Page();
        }
    }

    /**
     * Handle route errors
     */
    handleRouteError(path, error) {
        console.error(`Route error for ${path}:`, error);
        
        // Show error page or redirect to homepage
        this.showErrorPage(error);
    }

    // Route handler methods - these will be implemented by the application
    // Requirement 1.2: Navigate between pages

    /**
     * Show homepage with company cards
     * Requirement 1.1: Display grid of company cards
     */
    showHomepage() {
        console.log('Showing homepage');
        
        // Update page title
        document.title = 'LeetCode Company Problems';
        
        // Update active navigation
        this.updateActiveNavigation('home');
        
        // Show homepage content
        this.showPageContent('homepage');
        
        // Trigger homepage load event
        this.triggerPageEvent('homepage:load');
    }

    /**
     * Show company page with problem list
     * Requirement 1.2: Navigate to company's problem list page
     */
    showCompanyPage(companyName) {
        console.log(`Showing company page: ${companyName}`);
        
        // Update page title
        document.title = `${companyName} Problems - LeetCode Company Problems`;
        
        // Update active navigation
        this.updateActiveNavigation('company');
        
        // Show company page content
        this.showPageContent('company-page', { companyName });
        
        // Trigger company page load event
        this.triggerPageEvent('company-page:load', { companyName });
    }

    /**
     * Show problem detail page
     * Requirement 3.1: Display problem detail page
     */
    showProblemDetail(companyName, problemId) {
        console.log(`Showing problem detail: ${companyName}/${problemId}`);
        
        // Update page title (will be updated with actual problem title later)
        document.title = `Problem Details - ${companyName}`;
        
        // Update active navigation
        this.updateActiveNavigation('problem');
        
        // Show problem detail content
        this.showPageContent('problem-detail', { companyName, problemId });
        
        // Trigger problem detail load event
        this.triggerPageEvent('problem-detail:load', { companyName, problemId });
    }

    /**
     * Show favorites/bookmarks page
     * Requirement 6.2: Display all bookmarked problems
     */
    showFavoritesPage() {
        console.log('Showing favorites page');
        
        // Update page title
        document.title = 'Favorites - LeetCode Company Problems';
        
        // Update active navigation
        this.updateActiveNavigation('favorites');
        
        // Show favorites content
        this.showPageContent('favorites-page');
        
        // Trigger favorites page load event
        this.triggerPageEvent('favorites-page:load');
    }

    /**
     * Show search results page
     * Requirement 2.1: Filter displayed results in real-time
     */
    showSearchResults() {
        console.log('Showing search results');
        
        // Update page title
        document.title = 'Search Results - LeetCode Company Problems';
        
        // Update active navigation
        this.updateActiveNavigation('search');
        
        // Show search results content
        this.showPageContent('search-results');
        
        // Trigger search results load event
        this.triggerPageEvent('search-results:load');
    }

    /**
     * Show 404 page
     */
    show404Page() {
        console.log('Showing 404 page');
        
        // Update page title
        document.title = 'Page Not Found - LeetCode Company Problems';
        
        // Show 404 content
        this.showPageContent('404-page');
    }

    /**
     * Show error page
     */
    showErrorPage(error) {
        console.log('Showing error page:', error);
        
        // Update page title
        document.title = 'Error - LeetCode Company Problems';
        
        // Show error content
        this.showPageContent('error-page', { error });
    }

    /**
     * Update active navigation state
     */
    updateActiveNavigation(activeSection) {
        // Remove active class from all navigation items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Add active class to current section
        const activeNavItem = document.querySelector(`.nav-item[data-section="${activeSection}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }
    }

    /**
     * Show page content and hide others
     * Requirement 10.2: Modular functions with clear responsibilities
     */
    showPageContent(pageId, data = {}) {
        // Hide all page sections
        document.querySelectorAll('.page-section').forEach(section => {
            section.classList.remove('active');
            section.style.display = 'none';
        });
        
        // Show target page section
        const targetSection = document.querySelector(`#${pageId}`);
        if (targetSection) {
            targetSection.classList.add('active');
            targetSection.style.display = 'block';
            
            // Scroll to top
            window.scrollTo(0, 0);
        } else {
            console.warn(`Page section not found: ${pageId}`);
        }
        
        // Store current page data
        this.currentPageData = data;
    }

    /**
     * Trigger page-specific events
     */
    triggerPageEvent(eventName, data = {}) {
        const event = new CustomEvent(eventName, {
            detail: { ...data, router: this }
        });
        window.dispatchEvent(event);
    }

    /**
     * Generate URL for a route with parameters
     * Navigation helper function for programmatic routing
     */
    generateUrl(routePath, params = {}) {
        let url = routePath;
        
        // Replace parameters in the route path
        for (const [key, value] of Object.entries(params)) {
            url = url.replace(`:${key}`, encodeURIComponent(value));
        }
        
        return url;
    }

    /**
     * Check if current route matches a pattern
     */
    isCurrentRoute(pattern) {
        if (!this.currentRoute) return false;
        
        if (typeof pattern === 'string') {
            return this.currentRoute === pattern;
        }
        
        if (pattern instanceof RegExp) {
            return pattern.test(this.currentRoute);
        }
        
        return false;
    }

    /**
     * Get parameter from current route
     */
    getParam(paramName) {
        return this.currentParams[paramName];
    }

    /**
     * Get all parameters from current route
     */
    getParams() {
        return { ...this.currentParams };
    }
}

// Navigation helper functions for programmatic routing
// Requirement 10.2: Modular functions with clear responsibilities

/**
 * Global navigation helpers
 */
window.RouterUtils = {
    // Navigate to homepage
    goHome: () => {
        if (window.router) {
            window.router.navigate('/');
        }
    },
    
    // Navigate to company page
    goToCompany: (companyName) => {
        if (window.router) {
            const url = window.router.generateUrl('/company/:companyName', { companyName });
            window.router.navigate(url);
        }
    },
    
    // Navigate to problem detail
    goToProblem: (companyName, problemId) => {
        if (window.router) {
            const url = window.router.generateUrl('/company/:companyName/problem/:problemId', {
                companyName,
                problemId
            });
            window.router.navigate(url);
        }
    },
    
    // Navigate to favorites
    goToFavorites: () => {
        if (window.router) {
            window.router.navigate('/favorites');
        }
    },
    
    // Navigate to search results
    goToSearch: () => {
        if (window.router) {
            window.router.navigate('/search');
        }
    },
    
    // Go back in history
    goBack: () => {
        if (window.router) {
            return window.router.goBack();
        }
        return false;
    },
    
    // Go forward in history
    goForward: () => {
        if (window.router) {
            return window.router.goForward();
        }
        return false;
    },
    
    // Get current route info
    getCurrentRoute: () => {
        if (window.router) {
            return window.router.getCurrentRoute();
        }
        return null;
    },
    
    // Check if on specific route
    isCurrentRoute: (pattern) => {
        if (window.router) {
            return window.router.isCurrentRoute(pattern);
        }
        return false;
    }
};

// Export Router class for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Router;
}