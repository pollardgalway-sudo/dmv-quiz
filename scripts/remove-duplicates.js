/**
 * 清理题库中的重复题目
 * 删除14道重复题（保留原始/更完整的版本）
 */

const fs = require('fs');
const path = require('path');

const PUBLIC_DATA = path.join(__dirname, '..', 'public', 'data');
const DATA_DIR = path.join(__dirname, '..', 'data');

// IDs to REMOVE (keeping the better version of each pair/group)
const REMOVE_IDS = [
  948,  // 白色路缘 (keep 786)
  430,  // 铁路限速 (keep 154)
  961,  // 撞停着的车 (keep 474)
  764,  // 搬家通知DMV (keep 486)
  934,  // 搬家通知DMV (keep 486)
  855,  // 油门卡住 (keep 235)
  949,  // 油门卡住 (keep 235)
  946,  // 碰撞报告 (keep 875)
  977,  // 碰撞报告 (keep 875)
  966,  // 碰撞第一步 (keep 471)
  973,  // 皮卡后斗 (keep 865)
  793,  // 住宅区限速 (keep 115)
  482,  // 前方危险 (keep 283)
  857,  // 蓝色路缘 (keep 331)
];

console.log('=== DMV 题库重复题清理工具 ===\n');
console.log(`准备删除 ${REMOVE_IDS.length} 道重复题: ${REMOVE_IDS.join(', ')}\n`);

// 1. Load questions-all.json from public/data
const allPath = path.join(PUBLIC_DATA, 'questions-all.json');
const allQuestions = JSON.parse(fs.readFileSync(allPath, 'utf8'));
console.log(`原始题目数: ${allQuestions.length}`);

// 2. Backup
const backupPath = allPath + '.backup-before-dedup-' + new Date().toISOString().slice(0, 10);
fs.writeFileSync(backupPath, JSON.stringify(allQuestions, null, 2), 'utf8');
console.log(`已备份到: ${path.basename(backupPath)}`);

// 3. Show what we're removing
console.log('\n--- 将要删除的题目 ---');
const removeSet = new Set(REMOVE_IDS);
const removedQuestions = allQuestions.filter(q => removeSet.has(q.id));
removedQuestions.forEach(q => {
  const enText = typeof q.question === 'object' ? q.question.en : q.question;
  console.log(`  [id:${q.id}, src:${q.source}] ${enText.substring(0, 80)}`);
});

// 4. Filter out duplicates
const cleaned = allQuestions.filter(q => !removeSet.has(q.id));
console.log(`\n删除后题目数: ${cleaned.length} (减少了 ${allQuestions.length - cleaned.length} 道)`);

// Verify counts by source
const countBySource = {};
cleaned.forEach(q => {
  countBySource[q.source] = (countBySource[q.source] || 0) + 1;
});
console.log('各模块题目数:', JSON.stringify(countBySource));

// 5. Save cleaned questions-all.json to public/data
fs.writeFileSync(allPath, JSON.stringify(cleaned, null, 2), 'utf8');
console.log(`\n✅ 已保存: public/data/questions-all.json`);

// 6. Also save to data/ directory if it exists
const dataAllPath = path.join(DATA_DIR, 'questions-all.json');
if (fs.existsSync(dataAllPath)) {
  fs.writeFileSync(dataAllPath, JSON.stringify(cleaned, null, 2), 'utf8');
  console.log(`✅ 已保存: data/questions-all.json`);
}

// 7. Update questions-basics.json (used by demo page)
const basicsPath = path.join(PUBLIC_DATA, 'questions-basics.json');
if (fs.existsSync(basicsPath)) {
  const basicsQuestions = cleaned.filter(q => q.source === 'basics');
  fs.writeFileSync(basicsPath, JSON.stringify(basicsQuestions, null, 2), 'utf8');
  console.log(`✅ 已保存: public/data/questions-basics.json (${basicsQuestions.length} 题)`);
}

// 8. Update questions-deepdive.json
const deepdivePath = path.join(PUBLIC_DATA, 'questions-deepdive.json');
if (fs.existsSync(deepdivePath)) {
  const deepdiveQuestions = cleaned.filter(q => q.source === 'deepdive');
  fs.writeFileSync(deepdivePath, JSON.stringify(deepdiveQuestions, null, 2), 'utf8');
  console.log(`✅ 已保存: public/data/questions-deepdive.json (${deepdiveQuestions.length} 题)`);
}

// 9. Update questions-signs.json
const signsPath = path.join(PUBLIC_DATA, 'questions-signs.json');
if (fs.existsSync(signsPath)) {
  const signsQuestions = cleaned.filter(q => q.source === 'signs');
  fs.writeFileSync(signsPath, JSON.stringify(signsQuestions, null, 2), 'utf8');
  console.log(`✅ 已保存: public/data/questions-signs.json (${signsQuestions.length} 题)`);
}

// 10. Final verification - check no duplicates remain
console.log('\n--- 验证 ---');
const enMap = {};
let remaining = 0;
cleaned.forEach(q => {
  const en = (typeof q.question === 'object' ? q.question.en : q.question).toLowerCase().replace(/[^a-z0-9]/g, '');
  if (enMap[en]) {
    remaining++;
    console.log(`  ⚠️ 仍然相似: id:${enMap[en]} vs id:${q.id}`);
  } else {
    enMap[en] = q.id;
  }
});

if (remaining === 0) {
  console.log('  ✅ 没有完全重复的题目');
}

console.log('\n🎉 清理完成！');
