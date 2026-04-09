const fs = require('fs');
const path = require('path');

// Load the final-master (contains both original 269 + scraped 743)
const fm = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/questions-final-master.json'), 'utf8'));
const fmq = Array.isArray(fm) ? fm : fm.questions || [];

// Separate original vs scraped
const original = fmq.filter(q => q.question && q.question.en); // old format
const scraped = fmq.filter(q => q.questionText); // scraped format

console.log('=== 数据概览 ===');
console.log('final-master 总题数:', fmq.length);
console.log('原始题目 (question.en 格式):', original.length);
console.log('爬取题目 (questionText 格式):', scraped.length);

// =========== AUDIT SCRAPED QUESTIONS ===========
console.log('\n=== 爬取题目审计 ===');

let issues = {
  noQuestion: [],
  noOptions: [],
  fewOptions: [],
  noCorrectAnswer: [],
  emptyOptionText: [],
  duplicateQuestions: [],
  noExplanation: [],
  withImage: [],
  noImage: [],
};

// 1. Check each scraped question
scraped.forEach((q, idx) => {
  // Question text
  if (!q.questionText || q.questionText.trim() === '') {
    issues.noQuestion.push(idx);
  }

  // Options
  if (!q.options || !Array.isArray(q.options) || q.options.length === 0) {
    issues.noOptions.push({ idx, questionText: (q.questionText || '').substring(0, 60) });
    return;
  }

  if (q.options.length < 3) {
    issues.fewOptions.push({ idx, count: q.options.length, questionText: (q.questionText || '').substring(0, 60) });
  }

  // Correct answer
  const correctIdx = q.options.findIndex(o => o.isCorrect === true);
  if (correctIdx === -1) {
    issues.noCorrectAnswer.push({ idx, questionText: (q.questionText || '').substring(0, 80) });
  }

  // Empty option text
  q.options.forEach((opt, oi) => {
    if (!opt.optionText || opt.optionText.trim() === '') {
      issues.emptyOptionText.push({ idx, optionIdx: oi, questionText: (q.questionText || '').substring(0, 60) });
    }
  });

  // Explanation
  if (!q.explanation || q.explanation.trim() === '') {
    issues.noExplanation.push(idx);
  }

  // Image
  if (q.imageUrl && q.imageUrl !== null) {
    issues.withImage.push({ idx, imageUrl: q.imageUrl, questionText: (q.questionText || '').substring(0, 60) });
  } else {
    issues.noImage.push(idx);
  }
});

// 2. Check duplicates
const textMap = {};
const dupes = [];
scraped.forEach((q, idx) => {
  const key = (q.questionText || '').toLowerCase().trim();
  if (key && textMap[key] !== undefined) {
    dupes.push({ idx, duplicateOf: textMap[key], questionText: (q.questionText || '').substring(0, 80) });
  } else {
    textMap[key] = idx;
  }
});

console.log('\n--- 基本统计 ---');
console.log('总爬取题数:', scraped.length);
console.log('有图片题:', issues.withImage.length);
console.log('无图片题:', issues.noImage.length);

console.log('\n--- 问题诊断 ---');
console.log('❌ 没有题目文本:', issues.noQuestion.length);
console.log('❌ 没有选项:', issues.noOptions.length);
console.log('⚠️  选项少于3个:', issues.fewOptions.length);
console.log('❌ 没有标记正确答案 (isCorrect):', issues.noCorrectAnswer.length);
console.log('⚠️  有空选项文本:', issues.emptyOptionText.length);
console.log('⚠️  重复题目:', dupes.length);
console.log('⚠️  没有解释:', issues.noExplanation.length);

// Show samples of problems
if (issues.noCorrectAnswer.length > 0) {
  console.log('\n--- 没有正确答案的题目示例 (前5个) ---');
  issues.noCorrectAnswer.slice(0, 5).forEach(item => {
    const q = scraped[item.idx];
    console.log('  #' + item.idx + ': ' + item.questionText);
    if (q.options) {
      q.options.forEach((o, i) => {
        console.log('    ' + i + ': ' + (o.optionText || '').substring(0, 50) + ' | isCorrect=' + o.isCorrect);
      });
    }
  });
}

