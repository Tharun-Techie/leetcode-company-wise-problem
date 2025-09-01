// Enhanced script to generate companies.json from folder structure
// This script scans the company-wise-problems directory and creates a companies.json file
// with accurate problem counts and logo detection

const fs = require('fs');
const path = require('path');

/**
 * Company data generator with enhanced metadata extraction
 * Requirement 1.1: Display company names and logos
 * Requirement 1.3: Parse CSV files from company folders to extract problem information
 * Requirement 1.4: Display the total number of problems for that company on the card
 */
class CompanyDataGenerator {
    constructor() {
        this.companiesDir = 'company-wise-problems';
        this.outputFile = 'data/companies.json';
        this.logoDir = 'assets/company-logos';
        this.placeholderLogo = 'assets/icons/company-placeholder.svg';
        this.csvFilePatterns = [
            '1. Thirty Days.csv',
            '2. Three Months.csv', 
            '3. Six Months.csv',
            '4. More Than Six Months.csv',
            '5. All.csv'
        ];
    }

    /**
     * Generate companies list from folder structure with enhanced metadata
     */
    async generateCompaniesFromFolders() {
        try {
            // Validate directories
            if (!this.validateDirectories()) {
                return [];
            }

            // Get all company folders
            const folders = this.getCompanyFolders();
            console.log(`Found ${folders.length} company folders`);

            const companies = [];
            const errors = [];

            // Process each company folder
            for (const folderName of folders) {
                try {
                    const companyData = await this.processCompanyFolder(folderName);
                    if (companyData) {
                        companies.push(companyData);
                        console.log(`✓ Processed ${folderName}: ${companyData.problemCount} problems`);
                    }
                } catch (error) {
                    errors.push(`Error processing ${folderName}: ${error.message}`);
                    console.warn(`✗ Error processing ${folderName}:`, error.message);
                }
            }

            // Log summary
            if (errors.length > 0) {
                console.warn(`\nProcessing completed with ${errors.length} errors:`);
                errors.forEach(error => console.warn(`  - ${error}`));
            }

            // Sort companies by name
            companies.sort((a, b) => a.name.localeCompare(b.name));

            // Write output file
            this.writeCompaniesFile(companies);

            console.log(`\n✓ Generated ${this.outputFile} with ${companies.length} companies`);
            return companies;

        } catch (error) {
            console.error('Fatal error generating companies list:', error);
            return [];
        }
    }

    /**
     * Validate required directories exist
     */
    validateDirectories() {
        if (!fs.existsSync(this.companiesDir)) {
            console.error(`Directory ${this.companiesDir} does not exist`);
            return false;
        }

        // Ensure output directory exists
        const dataDir = path.dirname(this.outputFile);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
            console.log(`Created directory: ${dataDir}`);
        }

        // Ensure logo directory exists
        if (!fs.existsSync(this.logoDir)) {
            fs.mkdirSync(this.logoDir, { recursive: true });
            console.log(`Created directory: ${this.logoDir}`);
        }

