// Accessibility and Keyboard Navigation Manager
// Handles keyboard navigation, focus management, and accessibility features

/**
 * AccessibilityManager class handles keyboard navigation and accessibility features
 * Requirement 2.4: Add keyboard shortcut (/) to focus search bar
 * Requirement 10.4: Provide proper focus management and visible focus indicators
 */
class AccessibilityManager {
    constructor() {
        this.focusableElements = [
            'a[href]',
            'button:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            '[tabindex]:not([tabindex="-1"])',
            '[role="button"]:not([disabled])',
            '[role="link"]:not([disabled])'
        ].join(', ');
        
        this.currentFocusIndex = -1;
        this.focusableElementsList = [];
        this.isNavigatingWithKeyboard = false;
        
        this.init();
    }

    /**
     * Initialize accessibility features
     */
    init() {
        this.setupKeyboardNavigation();
        this.setupFocusManagement();
        this.setupAriaLiveRegions();
        this.setupSkipLinks();
        this.enhanceExistingElements();
        
        console.log('✅ AccessibilityManager initialized');
    }

    /**
     * Set up global keyboard navigation
     * Requirement 2.4: Add keyboard shortcut (/) to focus search bar
     */
    setupKeyboardNavigation() {
        // Global keyboard event handler
        document.addEventListener('keydown', (e) => {
            this.handleGlobalKeydown(e);
        });

        // Track keyboard vs mouse navigation
        document.addEventListener('keydown', () => {
            this.isNavigatingWithKeyboard = true;
        });

        document.addEventListener('mousedown', () => {
            this.isNavigatingWithKeyboard = false;
        });

        // Update focusable elements list when DOM changes
        const observer = new MutationObserver(() => {
            this.updateFocusableElements();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['tabindex', 'disabled', 'aria-hidden']
        });
    }

    /**
     * Handle global keyboard events
     */
    handleGlobalKeydown(e) {
        // Prevent handling if user is typing in an input field
        const activeElement = document.activeElement;
        const isInInputField = activeElement && (
            activeElement.tagName === 'INPUT' ||
            activeElement.tagName === 'TEXTAREA' ||
            activeElement.contentEditable === 'true'
        );

        // Global keyboard shortcuts
        switch (e.key) {
            case '/':
                if (!isInInputField && !e.ctrlKey && !e.metaKey && !e.altKey) {
                    e.preventDefault();
                    this.focusSearchBar();
                }
                break;

            case 'Escape':
                this.handleEscapeKey(e);
                break;

            case 'Tab':
                this.handleTabNavigation(e);
                break;

            case 'ArrowUp':
            case 'ArrowDown':
                if (this.isInGridContext(activeElement)) {
                    e.preventDefault();
                    this.handleGridNavigation(e);
                }
                break;

            case 'ArrowLeft':
            case 'ArrowRight':
                if (this.isInGridContext(activeElement)) {
                    e.preventDefault();
                    this.handleGridNavigation(e);
                }
                break;

            case 'Enter':
            case ' ':
                this.handleActivation(e);
                break;

            case 'Home':
                if (this.isInGridContext(activeElement)) {
                    e.preventDefault();
                    this.focusFirstInGrid(activeElement);
                }
                break;

            case 'End':
                if (this.isInGridContext(activeElement)) {
                    e.preventDefault();
                    this.focusLastInGrid(activeElement);
                }
                break;
        }

        // Handle numbered shortcuts (1-9) for quick navigation
        if (e.key >= '1' && e.key <= '9' && !isInInputField && e.altKey) {
            e.preventDefault();
            this.handleNumberedShortcut(parseInt(e.key));
        }
    }

