// Reusable UI components
// Contains functions for creating and managing UI components

/**
 * UIComponents class provides reusable UI component creation methods
 * Requirement 1.1: Display company cards with company names and logos
 * Requirement 2.1: Filter displayed results in real-time
 * Requirement 5.1: Display filter buttons for Easy, Medium, and Hard difficulties
 * Requirement 10.2: Use modular functions with clear responsibilities
 */
class UIComponents {
    /**
     * Create a company card element
     * Requirement 1.1: Display a grid of company cards with company names and logos
     * Requirement 1.4: Display the total number of problems for that company on the card
     */
    static createCompanyCard(company, progress = null) {
        if (!company || !company.name) {
            throw new Error('Company object with name is required');
        }

        const card = document.createElement('a');
        card.className = 'company-card';
        card.href = `#/company/${encodeURIComponent(company.name)}`;
        card.setAttribute('data-company', company.name);
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', `View problems for ${company.name}`);

        // Company header with logo and name
        const header = document.createElement('div');
        header.className = 'company-header';

        // Company logo
        const logo = document.createElement('div');
        logo.className = 'company-logo';
        
        if (company.logoUrl) {
            const logoImg = document.createElement('img');
            logoImg.src = company.logoUrl;
            logoImg.alt = `${company.name} logo`;
            logoImg.onerror = () => {
                // Fallback to initials if image fails to load
                logo.textContent = UIComponents.getCompanyInitials(company.name);
            };
            logo.appendChild(logoImg);
        } else {
            // Use company initials as fallback
            logo.textContent = UIComponents.getCompanyInitials(company.name);
        }

        // Company name
        const name = document.createElement('h3');
        name.className = 'company-name';
        name.textContent = company.name;

        header.appendChild(logo);
        header.appendChild(name);

        // Company stats
        const stats = document.createElement('div');
        stats.className = 'company-stats';

        // Problem count
        const problemCount = document.createElement('div');
        problemCount.className = 'company-problem-count';
        problemCount.textContent = `${company.problemCount || 0} problems`;

        // Progress information if available
        const progressInfo = document.createElement('div');
        progressInfo.className = 'company-progress';
        
        if (progress && progress.total > 0) {
            const solvedCount = progress.solved || 0;
            const totalCount = progress.total;
            const percentage = Math.round((solvedCount / totalCount) * 100);
            
            const progressText = document.createElement('span');
            progressText.className = 'progress-text';
            progressText.textContent = `${solvedCount}/${totalCount} solved (${percentage}%)`;
            
            const progressBar = document.createElement('div');
            progressBar.className = 'progress-bar';
            
            const progressFill = document.createElement('div');
            progressFill.className = 'progress-fill';
            progressFill.style.width = `${percentage}%`;
            
            progressBar.appendChild(progressFill);
            progressInfo.appendChild(progressText);
            progressInfo.appendChild(progressBar);
        } else if (progress && progress.total === 0) {
            progressInfo.textContent = 'No problems available';
        } else {
            progressInfo.textContent = 'Loading progress...';
        }

        stats.appendChild(problemCount);
        stats.appendChild(progressInfo);

        card.appendChild(header);
        card.appendChild(stats);

        // Add keyboard navigation support
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                card.click();
            }
        });

        // Add focus event handlers for accessibility
        card.addEventListener('focus', () => {
            if (window.accessibilityManager) {
                window.accessibilityManager.announceToScreenReader(`Focused on ${company.name}`);
            }
        });

        return card;
    }

    /**
     * Create a problem card element
     * Requirement 3.1: Display problem title, difficulty, and LeetCode link
     * Requirement 4.4: Display visual indicator for solved/unsolved states
     * Requirement 6.1: Display bookmark functionality with visual feedback
     */
    static createProblemCard(problem, options = {}) {
        if (!problem || !problem.title) {
            throw new Error('Problem object with title is required');
        }

        const card = document.createElement('div');
        card.className = `problem-card ${problem.solved ? 'solved' : ''} ${problem.bookmarked ? 'bookmarked' : ''}`;
        card.setAttribute('data-problem-id', problem.id);
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', `${problem.title} - ${problem.difficulty} difficulty${problem.solved ? ' (solved)' : ''}${problem.bookmarked ? ' (bookmarked)' : ''}`);

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

        // Add LeetCode link if available
        if (problem.link && Utils.isValidURL(problem.link)) {
            const linkIcon = document.createElement('span');
            linkIcon.className = 'problem-link-icon';
            linkIcon.innerHTML = '🔗';
            linkIcon.setAttribute('title', 'Click to open in LeetCode');
            linkIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                window.open(problem.link, '_blank', 'noopener,noreferrer');
            });
            meta.appendChild(linkIcon);
        }

        // Problem status indicators (handled by CSS pseudo-elements for solved/bookmarked)
        const status = document.createElement('div');
        status.className = 'problem-status';

        // Add status text for screen readers
        if (problem.solved || problem.bookmarked) {
            const statusText = [];
            if (problem.solved) statusText.push('Solved');
            if (problem.bookmarked) statusText.push('Bookmarked');
            
            const srText = document.createElement('span');
            srText.className = 'sr-only';
            srText.textContent = statusText.join(', ');
            status.appendChild(srText);
        }

        card.appendChild(header);
        card.appendChild(topicsContainer);
        card.appendChild(meta);
        card.appendChild(status);

        // Add click handler for navigation
        if (options.onClick) {
            card.addEventListener('click', (e) => {
                // Don't navigate if clicking on the link icon
                if (e.target.classList.contains('problem-link-icon')) {
                    return;
                }
                options.onClick(problem);
            });
        }

        // Add keyboard navigation support
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (options.onClick) {
                    options.onClick(problem);
                }
            }
        });

        // Add focus event handlers for accessibility
        card.addEventListener('focus', () => {
            if (window.accessibilityManager) {
                const statusText = [];
                if (problem.solved) statusText.push('solved');
                if (problem.bookmarked) statusText.push('bookmarked');
                const status = statusText.length > 0 ? `, ${statusText.join(' and ')}` : '';
                window.accessibilityManager.announceToScreenReader(`Focused on ${problem.title}, ${problem.difficulty}${status}`);
            }
        });

        return card;
    }

    /**
     * Create a difficulty badge element
     * Requirement 5.1: Display filter buttons for Easy, Medium, and Hard difficulties
     */
    static createDifficultyBadge(difficulty) {
        const badge = document.createElement('span');
        badge.className = `difficulty-badge ${difficulty.toLowerCase()}`;
        badge.textContent = Utils.formatDifficulty(difficulty);
        badge.setAttribute('aria-label', `${difficulty} difficulty`);
        return badge;
    }

    /**
     * Create a search bar component
     * Requirement 2.1: Filter displayed results in real-time
     * Requirement 2.4: Focus search bar when "/" key is pressed
     */
    static createSearchBar(options = {}) {
        const container = document.createElement('div');
        container.className = 'search-container';

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'search-input';
        input.placeholder = options.placeholder || 'Search problems, companies, or topics...';
        input.setAttribute('aria-label', 'Search');
        input.setAttribute('role', 'searchbox');

        // Clear button
        const clearButton = document.createElement('button');
        clearButton.className = 'search-clear';
        clearButton.innerHTML = '×';
        clearButton.setAttribute('aria-label', 'Clear search');
        clearButton.style.display = 'none';

        container.appendChild(input);
        container.appendChild(clearButton);

        // Debounced search handler
        let searchTimeout;
        const debouncedSearch = (query) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                if (options.onSearch) {
                    options.onSearch(query);
                }
            }, options.debounceDelay || 300);
        };

        // Input event handler
        input.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            
            // Show/hide clear button
            clearButton.style.display = query ? 'block' : 'none';
            
            // Trigger search
            debouncedSearch(query);
        });

        // Clear button handler
        clearButton.addEventListener('click', () => {
            input.value = '';
            clearButton.style.display = 'none';
            input.focus();
            
            if (options.onSearch) {
                options.onSearch('');
            }
        });

        // Keyboard shortcut handler (/)
        document.addEventListener('keydown', (e) => {
            if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey) {
                // Only focus if not already focused on an input
                if (document.activeElement.tagName !== 'INPUT' && 
                    document.activeElement.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    input.focus();
                }
            }
        });

        // Expose methods for external control
        container.setValue = (value) => {
            input.value = value;
            clearButton.style.display = value ? 'block' : 'none';
        };

        container.getValue = () => input.value;
        container.focus = () => input.focus();
        container.clear = () => {
            input.value = '';
            clearButton.style.display = 'none';
            if (options.onSearch) {
                options.onSearch('');
            }
        };

        return container;
    }

    /**
     * Create filter buttons component
     * Requirement 5.1: Display filter buttons for Easy, Medium, and Hard difficulties
     * Requirement 5.2: Show only problems of selected difficulty when filter is clicked
     * Requirement 5.4: Update problem count display when filters are applied
     */
    static createFilterButtons(options = {}) {
        const container = document.createElement('div');
        container.className = 'filter-controls';

        // Filter group
        const filterGroup = document.createElement('div');
        filterGroup.className = 'filter-group';

        // Filter label
        const label = document.createElement('span');
        label.className = 'filter-label';
        label.textContent = 'Difficulty:';

        // Filter buttons container
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'filter-buttons';

        // Define filter options
        const filters = [
            { key: 'all', label: 'All', count: options.counts?.all || 0 },
            { key: 'easy', label: 'Easy', count: options.counts?.easy || 0 },
            { key: 'medium', label: 'Medium', count: options.counts?.medium || 0 },
            { key: 'hard', label: 'Hard', count: options.counts?.hard || 0 }
        ];

        const buttons = new Map();

        // Create filter buttons
        filters.forEach(filter => {
            const button = document.createElement('button');
            button.className = 'filter-btn';
            button.setAttribute('data-filter', filter.key);
            button.setAttribute('aria-label', `Filter by ${filter.label} difficulty`);
            
            // Set active state for default filter
            if (filter.key === (options.activeFilter || 'all')) {
                button.classList.add('active');
                button.setAttribute('aria-pressed', 'true');
            } else {
                button.setAttribute('aria-pressed', 'false');
            }

            // Button content with count
            const updateButtonContent = (count) => {
                button.innerHTML = `${filter.label} <span class="filter-count">(${count || 0})</span>`;
            };

            updateButtonContent(filter.count);

            // Click handler
            button.addEventListener('click', () => {
                // Update active state
                buttons.forEach(btn => {
                    btn.classList.remove('active');
                    btn.setAttribute('aria-pressed', 'false');
                });
                
                button.classList.add('active');
                button.setAttribute('aria-pressed', 'true');

                // Trigger filter change
                if (options.onFilterChange) {
                    options.onFilterChange(filter.key);
                }
            });

            buttons.set(filter.key, button);
            buttonsContainer.appendChild(button);
        });

        filterGroup.appendChild(label);
        filterGroup.appendChild(buttonsContainer);
        container.appendChild(filterGroup);

        // Expose methods for external control
        container.updateCounts = (counts) => {
            filters.forEach(filter => {
                const button = buttons.get(filter.key);
                if (button) {
                    const count = counts[filter.key] || 0;
                    const label = filter.label;
                    button.innerHTML = `${label} <span class="filter-count">(${count})</span>`;
                }
            });
        };

        container.setActiveFilter = (filterKey) => {
            buttons.forEach((btn, key) => {
                if (key === filterKey) {
                    btn.classList.add('active');
                    btn.setAttribute('aria-pressed', 'true');
                } else {
                    btn.classList.remove('active');
                    btn.setAttribute('aria-pressed', 'false');
                }
            });
        };

        container.getActiveFilter = () => {
            for (const [key, button] of buttons) {
                if (button.classList.contains('active')) {
                    return key;
                }
            }
            return 'all';
        };

        return container;
    }

    /**
     * Create a loading spinner component
     */
    static createLoadingSpinner(message = 'Loading...') {
        const container = document.createElement('div');
        container.className = 'loading-container';

        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        spinner.setAttribute('aria-label', 'Loading');

        const text = document.createElement('div');
        text.className = 'loading-text';
        text.textContent = message;

        container.appendChild(spinner);
        container.appendChild(text);

        return container;
    }

    /**
     * Create an error message component
     */
    static createErrorMessage(message, onRetry = null) {
        const container = document.createElement('div');
        container.className = 'error-container';

        const content = document.createElement('div');
        content.className = 'error-content';

        const title = document.createElement('h2');
        title.textContent = 'Error';

        const messageEl = document.createElement('p');
        messageEl.className = 'error-message';
        messageEl.textContent = message;

        content.appendChild(title);
        content.appendChild(messageEl);

        if (onRetry) {
            const retryButton = document.createElement('button');
            retryButton.className = 'retry-button';
            retryButton.textContent = 'Try Again';
            retryButton.addEventListener('click', onRetry);
            content.appendChild(retryButton);
        }

        container.appendChild(content);
        return container;
    }

    /**
     * Create an empty state component
     * Requirement 2.5: Display "No results found" message when no search results
     * Requirement 6.5: Display empty state message when no problems are bookmarked
     */
    static createEmptyState(options = {}) {
        const container = document.createElement('div');
        container.className = options.className || 'no-results';

        const content = document.createElement('div');
        content.className = 'empty-state-content';

        if (options.icon) {
            const icon = document.createElement('div');
            icon.className = 'empty-state-icon';
            icon.innerHTML = options.icon;
            content.appendChild(icon);
        }

        const title = document.createElement('h3');
        title.textContent = options.title || 'No results found';
        content.appendChild(title);

        if (options.message) {
            const message = document.createElement('p');
            message.textContent = options.message;
            content.appendChild(message);
        }

        if (options.action) {
            const actionButton = document.createElement('button');
            actionButton.className = 'cta-button';
            actionButton.textContent = options.action.text;
            actionButton.addEventListener('click', options.action.onClick);
            content.appendChild(actionButton);
        }

        container.appendChild(content);
        return container;
    }

    /**
     * Create a back button component
     * Requirement 3.4: Return to company page when back button is clicked
     */
    static createBackButton(options = {}) {
        const button = document.createElement('button');
        button.className = 'back-button';
        button.innerHTML = `← ${options.text || 'Back'}`;
        button.setAttribute('aria-label', options.ariaLabel || 'Go back');

        if (options.onClick) {
            button.addEventListener('click', options.onClick);
        }

        return button;
    }

    /**
     * Create a stats card component
     */
    static createStatsCard(title, value, className = '') {
        const card = document.createElement('div');
        card.className = `stat-card ${className}`;

        const number = document.createElement('div');
        number.className = 'stat-number';
        number.textContent = value;

        const label = document.createElement('div');
        label.className = 'stat-label';
        label.textContent = title;

        card.appendChild(number);
        card.appendChild(label);

        return card;
    }

    /**
     * Get company initials for logo fallback
     */
    static getCompanyInitials(companyName) {
        if (!companyName) return '?';
        
        return companyName
            .split(' ')
            .map(word => word.charAt(0).toUpperCase())
            .slice(0, 2)
            .join('');
    }

    /**
     * Create a theme toggle button
     * Requirement 8.1: Switch between light and dark modes when theme toggle is clicked
     */
    static createThemeToggle(options = {}) {
        const button = document.createElement('button');
        button.className = 'theme-toggle';
        button.setAttribute('aria-label', 'Toggle theme');
        button.setAttribute('title', 'Toggle light/dark theme');

        // Light theme icon
        const lightIcon = document.createElement('span');
        lightIcon.className = 'theme-icon theme-icon-light';
        lightIcon.innerHTML = '☀️';

        // Dark theme icon
        const darkIcon = document.createElement('span');
        darkIcon.className = 'theme-icon theme-icon-dark';
        darkIcon.innerHTML = '🌙';

        button.appendChild(lightIcon);
        button.appendChild(darkIcon);

        if (options.onClick) {
            button.addEventListener('click', options.onClick);
        }

        return button;
    }

    /**
     * Create breadcrumb navigation
     * Requirement 10.4: Provide breadcrumb navigation
     */
    static createBreadcrumb(items = []) {
        const nav = document.createElement('nav');
        nav.className = 'breadcrumb-nav';
        nav.setAttribute('aria-label', 'Breadcrumb');

        const list = document.createElement('ol');
        list.className = 'breadcrumb-list';

        items.forEach((item, index) => {
            const listItem = document.createElement('li');
            listItem.className = 'breadcrumb-item';

            if (item.href && index < items.length - 1) {
                const link = document.createElement('a');
                link.href = item.href;
                link.textContent = item.text;
                listItem.appendChild(link);
            } else {
                listItem.textContent = item.text;
                listItem.setAttribute('aria-current', 'page');
            }

            list.appendChild(listItem);
        });

        nav.appendChild(list);
        return nav;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UIComponents };
}