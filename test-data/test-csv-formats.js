/**
 * Test CSV Data Generator
 * Creates various CSV formats to test parsing robustness
 */

class TestCSVGenerator {
    static generateStandardCSV() {
        return `DIFFICULTY,TITLE,FREQUENCY,ACCEPTANCE RATE,LINK,TOPICS
EASY,"Two Sum",95.7,0.557,"https://leetcode.com/problems/two-sum","Array, Hash Table"
MEDIUM,"Add Two Numbers",85.2,0.423,"https://leetcode.com/problems/add-two-numbers","Linked List, Math"
HARD,"Median of Two Sorted Arrays",45.3,0.387,"https://leetcode.com/problems/median-of-two-sorted-arrays","Array, Binary Search, Divide and Conquer"
EASY,"Palindrome Number",78.9,0.542,"https://leetcode.com/problems/palindrome-number","Math"
MEDIUM,"Container With Most Water",65.4,0.534,"https://leetcode.com/problems/container-with-most-water","Array, Two Pointers"`;
    }

    static generateMalformedCSV() {
        return `DIFFICULTY,TITLE,FREQUENCY,ACCEPTANCE RATE,LINK,TOPICS
EASY,"Two Sum",95.7,0.557,"https://leetcode.com/problems/two-sum","Array, Hash Table"
MEDIUM,"Incomplete Row",85.2
HARD,"Extra Columns",45.3,0.387,"https://leetcode.com/problems/test","Array",extra,columns,here
,"Missing Difficulty",78.9,0.542,"https://leetcode.com/problems/test2","Math"
INVALID_DIFFICULTY,"Invalid Difficulty",65.4,0.534,"https://leetcode.com/problems/test3","Array"`;
    }

    static generateEmptyCSV() {
        return '';
    }

    static generateHeaderOnlyCSV() {
        return 'DIFFICULTY,TITLE,FREQUENCY,ACCEPTANCE RATE,LINK,TOPICS';
    }

    static generateSpecialCharactersCSV() {
        return `DIFFICULTY,TITLE,FREQUENCY,ACCEPTANCE RATE,LINK,TOPICS
EASY,"Problem with ""quotes""",95.7,0.557,"https://leetcode.com/problems/test1","Array, Hash Table"
MEDIUM,"Problem with, comma in title",85.2,0.423,"https://leetcode.com/problems/test2","Linked List, Math"
HARD,"Problem with 'single quotes'",45.3,0.387,"https://leetcode.com/problems/test3","String, Parsing"
EASY,"Problem with newline\nin title",78.9,0.542,"https://leetcode.com/problems/test4","String"
MEDIUM,"Problem with unicode: 中文",65.4,0.534,"https://leetcode.com/problems/test5","String, Unicode"`;
    }

    static generateLargeCSV(numRows = 1000) {
        let csv = 'DIFFICULTY,TITLE,FREQUENCY,ACCEPTANCE RATE,LINK,TOPICS\n';
        const difficulties = ['EASY', 'MEDIUM', 'HARD'];
        const topics = [
            'Array', 'String', 'Hash Table', 'Dynamic Programming', 'Math',
            'Sorting', 'Greedy', 'Depth-First Search', 'Binary Search', 'Tree',
            'Breadth-First Search', 'Two Pointers', 'Stack', 'Heap', 'Graph'
        ];

        for (let i = 0; i < numRows; i++) {
            const difficulty = difficulties[i % 3];
            const title = `Problem ${i + 1}`;
            const frequency = (Math.random() * 100).toFixed(1);
            const acceptanceRate = Math.random().toFixed(3);
            const link = `https://leetcode.com/problems/problem-${i + 1}`;
            const problemTopics = topics.slice(0, Math.floor(Math.random() * 3) + 1).join(', ');
            
            csv += `${difficulty},"${title}",${frequency},${acceptanceRate},"${link}","${problemTopics}"\n`;
        }

        return csv;
    }

    static generateInconsistentFormatCSV() {
        return `DIFFICULTY,TITLE,FREQUENCY,ACCEPTANCE RATE,LINK,TOPICS
EASY,Two Sum,95.7,0.557,https://leetcode.com/problems/two-sum,Array Hash Table
MEDIUM,"Add Two Numbers",85.2,0.423,"https://leetcode.com/problems/add-two-numbers","Linked List, Math"
HARD,Median of Two Sorted Arrays,45.3,0.387,https://leetcode.com/problems/median-of-two-sorted-arrays,"Array, Binary Search"
EASY,"Palindrome Number",78.9,0.542,https://leetcode.com/problems/palindrome-number,Math
MEDIUM,Container With Most Water,65.4,0.534,https://leetcode.com/problems/container-with-most-water,Array Two Pointers`;
    }

    static generateMissingColumnsCSV() {
        return `DIFFICULTY,TITLE,FREQUENCY,ACCEPTANCE RATE,LINK,TOPICS
EASY,"Two Sum",95.7,0.557,"https://leetcode.com/problems/two-sum","Array, Hash Table"
MEDIUM,"Add Two Numbers",85.2,,"https://leetcode.com/problems/add-two-numbers","Linked List, Math"
HARD,"Median of Two Sorted Arrays",,0.387,"https://leetcode.com/problems/median-of-two-sorted-arrays","Array, Binary Search"
EASY,"Palindrome Number",78.9,0.542,,"Math"
MEDIUM,"Container With Most Water",65.4,0.534,"https://leetcode.com/problems/container-with-most-water",`;
    }

