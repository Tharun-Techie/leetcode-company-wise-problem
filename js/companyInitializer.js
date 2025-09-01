// Company data initialization and detection system
// Handles automatic company data loading, caching, and initialization sequence
// Requirement 1.1: Display company names and logos
// Requirement 1.3: Parse CSV files from company folders to extract problem information  
// Requirement 1.4: Display the total number of problems for that company on the card

/**
 * Company initialization manager
 * Handles the complete initialization sequence for company data
 */
class CompanyInitializer {
    constructor() {
        this.dataManager = null;
        this.performanceManager = null;
        this.initialized = false;
        this.initializationPromise = null;
        this.companiesCache = new Map();
        this.logoCache = new Map();
        this.initializationCallbacks = [];
        
        // Configuration
        this.config = {
            companiesDataUrl: 'data/companies.json',
            logoDirectory: 'assets/company-logos',
            placeholderLogo: 'assets/icons/company-placeholder.svg',
            cacheTimeout: 24 * 60 * 60 * 1000, // 24 hours
            retryAttempts: 3,
            retryDelay: 1000
        };
    }

    /**
     * Initialize the company system
     * This is the main entry point for company data initialization
     */
    async initialize(dataManager, performanceManager = null) {
        // Prevent multiple simultaneous initializations
        if (this.initializationPromise) {
            return this.initializationPromise;
        }

        this.initializationPromise = this.performInitialization(dataManager, performanceManager);
        return this.initializationPromise;
    }

    /**
     * Perform the actual initialization sequence
     */
    async performInitialization(dataManager, performanceManager) {
        try {
            console.log('🚀 Starting company data initialization...');
            
            this.dataManager = dataManager;
            this.performanceManager = performanceManager;

            // Step 1: Load and validate companies data
            const companies = await this.loadCompaniesData();
            
            // Step 2: Initialize logo detection and caching
            await this.initializeLogoSystem(companies);
            
            // Step 3: Cache company data for quick access
            this.cacheCompanyData(companies);
            
            // Step 4: Validate data integrity
            this.validateCompanyData(companies);
            
            // Step 5: Set up automatic refresh mechanism
            this.setupAutoRefresh();
            
            this.initialized = true;
            console.log(`✅ Company initialization completed successfully! Loaded ${companies.length} companies`);
            
            // Notify callbacks
            this.notifyInitializationComplete(companies);
            
            return companies;
            
        } catch (error) {
            console.error('❌ Company initialization failed:', error);
            this.initialized = false;
            this.initializationPromise = null;
            throw error;
        }
    }

    /**
     * Load companies data with enhanced error handling and validation
     */
    async loadCompaniesData() {
        const operationId = 'load-companies-data';
        
        try {
            // Use performance manager if available
            if (this.performanceManager) {
                return await this.performanceManager.executeWithRetry(
                    operationId,
                    async () => {
                        return await this.fetchCompaniesData();
                    },
                    {
                        maxRetries: this.config.retryAttempts,
                        baseDelay: this.config.retryDelay,
                        showLoading: false,
                        showError: false,
                        allowManualRetry: true
                    }
                );
            } else {
                return await this.fetchCompaniesData();
            }
        } catch (error) {
            // Fallback to generating data if fetch fails
            console.warn('Failed to load companies data, attempting to generate...', error.message);
            return await this.generateFallbackData();
        }
    }

    /**
     * Fetch companies data from the JSON file
     */
    async fetchCompaniesData() {
        const response = await fetch(this.config.companiesDataUrl);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch companies data: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Handle both old and new format
        const companies = data.companies || data;
        
        if (!Array.isArray(companies)) {
            throw new Error('Companies data must be an array');
        }
        
        if (companies.length === 0) {
            throw new Error('No companies found in data file');
        }
        
        console.log(`📊 Loaded ${companies.length} companies from ${this.config.companiesDataUrl}`);
        return companies;
    }

    /**
     * Generate fallback company data by detecting folders
     */
    async generateFallbackData() {
        console.log('🔄 Generating fallback company data...');
        
        try {
            // Try to detect companies from folder structure
            const companies = await this.detectCompaniesFromFolders();
            
            if (companies.length > 0) {
                console.log(`✓ Generated fallback data for ${companies.length} companies`);
                return companies;
            }
        } catch (error) {
            console.warn('Folder detection failed:', error.message);
        }
        
        // Last resort: return minimal hardcoded data for major companies
        return this.getMinimalCompanyData();
    }

