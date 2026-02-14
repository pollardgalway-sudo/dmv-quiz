const fs = require('fs');
const path = require('path');

const filesToFix = [
    'data/questions-final-master.json',
    'public/data/questions-basics.json',
    'public/data/questions-deepdive.json',
    'public/data/questions-all.json'
];

console.log('🧹 开始全局修正错别字...');

filesToFix.forEach(relPath => {
    const absPath = path.join(__dirname, '..', relPath);
    if (fs.existsSync(absPath)) {
        let content = fs.readFileSync(absPath, 'utf8');

        // 1. 先把题目逻辑里的矛盾句式改了 (针对那一题)
        content = content.replace(/交通（由于拥堵）正以 70 哩的速度行驶/g, '车流正以 70 英里的时速行驶');

        // 2. 全局替换：哩 -> 英里
        // 为了防止“英哩”变成“英英里”，我们先处理“英哩”
        content = content.replace(/英哩/g, '英里');
        content = content.replace(/哩/g, '英里');

        // 3. 修正可能出现的双重替换
        content = content.replace(/英英里/g, '英里');

        fs.writeFileSync(absPath, content);
        console.log(`✅ 已修正: ${relPath}`);
    }
});

console.log('✨ 全局修正完成！所有的“哩”都已变更为“英里”，逻辑矛盾也已清除。');
