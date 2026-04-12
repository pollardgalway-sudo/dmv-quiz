/**
 * rebuild-scraped-only.js
 * 
 * 只使用爬取的 743 道题目重建 public/data/
 * 不包含原始 269 题
 */

const fs = require('fs');
const path = require('path');

const SIGNS_DIR = path.join(__dirname, '../public/images/signs');
const PUBLIC_DATA = path.join(__dirname, '../public/data');
const DATA_DIR = path.join(__dirname, '../data');

// ============ S2T CONVERSION ============
const wordReplacements = [
  ['制造','製造'],['制作','製作'],['制成','製成'],['制品','製品'],
  ['里面','裡面'],['心里','心裡'],['这里','這裡'],['那里','那裡'],
  ['哪里','哪裡'],['家里','家裡'],['车里','車裡'],
  ['系安全带','繫安全帶'],['系好','繫好'],['系上','繫上'],
  ['头发','頭髮'],['理发','理髮'],
  ['后方','後方'],['后面','後面'],['后车','後車'],['后座','後座'],
  ['后退','後退'],['后视镜','後視鏡'],['以后','以後'],['之后','之後'],
  ['然后','然後'],['最后','最後'],['前后','前後'],['后果','後果'],
  ['后轮','後輪'],['后门','後門'],['后备','後備'],['后排','後排'],
  ['后侧','後側'],['落后','落後'],['向后','向後'],
  ['这个','這個'],['这种','這種'],['这样','這樣'],['这是','這是'],
  ['这些','這些'],['这意味','這意味'],['这条','這條'],
  ['这辆','這輛'],['这时','這時'],['这类','這類'],['这表','這表'],
  ['干燥','乾燥'],['干净','乾淨'],
];
const s2t = {
  '与':'與','万':'萬','专':'專','业':'業','个':'個','丰':'豐','临':'臨','为':'為',
  '举':'舉','义':'義','乐':'樂','习':'習','书':'書','买':'買','乱':'亂','争':'爭',
  '于':'於','亏':'虧','云':'雲','亚':'亞','产':'產','亲':'親','仅':'僅',
  '从':'從','仓':'倉','仪':'儀','们':'們','价':'價','众':'眾','优':'優','会':'會',
  '伞':'傘','传':'傳','伤':'傷','伦':'倫','体':'體','余':'餘','侧':'側',
  '债':'債','储':'儲','儿':'兒','关':'關','兴':'興','养':'養',
  '内':'內','冲':'沖','决':'決','况':'況','冻':'凍','净':'淨','减':'減','几':'幾',
  '击':'擊','划':'劃','创':'創','办':'辦','务':'務','动':'動','励':'勵','劝':'勸',
  '势':'勢','区':'區','医':'醫','华':'華','单':'單','卖':'賣','卫':'衛','厅':'廳',
  '历':'歷','压':'壓','发':'發','变':'變','号':'號','叶':'葉',
  '听':'聽','吗':'嗎','启':'啟','员':'員','响':'響','喷':'噴','园':'園',
  '围':'圍','图':'圖','国':'國','场':'場','坏':'壞','块':'塊','坚':'堅',
  '处':'處','备':'備','复':'復','够':'夠','头':'頭','夹':'夾','夺':'奪','奋':'奮',
  '奖':'獎','妇':'婦','妈':'媽','孙':'孫','学':'學','宝':'寶',
  '实':'實','审':'審','宪':'憲','宫':'宮','对':'對','导':'導','寻':'尋',
  '将':'將','尘':'塵','层':'層','岁':'歲','岗':'崗','币':'幣','师':'師',
  '带':'帶','帮':'幫','广':'廣','庆':'慶','库':'庫','应':'應','废':'廢','开':'開',
  '异':'異','弃':'棄','张':'張','弯':'彎','强':'強','归':'歸','当':'當','录':'錄',
  '彻':'徹','忆':'憶','态':'態','怀':'懷','惊':'驚','惨':'慘','惩':'懲','惯':'慣',
  '愿':'願','戏':'戲','战':'戰','户':'戶','执':'執','扩':'擴','扫':'掃',
  '扬':'揚','扰':'擾','抢':'搶','护':'護','报':'報','担':'擔','拥':'擁',
  '择':'擇','据':'據','拨':'撥','挂':'掛','挡':'擋','挤':'擠','挥':'揮','损':'損',
  '换':'換','摆':'擺','摇':'搖','数':'數','断':'斷','无':'無','旧':'舊',
  '时':'時','显':'顯','暂':'暫','术':'術','机':'機','杂':'雜','权':'權','条':'條',
  '来':'來','极':'極','构':'構','松':'鬆','柜':'櫃','标':'標','栏':'欄','树':'樹',
  '样':'樣','桥':'橋','梦':'夢','检':'檢','楼':'樓','欢':'歡','残':'殘','毁':'毀',
  '毕':'畢','气':'氣','汇':'匯','汉':'漢','汤':'湯','沟':'溝','没':'沒','测':'測',
  '浏':'瀏','济':'濟','涂':'塗','润':'潤','灭':'滅','灯':'燈','灵':'靈','灾':'災',
  '炼':'煉','烂':'爛','烟':'煙','热':'熱','爱':'愛','牵':'牽','独':'獨','猪':'豬',
  '献':'獻','环':'環','现':'現','电':'電','画':'畫','疗':'療','盐':'鹽','监':'監',
  '盖':'蓋','盘':'盤','码':'碼','础':'礎','确':'確','礼':'禮','祸':'禍','离':'離',
  '种':'種','积':'積','称':'稱','稳':'穩','穷':'窮','竞':'競','笔':'筆','签':'簽',
  '简':'簡','粮':'糧','纠':'糾','红':'紅','约':'約','级':'級','纪':'紀','纯':'純',
  '纲':'綱','纳':'納','纵':'縱','纷':'紛','纸':'紙','纹':'紋','线':'線','练':'練',
  '组':'組','细':'細','终':'終','绍':'紹','经':'經','结':'結','绕':'繞','绘':'繪',
  '给':'給','络':'絡','统':'統','继':'繼','绩':'績','绪':'緒','续':'續','绳':'繩',
  '维':'維','综':'綜','缓':'緩','编':'編','缘':'緣','缩':'縮','网':'網','罚':'罰',
  '罢':'罷','职':'職','联':'聯','肠':'腸','肤':'膚','肿':'腫','胀':'脹','胆':'膽',
  '脉':'脈','脏':'髒','脑':'腦','脚':'腳','脱':'脫','艺':'藝','节':'節','范':'範',
  '获':'獲','蓝':'藍','虑':'慮','虚':'虛','虫':'蟲','补':'補','装':'裝','观':'觀',
  '规':'規','觉':'覺','览':'覽','触':'觸','计':'計','订':'訂','认':'認','讨':'討',
  '让':'讓','训':'訓','议':'議','讯':'訊','记':'記','讲':'講','许':'許','论':'論',
  '设':'設','访':'訪','证':'證','评':'評','识':'識','诊':'診','词':'詞','译':'譯',
  '试':'試','话':'話','该':'該','详':'詳','语':'語','误':'誤','说':'說','请':'請',
  '读':'讀','课':'課','调':'調','谁':'誰','谈':'談','谢':'謝','谨':'謹','质':'質',
  '贝':'貝','财':'財','责':'責','败':'敗','货':'貨','购':'購','贴':'貼','贷':'貸',
  '贸':'貿','费':'費','赔':'賠','赛':'賽','赢':'贏','跃':'躍','车':'車','转':'轉',
  '轮':'輪','软':'軟','轰':'轟','轻':'輕','载':'載','较':'較','辅':'輔','辆':'輛',
  '辈':'輩','辉':'輝','输':'輸','辑':'輯','辖':'轄','边':'邊','达':'達','迁':'遷',
  '过':'過','运':'運','进':'進','远':'遠','违':'違','连':'連','迟':'遲','选':'選',
  '适':'適','递':'遞','遗':'遺','邮':'郵','邻':'鄰','释':'釋','钉':'釘','钟':'鐘',
  '钢':'鋼','钥':'鑰','钱':'錢','铁':'鐵','铃':'鈴','铜':'銅','银':'銀','铺':'鋪',
  '链':'鏈','销':'銷','锁':'鎖','锅':'鍋','错':'錯','键':'鍵','镇':'鎮','镜':'鏡',
  '长':'長','门':'門','闪':'閃','闭':'閉','问':'問','闲':'閒','间':'間','闷':'悶',
  '闹':'鬧','阅':'閱','阔':'闊','阳':'陽','阴':'陰','阵':'陣','阶':'階',
  '际':'際','陆':'陸','险':'險','随':'隨','隐':'隱','难':'難','雾':'霧','静':'靜',
  '页':'頁','顶':'頂','项':'項','顺':'順','须':'須','顾':'顧','顿':'頓',
  '预':'預','领':'領','频':'頻','颗':'顆','题':'題','额':'額','风':'風','饮':'飲',
  '馆':'館','驶':'駛','驾':'駕','验':'驗','骗':'騙','鱼':'魚',
  '黄':'黃','齿':'齒','龙':'龍','这':'這','后':'後','么':'麼','两':'兩',
  '并':'並','紧':'緊','绝':'絕','则':'則','刚':'剛','卧':'臥','却':'卻','厂':'廠',
  '圆':'圓','墙':'牆','壮':'壯','声':'聲','寿':'壽','尝':'嘗','尽':'盡',
  '属':'屬','岛':'島','干':'幹','弹':'彈','恶':'惡','悬':'懸',
  '拦':'攔','敌':'敵','剧':'劇','档':'檔','湿':'濕','滚':'滾',
  '满':'滿','潜':'潛','绿':'綠','碍':'礙','宁':'寧','抛':'拋','婴':'嬰',
};

