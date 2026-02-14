/**
 * 交互式抓取：打开浏览器让用户激活后自动抓取
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const SITE_URL = 'https://tk.jiazhoujiazhao.com';
const ACTIVATION_CODE = 'XHS-MQXL-SWR8-6SQZ';
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');
const OUTPUT_PATH = path.join(__dirname, '..', 'data', 'questions-scraped-new.json');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function interactiveScrape() {
    console.log('=== 交互式抓取程序 ===\n');

    const chromePath = 'C:\\Users\\Administrator\\AppData\\Local\\Google\\Chrome\\Bin\\chrome.exe';

    // 使用临时用户数据目录
    const tempUserDataDir = path.join(__dirname, 'temp-chrome-profile');

    const browser = await puppeteer.launch({
        executablePath: chromePath,
        headless: false,
        defaultViewport: { width: 1400, height: 900 },
        userDataDir: tempUserDataDir,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized']
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

                if (data.isPremium) {
                    isPremiumActive = true;
                }

                if (data.questions) {
                    data.questions.forEach(q => {
                        const id = q._id || q.id;
                        if (id && !allQuestions.has(id)) {
                            allQuestions.set(id, q);
                        }
                    });
                    console.log(`[监听] 会员=${data.isPremium}, 新增=${data.questions.length}, 累计=${allQuestions.size}`);
                }
            } catch (e) { }
        }
    });

    try {
        console.log('1. 打开网站...');
        await page.goto(SITE_URL, { waitUntil: 'networkidle2', timeout: 60000 });
        await delay(2000);

        console.log('\n========================================');
        console.log('请在浏览器中完成以下操作：');
        console.log('1. 点击"非会员激活"或类似按钮');
        console.log('2. 输入激活码: ' + ACTIVATION_CODE);
        console.log('3. 确认激活成功');
        console.log('========================================\n');

        // 等待用户输入继续
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        await new Promise(resolve => {
            rl.question('激活成功后，按回车键继续抓取题目...', () => {
                rl.close();
                resolve();
            });
        });

        console.log('\n2. 开始抓取题目...');

        // 刷新页面以确保会员状态生效
        await page.goto(SITE_URL, { waitUntil: 'networkidle2', timeout: 30000 });
        await delay(2000);

        // 尝试API批量抓取
        console.log('\n3. 通过API抓取...');
        const endpoints = [
            '/api/questions?limit=500&offset=0',
            '/api/questions?type=text&limit=200&offset=0',
            '/api/questions?type=sign&limit=200&offset=0',
            '/api/questions?limit=200&offset=200',
            '/api/questions?limit=200&offset=400',
        ];

        for (const endpoint of endpoints) {
            try {
                await page.goto(`${SITE_URL}${endpoint}`, {
                    waitUntil: 'networkidle0',
                    timeout: 15000
                });
                await delay(500);
            } catch (e) { }
        }

        // 回到主页做题抓取更多
        console.log('\n4. 回到主页浏览...');
        await page.goto(SITE_URL, { waitUntil: 'networkidle2', timeout: 30000 });
        await delay(2000);

        // 点击开始练习
        await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button, a'));
            for (const btn of btns) {
                const text = btn.textContent?.trim() || '';
                if (text.includes('开始练习') || text.includes('继续练习')) {
                    btn.click();
                    break;
                }
            }
        });
        await delay(2000);

        // 翻页抓取
        console.log('\n5. 翻页抓取更多题目...');
        for (let i = 0; i < 100; i++) {
            try {
                await page.evaluate(() => {
                    const btns = Array.from(document.querySelectorAll('button'));
                    for (const btn of btns) {
                        const text = btn.textContent?.trim() || '';
                        if (text.includes('下一') || text.includes('跳过')) {
                            btn.click();
                            return;
                        }
                    }
                });
                await delay(300);

                if (i % 20 === 0 && i > 0) {
                    console.log(`  进度: ${i}/100, 累计 ${allQuestions.size} 题`);
                }
            } catch (e) {
                break;
            }
        }

        // 保存结果
        console.log('\n=== 抓取完成 ===');
        console.log(`总共收集: ${allQuestions.size} 道不重复题目`);
        console.log(`会员状态: ${isPremiumActive ? '已激活 ✓' : '未激活 ✗'}`);

        const output = {
            totalQuestions: allQuestions.size,
            isPremiumActivated: isPremiumActive,
            scrapedAt: new Date().toISOString(),
            questions: Array.from(allQuestions.values())
        };

        fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), 'utf8');
        console.log(`\n已保存到: ${OUTPUT_PATH}`);

    } catch (error) {
        console.error('错误:', error.message);
    } finally {
        console.log('\n浏览器将在 10 秒后关闭...');
        await delay(10000);
        await browser.close();
        console.log('完成！');
    }
}

interactiveScrape().catch(console.error);
