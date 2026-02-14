'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { addWrongQuestion } from '@/lib/wrong-questions'
import { getProgress, saveProgress, clearProgress } from '@/lib/progress'

type LangType = 'en' | 'zh-Hans' | 'zh-Hant'

// Updated interface to match new multilingual format
interface SignQuestion {
  id: number
  category: string
  question: Record<LangType, string>
  options: {
    A: Record<LangType, string>
    B: Record<LangType, string>
    C: Record<LangType, string>
  }
  answer: 'A' | 'B' | 'C'
  explanation: Record<LangType, string>
  hasImage?: boolean
  imageUrl?: string | null
  dmv_ref?: {
    page: string
    section: string
    'analysis_zh-Hans': string
    'analysis_zh-Hant': string
  }
}

export default function SignsPage() {
  const [questions, setQuestions] = useState<SignQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string>('')
  const [showExplanation, setShowExplanation] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [lang, setLang] = useState<LangType>('zh-Hans')
  const [mounted, setMounted] = useState(false)
  const [progressLoaded, setProgressLoaded] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  // Load questions and restore progress
  useEffect(() => {
    setMounted(true)
    fetch('/data/questions-signs.json')
      .then(res => res.json())
      .then(data => {
        setQuestions(data)
        // Restore saved progress after questions are loaded
        const savedProgress = getProgress('signs')
        if (savedProgress && savedProgress.currentIndex < data.length) {
          setCurrentIndex(savedProgress.currentIndex)
          setScore(savedProgress.score)
        }
        setProgressLoaded(true)
      })
      .catch(err => console.error('Failed to load signs:', err))
  }, [])

  // Save progress when currentIndex or score changes
  useEffect(() => {
    if (progressLoaded && questions.length > 0) {
      saveProgress('signs', currentIndex, score)
    }
  }, [currentIndex, score, progressLoaded, questions.length])

  if (!mounted || questions.length === 0) {
    return (
      <div className="min-h-screen page-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-amber-200 dark:border-amber-900"></div>
            <div className="absolute inset-0 rounded-full border-4 border-amber-500 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]
  const isCorrect = selectedAnswer === currentQuestion.answer
  const progress = ((currentIndex + 1) / questions.length) * 100

  const handleSelectAnswer = (option: string) => {
    if (showExplanation) return

    setSelectedAnswer(option)
    setShowExplanation(true)

    if (option === currentQuestion.answer) {
      setScore(prev => ({ ...prev, correct: prev.correct + 1, total: prev.total + 1 }))
    } else {
      setScore(prev => ({ ...prev, total: prev.total + 1 }))
      addWrongQuestion(currentQuestion.id, 'signs')
    }
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setSelectedAnswer('')
      setShowExplanation(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (showExplanation) {
      setIsCompleted(true)
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

  const handleRestart = () => {
    clearProgress('signs')
    setCurrentIndex(0)
    setSelectedAnswer('')
    setShowExplanation(false)
    setScore({ correct: 0, total: 0 })
    setIsCompleted(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen page-gradient transition-colors duration-500">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-amber-400/20 to-yellow-400/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 -left-40 w-60 h-60 bg-gradient-to-br from-orange-400/20 to-red-400/20 rounded-full blur-3xl animate-float delay-300" />
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
              onChange={(e) => setLang(e.target.value as LangType)}
              className="glass rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all touch-target"
            >
              <option value="zh-Hans">简体中文</option>
              <option value="zh-Hant">繁體中文</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </nav>

      <div className="relative z-10 container mx-auto px-4 py-6 max-w-4xl">

        {/* Completion Screen */}
        {isCompleted ? (
          <Card className="premium-card overflow-hidden animate-scale-in">
            <div className="h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500" />
            <CardContent className="p-6 sm:p-8 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">恭喜完成！</h2>
              <p className="text-lg text-muted-foreground mb-6">
                您已完成所有 {questions.length} 道交通标志题目
              </p>

              <div className="glass rounded-2xl p-6 mb-6 inline-block">
                <div className="text-4xl font-bold mb-2" style={{ color: score.total > 0 && (score.correct / score.total) >= 0.8 ? '#10B981' : '#F59E0B' }}>
                  {score.correct} / {score.total}
                </div>
                <p className="text-muted-foreground">
                  正确率: {score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0}%
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={handleRestart}
                  className="h-12 px-8 text-base font-medium"
                  style={{ background: 'linear-gradient(135deg, #F59E0B, #EF4444)' }}
                >
                  🔄 重新开始
                </Button>
                <Link href="/">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto h-12 px-8 text-base font-medium glass border-2"
                  >
                    ← 返回首页
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Question Card */
          <Card className="premium-card overflow-hidden animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            {/* Gradient top border */}
            <div className="h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500" />

            <CardHeader className="p-4 sm:p-6">
              {/* Display image if available */}
              {currentQuestion.hasImage && currentQuestion.imageUrl && (
                <div className="flex justify-center mb-4">
                  <div className="relative w-48 h-48 sm:w-56 sm:h-56 overflow-hidden">
                    <Image
                      src={currentQuestion.imageUrl}
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
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                  {currentIndex + 1}
                </span>
                <CardTitle className="text-lg sm:text-xl md:text-2xl leading-relaxed font-semibold">
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
                        : 'border-border hover:border-amber-400 hover:bg-accent/50 hover:shadow-md'
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
                          ? 'border-amber-500 bg-amber-500'
                          : 'border-gray-300 dark:border-gray-600 group-hover:border-amber-400'
                        }`}>
                        {(isSelected || (showExplanation && isCorrectOption)) && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>

                      <Label className="flex-1 cursor-pointer text-base sm:text-lg leading-relaxed">
                        <span className={`font-bold mr-2 ${showExplanation
                          ? isCorrectOption
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : isSelected
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-gray-400'
                          : 'text-amber-600 dark:text-amber-400'
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
                  {currentQuestion.dmv_ref && (
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
                  )}
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
                  disabled={currentIndex === questions.length - 1 && !showExplanation}
                  className="w-full sm:w-auto sm:flex-1 h-12 sm:h-11 text-base font-medium touch-target"
                  style={{ background: 'linear-gradient(135deg, #F59E0B, #EF4444)' }}
                >
                  {currentIndex === questions.length - 1 ? '完成 ✓' : '下一题 →'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