    static generateDifferentDelimiterCSV() {
        return `DIFFICULTY;TITLE;FREQUENCY;ACCEPTANCE RATE;LINK;TOPICS
EASY;"Two Sum";95.7;0.557;"https://leetcode.com/problems/two-sum";"Array, Hash Table"
MEDIUM;"Add Two Numbers";85.2;0.423;"https://leetcode.com/problems/add-two-numbers";"Linked List, Math"
HARD;"Median of Two Sorted Arrays";45.3;0.387;"https://leetcode.com/problems/median-of-two-sorted-arrays";"Array, Binary Search"`;
    }

    static generateTabDelimitedCSV() {
        return `DIFFICULTY\tTITLE\tFREQUENCY\tACCEPTANCE RATE\tLINK\tTOPICS
EASY\t"Two Sum"\t95.7\t0.557\t"https://leetcode.com/problems/two-sum"\t"Array, Hash Table"
MEDIUM\t"Add Two Numbers"\t85.2\t0.423\t"https://leetcode.com/problems/add-two-numbers"\t"Linked List, Math"
HARD\t"Median of Two Sorted Arrays"\t45.3\t0.387\t"https://leetcode.com/problems/median-of-two-sorted-arrays"\t"Array, Binary Search"`;
    }

    static generateExtraWhitespaceCSV() {
        return `  DIFFICULTY  ,  TITLE  ,  FREQUENCY  ,  ACCEPTANCE RATE  ,  LINK  ,  TOPICS  
  EASY  ,  "Two Sum"  ,  95.7  ,  0.557  ,  "https://leetcode.com/problems/two-sum"  ,  "Array, Hash Table"  
  MEDIUM  ,  "Add Two Numbers"  ,  85.2  ,  0.423  ,  "https://leetcode.com/problems/add-two-numbers"  ,  "Linked List, Math"  
  HARD  ,  "Median of Two Sorted Arrays"  ,  45.3  ,  0.387  ,  "https://leetcode.com/problems/median-of-two-sorted-arrays"  ,  "Array, Binary Search"  `;
    }

    static generateBOMCSV() {
        // CSV with Byte Order Mark (BOM)
        return '\uFEFF' + this.generateStandardCSV();
    }

    static generateWindowsLineEndingsCSV() {
        return this.generateStandardCSV().replace(/\n/g, '\r\n');
    }

    static generateMacLineEndingsCSV() {
        return this.generateStandardCSV().replace(/\n/g, '\r');
    }

    static generateMixedLineEndingsCSV() {
        const lines = this.generateStandardCSV().split('\n');
        return lines.map((line, index) => {
            if (index % 3 === 0) return line + '\r\n';
            if (index % 3 === 1) return line + '\r';
            return line + '\n';
        }).join('');
    }

    static getAllTestFormats() {
        return {
            standard: this.generateStandardCSV(),
            malformed: this.generateMalformedCSV(),
            empty: this.generateEmptyCSV(),
            headerOnly: this.generateHeaderOnlyCSV(),
            specialCharacters: this.generateSpecialCharactersCSV(),
            large: this.generateLargeCSV(100), // Smaller for testing
            inconsistentFormat: this.generateInconsistentFormatCSV(),
            missingColumns: this.generateMissingColumnsCSV(),
            differentDelimiter: this.generateDifferentDelimiterCSV(),
            tabDelimited: this.generateTabDelimitedCSV(),
            extraWhitespace: this.generateExtraWhitespaceCSV(),
            bom: this.generateBOMCSV(),
            windowsLineEndings: this.generateWindowsLineEndingsCSV(),
            macLineEndings: this.generateMacLineEndingsCSV(),
            mixedLineEndings: this.generateMixedLineEndingsCSV()
        };
    }

    static runCSVParsingTests(parseFunction) {
        const testFormats = this.getAllTestFormats();
        const results = {};

        console.log('🧪 Running CSV Parsing Tests...');

        for (const [formatName, csvData] of Object.entries(testFormats)) {
            try {
                console.log(`  Testing: ${formatName}`);
                const startTime = performance.now();
                const parsed = parseFunction(csvData);
                const endTime = performance.now();
                const duration = endTime - startTime;

                results[formatName] = {
                    success: true,
                    rowCount: parsed ? parsed.length : 0,
                    duration: duration,
                    error: null
                };

                console.log(`    ✅ Success: ${results[formatName].rowCount} rows in ${duration.toFixed(2)}ms`);
            } catch (error) {
                results[formatName] = {
                    success: false,
                    rowCount: 0,
                    duration: 0,
                    error: error.message
                };

                console.log(`    ❌ Failed: ${error.message}`);
            }
        }

        // Generate summary
        const totalTests = Object.keys(results).length;
        const successfulTests = Object.values(results).filter(r => r.success).length;
        const successRate = Math.round((successfulTests / totalTests) * 100);

        console.log('\n📊 CSV Parsing Test Summary');
        console.log('=' .repeat(40));
        console.log(`Total Tests: ${totalTests}`);
        console.log(`Successful: ${successfulTests}`);
        console.log(`Failed: ${totalTests - successfulTests}`);
        console.log(`Success Rate: ${successRate}%`);
        console.log('=' .repeat(40));

        return results;
    }
}

// Export for use in other contexts
if (typeof window !== 'undefined') {
    window.TestCSVGenerator = TestCSVGenerator;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = TestCSVGenerator;
}