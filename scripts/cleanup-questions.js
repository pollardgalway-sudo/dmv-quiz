/**
 * Script to process and clean up the scraped questions,
 * removing duplicates and converting to our app's format
 */

const fs = require('fs');
const path = require('path');

// Load the scraped data
const rawData = require('../data/questions-scraped-all.json');

// Deduplicate by originalId
const uniqueMap = new Map();
rawData.forEach(q => {
    if (!uniqueMap.has(q.originalId)) {
        uniqueMap.set(q.originalId, q);
    }
});

const uniqueQuestions = Array.from(uniqueMap.values());
console.log(`Total questions: ${rawData.length}`);
console.log(`Unique questions: ${uniqueQuestions.length}`);

// Re-index the questions
const cleanedQuestions = uniqueQuestions.map((q, index) => ({
    ...q,
    id: index + 1
}));

// Save the cleaned data
const outputPath = path.join(__dirname, '..', 'data', 'questions-jiazhoujiazhao.json');
fs.writeFileSync(outputPath, JSON.stringify(cleanedQuestions, null, 2), 'utf8');
console.log(`\nSaved ${cleanedQuestions.length} unique questions to: ${outputPath}`);

// Show categories
const categories = {};
cleanedQuestions.forEach(q => {
    const cat = q.category || '通用';
    categories[cat] = (categories[cat] || 0) + 1;
});

console.log('\nQuestions by category:');
Object.entries(categories).forEach(([cat, count]) => {
    console.log(`  ${cat}: ${count} questions`);
});

// Show sample question
console.log('\n\nSample question format:');
console.log(JSON.stringify(cleanedQuestions[0], null, 2));
