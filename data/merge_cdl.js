const fs = require('fs');
const path = require('path');

const files = [
    'cdl-general-knowledge.json',
    'cdl-air-brakes.json',
    'cdl-combination.json'
];

const output = 'questions-cdl-all.json';
let allQuestions = [];

files.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        allQuestions = allQuestions.concat(content);
    } else {
        console.error(`File not found: ${file}`);
    }
});

fs.writeFileSync(path.join(__dirname, output), JSON.stringify(allQuestions, null, 2));
console.log(`Merged ${allQuestions.length} questions into ${output}`);
