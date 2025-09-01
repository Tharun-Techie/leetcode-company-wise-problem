// Color Contrast Validation for WCAG AA Compliance
// Ensures all color combinations meet accessibility standards

/**
 * ColorContrastValidator class validates color contrast ratios
 * Requirement: Test and ensure WCAG AA color contrast compliance
 */
class ColorContrastValidator {
    constructor() {
        this.minContrastRatio = 4.5; // WCAG AA standard
        this.minContrastRatioLarge = 3.0; // WCAG AA for large text (18pt+ or 14pt+ bold)
        this.init();
    }

    /**
     * Initialize color contrast validation
     */
    init() {
        // Validate colors when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.validateAllColors();
            });
        } else {
            this.validateAllColors();
        }

        // Re-validate when theme changes
        document.addEventListener('themeChanged', () => {
            setTimeout(() => this.validateAllColors(), 100);
        });
    }

    /**
     * Validate all color combinations in the application
     */
    validateAllColors() {
        const results = {
            passed: [],
            failed: [],
            warnings: []
        };

        // Get current theme colors
        const colors = this.getCurrentThemeColors();
        
        // Test critical color combinations
        const combinations = [
            { name: 'Primary text on background', fg: colors.textPrimary, bg: colors.background },
            { name: 'Secondary text on background', fg: colors.textSecondary, bg: colors.background },
            { name: 'Primary text on surface', fg: colors.textPrimary, bg: colors.surface },
            { name: 'Secondary text on surface', fg: colors.textSecondary, bg: colors.surface },
            { name: 'Primary button text', fg: '#ffffff', bg: colors.primary },
            { name: 'Easy difficulty badge', fg: colors.easy, bg: colors.background },
            { name: 'Medium difficulty badge', fg: colors.medium, bg: colors.background },
            { name: 'Hard difficulty badge', fg: colors.hard, bg: colors.background },
            { name: 'Link text', fg: colors.primary, bg: colors.background },
            { name: 'Muted text on background', fg: colors.textMuted, bg: colors.background }
        ];

        combinations.forEach(combo => {
            const ratio = this.calculateContrastRatio(combo.fg, combo.bg);
            const passes = ratio >= this.minContrastRatio;
            
            const result = {
                name: combo.name,
                foreground: combo.fg,
                background: combo.bg,
                ratio: ratio,
                passes: passes,
                required: this.minContrastRatio
            };

            if (passes) {
                results.passed.push(result);
            } else {
                results.failed.push(result);
                console.warn(`❌ Color contrast failure: ${combo.name} - Ratio: ${ratio.toFixed(2)} (Required: ${this.minContrastRatio})`);
            }
        });

        // Log results
        console.log(`✅ Color contrast validation complete: ${results.passed.length} passed, ${results.failed.length} failed`);
        
        if (results.failed.length > 0) {
            console.warn('⚠️ Some color combinations do not meet WCAG AA standards');
            this.suggestColorImprovements(results.failed);
        }

        return results;
    }

    /**
     * Get current theme colors from CSS custom properties
     */
    getCurrentThemeColors() {
        const root = document.documentElement;
        const style = getComputedStyle(root);

        return {
            primary: style.getPropertyValue('--primary-color').trim(),
            background: style.getPropertyValue('--background-color').trim(),
            surface: style.getPropertyValue('--surface-color').trim(),
            textPrimary: style.getPropertyValue('--text-primary').trim(),
            textSecondary: style.getPropertyValue('--text-secondary').trim(),
            textMuted: style.getPropertyValue('--text-muted').trim(),
            easy: style.getPropertyValue('--easy-color').trim(),
            medium: style.getPropertyValue('--medium-color').trim(),
            hard: style.getPropertyValue('--hard-color').trim()
        };
    }

    /**
     * Calculate contrast ratio between two colors
     * Based on WCAG 2.1 guidelines
     */
    calculateContrastRatio(color1, color2) {
        const l1 = this.getRelativeLuminance(color1);
        const l2 = this.getRelativeLuminance(color2);
        
        const lighter = Math.max(l1, l2);
        const darker = Math.min(l1, l2);
        
        return (lighter + 0.05) / (darker + 0.05);
    }

    /**
     * Calculate relative luminance of a color
     */
    getRelativeLuminance(color) {
        const rgb = this.hexToRgb(color);
        if (!rgb) return 0;

        const rsRGB = rgb.r / 255;
        const gsRGB = rgb.g / 255;
        const bsRGB = rgb.b / 255;

        const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
        const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
        const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }

    /**
     * Convert hex color to RGB
     */
    hexToRgb(hex) {
        // Remove # if present
        hex = hex.replace('#', '');
        
        // Handle 3-digit hex
        if (hex.length === 3) {
            hex = hex.split('').map(char => char + char).join('');
        }
        
        const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    /**
     * Suggest color improvements for failed combinations
     */
    suggestColorImprovements(failedCombinations) {
        console.group('🎨 Color Improvement Suggestions');
        
        failedCombinations.forEach(combo => {
            const targetRatio = this.minContrastRatio;
            const currentRatio = combo.ratio;
            const improvement = targetRatio / currentRatio;
            
            console.log(`${combo.name}:`);
            console.log(`  Current ratio: ${currentRatio.toFixed(2)}`);
            console.log(`  Required ratio: ${targetRatio}`);
            console.log(`  Needs ${improvement.toFixed(2)}x improvement`);
            
            // Suggest specific improvements
            if (combo.name.includes('text')) {
                console.log(`  💡 Consider darkening text color or lightening background`);
            } else if (combo.name.includes('button')) {
                console.log(`  💡 Consider using a darker button color or white text`);
            } else if (combo.name.includes('badge')) {
                console.log(`  💡 Consider adding a background or border to the badge`);
            }
        });
        
        console.groupEnd();
    }

    /**
     * Test a specific color combination
     */
    testColorCombination(foreground, background, name = 'Custom') {
        const ratio = this.calculateContrastRatio(foreground, background);
        const passes = ratio >= this.minContrastRatio;
        
        return {
            name,
            foreground,
            background,
            ratio,
            passes,
            grade: this.getContrastGrade(ratio)
        };
    }

    /**
     * Get contrast grade (AAA, AA, or Fail)
     */
    getContrastGrade(ratio) {
        if (ratio >= 7.0) return 'AAA';
        if (ratio >= 4.5) return 'AA';
        if (ratio >= 3.0) return 'AA Large';
        return 'Fail';
    }

    /**
     * Generate accessible color palette
     */
    generateAccessiblePalette(baseColor) {
        const palette = {
            primary: baseColor,
            variants: []
        };

        // Generate lighter and darker variants that maintain contrast
        const steps = [-40, -20, 0, 20, 40, 60, 80];
        
        steps.forEach(step => {
            const variant = this.adjustColorLightness(baseColor, step);
            const contrastWithWhite = this.calculateContrastRatio(variant, '#ffffff');
            const contrastWithBlack = this.calculateContrastRatio(variant, '#000000');
            
            palette.variants.push({
                color: variant,
                lightness: step,
                contrastWithWhite: contrastWithWhite,
                contrastWithBlack: contrastWithBlack,
                accessibleOnWhite: contrastWithWhite >= 4.5,
                accessibleOnBlack: contrastWithBlack >= 4.5
            });
        });

        return palette;
    }

    /**
     * Adjust color lightness
     */
    adjustColorLightness(color, percent) {
        const rgb = this.hexToRgb(color);
        if (!rgb) return color;

        const factor = percent / 100;
        
        const r = Math.max(0, Math.min(255, rgb.r + (255 - rgb.r) * factor));
        const g = Math.max(0, Math.min(255, rgb.g + (255 - rgb.g) * factor));
        const b = Math.max(0, Math.min(255, rgb.b + (255 - rgb.b) * factor));

        return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
    }

    /**
     * Validate colors in real-time
     */
    validateElement(element) {
        const style = getComputedStyle(element);
        const color = style.color;
        const backgroundColor = style.backgroundColor;
        
        if (color && backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)') {
            const ratio = this.calculateContrastRatio(
                this.rgbToHex(color),
                this.rgbToHex(backgroundColor)
            );
            
            const passes = ratio >= this.minContrastRatio;
            
            if (!passes) {
                console.warn(`⚠️ Element has insufficient contrast: ${ratio.toFixed(2)}`, element);
                element.setAttribute('data-contrast-warning', 'true');
            } else {
                element.removeAttribute('data-contrast-warning');
            }
            
            return { ratio, passes };
        }
        
        return null;
    }

    /**
     * Convert RGB string to hex
     */
    rgbToHex(rgb) {
        const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (!match) return rgb;
        
        const r = parseInt(match[1]);
        const g = parseInt(match[2]);
        const b = parseInt(match[3]);
        
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    /**
     * Get validation report
     */
    getValidationReport() {
        return this.validateAllColors();
    }

    /**
     * Enable real-time validation
     */
    enableRealTimeValidation() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            this.validateElement(node);
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ColorContrastValidator };
}