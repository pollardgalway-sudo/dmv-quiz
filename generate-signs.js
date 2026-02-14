const fs = require('fs');

// Sign definitions with better distractor options
const signs = [
    // 引导与休闲标志 (15)
    { file: "airport.webp", en: "Airport ahead", zh: "机场", wrong1: { en: "Bus station", zh: "汽车站" }, wrong2: { en: "Train station", zh: "火车站" } },
    { file: "bike route.jpg", en: "Bike route", zh: "自行车路线", wrong1: { en: "No bicycles", zh: "禁止自行车" }, wrong2: { en: "Pedestrian path", zh: "人行道" } },
    { file: "camping sign.gif", en: "Camping area", zh: "露营区", wrong1: { en: "Picnic area", zh: "野餐区" }, wrong2: { en: "Rest area", zh: "休息区" } },
    { file: "carpool lane entrance.png", en: "Carpool lane entrance", zh: "拼车道入口", wrong1: { en: "Exit only", zh: "仅出口" }, wrong2: { en: "Bus lane", zh: "公交车道" } },
    { file: "disabled.png", en: "Disabled parking", zh: "残疾人停车", wrong1: { en: "No parking", zh: "禁止停车" }, wrong2: { en: "Reserved parking", zh: "预留停车位" } },
    { file: "divided road 2 miles ahead.png", en: "Divided road ahead", zh: "前方分隔道路", wrong1: { en: "Road ends", zh: "道路终止" }, wrong2: { en: "Merge ahead", zh: "前方合流" } },
    { file: "electric vehicle charging station.jpg", en: "EV charging station", zh: "电动车充电站", wrong1: { en: "Gas station", zh: "加油站" }, wrong2: { en: "Service area", zh: "服务区" } },
    { file: "emergency call 911 .webp", en: "Emergency call 911", zh: "紧急呼叫911", wrong1: { en: "Information center", zh: "信息中心" }, wrong2: { en: "Police station", zh: "警察局" } },
    { file: "exit.jpg", en: "Highway exit", zh: "高速出口", wrong1: { en: "Entrance only", zh: "仅入口" }, wrong2: { en: "Rest area", zh: "休息区" } },
    { file: "hospital.gif", en: "Hospital nearby", zh: "附近有医院", wrong1: { en: "First aid station", zh: "急救站" }, wrong2: { en: "Pharmacy", zh: "药店" } },
    { file: "next services 23 miles.png", en: "Next services distance", zh: "下一服务区距离", wrong1: { en: "Speed limit", zh: "限速" }, wrong2: { en: "Exit number", zh: "出口编号" } },
    { file: "park and ride.jpg", en: "Park and ride", zh: "停车换乘", wrong1: { en: "No parking", zh: "禁止停车" }, wrong2: { en: "Paid parking", zh: "付费停车" } },
    { file: "rest area 1 mile.png", en: "Rest area ahead", zh: "前方休息区", wrong1: { en: "Exit ahead", zh: "前方出口" }, wrong2: { en: "Food services", zh: "餐饮服务" } },
    { file: "telephone.gif", en: "Telephone available", zh: "可用电话", wrong1: { en: "No cell phones", zh: "禁止手机" }, wrong2: { en: "Information", zh: "信息" } },
    { file: "trolley.jpg", en: "Trolley crossing", zh: "有轨电车", wrong1: { en: "Railroad crossing", zh: "铁路道口" }, wrong2: { en: "Bus stop", zh: "公交站" } },
    // 禁令标志 (34)
    { file: "BIKE LANE.jpg", en: "Bike lane only", zh: "自行车专用道", wrong1: { en: "No bicycles", zh: "禁止自行车" }, wrong2: { en: "Shared lane", zh: "共享车道" } },
    { file: "bus caprool lane ahead.png", en: "Bus/carpool lane ahead", zh: "公交/拼车道", wrong1: { en: "Regular traffic lane", zh: "普通车道" }, wrong2: { en: "Exit lane", zh: "出口车道" } },
    { file: "CARPOOL VIOLATION .png", en: "Carpool violation fine", zh: "拼车违规罚款", wrong1: { en: "Toll road", zh: "收费公路" }, wrong2: { en: "Speed limit", zh: "限速" } },
    { file: "D0NOTPASS.jpg", en: "Do not pass", zh: "禁止超车", wrong1: { en: "Passing allowed", zh: "允许超车" }, wrong2: { en: "Keep right", zh: "靠右行驶" } },
    { file: "do_not_enter.png", en: "Do not enter", zh: "禁止驶入", wrong1: { en: "One way", zh: "单行道" }, wrong2: { en: "Exit only", zh: "仅出口" } },
    { file: "EMERGENCYPARKINGONLY.jpg", en: "Emergency parking only", zh: "仅限紧急停车", wrong1: { en: "No parking", zh: "禁止停车" }, wrong2: { en: "Parking allowed", zh: "允许停车" } },
    { file: "KEEP LEFT.png", en: "Keep left", zh: "靠左行驶", wrong1: { en: "Keep right", zh: "靠右行驶" }, wrong2: { en: "Turn left only", zh: "仅左转" } },
    { file: "keep_right.webp", en: "Keep right", zh: "靠右行驶", wrong1: { en: "Keep left", zh: "靠左行驶" }, wrong2: { en: "Turn right only", zh: "仅右转" } },
    { file: "Left & U-Turn Lanes sign.jpg", en: "Left and U-turn lanes", zh: "左转和掉头车道", wrong1: { en: "No left turn", zh: "禁止左转" }, wrong2: { en: "Right turn only", zh: "仅右转" } },
    { file: "Left Turn Yield On Green.webp", en: "Left turn yield on green", zh: "绿灯左转让行", wrong1: { en: "Protected left turn", zh: "保护左转" }, wrong2: { en: "No left turn", zh: "禁止左转" } },
    { file: "no left turn.jpg", en: "No left turn", zh: "禁止左转", wrong1: { en: "Left turn only", zh: "仅左转" }, wrong2: { en: "U-turn allowed", zh: "允许掉头" } },
    { file: "no parking any time.png", en: "No parking any time", zh: "任何时间禁止停车", wrong1: { en: "Limited parking", zh: "限时停车" }, wrong2: { en: "Parking allowed", zh: "允许停车" } },
    { file: "no parking.webp", en: "No parking", zh: "禁止停车", wrong1: { en: "No stopping", zh: "禁止停留" }, wrong2: { en: "Parking allowed", zh: "允许停车" } },
    { file: "No Turn On Red.webp", en: "No turn on red", zh: "红灯禁止转弯", wrong1: { en: "Right turn on red allowed", zh: "红灯可右转" }, wrong2: { en: "Stop on red", zh: "红灯停车" } },
    { file: "NO U-TURN.png", en: "No U-turn", zh: "禁止掉头", wrong1: { en: "U-turn allowed", zh: "允许掉头" }, wrong2: { en: "No left turn", zh: "禁止左转" } },
    { file: "NOTURNS.jpg", en: "No turns", zh: "禁止转弯", wrong1: { en: "Right turn only", zh: "仅右转" }, wrong2: { en: "Left turn only", zh: "仅左转" } },
    { file: "PUSHBUTTON FOR.png", en: "Push button to cross", zh: "按钮过街", wrong1: { en: "No crossing", zh: "禁止穿越" }, wrong2: { en: "Crosswalk ahead", zh: "前方人行横道" } },
    { file: "rail road crossroad.webp", en: "Railroad crossing", zh: "铁路道口", wrong1: { en: "Road intersection", zh: "道路交叉口" }, wrong2: { en: "Pedestrian crossing", zh: "人行横道" } },
    { file: "Right Lane Must Turn Right.jpg", en: "Right lane must turn right", zh: "右车道必须右转", wrong1: { en: "Right turn optional", zh: "可选右转" }, wrong2: { en: "Straight only", zh: "仅直行" } },
    { file: "RIGHT LANEMUSTEXIT.png", en: "Right lane must exit", zh: "右车道必须出口", wrong1: { en: "Optional exit", zh: "可选出口" }, wrong2: { en: "Merge right", zh: "向右合并" } },
    { file: "Right Turn Arrow ONLY.png", en: "Right turn only", zh: "仅可右转", wrong1: { en: "No right turn", zh: "禁止右转" }, wrong2: { en: "Straight or right", zh: "直行或右转" } },
    { file: "RIGHTTURNONLY.jpg", en: "Right turn only", zh: "仅可右转", wrong1: { en: "Left turn only", zh: "仅左转" }, wrong2: { en: "No turns", zh: "禁止转弯" } },
    { file: "slower traffic use turnouts.png", en: "Slower traffic use turnouts", zh: "慢车使用让车道", wrong1: { en: "No slow vehicles", zh: "禁止慢车" }, wrong2: { en: "Keep speed", zh: "保持速度" } },
    { file: "SLOWERTRAFFICKEEPRIGHT.jpg", en: "Slower traffic keep right", zh: "慢车靠右", wrong1: { en: "Fast lane right", zh: "快车道在右" }, wrong2: { en: "All traffic keep right", zh: "所有车辆靠右" } },
    { file: "SPEED LIMIT 50.jpg", en: "Speed limit 50", zh: "限速50", wrong1: { en: "Minimum speed 50", zh: "最低速度50" }, wrong2: { en: "Advisory speed 50", zh: "建议速度50" } },
    { file: "stop.jpg", en: "Stop", zh: "停车", wrong1: { en: "Yield", zh: "让行" }, wrong2: { en: "Slow down", zh: "减速" } },
    { file: "STRAIGHT NO U-TURN.jpg", en: "Straight only, no U-turn", zh: "直行禁止掉头", wrong1: { en: "U-turn allowed", zh: "允许掉头" }, wrong2: { en: "Turn right", zh: "右转" } },
    { file: "TURNING TRAFFIC MUST YIELD TO PEDESTRIANS.png", en: "Turning traffic yield to pedestrians", zh: "转弯车辆让行人", wrong1: { en: "Pedestrians yield", zh: "行人让行" }, wrong2: { en: "No pedestrians", zh: "禁止行人" } },
    { file: "TURNOUT14 MILE.png", en: "Turnout ahead", zh: "前方让车道", wrong1: { en: "Exit ahead", zh: "前方出口" }, wrong2: { en: "Rest area", zh: "休息区" } },
    { file: "TWO WAY LEFTTUAN.webp", en: "Two-way left turn lane", zh: "双向左转车道", wrong1: { en: "Left turn only", zh: "仅左转" }, wrong2: { en: "No left turn", zh: "禁止左转" } },
    { file: "Two Way Traffic Ahead.png", en: "Two-way traffic ahead", zh: "前方双向交通", wrong1: { en: "One-way traffic", zh: "单向交通" }, wrong2: { en: "Divided highway", zh: "分隔公路" } },
    { file: "wrong_way.jpg", en: "Wrong way", zh: "逆行", wrong1: { en: "One way", zh: "单行道" }, wrong2: { en: "Do not enter", zh: "禁止驶入" } },
    { file: "yield.webp", en: "Yield", zh: "让行", wrong1: { en: "Stop", zh: "停车" }, wrong2: { en: "Merge", zh: "合流" } },
    { file: "YIELDTOUPHILLTRAFFIC.jpg", en: "Yield to uphill traffic", zh: "让上坡车辆先行", wrong1: { en: "Uphill traffic yields", zh: "上坡车辆让行" }, wrong2: { en: "No passing on hill", zh: "坡道禁止超车" } },
    // 警告标志 (35)
    { file: "4 tracks.jpg", en: "4 railroad tracks", zh: "4条铁轨", wrong1: { en: "Railroad crossing", zh: "铁路道口" }, wrong2: { en: "Train station ahead", zh: "前方火车站" } },
    { file: "added lane.webp", en: "Added lane", zh: "增加车道", wrong1: { en: "Lane ends", zh: "车道结束" }, wrong2: { en: "Merge required", zh: "必须合流" } },
    { file: "bicycle.jpg", en: "Bicycle crossing", zh: "自行车穿越", wrong1: { en: "No bicycles", zh: "禁止自行车" }, wrong2: { en: "Bike lane", zh: "自行车道" } },
    { file: "Cross Traffic Ahead.gif", en: "Cross traffic ahead", zh: "前方有横向交通", wrong1: { en: "No cross traffic", zh: "无横向交通" }, wrong2: { en: "Merge ahead", zh: "前方合流" } },
    { file: "cross_road.png", en: "Crossroad ahead", zh: "前方十字路口", wrong1: { en: "T-intersection", zh: "T型路口" }, wrong2: { en: "Y-intersection", zh: "Y型路口" } },
    { file: "Direction Arrow.webp", en: "Sharp turn ahead", zh: "前方急转弯", wrong1: { en: "Curve ahead", zh: "前方弯道" }, wrong2: { en: "Road ends", zh: "道路终止" } },
    { file: "divided traffic sign.jpg", en: "Divided highway begins", zh: "分隔公路开始", wrong1: { en: "Divided highway ends", zh: "分隔公路结束" }, wrong2: { en: "Two-way traffic", zh: "双向交通" } },
    { file: "end freeway12 mi.jpg", en: "Freeway ends ahead", zh: "高速公路即将结束", wrong1: { en: "Freeway entrance", zh: "高速入口" }, wrong2: { en: "Exit ahead", zh: "前方出口" } },
    { file: "flooded.jpg", en: "Road may flood", zh: "道路可能积水", wrong1: { en: "Bridge ahead", zh: "前方桥梁" }, wrong2: { en: "River crossing", zh: "过河" } },
    { file: "hill.jpg", en: "Steep hill ahead", zh: "前方陡坡", wrong1: { en: "Slippery road", zh: "路面湿滑" }, wrong2: { en: "Rough road", zh: "路面不平" } },
    { file: "Lane Ends Merge Left.webp", en: "Lane ends merge left", zh: "车道结束向左合并", wrong1: { en: "Merge right", zh: "向右合并" }, wrong2: { en: "Added lane", zh: "增加车道" } },
    { file: "lane_ends.png", en: "Lane ends", zh: "车道结束", wrong1: { en: "Lane begins", zh: "车道开始" }, wrong2: { en: "Road narrows", zh: "道路变窄" } },
    { file: "merging traffic.jpg", en: "Merging traffic", zh: "合流交通", wrong1: { en: "Divided highway", zh: "分隔公路" }, wrong2: { en: "Two-way traffic", zh: "双向交通" } },
    { file: "Narrow Bridge.webp", en: "Narrow bridge", zh: "窄桥", wrong1: { en: "Bridge out", zh: "桥梁关闭" }, wrong2: { en: "Weight limit", zh: "限重" } },
    { file: "no passing zone.webp", en: "No passing zone", zh: "禁止超车区", wrong1: { en: "Passing allowed", zh: "允许超车" }, wrong2: { en: "Slow vehicle lane", zh: "慢车道" } },
    { file: "Pavement Ends.jpg", en: "Pavement ends", zh: "路面终止", wrong1: { en: "Road closed", zh: "道路关闭" }, wrong2: { en: "Rough road", zh: "路面不平" } },
    { file: "pedestrian crossing.webp", en: "Pedestrian crossing", zh: "人行横道", wrong1: { en: "School zone", zh: "学校区域" }, wrong2: { en: "No pedestrians", zh: "禁止行人" } },
    { file: "pedestrian_crossing.jpg", en: "Pedestrian crossing", zh: "人行横道", wrong1: { en: "Crosswalk ahead", zh: "前方人行横道" }, wrong2: { en: "School crossing", zh: "学校穿越点" } },
    { file: "rail road corssroad.jpg", en: "Railroad crossing", zh: "铁路道口", wrong1: { en: "Road intersection", zh: "道路交叉口" }, wrong2: { en: "Train station", zh: "火车站" } },
    { file: "right turn.webp", en: "Right curve ahead", zh: "前方右弯", wrong1: { en: "Right turn only", zh: "仅右转" }, wrong2: { en: "Keep right", zh: "靠右行驶" } },
    { file: "rode narrows.webp", en: "Road narrows", zh: "道路变窄", wrong1: { en: "Lane ends", zh: "车道结束" }, wrong2: { en: "Narrow bridge", zh: "窄桥" } },
    { file: "rough road.jpg", en: "Rough road", zh: "路面不平", wrong1: { en: "Slippery road", zh: "路面湿滑" }, wrong2: { en: "Speed bump", zh: "减速带" } },
    { file: "shool bus stop.png", en: "School bus stop ahead", zh: "前方校车站", wrong1: { en: "Bus stop", zh: "公交站" }, wrong2: { en: "School zone", zh: "学校区域" } },
    { file: "signal ahead.jpg", en: "Signal ahead", zh: "前方有信号灯", wrong1: { en: "Stop sign ahead", zh: "前方停车标志" }, wrong2: { en: "Intersection ahead", zh: "前方路口" } },
    { file: "slide area.gif", en: "Slide area", zh: "滑坡区域", wrong1: { en: "Falling rocks", zh: "落石" }, wrong2: { en: "Steep grade", zh: "陡坡" } },
    { file: "slippery.jpg", en: "Slippery when wet", zh: "湿滑路面", wrong1: { en: "Ice warning", zh: "结冰警告" }, wrong2: { en: "Rough road", zh: "路面不平" } },
    { file: "Soft Shoulder.webp", en: "Soft shoulder", zh: "松软路肩", wrong1: { en: "No shoulder", zh: "无路肩" }, wrong2: { en: "Narrow shoulder", zh: "窄路肩" } },
    { file: "STOP AHEAD.jpg", en: "Stop ahead", zh: "前方停车", wrong1: { en: "Yield ahead", zh: "前方让行" }, wrong2: { en: "Signal ahead", zh: "前方信号灯" } },
    { file: "Thru Traffic Merge Left.webp", en: "Thru traffic merge left", zh: "直行车辆向左合并", wrong1: { en: "Exit right", zh: "右侧出口" }, wrong2: { en: "Keep right", zh: "靠右行驶" } },
    { file: "tow way traffic.jpg", en: "Two-way traffic", zh: "双向交通", wrong1: { en: "One-way traffic", zh: "单向交通" }, wrong2: { en: "Divided highway", zh: "分隔公路" } },
    { file: "traffic signal ahead.jpg", en: "Traffic signal ahead", zh: "前方交通信号灯", wrong1: { en: "Stop sign ahead", zh: "前方停车标志" }, wrong2: { en: "Yield ahead", zh: "前方让行" } },
    { file: "truck rollover reduce speed.jpg", en: "Truck rollover warning", zh: "卡车翻车警告减速", wrong1: { en: "Truck route", zh: "卡车路线" }, wrong2: { en: "No trucks", zh: "禁止卡车" } },
    { file: "t_intersection.webp", en: "T-intersection ahead", zh: "前方T型路口", wrong1: { en: "Crossroad", zh: "十字路口" }, wrong2: { en: "Y-intersection", zh: "Y型路口" } },
    { file: "winding road sign.webp", en: "Winding road", zh: "弯曲道路", wrong1: { en: "Sharp curve", zh: "急转弯" }, wrong2: { en: "Slippery road", zh: "湿滑路面" } },
    { file: "YIELD AHEAD.webp", en: "Yield ahead", zh: "前方让行", wrong1: { en: "Stop ahead", zh: "前方停车" }, wrong2: { en: "Merge ahead", zh: "前方合流" } },
    // 道路施工标志 (14)
    { file: "detour.png", en: "Detour", zh: "绕行", wrong1: { en: "Road closed", zh: "道路关闭" }, wrong2: { en: "Exit ahead", zh: "前方出口" } },
    { file: "Flagger Ahead .jpg", en: "Flagger ahead", zh: "前方有旗手", wrong1: { en: "Stop ahead", zh: "前方停车" }, wrong2: { en: "Workers ahead", zh: "前方有工人" } },
    { file: "lane closed.png", en: "Lane closed", zh: "车道关闭", wrong1: { en: "Road closed", zh: "道路关闭" }, wrong2: { en: "Merge ahead", zh: "前方合流" } },
    { file: "loose gravel.webp", en: "Loose gravel", zh: "松散碎石", wrong1: { en: "Rough road", zh: "路面不平" }, wrong2: { en: "Slippery road", zh: "湿滑路面" } },
    { file: "no shoulder.jpg", en: "No shoulder", zh: "无路肩", wrong1: { en: "Soft shoulder", zh: "松软路肩" }, wrong2: { en: "Narrow shoulder", zh: "窄路肩" } },
    { file: "One Lane Road Ahead.jpg", en: "One lane road ahead", zh: "前方单车道", wrong1: { en: "Road narrows", zh: "道路变窄" }, wrong2: { en: "Lane ends", zh: "车道结束" } },
    { file: "ramp closed.png", en: "Ramp closed", zh: "匝道关闭", wrong1: { en: "Exit closed", zh: "出口关闭" }, wrong2: { en: "Detour ahead", zh: "前方绕行" } },
    { file: "road closed ahead.webp", en: "Road closed ahead", zh: "前方道路关闭", wrong1: { en: "Detour", zh: "绕行" }, wrong2: { en: "Road work", zh: "道路施工" } },
    { file: "Road Work Ahead.png", en: "Road work ahead", zh: "前方道路施工", wrong1: { en: "Road closed", zh: "道路关闭" }, wrong2: { en: "Detour", zh: "绕行" } },
    { file: "road work next 5 miles.jpg", en: "Road work next 5 miles", zh: "接下来5英里有施工", wrong1: { en: "Speed limit 5 miles", zh: "限速5英里" }, wrong2: { en: "Exit in 5 miles", zh: "5英里后出口" } },
    { file: "shoulder work ahead.jpg", en: "Shoulder work ahead", zh: "前方路肩施工", wrong1: { en: "No shoulder", zh: "无路肩" }, wrong2: { en: "Road work", zh: "道路施工" } },
    { file: "SLOW MOVING VEHICLE.webp", en: "Slow moving vehicle", zh: "慢速车辆", wrong1: { en: "Farm vehicle", zh: "农用车辆" }, wrong2: { en: "Truck ahead", zh: "前方有卡车" } },
    { file: "use next exit.png", en: "Use next exit", zh: "使用下一出口", wrong1: { en: "Exit closed", zh: "出口关闭" }, wrong2: { en: "Detour", zh: "绕行" } },
    { file: "wokers .png", en: "Workers ahead", zh: "前方有工人", wrong1: { en: "Road work", zh: "道路施工" }, wrong2: { en: "Flagger ahead", zh: "前方旗手" } }
];

