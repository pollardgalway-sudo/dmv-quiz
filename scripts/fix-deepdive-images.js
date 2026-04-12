#!/usr/bin/env node
/**
 * Fix deepdive questions that reference signs/images but lack hasImage and imageUrl.
 * Maps each question to the correct sign image from /public/images/signs/.
 */

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'public', 'data', 'questions-all.json');
const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images', 'signs');

// Available images
const availableImages = fs.readdirSync(IMAGES_DIR);
console.log('Available sign images:', availableImages.length);

// Manual mapping: deepdive question ID -> image filename
// Each mapping verified against actual question text + answer options
const imageMapping = {
  // 435: "blue and white sign at railroad crossings" - emergency contact info sign
  435: 'rail-road-crossroad.webp',
  // 630: "4-way stop with this sign" - stop sign
  630: 'stop.jpg',
  // 631: "EXCEPT RIGHT TURN sign at red light" - no turn on red variant
  631: 'No-Turn-On-Red.webp',
  // 635: "narrow bridges or alternating flow" - yield to uphill traffic
  635: 'YIELDTOUPHILLTRAFFIC.jpg',
  // 636: "divided highway with a median" - divided road sign
  636: 'divided-road-2-miles-ahead.png',
  // 637: "No parking; may stop temporarily" - no parking sign
  637: 'no-parking.webp',
  // 638: "Left turns on red are prohibited" - no left turn
  638: 'no-left-turn.jpg',
  // 639: "Left turns are prohibited at all times" - no left turn
  639: 'no-left-turn.jpg',
  // 640: "Bicycles are not allowed" - no bicycles
  640: 'BIKE-LANE.jpg',
  // 641: "On green, yield to oncoming traffic" - left turn yield on green
  641: 'Left-Turn-Yield-On-Green.webp',
  // 642: "Keep to the right of divider" - keep right
  642: 'keep_right.webp',
  // 643: "No passing allowed" - do not pass
  643: 'D0NOTPASS.jpg',
  // 644: "Do not enter the oncoming lane to pass" - no passing zone
  644: 'no-passing-zone.webp',
  // 646: "No pedestrians may enter or cross" - pedestrian crossing
  646: 'pedestrian-crossing.webp',
  // 647: "Right turns are prohibited" - no turns
  647: 'NOTURNS.jpg',
  // 648: "Trucks are prohibited" - truck restriction (use truck rollover as closest)
  648: 'truck-rollover-reduce-speed.jpg',
  // 649: "No turns are allowed on red" - no turn on red
  649: 'No-Turn-On-Red.webp',
  // 650: "Right turns on red are prohibited" - no turn on red
  650: 'No-Turn-On-Red.webp',
  // 651: "U-turns are prohibited" - no U-turn
  651: 'NO-U-TURN.png',
  // 652: "Oncoming traffic may have extended green; yield" - left turn yield on green
  652: 'Left-Turn-Yield-On-Green.webp',
  // 653: "Split arrow - straight or turn left" - left and U-turn lanes
  653: 'Left-and-U-Turn-Lanes-sign.jpg',
  // 654: "Left-turn ONLY lane" - left and U-turn lanes
  654: 'Left-and-U-Turn-Lanes-sign.jpg',
  // 655: "Straight or turning right" - right turn arrow
  655: 'Right-Turn-Arrow-ONLY.png',
  // 656: "Left lane must turn left; right lane straight/left" - right lane must turn
  656: 'Right-Lane-Must-Turn-Right.jpg',
  // 657: "Right turns controlled by dedicated signal" - right turn only
  657: 'Right-Turn-Arrow-ONLY.png',
  // 658: "Center lane for left turns only from either direction" - two way left turn
  658: 'TWO-WAY-LEFTTUAN.webp',
  // 659: "Reserved for disabled parking" - disabled parking
  659: 'disabled.png',
  // 661: "Railroad crossing; treat as yield" - railroad crossbuck
  661: 'rail-road-crossroad.webp',
  // 662: "Right-turn ONLY; no through movement" - right turn only
  662: 'RIGHTTURNONLY.jpg',
  // 663: "Diamond lane / carpool" - bus carpool lane ahead
  663: 'bus-caprool-lane-ahead.png',
  // 664: "Stopping on shoulder" - emergency parking only
  664: 'EMERGENCYPARKINGONLY.jpg',
  // 666: "Minimum speed sign" - speed limit
  666: 'SPEED-LIMIT-50.jpg',
  // 667: "Combined speed limit" - speed limit
  667: 'SPEED-LIMIT-50.jpg',
  // 669: "Slower traffic" - slower traffic keep right
  669: 'SLOWERTRAFFICKEEPRIGHT.jpg',
  // 670: "WHEN CHILDREN ARE PRESENT" - school bus stop
  670: 'shool-bus-stop.png',
  // 676: "Yellow SCHOOL plaque" - school bus stop
  676: 'shool-bus-stop.png',
  // 677: "Flagger symbol" - flagger ahead
  677: 'Flagger-Ahead.jpg',
  // 681: "Worker with shovel" - workers sign
  681: 'wokers.png',
  // 682: "School speed limit advance warning" - school bus stop
  682: 'shool-bus-stop.png',
  // 683: "School bus with pedestrians and arrow" - school bus stop
  683: 'shool-bus-stop.png',
  // 689: "Black-outlined SLOW sign" - slow moving vehicle
  689: 'SLOW-MOVING-VEHICLE.webp',
  // 705: "Merge sign - right lane merges into yours" - merging traffic
  705: 'merging-traffic.jpg',
  // 706: "Added lane joins; no merge conflicts" - added lane
  706: 'added-lane.webp',
  // 707: "Diverging arrows - traffic splits" - divided traffic
  707: 'divided-traffic-sign.jpg',
  // 708: "Opposing arrows + median ends - two-way traffic" - two way traffic ahead
  708: 'Two-Way-Traffic-Ahead.png',
  // 709: "Right curve ahead" - right turn/curve
  709: 'right-turn.webp',
  // 711: "Traffic signal ahead" - signal ahead
  711: 'signal-ahead.jpg',
  // 714: "Right lane narrows" - road narrows
  714: 'rode-narrows.webp',
  // 715: "Two-way traffic" - two way traffic
  715: 'tow-way-traffic.jpg',
  // 716: "Keep right/left of median" - keep left
  716: 'KEEP-LEFT.png',
  // 717: "Sharp 90° left turn" - right turn curve
  717: 'right-turn.webp',
  // 718: "Sharp 90° right turn" - right turn curve
  718: 'right-turn.webp',
  // 719: "Left then right reverse curve" - winding road
  719: 'winding-road-sign.webp',
  // 720: "Right then left reverse curve" - winding road
  720: 'winding-road-sign.webp',
  // 721: "Yellow right arrow panel" - direction arrow
  721: 'Direction-Arrow.webp',
  // 722: "T-intersection" - T intersection
  722: 't_intersection.webp',
  // 723: "Right side road enters" - cross road
  723: 'cross_road.png',
  // 724: "Crossroad warning - 4-way intersection" - cross road
  724: 'cross_road.png',
  // 728: "Truck rollover warning" - truck rollover
  728: 'truck-rollover-reduce-speed.jpg',
  // 729: "Y-intersection - road splits" - cross traffic ahead
  729: 'Cross-Traffic-Ahead.gif',
  // 730: "Roundabout warning" - cross traffic ahead (closest available)
  730: 'Cross-Traffic-Ahead.gif',
  // 731: "Double-headed arrow - must turn left or right" - lane ends
  731: 'lane_ends.png',
  // 732: "Narrow bridge/road" - narrow bridge
  732: 'Narrow-Bridge.webp',
  // 734: "Deer crossing" - slide area (wildlife warning, closest match)
  734: 'slide-area.gif',
  // 736: "Bicycle warning" - bicycle
  736: 'bicycle.jpg',
  // 740: "Double down-arrow" - lane ends
  740: 'lane_ends.png',
  // 741: "Low/soft shoulder" - soft shoulder
  741: 'Soft-Shoulder.webp',
};

// Load data
const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

let updated = 0;
let notFound = 0;

data.forEach(q => {
  if (imageMapping[q.id]) {
    const imgFile = imageMapping[q.id];
    const imgPath = path.join(IMAGES_DIR, imgFile);
    
    if (fs.existsSync(imgPath)) {
      q.hasImage = true;
      q.imageUrl = '/images/signs/' + imgFile;
      updated++;
      console.log(`✅ ID ${q.id}: ${imgFile}`);
    } else {
      console.log(`❌ ID ${q.id}: Image not found: ${imgFile}`);
      notFound++;
    }
  }
});

console.log(`\n--- Summary ---`);
console.log(`Updated: ${updated}`);
console.log(`Image not found: ${notFound}`);
console.log(`Total questions with images now: ${data.filter(q => q.hasImage).length}`);
console.log(`  - signs source: ${data.filter(q => q.hasImage && q.source === 'signs').length}`);
console.log(`  - deepdive source: ${data.filter(q => q.hasImage && q.source === 'deepdive').length}`);

// Write back
fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
console.log('\n✅ Saved to', DATA_FILE);
