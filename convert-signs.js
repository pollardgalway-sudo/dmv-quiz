const fs = require('fs');

// Read the source file
const sourceData = JSON.parse(fs.readFileSync('C:\\Users\\Administrator\\Desktop\\driving-test-quiz\\data\\batch_02_chapter9_signs.json', 'utf8'));

// Transform to the expected format with images
const transformedData = sourceData.map((q, index) => {
    return {
        id: index + 5001, // Start from 5001 to avoid conflicts
        category: "Traffic Signs",
        question: {
            en: q.question.en,
            "zh-Hans": q.question.zh,
            "zh-Hant": q.question.zh
        },
        options: {
            A: {
                en: q.options[0]?.text?.en || "",
                "zh-Hans": q.options[0]?.text?.zh || "",
                "zh-Hant": q.options[0]?.text?.zh || ""
            },
            B: {
                en: q.options[1]?.text?.en || "",
                "zh-Hans": q.options[1]?.text?.zh || "",
                "zh-Hant": q.options[1]?.text?.zh || ""
            },
            C: {
                en: q.options[2]?.text?.en || "",
                "zh-Hans": q.options[2]?.text?.zh || "",
                "zh-Hant": q.options[2]?.text?.zh || ""
            }
        },
        answer: q.correctOptionId,
        explanation: {
            en: q.explanation.en,
            "zh-Hans": q.explanation.zh,
            "zh-Hant": q.explanation.zh
        },
        // Include image if available
        hasImage: q.hasImage || false,
        imageUrl: q.imageUrl || null,
        dmv_ref: {
            page: "2-19",
            section: q.sourceRef || "Traffic Signs",
            "analysis_zh-Hans": q.explanation.zh,
            "analysis_zh-Hant": q.explanation.zh
        }
    };
});

// Write to public/data/questions-signs.json
fs.writeFileSync('public/data/questions-signs.json', JSON.stringify(transformedData, null, 2), 'utf8');

console.log(`Converted ${transformedData.length} questions successfully!`);
console.log(`Questions with images: ${transformedData.filter(q => q.hasImage).length}`);
