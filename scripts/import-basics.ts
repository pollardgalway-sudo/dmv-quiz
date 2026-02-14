import { prisma } from '../lib/prisma'
import * as fs from 'fs'
import * as path from 'path'

interface QuestionData {
  id: number
  category: string
  question: {
    en: string
    'zh-Hans': string
    'zh-Hant': string
  }
  options: {
    A: { en: string; 'zh-Hans': string; 'zh-Hant': string }
    B: { en: string; 'zh-Hans': string; 'zh-Hant': string }
    C: { en: string; 'zh-Hans': string; 'zh-Hant': string }
  }
  answer: 'A' | 'B' | 'C'
  explanation: {
    en: string
    'zh-Hans': string
    'zh-Hant': string
  }
  dmv_ref: {
    page: string
    section: string
    'analysis_zh-Hans': string
    'analysis_zh-Hant': string
  }
}

async function importBasicsQuestions() {
  try {
    console.log('📚 开始导入扫盲模式题目...')

    // 读取JSON文件
    const filePath = path.join(process.cwd(), 'data', 'questions-basics.json')
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const questions: QuestionData[] = JSON.parse(fileContent)

    console.log(`📖 找到 ${questions.length} 道题目`)

    let imported = 0
    let skipped = 0

    for (const q of questions) {
      try {
        // 创建题目和选项
        await prisma.question.create({
          data: {
            questionText: q.question.en,
            questionTextZh: `${q.question['zh-Hans']} | ${q.question['zh-Hant']}`,
            category: 'basics',
            difficulty: 'easy',
            explanation: q.explanation.en,
            explanationZh: `${q.explanation['zh-Hans']} | ${q.explanation['zh-Hant']}`,
            dmvManualReference: `Page ${q.dmv_ref.page}, ${q.dmv_ref.section}`,
            handbookVersion: '2026',
            options: {
              create: [
                {
                  optionText: q.options.A.en,
                  optionTextZh: `${q.options.A['zh-Hans']} | ${q.options.A['zh-Hant']}`,
                  isCorrect: q.answer === 'A',
                  order: 'A'
                },
                {
                  optionText: q.options.B.en,
                  optionTextZh: `${q.options.B['zh-Hans']} | ${q.options.B['zh-Hant']}`,
                  isCorrect: q.answer === 'B',
                  order: 'B'
                },
                {
                  optionText: q.options.C.en,
                  optionTextZh: `${q.options.C['zh-Hans']} | ${q.options.C['zh-Hant']}`,
                  isCorrect: q.answer === 'C',
                  order: 'C'
                }
              ]
            }
          }
        })

        imported++
        console.log(`✅ 导入题目 ${q.id}: ${q.question['zh-Hans'].substring(0, 30)}...`)
      } catch (error: any) {
        if (error.code === 'P2002') {
          skipped++
          console.log(`⏭️  跳过重复题目 ${q.id}`)
        } else {
          throw error
        }
      }
    }

    console.log('\n✨ 导入完成！')
    console.log(`✅ 成功导入: ${imported} 道题`)
    console.log(`⏭️  跳过重复: ${skipped} 道题`)
  } catch (error) {
    console.error('❌ 导入失败:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

importBasicsQuestions()
