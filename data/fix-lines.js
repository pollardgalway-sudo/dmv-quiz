const fs = require('fs');

// 读取文件
const lines = fs.readFileSync('questions-deepdive.json.backup', 'utf8').split('\n');

// 修复第1214行
if (lines[1213] && lines[1213].includes('更好') && !lines[1213].includes('更好。')) {
  lines[1213] = lines[1213].replace('更好', '更好。",');
  // 添加繁体中文
  lines.splice(1214, 0, '      "zh-Hant": "遠光燈會被霧氣反射產生眩光，導致視線模糊。近光燈照射地面效果更好。"');
  lines.splice(1215, 0, '    },');
  lines.splice(1216, 0, '    "dmv_ref": {');
  lines.splice(1217, 0, '      "page": "82",');
  lines.splice(1218, 0, '      "section": "Section 8: Driving Hazards"');
  lines.splice(1219, 0, '    }');
  lines.splice(1220, 0, '  },');
  // 删除多余的 [
  lines.splice(1221, 1);
}

// 保存修复后的文件
const fixed = lines.join('\n');
fs.writeFileSync('questions-deepdive-fixed.json', fixed, 'utf8');

// 验证并去重
try {
  const questions = JSON.parse(fixed);

  // 去重
  const seen = new Set();
  const unique = questions.filter(q => {
    if (seen.has(q.id)) return false;
    seen.add(q.id);
    return true;
  });

  // 排序
  unique.sort((a, b) => a.id - b.id);

  // 保存最终文件
  fs.writeFileSync('questions-deepdive.json', JSON.stringify(unique, null, 2), 'utf8');

  console.log('✅ 修复成功！');
  console.log(`原始题目数: ${questions.length}`);
  console.log(`去重后题目数: ${unique.length}`);
  console.log(`删除了 ${questions.length - unique.length} 道重复题目`);
  console.log('\n📝 你需要添加的新题目ID: 201-270 (共70道)');

} catch (e) {
  console.log('❌ 错误:', e.message);
  console.log('位置:', e.stack);
}