function s2tConvert(text) {
  if (typeof text !== 'string') return text;
  let result = text;
  for (const [simp, trad] of wordReplacements) {
    result = result.split(simp).join(trad);
  }
  let final = '';
  for (let i = 0; i < result.length; i++) {
    final += s2t[result[i]] || result[i];
  }
  return final;
}

// ============ IMAGE MAPPING ============
console.log('🖼️  建立图片路径映射...');
const actualFiles = fs.readdirSync(SIGNS_DIR);
const imageFileLookup = {};
actualFiles.forEach(f => {
  const norm = f.replace(/\.[^.]+$/, '').toLowerCase().replace(/[\s_-]+/g, '');
  imageFileLookup[norm] = f;
});

function mapImageUrl(scrapedUrl) {
  if (!scrapedUrl) return null;
  const basename = scrapedUrl.replace(/^signs-webp\//, '').replace(/\.[^.]+$/, '');
  const norm = basename.toLowerCase().replace(/[\s_-]+/g, '');
  if (imageFileLookup[norm]) return '/images/signs/' + imageFileLookup[norm];
  let bestMatch = null, bestScore = 0;
  for (const key in imageFileLookup) {
    if (norm.includes(key) || key.includes(norm)) {
      const score = Math.min(norm.length, key.length) / Math.max(norm.length, key.length);
      if (score > bestScore) { bestScore = score; bestMatch = imageFileLookup[key]; }
    }
  }
  if (bestMatch && bestScore > 0.4) return '/images/signs/' + bestMatch;
  return null;
}

// ============ LOAD SCRAPED DATA ONLY ============
console.log('📂 加载爬取数据...');
const fm = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'questions-final-master.json'), 'utf8'));
const fmq = Array.isArray(fm) ? fm : fm.questions || [];
const scrapedQuestions = fmq.filter(q => q.questionText);
console.log(`  爬取题目: ${scrapedQuestions.length}`);

