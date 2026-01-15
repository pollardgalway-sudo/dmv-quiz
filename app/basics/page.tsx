'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { addWrongQuestion } from '@/lib/wrong-questions'

interface Question {
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

export default function BasicsPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string>('')
  const [showExplanation, setShowExplanation] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [lang, setLang] = useState<'en' | 'zh-Hans' | 'zh-Hant'>('zh-Hans')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetch('/data/questions-basics.json')
      .then(res => res.json())
      .then(data => setQuestions(data))
  }, [])

  if (!mounted || questions.length === 0) {
    return (
      <div className="min-h-screen page-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-blue-200 dark:border-blue-900"></div>
            <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]
  const isCorrect = selectedAnswer === currentQuestion.answer
  const progress = ((currentIndex + 1) / questions.length) * 100

  // Auto-submit when answer is selected
  const handleSelectAnswer = (option: string) => {
    if (showExplanation) return // Already answered

    setSelectedAnswer(option)
    setShowExplanation(true)

    // Update score
    if (option === currentQuestion.answer) {
      setScore(prev => ({ ...prev, correct: prev.correct + 1, total: prev.total + 1 }))
    } else {
      setScore(prev => ({ ...prev, total: prev.total + 1 }))
      // Add to wrong questions
      addWrongQuestion(currentQuestion.id, 'basics')
    }
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setSelectedAnswer('')
      setShowExplanation(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setSelectedAnswer('')
      setShowExplanation(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen page-gradient transition-colors duration-500">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 -left-40 w-60 h-60 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-float delay-300" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 glass border-b border-white/20 dark:border-white/5 sticky top-0">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity touch-target">
            <span className="text-xl">←</span>
            <span className="font-medium text-sm hidden sm:inline">返回首页</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Progress indicator */}
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium">{currentIndex + 1}</span>
              <span>/</span>
              <span>{questions.length}</span>
            </div>

            {/* Language Switcher */}
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as 'en' | 'zh-Hans' | 'zh-Hant')}
              className="glass rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all touch-target"
            >
              <option value="zh-Hans">简体中文</option>
              <option value="zh-Hant">繁體中文</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </nav>

      <div className="relative z-10 container mx-auto px-4 py-6 max-w-4xl">
        {/* Header Card */}
        <div className="premium-card rounded-2xl p-4 sm:p-6 mb-6 animate-fade-in-up">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold flex items-center gap-2">
                <span className="animate-bounce-subtle">📚</span>
                <span className="gradient-text">扫盲模式</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                正确率: {score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0}%
                <span className="mx-2">•</span>
                已答 {score.total} 题
              </p>
            </div>

            {/* Score Badge */}
            <div className="glass rounded-xl px-4 py-2 text-center">
              <div className="text-2xl font-bold gradient-text">{score.correct}</div>
              <div className="text-xs text-muted-foreground">正确</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1 text-right">
              {currentIndex + 1} / {questions.length}
            </p>
          </div>
        </div>

        {/* Question Card */}
        <Card className="premium-card overflow-hidden animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          {/* Gradient top border */}
          <div className="h-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500" />

          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
                {currentIndex + 1}
              </span>
              <CardTitle className="text-base sm:text-lg md:text-xl leading-relaxed font-medium">
                {currentQuestion.question[lang]}
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6 pt-0">
            {/* Options - Click to select and auto-submit */}
            <div className="space-y-3">
              {(['A', 'B', 'C'] as const).map((option, index) => {
                const isSelected = selectedAnswer === option
                const isCorrectOption = currentQuestion.answer === option

                return (
                  <div
                    key={option}
                    onClick={() => handleSelectAnswer(option)}
                    className={`flex items-start space-x-3 p-4 rounded-xl border-2 transition-all duration-300 touch-target cursor-pointer animate-fade-in-up ${showExplanation
                      ? isCorrectOption
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 shadow-lg shadow-emerald-500/20'
                        : isSelected
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20 shadow-lg shadow-red-500/20'
                          : 'border-border bg-muted/30 opacity-60'
                      : 'border-border hover:border-blue-400 hover:bg-accent/50 hover:shadow-md'
                      }`}
                    style={{ animationDelay: `${(index + 1) * 50}ms` }}
                  >
                    {/* Custom Radio Circle */}
                    <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 transition-all duration-300 flex items-center justify-center mt-0.5 ${showExplanation
                      ? isCorrectOption
                        ? 'border-emerald-500 bg-emerald-500'
                        : isSelected
                          ? 'border-red-500 bg-red-500'
                          : 'border-gray-300 dark:border-gray-600'
                      : isSelected
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300 dark:border-gray-600 group-hover:border-blue-400'
                      }`}>
                      {(isSelected || (showExplanation && isCorrectOption)) && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>

                    <Label className="flex-1 cursor-pointer text-sm sm:text-base leading-relaxed">
                      <span className={`font-bold mr-2 ${showExplanation
                        ? isCorrectOption
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : isSelected
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-gray-400'
                        : 'text-blue-600 dark:text-blue-400'
                        }`}>{option}.</span>
                      {currentQuestion.options[option][lang]}
                    </Label>

                    {showExplanation && isCorrectOption && (
                      <span className="flex-shrink-0 text-lg text-emerald-500">✓</span>
                    )}
                    {showExplanation && isSelected && !isCorrectOption && (
                      <span className="flex-shrink-0 text-lg text-red-500">✗</span>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Explanation - Shows immediately after selection */}
            {showExplanation && (
              <div className={`p-4 sm:p-5 rounded-xl border-2 animate-scale-in ${isCorrect
                ? 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-300 dark:border-emerald-700'
                : 'bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-300 dark:border-red-700'
                }`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{isCorrect ? '🎉' : '💪'}</span>
                  <p className="font-bold text-base sm:text-lg">
                    {isCorrect ? '回答正确！' : `正确答案是 ${currentQuestion.answer}`}
                  </p>
                </div>
                <p className="text-sm sm:text-base mb-4 leading-relaxed text-muted-foreground">
                  {currentQuestion.explanation[lang]}
                </p>
                <div className="glass rounded-lg p-3 space-y-2">
                  <p className="text-sm flex items-center gap-2">
                    <span>📖</span>
                    <span className="font-medium">参考:</span>
                    <span className="text-muted-foreground">{currentQuestion.dmv_ref.section}, 第 {currentQuestion.dmv_ref.page} 页</span>
                  </p>
                  <p className="text-sm italic text-muted-foreground leading-relaxed">
                    {currentQuestion.dmv_ref[`analysis_${lang}` as keyof typeof currentQuestion.dmv_ref]}
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons - Only Previous and Next */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                variant="outline"
                className="w-full sm:w-auto sm:flex-1 h-12 sm:h-11 text-base font-medium glass border-2 hover:bg-accent/50 touch-target"
              >
                ← 上一题
              </Button>
              <Button
                onClick={handleNext}
                disabled={currentIndex === questions.length - 1}
                className="w-full sm:w-auto sm:flex-1 h-12 sm:h-11 text-base font-medium touch-target"
                style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}
              >
                下一题 →
              </Button>
            </div>
          </CardContent>
        </Card>


      </div>
    </div>
  )
}
