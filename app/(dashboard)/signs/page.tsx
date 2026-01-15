'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { addWrongQuestion } from '@/lib/wrong-questions'

type LangType = 'en' | 'zh-Hans' | 'zh-Hant'

interface Question {
  id: number
  category: string
  image: string
  question: Record<LangType, string>
  options: {
    A: Record<LangType, string>
    B: Record<LangType, string>
    C: Record<LangType, string>
  }
  answer: string
  explanation: Record<LangType, string>
}

const translations = {
  en: {
    title: "Traffic Signs",
    subtitle: "Learn California traffic signs through practice",
    back: "← Back to Home",
    question: "Question",
    of: "of",
    prev: "← Previous",
    next: "Next →",
    accuracy: "Accuracy",
    answered: "Answered",
    correct: "✓ Correct!",
    incorrect: "✗ Incorrect",
    explanation: "Explanation"
  },
  'zh-Hans': {
    title: "交通标志",
    subtitle: "通过练习掌握加州交通标志",
    back: "← 返回首页",
    question: "第",
    of: "题，共",
    prev: "← 上一题",
    next: "下一题 →",
    accuracy: "正确率",
    answered: "已答",
    correct: "✓ 回答正确！",
    incorrect: "✗ 回答错误",
    explanation: "解析"
  },
  'zh-Hant': {
    title: "交通標誌",
    subtitle: "通過練習掌握加州交通標誌",
    back: "← 返回首頁",
    question: "第",
    of: "題，共",
    prev: "← 上一題",
    next: "下一題 →",
    accuracy: "正確率",
    answered: "已答",
    correct: "✓ 回答正確！",
    incorrect: "✗ 回答錯誤",
    explanation: "解析"
  }
}

