// Utility functions and helpers
// Contains common utility functions used throughout the application

/**
 * Utility functions for data validation and manipulation
 */
class Utils {
    /**
     * Sanitize HTML to prevent XSS attacks
     */
    static sanitizeHTML(str) {
        if (!str) return '';
        
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    /**
     * Validate and normalize company name
     */
    static normalizeCompanyName(name) {
        if (!name || typeof name !== 'string') {
            throw new Error('Company name must be a valid string');
        }
        
        return name.trim().replace(/[^a-zA-Z0-9\s-]/g, '');
    }

    /**
     * Format difficulty for display
     */
    static formatDifficulty(difficulty) {
        if (!difficulty) return 'Unknown';
        
        const formatted = difficulty.toString().toLowerCase();
        return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    }

    /**
     * Format acceptance rate as percentage
     */
    static formatAcceptanceRate(rate) {
        if (rate === null || rate === undefined || isNaN(rate)) {
            return 'N/A';
        }
        
        const percentage = (parseFloat(rate) * 100).toFixed(1);
        return `${percentage}%`;
    }

    /**
     * Format frequency score
     */
    static formatFrequency(frequency) {
        if (frequency === null || frequency === undefined || isNaN(frequency)) {
            return 'N/A';
        }
        
        return parseFloat(frequency).toFixed(1);
    }

    /**
     * Enhanced debounce function for search input
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
     * Enhanced throttle function for scroll events and frequent operations
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
     * Measure function execution time for performance monitoring
     */
    static measurePerformance(func, label = 'Operation') {
        return async function (...args) {
            const startTime = performance.now();
            try {
                const result = await func.apply(this, args);
                const endTime = performance.now();
                console.log(`${label} took ${(endTime - startTime).toFixed(2)}ms`);
                return result;
            } catch (error) {
                const endTime = performance.now();
                console.error(`${label} failed after ${(endTime - startTime).toFixed(2)}ms:`, error);
                throw error;
            }
        };
    }

    /**
     * Batch array processing to prevent blocking the main thread
     */
    static async batchProcess(items, processor, batchSize = 10) {
        const results = [];
        
        for (let i = 0; i < items.length; i += batchSize) {
            const batch = items.slice(i, i + batchSize);
            const batchResults = await Promise.all(batch.map(processor));
            results.push(...batchResults);
            
            // Yield control to prevent blocking
            if (i + batchSize < items.length) {
                await new Promise(resolve => setTimeout(resolve, 0));
            }
        }
        
        return results;
    }

    /**
     * Check if localStorage is available
     */
    static isLocalStorageAvailable() {
        try {
            const test = '__localStorage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Safe JSON parse with error handling
     */
    static safeJSONParse(str, defaultValue = null) {
        try {
            return JSON.parse(str);
        } catch (error) {
            console.warn('Failed to parse JSON:', error.message);
            return defaultValue;
        }
    }

    /**
     * Safe JSON stringify with error handling
     */
    static safeJSONStringify(obj, defaultValue = '{}') {
        try {
            return JSON.stringify(obj);
        } catch (error) {
            console.warn('Failed to stringify JSON:', error.message);
            return defaultValue;
        }
    }

    /**
     * Generate a random ID
     */
    static generateId(prefix = 'id') {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Deep clone an object
     */
    static deepClone(obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        
        if (obj instanceof Date) {
            return new Date(obj.getTime());
        }
        
        if (obj instanceof Array) {
            return obj.map(item => Utils.deepClone(item));
        }
        
        if (typeof obj === 'object') {
            const cloned = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    cloned[key] = Utils.deepClone(obj[key]);
                }
            }
            return cloned;
        }
    }

    /**
     * Format number with commas
     */
    static formatNumber(num) {
        if (num === null || num === undefined || isNaN(num)) {
            return '0';
        }
        
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    /**
     * Validate URL format
     */
    static isValidURL(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    /**
     * Extract domain from URL
     */
    static extractDomain(url) {
        try {
            return new URL(url).hostname;
        } catch (_) {
            return '';
        }
    }

    /**
     * Sort problems by various criteria
     */
    static sortProblems(problems, sortBy = 'title', order = 'asc') {
        const sortedProblems = [...problems];
        
        sortedProblems.sort((a, b) => {
            let aValue, bValue;
            
            switch (sortBy) {
                case 'difficulty':
                    const difficultyOrder = { 'EASY': 1, 'MEDIUM': 2, 'HARD': 3 };
                    aValue = difficultyOrder[a.difficulty] || 0;
                    bValue = difficultyOrder[b.difficulty] || 0;
                    break;
                case 'frequency':
                    aValue = a.frequency || 0;
                    bValue = b.frequency || 0;
                    break;
                case 'acceptanceRate':
                    aValue = a.acceptanceRate || 0;
                    bValue = b.acceptanceRate || 0;
                    break;
                case 'title':
                default:
                    aValue = a.title.toLowerCase();
                    bValue = b.title.toLowerCase();
                    break;
            }
            
            if (aValue < bValue) return order === 'asc' ? -1 : 1;
            if (aValue > bValue) return order === 'asc' ? 1 : -1;
            return 0;
        });
        
        return sortedProblems;
    }

    /**
     * Filter problems by various criteria
     */
    static filterProblems(problems, filters = {}) {
        return problems.filter(problem => {
            // Filter by difficulty
            if (filters.difficulty && filters.difficulty !== 'all') {
                if (problem.difficulty !== filters.difficulty.toUpperCase()) {
                    return false;
                }
            }
            
            // Filter by solved status
            if (filters.solved !== undefined) {
                if (problem.solved !== filters.solved) {
                    return false;
                }
            }
            
            // Filter by bookmarked status
            if (filters.bookmarked !== undefined) {
                if (problem.bookmarked !== filters.bookmarked) {
                    return false;
                }
            }
            
            // Filter by search query
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                const titleMatch = problem.title.toLowerCase().includes(searchLower);
                const topicsMatch = problem.topics.some(topic => 
                    topic.toLowerCase().includes(searchLower)
                );
                
                if (!titleMatch && !topicsMatch) {
                    return false;
                }
            }
            
            return true;
        });
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Utils };
}