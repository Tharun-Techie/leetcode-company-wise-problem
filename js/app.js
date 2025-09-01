// Main application entry point
// This file will initialize the application and coordinate all components

console.log('LeetCode Company Problems - Application Starting...');

// Global application state
let stateManager;
let router;
let dataManager;
let accessibilityManager;

/**
 * Initialize the application with enhanced company data initialization
 */
async function initializeApp() {
    // Show page loading
    const pageLoadingId = window.loadingManager?.showPageLoading('Initializing application...');
    
    try {
        console.log('🚀 LeetCode Company Problems - Starting Application...');
        
        // Initialize state manager
        console.log('Initializing StateManager...');
        stateManager = new StateManager();
        
        // Initialize data manager
        console.log('Initializing DataManager...');
        dataManager = new DataManager();
        
        // Initialize router
        console.log('Initializing Router...');
        router = new Router();
        
        // Initialize accessibility manager
        console.log('Initializing AccessibilityManager...');
        accessibilityManager = new AccessibilityManager();
        
        // Initialize color contrast validator
        console.log('Initializing ColorContrastValidator...');
        const colorContrastValidator = new ColorContrastValidator();
        
        // Make components globally available
        window.router = router;
        window.dataManager = dataManager;
        window.stateManager = stateManager;
        window.accessibilityManager = accessibilityManager;
        
        // Initialize company data system with error handling
        console.log('Initializing Company Data System...');
        await initializeCompanySystem();
        
        // Set up router event listeners
        setupRouterListeners();
        
        // Set up state change listeners
        setupStateListeners();
        
        // Set up global search functionality
        setupGlobalSearch();
        
        // Apply initial theme
        applyTheme(stateManager.getTheme());
        
        // Set up theme toggle functionality
        setupThemeToggle();
        
        // Set up enhanced error handling
        setupEnhancedErrorHandling();
        
        // Initialize micro-animations
        addMicroAnimations();
        
        console.log('✅ Application initialized successfully');
        console.log('📊 Current state stats:', stateManager.getStateStats());
        
        // Hide page loading
        if (window.loadingManager) {
            window.loadingManager.hidePageLoading();
        }
        
        // Show initialization complete message
        showInitializationComplete();
        
    } catch (error) {
        console.error('❌ Application initialization failed:', error);
        
        // Hide page loading
        if (window.loadingManager) {
            window.loadingManager.hidePageLoading();
        }
        
        // Show error through error handler
        if (window.errorHandler) {
            window.errorHandler.handleDataError('Application Initialization', error, () => {
                window.location.reload();
            });
        } else {
            showInitializationError(error);
        }
    }
}

/**
 * Initialize the company data system
 * Requirement 1.1: Display company names and logos
 * Requirement 1.3: Parse CSV files from company folders to extract problem information
 * Requirement 1.4: Display the total number of problems for that company on the card
 */
async function initializeCompanySystem() {
    try {
        // Initialize company data with performance manager
        const companies = await window.companyInitializer.initialize(
            dataManager, 
            window.performanceManager
        );
        
        console.log(`✅ Company system initialized with ${companies.length} companies`);
        
        // Set up company data refresh callbacks
        window.companyInitializer.onInitialized((companies) => {
            console.log('🔄 Company data refreshed, updating UI...');
            // Trigger UI updates if needed
            if (window.location.hash === '' || window.location.hash === '#home') {
                // Refresh homepage if currently displayed
                setTimeout(() => {
                    if (typeof initializeHomepage === 'function') {
                        initializeHomepage();
                    }
                }, 100);
            }
        });
        
        return companies;
        
    } catch (error) {
        console.error('Company system initialization failed:', error);
        // Don't fail the entire app, just log the error
        // The app can still work with fallback data
        throw error;
    }
}

/**
 * Show initialization complete message
 */
function showInitializationComplete() {
    // Create a temporary success message
    const message = document.createElement('div');
    message.className = 'init-message success';
    message.innerHTML = `
        <div class="init-content">
            <span class="init-icon">✅</span>
            <span class="init-text">Application Ready!</span>
        </div>
    `;
    
    document.body.appendChild(message);
    
    // Remove after 2 seconds
    setTimeout(() => {
        if (message.parentNode) {
            message.parentNode.removeChild(message);
        }
    }, 2000);
}

/**
 * Show initialization error message
 */
function showInitializationError(error) {
    const message = document.createElement('div');
    message.className = 'init-message error';
    message.innerHTML = `
        <div class="init-content">
            <span class="init-icon">❌</span>
            <span class="init-text">Initialization Failed</span>
            <div class="init-details">${error.message}</div>
            <button class="retry-button" onclick="location.reload()">Retry</button>
        </div>
    `;
    
    document.body.appendChild(message);
}

/**
 * Set up router event listeners
 */
function setupRouterListeners() {
    // Listen for page load events
    window.addEventListener('homepage:load', () => {
        console.log('Homepage loaded');
        // Initialize homepage components
        initializeHomepage();
    });
    
    window.addEventListener('company-page:load', (event) => {
        const { companyName } = event.detail;
        console.log(`Company page loaded: ${companyName}`);
        // Initialize company page components
        initializeCompanyPage(companyName);
    });
    
    window.addEventListener('problem-detail:load', (event) => {
        const { companyName, problemId } = event.detail;
        console.log(`Problem detail loaded: ${companyName}/${problemId}`);
        // Initialize problem detail components
        initializeProblemDetail(companyName, problemId);
    });
    
    window.addEventListener('favorites-page:load', () => {
        console.log('Favorites page loaded');
        // Initialize favorites page components
        initializeFavoritesPage();
    });
    
    window.addEventListener('search-results:load', () => {
        console.log('Search results loaded');
        // Initialize search results components
        initializeSearchResults();
    });
    
    // Set up navigation callbacks
    router.beforeNavigate((newPath, currentPath) => {
        console.log(`Navigating from ${currentPath} to ${newPath}`);
        // Perform any cleanup or validation before navigation
        return true; // Allow navigation
    });
    
    router.afterNavigate((path, params) => {
        console.log(`Navigation completed to ${path}`, params);
        // Update any global UI elements after navigation
        updateBreadcrumbs(path, params);
        
        // Add page transition animation
        addPageTransitionAnimation();
    });
}

/**
 * Set up enhanced error handling for the application
 * Requirement 9.4: Create comprehensive error boundaries and user-friendly error messages
 */
function setupEnhancedErrorHandling() {
    // Set up data loading error handlers
    if (window.dataManager && window.errorHandler) {
        // Override data manager methods to include error handling
        const originalLoadCompanies = window.dataManager.loadCompanies;
        window.dataManager.loadCompanies = async function() {
            try {
                return await originalLoadCompanies.call(this);
            } catch (error) {
                window.errorHandler.handleDataError('Loading Companies', error, () => {
                    return originalLoadCompanies.call(this);
                });
                throw error;
            }
        };
        
        const originalLoadCompanyProblems = window.dataManager.loadCompanyProblems;
        window.dataManager.loadCompanyProblems = async function(companyName) {
            try {
                return await originalLoadCompanyProblems.call(this, companyName);
            } catch (error) {
                window.errorHandler.handleDataError(`Loading ${companyName} Problems`, error, () => {
                    return originalLoadCompanyProblems.call(this, companyName);
                });
                throw error;
            }
        };
    }
    
    // Set up state manager error handlers
    if (window.stateManager && window.errorHandler) {
        const originalSaveState = window.stateManager.saveState;
        window.stateManager.saveState = function() {
            try {
                return originalSaveState.call(this);
            } catch (error) {
                window.errorHandler.handleValidationError('state-save', 'Unable to save your progress. Your browser storage may be full.');
                console.warn('State save failed:', error);
            }
        };
    }
    
    console.log('Enhanced error handling configured');
}

/**
 * Set up theme toggle functionality
 * Requirement 8.1: Switch between light and dark modes
 * Requirement 8.2: Remember user's theme preference from localStorage
 */
function setupThemeToggle() {
    const themeToggle = document.querySelector('.theme-toggle');
    
    if (!themeToggle) {
        console.warn('Theme toggle button not found');
        return;
    }
    
    // Theme toggle click handler
    const handleThemeToggle = () => {
        if (stateManager) {
            const currentTheme = stateManager.getTheme();
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            // Update state manager (this will trigger the theme change event)
            stateManager.updateTheme(newTheme);
            
            // Add visual feedback
            themeToggle.style.transform = 'scale(0.95)';
            setTimeout(() => {
                themeToggle.style.transform = 'scale(1)';
            }, 150);
        }
    };
    
    // Add click event listener
    themeToggle.addEventListener('click', handleThemeToggle);
    
    // Add keyboard support (Enter and Space)
    themeToggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleThemeToggle();
        }
    });
    
    // Detect system theme preference if no theme is set
    const detectSystemTheme = () => {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    };
    
    // Listen for system theme changes
    if (window.matchMedia) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', (e) => {
            // Only auto-switch if user hasn't manually set a preference
            const hasManualPreference = localStorage.getItem('leetcode_app_state');
            if (!hasManualPreference && stateManager) {
                const systemTheme = e.matches ? 'dark' : 'light';
                stateManager.updateTheme(systemTheme);
            }
        });
    }
    
    console.log('Theme toggle functionality initialized');
}

/**
 * Set up global search functionality that works from any page
 * Requirement 2.1: Implement real-time search across all problems by title and company
 * Requirement 2.4: Add keyboard shortcut (/) to focus search bar
 */
function setupGlobalSearch() {
    const searchInput = document.getElementById('search-input');
    
    if (!searchInput) {
        console.warn('Global search input not found');
        return;
    }
    
    // Global keyboard shortcut handler (/)
    const handleGlobalKeyboardShortcut = (e) => {
        if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey) {
            // Only focus if not already in an input field
            if (!e.target.matches('input, textarea, [contenteditable]')) {
                e.preventDefault();
                searchInput.focus();
                searchInput.select(); // Select existing text for easy replacement
            }
        }
        
        // Escape key to clear search
        if (e.key === 'Escape' && document.activeElement === searchInput) {
            searchInput.blur();
            searchInput.value = '';
            const searchClear = document.querySelector('.search-clear');
            if (searchClear) {
                searchClear.style.display = 'none';
            }
            // Update state and trigger search clear
            if (stateManager) {
                stateManager.updateSearchQuery('');
            }
        }
    };
    
    // Remove existing listener if any and add new one
    document.removeEventListener('keydown', handleGlobalKeyboardShortcut);
    document.addEventListener('keydown', handleGlobalKeyboardShortcut);
    
    // Enhanced global search with performance optimizations
    const performGlobalSearch = window.searchManager ? 
        window.searchManager.debouncedSearch : 
        PerformanceManager.debounce((query) => {
            // Update state manager with search query
            if (stateManager) {
                stateManager.updateSearchQuery(query);
            }
            
            // If we have a query and we're not on search results page, navigate there
            if (query.length > 0 && !RouterUtils.isCurrentRoute('/search')) {
                RouterUtils.goToSearch();
            } else if (query.length === 0 && RouterUtils.isCurrentRoute('/search')) {
                // If search is cleared and we're on search page, go back to home
                RouterUtils.goHome();
            }
        }, 300);
    
    // Enhanced global search input handler
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        
        // Show/hide clear button
        const searchClear = document.querySelector('.search-clear');
        if (searchClear) {
            searchClear.style.display = query ? 'block' : 'none';
        }
        
        // Perform global search if query is long enough or empty (to clear)
        if (query.length >= 2 || query.length === 0) {
            performGlobalSearch(query);
        }
    });
    
    // Enhanced Enter key handler for immediate search
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const query = e.target.value.trim();
            if (query.length > 0) {
                // Clear timeout and immediately navigate to search
                clearTimeout(globalSearchTimeout);
                if (stateManager) {
                    stateManager.updateSearchQuery(query);
                }
                RouterUtils.goToSearch();
            }
        }
    });
    
    // Clear search handler
    const searchClear = document.querySelector('.search-clear');
    if (searchClear) {
        searchClear.addEventListener('click', () => {
            searchInput.value = '';
            searchClear.style.display = 'none';
            searchInput.focus();
            
            // Clear search and navigate away from search page if needed
            if (stateManager) {
                stateManager.updateSearchQuery('');
            }
            if (RouterUtils.isCurrentRoute('/search')) {
                RouterUtils.goHome();
            }
        });
    }
    
    console.log('Global search functionality initialized');
}

/**
 * Set up event listeners for state changes
 */
function setupStateListeners() {
    // Listen for theme changes
    stateManager.addEventListener('themeChanged', ({ theme }) => {
        console.log('Theme changed to:', theme);
        applyTheme(theme);
    });
    
    // Listen for solved status changes
    stateManager.addEventListener('solvedStatusChanged', ({ problemId, solved }) => {
        console.log(`Problem ${problemId} marked as ${solved ? 'solved' : 'unsolved'}`);
        updateProblemUI(problemId, 'solved', solved);
    });
    
    // Listen for bookmark status changes
    stateManager.addEventListener('bookmarkStatusChanged', ({ problemId, bookmarked }) => {
        console.log(`Problem ${problemId} ${bookmarked ? 'bookmarked' : 'unbookmarked'}`);
        updateProblemUI(problemId, 'bookmarked', bookmarked);
    });
    
    // Listen for company progress changes
    stateManager.addEventListener('companyProgressChanged', ({ companyName, solvedCount, totalCount }) => {
        console.log(`Company ${companyName} progress: ${solvedCount}/${totalCount}`);
        updateCompanyProgressUI(companyName, solvedCount, totalCount);
    });
    
    // Listen for search query changes
    stateManager.addEventListener('searchQueryChanged', ({ query }) => {
        console.log('Search query changed to:', query);
    });
    
    // Listen for filter changes
    stateManager.addEventListener('filtersChanged', ({ filters }) => {
        console.log('Filters changed:', filters);
    });
}

/**
 * Apply theme to the document
 * Requirement 8.1: Switch between light and dark modes
 * Requirement 8.3: Use appropriate dark colors for all UI elements
 * Requirement 8.4: Use appropriate light colors for all UI elements
 */
function applyTheme(theme) {
    // Add transition class for smooth theme switching
    document.documentElement.classList.add('theme-transition');
    
    // Apply theme attribute
    document.documentElement.setAttribute('data-theme', theme);
    
    // Update theme toggle button icons
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        const lightIcon = themeToggle.querySelector('.theme-icon-light');
        const darkIcon = themeToggle.querySelector('.theme-icon-dark');
        
        if (theme === 'dark') {
            if (lightIcon) lightIcon.style.display = 'none';
            if (darkIcon) darkIcon.style.display = 'block';
            themeToggle.setAttribute('aria-label', 'Switch to light theme');
            themeToggle.setAttribute('title', 'Switch to light theme');
        } else {
            if (lightIcon) lightIcon.style.display = 'block';
            if (darkIcon) darkIcon.style.display = 'none';
            themeToggle.setAttribute('aria-label', 'Switch to dark theme');
            themeToggle.setAttribute('title', 'Switch to dark theme');
        }
    }
    
    // Remove transition class after animation completes
    setTimeout(() => {
        document.documentElement.classList.remove('theme-transition');
    }, 350);
    
    console.log(`Theme applied: ${theme}`);
}

/**
 * Update problem UI based on state changes
 */
function updateProblemUI(problemId, type, value) {
    const problemElement = document.querySelector(`[data-problem-id="${problemId}"]`);
    if (problemElement) {
        if (type === 'solved') {
            problemElement.classList.toggle('solved', value);
            const solvedIndicator = problemElement.querySelector('.solved-indicator');
            if (solvedIndicator) {
                solvedIndicator.textContent = value ? '✓' : '';
                solvedIndicator.setAttribute('aria-label', value ? 'Solved' : 'Not solved');
            }
        } else if (type === 'bookmarked') {
            problemElement.classList.toggle('bookmarked', value);
            const bookmarkButton = problemElement.querySelector('.bookmark-button');
            if (bookmarkButton) {
                bookmarkButton.textContent = value ? '★' : '☆';
                bookmarkButton.setAttribute('aria-label', value ? 'Remove bookmark' : 'Add bookmark');
            }
        }
    }
}

