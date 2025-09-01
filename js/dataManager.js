// Data management and CSV parsing
// Handles loading and parsing CSV files from company folders

/**
 * Problem data model with validation
 */
class Problem {
    constructor(data) {
        this.id = this.generateId(data.title, data.link);
        this.title = this.validateString(data.title, 'Problem title');
        this.difficulty = this.validateDifficulty(data.difficulty);
        this.link = this.validateUrl(data.link);
        this.topics = this.parseTopics(data.topics);
        this.frequency = this.validateNumber(data.frequency, 'Frequency', 0, 100);
        this.acceptanceRate = this.validateNumber(data.acceptanceRate, 'Acceptance Rate', 0, 1);
        this.solved = false;
        this.bookmarked = false;
    }

    /**
     * Generate unique ID for problem
     */
    generateId(title, link) {
        if (!title || !link) {
            throw new Error('Title and link are required for ID generation');
        }
        return btoa(encodeURIComponent(title + link)).replace(/[^a-zA-Z0-9]/g, '');
    }

    /**
     * Validate string fields
     */
    validateString(value, fieldName) {
        if (!value || typeof value !== 'string' || value.trim().length === 0) {
            throw new Error(`${fieldName} must be a non-empty string`);
        }
        return value.trim();
    }

    /**
     * Validate difficulty level
     */
    validateDifficulty(difficulty) {
        const validDifficulties = ['EASY', 'MEDIUM', 'HARD'];
        const normalizedDifficulty = difficulty?.toString().toUpperCase();

        if (!validDifficulties.includes(normalizedDifficulty)) {
            throw new Error(`Difficulty must be one of: ${validDifficulties.join(', ')}`);
        }
        return normalizedDifficulty;
    }

    /**
     * Validate URL format
     */
    validateUrl(url) {
        if (!url || typeof url !== 'string') {
            throw new Error('URL must be a valid string');
        }

        try {
            new URL(url);
            return url.trim();
        } catch (error) {
            throw new Error(`Invalid URL format: ${url}`);
        }
    }

    /**
     * Parse and validate topics
     */
    parseTopics(topics) {
        if (!topics) return [];

        if (typeof topics !== 'string') {
            throw new Error('Topics must be a string');
        }

        return topics.split(',').map(topic => topic.trim()).filter(topic => topic.length > 0);
    }

    /**
     * Validate numeric fields
     */
    validateNumber(value, fieldName, min = -Infinity, max = Infinity) {
        const num = parseFloat(value);

        if (isNaN(num)) {
            throw new Error(`${fieldName} must be a valid number`);
        }

        if (num < min || num > max) {
            throw new Error(`${fieldName} must be between ${min} and ${max}`);
        }

        return num;
    }
}

/**
 * Company data model with validation
 */
class Company {
    constructor(name, problemCount = 0, logoUrl = null) {
        this.name = this.validateString(name, 'Company name');
        this.problemCount = this.validateNumber(problemCount, 'Problem count', 0);
        this.logoUrl = logoUrl;
        this.solvedCount = 0;
        this.problems = [];
    }

    /**
     * Validate string fields
     */
    validateString(value, fieldName) {
        if (!value || typeof value !== 'string' || value.trim().length === 0) {
            throw new Error(`${fieldName} must be a non-empty string`);
        }
        return value.trim();
    }

    /**
     * Validate numeric fields
     */
    validateNumber(value, fieldName, min = 0) {
        const num = parseInt(value);

        if (isNaN(num) || num < min) {
            throw new Error(`${fieldName} must be a valid number >= ${min}`);
        }

        return num;
    }

    /**
     * Update solved count based on problems
     */
    updateSolvedCount() {
        this.solvedCount = this.problems.filter(problem => problem.solved).length;
    }
}
/**
 * DataManager class handles CSV file loading, parsing, and caching
 * Enhanced with performance optimizations and error handling
 */
class DataManager {
    constructor() {
        this.companiesCache = new Map();
        this.problemsCache = new Map();
        this.retryAttempts = 3;
        this.retryDelay = 1000; // 1 second base delay
        this.performanceManager = window.performanceManager || null;
        this.loadingOperations = new Set();
    }