// ============ CONVERT ============
console.log('\n🔄 转换格式...');

function convertScraped(q) {
  const correctIdx = q.options.findIndex(o => o.isCorrect === true);
  const ansLetter = correctIdx === 0 ? 'A' : correctIdx === 1 ? 'B' : correctIdx === 2 ? 'C' : 'A';
  const zhHans = q.questionTextZh || q.questionText;

  const result = {
    category: q.category || 'traffic_rules',
    question: {
      en: q.questionText || '',
      'zh-Hans': zhHans,
      'zh-Hant': s2tConvert(zhHans)
    },
    options: {},
    answer: ansLetter,
    explanation: {
      en: q.explanation || '',
      'zh-Hans': q.explanationZh || q.explanation || '',
      'zh-Hant': s2tConvert(q.explanationZh || q.explanation || '')
    },
    dmv_ref: {
      page: 'Cali',
      section: q.category || 'traffic_rules',
      'analysis_zh-Hans': q.explanationZh || '',
      'analysis_zh-Hant': s2tConvert(q.explanationZh || '')
    }
  };

  ['A', 'B', 'C'].forEach((letter, i) => {
    const opt = q.options[i];
    if (opt) {
      const zhOpt = opt.optionTextZh || opt.optionText || '';
      result.options[letter] = {
        en: opt.optionText || '',
        'zh-Hans': zhOpt,
        'zh-Hant': s2tConvert(zhOpt)
      };
    } else {
      result.options[letter] = { en: '', 'zh-Hans': '', 'zh-Hant': '' };
    }
  });

  if (q.imageUrl) {
    const mapped = mapImageUrl(q.imageUrl);
    if (mapped) {
      result.hasImage = true;
      result.imageUrl = mapped;
    }
  }

  return result;
}

const converted = scrapedQuestions.map(convertScraped);

// Dedup
const seenTexts = new Set();
const deduped = [];
converted.forEach(q => {
  const key = (q.question.en || '').toLowerCase().trim();
  if (key && !seenTexts.has(key)) {
    seenTexts.add(key);
    deduped.push(q);
  }
});
console.log(`  转换: ${converted.length}, 去重后: ${deduped.length}`);

