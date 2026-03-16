const fs = require('fs');
const path = require('path');

// Read cleaned source data
const srcData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/questions-all.json'), 'utf8'));

console.log(`Source data: ${srcData.length} questions`);

// Split by source
const basics = srcData.filter(q => q.source === 'basics');
const deepdive = srcData.filter(q => q.source === 'deepdive');
const signs = srcData.filter(q => q.source === 'signs');

console.log(`  basics: ${basics.length}`);
console.log(`  deepdive: ${deepdive.length}`);
console.log(`  signs: ${signs.length}`);

// Write to public/data/ for frontend
const publicDir = path.join(__dirname, '../public/data');

fs.writeFileSync(path.join(publicDir, 'questions-all.json'), JSON.stringify(srcData, null, 2));
fs.writeFileSync(path.join(publicDir, 'questions-basics.json'), JSON.stringify(basics, null, 2));
fs.writeFileSync(path.join(publicDir, 'questions-deepdive.json'), JSON.stringify(deepdive, null, 2));

// Also update the root data/ split files
const dataDir = path.join(__dirname, '../data');
fs.writeFileSync(path.join(dataDir, 'questions-basics.json'), JSON.stringify(basics, null, 2));
fs.writeFileSync(path.join(dataDir, 'questions-deepdive-fixed.json'), JSON.stringify(deepdive, null, 2));

console.log('\n✅ 同步完成！');
console.log(`  public/data/questions-all.json: ${srcData.length} 题`);
console.log(`  public/data/questions-basics.json: ${basics.length} 题`);
console.log(`  public/data/questions-deepdive.json: ${deepdive.length} 题`);