    /**
     * Load list of companies using the enhanced initialization system
     * Requirement 1.3: Parse CSV files from company folders to extract problem information
     * Requirement 1.4: Display the total number of problems for that company on the card
     * Enhanced with performance optimizations and error handling
     */
    async loadCompanies() {
        const operationId = 'load-companies';
        
        // Prevent duplicate loading operations
        if (this.loadingOperations.has(operationId)) {
            console.log('Companies loading already in progress, waiting...');
            // Wait for existing operation to complete
            while (this.loadingOperations.has(operationId)) {
                await this.delay(100);
            }
            // Return cached result
            return Array.from(this.companiesCache.values());
        }
        
        // Check if company initializer is available and initialized
        if (window.companyInitializer && window.companyInitializer.isInitialized()) {
            const cachedCompanies = window.companyInitializer.getCachedCompanies();
            if (cachedCompanies.length > 0) {
                console.log(`Returning ${cachedCompanies.length} companies from initializer cache`);
                // Update local cache
                this.syncWithInitializerCache(cachedCompanies);
                return Array.from(this.companiesCache.values());
            }
        }
        
        // Check local cache
        if (this.companiesCache.size > 0) {
            console.log(`Returning ${this.companiesCache.size} cached companies`);
            return Array.from(this.companiesCache.values());
        }
        
        this.loadingOperations.add(operationId);
        
        try {
            // Try to use company initializer first
            if (window.companyInitializer) {
                try {
                    const companies = await window.companyInitializer.initialize(this, this.performanceManager);
                    this.syncWithInitializerCache(companies);
                    return Array.from(this.companiesCache.values());
                } catch (error) {
                    console.warn('Company initializer failed, falling back to direct loading:', error.message);
                }
            }
            
            // Fallback to direct loading
            return await this.loadCompaniesDirectly();
            
        } finally {
            this.loadingOperations.delete(operationId);
        }
    }

    /**
     * Load companies directly without initializer
     */
    async loadCompaniesDirectly() {
        // Use performance manager if available
        if (this.performanceManager) {
            return await this.performanceManager.executeWithRetry(
                'load-companies-direct',
                async () => {
                    const response = await this.fetchWithRetry('data/companies.json');
                    const companiesData = await response.json();
                    return this.processCompaniesData(companiesData);
                },
                {
                    maxRetries: this.retryAttempts,
                    baseDelay: this.retryDelay,
                    showLoading: false, // Handled by caller
                    showError: false,   // Handled by caller
                    allowManualRetry: true
                }
            );
        } else {
            // Fallback without performance manager
            const response = await this.fetchWithRetry('data/companies.json');
            const companiesData = await response.json();
            return this.processCompaniesData(companiesData);
        }
    }

    /**
     * Sync local cache with company initializer cache
     */
    syncWithInitializerCache(companies) {
        this.companiesCache.clear();
        
        companies.forEach(companyData => {
            try {
                const company = new Company(companyData.name, companyData.problemCount, companyData.logoUrl);
                // Copy additional metadata if available
                if (companyData.csvFiles) company.csvFiles = companyData.csvFiles;
                if (companyData.lastUpdated) company.lastUpdated = companyData.lastUpdated;
                if (companyData.categories) company.categories = companyData.categories;
                
                this.companiesCache.set(company.name, company);
            } catch (error) {
                console.warn(`Failed to sync company ${companyData.name}:`, error.message);
            }
        });
        
        console.log(`✓ Synced ${this.companiesCache.size} companies with initializer cache`);
    }
    
    /**
     * Process companies data with error handling
     * Enhanced to handle both old and new data formats
     */
    processCompaniesData(companiesData) {
        // Handle both old format (array) and new format (object with companies array)
        let companies;
        if (Array.isArray(companiesData)) {
            companies = companiesData;
        } else if (companiesData.companies && Array.isArray(companiesData.companies)) {
            companies = companiesData.companies;
        } else {
            throw new Error('Companies data must be an array or object with companies array');
        }
        
        const processedCompanies = [];
        const errors = [];

        for (const companyData of companies) {
            try {
                const company = new Company(companyData.name, companyData.problemCount, companyData.logoUrl);
                
                // Copy additional metadata from enhanced format
                if (companyData.csvFiles) company.csvFiles = companyData.csvFiles;
                if (companyData.lastUpdated) company.lastUpdated = companyData.lastUpdated;
                if (companyData.categories) company.categories = companyData.categories;
                if (companyData.hasProblems !== undefined) company.hasProblems = companyData.hasProblems;
                
                // For now, use the problem count from companies.json
                // Problems will be loaded on-demand when user visits company page
                // This improves homepage loading performance
                
                processedCompanies.push(company);
            } catch (error) {
                errors.push(`Failed to create company ${companyData.name}: ${error.message}`);
            }
        }

        // Log errors but don't fail completely
        if (errors.length > 0) {
            console.warn(`Company processing errors:\n${errors.join('\n')}`);
        }
        
        if (processedCompanies.length === 0) {
            throw new Error('No valid companies found in data');
        }

        // Cache companies
        processedCompanies.forEach(company => {
            this.companiesCache.set(company.name, company);
        });

        console.log(`Loaded ${processedCompanies.length} companies (${errors.length} errors)`);
        return processedCompanies;
    }