/**
 * Update company progress UI
 */
function updateCompanyProgressUI(companyName, solvedCount, totalCount) {
    const companyElement = document.querySelector(`[data-company="${companyName}"]`);
    if (companyElement) {
        const progressElement = companyElement.querySelector('.progress-text');
        if (progressElement) {
            progressElement.textContent = `${solvedCount}/${totalCount} solved`;
        }
        
        const progressBar = companyElement.querySelector('.progress-bar');
        if (progressBar) {
            const percentage = totalCount > 0 ? (solvedCount / totalCount) * 100 : 0;
            progressBar.style.width = `${percentage}%`;
            progressBar.setAttribute('aria-valuenow', percentage);
        }
    }
}

/**
 * Utility functions for state management
 */
window.StateUtils = {
    // Toggle problem solved status
    toggleSolved: (problemId) => {
        if (stateManager) {
            const currentStatus = stateManager.isProblemSolved(problemId);
            return stateManager.updateSolvedStatus(problemId, !currentStatus);
        }
        return false;
    },
    
    // Toggle problem bookmark status
    toggleBookmark: (problemId) => {
        if (stateManager) {
            const currentStatus = stateManager.isProblemBookmarked(problemId);
            return stateManager.updateBookmarkStatus(problemId, !currentStatus);
        }
        return false;
    },
    
    // Toggle theme
    toggleTheme: () => {
        if (stateManager) {
            const currentTheme = stateManager.getTheme();
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            return stateManager.updateTheme(newTheme);
        }
        return false;
    },
    
    // Get state manager instance
    getStateManager: () => stateManager,
    
    // Export state for backup
    exportState: () => {
        if (stateManager) {
            return stateManager.exportState();
        }
        return null;
    },
    
    // Import state from backup
    importState: (stateData) => {
        if (stateManager) {
            return stateManager.importState(stateData);
        }
        return false;
    },
    
    // Clear all state
    clearState: () => {
        if (stateManager) {
            stateManager.clearState();
            return true;
        }
        return false;
    }
};

/**
 * Page initialization functions with enhanced loading states
 * Requirement 9.2: Add loading spinners and skeleton screens for better UX
 */

/**
 * Initialize homepage with company cards and loading states
 * Requirement 1.1: Display a grid of company cards with company names and logos
 */
async function initializeHomepage() {
    console.log('Initializing homepage...');
    
    const companiesGrid = document.getElementById('companies-grid');
    const totalCompaniesEl = document.getElementById('total-companies');
    const totalProblemsEl = document.getElementById('total-problems');
    const solvedProblemsEl = document.getElementById('solved-problems');
    
    if (!companiesGrid) {
        console.warn('Companies grid element not found');
        return;
    }
    
    try {
        // Show skeleton loading for company cards
        const loadingId = window.loadingManager?.showLoading(companiesGrid, {
            skeleton: 'company-card',
            count: 8,
            id: 'homepage-companies'
        });
        
        // Load companies data
        const companies = await dataManager.loadCompanies();
        
        // Hide loading
        if (window.loadingManager) {
            window.loadingManager.hideLoading(companiesGrid);
        }
        
        // Clear grid and add stagger animation class
        companiesGrid.innerHTML = '';
        companiesGrid.classList.add('stagger-animation');
        
        // Calculate stats
        let totalProblems = 0;
        let solvedProblems = 0;
        
        // Create company cards
        companies.forEach((company, index) => {
            const progress = stateManager.getCompanyProgress(company.name);
            const card = UIComponents.createCompanyCard(company, progress);
            
            // Add click handler
            card.addEventListener('click', (e) => {
                e.preventDefault();
                RouterUtils.goToCompany(company.name);
            });
            
            companiesGrid.appendChild(card);
            
            // Update stats
            totalProblems += company.problemCount || 0;
            solvedProblems += progress.solved || 0;
        });
        
        // Update stats with animation
        if (totalCompaniesEl) {
            animateCounter(totalCompaniesEl, companies.length);
        }
        if (totalProblemsEl) {
            animateCounter(totalProblemsEl, totalProblems);
        }
        if (solvedProblemsEl) {
            animateCounter(solvedProblemsEl, solvedProblems);
        }
        
        console.log(`Homepage initialized with ${companies.length} companies`);
        
    } catch (error) {
        console.error('Failed to initialize homepage:', error);
        
        // Hide loading
        if (window.loadingManager) {
            window.loadingManager.hideLoading(companiesGrid);
        }
        
        // Show error state
        if (window.errorHandler) {
            window.errorHandler.handleDataError('Homepage Loading', error, () => {
                initializeHomepage();
            });
        }
    }
}

/**
 * Initialize company page with problem list and loading states
 * Requirement 3.1: Display all problems for a selected company
 */
async function initializeCompanyPage(companyName) {
    console.log(`Initializing company page for: ${companyName}`);
    
    const companyNameEl = document.getElementById('company-name');
    const companyProgressEl = document.getElementById('company-progress');
    const companyProgressFill = document.getElementById('company-progress-fill');
    const problemsGrid = document.getElementById('problems-grid');
    
    if (!problemsGrid) {
        console.warn('Problems grid element not found');
        return;
    }
    
    try {
        // Update company name immediately
        if (companyNameEl) {
            companyNameEl.textContent = companyName;
        }
        
        // Show skeleton loading for problem cards
        const loadingId = window.loadingManager?.showLoading(problemsGrid, {
            skeleton: 'problem-card',
            count: 12,
            id: 'company-problems'
        });
        
        // Load company problems
        const problems = await dataManager.loadCompanyProblems(companyName);
        
        // Hide loading
        if (window.loadingManager) {
            window.loadingManager.hideLoading(problemsGrid);
        }
        
        // Update problem states from state manager
        problems.forEach(problem => {
            problem.solved = stateManager.isProblemSolved(problem.id);
            problem.bookmarked = stateManager.isProblemBookmarked(problem.id);
        });
        
        // Clear grid and add stagger animation
        problemsGrid.innerHTML = '';
        problemsGrid.classList.add('stagger-animation');
        
        // Create problem cards
        problems.forEach(problem => {
            const card = UIComponents.createProblemCard(problem, {
                onClick: (problem) => {
                    RouterUtils.goToProblem(companyName, problem.id);
                }
            });
            problemsGrid.appendChild(card);
        });
        
        // Update progress
        const solvedCount = problems.filter(p => p.solved).length;
        const totalCount = problems.length;
        const percentage = totalCount > 0 ? (solvedCount / totalCount) * 100 : 0;
        
        if (companyProgressEl) {
            companyProgressEl.textContent = `${solvedCount} / ${totalCount} problems solved`;
        }
        
        if (companyProgressFill) {
            // Animate progress bar
            setTimeout(() => {
                companyProgressFill.style.width = `${percentage}%`;
            }, 100);
        }
        
        // Update state manager
        stateManager.updateCompanyProgress(companyName, solvedCount, totalCount);
        
        // Set up filter functionality
        setupProblemFilters(problems);
        
        console.log(`Company page initialized with ${problems.length} problems`);
        
    } catch (error) {
        console.error(`Failed to initialize company page for ${companyName}:`, error);
        
        // Hide loading
        if (window.loadingManager) {
            window.loadingManager.hideLoading(problemsGrid);
        }
        
        // Show error state
        if (window.errorHandler) {
            window.errorHandler.handleDataError(`${companyName} Problems`, error, () => {
                initializeCompanyPage(companyName);
            });
        }
    }
}

/**
 * Initialize problem detail page
 * Requirement 3.1: Display problem title, difficulty, and LeetCode link
 */
async function initializeProblemDetail(companyName, problemId) {
    console.log(`Initializing problem detail: ${companyName}/${problemId}`);
    
    try {
        // Load company problems to find the specific problem
        const problems = await dataManager.loadCompanyProblems(companyName);
        const problem = problems.find(p => p.id === problemId);
        
        if (!problem) {
            throw new Error('Problem not found');
        }
        
        // Update problem state
        problem.solved = stateManager.isProblemSolved(problem.id);
        problem.bookmarked = stateManager.isProblemBookmarked(problem.id);
        
        // Update UI elements
        const titleEl = document.getElementById('problem-title');
        const difficultyEl = document.getElementById('problem-difficulty');
        const frequencyEl = document.getElementById('problem-frequency');
        const acceptanceEl = document.getElementById('problem-acceptance');
        const linkEl = document.getElementById('leetcode-link');
        const topicsEl = document.getElementById('problem-topics');
        
        if (titleEl) {
            titleEl.textContent = problem.title;
            document.title = `${problem.title} - ${companyName}`;
        }
        
        if (difficultyEl) {
            difficultyEl.textContent = Utils.formatDifficulty(problem.difficulty);
            difficultyEl.className = `difficulty-badge ${problem.difficulty.toLowerCase()}`;
        }
        
        if (frequencyEl && problem.frequency) {
            frequencyEl.textContent = `Frequency: ${Utils.formatFrequency(problem.frequency)}`;
        }
        
        if (acceptanceEl && problem.acceptanceRate) {
            acceptanceEl.textContent = `Acceptance: ${Utils.formatAcceptanceRate(problem.acceptanceRate)}`;
        }
        
        if (linkEl && problem.link) {
            linkEl.href = problem.link;
        }
        
        if (topicsEl && problem.topics) {
            topicsEl.innerHTML = '';
            problem.topics.forEach(topic => {
                const topicTag = document.createElement('span');
                topicTag.className = 'topic-tag';
                topicTag.textContent = topic.trim();
                topicsEl.appendChild(topicTag);
            });
        }
        
        // Set up action buttons
        setupProblemActions(problem, companyName);
        
        console.log(`Problem detail initialized: ${problem.title}`);
        
    } catch (error) {
        console.error(`Failed to initialize problem detail:`, error);
        
        if (window.errorHandler) {
            window.errorHandler.handleDataError('Problem Details', error, () => {
                initializeProblemDetail(companyName, problemId);
            });
        }
    }
}

/**
 * Initialize favorites page
 * Requirement 6.2: Display all bookmarked problems
 */
async function initializeFavoritesPage() {
    console.log('Initializing favorites page...');
    
    const favoritesGrid = document.getElementById('favorites-grid');
    const emptyFavorites = document.querySelector('.empty-favorites');
    
    if (!favoritesGrid) {
        console.warn('Favorites grid element not found');
        return;
    }
    
    try {
        // Get bookmarked problem IDs
        const bookmarkedIds = stateManager.getBookmarkedProblems();
        
        if (bookmarkedIds.length === 0) {
            showEmptyFavoritesState();
            return;
        }
        
        // Show loading
        const loadingId = window.loadingManager?.showLoading(favoritesGrid, {
            skeleton: 'problem-card',
            count: Math.min(bookmarkedIds.length, 6),
            id: 'favorites-problems'
        });
        
        // Load all companies to find bookmarked problems
        const companies = await dataManager.loadCompanies();
        const bookmarkedProblems = [];
        
        // Search through all companies for bookmarked problems
        for (const company of companies) {
            try {
                const problems = await dataManager.loadCompanyProblems(company.name);
                const companyBookmarked = problems.filter(p => bookmarkedIds.includes(p.id));
                companyBookmarked.forEach(problem => {
                    problem.companyName = company.name;
                    problem.solved = stateManager.isProblemSolved(problem.id);
                    problem.bookmarked = true;
                });
                bookmarkedProblems.push(...companyBookmarked);
            } catch (error) {
                console.warn(`Failed to load problems for ${company.name}:`, error);
            }
        }
        
        // Hide loading
        if (window.loadingManager) {
            window.loadingManager.hideLoading(favoritesGrid);
        }
        
        if (bookmarkedProblems.length === 0) {
            showEmptyFavoritesState();
            return;
        }
        
        // Hide empty state and show grid
        hideEmptyFavoritesState();
        
        // Render bookmarked problems
        await renderBookmarkedProblems(bookmarkedProblems);
        
        console.log(`Favorites page initialized with ${bookmarkedProblems.length} problems`);
        
    } catch (error) {
        console.error('Failed to initialize favorites page:', error);
        
        // Hide loading
        if (window.loadingManager) {
            window.loadingManager.hideLoading(favoritesGrid);
        }
        
        if (window.errorHandler) {
            window.errorHandler.handleDataError('Favorites Loading', error, () => {
                initializeFavoritesPage();
            });
        }
    }
}

/**
 * Initialize search results page
 * Requirement 2.1: Filter displayed results in real-time
 */
async function initializeSearchResults() {
    console.log('Initializing search results...');
    
    const searchQuery = stateManager.getSearchQuery();
    const searchResultsGrid = document.getElementById('search-results-grid');
    const searchDescription = document.getElementById('search-description');
    
    if (!searchResultsGrid) {
        console.warn('Search results grid element not found');
        return;
    }
    
    if (!searchQuery || searchQuery.length < 2) {
        // Show empty search state
        searchResultsGrid.innerHTML = '';
        if (searchDescription) {
            searchDescription.textContent = 'Enter a search term to find problems and companies.';
        }
        return;
    }
    
    try {
        // Update description
        if (searchDescription) {
            searchDescription.textContent = `Search results for "${searchQuery}"`;
        }
        
        // Show loading
        const loadingId = window.loadingManager?.showLoading(searchResultsGrid, {
            skeleton: 'search-result',
            count: 8,
            id: 'search-results'
        });
        
        // Perform search
        const results = await performGlobalSearch(searchQuery);
        
        // Hide loading
        if (window.loadingManager) {
            window.loadingManager.hideLoading(searchResultsGrid);
        }
        
        // Render results
        renderSearchResults(results);
        
        console.log(`Search results initialized with ${results.length} results`);
        
    } catch (error) {
        console.error('Failed to initialize search results:', error);
        
        // Hide loading
        if (window.loadingManager) {
            window.loadingManager.hideLoading(searchResultsGrid);
        }
        
        if (window.errorHandler) {
            window.errorHandler.handleDataError('Search Results', error, () => {
                initializeSearchResults();
            });
        }
    }
}

/**
 * Animate counter with smooth counting effect
 */
function animateCounter(element, targetValue, duration = 1000) {
    const startValue = 0;
    const startTime = Date.now();
    
    function updateCounter() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.floor(startValue + (targetValue - startValue) * easeOut);
        
        element.textContent = currentValue;
        element.classList.add('counting');
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            element.classList.remove('counting');
        }
    }
    
    updateCounter();
}

/**
 * Favorites page helper functions
 * Requirement 6.2: Display all bookmarked problems
 * Requirement 6.5: Display empty state message when no problems are bookmarked
 */

/**
 * Show empty favorites state
 */
function showEmptyFavoritesState() {
    const favoritesGrid = document.getElementById('favorites-grid');
    const emptyFavorites = document.querySelector('.empty-favorites');
    
    if (favoritesGrid) {
        favoritesGrid.style.display = 'none';
    }
    
    if (emptyFavorites) {
        emptyFavorites.style.display = 'block';
    }
}

/**
 * Hide empty favorites state
 */
function hideEmptyFavoritesState() {
    const favoritesGrid = document.getElementById('favorites-grid');
    const emptyFavorites = document.querySelector('.empty-favorites');
    
    if (favoritesGrid) {
        favoritesGrid.style.display = 'grid';
    }
    
    if (emptyFavorites) {
        emptyFavorites.style.display = 'none';
    }
}

/**
 * Render bookmarked problems in the favorites grid
 * Requirement 6.2: Display all bookmarked problems
 */
