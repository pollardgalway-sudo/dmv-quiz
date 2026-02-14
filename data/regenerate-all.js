/**
 * 重新生成 questions-all.json
 * 合并 basics, deepdive, signs 题库，保留所有字段包括 imageUrl
 */

const fs = require('fs');
const path = require('path');

// 使用 public/data 目录
const dataDir = path.join(__dirname, '..', 'public', 'data');

// 读取题库文件
function loadQuestions(filename) {
    const filePath = path.join(dataDir, filename);
    if (!fs.existsSync(filePath)) {
        console.log(`文件不存在: ${filename} (${filePath})`);
        return [];
    }
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);
        console.log(`成功加载 ${filename}: ${data.length} 题`);
        return data;
    } catch (error) {
        console.error(`读取 ${filename} 失败:`, error.message);
        return [];
    }
}

// 为每个题目添加 source 字段（如果不存在）
function addSource(questions, source) {
    return questions.map(q => ({
        ...q,
        source: q.source || source
    }));
}

// 主程序
console.log('开始重新生成 questions-all.json...');
console.log(`数据目录: ${dataDir}\n`);

// 加载各个题库
const basics = addSource(loadQuestions('questions-basics.json'), 'basics');
const deepdive = addSource(loadQuestions('questions-deepdive.json'), 'deepdive');
const signs = addSource(loadQuestions('questions-signs.json'), 'signs');

// 检查 signs 题目是否有图片信息
const signsWithImages = signs.filter(q => q.hasImage && q.imageUrl);
console.log(`\nsigns 中有图片的题目: ${signsWithImages.length} 题`);

if (signsWithImages.length > 0) {
    console.log('示例图片URL:', signsWithImages[0].imageUrl);
}

// 合并所有题目
const allQuestions = [...basics, ...deepdive, ...signs];
console.log(`\n合并后总计: ${allQuestions.length} 题`);

// 写入 questions-all.json
const outputPath = path.join(dataDir, 'questions-all.json');
fs.writeFileSync(outputPath, JSON.stringify(allQuestions, null, 2), 'utf8');
console.log(`\n已写入: ${outputPath}`);

console.log('\n完成!');
