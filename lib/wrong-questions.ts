// Wrong Questions Manager - localStorage based state management
// 错题本管理器 - 使用 localStorage 持久化存储

export interface WrongQuestion {
    questionId: number
    source: 'basics' | 'deepdive' | 'signs'
    timestamp: number
}

const STORAGE_KEY = 'dmv_wrong_questions'
const MIGRATION_KEY = 'dmv_wrong_questions_migrated_v3'

// v3: All question IDs were reassigned during data rebuild.
// Old wrong-question records reference stale IDs, so we clear them.
function migrateOldIds(): void {
    if (typeof window === 'undefined') return
    if (localStorage.getItem(MIGRATION_KEY)) return // Already migrated

    try {
        // Clear any old wrong questions since IDs no longer match
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
            console.log('[错题本] Clearing old wrong questions (IDs reassigned in v3)')
            localStorage.removeItem(STORAGE_KEY)
        }
        localStorage.setItem(MIGRATION_KEY, '1')
    } catch (e) {
        console.error('[错题本] Migration failed:', e)
    }
}

// Get all wrong questions from localStorage
export function getWrongQuestions(): WrongQuestion[] {
    if (typeof window === 'undefined') return []

    // Run migration on first access
    migrateOldIds()

    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        return stored ? JSON.parse(stored) : []
    } catch {
        return []
    }
}

// Add a wrong question
export function addWrongQuestion(questionId: number, source: 'basics' | 'deepdive' | 'signs'): void {
    if (typeof window === 'undefined') return

    const questions = getWrongQuestions()

    // Check if already exists (same id and source)
    const exists = questions.some(q => q.questionId === questionId && q.source === source)
    if (exists) return

    questions.push({
        questionId,
        source,
        timestamp: Date.now()
    })

    localStorage.setItem(STORAGE_KEY, JSON.stringify(questions))

    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('wrongQuestionsUpdated'))
}

// Remove a wrong question (when mastered)
export function removeWrongQuestion(questionId: number, source: 'basics' | 'deepdive' | 'signs'): void {
    if (typeof window === 'undefined') return

    const questions = getWrongQuestions()
    const filtered = questions.filter(q => !(q.questionId === questionId && q.source === source))

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))

    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('wrongQuestionsUpdated'))
}

// Check if a question is in wrong questions list
export function isWrongQuestion(questionId: number, source: 'basics' | 'deepdive' | 'signs'): boolean {
    const questions = getWrongQuestions()
    return questions.some(q => q.questionId === questionId && q.source === source)
}

// Get count of wrong questions
export function getWrongQuestionsCount(): number {
    return getWrongQuestions().length
}

// Get wrong questions by source
export function getWrongQuestionsBySource(source: 'basics' | 'deepdive' | 'signs'): WrongQuestion[] {
    return getWrongQuestions().filter(q => q.source === source)
}

// Clear all wrong questions
export function clearAllWrongQuestions(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEY)
    window.dispatchEvent(new CustomEvent('wrongQuestionsUpdated'))
}
