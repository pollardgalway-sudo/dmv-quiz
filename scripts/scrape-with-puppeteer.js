/**
 * Enhanced Puppeteer script to scrape questions from tk.jiazhoujiazhao.com
 * With proper activation code handling
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const ACTIVATION_CODE = 'XHS-XD8A-UPUJ-GEC2';
const SITE_URL = 'https://tk.jiazhoujiazhao.com';
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');
const OUTPUT_PATH = path.join(__dirname, '..', 'data', 'questions-scraped-all.json');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Ensure screenshots directory exists
if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function scrapeQuestions() {
    console.log('=== 开始抓取题目 ===\n');
    console.log('使用激活码:', ACTIVATION_CODE);

    const chromePath = 'C:\\Users\\Administrator\\AppData\\Local\\Google\\Chrome\\Bin\\chrome.exe';
    console.log('Chrome 路径:', chromePath);

    const browser = await puppeteer.launch({
        executablePath: chromePath,
        headless: false, // 可见浏览器便于调试
        defaultViewport: { width: 1400, height: 900 },
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--start-maximized']
    });

    const page = await browser.newPage();

    // 收集所有题目
    const allQuestions = new Map();
    let isPremiumActive = false;

    // 监听 API 响应
    page.on('response', async (response) => {
        const url = response.url();
        if (url.includes('/api/questions')) {
            try {
                const data = await response.json();
                console.log(`API 响应: ${url.split('?')[1]?.substring(0, 50)}..., 题目数: ${data.questions?.length}, 会员: ${data.isPremium}`);

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
                    console.log(`  当前总计: ${allQuestions.size} 道不重复题目`);
                }
            } catch (e) { }
        }
    });

    try {
        // 1. 打开网站
        console.log('\n1. 打开网站...');
        await page.goto(SITE_URL, { waitUntil: 'networkidle2', timeout: 60000 });
        await delay(3000);
        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01-initial.png') });

        // 2. 查找并点击激活/会员按钮
        console.log('\n2. 查找激活入口...');

        // 尝试多种方式找到激活入口
        const activationClicked = await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button, a, div[role="button"], span'));
            const keywords = ['激活', '会员', 'VIP', '输入激活码', '兑换', '开通'];

            for (const btn of buttons) {
                const text = btn.textContent?.trim() || '';
                for (const keyword of keywords) {
                    if (text.includes(keyword)) {
                        btn.click();
                        return { found: true, text: text.substring(0, 30) };
                    }
                }
            }
            return { found: false };
        });

        console.log('激活按钮:', activationClicked);
        await delay(2000);
        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02-after-click.png') });

        // 3. 查找激活码输入框
        console.log('\n3. 查找激活码输入框...');

        const inputInfo = await page.evaluate(() => {
            const inputs = Array.from(document.querySelectorAll('input[type="text"], input:not([type])'));
            return inputs.map(input => ({
                placeholder: input.placeholder,
                name: input.name,
                id: input.id,
                visible: input.offsetParent !== null
            }));
        });
        console.log('找到输入框:', inputInfo);

        // 尝试多种选择器
        const inputSelectors = [
            'input[placeholder*="激活"]',
            'input[placeholder*="activation"]',
            'input[placeholder*="code"]',
            'input[placeholder*="卡密"]',
            'input[placeholder*="兑换"]',
            'input[type="text"]:visible',
            'input:not([type="hidden"]):not([type="password"])'
        ];

        let inputFound = false;
        for (const selector of inputSelectors) {
            try {
                const input = await page.$(selector);
                if (input) {
                    await input.click();
                    await delay(300);
                    await input.type(ACTIVATION_CODE, { delay: 50 });
                    console.log(`输入激活码到: ${selector}`);
                    inputFound = true;
                    break;
                }
            } catch (e) { }
        }

        if (!inputFound) {
            // 使用 evaluate 强制输入
            await page.evaluate((code) => {
                const inputs = document.querySelectorAll('input');
                for (const input of inputs) {
                    if (input.type !== 'hidden' && input.offsetParent !== null) {
                        input.value = code;
                        input.dispatchEvent(new Event('input', { bubbles: true }));
                        return true;
                    }
                }
                return false;
            }, ACTIVATION_CODE);
        }

        await delay(1000);
        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03-code-entered.png') });

        // 4. 点击提交/确认按钮
        console.log('\n4. 提交激活码...');
        await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const keywords = ['确定', '确认', '激活', '提交', 'OK', 'Submit', '兑换'];
            for (const btn of buttons) {
                const text = btn.textContent?.trim() || '';
                for (const keyword of keywords) {
                    if (text.includes(keyword)) {
                        btn.click();
                        return text;
                    }
                }
            }
            // 如果没找到，点击任何看起来像提交的按钮
            const submitBtn = document.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.click();
        });

        await delay(3000);
        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '04-after-submit.png') });

        // 5. 开始抓取题目
        console.log('\n5. 开始抓取题目...');

        // 直接在页面context中发起API请求
        const categories = ['text', 'sign', 'general', '通用', '交通标志'];

        for (const type of categories) {
            for (let offset = 0; offset < 1000; offset += 100) {
                const apiUrl = `/api/questions?type=${type}&limit=100&offset=${offset}`;
                try {
                    await page.goto(`${SITE_URL}${apiUrl}`, { waitUntil: 'networkidle0', timeout: 10000 });
                    await delay(500);
                } catch (e) {
                    console.log(`  跳过: offset=${offset}`);
                    break;
                }
            }
        }

        // 6. 回到主页浏览更多
        console.log('\n6. 浏览主页收集更多题目...');
        await page.goto(SITE_URL, { waitUntil: 'networkidle2', timeout: 30000 });
        await delay(2000);

        // 点击不同的练习入口
        const practiceButtons = await page.$$('a, button');
        for (let i = 0; i < Math.min(practiceButtons.length, 20); i++) {
            try {
                const text = await page.evaluate(el => el.textContent, practiceButtons[i]);
                if (text && (text.includes('练习') || text.includes('题库') || text.includes('开始') || text.includes('做题'))) {
                    await practiceButtons[i].click();
                    await delay(2000);
                    await page.goBack();
                    await delay(1000);
                }
            } catch (e) { }
        }

        // 7. 保存结果
        console.log('\n=== 抓取完成 ===');
        console.log(`总共收集: ${allQuestions.size} 道不重复题目`);
        console.log(`会员状态: ${isPremiumActive ? '已激活' : '未激活'}`);

        const output = {
            totalQuestions: allQuestions.size,
            isPremiumActivated: isPremiumActive,
            scrapedAt: new Date().toISOString(),
            activationCode: ACTIVATION_CODE,
            questions: Array.from(allQuestions.values())
        };

        fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), 'utf8');
        console.log(`\n已保存到: ${OUTPUT_PATH}`);

        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '05-final.png') });

    } catch (error) {
        console.error('错误:', error);
        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'error.png') });
    } finally {
        console.log('\n保持浏览器打开 30 秒供检查...');
        await delay(30000);
        await browser.close();
        console.log('浏览器已关闭');
    }
}

scrapeQuestions().catch(console.error);
