/**
 * 打开浏览器让用户手动激活
 */

const puppeteer = require('puppeteer');

const SITE_URL = 'https://tk.jiazhoujiazhao.com';
const ACTIVATION_CODE = 'XHS-MQXL-SWR8-6SQZ';

async function openBrowserForActivation() {
    console.log('=== 正在打开浏览器 ===\n');

    const chromePath = 'C:\\Users\\Administrator\\AppData\\Local\\Google\\Chrome\\Bin\\chrome.exe';
    console.log('Chrome 路径:', chromePath);

    const browser = await puppeteer.launch({
        executablePath: chromePath,
        headless: false, // 可见浏览器
        defaultViewport: null, // 使用默认视口
        args: ['--start-maximized', '--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    console.log('正在打开网站:', SITE_URL);
    await page.goto(SITE_URL, { waitUntil: 'networkidle2', timeout: 60000 });

    console.log('\n========================================');
    console.log('浏览器已打开！');
    console.log('请在浏览器中手动激活：');
    console.log('1. 找到"激活"或"会员"按钮');
    console.log('2. 输入激活码: ' + ACTIVATION_CODE);
    console.log('3. 点击确认完成激活');
    console.log('========================================\n');
    console.log('浏览器将保持打开 5 分钟...');
    console.log('激活成功后请告诉我。');

    // 保持浏览器打开5分钟
    await new Promise(resolve => setTimeout(resolve, 5 * 60 * 1000));

    await browser.close();
    console.log('浏览器已关闭');
}

openBrowserForActivation().catch(console.error);