    /**
     * Load problems for a specific company
     * Enhanced with performance optimizations and error handling
     */
    async loadCompanyProblems(companyName) {
        if (!companyName || typeof companyName !== 'string') {
            throw new Error('Company name must be a valid string');
        }

        const operationId = `load-problems-${companyName}`;
        
        // Prevent duplicate loading operations
        if (this.loadingOperations.has(operationId)) {
            console.log(`Problems loading for ${companyName} already in progress, waiting...`);
            while (this.loadingOperations.has(operationId)) {
                await this.delay(100);
            }
        }

        // Check cache first
        if (this.problemsCache.has(companyName)) {
            const cachedProblems = this.problemsCache.get(companyName);
            console.log(`Returning ${cachedProblems.length} cached problems for ${companyName}`);
            return cachedProblems;
        }

        this.loadingOperations.add(operationId);

        try {
            // Use performance manager if available
            if (this.performanceManager) {
                return await this.performanceManager.executeWithRetry(
                    operationId,
                    async () => {
                        return await this.loadCompanyProblemsInternal(companyName);
                    },
                    {
                        maxRetries: this.retryAttempts,
                        baseDelay: this.retryDelay,
                        showLoading: false, // Handled by caller
                        showError: false,   // Handled by caller
                        allowManualRetry: true
                    }
                );
            } else {
                // Fallback without performance manager
                return await this.loadCompanyProblemsInternal(companyName);
            }
        } finally {
            this.loadingOperations.delete(operationId);
        }
    }
    
    /**
     * Internal method to load company problems
     */
    async loadCompanyProblemsInternal(companyName) {
        const csvFiles = await this.getCompanyCSVFiles(companyName);
        const allProblems = [];
        const errors = [];

        // Load CSV files with better error handling
        for (const csvFile of csvFiles) {
            try {
                const problems = await this.loadCSVFile(csvFile);
                allProblems.push(...problems);
                console.log(`Loaded ${problems.length} problems from ${csvFile}`);
            } catch (error) {
                errors.push(`Failed to load ${csvFile}: ${error.message}`);
                // Continue with other files instead of failing completely
            }
        }

        // Log errors but continue if we have some data
        if (errors.length > 0) {
            console.warn(`CSV loading errors for ${companyName}:\n${errors.join('\n')}`);
        }
        
        if (allProblems.length === 0) {
            throw new Error(`No problems could be loaded for ${companyName}. ${errors.length > 0 ? 'Errors: ' + errors.join('; ') : ''}`);
        }

        // Remove duplicates based on problem ID
        const uniqueProblems = this.removeDuplicateProblems(allProblems);

        // Cache the results
        this.problemsCache.set(companyName, uniqueProblems);

        console.log(`Loaded ${uniqueProblems.length} unique problems for ${companyName} (${errors.length} file errors)`);
        return uniqueProblems;
    }

    /**
     * Get list of CSV files for a company
     */
    async getCompanyCSVFiles(companyName) {
        // Try common CSV file patterns based on the actual file structure
        const commonFiles = [
            `company-wise-problems/${companyName}/1. Thirty Days.csv`,
            `company-wise-problems/${companyName}/2. Three Months.csv`,
            `company-wise-problems/${companyName}/3. Six Months.csv`,
            `company-wise-problems/${companyName}/4. More Than Six Months.csv`,
            `company-wise-problems/${companyName}/5. All.csv`
        ];

        const existingFiles = [];

        for (const file of commonFiles) {
            try {
                const response = await fetch(file, { method: 'HEAD' });
                if (response.ok) {
                    existingFiles.push(file);
                }
            } catch (error) {
                // File doesn't exist, continue
            }
        }

        if (existingFiles.length === 0) {
            throw new Error(`No CSV files found for company: ${companyName}`);
        }

        return existingFiles;
    }

    /**
     * Load and parse a single CSV file
     */
    async loadCSVFile(filePath) {
        try {
            const response = await this.fetchWithRetry(filePath);
            const csvContent = await response.text();
            return this.parseCSV(csvContent);
        } catch (error) {
            throw new Error(`Failed to load CSV file ${filePath}: ${error.message}`);
        }
    }

