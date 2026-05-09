/**
 * Fix image-question mismatches and duplicate IDs
 */
const fs = require('fs');
const path = require('path');

const PUBLIC_DATA = path.join(__dirname, '..', 'public', 'data');
const DATA_DIR = path.join(__dirname, '..', 'data');

console.log('=== Image Fix Tool ===\n');

const allPath = path.join(PUBLIC_DATA, 'questions-all.json');
const all = JSON.parse(fs.readFileSync(allPath, 'utf8'));

// Backup
const backupPath = allPath + '.backup-before-image-fix';
fs.writeFileSync(backupPath, JSON.stringify(all, null, 2), 'utf8');
console.log('Backed up to:', path.basename(backupPath));

// ==========================================
// STEP 1: Fix deepdive image mismatches
// ==========================================
console.log('\n--- STEP 1: Fix image mismatches ---');

function findQ(id, source) {
  return all.find(q => q.id === id && (!source || q.source === source));
}

let fixCount = 0;

// id:640 - bicycle.jpg is a WARNING sign, but question says "bicycles not allowed"
// Fix: update question to match the warning sign
let q = findQ(640, 'deepdive');
if (q) {
  q.question = { en: 'What does this bicycle warning sign indicate?', 'zh-Hans': '这个自行车警告标志表示什么？', 'zh-Hant': '這個自行車警告標誌表示什麼？' };
  q.options = {
    A: { en: 'Bicycles may be crossing or traveling on the road ahead; watch for them', 'zh-Hans': '前方可能有自行车穿越或行驶；注意观察', 'zh-Hant': '前方可能有自行車穿越或行駛；注意觀察' },
    B: { en: 'Bicycle lane ahead; cars must stay out', 'zh-Hans': '前方有自行车道；汽车禁入', 'zh-Hant': '前方有自行車道；汽車禁入' },
    C: { en: 'Bicycles are not allowed on this road', 'zh-Hans': '这条路禁止自行车通行', 'zh-Hant': '這條路禁止自行車通行' }
  };
  q.answer = 'A';
  console.log('  [OK] id:640 - Updated to match bicycle WARNING sign');
  fixCount++;
}

// id:643 - DO NOT PASS sign but answer says "passing permitted" (wrong!)
q = findQ(643, 'deepdive');
if (q) {
  q.question = { en: 'What does this DO NOT PASS sign require?', 'zh-Hans': '这个 DO NOT PASS 标志要求什么？', 'zh-Hant': '這個 DO NOT PASS 標誌要求什麼？' };
  q.options = {
    A: { en: 'Do not pass other vehicles in this zone', 'zh-Hans': '在此区域内不得超车', 'zh-Hant': '在此區域內不得超車' },
    B: { en: 'Passing is permitted but only with caution when safe', 'zh-Hans': '允许超车，但仅在安全时谨慎超车', 'zh-Hant': '允許超車，但僅在安全時謹慎超車' },
    C: { en: 'Only trucks may not pass', 'zh-Hans': '仅卡车不得超车', 'zh-Hant': '僅卡車不得超車' }
  };
  q.answer = 'A';
  console.log('  [OK] id:643 - Fixed DO NOT PASS answer (was incorrectly "passing permitted")');
  fixCount++;
}

// id:648 - NO TURNS image used for "trucks prohibited" question
q = findQ(648, 'deepdive');
if (q) {
  q.question = { en: 'What does this NO TURNS sign prohibit?', 'zh-Hans': '这个 NO TURNS 标志禁止什么？', 'zh-Hant': '這個 NO TURNS 標誌禁止什麼？' };
  q.options = {
    A: { en: 'No left turns, right turns, or U-turns allowed', 'zh-Hans': '不允许左转、右转或掉头', 'zh-Hant': '不允許左轉、右轉或掉頭' },
    B: { en: 'No U-turns only', 'zh-Hans': '仅禁止掉头', 'zh-Hant': '僅禁止掉頭' },
    C: { en: 'No left turns only', 'zh-Hans': '仅禁止左转', 'zh-Hant': '僅禁止左轉' }
  };
  q.answer = 'A';
  console.log('  [OK] id:648 - Updated to match NO TURNS sign (was "trucks prohibited")');
  fixCount++;
}

