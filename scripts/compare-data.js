const fs = require('fs');
const path = require('path');

const pub = JSON.parse(fs.readFileSync(path.join(__dirname, '../public/data/questions-all.json'), 'utf8'));
const src = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/questions-all.json'), 'utf8'));
const pq = Array.isArray(pub) ? pub : pub.questions || [];
const sq = Array.isArray(src) ? src : src.questions || [];

// Build maps
const pubMap = {};
pq.forEach(function(q) { pubMap[q.id] = q; });
const srcMap = {};
sq.forEach(function(q) { srcMap[q.id] = q; });

// Compare
let matched = 0, mismatch = 0, pubOnly = 0, srcOnly = 0;
const mismatchSamples = [];

Object.keys(srcMap).forEach(function(id) {
  if (pubMap[id]) {
    const srcEn = srcMap[id].question && srcMap[id].question.en ? srcMap[id].question.en : '';
    const pubEn = pubMap[id].question && pubMap[id].question.en ? pubMap[id].question.en : '';
    if (srcEn === pubEn) {
      matched++;
    } else {
      mismatch++;
      if (mismatchSamples.length < 5) {
        mismatchSamples.push({
          id: id,
          src: srcEn.substring(0, 100),
          pub: pubEn.substring(0, 100)
        });
      }
    }
  } else {
    srcOnly++;
  }
});

Object.keys(pubMap).forEach(function(id) {
  if (!srcMap[id]) pubOnly++;
});

console.log('=== Data Comparison ===');
console.log('data/questions-all.json:', sq.length, 'questions');
console.log('public/data/questions-all.json:', pq.length, 'questions');
console.log('');
console.log('Same ID, same question text:', matched);
console.log('Same ID, DIFFERENT question text:', mismatch);
console.log('Only in data/ (not in public/):', srcOnly);
console.log('Only in public/ (not in data/):', pubOnly);

if (mismatchSamples.length > 0) {
  console.log('\nMismatch samples:');
  mismatchSamples.forEach(function(s) {
    console.log('  ID ' + s.id);
    console.log('    data/: ' + s.src);
    console.log('    public/: ' + s.pub);
  });
}

// Also check: how many of the public questions come from other source files?
const basics = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/questions-basics.json'), 'utf8'));
const deepdive = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/questions-deepdive.json'), 'utf8'));
const signs = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/questions-signs.json'), 'utf8'));

const bq = Array.isArray(basics) ? basics : basics.questions || [];
const ddq = Array.isArray(deepdive) ? deepdive : (deepdive.questions || []);
const sgq = Array.isArray(signs) ? signs : signs.questions || [];

console.log('\n=== Source file counts ===');
console.log('data/questions-basics.json:', bq.length);
console.log('data/questions-deepdive.json:', ddq.length);
console.log('data/questions-signs.json:', sgq.length);
console.log('Total from separate files:', bq.length + ddq.length + sgq.length);

// Check public separate files
const pubBasics = JSON.parse(fs.readFileSync(path.join(__dirname, '../public/data/questions-basics.json'), 'utf8'));
const pubDeep = JSON.parse(fs.readFileSync(path.join(__dirname, '../public/data/questions-deepdive.json'), 'utf8'));
const pubSigns = JSON.parse(fs.readFileSync(path.join(__dirname, '../public/data/questions-signs.json'), 'utf8'));

const pbq = Array.isArray(pubBasics) ? pubBasics : pubBasics.questions || [];
const pddq = Array.isArray(pubDeep) ? pubDeep : pubDeep.questions || [];
const psgq = Array.isArray(pubSigns) ? pubSigns : pubSigns.questions || [];

console.log('\npublic/data/questions-basics.json:', pbq.length);
console.log('public/data/questions-deepdive.json:', pddq.length);
console.log('public/data/questions-signs.json:', psgq.length);
console.log('Total from separate public files:', pbq.length + pddq.length + psgq.length);
