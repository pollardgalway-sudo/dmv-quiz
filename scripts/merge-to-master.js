const fs = require('fs');
const path = require('path');

/**
 * Merges root data/questions-all.json (the updated/corrected ones) 
 * into data/questions-final-master.json (the master source).
 * It uses normalized English question text for matching and replacement.
 */
function mergeToMaster() {
    const masterPath = path.join(__dirname, '../data/questions-final-master.json');
    const rootPath = path.join(__dirname, '../data/questions-all.json');
    const outputPath = masterPath; // Overwrite master

    if (!fs.existsSync(masterPath) || !fs.existsSync(rootPath)) {
        console.error('Master or Root file missing.');
        return;
    }

    const masterQuestions = JSON.parse(fs.readFileSync(masterPath, 'utf8'));
    const rootQuestions = JSON.parse(fs.readFileSync(rootPath, 'utf8'));

    console.log(`Loading master: ${masterQuestions.length} questions`);
    console.log(`Loading root updates: ${rootQuestions.length} questions`);

    const normalize = (text) => text ? text.toLowerCase().trim().replace(/[^a-z0-9]/g, '') : '';

    // Create a map of master questions for quick lookup
    // Since master has mixed formats, we need to extract the English text carefully
    const masterMap = new Map();
    masterQuestions.forEach((q, index) => {
        let enText = '';
        if (q.question && q.question.en) {
            enText = q.question.en;
        } else if (q.questionText) {
            enText = q.questionText;
        }
        
        if (enText) {
            const key = normalize(enText);
            masterMap.set(key, index);
        }
    });

    let replaced = 0;
    let added = 0;

    rootQuestions.forEach(q => {
        const enText = q.question && q.question.en ? q.question.en : '';
        if (!enText) return;

        const key = normalize(enText);
        if (masterMap.has(key)) {
            const index = masterMap.get(key);
            // Replace with the root version (since it's the corrected one)
            masterQuestions[index] = q;
            replaced++;
        } else {
            // New question, add it
            masterQuestions.push(q);
            added++;
            // Update map so we don't add duplicates from root itself if they exist
            masterMap.set(key, masterQuestions.length - 1);
        }
    });

    fs.writeFileSync(outputPath, JSON.stringify(masterQuestions, null, 2), 'utf8');

    console.log(`Sync Complete!`);
    console.log(`- Replaced: ${replaced}`);
    console.log(`- Added: ${added}`);
    console.log(`- Final Master Count: ${masterQuestions.length}`);
}

mergeToMaster();
