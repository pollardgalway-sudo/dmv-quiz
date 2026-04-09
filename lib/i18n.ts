/**
 * UI 文本国际化 - 支持简体中文、繁体中文、英文
 */

export type Lang = 'en' | 'zh-Hans' | 'zh-Hant'

const uiTexts = {
  loading: { en: 'Loading...', 'zh-Hans': '加载中...', 'zh-Hant': '加載中...' },
  backToHome: { en: 'Back', 'zh-Hans': '返回首页', 'zh-Hant': '返回首頁' },
  backToHomeArrow: { en: '← Back', 'zh-Hans': '← 返回首页', 'zh-Hant': '← 返回首頁' },
  prevQuestion: { en: '← Previous', 'zh-Hans': '← 上一题', 'zh-Hant': '← 上一題' },
  nextQuestion: { en: 'Next →', 'zh-Hans': '下一题 →', 'zh-Hant': '下一題 →' },
  finish: { en: 'Finish ✓', 'zh-Hans': '完成 ✓', 'zh-Hant': '完成 ✓' },
  congrats: { en: 'Congratulations!', 'zh-Hans': '恭喜完成！', 'zh-Hant': '恭喜完成！' },
  completedAll: { en: 'You have completed all', 'zh-Hans': '您已完成所有', 'zh-Hant': '您已完成所有' },
  questions: { en: 'questions', 'zh-Hans': '道题目', 'zh-Hant': '道題目' },
  signQuestions: { en: 'sign questions', 'zh-Hans': '道交通标志题目', 'zh-Hant': '道交通標誌題目' },
  accuracy: { en: 'Accuracy', 'zh-Hans': '正确率', 'zh-Hant': '正確率' },
  restart: { en: '🔄 Restart', 'zh-Hans': '🔄 重新开始', 'zh-Hant': '🔄 重新開始' },
  correct: { en: 'Correct!', 'zh-Hans': '回答正确！', 'zh-Hant': '回答正確！' },
  correctAnswerIs: { en: 'Correct answer is', 'zh-Hans': '正确答案是', 'zh-Hant': '正確答案是' },
  reference: { en: 'Reference', 'zh-Hans': '参考', 'zh-Hant': '參考' },
  page: { en: 'page', 'zh-Hans': '页', 'zh-Hant': '頁' },
  section: { en: 'Section', 'zh-Hans': '第', 'zh-Hant': '第' },

  // Wrong questions page
  wrongQuestionsTitle: { en: 'Wrong Questions', 'zh-Hans': '错题本', 'zh-Hant': '錯題本' },
  noWrongQuestions: { en: 'No wrong questions', 'zh-Hans': '还没有错题记录', 'zh-Hant': '還沒有錯題記錄' },
  wrongCorrectRemoved: { en: 'Correct! Removed from wrong list', 'zh-Hans': '答对了！已从错题本移除', 'zh-Hant': '答對了！已從錯題本移除' },
  finishReview: { en: 'Finish Review', 'zh-Hans': '完成复习', 'zh-Hant': '完成複習' },
  continueStudy: { en: 'Continue studying', 'zh-Hans': '返回首页继续学习', 'zh-Hant': '返回首頁繼續學習' },

  // Demo page
  demoFinished: { en: 'Demo Complete!', 'zh-Hans': '试用完成！', 'zh-Hant': '試用完成！' },
  demoCompleted: { en: 'free demo questions', 'zh-Hans': '道免费试用题目', 'zh-Hant': '道免費試用題目' },
  finishDemo: { en: 'Finish Demo →', 'zh-Hans': '完成试用 →', 'zh-Hant': '完成試用 →' },
  backToXHS: { en: '📕 Purchase to continue', 'zh-Hans': '📕 返回小红书拍下继续使用', 'zh-Hant': '📕 返回小紅書拍下繼續使用' },
} as const

export function t(key: keyof typeof uiTexts, lang: Lang): string {
  return uiTexts[key]?.[lang] || uiTexts[key]?.['zh-Hans'] || key
}
