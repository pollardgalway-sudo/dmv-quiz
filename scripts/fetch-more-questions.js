/**
 * Script to fetch more questions from tk.jiazhoujiazhao.com API
 * Uses direct API calls to collect all available questions
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'tk.jiazhoujiazhao.com';
const OUTPUT_PATH = path.join(__dirname, '..', 'data', 'questions-new-batch.json');

// Make HTTPS request
function fetchAPI(apiPath) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: BASE_URL,
            path: apiPath,
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json',
                'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    resolve({ error: 'Parse error', raw: data.substring(0, 500) });
                }
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        req.end();
    });
}

async function fetchAllQuestions() {
    console.log('=== 开始抓取题目 ===\n');

    const allQuestions = new Map();

    // Try different API endpoints and parameters
    const endpoints = [
        // Text questions with pagination
        '/api/questions?type=text&limit=100&offset=0',
        '/api/questions?type=text&limit=100&offset=100',
        '/api/questions?type=text&limit=100&offset=200',
        '/api/questions?type=text&limit=100&offset=300',
        '/api/questions?type=text&limit=100&offset=400',

        // Sign questions
        '/api/questions?type=sign&limit=100&offset=0',
        '/api/questions?type=sign&limit=100&offset=100',

        // All questions
        '/api/questions?limit=500&offset=0',
        '/api/questions?limit=500&offset=500',

        // Category-based
        '/api/questions?category=通用&limit=100',
        '/api/questions?category=general&limit=100',
        '/api/questions?category=signs&limit=100',
        '/api/questions?category=交通标志&limit=100',

        // State-specific
        '/api/questions?state=CA&limit=200',

        // Difficulty based
        '/api/questions?difficulty=easy&limit=100',
        '/api/questions?difficulty=medium&limit=100',
        '/api/questions?difficulty=hard&limit=100',

        // Must-know questions
        '/api/questions?isMustKnow=true&limit=200',

        // High frequency questions
        '/api/questions?frequency=high&limit=200',
    ];

    for (const endpoint of endpoints) {
        try {
            console.log(`尝试: ${endpoint}`);
            const data = await fetchAPI(endpoint);

            if (data.questions && Array.isArray(data.questions)) {
                console.log(`  ✓ 获取到 ${data.questions.length} 道题目, isPremium: ${data.isPremium}`);

                data.questions.forEach(q => {
                    const id = q._id || q.id;
                    if (id && !allQuestions.has(id)) {
                        allQuestions.set(id, q);
                    }
                });
            } else if (data.error) {
                console.log(`  ✗ 错误: ${data.error}`);
            } else {
                console.log(`  - 无题目数据`);
            }

            // Small delay between requests
            await new Promise(r => setTimeout(r, 300));

        } catch (e) {
            console.log(`  ✗ 请求失败: ${e.message}`);
        }
    }

    console.log(`\n=== 结果 ===`);
    console.log(`总共收集到 ${allQuestions.size} 道不重复题目`);

    // Save to file
    const output = {
        totalQuestions: allQuestions.size,
        scrapedAt: new Date().toISOString(),
        questions: Array.from(allQuestions.values())
    };

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), 'utf8');
    console.log(`\n已保存到: ${OUTPUT_PATH}`);

    // Show sample question
    if (allQuestions.size > 0) {
        const sample = Array.from(allQuestions.values())[0];
        console.log('\n示例题目:');
        console.log(`  问题: ${sample.question?.substring(0, 50)}...`);
        console.log(`  类别: ${sample.category}`);
    }
}

fetchAllQuestions().catch(console.error);