async function renderBookmarkedProblems(bookmarkedProblems) {
    const favoritesGrid = document.getElementById('favorites-grid');
    
    if (!favoritesGrid) {
        console.error('Favorites grid element not found');
        return;
    }
    
    // Clear existing content
    favoritesGrid.innerHTML = '';
    
    // Sort problems by company name and then by title
    const sortedProblems = bookmarkedProblems.sort((a, b) => {
        if (a.companyName !== b.companyName) {
            return a.companyName.localeCompare(b.companyName);
        }
        return a.title.localeCompare(b.title);
    });
    
    // Create problem cards for bookmarked problems
    for (const problem of sortedProblems) {
        try {
            // Create a special problem card for favorites that includes company info
            const card = createFavoritesProblemCard(problem);
            favoritesGrid.appendChild(card);
        } catch (error) {
            console.warn(`Failed to create card for problem ${problem.title}:`, error);
        }
    }
    
    console.log(`Rendered ${sortedProblems.length} bookmarked problems`);
}

/**
 * Create a problem card specifically for the favorites page
 * Includes company information and bookmark/solved status
 */
function createFavoritesProblemCard(problem) {
    const card = document.createElement('div');
    card.className = `problem-card favorites-problem-card ${problem.solved ? 'solved' : ''} ${problem.bookmarked ? 'bookmarked' : ''}`;
    card.setAttribute('data-problem-id', problem.id);
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `${problem.title} from ${problem.companyName} - ${problem.difficulty} difficulty${problem.solved ? ' (solved)' : ''}${problem.bookmarked ? ' (bookmarked)' : ''}`);

    // Company badge
    const companyBadge = document.createElement('div');
    companyBadge.className = 'company-badge';
    companyBadge.textContent = problem.companyName;

    // Problem header
    const header = document.createElement('div');
    header.className = 'problem-header';

    // Problem title
    const title = document.createElement('h4');
    title.className = 'problem-title';
    title.textContent = problem.title;

    // Difficulty badge
    const difficultyBadge = UIComponents.createDifficultyBadge(problem.difficulty);

    header.appendChild(title);
    header.appendChild(difficultyBadge);

    // Problem topics
    const topicsContainer = document.createElement('div');
    topicsContainer.className = 'problem-topics';
    
    if (problem.topics && problem.topics.length > 0) {
        problem.topics.slice(0, 3).forEach(topic => {
            const topicTag = document.createElement('span');
            topicTag.className = 'topic-tag';
            topicTag.textContent = topic.trim();
            topicsContainer.appendChild(topicTag);
        });
        
        if (problem.topics.length > 3) {
            const moreTag = document.createElement('span');
            moreTag.className = 'topic-tag more-topics';
            moreTag.textContent = `+${problem.topics.length - 3} more`;
            moreTag.setAttribute('title', problem.topics.slice(3).join(', '));
            topicsContainer.appendChild(moreTag);
        }
    }

    // Problem metadata
    const meta = document.createElement('div');
    meta.className = 'problem-meta';

    if (problem.frequency !== undefined && problem.frequency !== null && !isNaN(problem.frequency)) {
        const frequency = document.createElement('span');
        frequency.className = 'problem-frequency';
        frequency.textContent = `Frequency: ${Utils.formatFrequency(problem.frequency)}`;
        meta.appendChild(frequency);
    }

    if (problem.acceptanceRate !== undefined && problem.acceptanceRate !== null && !isNaN(problem.acceptanceRate)) {
        const acceptance = document.createElement('span');
        acceptance.className = 'problem-acceptance';
        acceptance.textContent = `Acceptance: ${Utils.formatAcceptanceRate(problem.acceptanceRate)}`;
        meta.appendChild(acceptance);
    }

    // Action buttons container
    const actions = document.createElement('div');
    actions.className = 'problem-actions-inline';

    // Bookmark button
    const bookmarkBtn = document.createElement('button');
    bookmarkBtn.className = 'bookmark-btn-inline bookmarked';
    bookmarkBtn.innerHTML = '★';
    bookmarkBtn.setAttribute('aria-label', 'Remove bookmark');
    bookmarkBtn.setAttribute('title', 'Remove from favorites');
    bookmarkBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleProblemBookmark(problem.id, problem.companyName);
    });

    // Solved toggle button
    const solvedBtn = document.createElement('button');
    solvedBtn.className = `solved-btn-inline ${problem.solved ? 'solved' : ''}`;
    solvedBtn.innerHTML = problem.solved ? '✓' : '○';
    solvedBtn.setAttribute('aria-label', problem.solved ? 'Mark as unsolved' : 'Mark as solved');
    solvedBtn.setAttribute('title', problem.solved ? 'Mark as unsolved' : 'Mark as solved');
    solvedBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleProblemSolved(problem.id, problem.companyName);
    });

    // LeetCode link
    if (problem.link && Utils.isValidURL(problem.link)) {
        const linkBtn = document.createElement('button');
        linkBtn.className = 'leetcode-btn-inline';
        linkBtn.innerHTML = '🔗';
        linkBtn.setAttribute('aria-label', 'Open in LeetCode');
        linkBtn.setAttribute('title', 'Open in LeetCode');
        linkBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            window.open(problem.link, '_blank', 'noopener,noreferrer');
        });
        actions.appendChild(linkBtn);
    }

    actions.appendChild(bookmarkBtn);
    actions.appendChild(solvedBtn);

    // Assemble the card
    card.appendChild(companyBadge);
    card.appendChild(header);
    card.appendChild(topicsContainer);
    card.appendChild(meta);
    card.appendChild(actions);

    // Add click handler for navigation to problem detail
    card.addEventListener('click', (e) => {
        // Don't navigate if clicking on action buttons
        if (e.target.closest('.problem-actions-inline')) {
            return;
        }
        RouterUtils.goToProblem(problem.companyName, problem.id);
    });

    // Add keyboard navigation support
    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            RouterUtils.goToProblem(problem.companyName, problem.id);
        }
    });

    return card;
}

/**
 * Set up problem filters for company page
 */
function setupProblemFilters(problems) {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.dataset.filter;
            
            // Update active state
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Filter problems
            filterProblemsDisplay(problems, filter);
        });
    });
    
    // Update filter counts
    updateFilterCounts(problems);
}

/**
 * Filter problems display based on difficulty
 */
function filterProblemsDisplay(problems, filter) {
    const problemsGrid = document.getElementById('problems-grid');
    if (!problemsGrid) return;
    
    problemsGrid.innerHTML = '';
    
    const filteredProblems = filter === 'all' 
        ? problems 
        : problems.filter(p => p.difficulty.toLowerCase() === filter);
    
    if (filteredProblems.length === 0) {
        const noProblems = document.querySelector('.no-problems');
        if (noProblems) {
            noProblems.style.display = 'block';
        }
        return;
    }
    
    // Hide no problems message
    const noProblems = document.querySelector('.no-problems');
    if (noProblems) {
        noProblems.style.display = 'none';
    }
    
    // Add stagger animation
    problemsGrid.classList.add('stagger-animation');
    
    filteredProblems.forEach(problem => {
        const card = UIComponents.createProblemCard(problem, {
            onClick: (problem) => {
                const companyName = router.getParam('companyName');
                RouterUtils.goToProblem(companyName, problem.id);
            }
        });
        problemsGrid.appendChild(card);
    });
}

/**
 * Update filter button counts
 */
function updateFilterCounts(problems) {
    const counts = {
        all: problems.length,
        easy: problems.filter(p => p.difficulty === 'EASY').length,
        medium: problems.filter(p => p.difficulty === 'MEDIUM').length,
        hard: problems.filter(p => p.difficulty === 'HARD').length
    };
    
    Object.entries(counts).forEach(([filter, count]) => {
        const button = document.querySelector(`[data-filter="${filter}"]`);
        if (button) {
            const countSpan = button.querySelector('.filter-count');
            if (countSpan) {
                countSpan.textContent = `(${count})`;
            }
        }
    });
}

/**
 * Set up problem action buttons (bookmark, solved, etc.)
 */
function setupProblemActions(problem, companyName) {
    const bookmarkBtn = document.getElementById('bookmark-btn');
    const solvedBtn = document.getElementById('solved-btn');
    
    if (bookmarkBtn) {
        updateBookmarkButton(bookmarkBtn, problem.bookmarked);
        bookmarkBtn.addEventListener('click', () => {
            toggleProblemBookmark(problem.id, companyName);
        });
    }
    
    if (solvedBtn) {
        updateSolvedButton(solvedBtn, problem.solved);
        solvedBtn.addEventListener('click', () => {
            toggleProblemSolved(problem.id, companyName);
        });
    }
}

/**
 * Toggle problem bookmark status
 */
function toggleProblemBookmark(problemId, companyName) {
    const wasBookmarked = stateManager.isProblemBookmarked(problemId);
    const newStatus = !wasBookmarked;
    
    stateManager.updateBookmarkStatus(problemId, newStatus);
    
    // Update UI
    const bookmarkBtn = document.getElementById('bookmark-btn');
    if (bookmarkBtn) {
        updateBookmarkButton(bookmarkBtn, newStatus);
        
        // Add animation feedback
        bookmarkBtn.classList.add('status-change-bookmarked');
        setTimeout(() => {
            bookmarkBtn.classList.remove('status-change-bookmarked');
        }, 600);
    }
    
    // Show feedback
    if (window.errorHandler) {
        const message = newStatus ? 'Problem bookmarked!' : 'Bookmark removed';
        window.errorHandler.showErrorNotification('Success', message, 'success', 2000);
    }
}

/**
 * Toggle problem solved status
 */
function toggleProblemSolved(problemId, companyName) {
    const wasSolved = stateManager.isProblemSolved(problemId);
    const newStatus = !wasSolved;
    
    stateManager.updateSolvedStatus(problemId, newStatus);
    
    // Update UI
    const solvedBtn = document.getElementById('solved-btn');
    if (solvedBtn) {
        updateSolvedButton(solvedBtn, newStatus);
        
        // Add animation feedback
        solvedBtn.classList.add('status-change-solved');
        setTimeout(() => {
            solvedBtn.classList.remove('status-change-solved');
        }, 400);
    }
    
    // Show feedback
    if (window.errorHandler) {
        const message = newStatus ? 'Problem marked as solved!' : 'Problem marked as unsolved';
        window.errorHandler.showErrorNotification('Success', message, 'success', 2000);
    }
}

/**
 * Update bookmark button appearance
 */
function updateBookmarkButton(button, isBookmarked) {
    const icon = button.querySelector('.bookmark-icon');
    const text = button.querySelector('.bookmark-text');
    
    if (isBookmarked) {
        button.classList.add('bookmarked');
        if (icon) icon.innerHTML = '★';
        if (text) text.textContent = 'Bookmarked';
        button.setAttribute('aria-label', 'Remove bookmark');
    } else {
        button.classList.remove('bookmarked');
        if (icon) icon.innerHTML = '☆';
        if (text) text.textContent = 'Bookmark';
        button.setAttribute('aria-label', 'Add bookmark');
    }
}

/**
 * Update solved button appearance
 */
function updateSolvedButton(button, isSolved) {
    const icon = button.querySelector('.solved-icon');
    const text = button.querySelector('.solved-text');
    
    if (isSolved) {
        button.classList.add('solved');
        if (text) text.textContent = 'Solved';
        button.setAttribute('aria-label', 'Mark as unsolved');
    } else {
        button.classList.remove('solved');
        if (text) text.textContent = 'Mark as Solved';
        button.setAttribute('aria-label', 'Mark as solved');
    }
}

/**
 * Perform global search across all problems and companies
 */
async function performGlobalSearch(query) {
    const results = [];
    
    try {
        // Load all companies
        const companies = await dataManager.loadCompanies();
        
        // Search companies by name
        const matchingCompanies = companies.filter(company => 
            company.name.toLowerCase().includes(query.toLowerCase())
        );
        
        // Add company results
        matchingCompanies.forEach(company => {
            results.push({
                type: 'company',
                company: company,
                title: company.name,
                description: `${company.problemCount} problems available`
            });
        });
        
        // Search problems across all companies
        for (const company of companies) {
            try {
                const problems = await dataManager.loadCompanyProblems(company.name);
                const matchingProblems = problems.filter(problem => 
                    problem.title.toLowerCase().includes(query.toLowerCase()) ||
                    problem.topics.some(topic => topic.toLowerCase().includes(query.toLowerCase()))
                );
                
                matchingProblems.forEach(problem => {
                    problem.solved = stateManager.isProblemSolved(problem.id);
                    problem.bookmarked = stateManager.isProblemBookmarked(problem.id);
                    
                    results.push({
                        type: 'problem',
                        problem: problem,
                        company: company,
                        title: problem.title,
                        description: `${company.name} • ${problem.difficulty}`
                    });
                });
            } catch (error) {
                console.warn(`Failed to search problems in ${company.name}:`, error);
            }
        }
        
    } catch (error) {
        console.error('Global search failed:', error);
        throw error;
    }
    
    return results.slice(0, 50); // Limit results
}

/**
 * Render search results
 */
function renderSearchResults(results) {
    const searchResultsGrid = document.getElementById('search-results-grid');
    const noSearchResults = document.querySelector('.no-search-results');
    
    if (!searchResultsGrid) return;
    
    if (results.length === 0) {
        searchResultsGrid.style.display = 'none';
        if (noSearchResults) {
            noSearchResults.style.display = 'block';
        }
        return;
    }
    
    // Hide no results message
    if (noSearchResults) {
        noSearchResults.style.display = 'none';
    }
    searchResultsGrid.style.display = 'grid';
    
    // Clear and populate results
    searchResultsGrid.innerHTML = '';
    searchResultsGrid.classList.add('stagger-animation');
    
    results.forEach(result => {
        const resultCard = createSearchResultCard(result);
        searchResultsGrid.appendChild(resultCard);
    });
}

/**
 * Create search result card
 */
function createSearchResultCard(result) {
    const card = document.createElement('div');
    card.className = 'search-result-card';
    
    if (result.type === 'company') {
        card.innerHTML = `
            <div class="result-type">Company</div>
            <h3 class="result-title">${result.title}</h3>
            <p class="result-description">${result.description}</p>
        `;
        
        card.addEventListener('click', () => {
            RouterUtils.goToCompany(result.company.name);
        });
        
    } else if (result.type === 'problem') {
        card.innerHTML = `
            <div class="result-type">Problem</div>
            <h3 class="result-title">${result.title}</h3>
            <p class="result-description">${result.description}</p>
            <div class="result-status">
                ${result.problem.solved ? '<span class="status-solved">✓ Solved</span>' : ''}
                ${result.problem.bookmarked ? '<span class="status-bookmarked">★ Bookmarked</span>' : ''}
            </div>
        `;
        
        card.addEventListener('click', () => {
            RouterUtils.goToProblem(result.company.name, result.problem.id);
        });
    }
    
    // Add keyboard navigation
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            card.click();
        }
    });
    
    return card;
}

/**
 * Update breadcrumb navigation based on current route
 * Requirement 10.4: Provide breadcrumb navigation
 */
function updateBreadcrumbs(path, params) {
    const breadcrumbsContainer = document.querySelector('.breadcrumbs');
    if (!breadcrumbsContainer) return;
    
    const breadcrumbItems = [];
    
    // Always start with home
    breadcrumbItems.push({
        text: 'Home',
        href: '#/'
    });
    
    // Add breadcrumbs based on current path
    if (path.startsWith('/company/')) {
        const companyName = params.companyName;
        breadcrumbItems.push({
            text: companyName,
            href: `#/company/${encodeURIComponent(companyName)}`
        });
        
        if (params.problemId) {
            breadcrumbItems.push({
                text: 'Problem Details',
                href: null // Current page
            });
        }
    } else if (path === '/favorites') {
        breadcrumbItems.push({
            text: 'Favorites',
            href: null
        });
    } else if (path === '/search') {
        breadcrumbItems.push({
            text: 'Search Results',
            href: null
        });
    }
    
    // Create breadcrumb HTML
    const breadcrumbNav = UIComponents.createBreadcrumb(breadcrumbItems);
    breadcrumbsContainer.innerHTML = '';
    breadcrumbsContainer.appendChild(breadcrumbNav);
}

