import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

// 强行覆盖环境变量，直接连接到底层的 PostgreSQL 端口
process.env.DATABASE_URL = "postgres://postgres:postgres@localhost:51214/template1?sslmode=disable";

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
    options: OptionData[]
}

interface OptionData {
    optionText: string
    optionTextZh?: string
    isCorrect: boolean
    order: string
}

async function seedScrapedQuestions() {
    console.log('📚 开始导入合并去重后的 753 道终极题库...')

    const questionsPath = path.join(process.cwd(), 'data', 'questions-final-master.json')

    if (!fs.existsSync(questionsPath)) {
        console.error(`❌ 找不到文件: ${questionsPath}，请先运行 master_merge.py。`)
        return
    }

    const questionsData: QuestionData[] = JSON.parse(fs.readFileSync(questionsPath, 'utf-8'))

    // 清除旧题目，确保数据库里只有这 753 道最准的题
    console.log('🧹 正在清理旧题目数据...')
    await prisma.option.deleteMany({})
    await prisma.question.deleteMany({})

    let count = 0
    for (const questionData of questionsData) {
        const { options, ...questionInfo } = questionData

        try {
            await prisma.question.create({
                data: {
                    ...questionInfo,
                    options: {
                        create: options.map(option => ({
                            optionText: option.optionText || "No English Option",
                            optionTextZh: option.optionTextZh,
                            isCorrect: option.isCorrect,
                            order: option.order,
                        }))
                    }
                }
            })
            count++
            if (count % 50 === 0) {
                console.log(`  ...已导入 ${count} 道题`)
            }
        } catch (e) {
            console.warn(`  ⚠️ 导入题目失败: ${questionData.questionTextZh?.substring(0, 20)}... 错误: ${e}`)
        }
    }

    console.log(`✅ 终极题库导入完成！共计成功导入 ${count} 道题\n`)
}

async function main() {
    console.log('🌱 开始导入正式题库数据...\n')
    try {
        await seedScrapedQuestions()
        const finalCount = await prisma.question.count()
        console.log(`📊 当前数据库题目总数: ${finalCount}`)
        console.log('\n✨ 操作完成！你的 App 已经换上全新题库！')
    } catch (error) {
        console.error('❌ 导入出错:', error)
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
