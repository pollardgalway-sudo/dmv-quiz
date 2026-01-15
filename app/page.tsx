'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getWrongQuestionsCount } from '@/lib/wrong-questions'

const translations = {
  en: {
    mainTitle: "2026 California CDL Practice Test",
    subtitle: "Class A & B Commercial Driver License Prep",
    questionCount: "Question Bank: 300+ Questions | Choose Your Learning Mode",
    modes: {
      basics: {
        title: "General Knowledge",
        subtitle: "必考通用知识",
        count: "Exam Essentials",
        tags: "Regulations + Safety + Cargo",
        desc: "Compulsory for all CDL applicants. Covers vehicle inspection, basic control, and safe driving."
      },
      deepDive: {
        title: "Air Brakes",
        subtitle: "气制动",
        count: "25 Questions",
        tags: "Air Brakes System",
        desc: "Essential for Class A & B. Master the air brake system parts and safety checks."
      },
      combination: {
        title: "Combination",
        subtitle: "组合车辆",
        count: "20 Questions",
        tags: "Octopus / Trailer",
        desc: "Essential for Class A. Coupling, uncoupling, and driving with trailers."
      },
      mockExam: {
        title: "Mock Exam",
        subtitle: "全真模拟",
        count: "Random 36 Questions",
        tags: "Full CDL Simulation",
        desc: "Real exam experience, mixed questions from all categories. Aim for 90%+ accuarcy."
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
        count: "All Signs",
        tags: "Visual Recognition",
        desc: "Master all California traffic signs, essential for passing the exam"
      }
    },
    suggestions: {
      title: "💡 Learning Suggestions",
      beginner: "Step 1: Start with 'General Knowledge' - this is the foundation for everyone.",
      intermediate: "Step 2: Tackle 'Air Brakes' and 'Combination Vehicles' (for Class A).",
      advanced: "Step 3: Take 'Mock Exams' until you consistently score above 80%.",
      review: "Review: Use the 'Mistake Book' to fix persistent errors."
    },
    viewAll: "View All Mistakes"
  },
  'zh-CN': {
    mainTitle: "2026加州CDL商业驾照笔试",
    subtitle: "California Commercial Driver License Practice",
    questionCount: "题库共 300+ 题 | 选择您的学习模式",
    modes: {
      basics: {
        title: "通用知识",
        subtitle: "General Knowledge",
        count: "必考核心",
        tags: "法规 + 安全 + 货物",
        desc: "所有CDL申请人必考内容。涵盖车辆检查、基本控制、安全驾驶等。"
      },
      deepDive: {
        title: "气制动",
        subtitle: "Air Brakes",
        count: "25题",
        tags: "气刹系统",
        desc: "A/B类驾照必考。掌握气制动系统原理、检查及故障排除。",
      },
      combination: {
        title: "组合车辆",
        subtitle: "Combination",
        count: "20题",
        tags: "拖挂车",
        desc: "A类驾照必考。掌握挂车的连接及驾驶技巧。",
      },
      mockExam: {
        title: "全真模拟",
        subtitle: "Mock Exam",
        count: "随机抽题",
        tags: "完全模拟CDL考试",
        desc: "真实考试体验，混合各类题目。连续3次90%+，实战必过！"
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
        count: "全标致",
        tags: "图像识别",
        desc: "掌握加州所有交通标志，考试必考内容"
      }
    },
    suggestions: {
      title: "💡 学习建议",
      beginner: "第一步: 先拿下「通用知识」(General Knowledge)，这是所有人的必考项。",
      intermediate: "第二步: 攻克「气制动」和「组合车辆」(Class A必考)，这是难点。",
      advanced: "第三步: 多次「全真模拟」，确保分项和混考都能达到80%以上。",
      review: "复习: 利用「错题本」消除顽固错误。"
    },
    viewAll: "清空错题本"
  },
  'zh-TW': {
    mainTitle: "2026加州CDL商業駕照筆試",
    subtitle: "California Commercial Driver License Practice",
    questionCount: "題庫共 300+ 題 | 選擇您的學習模式",
    modes: {
      basics: {
        title: "通用知識",
        subtitle: "General Knowledge",
        count: "必考核心",
        tags: "法規 + 安全 + 貨物",
        desc: "所有CDL申請人必考內容。涵蓋車輛檢查、基本控制、安全駕駛等。"
      },
      deepDive: {
        title: "氣制動",
        subtitle: "Air Brakes",
        count: "25題",
        tags: "氣剎系統",
        desc: "A/B類駕照必考。掌握氣制動系統原理、檢查及故障排除。"
      },
      combination: {
        title: "組合車輛",
        subtitle: "Combination",
        count: "20題",
        tags: "拖掛車",
        desc: "A類駕照必考。掌握掛車的連接及駕駛技巧。"
      },
      mockExam: {
        title: "全真模擬",
        subtitle: "Mock Exam",
        count: "隨機抽題",
        tags: "完全模擬CDL考試",
        desc: "真實考試體驗，混合各類題目。連續3次90%+，實戰必過！"
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
        count: "全標誌",
        tags: "圖像識別",
        desc: "掌握加州所有交通標誌，考試必考內容"
      }
    },
    suggestions: {
      title: "💡 學習建議",
      beginner: "第一步: 先拿下「通用知識」(General Knowledge)，這是所有人的必考項。",
      intermediate: "第二步: 攻克「氣制動」和「組合車輛」(Class A必考)，這是難點。",
      advanced: "第三步: 多次「全真模擬」，確保分項和混考都能達到80%以上。",
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
    icon: '💨',
    color: 'from-blue-400 to-indigo-500',
    hoverColor: 'group-hover:shadow-blue-500/30',
    badgeColor: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    tagColor: 'text-indigo-600 dark:text-indigo-400'
  },
  {
    key: 'combination',
    href: '/combination',
    icon: '🚛',
    color: 'from-orange-400 to-red-500',
    hoverColor: 'group-hover:shadow-orange-500/30',
    badgeColor: 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    tagColor: 'text-red-600 dark:text-red-400'
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
            <span className="text-2xl">🚛</span>
            <span className="font-bold text-lg hidden sm:inline gradient-text">California CDL Prep</span>
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

        {/* Learning Modes Grid - Compact 2-column layout for mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 sm:gap-3 max-w-7xl mx-auto mb-6">
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

                  <CardHeader className="text-center pb-1 pt-3 sm:pt-4 px-2 sm:px-4">
                    <div className={`text-3xl sm:text-4xl mb-1 sm:mb-2 group-hover:animate-bounce-subtle transition-transform`}>
                      {mode.icon}
                    </div>
                    <CardTitle className="text-sm sm:text-base font-bold leading-tight">{modeData.title}</CardTitle>
                    <CardDescription className="text-[10px] sm:text-xs opacity-70 hidden sm:block">{modeData.subtitle}</CardDescription>
                  </CardHeader>

                  <CardContent className="text-center space-y-1 sm:space-y-2 pb-3 sm:pb-4 px-2 sm:px-4">
                    <div className={`${mode.badgeColor} font-bold py-1 px-2 sm:py-1.5 sm:px-3 rounded-lg text-xs sm:text-sm inline-block`}>
                      {mode.key === 'wrongBook' ? `${wrongCount}题` : modeData.count}
                    </div>
                    <div className={`text-[10px] sm:text-xs font-medium ${mode.tagColor}`}>
                      {modeData.tags}
                    </div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground leading-snug line-clamp-2 hidden sm:block">
                      {modeData.desc}
                    </p>

                    {mode.key === 'wrongBook' && (
                      <Button variant="link" className="text-red-500 dark:text-red-400 text-[10px] sm:text-xs p-0 h-auto mt-1">
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
        <footer className="text-center mt-6 pb-6 text-sm text-muted-foreground">
          <p>© 2026 California CDL Prep. Made with ❤️</p>
        </footer>
      </div>
    </div>
  )
}
