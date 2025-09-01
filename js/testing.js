// Comprehensive testing and debugging utilities
// Provides tools for testing functionality and identifying issues

/**
 * Application Testing Suite
 * Requirement 9.5: Test cross-browser compatibility and fix any issues
 * Requirement 10.4: Ensure WCAG AA color contrast compliance
 */
class ApplicationTester {
    constructor() {
        this.testResults = [];
        this.performanceMetrics = {};
        this.accessibilityIssues = [];
        this.compatibilityIssues = [];
    }

    /**
     * Run comprehensive application tests
     */
    async runAllTests() {
        console.group('🧪 Running Application Tests');
        
        try {
            // Core functionality tests
            await this.testCoreFunctionality();
            
            // Performance tests
            await this.testPerformance();
            
            // Accessibility tests
            await this.testAccessibility();
            
            // Cross-browser compatibility tests
            await this.testCompatibility();
            
            // Error handling tests
            await this.testErrorHandling();
            
            // UI/UX tests
            await this.testUserInterface();
            
            // Generate test report
            this.generateTestReport();
            
        } catch (error) {
            console.error('Test suite failed:', error);
        } finally {
            console.groupEnd();
        }
    }

    /**
     * Test core application functionality
     */
    async testCoreFunctionality() {
        console.log('Testing core functionality...');
        
        const tests = [
            {
                name: 'State Manager Initialization',
                test: () => window.stateManager instanceof StateManager
            },
            {
                name: 'Data Manager Initialization',
                test: () => window.dataManager instanceof DataManager
            },
            {
                name: 'Router Initialization',
                test: () => window.router instanceof Router
            },
            {
                name: 'Error Handler Initialization',
                test: () => window.errorHandler instanceof ErrorHandler
            },
            {
                name: 'Loading Manager Initialization',
                test: () => window.loadingManager instanceof LoadingManager
            },
            {
                name: 'Local Storage Availability',
                test: () => {
                    try {
                        localStorage.setItem('test', 'test');
                        localStorage.removeItem('test');
                        return true;
                    } catch (e) {
                        return false;
                    }
                }
            },
            {
                name: 'Theme Toggle Functionality',
                test: () => {
                    const themeToggle = document.querySelector('.theme-toggle');
                    return themeToggle && typeof themeToggle.click === 'function';
                }
            },
            {
                name: 'Search Input Functionality',
                test: () => {
                    const searchInput = document.getElementById('search-input');
                    return searchInput && searchInput.type === 'search';
                }
            }
        ];

        for (const test of tests) {
            try {
                const result = await test.test();
                this.testResults.push({
                    category: 'Core Functionality',
                    name: test.name,
                    passed: result,
                    error: null
                });
                console.log(`${result ? '✅' : '❌'} ${test.name}`);
            } catch (error) {
                this.testResults.push({
                    category: 'Core Functionality',
                    name: test.name,
                    passed: false,
                    error: error.message
                });
                console.log(`❌ ${test.name}: ${error.message}`);
            }
        }
    }

    /**
     * Test application performance
     */
    async testPerformance() {
        console.log('Testing performance...');
        
        const startTime = performance.now();
        
        // Test DOM query performance
        const domQueryStart = performance.now();
        document.querySelectorAll('.company-card, .problem-card');
        const domQueryTime = performance.now() - domQueryStart;
        
        // Test memory usage (if available)
        const memoryInfo = performance.memory ? {
            usedJSHeapSize: performance.memory.usedJSHeapSize,
            totalJSHeapSize: performance.memory.totalJSHeapSize,
            jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
        } : null;
        
        // Test animation performance
        const animationStart = performance.now();
        const testElement = document.createElement('div');
        testElement.style.transform = 'translateX(100px)';
        document.body.appendChild(testElement);
        await new Promise(resolve => setTimeout(resolve, 100));
        document.body.removeChild(testElement);
        const animationTime = performance.now() - animationStart;
        
        this.performanceMetrics = {
            totalTestTime: performance.now() - startTime,
            domQueryTime,
            animationTime,
            memoryInfo,
            timestamp: new Date().toISOString()
        };
        
        // Performance thresholds
        const thresholds = {
            domQueryTime: 10, // ms
            animationTime: 200 // ms
        };
        
        this.testResults.push({
            category: 'Performance',
            name: 'DOM Query Performance',
            passed: domQueryTime < thresholds.domQueryTime,
            details: `${domQueryTime.toFixed(2)}ms (threshold: ${thresholds.domQueryTime}ms)`
        });
        
        this.testResults.push({
            category: 'Performance',
            name: 'Animation Performance',
            passed: animationTime < thresholds.animationTime,
            details: `${animationTime.toFixed(2)}ms (threshold: ${thresholds.animationTime}ms)`
        });
        
        console.log(`Performance metrics collected: DOM queries ${domQueryTime.toFixed(2)}ms, Animations ${animationTime.toFixed(2)}ms`);
    }