/**
 * Add page transition animation with enhanced effects
 * Requirement 9.1: Implement smooth page transitions and micro-animations
 * Requirement 9.2: Add loading spinners and skeleton screens for better UX
 */
function addPageTransitionAnimation() {
    const activeSection = document.querySelector('.page-section[style*="block"]');
    const allSections = document.querySelectorAll('.page-section');
    
    if (activeSection) {
        // Remove any existing animation classes from all sections
        allSections.forEach(section => {
            section.classList.remove(
                'page-transition-enter', 
                'page-transition-enter-active',
                'page-transition-exit',
                'page-transition-exit-active'
            );
        });
        
        // Add entrance animation to active section
        activeSection.classList.add('page-transition-enter');
        
        // Trigger reflow to ensure class is applied
        activeSection.offsetHeight;
        
        requestAnimationFrame(() => {
            activeSection.classList.add('page-transition-enter-active');
        });
        
        // Clean up animation classes after animation completes
        setTimeout(() => {
            activeSection.classList.remove('page-transition-enter', 'page-transition-enter-active');
        }, 400);
        
        // Add scroll reveal animation for elements within the section
        addScrollRevealAnimation(activeSection);
    }
}

/**
 * Add scroll reveal animation for elements
 * Requirement 9.3: Add micro-animations for better user experience
 */
function addScrollRevealAnimation(container) {
    const revealElements = container.querySelectorAll('.company-card, .problem-card, .search-result-card');
    
    if (revealElements.length === 0) return;
    
    // Create intersection observer for scroll reveals
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('scroll-reveal', 'revealed');
                }, index * 50); // Stagger the animations
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    revealElements.forEach(element => {
        element.classList.add('scroll-reveal');
        observer.observe(element);
    });
}

/**
 * Enhanced micro-animations for interactive elements
 * Requirement 9.3: Add micro-animations for status changes and interactions
 */
function addMicroAnimations() {
    // Add ripple effect to buttons
    document.addEventListener('click', (e) => {
        const button = e.target.closest('.btn, .filter-btn, .company-card, .problem-card');
        if (button && !button.classList.contains('no-ripple')) {
            createRippleEffect(button, e);
        }
    });
    
    // Add hover effects to interactive elements
    const interactiveElements = document.querySelectorAll('.company-card, .problem-card, .btn, .filter-btn');
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            if (!element.classList.contains('loading')) {
                element.style.transform = 'translateY(-2px)';
            }
        });
        
        element.addEventListener('mouseleave', () => {
            element.style.transform = '';
        });
    });
}

/**
 * Create ripple effect for button clicks
 */
function createRippleEffect(element, event) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
        z-index: 1;
    `;
    
    // Ensure element has relative positioning
    const originalPosition = element.style.position;
    if (!originalPosition || originalPosition === 'static') {
        element.style.position = 'relative';
    }
    
    element.appendChild(ripple);
    
    // Remove ripple after animation
    setTimeout(() => {
        if (ripple.parentNode) {
            ripple.parentNode.removeChild(ripple);
        }
        // Restore original position if we changed it
        if (!originalPosition) {
            element.style.position = '';
        }
    }, 600);
}

/**
 * Enhanced loading state management with better UX
 * Requirement 9.2: Add loading spinners and skeleton screens for better UX
 */
function showEnhancedLoading(container, options = {}) {
    const loadingId = window.loadingManager?.showLoading(container, {
        skeleton: options.skeleton || 'company-card',
        count: options.count || 6,
        message: options.message || 'Loading...',
        id: options.id || `loading_${Date.now()}`
    });
    
    // Add loading state to container
    if (typeof container === 'string') {
        container = document.getElementById(container);
    }
    
    if (container) {
        container.classList.add('loading-state');
        
        // Add loading announcement for screen readers
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = options.message || 'Loading content...';
        container.appendChild(announcement);
        
        // Remove announcement after loading
        setTimeout(() => {
            if (announcement.parentNode) {
                announcement.parentNode.removeChild(announcement);
            }
        }, 1000);
    }
    
    return loadingId;
}

/**
 * Enhanced error handling with better user feedback
 * Requirement 9.4: Create comprehensive error boundaries and user-friendly error messages
 */
function handleEnhancedError(operation, error, retryCallback = null, container = null) {
    console.error(`Enhanced error handling for ${operation}:`, error);
    
    // Log error details for debugging
    if (window.errorHandler) {
        window.errorHandler.logError({
            operation,
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        });
    }
    
    // Determine error type and show appropriate feedback
    let errorType = 'error';
    let title = 'Something went wrong';
    let message = 'An unexpected error occurred. Please try again.';
    
    if (error.name === 'NetworkError' || error.message.includes('fetch') || error.message.includes('network')) {
        errorType = 'warning';
        title = 'Connection Problem';
        message = 'Unable to load data. Please check your internet connection and try again.';
    } else if (error.message.includes('CSV') || error.message.includes('parse')) {
        errorType = 'warning';
        title = 'Data Format Issue';
        message = 'There was a problem with the data format. Some information may be missing.';
    } else if (error.message.includes('404') || error.message.includes('Not Found')) {
        errorType = 'info';
        title = 'Content Not Found';
        message = 'The requested content could not be found. It may have been moved or deleted.';
    } else if (error.message.includes('localStorage') || error.message.includes('storage')) {
        errorType = 'warning';
        title = 'Storage Issue';
        message = 'Unable to save your progress. Your browser storage may be full or disabled.';
    }
    
    // Show error notification
    if (window.errorHandler) {
        window.errorHandler.showErrorNotification(title, message, errorType, 8000);
        
        // If retry callback provided, show retry option
        if (retryCallback) {
            setTimeout(() => {
                const retryNotification = window.errorHandler.showErrorNotification(
                    'Retry Available',
                    'Click here to try again.',
                    'info',
                    0 // Don't auto-dismiss
                );
                
                retryNotification.style.cursor = 'pointer';
                retryNotification.addEventListener('click', () => {
                    retryNotification.remove();
                    retryCallback();
                });
            }, 2000);
        }
    }
    
    // If container provided, show inline error
    if (container) {
        showInlineError(container, title, message, retryCallback);
    }
}

/**
 * Show inline error in container
 */
function showInlineError(container, title, message, retryCallback = null) {
    if (typeof container === 'string') {
        container = document.getElementById(container);
    }
    
    if (!container) return;
    
    const errorElement = document.createElement('div');
    errorElement.className = 'inline-error-container';
    errorElement.innerHTML = `
        <div class="inline-error-content">
            <div class="inline-error-icon">⚠️</div>
            <div class="inline-error-text">
                <h3 class="inline-error-title">${title}</h3>
                <p class="inline-error-message">${message}</p>
            </div>
            ${retryCallback ? '<button class="inline-error-retry btn btn-primary">Try Again</button>' : ''}
        </div>
    `;
    
    // Add styles
    errorElement.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 200px;
        padding: var(--spacing-xl);
        text-align: center;
        background: var(--surface-color);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-lg);
        margin: var(--spacing-lg) 0;
    `;
    
    // Add retry functionality
    if (retryCallback) {
        const retryBtn = errorElement.querySelector('.inline-error-retry');
        retryBtn.addEventListener('click', () => {
            container.removeChild(errorElement);
            retryCallback();
        });
    }
    
    container.innerHTML = '';
    container.appendChild(errorElement);
}

/**
 * Set up bookmark interaction handlers for favorites page
 */
function setupBookmarkInteractionHandlers() {
    // Listen for bookmark status changes to update the favorites page
    if (stateManager) {
        stateManager.addEventListener('bookmarkStatusChanged', ({ problemId, bookmarked }) => {
            if (!bookmarked) {
                // Problem was unbookmarked, remove it from favorites page
                const problemCard = document.querySelector(`[data-problem-id="${problemId}"]`);
                if (problemCard && RouterUtils.isCurrentRoute('/favorites')) {
                    problemCard.remove();
                    
                    // Check if there are any remaining bookmarked problems
                    const remainingCards = document.querySelectorAll('#favorites-grid .problem-card');
                    if (remainingCards.length === 0) {
                        showEmptyFavoritesState();
                    }
                }
            }
        });
        
        stateManager.addEventListener('solvedStatusChanged', ({ problemId, solved }) => {
            // Update solved status on favorites page
            const problemCard = document.querySelector(`[data-problem-id="${problemId}"]`);
            if (problemCard && RouterUtils.isCurrentRoute('/favorites')) {
                problemCard.classList.toggle('solved', solved);
                
                const solvedBtn = problemCard.querySelector('.solved-btn-inline');
                if (solvedBtn) {
                    solvedBtn.innerHTML = solved ? '✓' : '○';
                    solvedBtn.setAttribute('aria-label', solved ? 'Mark as unsolved' : 'Mark as solved');
                    solvedBtn.setAttribute('title', solved ? 'Mark as unsolved' : 'Mark as solved');
                    solvedBtn.classList.toggle('solved', solved);
                }
            }
        });
    }
}

/**
 * Toggle problem bookmark status
 * Requirement 6.1: Implement bookmark toggle functionality
 */
function toggleProblemBookmark(problemId, companyName) {
    if (stateManager) {
        const currentStatus = stateManager.isProblemBookmarked(problemId);
        const success = stateManager.updateBookmarkStatus(problemId, !currentStatus);
        
        if (success) {
            showActionFeedback(!currentStatus ? 'Problem bookmarked!' : 'Bookmark removed!');
        }
        
        return success;
    }
    return false;
}

/**
 * Toggle problem solved status
 * Requirement 4.4: Update solved/unsolved problem states
 */
function toggleProblemSolved(problemId, companyName) {
    if (stateManager) {
        const currentStatus = stateManager.isProblemSolved(problemId);
        const success = stateManager.updateSolvedStatus(problemId, !currentStatus);
        
        if (success) {
            showActionFeedback(!currentStatus ? 'Problem marked as solved!' : 'Problem marked as unsolved!');
        }
        
        return success;
    }
    return false;
}

/**
 * Show action feedback message
 */
function showActionFeedback(message) {
    // Create or get existing feedback element
    let feedback = document.querySelector('.action-feedback');
    if (!feedback) {
        feedback = document.createElement('div');
        feedback.className = 'action-feedback';
        document.body.appendChild(feedback);
    }
    
    feedback.textContent = message;
    feedback.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
        feedback.classList.remove('show');
    }, 3000);
}

/**
 * Enhanced loading and error state management
 * Requirement 10.3: Add loading states and error messages for data fetching
 */
function showLoadingState(message = 'Loading...', container = null) {
    if (window.performanceManager) {
        return window.performanceManager.showLoadingState('app-loading', message, container);
    } else {
        // Fallback loading state
        const loadingElement = document.createElement('div');
        loadingElement.className = 'loading-container';
        loadingElement.innerHTML = `
            <div class="loading-spinner"></div>
            <div class="loading-text">${message}</div>
        `;
        
        if (container) {
            container.innerHTML = '';
            container.appendChild(loadingElement);
        } else {
            document.body.appendChild(loadingElement);
        }
        
        return loadingElement;
    }
}

function hideLoadingState() {
    if (window.performanceManager) {
        window.performanceManager.hideLoadingState('app-loading');
    } else {
        // Fallback - remove loading elements
        const loadingElements = document.querySelectorAll('.loading-container, .loading-overlay');
        loadingElements.forEach(el => el.remove());
    }
}

function showErrorState(error, retryCallback = null, container = null) {
    if (window.performanceManager) {
        return window.performanceManager.showErrorState('app-error', error, retryCallback, container);
    } else {
        // Fallback error state
        const errorElement = document.createElement('div');
        errorElement.className = 'error-container';
        errorElement.innerHTML = `
            <div class="error-content">
                <div class="error-icon">⚠️</div>
                <h3>Something went wrong</h3>
                <p class="error-message">${error.message || error}</p>
                ${retryCallback ? '<button class="retry-button" onclick="retryCallback()">Try Again</button>' : ''}
            </div>
        `;
        
        if (container) {
            container.innerHTML = '';
            container.appendChild(errorElement);
        } else {
            document.body.appendChild(errorElement);
        }
        
        return errorElement;
    }
}

/**
 * Page initialization functions
 * Enhanced with performance optimizations and error handling
 */
async function initializeHomepage() {
    console.log('Initializing homepage components...');
    
    const container = document.getElementById('companies-grid');
    
    try {
        // Show loading state with performance manager
        showLoadingState('Loading companies...', container);
        
        // Validate required elements exist
        const requiredElements = ['companies-grid', 'total-companies', 'total-problems', 'solved-problems', 'search-input'];
        const missingElements = requiredElements.filter(id => !document.getElementById(id));
        
        if (missingElements.length > 0) {
            throw new Error(`Missing required elements: ${missingElements.join(', ')}`);
        }
        
        // Load companies data with enhanced error handling
        console.log('Loading companies data...');
        const companies = await dataManager.loadCompanies();
        
        if (!companies || companies.length === 0) {
            throw new Error('No companies data loaded');
        }
        
        console.log(`Loaded ${companies.length} companies`);
        
        // Update stats
        console.log('Updating homepage stats...');
        updateHomepageStats(companies);
        
        // Render company cards with performance optimization
        console.log('Rendering company cards...');
        await renderCompanyCardsOptimized(companies);
        
        // Set up search functionality
        console.log('Setting up search functionality...');
        setupHomepageSearch(companies);
        
        // Hide loading state
        hideLoadingState();
        
        console.log(`Homepage initialized successfully with ${companies.length} companies`);
        
    } catch (error) {
        console.error('Failed to initialize homepage:', error);
        hideLoadingState();
        
        // Show error with retry option
        if (window.errorHandler) {
            window.errorHandler.handleDataError('Homepage Loading', error, () => {
                initializeHomepage();
            });
        }
    }
}

async function initializeCompanyPage(companyName) {
    console.log(`Initializing company page for: ${companyName}`);
    
    try {
        // Show loading state
        showLoadingState();
        
        // Validate required elements exist
        const requiredElements = ['company-name', 'company-progress', 'company-progress-fill', 'problems-grid'];
        const missingElements = requiredElements.filter(id => !document.getElementById(id));
        
        if (missingElements.length > 0) {
            throw new Error(`Missing required elements: ${missingElements.join(', ')}`);
        }
        
        // Load company data
        console.log(`Loading company data for: ${companyName}`);
        const company = dataManager.getCachedCompany(companyName);
        
        if (!company) {
            throw new Error(`Company not found: ${companyName}`);
        }
        
        // Update company header
        updateCompanyHeader(company);
        
        // Load problems for the company
        console.log(`Loading problems for: ${companyName}`);
        const problems = await dataManager.loadCompanyProblems(companyName);
        
        if (!problems || problems.length === 0) {
            throw new Error(`No problems found for company: ${companyName}`);
        }
        
        console.log(`Loaded ${problems.length} problems for ${companyName}`);
        
        // Apply user state to problems (solved/bookmarked status)
        const problemsWithState = applyUserStateToProblems(problems);
        
        // Set up filter controls
        console.log('Setting up filter controls...');
        setupCompanyPageFilters(problemsWithState);
        
        // Render problems with default filter (all)
        console.log('Rendering problems...');
        await renderProblems(problemsWithState, 'all');
        
        // Update company progress
        updateCompanyProgress(company, problemsWithState);
        
        // Set up problem interaction handlers
        setupProblemInteractionHandlers();
        
        // Hide loading state
        hideLoadingState();
        
        console.log(`Company page initialized successfully for ${companyName} with ${problems.length} problems`);
        
    } catch (error) {
        console.error('Failed to initialize company page:', error);
        hideLoadingState();
        showErrorState(`Failed to load company page: ${error.message}`);
    }
}

