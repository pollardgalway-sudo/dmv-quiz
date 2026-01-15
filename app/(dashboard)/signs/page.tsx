'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { addWrongQuestion } from '@/lib/wrong-questions'

// Matches the structure of data/questions-signs.json
interface SignQuestion {
  id: string
  question: string
  options: string[]
  answer: string
  explanation: string
  image: string
  category: string
}

export default function SignsPage() {
  const [questions, setQuestions] = useState<SignQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string>('')
  const [showExplanation, setShowExplanation] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetch('/data/questions-signs.json')
      .then(res => res.json())
      .then(data => setQuestions(data))
      .catch(err => console.error('Failed to load signs:', err))
  }, [])

  if (!mounted || questions.length === 0) {
    return (
      <div className="min-h-screen page-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-amber-200 dark:border-amber-900"></div>
            <div className="absolute inset-0 rounded-full border-4 border-amber-500 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-muted-foreground">Loading Signs...</p>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]
  const isCorrect = selectedAnswer === currentQuestion.answer
  // const progress = ((currentIndex + 1) / questions.length) * 100

  const handleSelectAnswer = (option: string) => {
    if (showExplanation) return

    setSelectedAnswer(option)
    setShowExplanation(true)

    if (option === currentQuestion.answer) {
      setScore(prev => ({ ...prev, correct: prev.correct + 1, total: prev.total + 1 }))
    } else {
      setScore(prev => ({ ...prev, total: prev.total + 1 }))
      // Parse id number if possible "sign-1" -> 1
      const idNum = parseInt(currentQuestion.id.split('-')[1]) || 0
      if (idNum) addWrongQuestion(idNum, 'signs')
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
      {/* Navigation */}
      <nav className="relative z-10 glass border-b border-white/20 dark:border-white/5 sticky top-0">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity touch-target">
            <span className="text-xl">←</span>
            <span className="font-medium text-sm hidden sm:inline">Back to Home</span>
          </Link>
          <div className="glass rounded-xl px-3 py-2 text-sm font-medium">
            Question {currentIndex + 1} / {questions.length}
          </div>
        </div>
      </nav>

      <div className="relative z-10 container mx-auto px-4 py-6 max-w-4xl">
        {/* Header Card */}
        <div className="premium-card rounded-2xl p-4 sm:p-6 mb-6 animate-fade-in-up">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <span className="text-3xl">🚦</span>
                <span className="gradient-text">Traffic Signs</span>
              </h1>
              <p className="text-muted-foreground mt-1">CDL Specific Signs</p>
            </div>
            <div className="glass px-4 py-2 rounded-xl text-center">
              <div className="text-2xl font-bold text-amber-500">{score.correct}</div>
              <div className="text-xs text-muted-foreground">Correct</div>
            </div>
          </div>
        </div>

        {/* Question Card */}
        <Card className="premium-card overflow-hidden animate-fade-in-up">
          <div className="h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500" />
          <CardHeader className="p-6">
            <div className="flex flex-col items-center mb-6">
              {/* Image Placeholder if image fails or for mock */}
              <div className="w-48 h-48 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-4 border-2 border-dashed border-gray-300">
                <div className="text-center p-4">
                  <div className="text-4xl mb-2">🛑</div>
                  <div className="text-xs text-muted-foreground break-all">{currentQuestion.id}</div>
                  <div className="text-xs text-red-500 font-bold mt-2 hover:opacity-80">
                    {currentQuestion.image.split('/').pop()}
                  </div>
                </div>
              </div>
              <CardTitle className="text-xl text-center">{currentQuestion.question}</CardTitle>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 p-6 pt-0">
            <div className="grid grid-cols-1 gap-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === option
                const isCorrectOption = currentQuestion.answer === option

                let borderClass = 'border-border hover:border-amber-400'
                let bgClass = ''

                if (showExplanation) {
                  if (isCorrectOption) {
                    borderClass = 'border-emerald-500'
                    bgClass = 'bg-emerald-50 dark:bg-emerald-900/20'
                  } else if (isSelected) {
                    borderClass = 'border-red-500'
                    bgClass = 'bg-red-50 dark:bg-red-900/20'
                  } else {
                    bgClass = 'opacity-60'
                  }
                } else if (isSelected) {
                  borderClass = 'border-amber-500'
                  bgClass = 'bg-amber-50 dark:bg-amber-900/20'
                }

                return (
                  <div
                    key={index}
                    onClick={() => handleSelectAnswer(option)}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3 ${borderClass} ${bgClass}`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                       ${isSelected || (showExplanation && isCorrectOption) ? 'border-amber-500 bg-amber-500' : 'border-gray-300'}`}>
                      {(isSelected || (showExplanation && isCorrectOption)) && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <span className="font-medium">{option}</span>
                    {showExplanation && isCorrectOption && <span className="ml-auto text-emerald-500">✓</span>}
                    {showExplanation && isSelected && !isCorrectOption && <span className="ml-auto text-red-500">✗</span>}
                  </div>
                )
              })}
            </div>

            {showExplanation && (
              <div className="mt-6 p-4 rounded-xl bg-muted/50 border animate-scale-in">
                <p className="font-bold mb-2">Explanation:</p>
                <p className="text-muted-foreground">{currentQuestion.explanation}</p>
              </div>
            )}

            <div className="flex justify-between mt-8">
              <Button onClick={handlePrevious} disabled={currentIndex === 0} variant="outline">Previous</Button>
              <Button onClick={handleNext} disabled={currentIndex === questions.length - 1}>
                {currentIndex === questions.length - 1 ? 'Finish' : 'Next'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
