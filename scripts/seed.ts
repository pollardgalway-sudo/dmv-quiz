/**
 * 数据库种子脚本 - 导入题目和交通标志数据
 *
 * 使用方法：
 * 1. 确保数据库已运行并配置好 DATABASE_URL
 * 2. 运行：npx tsx scripts/seed.ts
 */

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

interface QuestionData {
  questionText: string
  questionTextZh?: string
  category: string
  difficulty: string
  imageUrl?: string | null
  explanation: string
  explanationZh?: string
  dmvManualReference: string
  dmvManualUrl?: string
  handbookVersion: string
  relatedSignId?: string | null
  options: OptionData[]
}

interface OptionData {
  optionText: string
  optionTextZh?: string
  isCorrect: boolean
  order: string
}

interface TrafficSignData {
  signName: string
  signNameZh?: string
  signType: string
  shape: string
  colorPrimary: string
  colorSecondary?: string
  imageUrl: string
  meaning: string
  meaningZh?: string
  actionRequired: string
  actionRequiredZh?: string
  dmvManualReference: string
  handbookVersion: string
}

async function seedTrafficSigns() {
  console.log('🚦 开始导入交通标志数据...')

  const signsPath = path.join(process.cwd(), 'data', 'templates', 'traffic-signs-template.json')
  const signsData: TrafficSignData[] = JSON.parse(fs.readFileSync(signsPath, 'utf-8'))

  for (const signData of signsData) {
    await prisma.trafficSign.create({
      data: {
        signName: signData.signName,
        signNameZh: signData.signNameZh,
        signType: signData.signType,
        shape: signData.shape,
        colorPrimary: signData.colorPrimary,
        colorSecondary: signData.colorSecondary,
        imageUrl: signData.imageUrl,
        meaning: signData.meaning,
        meaningZh: signData.meaningZh,
        actionRequired: signData.actionRequired,
        actionRequiredZh: signData.actionRequiredZh,
        dmvManualReference: signData.dmvManualReference,
        handbookVersion: signData.handbookVersion,
      }
    })
    console.log(`  ✓ 已导入标志: ${signData.signName}`)
  }

  console.log(`✅ 交通标志导入完成！共 ${signsData.length} 个标志\n`)
}

async function seedQuestions() {
  console.log('📚 开始导入题目数据...')

  const questionsPath = path.join(process.cwd(), 'data', 'templates', 'questions-template.json')
  const questionsData: QuestionData[] = JSON.parse(fs.readFileSync(questionsPath, 'utf-8'))

  for (const questionData of questionsData) {
    const { options, ...questionInfo } = questionData

    await prisma.question.create({
      data: {
        ...questionInfo,
        options: {
          create: options.map(option => ({
            optionText: option.optionText,
            optionTextZh: option.optionTextZh,
            isCorrect: option.isCorrect,
            order: option.order,
          }))
        }
      }
    })
    console.log(`  ✓ 已导入题目: ${questionData.questionText.substring(0, 50)}...`)
  }

  console.log(`✅ 题目导入完成！共 ${questionsData.length} 道题\n`)
}

async function main() {
  console.log('🌱 开始数据库种子操作...\n')

  try {
    // 先导入交通标志（因为题目可能引用标志）
    await seedTrafficSigns()

    // 然后导入题目
    await seedQuestions()

    // 显示统计信息
    const questionCount = await prisma.question.count()
    const signCount = await prisma.trafficSign.count()

    console.log('📊 数据库统计:')
    console.log(`  - 题目总数: ${questionCount}`)
    console.log(`  - 交通标志总数: ${signCount}`)
    console.log('\n✨ 数据导入完成！')

  } catch (error) {
    console.error('❌ 数据导入失败:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