async function initializeProblemDetail(companyName, problemId) {
    console.log(`Initializing problem detail: ${companyName}/${problemId}`);
    
    try {
        // Show loading state
        showLoadingState();
        
        // Validate required elements exist
        const requiredElements = ['problem-title', 'problem-difficulty', 'problem-frequency', 'problem-acceptance', 'leetcode-link', 'bookmark-btn', 'solved-btn', 'problem-topics'];
        const missingElements = requiredElements.filter(id => !document.getElementById(id));
        
        if (missingElements.length > 0) {
            throw new Error(`Missing required elements: ${missingElements.join(', ')}`);
        }
        
        // Load company problems to find the specific problem
        console.log(`Loading problems for company: ${companyName}`);
        const problems = await dataManager.loadCompanyProblems(companyName);
        
        if (!problems || problems.length === 0) {
            throw new Error(`No problems found for company: ${companyName}`);
        }
        
        // Find the specific problem by ID
        const problem = problems.find(p => p.id === problemId);
        
        if (!problem) {
            throw new Error(`Problem not found: ${problemId}`);
        }
        
        console.log(`Found problem: ${problem.title}`);
        
        // Apply user state to the problem
        const problemWithState = {
            ...problem,
            solved: stateManager ? stateManager.isProblemSolved(problem.id) : false,
            bookmarked: stateManager ? stateManager.isProblemBookmarked(problem.id) : false
        };
        
        // Update problem detail UI
        updateProblemDetailUI(problemWithState, companyName);
        
        // Set up problem action handlers
        setupProblemDetailHandlers(problemWithState, companyName);
        
        // Set up back button functionality
        setupProblemDetailBackButton(companyName);
        
        // Update page title
        document.title = `${problem.title} - ${companyName} - LeetCode Company Problems`;
        
        // Hide loading state
        hideLoadingState();
        
        console.log(`Problem detail initialized successfully for: ${problem.title}`);
        
    } catch (error) {
        console.error('Failed to initialize problem detail:', error);
        hideLoadingState();
        showErrorState(`Failed to load problem details: ${error.message}`);
    }
}

async function initializeFavoritesPage() {
    console.log('Initializing favorites page...');
    
    try {
        // Show loading state
        showLoadingState();
        
        // Validate required elements exist
        const requiredElements = ['favorites-grid'];
        const missingElements = requiredElements.filter(id => !document.getElementById(id));
        
        if (missingElements.length > 0) {
            throw new Error(`Missing required elements: ${missingElements.join(', ')}`);
        }
        
        // Get bookmarked problems from state manager
        const bookmarkedProblemIds = stateManager ? stateManager.getBookmarkedProblems() : [];
        
        console.log(`Found ${bookmarkedProblemIds.length} bookmarked problems`);
        
        if (bookmarkedProblemIds.length === 0) {
            // Show empty favorites state
            showEmptyFavoritesState();
            hideLoadingState();
            return;
        }
        
        // Load all companies to find the bookmarked problems
        const companies = await dataManager.loadCompanies();
        const bookmarkedProblems = [];
        
        // Search through all companies to find bookmarked problems
        for (const company of companies) {
            try {
                const problems = await dataManager.loadCompanyProblems(company.name);
                const companyBookmarkedProblems = problems.filter(problem => 
                    bookmarkedProblemIds.includes(problem.id)
                );
                
                // Add company information to each problem
                companyBookmarkedProblems.forEach(problem => {
                    problem.companyName = company.name;
                    problem.solved = stateManager ? stateManager.isProblemSolved(problem.id) : false;
                    problem.bookmarked = true; // We know these are bookmarked
                });
                
                bookmarkedProblems.push(...companyBookmarkedProblems);
            } catch (error) {
                console.warn(`Failed to load problems for company ${company.name}:`, error);
            }
        }
        
        console.log(`Loaded ${bookmarkedProblems.length} bookmarked problems with details`);
        
        if (bookmarkedProblems.length === 0) {
            // Show empty state if no problems were found (might be stale bookmarks)
            showEmptyFavoritesState();
        } else {
            // Hide empty state and render bookmarked problems
            hideEmptyFavoritesState();
            await renderBookmarkedProblems(bookmarkedProblems);
        }
        
        // Set up bookmark interaction handlers
        setupBookmarkInteractionHandlers();
        
        // Hide loading state
        hideLoadingState();
        
        console.log(`Favorites page initialized successfully with ${bookmarkedProblems.length} problems`);
        
    } catch (error) {
        console.error('Failed to initialize favorites page:', error);
        hideLoadingState();
        showErrorState(`Failed to load favorites: ${error.message}`);
    }
}

async function initializeSearchResults() {
    console.log('Initializing search results...');
    
    try {
        // Show loading state
        showLoadingState();
        
        // Validate required elements exist
        const requiredElements = ['search-results-grid', 'search-description'];
        const missingElements = requiredElements.filter(id => !document.getElementById(id));
        
        if (missingElements.length > 0) {
            throw new Error(`Missing required elements: ${missingElements.join(', ')}`);
        }
        
        // Get current search query from state manager or URL params
        const searchQuery = stateManager ? stateManager.getSearchQuery() : '';
        
        if (!searchQuery || searchQuery.trim().length === 0) {
            // Show empty search state
            showEmptySearchState();
            hideLoadingState();
            return;
        }
        
        console.log(`Performing search for: "${searchQuery}"`);
        
        // Load all companies and their problems for search
        const companies = await dataManager.loadCompanies();
        const searchResults = await performGlobalSearch(searchQuery, companies);
        
        // Update search description
        updateSearchDescription(searchQuery, searchResults.length);
        
        // Render search results
        await renderSearchResults(searchResults);
        
        // Set up search result interaction handlers
        setupSearchResultHandlers();
        
        // Hide loading state
        hideLoadingState();
        
        console.log(`Search results initialized with ${searchResults.length} results`);
        
    } catch (error) {
        console.error('Failed to initialize search results:', error);
        hideLoadingState();
        showErrorState(`Failed to load search results: ${error.message}`);
    }
}

/**
 * Homepage helper functions
 * Requirement 1.1: Display grid of company cards with company names and logos
 * Requirement 1.4: Display the total number of problems for that company on the card
 * Requirement 4.2: Display progress (X solved out of Y total problems)
 */

/**
 * Update homepage statistics
 */
function updateHomepageStats(companies) {
    const totalCompanies = companies.length;
    const totalProblems = companies.reduce((sum, company) => sum + (company.problemCount || 0), 0);
    
    // Get solved problems count from state manager
    const solvedProblems = stateManager ? stateManager.getSolvedProblems().length : 0;
    
    // Update stat elements
    const totalCompaniesEl = document.getElementById('total-companies');
    const totalProblemsEl = document.getElementById('total-problems');
    const solvedProblemsEl = document.getElementById('solved-problems');
    
    if (totalCompaniesEl) totalCompaniesEl.textContent = totalCompanies;
    if (totalProblemsEl) totalProblemsEl.textContent = totalProblems;
    if (solvedProblemsEl) solvedProblemsEl.textContent = solvedProblems;
}

/**
 * Render company cards in the grid
 * Requirement 1.1: Display a grid of company cards with company names and logos
 * Requirement 1.2: Navigate to company's problem list page when card is clicked
 */
async function renderCompanyCards(companies, filteredCompanies = null) {
    const companiesGrid = document.getElementById('companies-grid');
    const noResults = document.querySelector('.no-results');
    
    if (!companiesGrid) {
        console.error('Companies grid element not found');
        return;
    }
    
    // Use filtered companies if provided, otherwise use all companies
    const companiesToRender = filteredCompanies || companies;
    
    // Clear existing content
    companiesGrid.innerHTML = '';
    
    if (companiesToRender.length === 0) {
        // Show no results message
        if (noResults) {
            noResults.style.display = 'block';
        }
        return;
    }
    
    // Hide no results message
    if (noResults) {
        noResults.style.display = 'none';
    }
    
    // Create company cards
    for (const company of companiesToRender) {
        try {
            // Calculate actual progress for this company
            const progress = await calculateCompanyProgress(company.name);
            
            // Create company card using UIComponents
            const card = UIComponents.createCompanyCard(company, progress);
            
            // Add click handler for navigation
            card.addEventListener('click', (e) => {
                e.preventDefault();
                RouterUtils.goToCompany(company.name);
            });
            
            companiesGrid.appendChild(card);
        } catch (error) {
            console.warn(`Failed to create card for company ${company.name}:`, error);
            
            // Create card without progress data as fallback
            try {
                const card = UIComponents.createCompanyCard(company, null);
                card.addEventListener('click', (e) => {
                    e.preventDefault();
                    RouterUtils.goToCompany(company.name);
                });
                companiesGrid.appendChild(card);
            } catch (fallbackError) {
                console.error(`Failed to create fallback card for company ${company.name}:`, fallbackError);
            }
        }
    }
    
    console.log(`Rendered ${companiesToRender.length} company cards`);
}

/**
 * Set up search functionality for homepage
 * Requirement 2.1: Filter displayed results in real-time
 * Requirement 2.2: Show matching company cards when searching by company name
 */
function setupHomepageSearch(companies) {
    const searchInput = document.getElementById('search-input');
    const searchClear = document.querySelector('.search-clear');
    
    if (!searchInput) {
        console.warn('Search input not found');
        return;
    }
    
    let searchTimeout;
    
    // Debounced search function
    const performSearch = (query) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(async () => {
            const filteredCompanies = filterCompaniesBySearch(companies, query);
            await renderCompanyCards(companies, filteredCompanies);
            
            // Update state manager with search query
            if (stateManager) {
                stateManager.updateSearchQuery(query);
            }
        }, 300); // 300ms debounce
    };
    
    // Search input handler
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        
        // Show/hide clear button
        if (searchClear) {
            searchClear.style.display = query ? 'block' : 'none';
        }
        
        performSearch(query);
    });
    
    // Enhanced search with Enter key for global search
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const query = e.target.value.trim();
            if (query.length > 0) {
                // Navigate to search results page for global search
                stateManager.updateSearchQuery(query);
                RouterUtils.goToSearch();
            }
        }
    });
    
    // Clear search handler
    if (searchClear) {
        searchClear.addEventListener('click', () => {
            searchInput.value = '';
            searchClear.style.display = 'none';
            searchInput.focus();
            performSearch('');
        });
    }
    
    // Keyboard shortcut handler (/)
    const handleKeyboardShortcut = (e) => {
        if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey) {
            // Only focus if not already in an input field
            if (!e.target.matches('input, textarea, [contenteditable]')) {
                e.preventDefault();
                searchInput.focus();
            }
        }
    };
    
    // Remove existing listener if any and add new one
    document.removeEventListener('keydown', handleKeyboardShortcut);
    document.addEventListener('keydown', handleKeyboardShortcut);
    
    console.log('Homepage search functionality initialized');
}

/**
 * Calculate actual progress for a company based on solved problems
 * Requirement 4.2: Display progress (X solved out of Y total problems)
 */
async function calculateCompanyProgress(companyName) {
    try {
        // Get the company data
        const company = dataManager ? dataManager.getCachedCompany(companyName) : null;
        const totalProblems = company ? company.problemCount : 0;
        
        if (totalProblems === 0) {
            return { solved: 0, total: 0 };
        }
        
        // Check if we have cached progress data that's still valid
        const cachedProgress = stateManager ? stateManager.getCompanyProgress(companyName) : null;
        
        if (cachedProgress && cachedProgress.total === totalProblems) {
            // Use cached data if it matches current total
            return { solved: cachedProgress.solved || 0, total: totalProblems };
        }
        
        // For the homepage, we'll use a simplified approach to calculate progress
        // In a real implementation, we would load the company's actual problems
        // and check which ones are marked as solved in the state manager
        
        // Get all solved problems from state manager
        const allSolvedProblems = stateManager ? stateManager.getSolvedProblems() : [];
        
        // Create a realistic but simplified progress calculation
        // This simulates having some solved problems for demonstration
        let solvedCount = 0;
        
        if (allSolvedProblems.length > 0) {
            // If user has solved problems, estimate based on company size and user activity
            const userActivityLevel = Math.min(allSolvedProblems.length / 100, 1); // 0 to 1
            const companyDifficultyFactor = Math.max(0.1, Math.min(1, totalProblems / 50)); // Larger companies are "harder"
            const baseProgress = userActivityLevel * companyDifficultyFactor * 0.3; // Max 30% progress
            solvedCount = Math.floor(totalProblems * baseProgress);
        } else {
            // No solved problems yet, show 0 progress
            solvedCount = 0;
        }
        
        const progress = { solved: solvedCount, total: totalProblems };
        
        // Update state manager with calculated progress
        if (stateManager) {
            stateManager.updateCompanyProgress(companyName, solvedCount, totalProblems);
        }
        
        return progress;
    } catch (error) {
        console.warn(`Failed to calculate progress for ${companyName}:`, error);
        return { solved: 0, total: 0 };
    }
}

/**
 * Filter companies by search query
 * Requirement 2.2: Show matching company cards when searching by company name
 */
function filterCompaniesBySearch(companies, query) {
    if (!query || query.length === 0) {
        return companies;
    }
    
    const searchTerm = query.toLowerCase();
    
    return companies.filter(company => {
        // Search by company name
        const nameMatch = company.name.toLowerCase().includes(searchTerm);
        
        // Could extend to search by other criteria in the future
        return nameMatch;
    });
}

/**
 * Perform global search across all problems by title and company
 * Requirement 2.1: Implement real-time search across all problems by title and company
 * Requirement 2.2: Show matching company cards when searching by company name
 */
async function performGlobalSearch(query, companies) {
    if (!query || query.trim().length === 0) {
        return [];
    }
    
    const searchTerm = query.toLowerCase().trim();
    const results = [];
    
    console.log(`Searching for "${searchTerm}" across ${companies.length} companies`);
    
    // Search through each company's problems
    for (const company of companies) {
        try {
            // Check if company name matches search query
            const companyNameMatch = company.name.toLowerCase().includes(searchTerm);
            
            // Load company problems
            const problems = await dataManager.loadCompanyProblems(company.name);
            
            if (problems && problems.length > 0) {
                // Apply user state to problems
                const problemsWithState = applyUserStateToProblems(problems);
                
                // Filter problems by search query
                const matchingProblems = problemsWithState.filter(problem => {
                    // Search by problem title
                    const titleMatch = problem.title.toLowerCase().includes(searchTerm);
                    
                    // Search by topics
                    const topicsMatch = problem.topics && problem.topics.some(topic => 
                        topic.toLowerCase().includes(searchTerm)
                    );
                    
                    // Include all problems if company name matches, or specific problems that match
                    return companyNameMatch || titleMatch || topicsMatch;
                });
                
                // Add matching problems to results with company context
                matchingProblems.forEach(problem => {
                    results.push({
                        ...problem,
                        companyName: company.name,
                        matchType: companyNameMatch ? 'company' : (
                            problem.title.toLowerCase().includes(searchTerm) ? 'title' : 'topic'
                        )
                    });
                });
            }
        } catch (error) {
            console.warn(`Failed to search problems for company ${company.name}:`, error);
            // Continue with other companies
        }
    }
    
    // Sort results by relevance
    return sortSearchResults(results, searchTerm);
}

/**
 * Sort search results by relevance
 * Requirement 2.3: Create search result highlighting and "no results" messaging
 */