export default function SignsPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [lang, setLang] = useState<LangType>('zh-Hans')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const t = translations[lang]

  useEffect(() => {
    fetch('/data/questions-signs.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load questions')
        return res.json()
      })
      .then(data => {
        setQuestions(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  const currentQuestion = questions[currentIndex]

  const handleSelectAnswer = (option: string) => {
    if (showExplanation) return

    setSelectedAnswer(option)
    setShowExplanation(true)

    if (option === currentQuestion.answer) {
      setScore(prev => ({ ...prev, correct: prev.correct + 1, total: prev.total + 1 }))
    } else {
      setScore(prev => ({ ...prev, total: prev.total + 1 }))
      // Add to wrong questions
      addWrongQuestion(currentQuestion.id, 'signs')
    }
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setSelectedAnswer(null)
      setShowExplanation(false)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setSelectedAnswer(null)
      setShowExplanation(false)
    }
  }

  const getOptionStyle = (option: string) => {
    const baseStyle = "w-full p-4 text-left rounded-xl transition-all duration-300 flex items-start gap-3 touch-target"

    if (!showExplanation) {
      return `${baseStyle} glass hover:bg-white/40 dark:hover:bg-white/10 hover:shadow-lg cursor-pointer`
    }

    if (option === currentQuestion.answer) {
      return `${baseStyle} bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-500 shadow-lg`
    }

    if (option === selectedAnswer && option !== currentQuestion.answer) {
      return `${baseStyle} bg-gradient-to-r from-red-500/20 to-pink-500/20 border-2 border-red-500`
    }

    return `${baseStyle} glass opacity-50`
  }

  if (loading) {
    return (
      <div className="min-h-screen page-gradient flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading traffic signs...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen page-gradient flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-500 text-xl">Error: {error}</p>
          <Link href="/">
            <Button>Return to Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!currentQuestion) return null

  const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0

  return (
    <div className="min-h-screen page-gradient">
      {/* Decorative background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-amber-400/20 to-yellow-400/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-br from-orange-400/20 to-red-400/20 rounded-full blur-3xl animate-float delay-300" />
      </div>

      {/* Top Navigation */}
      <nav className="relative z-10 glass border-b border-white/20 dark:border-white/5 sticky top-0">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <span>{t.back}</span>
          </Link>

          {/* Progress */}
          <div className="flex items-center gap-4 text-sm">
            <span className="glass px-3 py-1 rounded-full">
              {t.question} {currentIndex + 1} {t.of} {questions.length} 题
            </span>
          </div>

          {/* Language Switcher */}
          <div className="flex items-center gap-2 glass rounded-xl px-3 py-2">
            <span>🌐</span>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as LangType)}
              className="bg-transparent border-none outline-none cursor-pointer text-sm"
            >
              <option value="zh-Hans">中文</option>
              <option value="zh-Hant">繁體</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </nav>

      <div className="relative z-10 container mx-auto px-4 py-6 max-w-4xl">
        {/* Header Card */}
        <Card className="premium-card mb-6">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold gradient-text">{t.title}</h1>
                <p className="text-muted-foreground text-sm mt-1">{t.subtitle}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${accuracy >= 80 ? 'text-green-500' : accuracy >= 60 ? 'text-yellow-500' : 'text-red-500'}`}>
                    {accuracy}%
                  </div>
                  <div className="text-xs text-muted-foreground">{t.accuracy}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-500">{score.total}</div>
                  <div className="text-xs text-muted-foreground">{t.answered}</div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 transition-all duration-500"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Question Card with Image */}
        <Card className="premium-card mb-6 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500" />
          <CardContent className="p-6">
            {/* Sign Image */}
            <div className="flex justify-center mb-6">
              <div className="relative w-48 h-48 md:w-64 md:h-64 glass rounded-2xl p-4 flex items-center justify-center">
                <Image
                  src={currentQuestion.image}
                  alt="Traffic Sign"
                  width={200}
                  height={200}
                  className="object-contain max-w-full max-h-full"
                  priority
                />
              </div>
            </div>

            {/* Question Number */}
            <div className="flex items-center gap-3 mb-4">
              <span className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center text-white font-bold text-lg">
                {currentIndex + 1}
              </span>
              <span className="text-sm glass px-3 py-1 rounded-full text-amber-600 dark:text-amber-400">
                🚦 {currentQuestion.category}
              </span>
            </div>

            {/* Question Text */}
            <h2 className="text-xl md:text-2xl font-semibold mb-6">
              {currentQuestion.question[lang]}
            </h2>

            {/* Options */}
            <div className="space-y-3">
              {(['A', 'B', 'C'] as const).map((option, index) => (
                <button
                  key={option}
                  onClick={() => handleSelectAnswer(option)}
                  disabled={showExplanation}
                  className={getOptionStyle(option)}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${showExplanation && option === currentQuestion.answer
                    ? 'bg-green-500 text-white'
                    : showExplanation && option === selectedAnswer && option !== currentQuestion.answer
                      ? 'bg-red-500 text-white'
                      : selectedAnswer === option && !showExplanation
                        ? 'bg-amber-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}>
                    {option}
                  </span>
                  <span className="flex-1">{currentQuestion.options[option][lang]}</span>
                </button>
              ))}
            </div>

            {/* Explanation */}
            {showExplanation && (
              <div className={`mt-6 p-4 rounded-xl animate-scale-in ${selectedAnswer === currentQuestion.answer
                ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30'
                : 'bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/30'
                }`}>
                <div className={`font-bold mb-2 ${selectedAnswer === currentQuestion.answer ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                  {selectedAnswer === currentQuestion.answer ? t.correct : t.incorrect}
                </div>
                <div className="text-sm">
                  <span className="font-medium">{t.explanation}：</span>
                  {currentQuestion.explanation[lang]}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex gap-4">
          <Button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            variant="outline"
            className="flex-1 glass py-6 text-lg touch-target"
          >
            {t.prev}
          </Button>
          <Button
            onClick={handleNext}
            disabled={currentIndex === questions.length - 1}
            className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white py-6 text-lg touch-target"
          >
            {t.next}
          </Button>
        </div>
      </div>
    </div>
  )
}