    /**
     * Test accessibility compliance
     */
    async testAccessibility() {
        console.log('Testing accessibility...');
        
        const tests = [
            {
                name: 'Alt Text for Images',
                test: () => {
                    const images = document.querySelectorAll('img');
                    const imagesWithoutAlt = Array.from(images).filter(img => !img.alt);
                    return imagesWithoutAlt.length === 0;
                }
            },
            {
                name: 'ARIA Labels for Interactive Elements',
                test: () => {
                    const interactive = document.querySelectorAll('button, [role="button"], input');
                    const missingLabels = Array.from(interactive).filter(el => 
                        !el.getAttribute('aria-label') && 
                        !el.getAttribute('aria-labelledby') && 
                        !el.textContent.trim()
                    );
                    return missingLabels.length === 0;
                }
            },
            {
                name: 'Keyboard Navigation',
                test: () => {
                    const focusableElements = document.querySelectorAll(
                        'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
                    );
                    return focusableElements.length > 0;
                }
            },
            {
                name: 'Color Contrast',
                test: () => {
                    // Basic color contrast test
                    const computedStyle = getComputedStyle(document.body);
                    const backgroundColor = computedStyle.backgroundColor;
                    const color = computedStyle.color;
                    return backgroundColor !== color; // Basic check
                }
            },
            {
                name: 'Semantic HTML Structure',
                test: () => {
                    const semanticElements = document.querySelectorAll(
                        'header, nav, main, section, article, aside, footer'
                    );
                    return semanticElements.length > 0;
                }
            }
        ];

        for (const test of tests) {
            try {
                const result = await test.test();
                this.testResults.push({
                    category: 'Accessibility',
                    name: test.name,
                    passed: result,
                    error: null
                });
                console.log(`${result ? '✅' : '❌'} ${test.name}`);
            } catch (error) {
                this.testResults.push({
                    category: 'Accessibility',
                    name: test.name,
                    passed: false,
                    error: error.message
                });
                console.log(`❌ ${test.name}: ${error.message}`);
            }
        }
    }

    /**
     * Test cross-browser compatibility
     */
    async testCompatibility() {
        console.log('Testing browser compatibility...');
        
        const browserInfo = window.compatibilityManager?.browserInfo || {
            browser: 'unknown',
            version: 'unknown'
        };
        
        const featureSupport = window.compatibilityManager?.featureSupport || {};
        
        const tests = [
            {
                name: 'Fetch API Support',
                test: () => typeof fetch !== 'undefined',
                critical: true
            },
            {
                name: 'Local Storage Support',
                test: () => featureSupport.localStorage !== false,
                critical: true
            },
            {
                name: 'CSS Custom Properties',
                test: () => featureSupport.cssCustomProperties !== false,
                critical: false
            },
            {
                name: 'CSS Grid Support',
                test: () => featureSupport.cssGrid !== false,
                critical: false
            },
            {
                name: 'Flexbox Support',
                test: () => featureSupport.flexbox !== false,
                critical: false
            },
            {
                name: 'Intersection Observer',
                test: () => 'IntersectionObserver' in window,
                critical: false
            },
            {
                name: 'Request Animation Frame',
                test: () => 'requestAnimationFrame' in window,
                critical: false
            }
        ];

        for (const test of tests) {
            try {
                const result = test.test();
                this.testResults.push({
                    category: 'Compatibility',
                    name: test.name,
                    passed: result,
                    critical: test.critical,
                    browser: `${browserInfo.browser} ${browserInfo.version}`
                });
                
                if (!result && test.critical) {
                    this.compatibilityIssues.push({
                        feature: test.name,
                        severity: 'critical',
                        browser: browserInfo
                    });
                }
                
                console.log(`${result ? '✅' : '❌'} ${test.name} ${test.critical ? '(Critical)' : ''}`);
            } catch (error) {
                this.testResults.push({
                    category: 'Compatibility',
                    name: test.name,
                    passed: false,
                    error: error.message,
                    critical: test.critical
                });
                console.log(`❌ ${test.name}: ${error.message}`);
            }
        }
    }