// id:664 - merging-traffic.jpg (loop arrow) for shoulder/emergency question
q = findQ(664, 'deepdive');
if (q) {
  q.hasImage = false; q.imageUrl = null;
  console.log('  [OK] id:664 - Removed image (loop arrow != emergency stopping)');
  fixCount++;
}

// id:657 - right-turn.webp (curve warning) used for "right turn on red" question
q = findQ(657, 'deepdive');
if (q) {
  q.hasImage = false; q.imageUrl = null;
  console.log('  [OK] id:657 - Removed image (curve sign != traffic signal sign)');
  fixCount++;
}

// id:670 - SPEED LIMIT 50 sign used for school zone question
q = findQ(670, 'deepdive');
if (q) {
  q.hasImage = false; q.imageUrl = null;
  console.log('  [OK] id:670 - Removed image (speed limit 50 != school zone sign)');
  fixCount++;
}

// id:708 (deepdive) - Two-Way-Traffic-Ahead.png (text sign) for "opposing arrows + median"
q = findQ(708, 'deepdive');
if (q) {
  q.question = { en: 'What does this TWO WAY TRAFFIC AHEAD sign warn?', 'zh-Hans': '这个 TWO WAY TRAFFIC AHEAD 标志警告什么？', 'zh-Hant': '這個 TWO WAY TRAFFIC AHEAD 標誌警告什麼？' };
  q.options = {
    A: { en: 'Two-way traffic ahead; be prepared for oncoming vehicles', 'zh-Hans': '前方为双向交通；准备迎面来车', 'zh-Hant': '前方為雙向交通；準備迎面來車' },
    B: { en: 'Start of divided highway', 'zh-Hans': '分隔公路起点', 'zh-Hant': '分隔公路起點' },
    C: { en: 'Road closed ahead', 'zh-Hans': '前方道路关闭', 'zh-Hant': '前方道路關閉' }
  };
  q.answer = 'A';
  console.log('  [OK] id:708 (deepdive) - Updated to match TWO WAY TRAFFIC AHEAD text sign');
  fixCount++;
}

// id:729 (deepdive) - t_intersection.webp used for Y-intersection question
q = findQ(729, 'deepdive');
if (q) {
  q.question = { en: 'What does this T-intersection sign indicate?', 'zh-Hans': '这个T字路口标志表示什么？', 'zh-Hant': '這個T字路口標誌表示什麼？' };
  q.options = {
    A: { en: 'The road ahead ends; you must turn left or right', 'zh-Hans': '前方道路到头；必须左转或右转', 'zh-Hant': '前方道路到頭；必須左轉或右轉' },
    B: { en: 'Right turn only', 'zh-Hans': '仅限右转', 'zh-Hant': '僅限右轉' },
    C: { en: 'Roundabout ahead', 'zh-Hans': '前方环形交叉路口', 'zh-Hant': '前方環形交叉路口' }
  };
  q.answer = 'A';
  console.log('  [OK] id:729 (deepdive) - Updated to match T-intersection sign (was Y-intersection)');
  fixCount++;
}