// ============ SPLIT INTO basics / deepdive / signs ============
console.log('\n📋 分类...');

const BASICS_COUNT = 200;
const signsPool = [];
const textPool = [];

deduped.forEach(q => {
  if (q.hasImage) {
    signsPool.push(q);
  } else {
    textPool.push(q);
  }
});

const basicsPool = textPool.slice(0, BASICS_COUNT);
const deepdivePool = textPool.slice(BASICS_COUNT);

// Assign IDs
let nextId = 1;
const finalBasics = basicsPool.map(q => ({ ...q, id: nextId++, source: 'basics' }));
const finalDeepdive = deepdivePool.map(q => ({ ...q, id: nextId++, source: 'deepdive' }));
const finalSigns = signsPool.map(q => ({ ...q, id: nextId++, source: 'signs' }));
const questionsAll = [...finalBasics, ...finalDeepdive, ...finalSigns];

console.log(`  basics: ${finalBasics.length} (ID ${finalBasics[0]?.id}-${finalBasics[finalBasics.length-1]?.id})`);
console.log(`  deepdive: ${finalDeepdive.length} (ID ${finalDeepdive[0]?.id}-${finalDeepdive[finalDeepdive.length-1]?.id})`);
console.log(`  signs: ${finalSigns.length} (ID ${finalSigns[0]?.id}-${finalSigns[finalSigns.length-1]?.id})`);
console.log(`  总计: ${questionsAll.length}`);

// ============ VALIDATE ============
console.log('\n✅ 验证...');
let errors = 0;
questionsAll.forEach(q => {
  if (!q.question?.en) { console.log('  ❌ ID', q.id, ': no question.en'); errors++; }
  if (!q.options?.A?.en || !q.options?.B?.en || !q.options?.C?.en) {
    console.log('  ❌ ID', q.id, ': missing option'); errors++;
  }
  if (!['A','B','C'].includes(q.answer)) {
    console.log('  ❌ ID', q.id, ': bad answer:', q.answer); errors++;
  }
});
console.log(errors === 0 ? '  ✅ 全部通过！' : `  ❌ ${errors} 个错误`);
if (errors > 0) { console.log('⚠️  有错误，不写入。'); process.exit(1); }

// ============ BACKUP & WRITE ============
console.log('\n💾 写入...');
const ts = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
const backupDir = path.join(PUBLIC_DATA, 'backup-' + ts);
fs.mkdirSync(backupDir, { recursive: true });
['questions-all.json','questions-basics.json','questions-deepdive.json','questions-signs.json'].forEach(f => {
  const src = path.join(PUBLIC_DATA, f);
  if (fs.existsSync(src)) fs.copyFileSync(src, path.join(backupDir, f));
});

fs.writeFileSync(path.join(PUBLIC_DATA, 'questions-all.json'), JSON.stringify(questionsAll, null, 2));
fs.writeFileSync(path.join(PUBLIC_DATA, 'questions-basics.json'), JSON.stringify(finalBasics, null, 2));
fs.writeFileSync(path.join(PUBLIC_DATA, 'questions-deepdive.json'), JSON.stringify(finalDeepdive, null, 2));
fs.writeFileSync(path.join(PUBLIC_DATA, 'questions-signs.json'), JSON.stringify(finalSigns, null, 2));
fs.writeFileSync(path.join(DATA_DIR, 'questions-all.json'), JSON.stringify(questionsAll, null, 2));

console.log('\n🎉 完成！只使用爬取数据：');
console.log(`  questions-all.json: ${questionsAll.length} 题`);
console.log(`  questions-basics.json: ${finalBasics.length} 题`);
console.log(`  questions-deepdive.json: ${finalDeepdive.length} 题`);
console.log(`  questions-signs.json: ${finalSigns.length} 题`);

// Sample
console.log('\n--- 抽查 ---');
[finalBasics[0], finalDeepdive[0], finalSigns[0]].forEach(q => {
  if (!q) return;
  console.log(`ID ${q.id} [${q.source}]: ${q.question.en.substring(0, 70)}`);
  console.log(`  答案: ${q.answer} | 图片: ${q.hasImage ? q.imageUrl : '无'}`);
});

// Apply deepdive image mappings (for questions that say "this sign" but came without images)
console.log('\n🖼️  应用 deepdive 图片映射...');
try {
  require('./fix-all-images.js');
} catch (e) {
  console.log('⚠️  图片映射脚本未找到或执行失败，跳过:', e.message);
}
