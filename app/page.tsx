'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getWrongQuestionsCount } from '@/lib/wrong-questions'

const translations = {
  en: {
    mainTitle: "2026 California DMV Written Test",
    subtitle: "California DMV Written Test Practice",
    questionCount: "Question Bank: 305 Questions | Choose Your Learning Mode",
    modes: {
      basics: {
        title: "The Basics",
        subtitle: "扫盲模式",
        count: "70 Questions",
        tags: "Basic Signs + Core Numbers",
        desc: "Perfect for complete beginners, build confidence, master essential traffic rules"
      },
      deepDive: {
        title: "Deep Dive",
        subtitle: "专项突破",
        count: "137 Questions",
        tags: "Scenario Judgment + Logic Reasoning",
        desc: "Cover all difficult, scenario, and special questions, comprehensive mastery of all exam points"
      },
      mockExam: {
        title: "Mock Exam",
        subtitle: "全真模拟",
        count: "Random 36 Questions",
        tags: "Full DMV Exam Simulation",
        desc: "Real exam experience, error rate below 10%, practice 3 times to reach 90%+, combat ready!"
      },
      wrongBook: {
        title: "Wrong Questions",
        subtitle: "错题本",
        count: "21 Questions",
        tags: "Target Weak Points",
        desc: "Focus on your mistakes, consolidate weak knowledge points"
      },
      trafficSigns: {
        title: "Traffic Signs",
        subtitle: "交通标志",
        count: "98 Questions",
        tags: "Visual Recognition",
        desc: "Master all California traffic signs, essential for passing the exam"
      }
    },
    suggestions: {
      title: "💡 Learning Suggestions",
      beginner: "Complete Beginner: Start with 'The Basics' → then 'Deep Dive' → finally 'Mock Exam' to check results",
      intermediate: "Have Foundation: Go directly to 'Deep Dive' to fill gaps → 'Mock Exam' for practice",
      advanced: "Pre-Exam Rush: Take more 'Mock Exams', confirm 3 consecutive passes with 90%+ accuracy",
      review: "Wrong Questions: System automatically collects your mistakes, pass 'Wrong Questions' review mode to consolidate weak points. Answer all correctly and 'Pass' is removable"
    },
    viewAll: "View All Wrong Questions"
  },
  'zh-CN': {
    mainTitle: "2026加州驾照笔试题目",
    subtitle: "California DMV Written Test Practice",
    questionCount: "题库共 305 题 | 选择您的学习模式",
    modes: {
      basics: {
        title: "扫盲模式",
        subtitle: "The Basics",
        count: "70题",
        tags: "基础标志 + 核心数字",
        desc: "适合零基础学员，建立信心，掌握最基本的交通知识"
      },
      deepDive: {
        title: "专项突破",
        subtitle: "Deep Dive",
        count: "137题",
        tags: "场景判断 + 逻辑推理",
        desc: "涵盖所有难题、场景、标志等所有场景，全面深度学习攻克考点"
      },
      mockExam: {
        title: "全真模拟",
        subtitle: "Mock Exam",
        count: "随机36题",
        tags: "完全模拟DMV考试",
        desc: "真实考试体验，错题率以内通过，连续3次90%+，实战必过！"
      },
      wrongBook: {
        title: "错题本",
        subtitle: "Wrong Questions",
        count: "21题",
        tags: "专攻薄弱环节",
        desc: "专门练习您做错的题目，巩固薄弱知识点"
      },
      trafficSigns: {
        title: "交通标志",
        subtitle: "Traffic Signs",
        count: "98题",
        tags: "图像识别",
        desc: "掌握加州所有交通标志，考试必考内容"
      }
    },
    suggestions: {
      title: "💡 学习建议",
      beginner: "完全小白: 先做「扫盲模式」建立信心 → 再做「专项突破」深入学习 → 最后「全真模拟」检验成果",
      intermediate: "有基础: 直接「专项突破」查漏补缺 → 「全真模拟」实战演练",
      advanced: "考前冲刺: 多次「全真模拟」，确保连续3次达到90%以上正确率",
      review: "错题本: 系统会自动收集您做错的题目，通过「错题本」模式复习薄弱知识点。答对后点击「已掌握」可移除"
    },
    viewAll: "请空错题本"
  },
  'zh-TW': {
    mainTitle: "2026加州駕照筆試題目",
    subtitle: "California DMV Written Test Practice",
    questionCount: "題庫共 305 題 | 選擇您的學習模式",
    modes: {
      basics: {
        title: "掃盲模式",
        subtitle: "The Basics",
        count: "70題",
        tags: "基礎標誌 + 核心數字",
        desc: "適合零基礎學員，建立信心，掌握最基本的交通知識"
      },
      deepDive: {
        title: "專項突破",
        subtitle: "Deep Dive",
        count: "137題",
        tags: "場景判斷 + 邏輯推理",
        desc: "涵蓋所有難題、場景、標誌等所有場景，全面深度學習攻克考點"
      },
      mockExam: {
        title: "全真模擬",
        subtitle: "Mock Exam",
        count: "隨機36題",
        tags: "完全模擬DMV考試",
        desc: "真實考試體驗，錯題率以內通過，連續3次90%+，實戰必過！"
      },
      wrongBook: {
        title: "錯題本",
        subtitle: "Wrong Questions",
        count: "21題",
        tags: "專攻薄弱環節",
        desc: "專門練習您做錯的題目，鞏固薄弱知識點"
      },
      trafficSigns: {
        title: "交通標誌",
        subtitle: "Traffic Signs",
        count: "98題",
        tags: "圖像識別",
        desc: "掌握加州所有交通標誌，考試必考內容"
      }
    },
    suggestions: {
      title: "💡 學習建議",
      beginner: "完全小白: 先做「掃盲模式」建立信心 → 再做「專項突破」深入學習 → 最後「全真模擬」檢驗成果",
      intermediate: "有基礎: 直接「專項突破」查漏補缺 → 「全真模擬」實戰演練",
      advanced: "考前衝刺: 多次「全真模擬」，確保連續3次達到90%以上正確率",
      review: "錯題本: 系統會自動收集您做錯的題目，通過「錯題本」模式複習薄弱知識點。答對後點擊「已掌握」可移除"
    },
    viewAll: "請空錯題本"
  }
}

