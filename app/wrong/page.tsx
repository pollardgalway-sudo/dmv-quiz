'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { getWrongQuestions, removeWrongQuestion, WrongQuestion } from '@/lib/wrong-questions'

type LangType = 'en' | 'zh-Hans' | 'zh-Hant'

interface BaseQuestion {
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
    image?: string
    hasImage?: boolean
    imageUrl?: string | null
    dmv_ref?: {
        page: string
        section: string
        'analysis_zh-Hans': string
        'analysis_zh-Hant': string
    }
}

interface LoadedQuestion extends BaseQuestion {
    source: 'basics' | 'deepdive' | 'signs'
}

export default function WrongQuestionsPage() {
    const [questions, setQuestions] = useState<LoadedQuestion[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [selectedAnswer, setSelectedAnswer] = useState<string>('')
    const [showExplanation, setShowExplanation] = useState(false)
    const [lang, setLang] = useState<LangType>('zh-Hans')
    const [loading, setLoading] = useState(true)
    const [mounted, setMounted] = useState(false)

    const loadQuestions = useCallback(async () => {
        setLoading(true)
        const wrongQuestions = getWrongQuestions()

        if (wrongQuestions.length === 0) {
            setQuestions([])
            setLoading(false)
            return
        }

        // Group by source for efficient loading
        const bySource: Record<string, WrongQuestion[]> = {}
        wrongQuestions.forEach(wq => {
            if (!bySource[wq.source]) bySource[wq.source] = []
            bySource[wq.source].push(wq)
        })

        const loadedQuestions: LoadedQuestion[] = []

        // Load questions from each source
        for (const [source, wqs] of Object.entries(bySource)) {
            let dataUrl = ''
            // 使用 questions-all.json 来加载 basics，确保模拟考试的题目都能找到
            if (source === 'basics') dataUrl = '/data/questions-all.json'
            else if (source === 'deepdive') dataUrl = '/data/questions-deepdive.json'
            else if (source === 'signs') dataUrl = '/data/questions-signs.json'

            if (!dataUrl) continue

            try {
                const res = await fetch(dataUrl)
                if (!res.ok) continue
                const allQuestions: BaseQuestion[] = await res.json()

                const questionIds = new Set(wqs.map(wq => wq.questionId))
                const filtered = allQuestions
                    .filter(q => questionIds.has(q.id))
                    .map(q => ({ ...q, source: source as 'basics' | 'deepdive' | 'signs' }))

                loadedQuestions.push(...filtered)
            } catch (err) {
                console.error(`Failed to load ${source} questions:`, err)
            }
        }

        // Sort by timestamp (newest first) based on wrong questions order
        const orderMap = new Map(wrongQuestions.map((wq, idx) => [`${wq.source}-${wq.questionId}`, idx]))
        loadedQuestions.sort((a, b) => {
            const orderA = orderMap.get(`${a.source}-${a.id}`) ?? 999
            const orderB = orderMap.get(`${b.source}-${b.id}`) ?? 999
            return orderB - orderA // Newest first
        })

        setQuestions(loadedQuestions)
        setCurrentIndex(0)
        setSelectedAnswer('')
        setShowExplanation(false)
        setLoading(false)
    }, [])

    useEffect(() => {
        setMounted(true)
        loadQuestions()
    }, [loadQuestions])

    const currentQuestion = questions[currentIndex]
    const isCorrect = selectedAnswer === currentQuestion?.answer

    const handleSelectAnswer = (option: string) => {
        if (showExplanation) return

        setSelectedAnswer(option)
        setShowExplanation(true)

        // If answered correctly, remove from wrong questions
        if (option === currentQuestion.answer) {
            removeWrongQuestion(currentQuestion.id, currentQuestion.source)
        }
    }

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1)
            setSelectedAnswer('')
            setShowExplanation(false)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        } else {
            // Reload questions after finishing (some may have been removed)
            loadQuestions()
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

    if (!mounted || loading) {
        return (
            <div className="min-h-screen page-gradient flex items-center justify-center">
                <div className="text-center">
                    <div className="relative w-16 h-16 mx-auto mb-4">
                        <div className="absolute inset-0 rounded-full border-4 border-red-200 dark:border-red-900"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-red-500 border-t-transparent animate-spin"></div>
                    </div>
                    <p className="text-muted-foreground">加载错题本...</p>
                </div>
            </div>
        )
    }

    if (questions.length === 0) {
        return (
            <div className="min-h-screen page-gradient flex items-center justify-center">
                <div className="text-center premium-card rounded-2xl p-8 animate-scale-in max-w-md mx-4">
                    <div className="text-7xl mb-6">🎉</div>
                    <h2 className="text-2xl font-bold mb-3 gradient-text">太棒了！</h2>
                    <p className="text-muted-foreground mb-6">
                        您的错题本是空的！继续保持，争取考试一次通过！
                    </p>
                    <Link href="/">
                        <Button
                            className="w-full h-12 text-base font-medium"
                            style={{ background: 'linear-gradient(135deg, #EF4444, #F97316)' }}
                        >
                            返回首页继续学习
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }

    const progress = ((currentIndex + 1) / questions.length) * 100
    const sourceLabels: Record<string, string> = {
        basics: '扫盲模式 (Basics)',
        deepdive: '专项突破 (Deep Dive)',
        signs: '交通标志 (Signs)'
    }

    return (
        <div className="min-h-screen page-gradient transition-colors duration-500">
            {/* Decorative background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-red-400/20 to-orange-400/20 rounded-full blur-3xl animate-float" />
                <div className="absolute bottom-1/4 -left-40 w-60 h-60 bg-gradient-to-br from-pink-400/20 to-rose-400/20 rounded-full blur-3xl animate-float delay-300" />
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
                            className="glass rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition-all touch-target"
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
                                <span className="animate-bounce-subtle">📕</span>
                                <span className="gradient-text">错题本</span>
                            </h1>
                            <p className="text-sm text-muted-foreground mt-1">
                                答对自动移除 • 剩余 {questions.length} 题
                            </p>
                        </div>

                        {/* Remaining Badge */}
                        <div className="glass rounded-xl px-4 py-2 text-center">
                            <div className="text-2xl font-bold text-red-500">{questions.length}</div>
                            <div className="text-xs text-muted-foreground">待掌握</div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                        <div className="progress-bar" style={{ background: 'rgba(239, 68, 68, 0.2)' }}>
                            <div
                                className="progress-bar-fill"
                                style={{
                                    width: `${progress}%`,
                                    background: 'linear-gradient(90deg, #EF4444, #F97316)'
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
                    <div className="h-1 bg-gradient-to-r from-red-400 via-orange-500 to-pink-500" />

                    <CardHeader className="p-4 sm:p-6">
                        {/* Source Badge */}
                        <div className="flex items-center gap-2 mb-3">
                            <span className="glass rounded-full px-3 py-1 text-xs text-muted-foreground">
                                来自: {sourceLabels[currentQuestion.source] || currentQuestion.source}
                            </span>
                        </div>

                        {/* Image if exists (for signs) */}
                        {(currentQuestion.image || (currentQuestion.hasImage && currentQuestion.imageUrl)) && (
                            <div className="flex justify-center mb-4">
                                <div className="relative w-40 h-40 md:w-48 md:h-48 glass rounded-2xl p-3 flex items-center justify-center">
                                    <Image
                                        src={currentQuestion.image || currentQuestion.imageUrl || ''}
                                        alt="Traffic Sign"
                                        width={160}
                                        height={160}
                                        className="object-contain max-w-full max-h-full"
                                        priority
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-red-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                                {currentIndex + 1}
                            </span>
                            <CardTitle className="text-base sm:text-lg md:text-xl leading-relaxed font-medium">
                                {currentQuestion.question[lang]}
                            </CardTitle>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6 pt-0">
                        {/* Options */}
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
                                            : 'border-border hover:border-red-400 hover:bg-accent/50 hover:shadow-md'
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
                                                ? 'border-red-500 bg-red-500'
                                                : 'border-gray-300 dark:border-gray-600'
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
                                                : 'text-red-600 dark:text-red-400'
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

                        {/* Explanation */}
                        {showExplanation && (
                            <div className={`p-4 sm:p-5 rounded-xl border-2 animate-scale-in ${isCorrect
                                ? 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-300 dark:border-emerald-700'
                                : 'bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-300 dark:border-red-700'
                                }`}>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-2xl">{isCorrect ? '🎉' : '💪'}</span>
                                    <p className="font-bold text-base sm:text-lg">
                                        {isCorrect ? '答对了！已从错题本移除' : `正确答案是 ${currentQuestion.answer}`}
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

                        {/* Navigation Buttons */}
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
                                className="w-full sm:w-auto sm:flex-1 h-12 sm:h-11 text-base font-medium touch-target"
                                style={{ background: 'linear-gradient(135deg, #EF4444, #F97316)' }}
                            >
                                {currentIndex === questions.length - 1 ? '完成复习' : '下一题 →'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
