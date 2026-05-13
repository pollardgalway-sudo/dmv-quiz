#!/usr/bin/env node
/**
 * audit-questions.js - 全面题目质量审计
 * 
 * 检查项目:
 * 1. 缺失字段 (question, options, answer, explanation)
 * 2. 答案不在 A/B/C 范围
 * 3. 选项文字为空
 * 4. 重复题目（相同中文题干）
 * 5. 图片配置问题
 * 6. 选项完全相同
 * 7. 答案与解释矛盾
 * 8. 题目格式异常
 * 9. 缺少 source 分类
 * 10. ID 重复
 */

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'public', 'data', 'questions-all.json');
const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

let totalIssues = 0;
const issues = {
  critical: [],   // 会导致题目无法使用
  warning: [],    // 可能影响答题体验
  info: [],       // 建议改进
};

function addIssue(level, id, msg) {
  issues[level].push({ id, msg });
  totalIssues++;
}

console.log(`正在审计 ${data.length} 道题目...\n`);

// ============================================
// 1. 检查数据结构完整性
// ============================================
data.forEach((q, idx) => {
  const id = q.id ?? `[index ${idx}]`;

  // ID 存在
  if (q.id === undefined || q.id === null) {
    addIssue('critical', id, '缺少 id 字段');
  }

  // source 存在
  if (!q.source) {
    addIssue('warning', id, '缺少 source 字段');
  }

  // question 字段
  if (!q.question) {
    addIssue('critical', id, '缺少 question 字段');
    return;
  }
  if (!q.question.en && !q.question['zh-Hans'] && !q.question['zh-Hant']) {
    addIssue('critical', id, 'question 所有语言都为空');
  } else {
    if (!q.question.en) addIssue('info', id, '缺少英文题目');
    if (!q.question['zh-Hans']) addIssue('warning', id, '缺少简体中文题目');
    if (!q.question['zh-Hant']) addIssue('warning', id, '缺少繁体中文题目');
  }

  // options 字段
  if (!q.options) {
    addIssue('critical', id, '缺少 options 字段');
    return;
  }
  ['A', 'B', 'C'].forEach(opt => {
    if (!q.options[opt]) {
      addIssue('critical', id, `缺少选项 ${opt}`);
    } else {
      if (!q.options[opt].en && !q.options[opt]['zh-Hans'] && !q.options[opt]['zh-Hant']) {
        addIssue('critical', id, `选项 ${opt} 所有语言都为空`);
      }
      if (!q.options[opt]['zh-Hans']) addIssue('info', id, `选项 ${opt} 缺少简体中文`);
      if (!q.options[opt]['zh-Hant']) addIssue('info', id, `选项 ${opt} 缺少繁体中文`);
    }
  });

  // answer 字段
  if (!q.answer) {
    addIssue('critical', id, '缺少 answer 字段');
  } else if (!['A', 'B', 'C'].includes(q.answer)) {
    addIssue('critical', id, `answer 值异常: "${q.answer}" (应为 A/B/C)`);
  }

  // explanation 字段
  if (!q.explanation) {
    addIssue('warning', id, '缺少 explanation 字段');
  } else if (typeof q.explanation === 'object') {
    if (!q.explanation['zh-Hans'] && !q.explanation['zh-Hant']) {
      addIssue('warning', id, '解释缺少中文翻译');
    }
  }
});

// ============================================
// 2. 检查 ID 重复
// ============================================
const idCounts = {};
data.forEach(q => {
  if (q.id !== undefined) {
    idCounts[q.id] = (idCounts[q.id] || 0) + 1;
  }
});
Object.entries(idCounts).forEach(([id, count]) => {
  if (count > 1) {
    addIssue('critical', id, `ID 重复出现 ${count} 次`);
  }
});

