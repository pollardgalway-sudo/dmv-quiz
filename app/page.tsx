'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getWrongQuestionsCount } from '@/lib/wrong-questions'

const translations = {
  en: {
    mainTitle: "2026 California DMV Written Test",
    subtitle: "California Driver License Practice",
    questionCount: "Question Bank: 305 Questions | Choose Your Learning Mode",
    modes: {
      basics: {
        title: "The Basics",
        subtitle: "扫盲模式",
        count: "70 Questions",
        tags: "Basic Signs + Core Numbers",
        desc: "Perfect for beginners. Build confidence and master the most fundamental traffic knowledge."
      },
      deepDive: {
        title: "Deep Dive",
        subtitle: "专项突破",
        count: "137 Questions",
        tags: "Rules + Safety + Laws",
        desc: "Master detailed traffic rules, safety knowledge, and California driving laws."
      },
      combination: {
        title: "Tricky Questions",
        subtitle: "易错精选",
        count: "98 Questions",
        tags: "High Error Rate",
        desc: "Collection of commonly missed questions. Conquer these to boost your score!"
      },
      mockExam: {
        title: "Mock Exam",
        subtitle: "全真模拟",
        count: "Random 36 Questions",
        tags: "Full DMV Simulation",
        desc: "Real exam experience, mixed questions from all categories. Aim for 83%+ accuracy."
      },
      wrongBook: {
        title: "Mistake Book",
        subtitle: "错题本",
        count: "Review",
        tags: "Target Weak Points",
        desc: "Focus on your mistakes, consolidate weak knowledge points"
      },
      trafficSigns: {
        title: "Traffic Signs",
        subtitle: "交通标志",
        count: "98 Signs",
        tags: "Visual Recognition",
        desc: "Master all California traffic signs, essential for passing the exam"
      }
    },
    suggestions: {
      title: "💡 Learning Suggestions",
      beginner: "Step 1: Start with 'The Basics' - build your foundation.",
      intermediate: "Step 2: Tackle 'Deep Dive' for detailed rules and laws.",
      advanced: "Step 3: Take 'Mock Exams' until you consistently score above 83%.",
      review: "Review: Use the 'Mistake Book' to fix persistent errors."
    },
    viewAll: "View All Mistakes"
  },
  'zh-CN': {
    mainTitle: "2026加州驾照笔试题目",
    subtitle: "California DMV Written Test Practice",
    questionCount: "题库共 345 题 | 选择您的学习模式",
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
        count: "177题",
        tags: "规则 + 安全 + 法规",
        desc: "深入学习交通规则、安全知识和加州驾驶法规"
      },
      combination: {
        title: "易错精选",
        subtitle: "Tricky Questions",
        count: "98题",
        tags: "高错误率题目",
        desc: "常见错题集锦，攻克这些题目提升分数！"
      },
      mockExam: {
        title: "全真模拟",
        subtitle: "Mock Exam",
        count: "随机抽36题",
        tags: "完全模拟DMV考试",
        desc: "真实考试体验，混合各类题目。连续3次83%+，实战必过！"
      },
      wrongBook: {
        title: "错题本",
        subtitle: "Mistake Book",
        count: "复习",
        tags: "专攻薄弱环节",
        desc: "专门练习您做错的题目，巩固薄弱知识点"
      },
      trafficSigns: {
        title: "交通标志",
        subtitle: "Traffic Signs",
        count: "98个标志",
        tags: "图像识别",
        desc: "掌握加州所有交通标志，考试必考内容"
      }
    },
    suggestions: {
      title: "💡 学习建议",
      beginner: "第一步: 先从「扫盲模式」开始，打好基础。",
      intermediate: "第二步: 攻克「专项突破」，深入学习规则法规。",
      advanced: "第三步: 多次「全真模拟」，确保能达到83%以上。",
      review: "复习: 利用「错题本」消除顽固错误。"
    },
    viewAll: "清空错题本"
  },
  'zh-TW': {
    mainTitle: "2026加州駕照筆試題目",
    subtitle: "California DMV Written Test Practice",
    questionCount: "題庫共 345 題 | 選擇您的學習模式",
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
        count: "177題",
        tags: "規則 + 安全 + 法規",
        desc: "深入學習交通規則、安全知識和加州駕駛法規"
      },
      combination: {
        title: "易錯精選",
        subtitle: "Tricky Questions",
        count: "98題",
        tags: "高錯誤率題目",
        desc: "常見錯題集錦，攻克這些題目提升分數！"
      },
      mockExam: {
        title: "全真模擬",
        subtitle: "Mock Exam",
        count: "隨機抽36題",
        tags: "完全模擬DMV考試",
        desc: "真實考試體驗，混合各類題目。連續3次83%+，實戰必過！"
      },
      wrongBook: {
        title: "錯題本",
        subtitle: "Mistake Book",
        count: "複習",
        tags: "專攻薄弱環節",
        desc: "專門練習您做錯的題目，鞏固薄弱知識點"
      },
      trafficSigns: {
        title: "交通標誌",
        subtitle: "Traffic Signs",
        count: "98個標誌",
        tags: "圖像識別",
        desc: "掌握加州所有交通標誌，考試必考內容"
      }
    },
    suggestions: {
      title: "💡 學習建議",
      beginner: "第一步: 先從「掃盲模式」開始，打好基礎。",
      intermediate: "第二步: 攻克「專項突破」，深入學習規則法規。",
      advanced: "第三步: 多次「全真模擬」，確保能達到83%以上。",
      review: "複習: 利用「錯題本」消除頑固錯誤。"
    },
    viewAll: "清空錯題本"
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
            <span className="font-bold text-lg hidden sm:inline gradient-text">California DMV Prep</span>
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
      <div className="relative z-10 container mx-auto px-4 py-4 md:py-8">
        <div className="text-center space-y-3 max-w-4xl mx-auto mb-6 animate-fade-in-up">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight">
            <span className="text-slate-900 dark:text-white" style={{ textShadow: '1px 1px 0 rgba(0,0,0,0.1)' }}>{t.mainTitle}</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 font-medium">
            {t.subtitle}
          </p>
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-muted-foreground">{t.questionCount}</span>
          </div>
        </div>

        {/* Learning Modes Grid - Single column on mobile, multi-column on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto mb-8">
          {modeConfigs.map((mode, index) => {
            const modeData = t.modes[mode.key as keyof typeof t.modes]
            const CardWrapper = mode.href === '#' ? 'div' : Link

            return (
              <CardWrapper
                key={mode.key}
                href={mode.href}
                className={`block group animate-fade-in-up`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Card className={`h-full premium-card overflow-hidden relative ${mode.hoverColor}`}>
                  {/* Gradient top border */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${mode.color}`} />

                  <CardHeader className="text-center pb-2 pt-5 px-4">
                    <div className={`text-4xl sm:text-5xl mb-2 sm:mb-3 group-hover:animate-bounce-subtle transition-transform`}>
                      {mode.icon}
                    </div>
                    <CardTitle className="text-xl sm:text-2xl font-bold leading-tight">{modeData.title}</CardTitle>
                    <CardDescription className="text-sm sm:text-base opacity-70">{modeData.subtitle}</CardDescription>
                  </CardHeader>

                  <CardContent className="text-center space-y-2 sm:space-y-3 pb-5 px-4">
                    <div className={`${mode.badgeColor} font-bold py-1.5 px-3 sm:py-2 sm:px-4 rounded-lg text-sm sm:text-base inline-block`}>
                      {mode.key === 'wrongBook' ? `${wrongCount}题` : modeData.count}
                    </div>
                    <div className={`text-xs sm:text-sm font-medium ${mode.tagColor}`}>
                      {modeData.tags}
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {modeData.desc}
                    </p>

                    {mode.key === 'wrongBook' && (
                      <Button variant="link" className="text-red-500 dark:text-red-400 text-xs sm:text-sm p-0 h-auto mt-1">
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
        <Card className="max-w-5xl mx-auto premium-card overflow-hidden animate-fade-in-up" style={{ animationDelay: '600ms' }}>
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
        <footer className="text-center mt-6 pb-6 text-sm text-muted-foreground">
          <p>© 2026 California DMV Prep. Made with ❤️</p>
        </footer>
      </div>
    </div>
  )
}
