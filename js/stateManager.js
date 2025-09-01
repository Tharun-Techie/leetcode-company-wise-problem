// State management and localStorage integration
// Handles application state, user progress, and data persistence

class StateManager {
    constructor() {
        this.storageKey = 'leetcode_app_state';
        this.state = {
            solvedProblems: new Set(),
            bookmarkedProblems: new Set(),
            theme: 'light',
            searchQuery: '',
            filters: {
                difficulty: 'all'
            },
            companyProgress: {},
            lastVisited: null,
            version: '1.0.0'
        };
        
        // Event listeners for state changes
        this.listeners = new Map();
        
        // Initialize state from localStorage
        this.loadState();
    }

    /**
     * Load state from localStorage
     * Requirement 4.3: Add state persistence for theme preferences and user progress
     */
    loadState() {
        try {
            const savedState = localStorage.getItem(this.storageKey);
            if (savedState) {
                const parsedState = JSON.parse(savedState);
                
                // Convert arrays back to Sets for solved and bookmarked problems
                if (parsedState.solvedProblems) {
                    this.state.solvedProblems = new Set(parsedState.solvedProblems);
                }
                if (parsedState.bookmarkedProblems) {
                    this.state.bookmarkedProblems = new Set(parsedState.bookmarkedProblems);
                }
                
                // Restore other state properties
                this.state.theme = parsedState.theme || 'light';
                this.state.companyProgress = parsedState.companyProgress || {};
                this.state.lastVisited = parsedState.lastVisited;
                this.state.filters = parsedState.filters || { difficulty: 'all' };
                
                console.log('State loaded from localStorage:', this.state);
            }
        } catch (error) {
            console.warn('Failed to load state from localStorage:', error);
            this.handleStorageError(error);
        }
    }

    /**
     * Save current state to localStorage
     * Requirement 4.1: Save solved problems state in localStorage
     * Requirement 6.2: Implement localStorage persistence for bookmarked problems
     */
    saveState() {
        try {
            const stateToSave = {
                solvedProblems: Array.from(this.state.solvedProblems),
                bookmarkedProblems: Array.from(this.state.bookmarkedProblems),
                theme: this.state.theme,
                companyProgress: this.state.companyProgress,
                lastVisited: new Date().toISOString(),
                filters: this.state.filters,
                version: this.state.version
            };
            
            localStorage.setItem(this.storageKey, JSON.stringify(stateToSave));
            console.log('State saved to localStorage');
        } catch (error) {
            console.error('Failed to save state to localStorage:', error);
            this.handleStorageError(error);
        }
    }

    /**
     * Update solved status for a problem
     * Requirement 4.4: Create methods to update solved/unsolved problem states
     * Requirement 4.5: Update visual indicator when problem is marked as solved/unsolved
     */
    updateSolvedStatus(problemId, solved) {
        if (!problemId) {
            console.warn('Invalid problem ID provided');
            return false;
        }

        const wasChanged = solved ? 
            !this.state.solvedProblems.has(problemId) : 
            this.state.solvedProblems.has(problemId);

        if (solved) {
            this.state.solvedProblems.add(problemId);
        } else {
            this.state.solvedProblems.delete(problemId);
        }

        if (wasChanged) {
            this.saveState();
            this.notifyListeners('solvedStatusChanged', { problemId, solved });
        }

        return wasChanged;
    }

    /**
     * Check if a problem is solved
     * Requirement 4.4: Create methods to retrieve solved/unsolved problem states
     */
    isProblemSolved(problemId) {
        return this.state.solvedProblems.has(problemId);
    }

    /**
     * Get all solved problems
     */
    getSolvedProblems() {
        return Array.from(this.state.solvedProblems);
    }

    /**
     * Update bookmark status for a problem
     * Requirement 6.1: Implement bookmark toggle functionality
     * Requirement 6.3: Add localStorage persistence for bookmarked problems
     */
    updateBookmarkStatus(problemId, bookmarked) {
        if (!problemId) {
            console.warn('Invalid problem ID provided');
            return false;
        }

        const wasChanged = bookmarked ? 
            !this.state.bookmarkedProblems.has(problemId) : 
            this.state.bookmarkedProblems.has(problemId);

        if (bookmarked) {
            this.state.bookmarkedProblems.add(problemId);
        } else {
            this.state.bookmarkedProblems.delete(problemId);
        }

        if (wasChanged) {
            this.saveState();
            this.notifyListeners('bookmarkStatusChanged', { problemId, bookmarked });
        }

        return wasChanged;
    }

    /**
     * Check if a problem is bookmarked
     * Requirement 6.4: Restore bookmarked problems from localStorage
     */
    isProblemBookmarked(problemId) {
        return this.state.bookmarkedProblems.has(problemId);
    }

    /**
     * Get all bookmarked problems
     */
    getBookmarkedProblems() {
        return Array.from(this.state.bookmarkedProblems);
    }

    /**
     * Update theme preference
     * Requirement 8.2: Remember user's theme preference from localStorage
     */
    updateTheme(theme) {
        if (theme !== 'light' && theme !== 'dark') {
            console.warn('Invalid theme provided:', theme);
            return false;
        }

        if (this.state.theme !== theme) {
            this.state.theme = theme;
            this.saveState();
            this.notifyListeners('themeChanged', { theme });
            return true;
        }
        return false;
    }