// ============================================
// 3. 检查题干重复（相似度）
// ============================================
const questionTexts = {};
data.forEach(q => {
  const text = (q.question?.['zh-Hant'] || q.question?.['zh-Hans'] || q.question?.en || '').trim();
  if (text) {
    // Normalize: remove spaces and punctuation for comparison
    const normalized = text.replace(/[\s\u3000\.,，。？！!?、：:；;（）()\[\]【】""''\"\']/g, '').toLowerCase();
    if (normalized.length > 10) { // skip very short texts
      if (questionTexts[normalized]) {
        addIssue('warning', q.id, `题目与 ID ${questionTexts[normalized]} 高度相似: "${text.substring(0, 40)}..."`);
      } else {
        questionTexts[normalized] = q.id;
      }
    }
  }
});

// ============================================
// 4. 选项重复检查
// ============================================
data.forEach(q => {
  if (!q.options) return;
  const opts = ['A', 'B', 'C'];
  for (let i = 0; i < opts.length; i++) {
    for (let j = i + 1; j < opts.length; j++) {
      const a = q.options[opts[i]];
      const b = q.options[opts[j]];
      if (!a || !b) continue;
      
      const textA = (a['zh-Hant'] || a['zh-Hans'] || a.en || '').trim();
      const textB = (b['zh-Hant'] || b['zh-Hans'] || b.en || '').trim();
      
      if (textA && textB && textA === textB) {
        addIssue('critical', q.id, `选项 ${opts[i]} 和 ${opts[j]} 完全相同: "${textA.substring(0, 30)}"`);
      }
    }
  }
});

// ============================================
// 5. 图片问题检查
// ============================================
data.forEach(q => {
  if (q.hasImage && !q.imageUrl) {
    addIssue('critical', q.id, 'hasImage=true 但 imageUrl 为空');
  }
  if (q.imageUrl && !q.hasImage) {
    addIssue('warning', q.id, '有 imageUrl 但 hasImage 不为 true');
  }
  if (q.imageUrl) {
    const imgPath = path.join(__dirname, '..', 'public', q.imageUrl);
    if (!fs.existsSync(imgPath)) {
      addIssue('critical', q.id, `图片文件不存在: ${q.imageUrl}`);
    }
  }

  // 题目提到"这个标志"但没有图片
  const text = (q.question?.['zh-Hant'] || '') + (q.question?.['zh-Hans'] || '');
  const needsImage = /這個標誌[^a-z]|这个标志[^a-z]/u.test(text);
  if (needsImage && !q.hasImage && !q.imageUrl) {
    addIssue('warning', q.id, `题目提到"这个标志"但没有配图: "${text.substring(0, 35)}..."`);
  }
});

// ============================================
// 6. 答案与解释一致性检查（基于关键词）
// ============================================
data.forEach(q => {
  if (!q.answer || !q.explanation || !q.options) return;

  const explanation = typeof q.explanation === 'string' 
    ? q.explanation 
    : (q.explanation.en || q.explanation['zh-Hans'] || '');
  
  const correctOpt = q.options[q.answer];
  if (!correctOpt) {
    addIssue('critical', q.id, `答案 "${q.answer}" 对应的选项不存在`);
    return;
  }

  const correctText = (correctOpt.en || '').toLowerCase();
  const explLower = explanation.toLowerCase();

  // Check if explanation explicitly mentions a DIFFERENT answer
  const otherKeys = ['A', 'B', 'C'].filter(k => k !== q.answer);
  for (const otherKey of otherKeys) {
    const otherOpt = q.options[otherKey];
    if (!otherOpt) continue;
    const otherText = (otherOpt.en || '').toLowerCase();
    
    // If explanation contains the text of a wrong option as "correct" phrasing
    if (otherText.length > 20 && explLower.includes(otherText.substring(0, 30))) {
      // Only flag if the correct answer text is NOT also in the explanation
      if (!explLower.includes(correctText.substring(0, 30)) && correctText.length > 20) {
        addIssue('warning', q.id, `解释可能与答案 ${q.answer} 不一致 (解释中提到了选项 ${otherKey} 的内容)`);
      }
    }
  }
});

// ============================================
// 7. 答案分布检查
// ============================================
const dist = { A: 0, B: 0, C: 0 };
const distBySource = {};
data.forEach(q => {
  if (q.answer) {
    dist[q.answer] = (dist[q.answer] || 0) + 1;
    const src = q.source || 'unknown';
    if (!distBySource[src]) distBySource[src] = { A: 0, B: 0, C: 0 };
    distBySource[src][q.answer] = (distBySource[src][q.answer] || 0) + 1;
  }
});

// ============================================
// 8. 格式异常检查
// ============================================
data.forEach(q => {
  if (!q.question) return;
  
  const texts = [
    q.question.en, q.question['zh-Hans'], q.question['zh-Hant'],
  ].filter(Boolean);

  texts.forEach(text => {
    // 检查是否有 HTML 标签残留
    if (/<[^>]+>/.test(text)) {
      addIssue('info', q.id, `题目含有 HTML 标签: "${text.substring(0, 40)}"`);
    }
    // 检查是否有不正常的转义字符
    if (/\\n|\\t|\\r/.test(text)) {
      addIssue('info', q.id, `题目含有转义字符: "${text.substring(0, 40)}"`);
    }
  });
});

// ============================================
// 输出报告
// ============================================
console.log('═══════════════════════════════════════');
console.log('         题目质量审计报告');
console.log('═══════════════════════════════════════\n');

console.log(`总题目数: ${data.length}`);
console.log(`总问题数: ${totalIssues}`);
console.log(`  🔴 严重 (Critical): ${issues.critical.length}`);
console.log(`  🟡 警告 (Warning):  ${issues.warning.length}`);
console.log(`  🔵 建议 (Info):     ${issues.info.length}`);

if (issues.critical.length > 0) {
  console.log('\n╔══ 🔴 严重问题 (需要立即修复) ══╗');
  issues.critical.forEach(i => {
    console.log(`  ID ${i.id}: ${i.msg}`);
  });
}

if (issues.warning.length > 0) {
  console.log('\n╔══ 🟡 警告 (建议修复) ══╗');
  issues.warning.forEach(i => {
    console.log(`  ID ${i.id}: ${i.msg}`);
  });
}

console.log('\n╔══ 答案分布 ══╗');
console.log('  总体:');
Object.entries(dist).forEach(([k, v]) => {
  const pct = (v / data.length * 100).toFixed(1);
  const bar = '█'.repeat(Math.round(v / data.length * 50));
  console.log(`    ${k}: ${v} (${pct}%) ${bar}`);
});

console.log('  分模块:');
Object.entries(distBySource).forEach(([src, d]) => {
  const total = Object.values(d).reduce((a, b) => a + b, 0);
  console.log(`    ${src} (${total}题):`);
  Object.entries(d).forEach(([k, v]) => {
    console.log(`      ${k}: ${v} (${(v / total * 100).toFixed(1)}%)`);
  });
});

if (issues.info.length > 0) {
  console.log(`\n╔══ 🔵 建议 (${issues.info.length} 条，仅显示前20条) ══╗`);
  issues.info.slice(0, 20).forEach(i => {
    console.log(`  ID ${i.id}: ${i.msg}`);
  });
  if (issues.info.length > 20) {
    console.log(`  ... 还有 ${issues.info.length - 20} 条建议`);
  }
}

console.log('\n═══════════════════════════════════════');
if (issues.critical.length === 0) {
  console.log('✅ 没有严重问题！题库数据结构完整。');
} else {
  console.log(`❌ 发现 ${issues.critical.length} 个严重问题需要修复！`);
}
console.log('═══════════════════════════════════════');