function sortSearchResults(results, searchTerm) {
    return results.sort((a, b) => {
        // Prioritize by match type: exact title match > company match > topic match
        const matchTypeOrder = { 'title': 1, 'company': 2, 'topic': 3 };
        const aOrder = matchTypeOrder[a.matchType] || 4;
        const bOrder = matchTypeOrder[b.matchType] || 4;
        
        if (aOrder !== bOrder) {
            return aOrder - bOrder;
        }
        
        // Within same match type, prioritize exact matches
        const aExactTitle = a.title.toLowerCase() === searchTerm;
        const bExactTitle = b.title.toLowerCase() === searchTerm;
        
        if (aExactTitle && !bExactTitle) return -1;
        if (!aExactTitle && bExactTitle) return 1;
        
        // Then by title length (shorter titles first for better relevance)
        if (a.title.length !== b.title.length) {
            return a.title.length - b.title.length;
        }
        
        // Finally alphabetically by title
        return a.title.localeCompare(b.title);
    });
}

/**
 * Update search description with query and result count
 * Requirement 2.3: Create search result highlighting and "no results" messaging
 */
function updateSearchDescription(query, resultCount) {
    const searchDescription = document.getElementById('search-description');
    if (searchDescription) {
        if (resultCount === 0) {
            searchDescription.textContent = `No results found for "${query}". Try different keywords or browse companies directly.`;
        } else {
            searchDescription.textContent = `Found ${resultCount} result${resultCount === 1 ? '' : 's'} for "${query}"`;
        }
    }
}

/**
 * Render search results in the grid
 * Requirement 2.1: Filter displayed results in real-time
 * Requirement 2.3: Create search result highlighting and "no results" messaging
 */
async function renderSearchResults(results) {
    const searchResultsGrid = document.getElementById('search-results-grid');
    const noSearchResults = document.querySelector('.no-search-results');
    
    if (!searchResultsGrid) {
        console.error('Search results grid element not found');
        return;
    }
    
    // Clear existing content
    searchResultsGrid.innerHTML = '';
    
    if (results.length === 0) {
        // Show no results message
        if (noSearchResults) {
            noSearchResults.style.display = 'block';
        }
        return;
    }
    
    // Hide no results message
    if (noSearchResults) {
        noSearchResults.style.display = 'none';
    }
    
    // Create search result cards
    for (const result of results) {
        try {
            // Create enhanced problem card with company context
            const card = createSearchResultCard(result);
            searchResultsGrid.appendChild(card);
        } catch (error) {
            console.warn(`Failed to create search result card for ${result.title}:`, error);
        }
    }
    
    console.log(`Rendered ${results.length} search result cards`);
}

/**
 * Create a search result card with company context and highlighting
 * Requirement 2.3: Create search result highlighting and "no results" messaging
 */
function createSearchResultCard(result) {
    const card = document.createElement('div');
    card.className = `search-result-card problem-card ${result.solved ? 'solved' : ''} ${result.bookmarked ? 'bookmarked' : ''}`;
    card.setAttribute('data-problem-id', result.id);
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `${result.title} from ${result.companyName} - ${result.difficulty} difficulty`);

    // Search result header
    const header = document.createElement('div');
    header.className = 'search-result-header';

    // Company name badge
    const companyBadge = document.createElement('span');
    companyBadge.className = 'company-badge';
    companyBadge.textContent = result.companyName;
    companyBadge.setAttribute('title', `From ${result.companyName}`);

    // Problem title with highlighting
    const title = document.createElement('h4');
    title.className = 'problem-title';
    title.innerHTML = highlightSearchTerm(result.title, stateManager.getSearchQuery());

    // Difficulty badge
    const difficultyBadge = UIComponents.createDifficultyBadge(result.difficulty);

    header.appendChild(companyBadge);
    header.appendChild(title);
    header.appendChild(difficultyBadge);

    // Problem topics with highlighting
    const topicsContainer = document.createElement('div');
    topicsContainer.className = 'problem-topics';
    
    if (result.topics && result.topics.length > 0) {
        result.topics.slice(0, 3).forEach(topic => {
            const topicTag = document.createElement('span');
            topicTag.className = 'topic-tag';
            topicTag.innerHTML = highlightSearchTerm(topic.trim(), stateManager.getSearchQuery());
            topicsContainer.appendChild(topicTag);
        });
        
        if (result.topics.length > 3) {
            const moreTag = document.createElement('span');
            moreTag.className = 'topic-tag more-topics';
            moreTag.textContent = `+${result.topics.length - 3} more`;
            moreTag.setAttribute('title', result.topics.slice(3).join(', '));
            topicsContainer.appendChild(moreTag);
        }
    }

    // Problem metadata
    const meta = document.createElement('div');
    meta.className = 'problem-meta';

    if (result.frequency !== undefined && result.frequency !== null && !isNaN(result.frequency)) {
        const frequency = document.createElement('span');
        frequency.className = 'problem-frequency';
        frequency.textContent = `Frequency: ${Utils.formatFrequency(result.frequency)}`;
        meta.appendChild(frequency);
    }

    if (result.acceptanceRate !== undefined && result.acceptanceRate !== null && !isNaN(result.acceptanceRate)) {
        const acceptance = document.createElement('span');
        acceptance.className = 'problem-acceptance';
        acceptance.textContent = `Acceptance: ${Utils.formatAcceptanceRate(result.acceptanceRate)}`;
        meta.appendChild(acceptance);
    }

    // Match type indicator
    const matchIndicator = document.createElement('span');
    matchIndicator.className = 'match-indicator';
    matchIndicator.textContent = getMatchTypeLabel(result.matchType);
    matchIndicator.setAttribute('title', `Matched by ${result.matchType}`);
    meta.appendChild(matchIndicator);

    // Add LeetCode link if available
    if (result.link && Utils.isValidURL(result.link)) {
        const linkIcon = document.createElement('span');
        linkIcon.className = 'problem-link-icon';
        linkIcon.innerHTML = '🔗';
        linkIcon.setAttribute('title', 'Click to open in LeetCode');
        linkIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            window.open(result.link, '_blank', 'noopener,noreferrer');
        });
        meta.appendChild(linkIcon);
    }

    // Problem status indicators
    const status = document.createElement('div');
    status.className = 'problem-status';

    card.appendChild(header);
    card.appendChild(topicsContainer);
    card.appendChild(meta);
    card.appendChild(status);

    // Add click handler for navigation to problem detail
    card.addEventListener('click', (e) => {
        // Don't navigate if clicking on the link icon
        if (e.target.classList.contains('problem-link-icon')) {
            return;
        }
        RouterUtils.goToProblem(result.companyName, result.id);
    });

    // Add keyboard navigation support
    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            RouterUtils.goToProblem(result.companyName, result.id);
        }
    });

    return card;
}

/**
 * Highlight search terms in text
 * Requirement 2.3: Create search result highlighting
 */
function highlightSearchTerm(text, searchTerm) {
    if (!searchTerm || !text) {
        return Utils.sanitizeHTML(text);
    }
    
    const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');
    
    return Utils.sanitizeHTML(text).replace(regex, '<mark>$1</mark>');
}

/**
 * Get human-readable label for match type
 */
function getMatchTypeLabel(matchType) {
    const labels = {
        'title': 'Title Match',
        'company': 'Company Match',
        'topic': 'Topic Match'
    };
    return labels[matchType] || 'Match';
}

/**
 * Show empty search state
 * Requirement 2.5: Display "No results found" message when no search results
 */
function showEmptySearchState() {
    const searchResultsGrid = document.getElementById('search-results-grid');
    const noSearchResults = document.querySelector('.no-search-results');
    const searchDescription = document.getElementById('search-description');
    
    if (searchResultsGrid) {
        searchResultsGrid.innerHTML = '';
    }
    
    if (searchDescription) {
        searchDescription.textContent = 'Enter a search term to find problems across all companies.';
    }
    
    if (noSearchResults) {
        noSearchResults.style.display = 'none';
    }
}

/**
 * Set up search result interaction handlers
 */
function setupSearchResultHandlers() {
    // Set up any additional handlers for search results
    console.log('Search result handlers initialized');
}

/**
 * Show loading state
 */
function showLoadingState() {
    const loadingContainer = document.querySelector('.loading-container');
    const mainContent = document.querySelector('.main-content .container');
    
    if (loadingContainer) {
        loadingContainer.style.display = 'flex';
    }
    
    if (mainContent) {
        mainContent.style.opacity = '0.5';
    }
}

/**
 * Hide loading state
 */
function hideLoadingState() {
    const loadingContainer = document.querySelector('.loading-container');
    const mainContent = document.querySelector('.main-content .container');
    
    if (loadingContainer) {
        loadingContainer.style.display = 'none';
    }
    
    if (mainContent) {
        mainContent.style.opacity = '1';
    }
}

/**
 * Show error state
 */
function showErrorState(message) {
    const errorContainer = document.querySelector('.error-container');
    const errorMessage = document.querySelector('.error-message');
    const retryButton = document.querySelector('.retry-button');
    
    if (errorContainer) {
        errorContainer.style.display = 'flex';
    }
    
    if (errorMessage) {
        errorMessage.textContent = message;
    }
    
    if (retryButton) {
        retryButton.onclick = () => {
            errorContainer.style.display = 'none';
            initializeHomepage();
        };
    }
    
    hideLoadingState();
}

/**
 * Company page helper functions
 * Requirement 1.2: Navigate to company's problem list page
 * Requirement 3.1: Display all problems for a selected company
 * Requirement 4.1: Save solved problems state in localStorage
 * Requirement 5.1: Display filter buttons for Easy, Medium, and Hard difficulties
 */

/**
 * Update company header with company information
 */
function updateCompanyHeader(company) {
    const companyNameEl = document.getElementById('company-name');
    if (companyNameEl) {
        companyNameEl.textContent = company.name;
    }
    
    // Update page title
    document.title = `${company.name} Problems - LeetCode Company Problems`;
}

/**
 * Apply user state (solved/bookmarked) to problems
 * Requirement 4.4: Display visual indicator for solved/unsolved states
 */
function applyUserStateToProblems(problems) {
    return problems.map(problem => {
        const problemWithState = { ...problem };
        problemWithState.solved = stateManager ? stateManager.isProblemSolved(problem.id) : false;
        problemWithState.bookmarked = stateManager ? stateManager.isProblemBookmarked(problem.id) : false;
        return problemWithState;
    });
}

/**
 * Set up filter controls for the company page
 * Requirement 5.1: Display filter buttons for Easy, Medium, and Hard difficulties
 * Requirement 5.4: Update problem count display when filters are applied
 */
function setupCompanyPageFilters(problems) {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    if (filterButtons.length === 0) {
        console.warn('Filter buttons not found');
        return;
    }
    
    // Calculate counts for each difficulty
    const counts = calculateDifficultyCounts(problems);
    
    // Update filter button counts
    updateFilterButtonCounts(counts);
    
    // Set up filter button click handlers
    filterButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            
            const filter = button.getAttribute('data-filter');
            
            // Update active state
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Update state manager
            if (stateManager) {
                stateManager.updateFilters({ difficulty: filter });
            }
            
            // Re-render problems with new filter
            await renderProblems(problems, filter);
        });
    });
}

/**
 * Calculate problem counts by difficulty
 * Requirement 5.4: Update problem count display when filters are applied
 */
function calculateDifficultyCounts(problems) {
    const counts = {
        all: problems.length,
        easy: 0,
        medium: 0,
        hard: 0
    };
    
    problems.forEach(problem => {
        const difficulty = problem.difficulty.toLowerCase();
        if (counts.hasOwnProperty(difficulty)) {
            counts[difficulty]++;
        }
    });
    
    return counts;
}

/**
 * Update filter button counts
 */
function updateFilterButtonCounts(counts) {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        const filter = button.getAttribute('data-filter');
        const count = counts[filter] || 0;
        
        // Update button text with count
        const filterText = filter.charAt(0).toUpperCase() + filter.slice(1);
        button.innerHTML = `${filterText} <span class="filter-count">(${count})</span>`;
    });
}

/**
 * Render problems based on current filter
 * Requirement 3.1: Display all problems for a selected company
 * Requirement 5.2: Show only problems of selected difficulty when filter is clicked
 * Requirement 5.3: Show all problems when "All" filter is clicked
 */
async function renderProblems(problems, filter = 'all') {
    const problemsGrid = document.getElementById('problems-grid');
    const noProblems = document.querySelector('.no-problems');
    
    if (!problemsGrid) {
        console.error('Problems grid element not found');
        return;
    }
    
    // Filter problems based on selected difficulty
    const filteredProblems = filterProblemsByDifficulty(problems, filter);
    
    // Clear existing content
    problemsGrid.innerHTML = '';
    
    if (filteredProblems.length === 0) {
        // Show no problems message
        if (noProblems) {
            noProblems.style.display = 'block';
            const message = filter === 'all' ? 
                'No problems available for this company.' : 
                `No ${filter} problems found.`;
            const messageEl = noProblems.querySelector('p');
            if (messageEl) {
                messageEl.textContent = message;
            }
        }
        return;
    }
    
    // Hide no problems message
    if (noProblems) {
        noProblems.style.display = 'none';
    }
    
    // Create problem cards
    for (const problem of filteredProblems) {
        try {
            const card = UIComponents.createProblemCard(problem, {
                onClick: (clickedProblem) => {
                    RouterUtils.goToProblem(getCurrentCompanyName(), clickedProblem.id);
                }
            });
            
            // Add solved/unsolved toggle handler
            addProblemStateHandlers(card, problem);
            
            problemsGrid.appendChild(card);
        } catch (error) {
            console.warn(`Failed to create card for problem ${problem.title}:`, error);
        }
    }
    
    console.log(`Rendered ${filteredProblems.length} problems with filter: ${filter}`);
}

/**
 * Filter problems by difficulty
 * Requirement 5.2: Show only problems of selected difficulty
 */
function filterProblemsByDifficulty(problems, filter) {
    if (filter === 'all') {
        return problems;
    }
    
    return problems.filter(problem => 
        problem.difficulty.toLowerCase() === filter.toLowerCase()
    );
}

/**
 * Add state management handlers to problem cards
 * Requirement 4.4: Update visual indicator when problem is marked as solved/unsolved
 * Requirement 4.5: Update state and visual indicator for solved/unsolved problems
 */
function addProblemStateHandlers(card, problem) {
    // Add click handler for solved status toggle (on card click with modifier key)
    card.addEventListener('click', (e) => {
        // Check if Ctrl/Cmd key is pressed for quick solved toggle
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            e.stopPropagation();
            toggleProblemSolvedStatus(problem.id);
        }
    });
    
    // Add context menu for additional options
    card.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showProblemContextMenu(e, problem);
    });
    
    // Add keyboard support
    card.addEventListener('keydown', (e) => {
        if (e.key === 's' || e.key === 'S') {
            e.preventDefault();
            toggleProblemSolvedStatus(problem.id);
        } else if (e.key === 'b' || e.key === 'B') {
            e.preventDefault();
            toggleProblemBookmarkStatus(problem.id);
        }
    });
}

/**
 * Toggle problem solved status
 * Requirement 4.4: Update solved/unsolved problem states
 */
function toggleProblemSolvedStatus(problemId) {
    if (stateManager) {
        const currentStatus = stateManager.isProblemSolved(problemId);
        const newStatus = !currentStatus;
        
        if (stateManager.updateSolvedStatus(problemId, newStatus)) {
            // Update UI immediately
            updateProblemCardState(problemId, 'solved', newStatus);
            
            // Update company progress
            updateCompanyProgressFromState();
            
            console.log(`Problem ${problemId} marked as ${newStatus ? 'solved' : 'unsolved'}`);
        }
    }
}

/**
 * Toggle problem bookmark status
 * Requirement 6.1: Implement bookmark toggle functionality
 */
function toggleProblemBookmarkStatus(problemId) {
    if (stateManager) {
        const currentStatus = stateManager.isProblemBookmarked(problemId);
        const newStatus = !currentStatus;
        
        if (stateManager.updateBookmarkStatus(problemId, newStatus)) {
            // Update UI immediately
            updateProblemCardState(problemId, 'bookmarked', newStatus);
            
            console.log(`Problem ${problemId} ${newStatus ? 'bookmarked' : 'unbookmarked'}`);
        }
    }
}