// Shuffle array function
function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

const questions = signs.map((sign, i) => {
    // Randomize option order
    const options = shuffle([
        { key: 'correct', en: sign.en, zh: sign.zh },
        { key: 'wrong1', en: sign.wrong1.en, zh: sign.wrong1.zh },
        { key: 'wrong2', en: sign.wrong2.en, zh: sign.wrong2.zh }
    ]);

    const correctIndex = options.findIndex(o => o.key === 'correct');
    const answer = ['A', 'B', 'C'][correctIndex];

    return {
        id: 6001 + i,
        category: "Traffic Signs",
        question: {
            en: "What does this sign mean?",
            "zh-Hans": "这个标志是什么意思？",
            "zh-Hant": "這個標誌是什麼意思？"
        },
        options: {
            A: { en: options[0].en, "zh-Hans": options[0].zh, "zh-Hant": options[0].zh },
            B: { en: options[1].en, "zh-Hans": options[1].zh, "zh-Hant": options[1].zh },
            C: { en: options[2].en, "zh-Hans": options[2].zh, "zh-Hant": options[2].zh }
        },
        answer: answer,
        explanation: {
            en: `This sign indicates: ${sign.en}`,
            "zh-Hans": `此标志表示：${sign.zh}`,
            "zh-Hant": `此標誌表示：${sign.zh}`
        },
        hasImage: true,
        imageUrl: `/images/signs/${sign.file}`,
        dmv_ref: { page: "2-19", section: "Traffic Signs", "analysis_zh-Hans": sign.zh, "analysis_zh-Hant": sign.zh }
    };
});

fs.writeFileSync('public/data/questions-signs.json', JSON.stringify(questions, null, 2), 'utf8');
console.log(`Generated ${questions.length} questions with meaningful options!`);
