/**
 * 使用现有浏览器配置抓取题目（保留激活状态）
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://tk.jiazhoujiazhao.com';
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');
const OUTPUT_PATH = path.join(__dirname, '..', 'data', 'questions-scraped-new.json');

// 使用 Chrome 默认用户数据目录以保留登录状态
const USER_DATA_DIR = 'C:\\Users\\Administrator\\AppData\\Local\\Google\\Chrome\\User Data';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function scrapeWithSession() {
    console.log('=== 使用已激活的会话抓取题目 ===\n');

    const chromePath = 'C:\\Users\\Administrator\\AppData\\Local\\Google\\Chrome\\Bin\\chrome.exe';

    const browser = await puppeteer.launch({
        executablePath: chromePath,
        headless: false,
        defaultViewport: { width: 1400, height: 900 },
        userDataDir: USER_DATA_DIR,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-gpu',
            '--profile-directory=Default'
        ]
    });

    const page = await browser.newPage();
    const allQuestions = new Map();
    let isPremiumActive = false;

    // 监听 API 响应
    page.on('response', async (response) => {
        const url = response.url();
        if (url.includes('/api/questions')) {
            try {
                const data = await response.json();
                console.log(`API: 题目数=${data.questions?.length}, 会员=${data.isPremium}`);

                if (data.isPremium) {
                    isPremiumActive = true;
                    console.log('✅ 已检测到会员状态！');
                }

                if (data.questions) {
                    data.questions.forEach(q => {
                        const id = q._id || q.id;
                        if (id && !allQuestions.has(id)) {
                            allQuestions.set(id, q);
                        }
                    });
                    console.log(`  累计: ${allQuestions.size} 道不重复题目`);
                }
            } catch (e) { }
        }
    });

    try {
        console.log('1. 打开网站...');
        await page.goto(SITE_URL, { waitUntil: 'networkidle2', timeout: 60000 });
        await delay(3000);

        // 检查是否已激活
        const memberStatus = await page.evaluate(() => {
            const text = document.body.innerText;
            if (text.includes('会员') && (text.includes('有效期') || text.includes('剩余'))) {
                return 'active';
            }
            return 'unknown';
        });
        console.log('页面会员状态:', memberStatus);

        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'session-01-home.png') });

        console.log('\n2. 通过API批量抓取...');

        // 尝试不同的API端点
        const endpoints = [
            '/api/questions?type=text&limit=200&offset=0',
            '/api/questions?type=sign&limit=200&offset=0',
            '/api/questions?type=general&limit=200&offset=0',
            '/api/questions?limit=500&offset=0',
            '/api/questions?category=通用&limit=200&offset=0',
            '/api/questions?category=交通标志&limit=200&offset=0',
        ];

        for (const endpoint of endpoints) {
            try {
                console.log(`  尝试: ${endpoint}`);
                const response = await page.goto(`${SITE_URL}${endpoint}`, {
                    waitUntil: 'networkidle0',
                    timeout: 15000
                });
                await delay(1000);
            } catch (e) {
                console.log(`    跳过`);
            }
        }

        // 3. 回到主页浏览更多
        console.log('\n3. 浏览练习页面...');
        await page.goto(SITE_URL, { waitUntil: 'networkidle2', timeout: 30000 });
        await delay(2000);

        // 点击开始练习获取更多题目
        await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button, a'));
            for (const btn of buttons) {
                const text = btn.textContent?.trim() || '';
                if (text.includes('开始') || text.includes('练习') || text.includes('题库')) {
                    btn.click();
                    break;
                }
            }
        });
        await delay(3000);

        // 模拟翻页获取更多题目
        console.log('\n4. 模拟做题翻页...');
        for (let i = 0; i < 50; i++) {
            try {
                // 点击下一题按钮
                await page.evaluate(() => {
                    const btns = Array.from(document.querySelectorAll('button'));
                    for (const btn of btns) {
                        const text = btn.textContent?.trim() || '';
                        if (text.includes('下一') || text.includes('跳过') || text.includes('继续')) {
                            btn.click();
                            return true;
                        }
                    }
                    return false;
                });
                await delay(500);

                if (i % 10 === 0) {
                    console.log(`  已翻 ${i} 页, 累计 ${allQuestions.size} 题`);
                }
            } catch (e) {
                break;
            }
        }

        // 保存结果
        console.log('\n=== 抓取完成 ===');
        console.log(`总共收集: ${allQuestions.size} 道不重复题目`);
        console.log(`会员状态: ${isPremiumActive ? '已激活' : '未激活'}`);

        const output = {
            totalQuestions: allQuestions.size,
            isPremiumActivated: isPremiumActive,
            scrapedAt: new Date().toISOString(),
            questions: Array.from(allQuestions.values())
        };

        fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), 'utf8');
        console.log(`\n已保存到: ${OUTPUT_PATH}`);

        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'session-final.png') });

    } catch (error) {
        console.error('错误:', error.message);
    } finally {
        console.log('\n保持浏览器打开 20 秒...');
        await delay(20000);
        await browser.close();
        console.log('完成');
    }
}

scrapeWithSession().catch(console.error);