    /**
     * Focus the search bar
     * Requirement 2.4: Add keyboard shortcut (/) to focus search bar
     */
    focusSearchBar() {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
            this.announceToScreenReader('Search focused');
        }
    }

    /**
     * Handle Escape key functionality
     */
    handleEscapeKey(e) {
        const activeElement = document.activeElement;

        // Clear search if focused on search input
        if (activeElement && activeElement.id === 'search-input') {
            activeElement.value = '';
            activeElement.blur();
            
            // Trigger search clear event
            const event = new Event('input', { bubbles: true });
            activeElement.dispatchEvent(event);
            
            this.announceToScreenReader('Search cleared');
            return;
        }

        // Close any open modals or dropdowns
        this.closeModalsAndDropdowns();

        // Navigate back if possible
        if (window.history.length > 1) {
            window.history.back();
        }
    }

    /**
     * Handle Tab navigation with focus trapping
     */
    handleTabNavigation(e) {
        // Update focusable elements list
        this.updateFocusableElements();

        // Handle focus trapping in modals
        const modal = document.querySelector('.modal:not([hidden])');
        if (modal) {
            this.trapFocusInModal(e, modal);
        }
    }

    /**
     * Check if element is in a grid context
     */
    isInGridContext(element) {
        if (!element) return false;
        
        const gridContainer = element.closest('[role="grid"], .companies-grid, .problems-grid, .favorites-grid');
        return !!gridContainer;
    }

    /**
     * Handle grid navigation (arrow keys)
     */
    handleGridNavigation(e) {
        const activeElement = document.activeElement;
        const gridContainer = activeElement.closest('[role="grid"], .companies-grid, .problems-grid, .favorites-grid');
        
        if (!gridContainer) return;

        const gridItems = Array.from(gridContainer.querySelectorAll(this.focusableElements));
        const currentIndex = gridItems.indexOf(activeElement);
        
        if (currentIndex === -1) return;

        let newIndex = currentIndex;
        const columns = this.getGridColumns(gridContainer);

        switch (e.key) {
            case 'ArrowUp':
                newIndex = Math.max(0, currentIndex - columns);
                break;
            case 'ArrowDown':
                newIndex = Math.min(gridItems.length - 1, currentIndex + columns);
                break;
            case 'ArrowLeft':
                newIndex = Math.max(0, currentIndex - 1);
                break;
            case 'ArrowRight':
                newIndex = Math.min(gridItems.length - 1, currentIndex + 1);
                break;
        }

        if (newIndex !== currentIndex && gridItems[newIndex]) {
            gridItems[newIndex].focus();
            this.announceGridPosition(newIndex + 1, gridItems.length);
        }
    }

    /**
     * Get number of columns in grid
     */
    getGridColumns(gridContainer) {
        const computedStyle = window.getComputedStyle(gridContainer);
        const gridTemplateColumns = computedStyle.gridTemplateColumns;
        
        if (gridTemplateColumns && gridTemplateColumns !== 'none') {
            return gridTemplateColumns.split(' ').length;
        }
        
        // Fallback: estimate based on container width and item width
        const containerWidth = gridContainer.offsetWidth;
        const firstItem = gridContainer.querySelector('.company-card, .problem-card');
        
        if (firstItem) {
            const itemWidth = firstItem.offsetWidth;
            const gap = parseInt(computedStyle.gap) || 16;
            return Math.floor((containerWidth + gap) / (itemWidth + gap)) || 1;
        }
        
        return 3; // Default fallback
    }

    /**
     * Handle Enter/Space activation
     */
    handleActivation(e) {
        const activeElement = document.activeElement;
        
        if (!activeElement) return;

        // Handle role="button" elements
        if (activeElement.getAttribute('role') === 'button' || 
            activeElement.classList.contains('company-card') ||
            activeElement.classList.contains('problem-card')) {
            e.preventDefault();
            activeElement.click();
        }

        // Handle filter buttons
        if (activeElement.classList.contains('filter-btn')) {
            e.preventDefault();
            activeElement.click();
        }
    }

    /**
     * Focus first item in grid
     */
    focusFirstInGrid(element) {
        const gridContainer = element.closest('[role="grid"], .companies-grid, .problems-grid, .favorites-grid');
        if (gridContainer) {
            const firstItem = gridContainer.querySelector(this.focusableElements);
            if (firstItem) {
                firstItem.focus();
                this.announceToScreenReader('First item focused');
            }
        }
    }

    /**
     * Focus last item in grid
     */
    focusLastInGrid(element) {
        const gridContainer = element.closest('[role="grid"], .companies-grid, .problems-grid, .favorites-grid');
        if (gridContainer) {
            const items = gridContainer.querySelectorAll(this.focusableElements);
            const lastItem = items[items.length - 1];
            if (lastItem) {
                lastItem.focus();
                this.announceToScreenReader('Last item focused');
            }
        }
    }

    /**
     * Handle numbered shortcuts (Alt + 1-9)
     */
    handleNumberedShortcut(number) {
        const shortcuts = [
            () => this.navigateToHome(),
            () => this.navigateToFavorites(),
            () => this.focusSearchBar(),
            () => this.toggleTheme(),
            () => this.focusFirstCompany(),
            () => this.focusFirstProblem(),
            () => this.goBack(),
            () => this.showKeyboardHelp(),
            () => this.toggleAccessibilityMode()
        ];

        if (shortcuts[number - 1]) {
            shortcuts[number - 1]();
        }
    }

    /**
     * Set up focus management
     */
    setupFocusManagement() {
        // Add focus-visible polyfill behavior
        document.addEventListener('focusin', (e) => {
            if (this.isNavigatingWithKeyboard) {
                e.target.classList.add('focus-visible');
            }
        });

        document.addEventListener('focusout', (e) => {
            e.target.classList.remove('focus-visible');
        });

        // Manage focus when navigating between pages
        window.addEventListener('hashchange', () => {
            this.manageFocusOnPageChange();
        });
    }

    /**
     * Manage focus when page changes
     */
    manageFocusOnPageChange() {
        // Focus the main heading of the new page
        setTimeout(() => {
            const mainHeading = document.querySelector('h1, h2, .page-title');
            if (mainHeading) {
                mainHeading.setAttribute('tabindex', '-1');
                mainHeading.focus();
                this.announceToScreenReader(`Navigated to ${mainHeading.textContent}`);
            }
        }, 100);
    }

    /**
     * Set up ARIA live regions for announcements
     */
    setupAriaLiveRegions() {
        // Create polite live region
        const politeLiveRegion = document.createElement('div');
        politeLiveRegion.id = 'aria-live-polite';
        politeLiveRegion.setAttribute('aria-live', 'polite');
        politeLiveRegion.setAttribute('aria-atomic', 'true');
        politeLiveRegion.className = 'sr-only';
        document.body.appendChild(politeLiveRegion);

        // Create assertive live region
        const assertiveLiveRegion = document.createElement('div');
        assertiveLiveRegion.id = 'aria-live-assertive';
        assertiveLiveRegion.setAttribute('aria-live', 'assertive');
        assertiveLiveRegion.setAttribute('aria-atomic', 'true');
        assertiveLiveRegion.className = 'sr-only';
        document.body.appendChild(assertiveLiveRegion);

        // Create status region
        const statusRegion = document.createElement('div');
        statusRegion.id = 'aria-status';
        statusRegion.setAttribute('role', 'status');
        statusRegion.setAttribute('aria-live', 'polite');
        statusRegion.className = 'sr-only';
        document.body.appendChild(statusRegion);
    }

    /**
     * Set up skip links for keyboard navigation
     */
    setupSkipLinks() {
        const skipLinks = document.createElement('div');
        skipLinks.className = 'skip-links';
        skipLinks.innerHTML = `
            <a href="#main-content" class="skip-link">Skip to main content</a>
            <a href="#search-input" class="skip-link">Skip to search</a>
            <a href="#companies-grid" class="skip-link">Skip to companies</a>
        `;
        
        document.body.insertBefore(skipLinks, document.body.firstChild);
    }

    /**
     * Enhance existing elements with accessibility features
     */
    enhanceExistingElements() {
        // Enhance company cards
        this.enhanceCompanyCards();
        
        // Enhance problem cards
        this.enhanceProblemCards();
        
        // Enhance filter buttons
        this.enhanceFilterButtons();
        
        // Enhance navigation
        this.enhanceNavigation();
    }

    /**
     * Enhance company cards with accessibility features
     */
    enhanceCompanyCards() {
        const companyCards = document.querySelectorAll('.company-card');
        companyCards.forEach((card, index) => {
            // Ensure proper ARIA attributes
            if (!card.getAttribute('role')) {
                card.setAttribute('role', 'button');
            }
            
            if (!card.getAttribute('tabindex')) {
                card.setAttribute('tabindex', '0');
            }

            // Add keyboard event handlers
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    card.click();
                }
            });

            // Enhance ARIA label with position information
            const companyName = card.querySelector('.company-name')?.textContent || 'Company';
            const problemCount = card.querySelector('.company-problem-count')?.textContent || '';
            card.setAttribute('aria-label', `${companyName}, ${problemCount}. Item ${index + 1} of ${companyCards.length}`);
        });
    }

    /**
     * Enhance problem cards with accessibility features
     */
    enhanceProblemCards() {
        const problemCards = document.querySelectorAll('.problem-card');
        problemCards.forEach((card, index) => {
            // Ensure proper ARIA attributes
            if (!card.getAttribute('role')) {
                card.setAttribute('role', 'button');
            }
            
            if (!card.getAttribute('tabindex')) {
                card.setAttribute('tabindex', '0');
            }

            // Add keyboard event handlers
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    card.click();
                }
            });

            // Enhance ARIA label with comprehensive information
            const title = card.querySelector('.problem-title')?.textContent || 'Problem';
            const difficulty = card.querySelector('.difficulty-badge')?.textContent || '';
            const solved = card.classList.contains('solved') ? 'Solved' : 'Not solved';
            const bookmarked = card.classList.contains('bookmarked') ? 'Bookmarked' : '';
            
            const ariaLabel = [title, difficulty, solved, bookmarked, `Item ${index + 1} of ${problemCards.length}`]
                .filter(Boolean)
                .join(', ');
            
            card.setAttribute('aria-label', ariaLabel);
        });
    }

    /**
     * Enhance filter buttons with accessibility features
     */
    enhanceFilterButtons() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(button => {
            // Add ARIA pressed state
            const isActive = button.classList.contains('active');
            button.setAttribute('aria-pressed', isActive.toString());
            
            // Update ARIA pressed state on click
            button.addEventListener('click', () => {
                // Remove active from all buttons
                filterButtons.forEach(btn => {
                    btn.classList.remove('active');
                    btn.setAttribute('aria-pressed', 'false');
                });
                
                // Set active on clicked button
                button.classList.add('active');
                button.setAttribute('aria-pressed', 'true');
                
                // Announce filter change
                const filterText = button.textContent.trim();
                this.announceToScreenReader(`Filter changed to ${filterText}`);
            });
        });
    }

    /**
     * Enhance navigation with accessibility features
     */
    enhanceNavigation() {
        // Enhance navigation items
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                // Update active state
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                
                // Announce navigation
                const navText = item.textContent.trim();
                this.announceToScreenReader(`Navigated to ${navText}`);
            });
        });

        // Enhance back buttons
        const backButtons = document.querySelectorAll('.back-button');
        backButtons.forEach(button => {
            button.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    button.click();
                }
            });
        });
    }

    /**
     * Update list of focusable elements
     */
    updateFocusableElements() {
        this.focusableElementsList = Array.from(document.querySelectorAll(this.focusableElements))
            .filter(el => {
                return el.offsetWidth > 0 && 
                       el.offsetHeight > 0 && 
                       !el.hasAttribute('disabled') &&
                       el.getAttribute('aria-hidden') !== 'true';
            });
    }

    /**
     * Announce message to screen readers
     */
    announceToScreenReader(message, priority = 'polite') {
        const liveRegionId = priority === 'assertive' ? 'aria-live-assertive' : 'aria-live-polite';
        const liveRegion = document.getElementById(liveRegionId);
        
        if (liveRegion) {
            liveRegion.textContent = message;
            
            // Clear after announcement
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        }
    }

    /**
     * Announce grid position to screen readers
     */
    announceGridPosition(current, total) {
        this.announceToScreenReader(`Item ${current} of ${total}`);
    }

    /**
     * Close any open modals or dropdowns
     */
    closeModalsAndDropdowns() {
        // Close modals
        const modals = document.querySelectorAll('.modal:not([hidden])');
        modals.forEach(modal => {
            modal.setAttribute('hidden', '');
        });

        // Close dropdowns
        const dropdowns = document.querySelectorAll('.dropdown.open');
        dropdowns.forEach(dropdown => {
            dropdown.classList.remove('open');
        });
    }

    /**
     * Trap focus within modal
     */
    trapFocusInModal(e, modal) {
        const focusableElements = modal.querySelectorAll(this.focusableElements);
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
        }
    }

    /**
     * Navigation helper methods
     */
    navigateToHome() {
        window.location.hash = '#/';
        this.announceToScreenReader('Navigating to home');
    }

    navigateToFavorites() {
        window.location.hash = '#/favorites';
        this.announceToScreenReader('Navigating to favorites');
    }

    toggleTheme() {
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.click();
        }
    }

    focusFirstCompany() {
        const firstCompany = document.querySelector('.company-card');
        if (firstCompany) {
            firstCompany.focus();
            this.announceToScreenReader('First company focused');
        }
    }

    focusFirstProblem() {
        const firstProblem = document.querySelector('.problem-card');
        if (firstProblem) {
            firstProblem.focus();
            this.announceToScreenReader('First problem focused');
        }
    }

    goBack() {
        if (window.history.length > 1) {
            window.history.back();
            this.announceToScreenReader('Going back');
        }
    }

    showKeyboardHelp() {
        this.announceToScreenReader('Keyboard shortcuts: Slash to search, Alt+1 for home, Alt+2 for favorites, Arrow keys to navigate grids, Enter or Space to activate', 'assertive');
    }

    toggleAccessibilityMode() {
        document.body.classList.toggle('accessibility-mode');
        const isEnabled = document.body.classList.contains('accessibility-mode');
        this.announceToScreenReader(`Accessibility mode ${isEnabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * Get current accessibility status
     */
    getAccessibilityStatus() {
        return {
            focusableElements: this.focusableElementsList.length,
            currentFocus: document.activeElement?.tagName || 'none',
            keyboardNavigation: this.isNavigatingWithKeyboard,
            accessibilityMode: document.body.classList.contains('accessibility-mode')
        };
    }

    /**
     * Destroy accessibility manager
     */
    destroy() {
        // Remove event listeners
        document.removeEventListener('keydown', this.handleGlobalKeydown);
        
        // Remove live regions
        const liveRegions = document.querySelectorAll('#aria-live-polite, #aria-live-assertive, #aria-status');
        liveRegions.forEach(region => region.remove());
        
        // Remove skip links
        const skipLinks = document.querySelector('.skip-links');
        if (skipLinks) {
            skipLinks.remove();
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AccessibilityManager };
}