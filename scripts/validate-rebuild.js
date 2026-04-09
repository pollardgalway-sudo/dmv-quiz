const fs = require('fs');
const path = require('path');

const signs = JSON.parse(fs.readFileSync(path.join(__dirname, '../public/data/questions-signs.json'), 'utf8'));
const withImg = signs.filter(q => q.hasImage && q.imageUrl);
const noImg = signs.filter(q => !q.hasImage || !q.imageUrl);

console.log('Signs total:', signs.length);
console.log('With image:', withImg.length);
console.log('Without image (text-only sign questions):', noImg.length);

// Check that image files actually exist
let exists = 0, missing = 0;
const missingFiles = [];
withImg.forEach(q => {
  const filePath = path.join(__dirname, '../public', q.imageUrl);
  if (fs.existsSync(filePath)) {
    exists++;
  } else {
    missing++;
    missingFiles.push(q.imageUrl);
  }
});
console.log('\nImage files exist:', exists);
console.log('Image files missing:', missing);
if (missingFiles.length > 0) {
  console.log('Missing:', missingFiles.join(', '));
}

// Quick validate: check all data looks good
const all = JSON.parse(fs.readFileSync(path.join(__dirname, '../public/data/questions-all.json'), 'utf8'));
console.log('\n=== Final Summary ===');
console.log('Total questions:', all.length);
console.log('Basics:', all.filter(q => q.source === 'basics').length);
console.log('Deepdive:', all.filter(q => q.source === 'deepdive').length);
console.log('Signs:', all.filter(q => q.source === 'signs').length);

// Check ID uniqueness
const ids = new Set();
let dupeIds = 0;
all.forEach(q => { if (ids.has(q.id)) dupeIds++; ids.add(q.id); });
console.log('Duplicate IDs:', dupeIds);
