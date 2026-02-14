/**
 * Script to fetch all questions from tk.jiazhoujiazhao.com API
 * and convert them to the format used by our DMV exam app
 */

const fs = require('fs');
const path = require('path');

const API_BASE = 'https://tk.jiazhoujiazhao.com/api/questions';
const PAGE_SIZE = 100; // Request more per page for efficiency
const TOTAL_QUESTIONS = 752;

async function fetchAllQuestions() {
    console.log('Starting to fetch questions from tk.jiazhoujiazhao.com...');

    const allQuestions = [];
    let offset = 0;

    while (offset < TOTAL_QUESTIONS) {
        const url = `${API_BASE}?limit=${PAGE_SIZE}&offset=${offset}`;
        console.log(`Fetching: offset=${offset}, limit=${PAGE_SIZE}`);

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (!data.questions || data.questions.length === 0) {
                console.log('No more questions found.');
                break;
            }

            allQuestions.push(...data.questions);
            console.log(`  Fetched ${data.questions.length} questions. Total: ${allQuestions.length}`);

            offset += PAGE_SIZE;

            // Small delay to be respectful to the server
            await new Promise(resolve => setTimeout(resolve, 500));

        } catch (error) {
            console.error(`Error fetching at offset ${offset}:`, error.message);
            break;
        }
    }

    console.log(`\nTotal questions fetched: ${allQuestions.length}`);
    return allQuestions;
}

function convertToAppFormat(questions) {
    console.log('\nConverting questions to app format...');

    return questions.map((q, index) => {
        // Map options from array to A, B, C format
        const optionLabels = ['A', 'B', 'C', 'D'];
        const options = {};
        const options_en = {};

        q.options.forEach((opt, i) => {
            if (i < optionLabels.length) {
                options[optionLabels[i]] = {
                    en: q.options_en?.[i] || opt,
                    'zh-Hans': opt,
                    'zh-Hant': opt // Using simplified as fallback
                };
            }
        });

        // Convert correctAnswer from index (0,1,2) to letter (A,B,C)
        const answerLetter = optionLabels[q.correctAnswer] || 'A';

        // Handle image path
        let imageUrl = null;
        if (q.image_path && q.image_path.trim() !== '') {
            imageUrl = `https://tk.jiazhoujiazhao.com/${q.image_path}`;
        }

        return {
            id: index + 1,
            originalId: q._id,
            category: q.category || '通用',
            question: {
                en: q.question_en || q.question,
                'zh-Hans': q.question,
                'zh-Hant': q.question // Using simplified as fallback
            },
            options: options,
            answer: answerLetter,
            explanation: {
                en: q.explanation_en || q.explanation,
                'zh-Hans': q.explanation,
                'zh-Hant': q.explanation
            },
            hasImage: !!imageUrl,
            imageUrl: imageUrl,
            dmv_ref: {
                page: '',
                section: q.category || '',
                'analysis_zh-Hans': q.explanation,
                'analysis_zh-Hant': q.explanation
            },
            difficulty: q.difficulty || 'medium',
            tags: q.tags || [],
            isMustKnow: q.isMustKnow || false
        };
    });
}

async function main() {
    try {
        // Fetch all questions
        const rawQuestions = await fetchAllQuestions();

        if (rawQuestions.length === 0) {
            console.error('No questions fetched. Exiting.');
            process.exit(1);
        }

        // Save raw data for reference
        const rawOutputPath = path.join(__dirname, '..', 'data', 'questions-raw-scraped.json');
        fs.writeFileSync(rawOutputPath, JSON.stringify(rawQuestions, null, 2), 'utf8');
        console.log(`\nRaw data saved to: ${rawOutputPath}`);

        // Convert to app format
        const convertedQuestions = convertToAppFormat(rawQuestions);

        // Save converted data
        const outputPath = path.join(__dirname, '..', 'data', 'questions-scraped-all.json');
        fs.writeFileSync(outputPath, JSON.stringify(convertedQuestions, null, 2), 'utf8');
        console.log(`Converted data saved to: ${outputPath}`);

        // Group by category and save separate files
        const categories = {};
        convertedQuestions.forEach(q => {
            const cat = q.category || '通用';
            if (!categories[cat]) {
                categories[cat] = [];
            }
            categories[cat].push(q);
        });

        console.log('\nQuestions by category:');
        Object.entries(categories).forEach(([cat, questions]) => {
            console.log(`  ${cat}: ${questions.length} questions`);
        });

        console.log('\n✅ Done! Questions are ready to be integrated into the app.');

    } catch (error) {
        console.error('Script failed:', error);
        process.exit(1);
    }
}

main();