    /**
     * Get current theme
     */
    getTheme() {
        return this.state.theme;
    }

    /**
     * Update company progress
     * Requirement 4.2: Display progress (X solved out of Y total problems)
     */
    updateCompanyProgress(companyName, solvedCount, totalCount) {
        if (!companyName || typeof solvedCount !== 'number' || typeof totalCount !== 'number') {
            console.warn('Invalid company progress data provided');
            return false;
        }

        this.state.companyProgress[companyName] = {
            solved: solvedCount,
            total: totalCount,
            lastUpdated: new Date().toISOString()
        };

        this.saveState();
        this.notifyListeners('companyProgressChanged', { companyName, solvedCount, totalCount });
        return true;
    }

    /**
     * Get company progress
     */
    getCompanyProgress(companyName) {
        return this.state.companyProgress[companyName] || { solved: 0, total: 0 };
    }

    /**
     * Get all company progress data
     */
    getAllCompanyProgress() {
        return { ...this.state.companyProgress };
    }

    /**
     * Update search query
     */
    updateSearchQuery(query) {
        this.state.searchQuery = query || '';
        this.notifyListeners('searchQueryChanged', { query: this.state.searchQuery });
    }

    /**
     * Get current search query
     */
    getSearchQuery() {
        return this.state.searchQuery;
    }

    /**
     * Update filters
     */
    updateFilters(filters) {
        this.state.filters = { ...this.state.filters, ...filters };
        this.notifyListeners('filtersChanged', { filters: this.state.filters });
    }

    /**
     * Get current filters
     */
    getFilters() {
        return { ...this.state.filters };
    }

    /**
     * Add event listener for state changes
     */
    addEventListener(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);
    }

    /**
     * Remove event listener
     */
    removeEventListener(event, callback) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).delete(callback);
        }
    }

    /**
     * Notify all listeners of a state change
     */
    notifyListeners(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('Error in state change listener:', error);
                }
            });
        }
    }

    /**
     * Handle localStorage errors with fallback strategies
     */
    handleStorageError(error) {
        console.warn('localStorage error, falling back to session storage:', error);
        
        // Try to use sessionStorage as fallback
        try {
            const stateToSave = {
                solvedProblems: Array.from(this.state.solvedProblems),
                bookmarkedProblems: Array.from(this.state.bookmarkedProblems),
                theme: this.state.theme,
                companyProgress: this.state.companyProgress,
                lastVisited: new Date().toISOString(),
                filters: this.state.filters,
                version: this.state.version
            };
            
            sessionStorage.setItem(this.storageKey, JSON.stringify(stateToSave));
            console.log('State saved to sessionStorage as fallback');
        } catch (sessionError) {
            console.error('Both localStorage and sessionStorage failed:', sessionError);
            // Continue with in-memory state only
        }
    }

    /**
     * Clear all stored data
     */
    clearState() {
        try {
            localStorage.removeItem(this.storageKey);
            sessionStorage.removeItem(this.storageKey);
        } catch (error) {
            console.warn('Failed to clear storage:', error);
        }

        // Reset to default state
        this.state = {
            solvedProblems: new Set(),
            bookmarkedProblems: new Set(),
            theme: 'light',
            searchQuery: '',
            filters: { difficulty: 'all' },
            companyProgress: {},
            lastVisited: null,
            version: '1.0.0'
        };

        this.notifyListeners('stateCleared', {});
    }

    /**
     * Export state data for backup
     */
    exportState() {
        return {
            solvedProblems: Array.from(this.state.solvedProblems),
            bookmarkedProblems: Array.from(this.state.bookmarkedProblems),
            theme: this.state.theme,
            companyProgress: this.state.companyProgress,
            lastVisited: this.state.lastVisited,
            filters: this.state.filters,
            version: this.state.version,
            exportDate: new Date().toISOString()
        };
    }

    /**
     * Import state data from backup
     */
    importState(stateData) {
        try {
            if (stateData.solvedProblems) {
                this.state.solvedProblems = new Set(stateData.solvedProblems);
            }
            if (stateData.bookmarkedProblems) {
                this.state.bookmarkedProblems = new Set(stateData.bookmarkedProblems);
            }
            if (stateData.theme) {
                this.state.theme = stateData.theme;
            }
            if (stateData.companyProgress) {
                this.state.companyProgress = stateData.companyProgress;
            }
            if (stateData.filters) {
                this.state.filters = stateData.filters;
            }

            this.saveState();
            this.notifyListeners('stateImported', {});
            return true;
        } catch (error) {
            console.error('Failed to import state:', error);
            return false;
        }
    }

    /**
     * Get state statistics
     */
    getStateStats() {
        return {
            totalSolvedProblems: this.state.solvedProblems.size,
            totalBookmarkedProblems: this.state.bookmarkedProblems.size,
            totalCompanies: Object.keys(this.state.companyProgress).length,
            currentTheme: this.state.theme,
            lastVisited: this.state.lastVisited
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StateManager;
}