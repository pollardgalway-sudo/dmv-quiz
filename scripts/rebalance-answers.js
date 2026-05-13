#!/usr/bin/env node
/**
 * rebalance-answers.js
 * 
 * 重新平衡答案分布，让 A/B/C 各约 33%。
 * 方法：对每道题随机打乱选项顺序，同步更新答案。
 * 
 * 安全措施:
 * - 不改变题目内容和解释
 * - 只是打乱选项的排列顺序
 * - 自动备份
 * - 验证打乱后答案仍正确
 */

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'public', 'data', 'questions-all.json');
const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

console.log(`总题目: ${data.length}`);

// Show before distribution
const beforeDist = { A: 0, B: 0, C: 0 };
data.forEach(q => { if (q.answer) beforeDist[q.answer]++; });
console.log('\n调整前:');
Object.entries(beforeDist).forEach(([k, v]) => {
  console.log(`  ${k}: ${v} (${(v / data.length * 100).toFixed(1)}%)`);
});

// Shuffle function (Fisher-Yates)
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const keys = ['A', 'B', 'C'];
let shuffledCount = 0;
let skippedCount = 0;
const errors = [];

data.forEach((q, idx) => {
  if (!q.options || !q.answer || !q.options.A || !q.options.B || !q.options.C) {
    skippedCount++;
    return;
  }

  // 检查选项文本中是否有互相引用（如 "以上都对"、"A 和 B"、"以上皆是"）
  const optTexts = keys.map(k => {
    const o = q.options[k];
    return (o?.['zh-Hant'] || '') + (o?.['zh-Hans'] || '') + (o?.en || '');
  }).join(' ');
  
  const hasReference = /以上都|以上皆|以上均|all of the above|both A and|A 和 B|B 和 C|A and B|none of the above|以上都不|以上皆非|都不是|都不对|option A|option B|option C|選項 A|選項 B|選項 C|选项 A|选项 B|选项 C|A 與 B|A与B/i.test(optTexts);
  
  if (hasReference) {
    skippedCount++;
    return;
  }

  // Save original answer text for verification
  const originalAnswerText = q.options[q.answer]?.en || q.options[q.answer]?.['zh-Hans'];

  // Create shuffled key order
  const shuffled = shuffle(keys);
  
  // Build new options and mapping
  const newOptions = {};
  const mapping = {}; // old key -> new key
  
  for (let i = 0; i < keys.length; i++) {
    mapping[shuffled[i]] = keys[i];
    newOptions[keys[i]] = q.options[shuffled[i]];
  }

  // New answer
  const newAnswer = mapping[q.answer];
  
  if (!newAnswer || !['A', 'B', 'C'].includes(newAnswer)) {
    errors.push({ id: q.id, msg: `答案映射失败: ${q.answer} -> ${newAnswer}` });
    return;
  }

  // Verify: new answer should point to same content
  const newAnswerText = newOptions[newAnswer]?.en || newOptions[newAnswer]?.['zh-Hans'];
  if (newAnswerText !== originalAnswerText) {
    errors.push({ id: q.id, msg: `答案内容不匹配! 原: "${originalAnswerText?.substring(0, 30)}" 新: "${newAnswerText?.substring(0, 30)}"` });
    return;
  }

  q.options = newOptions;
  q.answer = newAnswer;
  shuffledCount++;
});

// Show after distribution
const afterDist = { A: 0, B: 0, C: 0 };
data.forEach(q => { if (q.answer) afterDist[q.answer]++; });
console.log('\n调整后:');
Object.entries(afterDist).forEach(([k, v]) => {
  console.log(`  ${k}: ${v} (${(v / data.length * 100).toFixed(1)}%)`);
});

console.log(`\n打乱了: ${shuffledCount} 题`);
console.log(`跳过了: ${skippedCount} 题 (有选项互相引用或数据不完整)`);

if (errors.length > 0) {
  console.log(`\n❌ 错误: ${errors.length}`);
  errors.forEach(e => console.log(`  ID ${e.id}: ${e.msg}`));
  console.log('\n由于有错误，不保存！');
  process.exit(1);
}

// Verify samples
console.log('\n--- 抽样验证 ---');
[1, 50, 100, 200, 500, 800, 996].forEach(idx => {
  const q = data[Math.min(idx - 1, data.length - 1)];
  if (q) {
    const ansOpt = q.options[q.answer];
    const ansText = (ansOpt?.['zh-Hant'] || ansOpt?.['zh-Hans'] || ansOpt?.en || '').substring(0, 40);
    console.log(`  ID ${q.id}: 答案=${q.answer} "${ansText}"`);
  }
});

// Save
const backupPath = DATA_FILE + '.backup-before-rebalance';
if (!fs.existsSync(backupPath)) {
  fs.copyFileSync(DATA_FILE, backupPath);
  console.log(`\n备份: ${backupPath}`);
}

fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
console.log('✅ 已保存到', DATA_FILE);

// Also sync to data/ source
const srcFile = path.join(__dirname, '..', 'data', 'questions-all.json');
fs.writeFileSync(srcFile, JSON.stringify(data, null, 2));
console.log('✅ 已同步到', srcFile);

// Regenerate module files
const deepdive = data.filter(q => q.source === 'deepdive');
const basics = data.filter(q => q.source === 'basics');
const signs = data.filter(q => q.source === 'signs');

fs.writeFileSync(path.join(__dirname, '..', 'public', 'data', 'questions-deepdive.json'), JSON.stringify(deepdive, null, 2));
fs.writeFileSync(path.join(__dirname, '..', 'public', 'data', 'questions-basics.json'), JSON.stringify(basics, null, 2));
fs.writeFileSync(path.join(__dirname, '..', 'public', 'data', 'questions-signs.json'), JSON.stringify(signs, null, 2));
console.log('✅ 已同步 deepdive/basics/signs 模块文件');
