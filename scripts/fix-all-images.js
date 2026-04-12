#!/usr/bin/env node
/**
 * Fix ALL image mappings across signs and deepdive questions.
 * This is the single source of truth for question-to-image mapping.
 * Run this after any data rebuild/sync.
 */

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'public', 'data', 'questions-all.json');
const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images', 'signs');

// ======== SIGNS MODULE FIXES (ID 701-743) ========
// These are the original signs questions with many incorrect image mappings
const signsImageFixes = {
  // #1 ID 701: stop sign - correct
  702: 'No-Turn-On-Red.webp',       // "EXCEPT RIGHT TURN红灯" was: right-turn.webp (curve sign, wrong!)
  // #3 ID 703: wrong way - correct
  // #4 ID 704: yield - correct
  705: 'no-parking.webp',           // "可以做什么?(禁停)" was: merging-traffic.jpg
  706: 'no-left-turn.jpg',          // "可以左转吗?(禁止左转)" was: added-lane.webp
  707: 'bicycle.jpg',               // "自行车标志(禁止自行车)" - bicycle.jpg shows bike warning, closest match
  708: 'Left-Turn-Yield-On-Green.webp', // "绿灯左转让行" was: Two-Way-Traffic-Ahead.png
  709: 'keep_right.webp',           // "保持右侧通行" was: right-turn.webp
  // 710: do_not_enter.png - correct
  711: 'NOTURNS.jpg',               // "禁止右转" was: signal-ahead.jpg
  // 712: No-Turn-On-Red.webp - correct
  // 713: NO-U-TURN.png - correct
  714: 'Right-Lane-Must-Turn-Right.jpg', // "红灯右转信号控制" - shows right turn lane control
  715: 'RIGHTTURNONLY.jpg',          // "右转ONLY标志" was: tow-way-traffic.jpg
  716: 'NOTURNS.jpg',               // "NO TURNS标志(禁止转弯)" was: KEEP-LEFT.png
  717: 'road-closed-ahead.webp',    // "ROAD CLOSED" was: right-turn.webp
  718: 'SLOWERTRAFFICKEEPRIGHT.jpg', // "慢车靠右" was: right-turn.webp
  719: 'Flagger-Ahead.jpg',         // "持旗人标志" was: winding-road-sign.webp
  720: 'Road-Work-Ahead.png',       // "ROAD WORK AHEAD" was: winding-road-sign.webp
  721: 'shool-bus-stop.png',        // "SCHOOL BUS STOP AHEAD" was: Direction-Arrow.webp
  722: 'road-closed-ahead.webp',    // "ROAD CLOSED AHEAD" was: t_intersection.webp
  723: 'shoulder-work-ahead.jpg',   // "SHOULDER WORK AHEAD" was: cross_road.png
  724: 'detour.png',                // "DETOUR标志" was: cross_road.png
  // 725: One-Lane-Road-Ahead.jpg - correct
  // 726: Thru-Traffic-Merge-Left.webp - correct
  // 727: lane-closed.png - correct
  728: 'no-passing-zone.webp',      // "NO PASSING ZONE" was: truck-rollover-reduce-speed.jpg
  729: 'merging-traffic.jpg',       // "并线(右侧并入)" was: Cross-Traffic-Ahead.gif
  730: 'added-lane.webp',           // "新增车道(无需并线)" was: Cross-Traffic-Ahead.gif
  731: 'traffic-signal-ahead.jpg',  // "三色灯警告牌" - actual traffic light warning sign
  732: 'slippery.jpg',              // "路面打滑" was: Narrow-Bridge.webp
  // 733: Two-Way-Traffic-Ahead.png - correct
  734: 'right-turn.webp',           // "直角右转" was: slide-area.gif
  // 735: t_intersection.webp - correct
  736: 'cross_road.png',            // "十字路口警告" was: bicycle.jpg
  // 737: lane_ends.png - correct
  // 738: Lane-Ends-Merge-Left.webp - correct
  // 739: truck-rollover-reduce-speed.jpg - correct
  740: 'Narrow-Bridge.webp',        // "窄桥/窄道" was: lane_ends.png
  741: 'bicycle.jpg',               // "自行车图标黄牌" was: Soft-Shoulder.webp
  // 742: loose-gravel.webp - correct
  // 743: pedestrian_crossing.jpg - correct
};