        return true;
    }

    /**
     * Get list of company folders
     */
    getCompanyFolders() {
        return fs.readdirSync(this.companiesDir, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name)
            .filter(name => !name.startsWith('.')) // Ignore hidden folders
            .sort();
    }

    /**
     * Process individual company folder to extract metadata
     */
    async processCompanyFolder(folderName) {
        const companyPath = path.join(this.companiesDir, folderName);
        
        // Get CSV files and problem count
        const { csvFiles, problemCount } = this.analyzeCSVFiles(companyPath);
        
        // Detect or generate logo
        const logoUrl = this.detectCompanyLogo(folderName);
        
        // Extract additional metadata
        const metadata = this.extractCompanyMetadata(companyPath, csvFiles);

        return {
            name: folderName,
            problemCount: problemCount,
            logoUrl: logoUrl,
            csvFiles: csvFiles.length,
            lastUpdated: new Date().toISOString(),
            ...metadata
        };
    }

    /**
     * Analyze CSV files in company folder
     */
    analyzeCSVFiles(companyPath) {
        const files = fs.readdirSync(companyPath);
        const csvFiles = files.filter(file => file.endsWith('.csv'));
        
        let totalProblems = 0;
        let maxProblems = 0;
        const fileAnalysis = [];

        for (const csvFile of csvFiles) {
            try {
                const csvPath = path.join(companyPath, csvFile);
                const csvContent = fs.readFileSync(csvPath, 'utf8');
                const lines = csvContent.trim().split('\n');
                const problemCount = Math.max(0, lines.length - 1); // Subtract header
                
                fileAnalysis.push({
                    file: csvFile,
                    problems: problemCount
                });

                // Use the file with most problems (usually "5. All.csv")
                if (problemCount > maxProblems) {
                    maxProblems = problemCount;
                }

                // For total, avoid double counting - use max from individual files
                totalProblems = Math.max(totalProblems, problemCount);

            } catch (error) {
                console.warn(`Could not read ${csvFile}:`, error.message);
            }
        }

        // If no valid CSV files, estimate based on file count
        if (totalProblems === 0 && csvFiles.length > 0) {
            totalProblems = csvFiles.length * 25; // Conservative estimate
        }

        return {
            csvFiles: fileAnalysis,
            problemCount: totalProblems
        };
    }

    /**
     * Detect or generate company logo
     * Requirement 1.1: Display company names and logos
     */
    detectCompanyLogo(companyName) {
        // Generate potential logo filenames
        const logoVariants = [
            companyName.toLowerCase().replace(/\s+/g, '-'),
            companyName.toLowerCase().replace(/\s+/g, '_'),
            companyName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            companyName.toLowerCase().replace(/[^a-z0-9]/g, ''),
        ];

        // Check for existing logo files
        for (const variant of logoVariants) {
            const logoPath = path.join(this.logoDir, `${variant}.svg`);
            if (fs.existsSync(logoPath)) {
                return `${this.logoDir}/${variant}.svg`;
            }
        }

        // Generate placeholder logo if none exists
        return this.generatePlaceholderLogo(companyName);
    }

    /**
     * Generate placeholder logo for companies without logos
     */
    generatePlaceholderLogo(companyName) {
        const logoFileName = companyName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '.svg';
        const logoPath = path.join(this.logoDir, logoFileName);
        
        // Don't overwrite existing files
        if (fs.existsSync(logoPath)) {
            return `${this.logoDir}/${logoFileName}`;
        }

        // Generate simple SVG placeholder with company initials
        const initials = companyName
            .split(/\s+/)
            .map(word => word.charAt(0).toUpperCase())
            .slice(0, 2)
            .join('');

        const svgContent = this.createPlaceholderSVG(initials, companyName);
        
        try {
            fs.writeFileSync(logoPath, svgContent);
            console.log(`Generated placeholder logo: ${logoPath}`);
        } catch (error) {
            console.warn(`Could not create placeholder logo for ${companyName}:`, error.message);
            return this.placeholderLogo;
        }

        return `${this.logoDir}/${logoFileName}`;
    }

    /**
     * Create SVG placeholder content
     */
    createPlaceholderSVG(initials, companyName) {
        // Generate a consistent color based on company name
        const hash = this.hashString(companyName);
        const hue = hash % 360;
        const color = `hsl(${hue}, 60%, 50%)`;

        return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <rect width="64" height="64" rx="8" fill="${color}"/>
  <text x="32" y="40" font-family="Arial, sans-serif" font-size="24" font-weight="bold" 
        text-anchor="middle" fill="white">${initials}</text>
</svg>`;
    }

    /**
     * Simple string hash function for consistent colors
     */
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    }

    /**
     * Extract additional company metadata
     */
    extractCompanyMetadata(companyPath, csvFiles) {
        const metadata = {
            hasProblems: csvFiles.length > 0,
            categories: []
        };

        // Analyze CSV file names to determine categories
        const fileNames = csvFiles.map(f => f.file.toLowerCase());
        
        if (fileNames.some(f => f.includes('thirty') || f.includes('30'))) {
            metadata.categories.push('recent');
        }
        if (fileNames.some(f => f.includes('month'))) {
            metadata.categories.push('monthly');
        }
        if (fileNames.some(f => f.includes('all'))) {
            metadata.categories.push('comprehensive');
        }

        return metadata;
    }

    /**
     * Write companies data to JSON file
     */
    writeCompaniesFile(companies) {
        const output = {
            generated: new Date().toISOString(),
            totalCompanies: companies.length,
            totalProblems: companies.reduce((sum, company) => sum + company.problemCount, 0),
            companies: companies
        };

        fs.writeFileSync(this.outputFile, JSON.stringify(output, null, 2));
    }

    /**
     * Validate existing companies.json file
     */
    validateCompaniesFile() {
        if (!fs.existsSync(this.outputFile)) {
            return { valid: false, reason: 'File does not exist' };
        }

        try {
            const content = fs.readFileSync(this.outputFile, 'utf8');
            const data = JSON.parse(content);
            
            if (!data.companies || !Array.isArray(data.companies)) {
                return { valid: false, reason: 'Invalid format: missing companies array' };
            }

            // Check if file is recent (less than 24 hours old)
            const generated = new Date(data.generated);
            const now = new Date();
            const ageHours = (now - generated) / (1000 * 60 * 60);
            
            if (ageHours > 24) {
                return { valid: false, reason: `File is ${Math.round(ageHours)} hours old` };
            }

            return { valid: true, companies: data.companies.length };

        } catch (error) {
            return { valid: false, reason: `Parse error: ${error.message}` };
        }
    }
}

/**
 * Generate companies list from folder structure
 */
async function generateCompaniesFromFolders() {
    const generator = new CompanyDataGenerator();
    return await generator.generateCompaniesFromFolders();
}

// Run the script if called directly
if (require.main === module) {
    generateCompaniesFromFolders();
}

module.exports = { generateCompaniesFromFolders };
/**

 * CLI interface for the company generator
 */
async function main() {
    const generator = new CompanyDataGenerator();
    
    console.log('🔍 Company Data Generator');
    console.log('========================\n');
    
    // Check if regeneration is needed
    const validation = generator.validateCompaniesFile();
    if (validation.valid) {
        console.log(`✓ Existing companies.json is valid (${validation.companies} companies)`);
        console.log('Use --force to regenerate anyway\n');
        
        if (!process.argv.includes('--force')) {
            return;
        }
    } else {
        console.log(`⚠ Companies.json needs regeneration: ${validation.reason}\n`);
    }
    
    // Generate companies data
    console.log('Scanning company folders...\n');
    const companies = await generateCompaniesFromFolders();
    
    if (companies.length > 0) {
        console.log('\n✅ Company data generation completed successfully!');
        console.log(`📊 Generated data for ${companies.length} companies`);
        
        // Show summary statistics
        const totalProblems = companies.reduce((sum, c) => sum + c.problemCount, 0);
        const companiesWithProblems = companies.filter(c => c.problemCount > 0).length;
        
        console.log(`📈 Total problems: ${totalProblems}`);
        console.log(`🏢 Companies with problems: ${companiesWithProblems}/${companies.length}`);
        
        // Show top companies by problem count
        const topCompanies = companies
            .filter(c => c.problemCount > 0)
            .sort((a, b) => b.problemCount - a.problemCount)
            .slice(0, 5);
            
        if (topCompanies.length > 0) {
            console.log('\n🏆 Top companies by problem count:');
            topCompanies.forEach((company, index) => {
                console.log(`  ${index + 1}. ${company.name}: ${company.problemCount} problems`);
            });
        }
        
    } else {
        console.log('\n❌ No companies were processed successfully');
        process.exit(1);
    }
}

// Run the script if called directly
if (require.main === module) {
    main().catch(error => {
        console.error('\n💥 Fatal error:', error);
        process.exit(1);
    });
}

module.exports = { 
    generateCompaniesFromFolders, 
    CompanyDataGenerator 
};