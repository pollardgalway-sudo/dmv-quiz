var fs = require('fs');
var path = require('path');

var filePath = path.join(__dirname, '..', 'data', 'questions-all.json');
var backupPath = path.join(__dirname, '..', 'data', 'questions-all.json.backup-before-cleanup');
var raw = fs.readFileSync(filePath, 'utf8');
var questions = JSON.parse(raw);

console.log('Total questions before cleanup:', questions.length);

var removed = [];
var kept = [];

// CDL keywords that indicate CDL-only content
var cdlKeywords = ['cdl', 'air brake', 'shipping paper', 'daily log', 'eld record', 
  'coupling', 'fifth wheel', 'kingpin', 'glad hands', 'spring brake', 
  'tractor-trailer', 'pre-trip inspection'];

questions.forEach(function(q) {
  var text = JSON.stringify(q).toLowerCase();
  var qEn = (q.question && q.question.en) ? q.question.en : '';
  var qEnLower = qEn.toLowerCase();
  var options = q.options || {};
  var optionKeys = Object.keys(options);
  var answer = q.answer;
  var id = q.id;
  var removeReason = null;

  // 1. CDL-specific questions
  var hasCdlKeyword = cdlKeywords.some(function(kw) { return text.includes(kw); });
  var isTruckSpecific = qEnLower.includes('truck driver') || 
    qEnLower.includes('runaway truck') ||
    (qEnLower.includes('low clearance') && qEnLower.includes('truck'));
  var isWeighStation = qEnLower.includes('weigh station');
  var isHazmat = qEnLower.includes('hazmat') || qEnLower.includes('hazardous material');
  
  if (hasCdlKeyword || isTruckSpecific || isWeighStation || isHazmat) {
    // Keep BAC questions that just mention commercial in explanation
    var isBacQuestion = qEnLower.includes('bac') || qEnLower.includes('blood alcohol');
    if (!isBacQuestion) {
      removeReason = 'CDL-specific content';
    }
  }

  // 2. Missing answer
  if (!answer) {
    removeReason = 'Missing answer';
  }

  // 3. Answer not in options
  if (answer && optionKeys.length > 0 && optionKeys.indexOf(answer) === -1) {
    removeReason = 'Answer "' + answer + '" not in options [' + optionKeys.join(',') + ']';
  }

  // 4. Empty question
  if (!qEn && !(q.question && q.question['zh-Hans'])) {
    removeReason = 'Empty question text';
  }

  // 5. Too few options
  if (optionKeys.length < 2) {
    removeReason = 'Too few options (' + optionKeys.length + ')';
  }

  // 6. Check for empty options
  var hasEmptyOption = false;
  optionKeys.forEach(function(key) {
    var opt = options[key];
    if (!opt || (!opt.en && !opt['zh-Hans'] && typeof opt !== 'string')) {
      hasEmptyOption = true;
    }
  });
  if (hasEmptyOption) {
    removeReason = 'Has empty option(s)';
  }

  if (removeReason) {
    removed.push({ id: id, reason: removeReason, question: qEn.substring(0, 120) });
  } else {
    kept.push(q);
  }
});

// Check for duplicates among kept questions
var dupCheck = {};
var dupsRemoved = [];
var finalKept = [];

kept.forEach(function(q) {
  var key = (q.question && q.question.en) ? q.question.en.toLowerCase().trim() : '';
  if (key && dupCheck[key]) {
    dupsRemoved.push({ id: q.id, reason: 'Duplicate of ID ' + dupCheck[key], question: q.question.en.substring(0, 120) });
  } else {
    if (key) dupCheck[key] = q.id;
    finalKept.push(q);
  }
});

// Re-index IDs
finalKept.forEach(function(q, idx) {
  q.id = idx + 1;
});

console.log('\n=== REMOVED QUESTIONS ===');
removed.concat(dupsRemoved).forEach(function(r) {
  console.log('  ID ' + r.id + ' [' + r.reason + ']: ' + r.question);
});

console.log('\nTotal removed:', removed.length + dupsRemoved.length);
console.log('  - CDL/truck-specific:', removed.filter(function(r){ return r.reason.includes('CDL'); }).length);
console.log('  - Duplicates:', dupsRemoved.length);
console.log('  - Other issues:', removed.filter(function(r){ return !r.reason.includes('CDL'); }).length);
console.log('Total remaining:', finalKept.length);

// Backup original
fs.writeFileSync(backupPath, raw, 'utf8');
console.log('\nBackup saved to:', backupPath);

// Write cleaned file
fs.writeFileSync(filePath, JSON.stringify(finalKept, null, 2), 'utf8');
console.log('Cleaned file saved to:', filePath);

// Also update public/data if it exists
var publicPath = path.join(__dirname, '..', 'public', 'data', 'questions-all.json');
if (fs.existsSync(path.dirname(publicPath))) {
  fs.writeFileSync(publicPath, JSON.stringify(finalKept, null, 2), 'utf8');
  console.log('Public copy updated:', publicPath);
}
