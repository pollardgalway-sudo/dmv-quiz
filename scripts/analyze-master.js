const fs = require('fs');
const path = require('path');

// Check data/questions-final-master.json structure
const fm = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/questions-final-master.json'), 'utf8'));
const fmq = Array.isArray(fm) ? fm : fm.questions || [];

// Check categories
const cats = {};
fmq.forEach(function(q) {
  var cat = q.category || 'unknown';
  if (!cats[cat]) cats[cat] = 0;
  cats[cat]++;
});
console.log('final-master categories (' + fmq.length + ' total):');
Object.keys(cats).sort().forEach(function(c) { console.log('  ' + c + ': ' + cats[c]); });

// Check answer format
var hasLetterAns = 0, hasNumAns = 0, hasObjOpts = 0, hasArrOpts = 0;
fmq.forEach(function(q) {
  if (typeof q.answer === 'string') hasLetterAns++;
  if (typeof q.correctAnswer === 'number') hasNumAns++;
  if (q.options && !Array.isArray(q.options)) hasObjOpts++;
  if (q.options && Array.isArray(q.options)) hasArrOpts++;
});
console.log('\nAnswer format: letter answers:', hasLetterAns, ', numeric correctAnswer:', hasNumAns);
console.log('Options format: object (A/B/C):', hasObjOpts, ', array:', hasArrOpts);

// Check sign images
var withSign = 0;
fmq.forEach(function(q) {
  if (q.signImage || q.image) withSign++;
});
console.log('Questions with sign/image:', withSign);

// Show ID ranges
var ids = fmq.map(function(q) { return q.id; }).sort(function(a,b) { return a-b; });
console.log('\nID range:', ids[0], '-', ids[ids.length-1]);

// Check for signs category
var signCats = fmq.filter(function(q) {
  return q.category && (q.category.toLowerCase().includes('sign') || q.category.toLowerCase().includes('signs'));
});
console.log('Sign-category questions:', signCats.length);

// Now check the data/questions-all.json (curated 272)
const src = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/questions-all.json'), 'utf8'));
const sq = Array.isArray(src) ? src : src.questions || [];
console.log('\n=== data/questions-all.json ===');
var srcCats = {};
sq.forEach(function(q) {
  var cat = q.category || 'unknown';
  if (!srcCats[cat]) srcCats[cat] = 0;
  srcCats[cat]++;
});
console.log('Categories (' + sq.length + ' total):');
Object.keys(srcCats).sort().forEach(function(c) { console.log('  ' + c + ': ' + srcCats[c]); });