if (issues.fewOptions.length > 0) {
  console.log('\n--- 选项不足的题目 ---');
  issues.fewOptions.forEach(item => {
    console.log('  #' + item.idx + ' (' + item.count + ' options): ' + item.questionText);
  });
}

if (dupes.length > 0) {
  console.log('\n--- 重复题目 (前10个) ---');
  dupes.slice(0, 10).forEach(d => {
    console.log('  #' + d.idx + ' 重复自 #' + d.duplicateOf + ': ' + d.questionText);
  });
}

if (issues.emptyOptionText.length > 0) {
  console.log('\n--- 空选项示例 (前5个) ---');
  issues.emptyOptionText.slice(0, 5).forEach(item => {
    console.log('  #' + item.idx + ' option ' + item.optionIdx + ': ' + item.questionText);
  });
}

// 3. Spot check: sample 10 random questions to show content quality
console.log('\n=== 随机抽查 10 道题 ===');
const indices = [];
while (indices.length < Math.min(10, scraped.length)) {
  const r = Math.floor(Math.random() * scraped.length);
  if (!indices.includes(r)) indices.push(r);
}
indices.sort((a, b) => a - b);

indices.forEach(idx => {
  const q = scraped[idx];
  const correctIdx = q.options ? q.options.findIndex(o => o.isCorrect === true) : -1;
  console.log('\n#' + idx + ': ' + (q.questionText || '(empty)'));
  console.log('  中文: ' + (q.questionTextZh || '(无)').substring(0, 80));
  if (q.imageUrl) console.log('  图片: ' + q.imageUrl);
  if (q.options) {
    q.options.forEach((o, i) => {
      const mark = i === correctIdx ? ' ✅' : '';
      console.log('  ' + String.fromCharCode(65 + i) + ': ' + (o.optionText || '(empty)') + mark);
    });
  }
  console.log('  解释: ' + (q.explanation || '(无)').substring(0, 100));
});

// 4. Check if sign images actually exist
console.log('\n=== 图片文件检查 ===');
const publicImages = path.join(__dirname, '../public/images');
const signImagesExist = fs.existsSync(publicImages);
console.log('public/images/ 目录存在:', signImagesExist);

if (signImagesExist) {
  const imageFiles = fs.readdirSync(publicImages);
  console.log('public/images/ 文件数:', imageFiles.length);
  
  // Check if scraped image URLs match
  let found = 0, notFound = 0;
  const missing = [];
  issues.withImage.forEach(item => {
    // imageUrl is like "signs-webp/Stop.webp"
    const imgPath = path.join(publicImages, item.imageUrl);
    if (fs.existsSync(imgPath)) {
      found++;
    } else {
      notFound++;
      if (missing.length < 5) missing.push(item.imageUrl);
    }
  });
  console.log('图片引用匹配:', found, '/', issues.withImage.length);
  console.log('图片缺失:', notFound);
  if (missing.length > 0) {
    console.log('缺失示例:', missing.join(', '));
  }
} else {
  // Check other possible locations
  const signsWebp = path.join(__dirname, '../public/signs-webp');
  console.log('public/signs-webp/ 目录存在:', fs.existsSync(signsWebp));
  if (fs.existsSync(signsWebp)) {
    console.log('public/signs-webp/ 文件数:', fs.readdirSync(signsWebp).length);
  }
}

// Summary
console.log('\n============================');
console.log('=== 总结 ===');
console.log('============================');
const critical = issues.noQuestion.length + issues.noOptions.length + issues.noCorrectAnswer.length;
const warnings = issues.fewOptions.length + issues.emptyOptionText.length + dupes.length;
if (critical === 0) {
  console.log('✅ 没有严重问题！所有题目都有题目文本、选项和正确答案标记');
} else {
  console.log('❌ 发现 ' + critical + ' 个严重问题需要修复');
}
if (warnings > 0) {
  console.log('⚠️  发现 ' + warnings + ' 个警告');
}
console.log('可用题目: ' + (scraped.length - issues.noQuestion.length - issues.noOptions.length - issues.noCorrectAnswer.length - dupes.length) + ' / ' + scraped.length);
