#!/usr/bin/env node
/**
 * fix-questions-no-image.js
 * 
 * For questions that reference "this sign" but have no matching image,
 * rewrite the question text to be descriptive so they don't need an image.
 */

const fs = require('fs');
const path = require('path');

const questionsPath = path.join(__dirname, '..', 'data', 'questions-all.json');
const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));

// Questions to rewrite - changing "this sign" to descriptive text
const rewrites = {
  // ID 97: freeway lane markings - not really a sign question, just mentions "lines"
  // Already descriptive enough, leave as is
  
  // ID 632: 箭頭標誌要求你在紅燈時做什麼
  632: {
    en: "At a red light, what does a right-turn arrow sign allow you to do?",
    'zh-Hans': "在红灯时，右转箭头标志允许你做什么？",
    'zh-Hant': "在紅燈時，右轉箭頭標誌允許你做什麼？"
  },
  
  // ID 653: 上分支箭頭標誌 (split arrow)
  653: {
    en: "What does a straight-or-left split arrow sign indicate?",
    'zh-Hans': "直行或左转的分支箭头标志表示什么？",
    'zh-Hant': "直行或左轉的分支箭頭標誌表示什麼？"
  },
  
  // ID 656: 車道用途標誌
  656: {
    en: "What does a multi-lane directional sign (showing left-turn-only and straight-or-left lanes) indicate?",
    'zh-Hans': "多车道方向标志（显示左转专用和直行或左转车道）说明什么？",
    'zh-Hant': "多車道方向標誌（顯示左轉專用和直行或左轉車道）說明什麼？"
  },
  
  // ID 657: 紅燈時右轉信號
  657: {
    en: "What does a 'RIGHT TURN SIGNAL' sign mean for turning right on red?",
    'zh-Hans': "「RIGHT TURN SIGNAL」（右转专用信号）标志对红灯右转有何规定？",
    'zh-Hant': "「RIGHT TURN SIGNAL」（右轉專用訊號）標誌對紅燈右轉有何規定？"
  },
  
  // ID 667: 組合限速牌
  667: {
    en: "What does a combined speed limit sign showing 'SPEED LIMIT 55' and 'MINIMUM SPEED 45' indicate?",
    'zh-Hans': "组合限速牌上写着「SPEED LIMIT 55」和「MINIMUM SPEED 45」表示什么？",
    'zh-Hant': "組合限速牌上寫著「SPEED LIMIT 55」和「MINIMUM SPEED 45」表示什麼？"
  },
  
  // ID 670: WHEN CHILDREN ARE PRESENT - already descriptive
  670: {
    en: "What does a 'WHEN CHILDREN ARE PRESENT' speed limit sign mean?",
    'zh-Hans': "「WHEN CHILDREN ARE PRESENT」（有儿童在场时）限速标志是什么意思？",
    'zh-Hant': "「WHEN CHILDREN ARE PRESENT」（有兒童在場時）限速標誌是什麼意思？"
  },
  
  // ID 671: 校區限速牌在燈閃爍
  671: {
    en: "When the lights flash on a 'SCHOOL SPEED LIMIT 20' sign, what is required?",
    'zh-Hans': "当「SCHOOL SPEED LIMIT 20」校区限速标志的灯闪烁时，要求什么？",
    'zh-Hant': "當「SCHOOL SPEED LIMIT 20」校區限速標誌的燈閃爍時，要求什麼？"
  },
  
  // ID 682: 校區限速預告
  682: {
    en: "What does a 'SCHOOL SPEED LIMIT AHEAD' advance warning sign tell you?",
    'zh-Hans': "「SCHOOL SPEED LIMIT AHEAD」校区限速预告标志告诉你什么？",
    'zh-Hant': "「SCHOOL SPEED LIMIT AHEAD」校區限速預告標誌告訴你什麼？"
  },
  
  // ID 689: 黑色八邊形寫 SLOW
  689: {
    en: "What does a black-outlined octagonal 'SLOW' sign mean?",
    'zh-Hans': "黑框八边形「SLOW」（慢行）标志表示什么？",
    'zh-Hant': "黑框八邊形「SLOW」（慢行）標誌表示什麼？"
  },
  
  // ID 710: 左彎標誌
  710: {
    en: "What should you do when you see a left curve warning sign?",
    'zh-Hans': "看到左弯警告标志时你应该怎么做？",
    'zh-Hant': "看到左彎警告標誌時你應該怎麼做？"
  },
  
  // ID 717: 直角左轉
  717: {
    en: "What does a sharp left turn (right-angle curve) warning sign warn about?",
    'zh-Hans': "直角左转（急弯）警告标志警告什么？",
    'zh-Hant': "直角左轉（急彎）警告標誌警告什麼？"
  },
  
  // ID 730: 環島警告標誌
  730: {
    en: "What does a roundabout (traffic circle) warning sign require?",
    'zh-Hans': "环岛（环形交叉路口）警告标志要求什么？",
    'zh-Hant': "環島（環形交叉路口）警告標誌要求什麼？"
  },
  
  // ID 734: 鹿躍標誌
  734: {
    en: "What does a deer crossing warning sign mean?",
    'zh-Hans': "鹿穿越警告标志意味着什么？",
    'zh-Hant': "鹿穿越警告標誌意味著什麼？"
  },
  
  // ID 740: 雙色下箭頭牌
  740: {
    en: "What does a two-tone (red and white) downward-pointing arrow sign indicate?",
    'zh-Hans': "红白双色下指箭头牌表示什么？",
    'zh-Hant': "紅白雙色下指箭頭牌表示什麼？"
  },
};

let updated = 0;
questions.forEach((q, idx) => {
  if (rewrites[q.id]) {
    const newText = rewrites[q.id];
    questions[idx].question = { ...q.question, ...newText };
    // Make sure hasImage is false and imageUrl is null for these
    questions[idx].hasImage = false;
    questions[idx].imageUrl = null;
    updated++;
    console.log(`✅ ID ${q.id}: Rewritten question text`);
    console.log(`   OLD: ${q.question?.['zh-Hant']}`);
    console.log(`   NEW: ${newText['zh-Hant']}`);
    console.log('');
  }
});

console.log(`\nTotal rewritten: ${updated} questions`);

// Save
fs.writeFileSync(questionsPath, JSON.stringify(questions, null, 2));
console.log(`Saved to questions-all.json`);
