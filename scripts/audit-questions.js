const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/questions-all.json'), 'utf8'));
const questions = Array.isArray(data) ? data : data.questions || [];

const issues = [];
const cdlOnlyKeywords = ['cdl', 'air brake', 'shipping paper', 'daily log', 'eld record', 'coupling', 'fifth wheel', 'kingpin', 'glad hands', 'spring brake', 'tractor-trailer'];

questions.forEach((q, idx) => {
  const text = JSON.stringify(q).toLowerCase();
  const id = q.id;
  const qEn = q.question && q.question.en ? q.question.en : '';
  const qZh = q.question && q.question['zh-Hans'] ? q.question['zh-Hans'] : '';
  const correctIdx = q.correctAnswer;
  const options = q.options || [];

  // 1. CDL-specific questions
  const matchedCdl = cdlOnlyKeywords.filter(function(kw) { return text.includes(kw); });
  const isTruckSpecific = qEn.toLowerCase().includes('truck driver') || 
    qEn.toLowerCase().includes('runaway truck') ||
    qEn.toLowerCase().includes('low clearance') && qEn.toLowerCase().includes('truck');
  const mentionsWeighStation = qEn.toLowerCase().includes('weigh station');
  
  if (matchedCdl.length > 0 || isTruckSpecific || mentionsWeighStation) {
    issues.push({ id: id, type: 'CDL', question: qEn, keywords: matchedCdl.concat(isTruckSpecific ? ['truck-specific'] : []).concat(mentionsWeighStation ? ['weigh station'] : []) });
  }

  // 2. Missing correct answer
  if (correctIdx === undefined || correctIdx === null) {
    issues.push({ id: id, type: 'NO_ANSWER', question: qEn });
  }

  // 3. correctAnswer out of range
  if (correctIdx !== undefined && correctIdx !== null && (correctIdx < 0 || correctIdx >= options.length)) {
    issues.push({ id: id, type: 'ANSWER_OUT_OF_RANGE', question: qEn, correctIdx: correctIdx, optionsLen: options.length });
  }

  // 4. Empty question text
  if (!qEn && !qZh) {
    issues.push({ id: id, type: 'EMPTY_QUESTION' });
  }

  // 5. Too few options
  if (!options || options.length < 2) {
    issues.push({ id: id, type: 'FEW_OPTIONS', question: qEn, optionsLen: options ? options.length : 0 });
  }

  // 6. Empty option text
  options.forEach(function(opt, oi) {
    var optEn = (opt && opt.en) ? opt.en : '';
    var optZh = (opt && opt['zh-Hans']) ? opt['zh-Hans'] : '';
    if (!optEn && !optZh) {
      issues.push({ id: id, type: 'EMPTY_OPTION', question: qEn, optionIndex: oi });
    }
  });

  // 7. Duplicate options
  var optTexts = options.map(function(o) { return (o && o.en ? o.en : '').toLowerCase().trim(); });
  var seen = {};
  var hasDupes = false;
  optTexts.forEach(function(t) {
    if (t && seen[t]) hasDupes = true;
    seen[t] = true;
  });
  if (hasDupes) {
    issues.push({ id: id, type: 'DUPLICATE_OPTIONS', question: qEn, options: optTexts });
  }

  // 8. Missing explanation
  var hasExplanation = (q.explanation && (q.explanation.en || q.explanation['zh-Hans'])) || q.analysis_en;
  if (!hasExplanation) {
    issues.push({ id: id, type: 'NO_EXPLANATION', question: qEn });
  }
  
  // 9. Check that correct answer option is not empty
  if (correctIdx !== undefined && correctIdx !== null && options[correctIdx]) {
    var correctOpt = options[correctIdx];
    var correctEn = (correctOpt && correctOpt.en) ? correctOpt.en : '';
    if (!correctEn) {
      issues.push({ id: id, type: 'EMPTY_CORRECT_ANSWER', question: qEn });
    }
  }
});

// 10. Duplicate questions by English text
var qTextMap = {};
questions.forEach(function(q) {
  var key = (q.question && q.question.en ? q.question.en : '').toLowerCase().trim();
  if (key) {
    if (qTextMap[key] !== undefined) {
      issues.push({ id: q.id, type: 'DUPLICATE_QUESTION', question: q.question.en, duplicateOf: qTextMap[key] });
    } else {
      qTextMap[key] = q.id;
    }
  }
});

// 11. Check for very similar questions (by first 50 chars)
var shortMap = {};
questions.forEach(function(q) {
  var key = (q.question && q.question.en ? q.question.en : '').toLowerCase().trim().substring(0, 50);
  if (key.length > 20) {
    if (!shortMap[key]) shortMap[key] = [];
    shortMap[key].push({ id: q.id, full: q.question.en });
  }
});
Object.keys(shortMap).forEach(function(key) {
  if (shortMap[key].length > 1) {
    issues.push({ 
      id: shortMap[key].map(function(x){return x.id;}).join(','), 
      type: 'SIMILAR_QUESTIONS', 
      question: shortMap[key].map(function(x){return 'ID ' + x.id + ': ' + x.full;}).join(' | ')
    });
  }
});

console.log('=== AUDIT RESULTS ===');
console.log('Total questions:', questions.length);
console.log('Total issues found:', issues.length);
console.log('');

// Group by type
var grouped = {};
issues.forEach(function(i) {
  if (!grouped[i.type]) grouped[i.type] = [];
  grouped[i.type].push(i);
});

Object.keys(grouped).sort().forEach(function(type) {
  var items = grouped[type];
  console.log('--- ' + type + ' (' + items.length + ') ---');
  items.forEach(function(i) {
    console.log('  ID ' + i.id + ': ' + (i.question || '(empty)').substring(0, 150));
    if (i.keywords) console.log('    Keywords: ' + i.keywords.join(', '));
    if (i.duplicateOf !== undefined) console.log('    Duplicate of ID: ' + i.duplicateOf);
    if (i.options) console.log('    Options: ' + JSON.stringify(i.options));
    if (i.correctIdx !== undefined) console.log('    correctAnswer=' + i.correctIdx + ' but only ' + i.optionsLen + ' options');
  });
  console.log('');
});