// id:739 (deepdive) - rode-narrows.webp (ROAD NARROWS) for "road splits" question
q = findQ(739, 'deepdive');
if (q) {
  q.question = { en: 'What does this ROAD NARROWS sign warn?', 'zh-Hans': '这个 ROAD NARROWS 标志警告什么？', 'zh-Hant': '這個 ROAD NARROWS 標誌警告什麼？' };
  q.options = {
    A: { en: 'The road ahead becomes narrower; reduce speed and drive carefully', 'zh-Hans': '前方道路变窄；减速小心驾驶', 'zh-Hant': '前方道路變窄；減速小心駕駛' },
    B: { en: 'The road ahead splits into two separate directions', 'zh-Hans': '前方道路分为两个方向', 'zh-Hant': '前方道路分為兩個方向' },
    C: { en: 'A series of consecutive curves lies ahead', 'zh-Hans': '前方有连续弯道', 'zh-Hant': '前方有連續彎道' }
  };
  q.answer = 'A';
  console.log('  [OK] id:739 (deepdive) - Updated to match ROAD NARROWS sign (was "road splits")');
  fixCount++;
}

// id:734 (signs) - winding-road-sign.webp used for "right-angle right turn"
// The winding road sign is NOT a right-angle turn. Use right-turn.webp instead.
q = findQ(734, 'signs');
if (q) {
  q.imageUrl = '/images/signs/right-turn.webp';
  console.log('  [OK] id:734 (signs) - Changed image to right-turn.webp (was winding-road)');
  fixCount++;
}

console.log('  Fixed ' + fixCount + ' image issues');

// ==========================================
// STEP 2: Fix duplicate IDs
// ==========================================
console.log('\n--- STEP 2: Fix duplicate IDs ---');

let maxId = 0;
all.forEach(q => { if (q.id > maxId) maxId = q.id; });
console.log('  Current max ID:', maxId);

const idCount = {};
all.forEach(q => {
  if (!idCount[q.id]) idCount[q.id] = [];
  idCount[q.id].push(q);
});

let reassignCount = 0;
for (const [id, questions] of Object.entries(idCount)) {
  if (questions.length > 1) {
    for (let i = 1; i < questions.length; i++) {
      maxId++;
      const oldId = questions[i].id;
      questions[i].id = maxId;
      console.log('  [' + questions[i].source + '] id:' + oldId + ' -> id:' + maxId);
      reassignCount++;
    }
  }
}
console.log('  Reassigned ' + reassignCount + ' duplicate IDs');

// ==========================================
// STEP 3: Save all files
// ==========================================
console.log('\n--- STEP 3: Save ---');

fs.writeFileSync(allPath, JSON.stringify(all, null, 2), 'utf8');
console.log('[OK] public/data/questions-all.json (' + all.length + ' questions)');

const dataAllPath = path.join(DATA_DIR, 'questions-all.json');
if (fs.existsSync(dataAllPath)) {
  fs.writeFileSync(dataAllPath, JSON.stringify(all, null, 2), 'utf8');
  console.log('[OK] data/questions-all.json');
}

['basics', 'deepdive', 'signs'].forEach(src => {
  const filtered = all.filter(q => q.source === src);
  const p = path.join(PUBLIC_DATA, 'questions-' + src + '.json');
  fs.writeFileSync(p, JSON.stringify(filtered, null, 2), 'utf8');
  console.log('[OK] questions-' + src + '.json (' + filtered.length + ')');
});

// ==========================================
// STEP 4: Verify
// ==========================================
console.log('\n--- STEP 4: Verify ---');

const finalIds = {};
let dupes = 0;
all.forEach(q => {
  if (finalIds[q.id]) { dupes++; console.log('  WARNING: duplicate id ' + q.id); }
  finalIds[q.id] = true;
});
if (dupes === 0) console.log('  [OK] No duplicate IDs');

const imgQ = all.filter(q => q.hasImage && q.imageUrl);
console.log('  Image questions: ' + imgQ.length);

let missing = 0;
imgQ.forEach(q => {
  const imgPath = path.join(__dirname, '..', 'public', q.imageUrl);
  if (!fs.existsSync(imgPath)) {
    missing++;
    console.log('  WARNING: missing image ' + q.imageUrl + ' (id:' + q.id + ')');
  }
});
if (missing === 0) console.log('  [OK] All image files exist');

console.log('\nDone!');