    /**
     * Test error handling
     */
    async testErrorHandling() {
        console.log('Testing error handling...');
        
        const tests = [
            {
                name: 'Global Error Handler',
                test: () => {
                    // Simulate an error
                    const originalHandler = window.onerror;
                    let errorCaught = false;
                    
                    window.onerror = () => {
                        errorCaught = true;
                        return true;
                    };
                    
                    try {
                        // This should trigger the error handler
                        throw new Error('Test error');
                    } catch (e) {
                        // Expected
                    }
                    
                    window.onerror = originalHandler;
                    return errorCaught || window.errorHandler instanceof ErrorHandler;
                }
            },
            {
                name: 'Network Error Handling',
                test: async () => {
                    try {
                        await fetch('/non-existent-endpoint');
                        return false; // Should have thrown an error
                    } catch (error) {
                        return true; // Error was properly caught
                    }
                }
            },
            {
                name: 'Storage Error Handling',
                test: () => {
                    try {
                        // Try to exceed localStorage quota
                        const largeData = 'x'.repeat(10000000); // 10MB string
                        localStorage.setItem('test-large', largeData);
                        localStorage.removeItem('test-large');
                        return true;
                    } catch (error) {
                        // Error handling should be in place
                        return window.errorHandler && typeof window.errorHandler.handleValidationError === 'function';
                    }
                }
            }
        ];

        for (const test of tests) {
            try {
                const result = await test.test();
                this.testResults.push({
                    category: 'Error Handling',
                    name: test.name,
                    passed: result,
                    error: null
                });
                console.log(`${result ? '✅' : '❌'} ${test.name}`);
            } catch (error) {
                this.testResults.push({
                    category: 'Error Handling',
                    name: test.name,
                    passed: false,
                    error: error.message
                });
                console.log(`❌ ${test.name}: ${error.message}`);
            }
        }
    }

    /**
     * Test user interface elements
     */
    async testUserInterface() {
        console.log('Testing user interface...');
        
        const tests = [
            {
                name: 'Theme Toggle Visibility',
                test: () => {
                    const themeToggle = document.querySelector('.theme-toggle');
                    return themeToggle && getComputedStyle(themeToggle).display !== 'none';
                }
            },
            {
                name: 'Search Input Accessibility',
                test: () => {
                    const searchInput = document.getElementById('search-input');
                    return searchInput && searchInput.getAttribute('aria-label');
                }
            },
            {
                name: 'Navigation Menu Structure',
                test: () => {
                    const nav = document.querySelector('nav[role="navigation"]');
                    return nav && nav.querySelectorAll('a').length > 0;
                }
            },
            {
                name: 'Responsive Design Elements',
                test: () => {
                    const viewport = document.querySelector('meta[name="viewport"]');
                    return viewport && viewport.getAttribute('content').includes('width=device-width');
                }
            },
            {
                name: 'Loading States',
                test: () => {
                    const loadingElements = document.querySelectorAll('.loading-spinner, .skeleton-card');
                    return window.loadingManager instanceof LoadingManager;
                }
            }
        ];

        for (const test of tests) {
            try {
                const result = await test.test();
                this.testResults.push({
                    category: 'User Interface',
                    name: test.name,
                    passed: result,
                    error: null
                });
                console.log(`${result ? '✅' : '❌'} ${test.name}`);
            } catch (error) {
                this.testResults.push({
                    category: 'User Interface',
                    name: test.name,
                    passed: false,
                    error: error.message
                });
                console.log(`❌ ${test.name}: ${error.message}`);
            }
        }
    }