type LangType = 'en' | 'zh-CN' | 'zh-TW';

const modeConfigs = [
  {
    key: 'basics',
    href: '/basics',
    icon: '📚',
    color: 'from-emerald-400 to-teal-500',
    hoverColor: 'group-hover:shadow-emerald-500/30',
    badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    tagColor: 'text-teal-600 dark:text-teal-400'
  },
  {
    key: 'deepDive',
    href: '/deepdive',
    icon: '🎯',
    color: 'from-blue-400 to-indigo-500',
    hoverColor: 'group-hover:shadow-blue-500/30',
    badgeColor: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    tagColor: 'text-indigo-600 dark:text-indigo-400'
  },
  {
    key: 'mockExam',
    href: '/exam',
    icon: '🏆',
    color: 'from-purple-400 to-pink-500',
    hoverColor: 'group-hover:shadow-purple-500/30',
    badgeColor: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    tagColor: 'text-pink-600 dark:text-pink-400'
  },
  {
    key: 'trafficSigns',
    href: '/signs',
    icon: '🚦',
    color: 'from-amber-400 to-yellow-500',
    hoverColor: 'group-hover:shadow-amber-500/30',
    badgeColor: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    tagColor: 'text-yellow-600 dark:text-yellow-400'
  },
  {
    key: 'wrongBook',
    href: '/wrong',
    icon: '📕',
    color: 'from-red-400 to-orange-500',
    hoverColor: 'group-hover:shadow-red-500/30',
    badgeColor: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    tagColor: 'text-orange-600 dark:text-orange-400'
  }
]

