const fs = require('fs');

// 读取文件
let content = fs.readFileSync('questions-deepdive.json', 'utf8');

// 修复格式问题
content = content.replace(
  '"zh-Hans": "远光灯会被雾气反射产生眩光，导致视线模糊。近光灯照射地面效果更好\n      [',
  '"zh-Hans": "远光灯会被雾气反射产生眩光，导致视线模糊。近光灯照射地面效果更好。",\n      "zh-Hant": "遠光燈會被霧氣反射產生眩光，導致視線模糊。近光燈照射地面效果更好。"\n    },\n    "dmv_ref": {\n      "page": "82",\n      "section": "Section 8: Driving Hazards"\n    }\n  },\n  {'
);

// 保存临时文件
fs.writeFileSync('questions-deepdive-temp.json', content, 'utf8');

try {
  // 解析JSON
  const questions = JSON.parse(content);

  // 去重
  const seen = new Set();
  const unique = questions.filter(q => {
    if (seen.has(q.id)) return false;
    seen.add(q.id);
    return true;
  });

  // 排序
  unique.sort((a, b) => a.id - b.id);

  // 保存
  fs.writeFileSync('questions-deepdive.json', JSON.stringify(unique, null, 2), 'utf8');

  console.log('✅ 修复成功！');
  console.log(`原始题目数: ${questions.length}`);
  console.log(`去重后题目数: ${unique.length}`);
  console.log(`删除了 ${questions.length - unique.length} 道重复题目`);
  console.log('\n📝 你需要添加的新题目ID: 201-270 (共70道)');

} catch (e) {
  console.log('❌ 错误:', e.message);
}