    /**
     * Detect companies by attempting to fetch known company folders
     */
    async detectCompaniesFromFolders() {
        // List of major companies to check for
        const knownCompanies = [
            'Google', 'Amazon', 'Microsoft', 'Meta', 'Apple', 'Netflix', 'Tesla',
            'Goldman Sachs', 'Bloomberg', 'LinkedIn', 'Uber', 'Airbnb', 'Spotify'
        ];
        
        const detectedCompanies = [];
        
        for (const companyName of knownCompanies) {
            try {
                // Try to fetch a common CSV file to verify company exists
                const testUrl = `company-wise-problems/${companyName}/5. All.csv`;
                const response = await fetch(testUrl, { method: 'HEAD' });
                
                if (response.ok) {
                    detectedCompanies.push({
                        name: companyName,
                        problemCount: 0, // Will be loaded on-demand
                        logoUrl: this.generateLogoUrl(companyName),
                        detected: true
                    });
                }
            } catch (error) {
                // Company folder doesn't exist, continue
            }
        }
        
        return detectedCompanies;
    }

    /**
     * Get minimal hardcoded company data as last resort
     */
    getMinimalCompanyData() {
        console.warn('⚠️ Using minimal hardcoded company data');
        
        return [
            { name: 'Google', problemCount: 0, logoUrl: this.generateLogoUrl('Google') },
            { name: 'Amazon', problemCount: 0, logoUrl: this.generateLogoUrl('Amazon') },
            { name: 'Microsoft', problemCount: 0, logoUrl: this.generateLogoUrl('Microsoft') },
            { name: 'Meta', problemCount: 0, logoUrl: this.generateLogoUrl('Meta') },
            { name: 'Apple', problemCount: 0, logoUrl: this.generateLogoUrl('Apple') }
        ];
    }

    /**
     * Initialize logo system with detection and placeholder generation
     */
    async initializeLogoSystem(companies) {
        console.log('🎨 Initializing logo system...');
        
        const logoPromises = companies.map(async (company) => {
            try {
                const logoUrl = await this.detectAndValidateLogo(company);
                this.logoCache.set(company.name, logoUrl);
                return logoUrl;
            } catch (error) {
                console.warn(`Logo detection failed for ${company.name}:`, error.message);
                const fallbackUrl = this.generatePlaceholderLogoUrl(company.name);
                this.logoCache.set(company.name, fallbackUrl);
                return fallbackUrl;
            }
        });
        
        await Promise.allSettled(logoPromises);
        console.log(`✓ Logo system initialized for ${companies.length} companies`);
    }

    /**
     * Detect and validate company logo
     */
    async detectAndValidateLogo(company) {
        // If company already has a logo URL, validate it
        if (company.logoUrl) {
            const isValid = await this.validateLogoUrl(company.logoUrl);
            if (isValid) {
                return company.logoUrl;
            }
        }
        
        // Try to detect logo file
        const detectedUrl = await this.detectLogoFile(company.name);
        if (detectedUrl) {
            return detectedUrl;
        }
        
        // Generate placeholder
        return this.generatePlaceholderLogoUrl(company.name);
    }