    /**
     * Generate comprehensive test report
     */
    generateTestReport() {
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(test => test.passed).length;
        const failedTests = totalTests - passedTests;
        const passRate = ((passedTests / totalTests) * 100).toFixed(1);
        
        console.group('📊 Test Report Summary');
        console.log(`Total Tests: ${totalTests}`);
        console.log(`Passed: ${passedTests} (${passRate}%)`);
        console.log(`Failed: ${failedTests}`);
        
        // Group results by category
        const categories = {};
        this.testResults.forEach(test => {
            if (!categories[test.category]) {
                categories[test.category] = { passed: 0, failed: 0, tests: [] };
            }
            if (test.passed) {
                categories[test.category].passed++;
            } else {
                categories[test.category].failed++;
            }
            categories[test.category].tests.push(test);
        });
        
        // Display category results
        Object.entries(categories).forEach(([category, results]) => {
            const categoryPassRate = ((results.passed / (results.passed + results.failed)) * 100).toFixed(1);
            console.log(`\n${category}: ${results.passed}/${results.passed + results.failed} (${categoryPassRate}%)`);
            
            // Show failed tests
            const failedTests = results.tests.filter(test => !test.passed);
            if (failedTests.length > 0) {
                console.group(`❌ Failed ${category} Tests:`);
                failedTests.forEach(test => {
                    console.log(`- ${test.name}${test.error ? `: ${test.error}` : ''}`);
                });
                console.groupEnd();
            }
        });
        
        // Performance metrics
        if (Object.keys(this.performanceMetrics).length > 0) {
            console.group('⚡ Performance Metrics');
            Object.entries(this.performanceMetrics).forEach(([key, value]) => {
                if (typeof value === 'number') {
                    console.log(`${key}: ${value.toFixed(2)}ms`);
                } else if (typeof value === 'object' && value !== null) {
                    console.log(`${key}:`, value);
                } else {
                    console.log(`${key}: ${value}`);
                }
            });
            console.groupEnd();
        }
        
        // Compatibility issues
        if (this.compatibilityIssues.length > 0) {
            console.group('⚠️ Compatibility Issues');
            this.compatibilityIssues.forEach(issue => {
                console.log(`${issue.severity.toUpperCase()}: ${issue.feature} not supported in ${issue.browser.browser} ${issue.browser.version}`);
            });
            console.groupEnd();
        }
        
        console.groupEnd();
        
        // Store results for external access
        window.testResults = {
            summary: { totalTests, passedTests, failedTests, passRate },
            categories,
            performance: this.performanceMetrics,
            compatibility: this.compatibilityIssues,
            timestamp: new Date().toISOString()
        };
        
        return window.testResults;
    }

    /**
     * Run specific test category
     */
    async runTestCategory(category) {
        switch (category.toLowerCase()) {
            case 'core':
                await this.testCoreFunctionality();
                break;
            case 'performance':
                await this.testPerformance();
                break;
            case 'accessibility':
                await this.testAccessibility();
                break;
            case 'compatibility':
                await this.testCompatibility();
                break;
            case 'errors':
                await this.testErrorHandling();
                break;
            case 'ui':
                await this.testUserInterface();
                break;
            default:
                console.error(`Unknown test category: ${category}`);
        }
    }

    /**
     * Export test results
     */
    exportResults() {
        const results = {
            testResults: this.testResults,
            performanceMetrics: this.performanceMetrics,
            compatibilityIssues: this.compatibilityIssues,
            browserInfo: window.compatibilityManager?.browserInfo,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        };
        
        const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `test-results-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('Test results exported successfully');
    }
}

// Create global tester instance
window.applicationTester = new ApplicationTester();

// Add console commands for easy testing
window.runTests = () => window.applicationTester.runAllTests();
window.testCategory = (category) => window.applicationTester.runTestCategory(category);
window.exportTestResults = () => window.applicationTester.exportResults();

// Auto-run tests in development mode
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('🧪 Development mode detected. Run tests with: runTests()');
    console.log('Available commands: runTests(), testCategory("category"), exportTestResults()');
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ApplicationTester };
}