const fs = require('fs');

const deepdiveContent = fs.readFileSync('questions-deepdive-fixed.json', 'utf8').replace('\n      [', '');
const deepdive = JSON.parse(deepdiveContent);
const basics = JSON.parse(fs.readFileSync('questions-basics.json', 'utf8'));

const seen = new Set();
const merged = [];
for (const q of [...deepdive, ...basics]) {
    if (!seen.has(q.id)) {
        seen.add(q.id);
        merged.push(q);
    }
}

merged.sort((a, b) => a.id - b.id);
merged.forEach((q, i) => q.id = i + 1);

fs.writeFileSync('questions-final.json', JSON.stringify(merged, null, 2), 'utf8');
console.log(`✓ 合并完成！最终题目数量: ${merged.length}`);
console.log(`✓ Merge complete! Final question count: ${merged.length}`);
