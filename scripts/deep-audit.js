const fs = require('fs');
const path = require('path');

const all = JSON.parse(fs.readFileSync(path.join(__dirname, '../public/data/questions-all.json'), 'utf8'));

console.log('=== 逐题抽查 (每10题抽1题) ===\n');

let suspicious = [];

for (let i = 0; i < all.length; i += 10) {
  const q = all[i];
  const correctOpt = q.options[q.answer];
  
  // Print for manual review
  console.log(`--- ID ${q.id} [${q.source}] ---`);
  console.log(`Q: ${q.question.en}`);
  if (q.question['zh-Hans'] && q.question['zh-Hans'] !== q.question.en) {
    console.log(`   ${q.question['zh-Hans']}`);
  }
  console.log(`  A: ${q.options.A.en}`);
  console.log(`  B: ${q.options.B.en}`);
  console.log(`  C: ${q.options.C.en}`);
  console.log(`  ✅ Answer: ${q.answer} = "${correctOpt.en}"`);
  if (q.hasImage) console.log(`  🖼️ ${q.imageUrl}`);
  console.log('');

  // Flag potential issues
  // 1. Answer text contains "none" or "all of the above" but isn't the last option
  const ansText = correctOpt.en.toLowerCase();
  
  // 2. Very short answer options (might be suspicious)
  ['A','B','C'].forEach(letter => {
    if (q.options[letter].en.length < 3) {
      suspicious.push({ id: q.id, issue: `Option ${letter} very short: "${q.options[letter].en}"` });
    }
  });
  
  // 3. Check if question text is duplicated in options
  if (q.question.en === correctOpt.en) {
    suspicious.push({ id: q.id, issue: 'Question text equals answer text' });
  }
}

// Also do a comprehensive automated check on ALL questions
console.log('\n=== 全量自动检查 ===\n');

let issues = {
  shortQuestion: [],
  shortOption: [],
  sameOptions: [],
  longQuestion: [],
  noZhHans: [],
};

all.forEach(q => {
  // Short question
  if (q.question.en.length < 15) {
    issues.shortQuestion.push({ id: q.id, text: q.question.en });
  }
  
  // Very short options
  ['A','B','C'].forEach(letter => {
    if (q.options[letter].en.length < 2) {
      issues.shortOption.push({ id: q.id, letter, text: q.options[letter].en });
    }
  });
  
  // Duplicate options (same text for different choices)
  const optTexts = ['A','B','C'].map(l => q.options[l].en.toLowerCase().trim());
  if (optTexts[0] === optTexts[1] || optTexts[0] === optTexts[2] || optTexts[1] === optTexts[2]) {
    issues.sameOptions.push({ id: q.id, opts: optTexts });
  }
  
  // Missing Chinese
  if (!q.question['zh-Hans'] || q.question['zh-Hans'] === q.question.en) {
    issues.noZhHans.push({ id: q.id, text: q.question.en.substring(0, 60) });
  }
});

console.log('短题目 (<15字):', issues.shortQuestion.length);
issues.shortQuestion.forEach(i => console.log(`  ID ${i.id}: "${i.text}"`));

console.log('\n极短选项 (<2字):', issues.shortOption.length);
issues.shortOption.forEach(i => console.log(`  ID ${i.id} ${i.letter}: "${i.text}"`));

console.log('\n重复选项:', issues.sameOptions.length);
issues.sameOptions.forEach(i => console.log(`  ID ${i.id}: ${JSON.stringify(i.opts)}`));

console.log('\n缺少中文:', issues.noZhHans.length);
if (issues.noZhHans.length > 0) {
  issues.noZhHans.slice(0, 5).forEach(i => console.log(`  ID ${i.id}: ${i.text}`));
  if (issues.noZhHans.length > 5) console.log(`  ... 还有 ${issues.noZhHans.length - 5} 个`);
}

// Check some known DMV facts
console.log('\n=== 知识点抽查 ===\n');

function findByKeyword(keyword) {
  return all.filter(q => q.question.en.toLowerCase().includes(keyword.toLowerCase()));
}

// BAC limit
const bac = findByKeyword('blood alcohol');
if (bac.length > 0) {
  bac.forEach(q => {
    const ans = q.options[q.answer].en;
    console.log(`[BAC] ID ${q.id}: Q="${q.question.en.substring(0, 80)}"`);
    console.log(`  Answer: ${q.answer}="${ans}"`);
    if (ans.includes('0.08')) console.log('  ✅ Correct BAC limit (0.08%)');
    else if (ans.includes('0.01')) console.log('  ✅ Under-21 BAC (0.01%)');
    else console.log('  ⚠️ Check this BAC value');
  });
}

// Speed in school zone
const school = findByKeyword('school zone');
if (school.length > 0) {
  school.forEach(q => {
    const ans = q.options[q.answer].en;
    console.log(`[School] ID ${q.id}: Q="${q.question.en.substring(0, 80)}"`);
    console.log(`  Answer: ${q.answer}="${ans}"`);
    if (ans.includes('25') || ans.includes('15') || ans.includes('20')) console.log('  ✅ Reasonable school zone speed');
  });
}

// Following distance
const follow = findByKeyword('following distance');
if (follow.length > 0) {
  follow.forEach(q => {
    const ans = q.options[q.answer].en;
    console.log(`[Follow] ID ${q.id}: Q="${q.question.en.substring(0, 80)}"`);
    console.log(`  Answer: ${q.answer}="${ans}"`);
    if (ans.includes('3') || ans.includes('three')) console.log('  ✅ 3-second rule');
  });
}

// Right turn on red
const redTurn = findByKeyword('right turn on a solid red');
if (redTurn.length > 0) {
  redTurn.forEach(q => {
    const ans = q.options[q.answer].en;
    console.log(`[RedTurn] ID ${q.id}: Q="${q.question.en.substring(0, 80)}"`);
    console.log(`  Answer: ${q.answer}="${ans.substring(0, 80)}"`);
  });
}

// Seat belt
const belt = findByKeyword('seat belt');
if (belt.length > 0) {
  belt.forEach(q => {
    const ans = q.options[q.answer].en;
    console.log(`[Belt] ID ${q.id}: Q="${q.question.en.substring(0, 80)}"`);
    console.log(`  Answer: ${q.answer}="${ans.substring(0, 80)}"`);
  });
}

console.log('\n=== 总结 ===');
const totalIssues = issues.shortQuestion.length + issues.shortOption.length + issues.sameOptions.length;
if (totalIssues === 0) {
  console.log('✅ 自动检查未发现明显问题');
} else {
  console.log(`⚠️ 发现 ${totalIssues} 个潜在问题`);
}