    /**
     * Parse CSV content into Problem objects
     */
    parseCSV(csvContent) {
        if (!csvContent || typeof csvContent !== 'string') {
            throw new Error('CSV content must be a valid string');
        }

        const lines = csvContent.trim().split('\n');

        if (lines.length < 2) {
            throw new Error('CSV file must contain at least a header and one data row');
        }

        const header = this.parseCSVLine(lines[0]);
        const problems = [];
        const errors = [];

        // Validate required columns
        const requiredColumns = ['Difficulty', 'Title', 'Link'];
        const missingColumns = requiredColumns.filter(col => !header.includes(col));

        if (missingColumns.length > 0) {
            throw new Error(`CSV missing required columns: ${missingColumns.join(', ')}`);
        }

        // Parse data rows
        for (let i = 1; i < lines.length; i++) {
            try {
                const values = this.parseCSVLine(lines[i]);

                if (values.length !== header.length) {
                    errors.push(`Row ${i + 1}: Column count mismatch`);
                    continue;
                }

                const problemData = {};
                header.forEach((column, index) => {
                    const normalizedColumn = column.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
                    problemData[normalizedColumn] = values[index];
                });

                // Map CSV columns to Problem constructor format
                const mappedData = {
                    title: problemData.title,
                    difficulty: problemData.difficulty,
                    link: problemData.link,
                    topics: problemData.topics || '',
                    frequency: problemData.frequency || 0,
                    acceptanceRate: problemData.acceptancerate || 0
                };

                const problem = new Problem(mappedData);
                problems.push(problem);
            } catch (error) {
                errors.push(`Row ${i + 1}: ${error.message}`);
            }
        }

        // Log parsing errors but don't fail completely
        if (errors.length > 0) {
            console.warn(`CSV parsing errors:\n${errors.join('\n')}`);
        }

        if (problems.length === 0) {
            throw new Error('No valid problems found in CSV file');
        }

        return problems;
    }

    /**
     * Parse a single CSV line handling quoted values
     */
    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }

        result.push(current.trim());
        return result;
    }

    /**
     * Remove duplicate problems based on ID
     */
    removeDuplicateProblems(problems) {
        const seen = new Set();
        return problems.filter(problem => {
            if (seen.has(problem.id)) {
                return false;
            }
            seen.add(problem.id);
            return true;
        });
    }

    /**
     * Fetch with retry logic for network failures
     * Enhanced with better error classification and timeout handling
     */
    async fetchWithRetry(url, options = {}) {
        let lastError;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), options.timeout || 10000); // 10 second timeout

        const fetchOptions = {
            ...options,
            signal: controller.signal
        };

        for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
            try {
                const response = await fetch(url, fetchOptions);

                if (!response.ok) {
                    // Classify HTTP errors
                    if (response.status >= 500) {
                        throw new Error(`Server error ${response.status}: ${response.statusText}`);
                    } else if (response.status === 404) {
                        throw new Error(`File not found: ${url}`);
                    } else if (response.status === 403) {
                        throw new Error(`Access denied: ${url}`);
                    } else {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }
                }

                clearTimeout(timeoutId);
                return response;
            } catch (error) {
                lastError = error;

                // Don't retry on certain errors
                if (error.name === 'AbortError') {
                    clearTimeout(timeoutId);
                    throw new Error(`Request timeout for ${url}`);
                }
                
                if (error.message.includes('404') || error.message.includes('Access denied')) {
                    clearTimeout(timeoutId);
                    throw error; // Don't retry on 404 or 403
                }

                if (attempt < this.retryAttempts) {
                    const delay = this.retryDelay * Math.pow(2, attempt - 1);
                    console.warn(`Fetch attempt ${attempt} failed for ${url}, retrying in ${delay}ms...`, error.message);
                    await this.delay(delay);
                } else {
                    console.error(`All ${this.retryAttempts} fetch attempts failed for ${url}`, error);
                }
            }
        }

        clearTimeout(timeoutId);
        throw lastError;
    }

    /**
     * Utility function for delays
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Clear all caches
     */
    clearCache() {
        this.companiesCache.clear();
        this.problemsCache.clear();
    }

    /**
     * Get cached company data
     */
    getCachedCompany(companyName) {
        return this.companiesCache.get(companyName);
    }

    /**
     * Get cached problems for a company
     */
    getCachedProblems(companyName) {
        return this.problemsCache.get(companyName);
    }
}

// Export classes for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DataManager, Company, Problem };
}