/**
 * Update problem card state in the UI
 * Requirement 4.5: Update visual indicator immediately when state changes
 */
function updateProblemCardState(problemId, stateType, value) {
    const problemCard = document.querySelector(`[data-problem-id="${problemId}"]`);
    if (problemCard) {
        if (stateType === 'solved') {
            problemCard.classList.toggle('solved', value);
        } else if (stateType === 'bookmarked') {
            problemCard.classList.toggle('bookmarked', value);
        }
    }
}

/**
 * Show context menu for problem options
 */
function showProblemContextMenu(event, problem) {
    // Create a simple context menu
    const existingMenu = document.querySelector('.problem-context-menu');
    if (existingMenu) {
        existingMenu.remove();
    }
    
    const menu = document.createElement('div');
    menu.className = 'problem-context-menu';
    menu.style.position = 'fixed';
    menu.style.left = `${event.clientX}px`;
    menu.style.top = `${event.clientY}px`;
    menu.style.backgroundColor = 'var(--surface-color)';
    menu.style.border = '1px solid var(--border-color)';
    menu.style.borderRadius = 'var(--radius-md)';
    menu.style.padding = 'var(--spacing-sm)';
    menu.style.boxShadow = 'var(--shadow-lg)';
    menu.style.zIndex = '1000';
    
    const solvedText = stateManager?.isProblemSolved(problem.id) ? 'Mark as Unsolved' : 'Mark as Solved';
    const bookmarkText = stateManager?.isProblemBookmarked(problem.id) ? 'Remove Bookmark' : 'Add Bookmark';
    
    menu.innerHTML = `
        <div class="context-menu-item" data-action="toggle-solved">${solvedText}</div>
        <div class="context-menu-item" data-action="toggle-bookmark">${bookmarkText}</div>
        <div class="context-menu-item" data-action="view-problem">View Problem</div>
        <div class="context-menu-item" data-action="open-leetcode">Open in LeetCode</div>
    `;
    
    // Add click handlers
    menu.addEventListener('click', (e) => {
        const action = e.target.getAttribute('data-action');
        
        switch (action) {
            case 'toggle-solved':
                toggleProblemSolvedStatus(problem.id);
                break;
            case 'toggle-bookmark':
                toggleProblemBookmarkStatus(problem.id);
                break;
            case 'view-problem':
                RouterUtils.goToProblem(getCurrentCompanyName(), problem.id);
                break;
            case 'open-leetcode':
                window.open(problem.link, '_blank', 'noopener,noreferrer');
                break;
        }
        
        menu.remove();
    });
    
    document.body.appendChild(menu);
    
    // Remove menu when clicking elsewhere
    setTimeout(() => {
        document.addEventListener('click', () => {
            menu.remove();
        }, { once: true });
    }, 0);
}

/**
 * Update company progress based on current state
 * Requirement 4.2: Display progress (X solved out of Y total problems)
 */
function updateCompanyProgress(company, problems) {
    const solvedCount = problems.filter(p => p.solved).length;
    const totalCount = problems.length;
    
    // Update progress text
    const progressText = document.getElementById('company-progress');
    if (progressText) {
        progressText.textContent = `${solvedCount} / ${totalCount} problems solved`;
    }
    
    // Update progress bar
    const progressFill = document.getElementById('company-progress-fill');
    if (progressFill) {
        const percentage = totalCount > 0 ? (solvedCount / totalCount) * 100 : 0;
        progressFill.style.width = `${percentage}%`;
    }
    
    // Update state manager
    if (stateManager) {
        stateManager.updateCompanyProgress(company.name, solvedCount, totalCount);
    }
}

/**
 * Update company progress from current state
 */
function updateCompanyProgressFromState() {
    const companyName = getCurrentCompanyName();
    if (!companyName) return;
    
    const problemCards = document.querySelectorAll('.problem-card');
    const totalCount = problemCards.length;
    const solvedCount = document.querySelectorAll('.problem-card.solved').length;
    
    // Update progress text
    const progressText = document.getElementById('company-progress');
    if (progressText) {
        progressText.textContent = `${solvedCount} / ${totalCount} problems solved`;
    }
    
    // Update progress bar
    const progressFill = document.getElementById('company-progress-fill');
    if (progressFill) {
        const percentage = totalCount > 0 ? (solvedCount / totalCount) * 100 : 0;
        progressFill.style.width = `${percentage}%`;
    }
    
    // Update state manager
    if (stateManager) {
        stateManager.updateCompanyProgress(companyName, solvedCount, totalCount);
    }
}

/**
 * Get current company name from URL
 */
function getCurrentCompanyName() {
    if (router) {
        const currentRoute = router.getCurrentRoute();
        return currentRoute.params?.companyName;
    }
    return null;
}

/**
 * Set up problem interaction handlers
 */
function setupProblemInteractionHandlers() {
    // Set up event delegation for problem cards
    const problemsGrid = document.getElementById('problems-grid');
    
    if (problemsGrid) {
        // Handle clicks on problem cards
        problemsGrid.addEventListener('click', (e) => {
            const problemCard = e.target.closest('.problem-card');
            if (!problemCard) return;
            
            const problemId = problemCard.getAttribute('data-problem-id');
            if (!problemId) return;
            
            // Check if clicking on action buttons (if they exist)
            if (e.target.closest('.problem-actions-inline')) {
                return; // Let the button handle its own click
            }
            
            // Handle Ctrl/Cmd + Click for quick solved toggle
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                toggleProblemSolved(problemId);
                return;
            }
            
            // Regular click - navigate to problem detail
            const companyName = router ? router.getParam('companyName') : null;
            if (companyName) {
                RouterUtils.goToProblem(companyName, problemId);
            }
        });
        
        // Handle right-click context menu
        problemsGrid.addEventListener('contextmenu', (e) => {
            const problemCard = e.target.closest('.problem-card');
            if (!problemCard) return;
            
            e.preventDefault();
            const problemId = problemCard.getAttribute('data-problem-id');
            if (problemId) {
                showProblemContextMenu(e, problemId);
            }
        });
        
        // Handle keyboard shortcuts
        problemsGrid.addEventListener('keydown', (e) => {
            const problemCard = e.target.closest('.problem-card');
            if (!problemCard) return;
            
            const problemId = problemCard.getAttribute('data-problem-id');
            if (!problemId) return;
            
            // S key - Toggle solved status
            if (e.key === 's' || e.key === 'S') {
                e.preventDefault();
                toggleProblemSolved(problemId);
                return;
            }
            
            // B key - Toggle bookmark status
            if (e.key === 'b' || e.key === 'B') {
                e.preventDefault();
                toggleProblemBookmark(problemId);
                return;
            }
            
            // Enter or Space - Navigate to problem detail
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const companyName = router ? router.getParam('companyName') : null;
                if (companyName) {
                    RouterUtils.goToProblem(companyName, problemId);
                }
            }
        });
    }
    
    console.log('Problem interaction handlers set up');
    console.log('Keyboard shortcuts:');
    console.log('- Ctrl/Cmd + Click: Toggle solved status');
    console.log('- Right-click: Show context menu');
    console.log('- S key: Toggle solved status');
    console.log('- B key: Toggle bookmark status');
    console.log('- Enter/Space: Navigate to problem detail');
}

/**
 * Show context menu for problem card
 * Requirement 6.1: Implement bookmark toggle functionality
 * Requirement 4.4: Update solved/unsolved problem states
 */
function showProblemContextMenu(event, problemId) {
    // Remove existing context menu
    const existingMenu = document.querySelector('.problem-context-menu');
    if (existingMenu) {
        existingMenu.remove();
    }
    
    // Create context menu
    const menu = document.createElement('div');
    menu.className = 'problem-context-menu';
    menu.style.position = 'fixed';
    menu.style.left = `${event.clientX}px`;
    menu.style.top = `${event.clientY}px`;
    menu.style.zIndex = '1000';
    
    // Get current states
    const isSolved = stateManager ? stateManager.isProblemSolved(problemId) : false;
    const isBookmarked = stateManager ? stateManager.isProblemBookmarked(problemId) : false;
    
    // Create menu items
    const menuItems = [
        {
            text: isSolved ? 'Mark as Unsolved' : 'Mark as Solved',
            icon: isSolved ? '○' : '✓',
            action: () => toggleProblemSolved(problemId)
        },
        {
            text: isBookmarked ? 'Remove Bookmark' : 'Add Bookmark',
            icon: isBookmarked ? '☆' : '★',
            action: () => toggleProblemBookmark(problemId)
        },
        {
            text: 'View Details',
            icon: '👁',
            action: () => {
                const companyName = router ? router.getParam('companyName') : null;
                if (companyName) {
                    RouterUtils.goToProblem(companyName, problemId);
                }
            }
        }
    ];
    
    menuItems.forEach(item => {
        const menuItem = document.createElement('div');
        menuItem.className = 'context-menu-item';
        menuItem.innerHTML = `${item.icon} ${item.text}`;
        menuItem.addEventListener('click', (e) => {
            e.stopPropagation();
            item.action();
            menu.remove();
        });
        menu.appendChild(menuItem);
    });
    
    // Add to document
    document.body.appendChild(menu);
    
    // Position menu to stay within viewport
    const rect = menu.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
        menu.style.left = `${event.clientX - rect.width}px`;
    }
    if (rect.bottom > window.innerHeight) {
        menu.style.top = `${event.clientY - rect.height}px`;
    }
    
    // Close menu when clicking outside
    const closeMenu = (e) => {
        if (!menu.contains(e.target)) {
            menu.remove();
            document.removeEventListener('click', closeMenu);
        }
    };
    
    // Add slight delay to prevent immediate closing
    setTimeout(() => {
        document.addEventListener('click', closeMenu);
    }, 100);
    
    // Close on escape key
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            menu.remove();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
}

/**
 * Update breadcrumbs based on current route
 */
function updateBreadcrumbs(path, params) {
    const breadcrumbContainer = document.querySelector('.breadcrumbs');
    if (!breadcrumbContainer) return;
    
    let breadcrumbs = [];
    
    if (path === '/' || path === '/home') {
        breadcrumbs = [{ text: 'Home', url: '/' }];
    } else if (path.startsWith('/company/')) {
        breadcrumbs = [
            { text: 'Home', url: '/' },
            { text: params.companyName, url: `/company/${params.companyName}` }
        ];
        
        if (params.problemId) {
            breadcrumbs.push({
                text: 'Problem Detail',
                url: `/company/${params.companyName}/problem/${params.problemId}`
            });
        }
    } else if (path === '/favorites') {
        breadcrumbs = [
            { text: 'Home', url: '/' },
            { text: 'Favorites', url: '/favorites' }
        ];
    } else if (path === '/search') {
        breadcrumbs = [
            { text: 'Home', url: '/' },
            { text: 'Search Results', url: '/search' }
        ];
    }
    
    // Render breadcrumbs
    breadcrumbContainer.innerHTML = breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;
        if (isLast) {
            return `<span class="breadcrumb-current">${crumb.text}</span>`;
        } else {
            return `<a href="#${crumb.url}" class="breadcrumb-link">${crumb.text}</a>`;
        }
    }).join(' <span class="breadcrumb-separator">›</span> ');
    
    // Update active navigation items
    updateActiveNavigation(path);
}

/**
 * Update active navigation items based on current route
 * Requirement 7.4: Respond appropriately to touch gestures
 */
function updateActiveNavigation(path) {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.classList.remove('active');
        
        const section = item.getAttribute('data-section');
        if ((path === '/' && section === 'home') || 
            (path === '/favorites' && section === 'favorites')) {
            item.classList.add('active');
        }
    });
}

/**
 * Set up global event listeners for navigation
 */
function setupGlobalEventListeners() {
    // Back button handlers
    document.addEventListener('click', (event) => {
        if (event.target.matches('.back-button') || event.target.closest('.back-button')) {
            event.preventDefault();
            RouterUtils.goBack();
        }
    });
    
    // Theme toggle handler
    document.addEventListener('click', (event) => {
        if (event.target.matches('.theme-toggle') || event.target.closest('.theme-toggle')) {
            event.preventDefault();
            StateUtils.toggleTheme();
        }
    });
    
    // Note: Search functionality is handled per-page in their respective initialization functions
}

// Initialize the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initializeApp();
        setupGlobalEventListeners();
    });
} else {
    initializeApp();
    setupGlobalEventListeners();
}
/**
 
* Problem Detail Page Helper Functions
 * Requirement 3.1: Display problem detail page showing title, difficulty, topics, and LeetCode link
 * Requirement 3.2: Display problem title, difficulty, and LeetCode link
 * Requirement 3.4: Return to company page when back button is clicked
 * Requirement 4.4: Update visual indicator when problem is marked as solved/unsolved
 * Requirement 6.1: Display bookmark functionality with visual feedback
 */

/**
 * Update problem detail UI with problem data
 * Requirement 3.1: Display problem detail page
 * Requirement 3.2: Display problem title, difficulty, and LeetCode link
 */
function updateProblemDetailUI(problem, companyName) {
    // Update problem title
    const titleEl = document.getElementById('problem-title');
    if (titleEl) {
        titleEl.textContent = problem.title;
    }
    
    // Update difficulty badge
    const difficultyEl = document.getElementById('problem-difficulty');
    if (difficultyEl) {
        difficultyEl.textContent = Utils.formatDifficulty(problem.difficulty);
        difficultyEl.className = `difficulty-badge ${problem.difficulty.toLowerCase()}`;
    }
    
    // Update frequency if available
    const frequencyEl = document.getElementById('problem-frequency');
    if (frequencyEl && problem.frequency !== undefined && problem.frequency !== null && !isNaN(problem.frequency)) {
        frequencyEl.textContent = `Frequency: ${Utils.formatFrequency(problem.frequency)}`;
        frequencyEl.style.display = 'inline';
    } else if (frequencyEl) {
        frequencyEl.style.display = 'none';
    }
    
    // Update acceptance rate if available
    const acceptanceEl = document.getElementById('problem-acceptance');
    if (acceptanceEl && problem.acceptanceRate !== undefined && problem.acceptanceRate !== null && !isNaN(problem.acceptanceRate)) {
        acceptanceEl.textContent = `Acceptance: ${Utils.formatAcceptanceRate(problem.acceptanceRate)}`;
        acceptanceEl.style.display = 'inline';
    } else if (acceptanceEl) {
        acceptanceEl.style.display = 'none';
    }
    
    // Update LeetCode link
    const leetcodeLinkEl = document.getElementById('leetcode-link');
    if (leetcodeLinkEl && problem.link && Utils.isValidURL(problem.link)) {
        leetcodeLinkEl.href = problem.link;
        leetcodeLinkEl.style.display = 'inline-flex';
    } else if (leetcodeLinkEl) {
        leetcodeLinkEl.style.display = 'none';
    }
    
    // Update topics
    updateProblemTopics(problem.topics);
    
    // Update bookmark button state
    updateBookmarkButton(problem.bookmarked);
    
    // Update solved button state
    updateSolvedButton(problem.solved);
    
    console.log('Problem detail UI updated');
}

/**
 * Update problem topics display
 */
function updateProblemTopics(topics) {
    const topicsContainer = document.getElementById('problem-topics');
    if (!topicsContainer) return;
    
    // Clear existing topics
    topicsContainer.innerHTML = '';
    
    if (!topics || topics.length === 0) {
        topicsContainer.style.display = 'none';
        return;
    }
    
    topicsContainer.style.display = 'flex';
    
    // Create topic tags
    topics.forEach(topic => {
        const topicTag = document.createElement('span');
        topicTag.className = 'topic-tag';
        topicTag.textContent = topic.trim();
        topicsContainer.appendChild(topicTag);
    });
}