    /**
     * Validate that a logo URL is accessible
     */
    async validateLogoUrl(logoUrl) {
        try {
            const response = await fetch(logoUrl, { method: 'HEAD' });
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    /**
     * Detect logo file for a company
     */
    async detectLogoFile(companyName) {
        const logoVariants = this.generateLogoVariants(companyName);
        
        for (const variant of logoVariants) {
            try {
                const logoUrl = `${this.config.logoDirectory}/${variant}.svg`;
                const isValid = await this.validateLogoUrl(logoUrl);
                if (isValid) {
                    return logoUrl;
                }
            } catch (error) {
                // Continue to next variant
            }
        }
        
        return null;
    }

    /**
     * Generate possible logo filename variants
     */
    generateLogoVariants(companyName) {
        return [
            companyName.toLowerCase().replace(/\s+/g, '-'),
            companyName.toLowerCase().replace(/\s+/g, '_'),
            companyName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            companyName.toLowerCase().replace(/[^a-z0-9]/g, ''),
            companyName.toLowerCase()
        ];
    }

    /**
     * Generate logo URL for a company
     */
    generateLogoUrl(companyName) {
        const variant = companyName.toLowerCase().replace(/\s+/g, '-');
        return `${this.config.logoDirectory}/${variant}.svg`;
    }

    /**
     * Generate placeholder logo URL
     */
    generatePlaceholderLogoUrl(companyName) {
        // For now, return the generic placeholder
        // In a real implementation, this could generate a data URL with company initials
        return this.config.placeholderLogo;
    }

    /**
     * Cache company data for quick access
     */
    cacheCompanyData(companies) {
        console.log('💾 Caching company data...');
        
        this.companiesCache.clear();
        
        companies.forEach(company => {
            // Enhance company data with cached logo
            const enhancedCompany = {
                ...company,
                logoUrl: this.logoCache.get(company.name) || company.logoUrl,
                cached: true,
                cacheTime: Date.now()
            };
            
            this.companiesCache.set(company.name, enhancedCompany);
        });
        
        console.log(`✓ Cached ${companies.length} companies`);
    }

    /**
     * Validate company data integrity
     */
    validateCompanyData(companies) {
        console.log('🔍 Validating company data...');
        
        const issues = [];
        
        companies.forEach(company => {
            if (!company.name || typeof company.name !== 'string') {
                issues.push(`Invalid company name: ${company.name}`);
            }
            
            if (typeof company.problemCount !== 'number' || company.problemCount < 0) {
                issues.push(`Invalid problem count for ${company.name}: ${company.problemCount}`);
            }
            
            if (!company.logoUrl) {
                issues.push(`Missing logo URL for ${company.name}`);
            }
        });
        
        if (issues.length > 0) {
            console.warn(`⚠️ Data validation issues found:\n${issues.join('\n')}`);
        } else {
            console.log('✓ Company data validation passed');
        }
        
        return issues;
    }

    /**
     * Set up automatic refresh mechanism
     */
    setupAutoRefresh() {
        // Check for updates every hour
        setInterval(() => {
            this.checkForUpdates();
        }, 60 * 60 * 1000);
        
        console.log('🔄 Auto-refresh mechanism enabled');
    }

    /**
     * Check for data updates
     */
    async checkForUpdates() {
        try {
            // Simple check: compare file modification time or version
            const response = await fetch(this.config.companiesDataUrl, { method: 'HEAD' });
            const lastModified = response.headers.get('Last-Modified');
            
            if (lastModified) {
                const fileTime = new Date(lastModified).getTime();
                const cacheTime = this.getCacheTime();
                
                if (fileTime > cacheTime) {
                    console.log('📥 Company data update detected, refreshing...');
                    await this.refresh();
                }
            }
        } catch (error) {
            console.warn('Update check failed:', error.message);
        }
    }

    /**
     * Get cache timestamp
     */
    getCacheTime() {
        const companies = Array.from(this.companiesCache.values());
        return companies.length > 0 ? companies[0].cacheTime : 0;
    }

    /**
     * Refresh company data
     */
    async refresh() {
        console.log('🔄 Refreshing company data...');
        
        this.initialized = false;
        this.initializationPromise = null;
        this.companiesCache.clear();
        this.logoCache.clear();
        
        return await this.initialize(this.dataManager, this.performanceManager);
    }

    /**
     * Get cached companies
     */
    getCachedCompanies() {
        return Array.from(this.companiesCache.values());
    }

    /**
     * Get specific company from cache
     */
    getCachedCompany(companyName) {
        return this.companiesCache.get(companyName);
    }

    /**
     * Get company logo URL
     */
    getCompanyLogo(companyName) {
        return this.logoCache.get(companyName) || this.config.placeholderLogo;
    }

    /**
     * Check if system is initialized
     */
    isInitialized() {
        return this.initialized;
    }

    /**
     * Add initialization callback
     */
    onInitialized(callback) {
        if (this.initialized) {
            callback(this.getCachedCompanies());
        } else {
            this.initializationCallbacks.push(callback);
        }
    }

    /**
     * Notify initialization complete
     */
    notifyInitializationComplete(companies) {
        this.initializationCallbacks.forEach(callback => {
            try {
                callback(companies);
            } catch (error) {
                console.error('Initialization callback error:', error);
            }
        });
        
        this.initializationCallbacks = [];
    }

    /**
     * Get initialization statistics
     */
    getStats() {
        return {
            initialized: this.initialized,
            companiesCount: this.companiesCache.size,
            logosCount: this.logoCache.size,
            cacheTime: this.getCacheTime(),
            config: this.config
        };
    }

    /**
     * Clean up resources
     */
    cleanup() {
        this.companiesCache.clear();
        this.logoCache.clear();
        this.initializationCallbacks = [];
        this.initialized = false;
        this.initializationPromise = null;
    }
}

/**
 * Global company initializer instance
 */
window.companyInitializer = new CompanyInitializer();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CompanyInitializer };
}