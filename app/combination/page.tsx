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

export default function CombinationPage() {
    const [questions, setQuestions] = useState<Question[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [selectedAnswer, setSelectedAnswer] = useState<string>('')
    const [showExplanation, setShowExplanation] = useState(false)
    const [score, setScore] = useState({ correct: 0, total: 0 })
    const [lang, setLang] = useState<'en' | 'zh-Hans' | 'zh-Hant'>('zh-Hans')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        setLoading(true)
        fetch('/data/questions-all.json')
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`)
                }
                return res.json()
            })
            .then(data => {
                setQuestions(data)
                setLoading(false)
            })
            .catch(err => {
                console.error('Failed to load questions:', err)
                setError(err.message || '加载题目失败')
                setLoading(false)
            })
    }, [])

    if (!mounted || loading) {
        return (
            <div className="min-h-screen page-gradient flex items-center justify-center">
                <div className="text-center">
                    <div className="relative w-16 h-16 mx-auto mb-4">
                        <div className="absolute inset-0 rounded-full border-4 border-orange-200 dark:border-orange-900"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-orange-500 border-t-transparent animate-spin"></div>
                    </div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen page-gradient flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6 premium-card rounded-2xl animate-scale-in">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h2 className="text-xl font-bold mb-2">Load Failed</h2>
                    <p className="text-muted-foreground mb-4">{error}</p>
                    <Button
                        onClick={() => window.location.reload()}
                        className="premium-button"
                    >
                        Reload
                    </Button>
                </div>
            </div>
        )
    }

    if (questions.length === 0) {
        return (
            <div className="min-h-screen page-gradient flex items-center justify-center">
                <div className="text-center premium-card rounded-2xl p-8 animate-scale-in">
                    <div className="text-6xl mb-4">📚</div>
                    <p className="text-muted-foreground">No Questions Available</p>
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
            // Add to wrong questions using the question's actual source
            const qSource = (currentQuestion as any).source || 'basics'
            const validSource = (['basics', 'deepdive', 'signs'].includes(qSource) ? qSource : 'basics') as 'basics' | 'deepdive' | 'signs'
            addWrongQuestion(currentQuestion.id, validSource)
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
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-400/20 to-red-400/20 rounded-full blur-3xl animate-float" />
                <div className="absolute bottom-1/4 -left-40 w-60 h-60 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-full blur-3xl animate-float delay-300" />
            </div>

            {/* Navigation */}
            <nav className="relative z-10 glass border-b border-white/20 dark:border-white/5 sticky top-0">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity touch-target">
                        <span className="text-xl">←</span>
                        <span className="font-medium text-sm hidden sm:inline">Back to Home</span>
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
                            className="glass rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all touch-target"
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
                                <span className="animate-bounce-subtle">⚠️</span>
                                <span className="gradient-text">易错精选 (Tricky Questions)</span>
                            </h1>
                            <p className="text-sm text-muted-foreground mt-1">
                                Score: {score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0}%
                                <span className="mx-2">•</span>
                                Answered {score.total}
                            </p>
                        </div>

                        {/* Score Badge */}
                        <div className="glass rounded-xl px-4 py-2 text-center">
                            <div className="text-2xl font-bold gradient-text">{score.correct}</div>
                            <div className="text-xs text-muted-foreground">Correct</div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                        <div className="progress-bar" style={{ background: 'rgba(249, 115, 22, 0.2)' }}>
                            <div
                                className="progress-bar-fill"
                                style={{
                                    width: `${progress}%`,
                                    background: 'linear-gradient(90deg, #F59E0B, #EF4444)'
                                }}
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
                    <div className="h-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500" />

                    <CardHeader className="p-4 sm:p-6">
                        <div className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-sm">
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
                                            : 'border-border hover:border-orange-400 hover:bg-accent/50 hover:shadow-md'
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
                                                ? 'border-orange-500 bg-orange-500'
                                                : 'border-gray-300 dark:border-gray-600 group-hover:border-orange-400'
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
                                                : 'text-orange-600 dark:text-orange-400'
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
                                        {isCorrect ? 'Correct!' : `Answer is ${currentQuestion.answer}`}
                                    </p>
                                </div>
                                <p className="text-sm sm:text-base mb-4 leading-relaxed text-muted-foreground">
                                    {currentQuestion.explanation[lang]}
                                </p>
                                <div className="glass rounded-lg p-3 space-y-2">
                                    <p className="text-sm flex items-center gap-2">
                                        <span>📖</span>
                                        <span className="font-medium">Ref:</span>
                                        <span className="text-muted-foreground">{currentQuestion.dmv_ref.section}, pg {currentQuestion.dmv_ref.page}</span>
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
                                ← Previous
                            </Button>
                            <Button
                                onClick={handleNext}
                                disabled={currentIndex === questions.length - 1}
                                className="w-full sm:w-auto sm:flex-1 h-12 sm:h-11 text-base font-medium touch-target"
                                style={{ background: 'linear-gradient(135deg, #F59E0B, #EF4444)' }}
                            >
                                Next →
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