/**
 * Update bookmark button state
 * Requirement 6.1: Display bookmark functionality with visual feedback
 */
function updateBookmarkButton(isBookmarked) {
    const bookmarkBtn = document.getElementById('bookmark-btn');
    const bookmarkText = bookmarkBtn ? bookmarkBtn.querySelector('.bookmark-text') : null;
    const bookmarkIcon = bookmarkBtn ? bookmarkBtn.querySelector('.bookmark-icon') : null;
    
    if (bookmarkBtn) {
        if (isBookmarked) {
            bookmarkBtn.classList.add('bookmarked');
            bookmarkBtn.setAttribute('aria-label', 'Remove bookmark');
            if (bookmarkText) bookmarkText.textContent = 'Bookmarked';
            if (bookmarkIcon) bookmarkIcon.style.fill = 'currentColor';
        } else {
            bookmarkBtn.classList.remove('bookmarked');
            bookmarkBtn.setAttribute('aria-label', 'Bookmark this problem');
            if (bookmarkText) bookmarkText.textContent = 'Bookmark';
            if (bookmarkIcon) bookmarkIcon.style.fill = 'none';
        }
    }
}

/**
 * Update solved button state
 * Requirement 4.4: Update visual indicator when problem is marked as solved/unsolved
 */
function updateSolvedButton(isSolved) {
    const solvedBtn = document.getElementById('solved-btn');
    const solvedText = solvedBtn ? solvedBtn.querySelector('.solved-text') : null;
    
    if (solvedBtn) {
        if (isSolved) {
            solvedBtn.classList.add('solved');
            solvedBtn.setAttribute('aria-label', 'Mark as unsolved');
            if (solvedText) solvedText.textContent = 'Solved';
        } else {
            solvedBtn.classList.remove('solved');
            solvedBtn.setAttribute('aria-label', 'Mark as solved');
            if (solvedText) solvedText.textContent = 'Mark as Solved';
        }
    }
}

/**
 * Set up problem detail action handlers
 * Requirement 4.5: Update state and visual indicator when problem is marked as solved/unsolved
 * Requirement 6.1: Implement bookmark toggle functionality
 */
function setupProblemDetailHandlers(problem, companyName) {
    // Bookmark button handler
    const bookmarkBtn = document.getElementById('bookmark-btn');
    if (bookmarkBtn) {
        // Remove existing listeners
        const newBookmarkBtn = bookmarkBtn.cloneNode(true);
        bookmarkBtn.parentNode.replaceChild(newBookmarkBtn, bookmarkBtn);
        
        newBookmarkBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            if (stateManager) {
                const currentStatus = stateManager.isProblemBookmarked(problem.id);
                const newStatus = !currentStatus;
                
                // Update state
                const changed = stateManager.updateBookmarkStatus(problem.id, newStatus);
                
                if (changed) {
                    // Update UI immediately
                    updateBookmarkButton(newStatus);
                    
                    // Show feedback
                    showActionFeedback(newStatus ? 'Problem bookmarked!' : 'Bookmark removed!');
                    
                    console.log(`Problem ${problem.id} ${newStatus ? 'bookmarked' : 'unbookmarked'}`);
                }
            }
        });
    }
    
    // Solved button handler
    const solvedBtn = document.getElementById('solved-btn');
    if (solvedBtn) {
        // Remove existing listeners
        const newSolvedBtn = solvedBtn.cloneNode(true);
        solvedBtn.parentNode.replaceChild(newSolvedBtn, solvedBtn);
        
        newSolvedBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            if (stateManager) {
                const currentStatus = stateManager.isProblemSolved(problem.id);
                const newStatus = !currentStatus;
                
                // Update state
                const changed = stateManager.updateSolvedStatus(problem.id, newStatus);
                
                if (changed) {
                    // Update UI immediately
                    updateSolvedButton(newStatus);
                    
                    // Show feedback
                    showActionFeedback(newStatus ? 'Problem marked as solved!' : 'Problem marked as unsolved!');
                    
                    console.log(`Problem ${problem.id} marked as ${newStatus ? 'solved' : 'unsolved'}`);
                }
            }
        });
    }
    
    console.log('Problem detail handlers set up');
}

/**
 * Set up back button functionality
 * Requirement 3.4: Return to company page when back button is clicked
 */
function setupProblemDetailBackButton(companyName) {
    const backButton = document.querySelector('.problem-detail-section .back-button');
    
    if (backButton) {
        // Remove existing listeners
        const newBackButton = backButton.cloneNode(true);
        backButton.parentNode.replaceChild(newBackButton, backButton);
        
        newBackButton.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Navigate back to company page
            RouterUtils.goToCompany(companyName);
            
            console.log(`Navigating back to company: ${companyName}`);
        });
        
        // Also handle keyboard navigation
        newBackButton.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                RouterUtils.goToCompany(companyName);
            }
        });
    }
    
    console.log('Back button functionality set up');
}

/**
 * Show action feedback to user
 */
function showActionFeedback(message) {
    // Create or update feedback element
    let feedbackEl = document.querySelector('.action-feedback');
    
    if (!feedbackEl) {
        feedbackEl = document.createElement('div');
        feedbackEl.className = 'action-feedback';
        feedbackEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: var(--success-color);
            color: white;
            padding: var(--spacing-sm) var(--spacing-md);
            border-radius: var(--radius-md);
            font-size: var(--font-size-sm);
            font-weight: 500;
            z-index: 1000;
            opacity: 0;
            transform: translateY(-10px);
            transition: all var(--transition-fast);
            pointer-events: none;
        `;
        document.body.appendChild(feedbackEl);
    }
    
    // Update message
    feedbackEl.textContent = message;
    
    // Show feedback
    feedbackEl.style.opacity = '1';
    feedbackEl.style.transform = 'translateY(0)';
    
    // Hide after 3 seconds
    setTimeout(() => {
        feedbackEl.style.opacity = '0';
        feedbackEl.style.transform = 'translateY(-10px)';
    }, 3000);
}

/**
 * Get current company name from router params
 */
function getCurrentCompanyName() {
    if (router) {
        const currentRoute = router.getCurrentRoute();
        return currentRoute.params ? currentRoute.params.companyName : null;
    }
    return null;
}/**
 *
 Set up global event listeners for navigation and UI interactions
 */
function setupGlobalEventListeners() {
    // Theme toggle functionality
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', (e) => {
            e.preventDefault();
            
            if (stateManager) {
                const currentTheme = stateManager.getTheme();
                const newTheme = currentTheme === 'light' ? 'dark' : 'light';
                stateManager.updateTheme(newTheme);
            }
        });
    }
    
    // Global keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Escape key to go back
        if (e.key === 'Escape' && !e.ctrlKey && !e.metaKey && !e.altKey) {
            // Only if not in an input field
            if (!e.target.matches('input, textarea, [contenteditable]')) {
                const currentRoute = router ? router.getCurrentRoute() : null;
                if (currentRoute && currentRoute.path.includes('/problem/')) {
                    // Go back to company page from problem detail
                    const companyName = getCurrentCompanyName();
                    if (companyName) {
                        RouterUtils.goToCompany(companyName);
                    }
                } else if (currentRoute && currentRoute.path.startsWith('/company/')) {
                    // Go back to homepage from company page
                    RouterUtils.goHome();
                }
            }
        }
    });
    
    console.log('Global event listeners set up');
}

// Initialize global event listeners when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupGlobalEventListeners);
} else {
    setupGlobalEventListeners();
}

/**
 * Optimized company cards rendering with batched DOM updates
 * Requirement 9.5: Optimize DOM updates and implement efficient rendering
 */
async function renderCompanyCardsOptimized(companies) {
    const companiesGrid = document.getElementById('companies-grid');
    
    if (!companiesGrid) {
        throw new Error('Companies grid element not found');
    }
    
    // Clear existing content
    companiesGrid.innerHTML = '';
    
    // Use performance manager for batched updates if available
    if (window.domOptimizer) {
        const batchSize = 10; // Render 10 cards at a time
        
        for (let i = 0; i < companies.length; i += batchSize) {
            const batch = companies.slice(i, i + batchSize);
            
            await new Promise(resolve => {
                window.domOptimizer.scheduleUpdate(() => {
                    const fragment = document.createDocumentFragment();
                    
                    batch.forEach(company => {
                        try {
                            // Get progress data from state manager
                            const progress = stateManager ? stateManager.getCompanyProgress(company.name) : null;
                            const card = UIComponents.createCompanyCard(company, progress);
                            fragment.appendChild(card);
                        } catch (error) {
                            console.warn(`Failed to create card for company ${company.name}:`, error);
                        }
                    });
                    
                    companiesGrid.appendChild(fragment);
                    resolve();
                });
            });
            
            // Small delay to prevent blocking the main thread
            if (i + batchSize < companies.length) {
                await new Promise(resolve => setTimeout(resolve, 0));
            }
        }
    } else {
        // Fallback to regular rendering
        await renderCompanyCards(companies);
    }
}

/**
 * Enhanced company page initialization with performance optimizations
 */
async function initializeCompanyPageOptimized(companyName) {
    console.log(`Initializing company page for: ${companyName}`);
    
    const problemsGrid = document.getElementById('problems-grid');
    const operationId = `company-page-${companyName}`;
    
    try {
        // Show loading state
        showLoadingState(`Loading problems for ${companyName}...`, problemsGrid);
        
        // Load problems with retry mechanism
        const problems = await (window.performanceManager ? 
            window.performanceManager.executeWithRetry(
                operationId,
                () => dataManager.loadCompanyProblems(companyName),
                {
                    maxRetries: 3,
                    baseDelay: 1000,
                    showLoading: false, // We're handling it manually
                    showError: false,   // We're handling it manually
                    allowManualRetry: true
                }
            ) :
            dataManager.loadCompanyProblems(companyName)
        );
        
        if (!problems || problems.length === 0) {
            throw new Error(`No problems found for ${companyName}`);
        }
        
        // Apply user state to problems
        if (stateManager) {
            problems.forEach(problem => {
                problem.solved = stateManager.isProblemSolved(problem.id);
                problem.bookmarked = stateManager.isProblemBookmarked(problem.id);
            });
        }
        
        // Update page title and stats
        updateCompanyPageHeader(companyName, problems);
        
        // Render problems with optimization for large lists
        if (problems.length > 50 && window.performanceManager) {
            // Use virtual scrolling for large problem sets
            setupVirtualScrolling(problemsGrid, problems);
        } else {
            await renderProblemsOptimized(problems, problemsGrid);
        }
        
        // Set up filtering and search
        setupCompanyPageFilters(problems);
        
        hideLoadingState();
        
        console.log(`Company page initialized successfully with ${problems.length} problems`);
        
    } catch (error) {
        console.error(`Failed to initialize company page for ${companyName}:`, error);
        hideLoadingState();
        
        // Show error with retry option
        showErrorState(error, () => {
            console.log(`Retrying company page initialization for ${companyName}...`);
            initializeCompanyPageOptimized(companyName);
        }, problemsGrid);
    }
}

/**
 * Optimized problems rendering with batched DOM updates
 */
async function renderProblemsOptimized(problems, container) {
    if (!container) {
        throw new Error('Container element is required');
    }
    
    // Clear existing content
    container.innerHTML = '';
    
    // Use performance manager for batched updates if available
    if (window.domOptimizer && problems.length > 20) {
        const batchSize = 15; // Render 15 problem cards at a time
        
        for (let i = 0; i < problems.length; i += batchSize) {
            const batch = problems.slice(i, i + batchSize);
            
            await new Promise(resolve => {
                window.domOptimizer.scheduleUpdate(() => {
                    const fragment = document.createDocumentFragment();
                    
                    batch.forEach(problem => {
                        try {
                            const card = UIComponents.createProblemCard(problem, {
                                onClick: (problem) => {
                                    RouterUtils.goToProblem(companyName, problem.id);
                                }
                            });
                            fragment.appendChild(card);
                        } catch (error) {
                            console.warn(`Failed to create card for problem ${problem.title}:`, error);
                        }
                    });
                    
                    container.appendChild(fragment);
                    resolve();
                });
            });
            
            // Small delay to prevent blocking the main thread
            if (i + batchSize < problems.length) {
                await new Promise(resolve => setTimeout(resolve, 0));
            }
        }
    } else {
        // Fallback to regular rendering
        const fragment = document.createDocumentFragment();
        
        problems.forEach(problem => {
            try {
                const card = UIComponents.createProblemCard(problem, {
                    onClick: (problem) => {
                        RouterUtils.goToProblem(companyName, problem.id);
                    }
                });
                fragment.appendChild(card);
            } catch (error) {
                console.warn(`Failed to create card for problem ${problem.title}:`, error);
            }
        });
        
        container.appendChild(fragment);
    }
}

/**
 * Setup virtual scrolling for large problem lists
 */
function setupVirtualScrolling(container, problems) {
    if (!window.performanceManager) {
        console.warn('Performance manager not available, falling back to regular rendering');
        return renderProblemsOptimized(problems, container);
    }
    
    const itemHeight = 120; // Approximate height of problem card
    
    const virtualScroller = window.performanceManager.createVirtualScroller(
        container,
        problems,
        (problem, index) => {
            return UIComponents.createProblemCard(problem, {
                onClick: (problem) => {
                    RouterUtils.goToProblem(companyName, problem.id);
                }
            });
        },
        itemHeight
    );
    
    // Store reference for cleanup
    container._virtualScroller = virtualScroller;
    
    console.log(`Virtual scrolling enabled for ${problems.length} problems`);
}

/**
 * Enhanced search functionality with caching and performance optimization
 */
function setupEnhancedSearch(searchableItems, searchFunction, renderFunction) {
    const searchInput = document.getElementById('search-input');
    
    if (!searchInput) {
        console.warn('Search input not found');
        return;
    }
    
    // Create search manager if not available
    const searchManager = window.searchManager || new SearchManager({
        debounceDelay: 300,
        minQueryLength: 2,
        maxResults: 100,
        maxCacheSize: 50
    });
    
    // Enhanced search handler
    const handleSearch = (query) => {
        searchManager.search(
            query,
            async (searchQuery) => {
                // Perform the actual search
                return searchFunction(searchQuery, searchableItems);
            },
            (results, fromCache, error) => {
                if (error) {
                    console.error('Search error:', error);
                    showActionFeedback('Search failed. Please try again.');
                    return;
                }
                
                // Render results
                renderFunction(results);
                
                // Show performance indicator
                if (fromCache) {
                    console.log(`Search results from cache: ${results.length} items`);
                } else {
                    console.log(`Search completed: ${results.length} items`);
                }
            }
        );
    };
    
    // Set up input handler
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        handleSearch(query);
    });
    
    // Clear search cache when needed
    window.addEventListener('beforeunload', () => {
        if (searchManager.clearCache) {
            searchManager.clearCache();
        }
    });
}

/**
 * Performance monitoring and debugging utilities
 */
function initializePerformanceMonitoring() {
    if (!window.performanceManager) {
        console.log('Performance manager not available');
        return;
    }
    
    // Monitor performance metrics
    setInterval(() => {
        const metrics = window.performanceManager.getMetrics();
        
        if (metrics.activeLoadingStates > 0 || metrics.activeErrorStates > 0) {
            console.log('Performance metrics:', metrics);
        }
    }, 5000); // Check every 5 seconds
    
    // Memory usage monitoring (if available)
    if (performance.memory) {
        setInterval(() => {
            const memory = performance.memory;
            const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
            const totalMB = Math.round(memory.totalJSHeapSize / 1048576);
            
            if (usedMB > 50) { // Alert if using more than 50MB
                console.warn(`High memory usage: ${usedMB}MB / ${totalMB}MB`);
            }
        }, 30000); // Check every 30 seconds
    }
}

// Initialize performance monitoring when the app starts
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure all modules are loaded
    setTimeout(initializePerformanceMonitoring, 1000);
});