// ======== DEEPDIVE MODULE IMAGES (ID 435-741) ========
// Questions that say "this sign" but originally had no images
const deepdiveImages = {
  435: 'rail-road-crossroad.webp',  // Railroad crossing blue/white sign
  630: 'stop.jpg',                  // 4-way stop
  631: 'No-Turn-On-Red.webp',       // "EXCEPT RIGHT TURN" at red light
  635: 'YIELDTOUPHILLTRAFFIC.jpg',  // Narrow bridges / alternating flow
  636: 'divided-road-2-miles-ahead.png', // Divided highway
  637: 'no-parking.webp',           // No parking, may stop temporarily
  638: 'no-left-turn.jpg',          // Left turns on red prohibited
  639: 'no-left-turn.jpg',          // Left turns prohibited
  640: 'bicycle.jpg',               // Bicycles not allowed (closest available)
  641: 'Left-Turn-Yield-On-Green.webp', // On green, yield to oncoming
  642: 'keep_right.webp',           // Keep to right of divider
  643: 'D0NOTPASS.jpg',             // No passing allowed
  644: 'no-passing-zone.webp',      // Do not enter oncoming lane
  646: 'pedestrian-crossing.webp',  // No pedestrians
  647: 'NOTURNS.jpg',               // Right turns prohibited
  648: 'truck-rollover-reduce-speed.jpg', // Trucks prohibited
  649: 'No-Turn-On-Red.webp',       // No turns on red
  650: 'No-Turn-On-Red.webp',       // Right turns on red prohibited
  651: 'NO-U-TURN.png',             // U-turns prohibited
  652: 'Left-Turn-Yield-On-Green.webp', // Oncoming has extended green
  653: 'Left-and-U-Turn-Lanes-sign.jpg', // Split arrow
  654: 'Left-and-U-Turn-Lanes-sign.jpg', // Left-turn ONLY lane
  655: 'Right-Lane-Must-Turn-Right.jpg', // Straight or right lane sign
  656: 'Right-Lane-Must-Turn-Right.jpg', // Lane-use sign
  657: 'Right-Lane-Must-Turn-Right.jpg', // Right turns controlled by signal
  658: 'TWO-WAY-LEFTTUAN.webp',     // Center lane for left turns
  659: 'disabled.png',              // Disabled parking
  661: 'rail-road-crossroad.webp',  // Railroad crossbuck
  662: 'RIGHTTURNONLY.jpg',          // Right-turn ONLY
  663: 'bus-caprool-lane-ahead.png', // Diamond lane / carpool
  664: 'EMERGENCYPARKINGONLY.jpg',   // Stopping on shoulder
  666: 'SPEED-LIMIT-50.jpg',        // Minimum speed sign
  667: 'SPEED-LIMIT-50.jpg',        // Combined speed limit
  669: 'SLOWERTRAFFICKEEPRIGHT.jpg', // Slower traffic
  670: 'shool-bus-stop.png',        // "WHEN CHILDREN ARE PRESENT"
  676: 'shool-bus-stop.png',        // Yellow SCHOOL plaque
  677: 'Flagger-Ahead.jpg',         // Flagger symbol
  681: 'wokers.png',                // Worker with shovel
  682: 'shool-bus-stop.png',        // School speed limit advance warning
  683: 'shool-bus-stop.png',        // School bus with pedestrians
  689: 'SLOW-MOVING-VEHICLE.webp',  // Black-outlined SLOW sign
  705: 'merging-traffic.jpg',       // Merge sign
  706: 'added-lane.webp',           // Added lane joins
  707: 'divided-traffic-sign.jpg',  // Diverging arrows
  708: 'Two-Way-Traffic-Ahead.png', // Opposing arrows + median ends
  709: 'right-turn.webp',           // Right curve
  711: 'traffic-signal-ahead.jpg',  // Traffic signal ahead (3-color light)
  714: 'rode-narrows.webp',         // Right lane narrows
  715: 'tow-way-traffic.jpg',       // Two-way traffic
  716: 'KEEP-LEFT.png',             // Keep right/left of median
  717: 'right-turn.webp',           // Sharp 90° left turn
  718: 'right-turn.webp',           // Sharp 90° right turn
  719: 'winding-road-sign.webp',    // Left-then-right reverse curve
  720: 'winding-road-sign.webp',    // Right-then-left reverse curve
  721: 'Direction-Arrow.webp',      // Yellow right arrow panel
  722: 't_intersection.webp',       // T-intersection
  723: 'cross_road.png',            // Right side road
  724: 'cross_road.png',            // Crossroad warning
  728: 'truck-rollover-reduce-speed.jpg', // Truck rollover
  729: 'Cross-Traffic-Ahead.gif',   // Y-intersection
  730: 'Cross-Traffic-Ahead.gif',   // Roundabout warning
  731: 'lane_ends.png',             // Double-headed arrow
  732: 'Narrow-Bridge.webp',        // Narrow bridge/road
  734: 'slide-area.gif',            // Deer crossing
  736: 'bicycle.jpg',               // Bicycle warning
  740: 'lane_ends.png',             // Double down-arrow
  741: 'Soft-Shoulder.webp',        // Low/soft shoulder
};

// ======== APPLY FIXES ========
const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
let fixedSigns = 0;
let fixedDeepdive = 0;
let notFound = 0;

data.forEach(q => {
  let targetImg = null;
  
  if (q.source === 'signs' && signsImageFixes[q.id]) {
    targetImg = signsImageFixes[q.id];
    if (targetImg) fixedSigns++;
  } else if (q.source === 'deepdive' && deepdiveImages[q.id]) {
    targetImg = deepdiveImages[q.id];
    if (targetImg) fixedDeepdive++;
  }
  
  if (targetImg) {
    const imgPath = path.join(IMAGES_DIR, targetImg);
    if (fs.existsSync(imgPath)) {
      q.hasImage = true;
      q.imageUrl = '/images/signs/' + targetImg;
    } else {
      console.log(`❌ ID ${q.id}: Image not found: ${targetImg}`);
      notFound++;
    }
  }
});

// Write back
fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

// Also sync to data/questions-all.json
const dataCopy = path.join(__dirname, '..', 'data', 'questions-all.json');
if (fs.existsSync(path.dirname(dataCopy))) {
  fs.writeFileSync(dataCopy, JSON.stringify(data, null, 2));
}

console.log('\n--- 图片修复总结 ---');
console.log(`Signs 修复: ${fixedSigns} 题`);
console.log(`Deepdive 添加图片: ${fixedDeepdive} 题`);
console.log(`文件缺失: ${notFound}`);
console.log(`总有图题目: ${data.filter(q => q.hasImage).length}`);
console.log('✅ 已保存');
