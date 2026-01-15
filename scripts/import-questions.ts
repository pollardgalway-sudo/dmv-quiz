import { prisma } from '../lib/prisma';
import * as fs from 'fs';
import * as path from 'path';

interface QuestionData {
  id: number;
  category: string;
  question: { en: string; 'zh-Hans': string; 'zh-Hant': string };
  options: {
    [key: string]: { en: string; 'zh-Hans': string; 'zh-Hant': string };
  };
  answer: string;
  explanation: { en: string; 'zh-Hans': string; 'zh-Hant': string };
  dmv_ref?: { page: string; section: string };
}

async function main() {
  const filePath = path.join(__dirname, '../data/questions-all.json');
  const data: QuestionData[] = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  console.log(`开始导入 ${data.length} 道题目...`);

  console.log('正在清空现有题目...');
  try {
    await prisma.option.deleteMany({});
    console.log('✅ 已清空选项');
  } catch (err) {
    console.log('清空选项失败，可能没有选项数据:', err);
  }

  try {
    await prisma.question.deleteMany({});
    console.log('✅ 已清空题目');
  } catch (err) {
    console.log('清空题目失败，可能没有题目数据:', err);
  }

  let imported = 0;
  for (const q of data) {
    // Prepare options dynamically
    const optionKeys = Object.keys(q.options).sort(); // A, B, C, D
    const optionsData = optionKeys.map(key => ({
      optionText: q.options[key].en,
      optionTextZh: `简体：${q.options[key]['zh-Hans']}\n繁体：${q.options[key]['zh-Hant']}`,
      isCorrect: q.answer === key,
      order: key
    }));

    await prisma.question.create({
      data: {
        questionText: q.question.en,
        questionTextZh: `简体：${q.question['zh-Hans']}\n繁体：${q.question['zh-Hant']}`,
        category: q.category,
        explanation: q.explanation.en,
        explanationZh: `简体：${q.explanation['zh-Hans']}\n繁体：${q.explanation['zh-Hant']}`,
        dmvManualReference: q.dmv_ref ? `Page ${q.dmv_ref.page}, ${q.dmv_ref.section}` : 'N/A',
        options: {
          create: optionsData
        }
      }
    });
    imported++;
    if (imported % 20 === 0) {
      console.log(`已导入 ${imported}/${data.length}...`);
    }
  }

  console.log(`\n✅ 完成！共 ${imported} 道题目`);
}

main()
  .catch((e) => {
    console.error('❌ 失败:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
