'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { addWrongQuestion } from '@/lib/wrong-questions'

type Option = {
  id: number
  text: string
  textCn: string
  textTw: string
  isCorrect: boolean
}

type Question = {
  id: number
  originalId: number  // 保存原始题目ID
  source: 'basics' | 'deepdive' | 'signs'  // 保存题目来源
  text: string
  textCn: string
  textTw: string
  options: Option[]
  imageUrl?: string  // 标志题的图片URL
}

export default function ExamPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [lang, setLang] = useState<'en' | 'zh-Hans' | 'zh-Hant'>('zh-Hant')

  const startExam = async () => {
    setLoading(true)
    try {
      // Fetch questions from static JSON file instead of API
      const res = await fetch('/data/questions-all.json')
      const allQuestions = await res.json()

      // 分类题目
      const basicsQuestions = allQuestions.filter((q: any) => q.source === 'basics')
      const deepdiveQuestions = allQuestions.filter((q: any) => q.source === 'deepdive')
      const signsQuestions = allQuestions.filter((q: any) => q.source === 'signs')

      // 随机打乱每个分类
      const shuffleArray = (arr: any[]) => [...arr].sort(() => Math.random() - 0.5)

      // 从 signs 模块选取 6 道标志题（这些都有图片）
      const selectedSigns = shuffleArray(signsQuestions).slice(0, 6)

      // 从 basics 和 deepdive 各选取一定数量的题目
      const selectedBasics = shuffleArray(basicsQuestions).slice(0, 15)
      const selectedDeepdive = shuffleArray(deepdiveQuestions).slice(0, 15)

      // 合并并再次打乱顺序
      const selected = shuffleArray([...selectedBasics, ...selectedDeepdive, ...selectedSigns])

      // Transform to the format expected by the exam page
      const examQuestions = selected.map((q: any, index: number) => ({
        id: index + 1,
        originalId: typeof q.id === 'number' ? q.id : parseInt(q.id?.replace(/\D/g, '') || index + 1),
        source: (q.source || 'basics') as 'basics' | 'deepdive' | 'signs',
        text: q.question?.en || q.question || '',
        textCn: q.question?.['zh-Hans'] || q.question || '',
        textTw: q.question?.['zh-Hant'] || q.question || '',
        imageUrl: q.hasImage && q.imageUrl ? q.imageUrl : undefined,
        options: Object.entries(q.options || {}).map(([key, value]: [string, any], optIndex: number) => ({
          id: optIndex + 1,
          text: typeof value === 'object' ? value.en : value,
          textCn: typeof value === 'object' ? value['zh-Hans'] : value,
          textTw: typeof value === 'object' ? value['zh-Hant'] : value,
          isCorrect: key === q.answer
        }))
      }))

      setQuestions(examQuestions)
      setAnswers({})
      setSubmitted(false)
      setCurrentIndex(0)
    } catch (error) {
      console.error('Failed to load exam questions:', error)
    } finally {
      setLoading(false)
    }
  }

  const selectAnswer = (optionId: number) => {
    setAnswers({ ...answers, [currentIndex]: optionId })
  }

  const submitExam = () => {
    // 将做错的题目添加到错题本
    questions.forEach((q, i) => {
      const selectedOption = q.options.find(o => o.id === answers[i])
      const isCorrect = selectedOption?.isCorrect
      if (!isCorrect && answers[i] !== undefined) {
        // 答错了，添加到错题本
        addWrongQuestion(q.originalId, q.source)
      }
    })
    setSubmitted(true)
  }

  const score = submitted
    ? questions.filter((q, i) => {
      const selectedOption = q.options.find(o => o.id === answers[i])
      return selectedOption?.isCorrect
    }).length
    : 0

  if (questions.length === 0) {
    return (
      <div className="min-h-screen page-gradient">
        {/* Navigation */}
        <nav className="relative z-10 glass border-b border-white/20 dark:border-white/5 sticky top-0">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity touch-target">
              <span className="text-xl">←</span>
              <span className="font-medium text-sm hidden sm:inline">返回首页</span>
            </Link>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as 'en' | 'zh-Hans' | 'zh-Hant')}
              className="glass rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all touch-target"
            >
              <option value="zh-Hans">简体中文</option>
              <option value="zh-Hant">繁體中文</option>
              <option value="en">English</option>
            </select>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto p-4 sm:p-6">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold flex items-center gap-2">
              <span className="animate-bounce-subtle">🏆</span>
              <span className="gradient-text">
                {lang === 'en' ? 'Mock Exam' : lang === 'zh-Hant' ? '模擬考試' : '模拟考试'}
              </span>
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-2">
              {lang === 'en' ? 'Real California DMV Written Test Simulation' : lang === 'zh-Hant' ? '真實模擬加州DMV筆試' : '真实模拟加州DMV笔试'}
            </p>
          </div>

          <Card className="premium-card overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500" />
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">
                {lang === 'en' ? 'Exam Instructions' : lang === 'zh-Hant' ? '考試說明' : '考试说明'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6">
              <ul className="text-sm text-muted-foreground space-y-3">
                <li className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 text-xs font-bold">36</span>
                  {lang === 'en' ? '36 questions total' : lang === 'zh-Hant' ? '共36道題' : '共36道题'}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 text-xs font-bold">30</span>
                  {lang === 'en' ? 'Pass with 30+ correct answers (83.3%)' : lang === 'zh-Hant' ? '需答對30題以上（83.3%）' : '需答对30题以上（83.3%）'}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-bold">3</span>
                  {lang === 'en' ? '3 options per question' : lang === 'zh-Hant' ? '每題3個選項' : '每题3个选项'}
                </li>
              </ul>

              {/* Important Note */}
              <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-300 dark:border-amber-700 rounded-xl p-4 mt-4">
                <p className="text-amber-800 dark:text-amber-200 font-semibold text-base flex items-start gap-2">
                  <span className="text-xl">⚠️</span>
                  <span>
                    {lang === 'en'
                      ? 'Note: The official DMV exam is in Traditional Chinese. Our mock test uses Traditional Chinese and English to match the real exam.'
                      : lang === 'zh-Hant'
                        ? '注意：DMV考試是繁體字版本，所以我們的模擬測試也是繁體字和英文版本。'
                        : '注意：DMV考试是繁体字版本，所以我们的模拟测试也是繁体字和英文版本。'
                    }
                  </span>
                </p>
              </div>

              <Button
                onClick={startExam}
                disabled={loading}
                className="w-full h-12 text-base font-medium touch-target"
                style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)' }}
              >
                {loading
                  ? (lang === 'en' ? 'Loading...' : lang === 'zh-Hant' ? '加載中...' : '加载中...')
                  : (lang === 'en' ? '🚀 Start Mock Exam' : lang === 'zh-Hant' ? '🚀 開始模擬考試' : '🚀 开始模拟考试')
                }
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (submitted) {
    const passed = score >= 30
    const wrongCount = 36 - score

    // 计算每道题的答题结果
    const questionResults = questions.map((q, i) => {
      const selectedOption = q.options.find(o => o.id === answers[i])
      const correctOption = q.options.find(o => o.isCorrect)
      const isCorrect = selectedOption?.isCorrect === true
      const isUnanswered = answers[i] === undefined
      return {
        index: i,
        question: q,
        isCorrect,
        isUnanswered,
        selectedOption,
        correctOption
      }
    })

    // 获取题目文本的辅助函数
    const getQText = (q: Question) => {
      if (lang === 'en') return q.text
      if (lang === 'zh-Hant') return q.textTw
      return q.textCn
    }

    const getOptText = (opt: Option) => {
      if (lang === 'en') return opt.text
      if (lang === 'zh-Hant') return opt.textTw
      return opt.textCn
    }

    return (
      <div className="min-h-screen page-gradient">
        {/* Navigation */}
        <nav className="relative z-10 glass border-b border-white/20 dark:border-white/5 sticky top-0">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity touch-target">
              <span className="text-xl">←</span>
              <span className="font-medium text-sm hidden sm:inline">返回首页</span>
            </Link>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as 'en' | 'zh-Hans' | 'zh-Hant')}
              className="glass rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all touch-target"
            >
              <option value="zh-Hans">简体中文</option>
              <option value="zh-Hant">繁體中文</option>
              <option value="en">English</option>
            </select>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
          {/* Score Summary Card */}
          <Card className="premium-card overflow-hidden animate-scale-in">
            <div className={`h-1 ${passed ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gradient-to-r from-red-400 to-orange-500'}`} />
            <CardContent className="p-6 sm:p-8 text-center space-y-4">
              <div className="text-5xl mb-2">{passed ? '🎉' : '💪'}</div>
              <div className="text-4xl sm:text-5xl font-bold gradient-text">{score} / 36</div>
              <div className={`text-lg sm:text-xl font-semibold ${passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {passed
                  ? (lang === 'en' ? '✓ Passed' : lang === 'zh-Hant' ? '✓ 通過' : '✓ 通过')
                  : (lang === 'en' ? '✗ Failed' : lang === 'zh-Hant' ? '✗ 未通過' : '✗ 未通过')
                }
              </div>

              {/* Stats Row */}
              <div className="flex justify-center gap-6 pt-2">
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-500">{score}</div>
                  <div className="text-xs text-muted-foreground">{lang === 'en' ? 'Correct' : '正确'}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-500">{wrongCount}</div>
                  <div className="text-xs text-muted-foreground">{lang === 'en' ? 'Wrong' : '错误'}</div>
                </div>
              </div>

              {wrongCount > 0 && (
                <p className="text-sm text-muted-foreground pt-2">
                  {lang === 'en' ? `${wrongCount} wrong questions added to review list` : `${wrongCount} 道错题已添加到错题本`}
                </p>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  onClick={startExam}
                  className="w-full sm:flex-1 h-12 text-base font-medium premium-button touch-target"
                >
                  {lang === 'en' ? 'Retake Test' : lang === 'zh-Hant' ? '重新測試' : '重新测试'}
                </Button>
                <Link href="/wrong" className="w-full sm:flex-1">
                  <Button variant="outline" className="w-full h-12 text-base font-medium glass border-2 touch-target">
                    {lang === 'en' ? 'Review Wrong' : lang === 'zh-Hant' ? '查看錯題' : '查看错题'}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Question Results Grid - Quick View */}
          <Card className="premium-card overflow-hidden">
            <CardHeader className="p-4 sm:p-6 pb-2">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <span>📊</span>
                {lang === 'en' ? 'Answer Overview' : lang === 'zh-Hant' ? '答題概覽' : '答题概览'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-2">
              <div className="grid grid-cols-9 sm:grid-cols-12 gap-2">
                {questionResults.map((result, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      const element = document.getElementById(`result-${i}`)
                      element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                    }}
                    className={`aspect-square min-w-0 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 active:scale-95 touch-target ${result.isCorrect
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                      : 'bg-red-500 text-white shadow-md shadow-red-500/30'
                      }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-center gap-4 mt-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-emerald-500"></div>
                  <span>{lang === 'en' ? 'Correct' : '正确'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-red-500"></div>
                  <span>{lang === 'en' ? 'Wrong' : '错误'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Question Results */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span>📝</span>
              {lang === 'en' ? 'Detailed Results' : lang === 'zh-Hant' ? '詳細結果' : '详细结果'}
            </h2>

            {questionResults.map((result, i) => (
              <Card
                key={i}
                id={`result-${i}`}
                className={`premium-card overflow-hidden ${result.isCorrect ? 'border-emerald-200 dark:border-emerald-800' : 'border-red-200 dark:border-red-800'}`}
              >
                <div className={`h-1 ${result.isCorrect ? 'bg-emerald-500' : 'bg-red-500'}`} />
                <CardContent className="p-4">
                  {/* Question Header */}
                  <div className="flex items-start gap-3 mb-3">
                    <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-sm ${result.isCorrect ? 'bg-emerald-500' : 'bg-red-500'
                      }`}>
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm sm:text-base font-medium leading-relaxed">
                        {getQText(result.question)}
                      </p>
                    </div>
                    <span className="text-lg flex-shrink-0">
                      {result.isCorrect ? '✓' : '✗'}
                    </span>
                  </div>

                  {/* Answer Details */}
                  <div className="pl-10 space-y-2">
                    {!result.isCorrect && result.selectedOption && (
                      <div className="flex items-start gap-2 text-sm">
                        <span className="text-red-500 font-medium whitespace-nowrap">
                          {lang === 'en' ? 'Your answer:' : '你的答案:'}
                        </span>
                        <span className="text-red-600 dark:text-red-400 line-through">
                          {getOptText(result.selectedOption)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-start gap-2 text-sm">
                      <span className="text-emerald-500 font-medium whitespace-nowrap">
                        {lang === 'en' ? 'Correct:' : '正确答案:'}
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400">
                        {result.correctOption ? getOptText(result.correctOption) : ''}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-col sm:flex-row gap-3 sticky bottom-4">
            <Button
              onClick={startExam}
              className="w-full sm:flex-1 h-12 text-base font-medium touch-target"
              style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)' }}
            >
              {lang === 'en' ? '🔄 Retake Test' : '🔄 重新测试'}
            </Button>
            <Link href="/" className="w-full sm:flex-1">
              <Button variant="outline" className="w-full h-12 text-base font-medium glass border-2 touch-target">
                {lang === 'en' ? 'Back to Home' : '返回首页'}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const currentQ = questions[currentIndex]

  // Get text based on language
  const getQuestionText = (q: Question) => {
    if (lang === 'en') return q.text
    if (lang === 'zh-Hant') return q.textTw
    return q.textCn
  }

  const getOptionText = (opt: Option) => {
    if (lang === 'en') return opt.text
    if (lang === 'zh-Hant') return opt.textTw
    return opt.textCn
  }

  const progress = ((currentIndex + 1) / 36) * 100

  return (
    <div className="min-h-screen page-gradient">
      {/* Navigation */}
      <nav className="relative z-10 glass border-b border-white/20 dark:border-white/5 sticky top-0">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity touch-target">
            <span className="text-xl">←</span>
            <span className="font-medium text-sm hidden sm:inline">返回首页</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="glass rounded-lg px-3 py-1.5 text-sm">
              <span className="font-medium">{Object.keys(answers).length}</span>
              <span className="text-muted-foreground"> / 36</span>
            </div>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as 'en' | 'zh-Hans' | 'zh-Hant')}
              className="glass rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all touch-target"
            >
              <option value="zh-Hans">简体中文</option>
              <option value="zh-Hant">繁體中文</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-4">
        {/* Header with Progress */}
        <div className="premium-card rounded-2xl p-4 animate-fade-in-up">
          <div className="flex justify-between items-center mb-3">
            <h1 className="text-lg sm:text-xl font-bold flex items-center gap-2">
              <span>🏆</span>
              <span className="gradient-text">
                {lang === 'en' ? 'Question' : '题目'} {currentIndex + 1} / 36
              </span>
            </h1>
          </div>
          <div className="progress-bar" style={{ background: 'rgba(139, 92, 246, 0.2)' }}>
            <div
              className="progress-bar-fill"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #8B5CF6, #EC4899)'
              }}
            />
          </div>
        </div>

        {/* Question Card */}
        <Card className="premium-card overflow-hidden animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="h-1 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500" />
          <CardHeader className="p-4 sm:p-6">
            {/* 显示交通标志图片 */}
            {currentQ.imageUrl && (
              <div className="flex justify-center mb-4">
                <div className="relative w-48 h-48 sm:w-56 sm:h-56 overflow-hidden">
                  <Image
                    src={currentQ.imageUrl}
                    alt="Traffic Sign"
                    fill
                    className="object-contain p-2"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                {currentIndex + 1}
              </span>
              <CardTitle className="text-base sm:text-lg leading-relaxed font-medium">
                {getQuestionText(currentQ)}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 p-4 sm:p-6 pt-0">
            {currentQ.options.map((opt, index) => {
              const isSelected = answers[currentIndex] === opt.id
              return (
                <button
                  key={opt.id}
                  onClick={() => selectAnswer(opt.id)}
                  className={`w-full flex items-start gap-3 text-left p-4 rounded-xl border-2 transition-all duration-300 touch-target animate-fade-in-up ${isSelected
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg shadow-purple-500/20'
                    : 'border-border hover:border-purple-300 hover:bg-accent/50 hover:shadow-md'
                    }`}
                  style={{ animationDelay: `${(index + 1) * 50}ms` }}
                >
                  {/* Custom Radio Circle */}
                  <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 transition-all duration-300 flex items-center justify-center mt-0.5 ${isSelected
                    ? 'border-purple-500 bg-purple-500'
                    : 'border-gray-300 dark:border-gray-600'
                    }`}>
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <span className="text-sm sm:text-base leading-relaxed">{getOptionText(opt)}</span>
                </button>
              )
            })}
          </CardContent>
        </Card>

        {/* Navigation Buttons - Now ABOVE quick navigation */}
        <div className="flex flex-col sm:flex-row gap-3 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <Button
            onClick={() => setCurrentIndex(currentIndex - 1)}
            disabled={currentIndex === 0}
            variant="outline"
            className="w-full sm:w-auto sm:flex-1 h-12 sm:h-11 text-base font-medium glass border-2 hover:bg-accent/50 touch-target"
          >
            ← {lang === 'en' ? 'Previous' : lang === 'zh-Hant' ? '上一題' : '上一题'}
          </Button>
          {currentIndex === 35 ? (
            <Button
              onClick={submitExam}
              className="sm:flex-1 h-12 sm:h-11 text-base font-medium touch-target"
              style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}
            >
              ✓ {lang === 'en' ? 'Submit' : lang === 'zh-Hant' ? '提交答卷' : '提交答卷'}
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentIndex(currentIndex + 1)}
              className="sm:flex-1 h-12 sm:h-11 text-base font-medium touch-target"
              style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)' }}
            >
              {lang === 'en' ? 'Next' : lang === 'zh-Hant' ? '下一題' : '下一题'} →
            </Button>
          )}
        </div>

        {/* Quick Navigation - Now BELOW buttons */}
        <Card className="premium-card overflow-hidden animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <CardHeader className="p-3 sm:p-4 pb-2">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <span>📍</span>
              {lang === 'en' ? 'Quick Navigation' : lang === 'zh-Hant' ? '快速導航' : '快速导航'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="grid grid-cols-9 sm:grid-cols-12 gap-2">
              {questions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`aspect-square min-w-0 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 active:scale-95 touch-target ${i === currentIndex
                    ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
                    : answers[i] !== undefined
                      ? 'bg-emerald-500 text-white shadow-md'
                      : 'bg-muted hover:bg-accent text-muted-foreground hover:text-foreground'
                    }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-center gap-4 mt-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-gradient-to-br from-purple-500 to-pink-500"></div>
                <span>{lang === 'en' ? 'Current' : '当前'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-emerald-500"></div>
                <span>{lang === 'en' ? 'Answered' : '已答'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-muted"></div>
                <span>{lang === 'en' ? 'Unanswered' : '未答'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
