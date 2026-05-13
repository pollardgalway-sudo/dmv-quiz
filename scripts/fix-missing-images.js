#!/usr/bin/env node
/**
 * fix-missing-images.js
 * 
 * Identifies questions that reference signs/images in their text
 * but have no image configured, and attempts to match them with
 * available sign images.
 */

const fs = require('fs');
const path = require('path');

const questionsPath = path.join(__dirname, '..', 'data', 'questions-all.json');
const imagesDir = path.join(__dirname, '..', 'public', 'images', 'signs');

// Load data
const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));
const availableImages = fs.readdirSync(imagesDir);

console.log(`Total questions: ${questions.length}`);
console.log(`Available sign images: ${availableImages.length}`);
console.log('');

// Patterns that suggest a question needs an image
const signPatterns = [
  /這個標誌/, /这个标志/, /這個.*標/, /这个.*标/,
  /這個.*牌/, /这个.*牌/, /這個.*號/, /这个.*号/,
  /this sign/i, /What does this/i, /does this.*sign/i,
];

// Find questions needing images
const needsImage = [];
const hasImage = [];

questions.forEach((q, idx) => {
  const qText = [
    q.question?.['zh-Hant'] || '',
    q.question?.['zh-Hans'] || '',
    q.question?.en || ''
  ].join(' ');
  
  const mentionsSign = signPatterns.some(p => p.test(qText));
  
  if (mentionsSign) {
    if (!q.hasImage || !q.imageUrl) {
      needsImage.push({ ...q, _idx: idx });
    } else {
      hasImage.push(q);
    }
  }
});

console.log(`Questions referencing signs WITH images: ${hasImage.length}`);
console.log(`Questions referencing signs WITHOUT images: ${needsImage.length}`);
console.log('');

// Manual mapping based on question content analysis
// Each key is the question ID, value is the image filename
const imageMapping = {
  // ID 632: 箭頭標誌要求你在紅燈時做什麼 (arrow sign at red light)
  // No exact match, but question text already describes content - can work without image
  
  // ID 646: 帶有行人圖案的黃色菱形標誌 (yellow diamond with pedestrian)
  646: '/images/signs/pedestrian-crossing.webp',
  
  // ID 653: 上分支箭頭標誌 (diverging arrow sign) - straight or left 
  // ID 654: 左轉 ONLY 車道標誌 (left turn only)
  654: '/images/signs/Left-and-U-Turn-Lanes-sign.jpg',
  
  // ID 655: 直行或右轉標誌 (straight or right sign)
  655: '/images/signs/RIGHTTURNONLY.jpg',

  // ID 656: 車道用途標誌 (lane use sign)
  
  // ID 657: 紅燈時右轉專用信號 (right turn signal on red)
  // ID 661: 交叉形鐵路標誌 (railroad crossbuck)
  661: '/images/signs/rail-road-corssroad.jpg',
  
  // ID 663: 菱形車道標誌 (diamond lane sign - HOV)
  663: '/images/signs/carpool-lane-entrance.png',
  
  // ID 664: 路肩停車標誌 (emergency stopping on shoulder)
  664: '/images/signs/EMERGENCYPARKINGONLY.jpg',
  
  // ID 666: 最小限速標誌 (minimum speed sign)
  666: '/images/signs/SPEED-LIMIT-50.jpg',

  // ID 670: WHEN CHILDREN ARE PRESENT 
  
  // ID 671: 校區限速牌在燈閃爍 (school speed when flashing)
  
  // ID 675: 豎牌提示斑馬線義務 (vertical sign about crosswalk duty)
  675: '/images/signs/TURNING-TRAFFIC-MUST-YIELD-TO-PEDESTRIANS.png',
  
  // ID 681: 工人剷土標誌 (worker with shovel sign)
  681: '/images/signs/wokers.png',
  
  // ID 682: 校區限速預告 (school speed limit ahead)
  
  // ID 683: 校車警告牌帶行人和箭頭 (school bus warning with pedestrian)
  683: '/images/signs/shool-bus-stop.png',
  
  // ID 689: 黑色八邊形寫 SLOW (octagon with SLOW)
  
  // ID 705: 併線標誌 (merge sign)
  705: '/images/signs/merging-traffic.jpg',
  
  // ID 707: 分流箭頭標誌 (diverge arrow sign)
  707: '/images/signs/divided-traffic-sign.jpg',
  
  // ID 709: 右彎標誌 (right curve sign)
  709: '/images/signs/right-turn.webp',
  
  // ID 710: 左彎標誌 (left curve sign)
  
  // ID 714: 右側收窄標誌 (road narrows on right)
  714: '/images/signs/rode-narrows.webp',
  
  // ID 716: 雙向繞行分隔物 (two-way traffic divider)
  716: '/images/signs/tow-way-traffic.jpg',
  
  // ID 717: 直角左轉標誌 (sharp left turn)
  
  // ID 719: 左後右連續彎道 (left then right curves)
  719: '/images/signs/winding-road-sign.webp',
  
  // ID 720: 先右後左連續彎道 (right then left curves)
  720: '/images/signs/winding-road-sign.webp',
  
  // ID 721: 黃色右箭頭長牌 (yellow right arrow plate)
  721: '/images/signs/Direction-Arrow.webp',
  
  // ID 723: 右側支路標誌 (right side road)
  723: '/images/signs/cross_road.png',
  
  // ID 730: 環島警告標誌 (roundabout warning)
  
  // ID 731: 雙頭箭頭標誌 (double-headed arrow)
  731: '/images/signs/Two-Way-Traffic-Ahead.png',
  
  // ID 734: 鹿躍標誌 (deer crossing)
  
  // ID 740: 雙色下箭頭牌 (two-color downward arrow)
  
  // ID 741: 低/軟路肩標誌 (soft shoulder)
  741: '/images/signs/Soft-Shoulder.webp',
};

// Apply mappings
let updated = 0;
let noMatch = [];

needsImage.forEach(q => {
  if (imageMapping[q.id]) {
    const imgPath = imageMapping[q.id];
    const imgFile = path.join(__dirname, '..', 'public', imgPath);
    
    // Verify the image file exists
    if (fs.existsSync(imgFile)) {
      questions[q._idx].hasImage = true;
      questions[q._idx].imageUrl = imgPath;
      updated++;
      console.log(`✅ ID ${q.id}: ${q.question?.['zh-Hant']?.substring(0, 30)} → ${imgPath}`);
    } else {
      console.log(`❌ ID ${q.id}: Image file not found: ${imgPath}`);
    }
  } else {
    noMatch.push({
      id: q.id,
      text: q.question?.['zh-Hant'] || q.question?.['zh-Hans'],
      en: q.question?.en
    });
  }
});

console.log('');
console.log(`Updated: ${updated} questions`);
console.log(`No match found: ${noMatch.length} questions`);
console.log('');

if (noMatch.length > 0) {
  console.log('=== Questions still without images (need manual review) ===');
  noMatch.forEach(q => {
    console.log(`  ID ${q.id}: ${q.text}`);
    console.log(`    EN: ${q.en}`);
  });
}

// Save updated questions
if (updated > 0) {
  // Backup
  const backupPath = questionsPath + '.backup-before-imagefix';
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(questionsPath, backupPath);
    console.log(`\nBackup saved to: ${backupPath}`);
  }
  
  fs.writeFileSync(questionsPath, JSON.stringify(questions, null, 2));
  console.log(`\nSaved ${updated} image updates to questions-all.json`);
}