export default function Home() {
  const [lang, setLang] = useState<LangType>('zh-CN')
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [wrongCount, setWrongCount] = useState(0)
  const t = translations[lang]

  useEffect(() => {
    setMounted(true)
    // Check system preference
    if (typeof window !== 'undefined') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setIsDark(prefersDark)
      if (prefersDark) {
        document.documentElement.classList.add('dark')
      }
      // Load wrong questions count
      setWrongCount(getWrongQuestionsCount())

      // Listen for updates
      const handleUpdate = () => setWrongCount(getWrongQuestionsCount())
      window.addEventListener('wrongQuestionsUpdated', handleUpdate)
      return () => window.removeEventListener('wrongQuestionsUpdated', handleUpdate)
    }
  }, [])

  const toggleDarkMode = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <div className="min-h-screen page-gradient transition-colors duration-500">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-float" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-gradient-to-br from-pink-400/20 to-orange-400/20 rounded-full blur-3xl animate-float delay-200" />
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-gradient-to-br from-cyan-400/20 to-emerald-400/20 rounded-full blur-3xl animate-float delay-500" />
      </div>

      {/* Top Navigation Bar */}
      <nav className="relative z-10 glass border-b border-white/20 dark:border-white/5">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">🚗</span>
            <span className="font-bold text-lg hidden sm:inline gradient-text">DMV Practice</span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl glass hover:bg-white/30 dark:hover:bg-white/10 transition-all duration-300 touch-target"
              aria-label="Toggle dark mode"
            >
              {mounted && (isDark ? '🌙' : '☀️')}
            </button>

            {/* Language Switcher */}
            <div className="flex items-center gap-2 glass rounded-xl px-3 py-2">
              <span className="text-blue-600 dark:text-blue-400">🌐</span>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as LangType)}
                className="bg-transparent border-none outline-none cursor-pointer text-sm font-medium text-foreground"
              >
                <option value="zh-CN">中文</option>
                <option value="zh-TW">繁體</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-4 py-8 md:py-16">
        <div className="text-center space-y-4 max-w-4xl mx-auto mb-12 animate-fade-in-up">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold">
            <span className="gradient-text">{t.mainTitle}</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
            {t.subtitle}
          </p>
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-muted-foreground">{t.questionCount}</span>
          </div>
        </div>

        {/* Learning Modes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6 max-w-7xl mx-auto mb-12">
          {modeConfigs.map((mode, index) => {
            const modeData = t.modes[mode.key as keyof typeof t.modes]
            const CardWrapper = mode.href === '#' ? 'div' : Link

            return (
              <CardWrapper
                key={mode.key}
                href={mode.href}
                className={`block group animate-fade-in-up`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Card className={`h-full premium-card overflow-hidden relative ${mode.hoverColor}`}>
                  {/* Gradient top border */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${mode.color}`} />

                  <CardHeader className="text-center pb-2 pt-6">
                    <div className={`text-5xl mb-3 group-hover:animate-bounce-subtle transition-transform`}>
                      {mode.icon}
                    </div>
                    <CardTitle className="text-xl font-bold">{modeData.title}</CardTitle>
                    <CardDescription className="text-xs opacity-70">{modeData.subtitle}</CardDescription>
                  </CardHeader>

                  <CardContent className="text-center space-y-3 pb-6">
                    <div className={`${mode.badgeColor} font-bold py-2 px-4 rounded-xl text-base inline-block`}>
                      {mode.key === 'wrongBook' ? `${wrongCount}题` : modeData.count}
                    </div>
                    <div className={`text-xs font-medium ${mode.tagColor}`}>
                      {modeData.tags}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                      {modeData.desc}
                    </p>

                    {mode.key === 'wrongBook' && (
                      <Button variant="link" className="text-red-500 dark:text-red-400 text-xs p-0 h-auto mt-2">
                        {t.viewAll}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </CardWrapper>
            )
          })}
        </div>

        {/* Learning Suggestions */}
        <Card className="max-w-7xl mx-auto premium-card overflow-hidden animate-fade-in-up" style={{ animationDelay: '600ms' }}>
          {/* Gradient top border */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-red-400" />

          <CardHeader className="pt-6">
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="animate-bounce-subtle">💡</span>
              <span>{lang === 'en' ? 'Learning Suggestions' : lang === 'zh-TW' ? '學習建議' : '学习建议'}</span>
            </CardTitle>
          </CardHeader>

          <CardContent className="pb-6">
            <div className="grid gap-3">
              {[
                { label: lang === 'en' ? 'Complete Beginner' : lang === 'zh-TW' ? '完全小白' : '完全小白', text: t.suggestions.beginner.split(': ')[1], color: 'from-emerald-500 to-teal-500' },
                { label: lang === 'en' ? 'Have Foundation' : lang === 'zh-TW' ? '有基礎' : '有基础', text: t.suggestions.intermediate.split(': ')[1], color: 'from-blue-500 to-indigo-500' },
                { label: lang === 'en' ? 'Pre-Exam Rush' : lang === 'zh-TW' ? '考前衝刺' : '考前冲刺', text: t.suggestions.advanced.split(': ')[1], color: 'from-purple-500 to-pink-500' },
                { label: lang === 'en' ? 'Wrong Questions' : lang === 'zh-TW' ? '錯題本' : '错题本', text: t.suggestions.review.split(': ')[1], color: 'from-red-500 to-orange-500' }
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-xl hover:bg-accent/50 transition-colors">
                  <div className={`w-1 h-full min-h-[40px] rounded-full bg-gradient-to-b ${item.color}`} />
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-sm">{item.label}:</span>
                    <span className="text-sm text-muted-foreground ml-1">{item.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <footer className="text-center mt-12 pb-8 text-sm text-muted-foreground">
          <p>© 2026 California DMV Practice. Made with ❤️</p>
        </footer>
      </div>
    </div>
  )
}
