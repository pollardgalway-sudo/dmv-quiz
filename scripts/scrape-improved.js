/**
 * 改进版爬虫：激活后立即抓取，保持会话
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const ACTIVATION_CODE = 'XHS-XD8A-UPUJ-GEC2';
const SITE_URL = 'https://tk.jiazhoujiazhao.com';
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');
const OUTPUT_PATH = path.join(__dirname, '..', 'data', 'questions-new-scraped.json');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function scrapeAfterActivation() {
    console.log('=== 激活后立即抓取 ===\n');
    console.log('激活码:', ACTIVATION_CODE);

    const chromePath = 'C:\\Users\\Administrator\\AppData\\Local\\Google\\Chrome\\Bin\\chrome.exe';

    const browser = await puppeteer.launch({
        executablePath: chromePath,
        headless: false,
        defaultViewport: { width: 1400, height: 900 },
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized']
    });

    const page = await browser.newPage();
    const allQuestions = new Map();
    let isPremiumActive = false;

    // 监听所有 API 响应
    page.on('response', async (response) => {
        const url = response.url();
        if (url.includes('/api/questions')) {
            try {
                const data = await response.json();

                if (data.isPremium) {
                    isPremiumActive = true;
                    console.log('✅ 检测到会员状态!');
                }

                if (data.questions && data.questions.length > 0) {
                    let newCount = 0;
                    data.questions.forEach(q => {
                        const id = q._id || q.id;
                        if (id && !allQuestions.has(id)) {
                            allQuestions.set(id, q);
                            newCount++;
                        }
                    });
                    if (newCount > 0) {
                        console.log(`[API] 新增 ${newCount} 题, 累计 ${allQuestions.size} 题, 会员=${data.isPremium}`);
                    }
                }
            } catch (e) { }
        }
    });

    try {
        // 1. 打开网站
        console.log('\n1. 打开网站...');
        await page.goto(SITE_URL, { waitUntil: 'networkidle2', timeout: 60000 });
        await delay(3000);

        // 2. 查找并点击"非会员激活"按钮
        console.log('\n2. 查找激活入口...');

        const clicked = await page.evaluate(() => {
            // 查找包含激活相关文字的元素
            const elements = document.querySelectorAll('button, a, div, span');
            for (const el of elements) {
                const text = el.textContent?.trim() || '';
                if (text.includes('非会员') || text.includes('激活') || text.includes('会员') || text.includes('VIP')) {
                    if (el.offsetParent !== null) { // 可见
                        el.click();
                        return text.substring(0, 30);
                    }
                }
            }
            return null;
        });
        console.log('点击了:', clicked);
        await delay(2000);

        // 3. 输入激活码
        console.log('\n3. 输入激活码...');

        // 等待输入框出现
        await page.waitForSelector('input', { timeout: 5000 }).catch(() => { });

        // 找到激活码输入框并输入
        const inputted = await page.evaluate((code) => {
            const inputs = document.querySelectorAll('input');
            for (const input of inputs) {
                if (input.type !== 'hidden' && input.offsetParent !== null) {
                    input.value = code;
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                    return true;
                }
            }
            return false;
        }, ACTIVATION_CODE);
        console.log('输入结果:', inputted);
        await delay(1000);

        // 4. 点击确认按钮
        console.log('\n4. 提交激活码...');
        await page.evaluate(() => {
            const buttons = document.querySelectorAll('button');
            for (const btn of buttons) {
                const text = btn.textContent?.trim() || '';
                if (text.includes('确') || text.includes('激活') || text.includes('兑换') || text.includes('提交')) {
                    btn.click();
                    return text;
                }
            }
        });
        await delay(3000);
        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'new-01-after-activate.png') });

        // 5. 关闭可能的成功弹窗
        console.log('\n5. 关闭弹窗...');
        await page.evaluate(() => {
            const closeButtons = document.querySelectorAll('button, .close, [class*="close"]');
            for (const btn of closeButtons) {
                if (btn.offsetParent !== null) {
                    btn.click();
                }
            }
        });
        await delay(1000);

        // 6. 刷新页面让会员状态生效
        console.log('\n6. 刷新页面...');
        await page.goto(SITE_URL, { waitUntil: 'networkidle2', timeout: 30000 });
        await delay(3000);
        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'new-02-after-refresh.png') });

        // 7. 开始做题翻页抓取
        console.log('\n7. 开始翻页抓取题目...');

        // 点击开始练习
        await page.evaluate(() => {
            const btns = document.querySelectorAll('button, a');
            for (const btn of btns) {
                const text = btn.textContent?.trim() || '';
                if (text.includes('开始') || text.includes('练习') || text.includes('继续')) {
                    btn.click();
                    return;
                }
            }
        });
        await delay(2000);

        // 循环翻页
        let lastCount = 0;
        let noNewCount = 0;

        for (let i = 0; i < 800; i++) {
            // 选择一个随机选项（模拟答题）
            await page.evaluate(() => {
                const options = document.querySelectorAll('[class*="option"], .option, button');
                for (const opt of options) {
                    const text = opt.textContent?.trim() || '';
                    if (text.length > 2 && !text.includes('下一') && !text.includes('上一')) {
                        opt.click();
                        break;
                    }
                }
            });
            await delay(200);

            // 点击下一题
            await page.evaluate(() => {
                const btns = document.querySelectorAll('button');
                for (const btn of btns) {
                    const text = btn.textContent?.trim() || '';
                    if (text.includes('下一') || text.includes('跳过') || text.includes('继续')) {
                        btn.click();
                        return;
                    }
                }
            });
            await delay(300);

            // 检查进度
            if (i % 50 === 0 && i > 0) {
                console.log(`  进度: ${i}/800, 累计 ${allQuestions.size} 题`);

                // 检查是否有新题
                if (allQuestions.size === lastCount) {
                    noNewCount++;
                    if (noNewCount >= 3) {
                        console.log('  连续3次无新题，可能已抓完');
                        break;
                    }
                } else {
                    noNewCount = 0;
                }
                lastCount = allQuestions.size;
            }
        }

        // 8. 尝试切换题目类型
        console.log('\n8. 尝试切换题库类型...');
        await page.goto(SITE_URL, { waitUntil: 'networkidle2', timeout: 30000 });
        await delay(2000);

        // 查找并点击其他题库类型
        const types = await page.evaluate(() => {
            const tabs = document.querySelectorAll('[class*="tab"], button, a');
            const found = [];
            for (const tab of tabs) {
                const text = tab.textContent?.trim() || '';
                if (text.includes('标志') || text.includes('通用') || text.includes('全部')) {
                    found.push(text);
                }
            }
            return found;
        });
        console.log('发现题库类型:', types);

        for (const type of types) {
            await page.evaluate((typeName) => {
                const tabs = document.querySelectorAll('[class*="tab"], button, a');
                for (const tab of tabs) {
                    if (tab.textContent?.includes(typeName)) {
                        tab.click();
                        return;
                    }
                }
            }, type);
            await delay(2000);

            // 做几题
            for (let j = 0; j < 100; j++) {
                await page.evaluate(() => {
                    const btns = document.querySelectorAll('button');
                    for (const btn of btns) {
                        const text = btn.textContent?.trim() || '';
                        if (text.includes('下一') || text.includes('跳过')) {
                            btn.click();
                            return;
                        }
                    }
                });
                await delay(200);
            }
            console.log(`  ${type}: 累计 ${allQuestions.size} 题`);
        }

        // 9. 保存结果
        console.log('\n=== 抓取完成 ===');
        console.log(`总共收集: ${allQuestions.size} 道不重复题目`);
        console.log(`会员状态: ${isPremiumActive ? '已激活 ✓' : '未激活 ✗'}`);

        const output = {
            totalQuestions: allQuestions.size,
            isPremiumActivated: isPremiumActive,
            scrapedAt: new Date().toISOString(),
            activationCode: ACTIVATION_CODE,
            questions: Array.from(allQuestions.values())
        };

        fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), 'utf8');
        console.log(`\n已保存到: ${OUTPUT_PATH}`);

        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'new-final.png') });

    } catch (error) {
        console.error('错误:', error.message);
        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'new-error.png') });
    } finally {
        console.log('\n浏览器将在 15 秒后关闭...');
        await delay(15000);
        await browser.close();
        console.log('完成!');
    }
}

scrapeAfterActivation().catch(console.error);
