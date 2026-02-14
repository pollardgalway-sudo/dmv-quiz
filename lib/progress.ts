// Progress Manager - localStorage based state management
// 进度管理器 - 使用 localStorage 持久化存储

export interface Progress {
    currentIndex: number
    score: { correct: number; total: number }
    timestamp: number
}

type ModuleType = 'basics' | 'deepdive' | 'signs'

const STORAGE_KEY_PREFIX = 'dmv_progress_'

// Get progress for a specific module
export function getProgress(module: ModuleType): Progress | null {
    if (typeof window === 'undefined') return null

    try {
        const stored = localStorage.getItem(STORAGE_KEY_PREFIX + module)
        if (!stored) return null

        const progress = JSON.parse(stored) as Progress

        // Check if progress is older than 7 days (optional expiry)
        const sevenDays = 7 * 24 * 60 * 60 * 1000
        if (Date.now() - progress.timestamp > sevenDays) {
            localStorage.removeItem(STORAGE_KEY_PREFIX + module)
            return null
        }

        return progress
    } catch {
        return null
    }
}

// Save progress for a specific module
export function saveProgress(
    module: ModuleType,
    currentIndex: number,
    score: { correct: number; total: number }
): void {
    if (typeof window === 'undefined') return

    const progress: Progress = {
        currentIndex,
        score,
        timestamp: Date.now()
    }

    try {
        localStorage.setItem(STORAGE_KEY_PREFIX + module, JSON.stringify(progress))
    } catch (error) {
        console.error('Failed to save progress:', error)
    }
}

// Clear progress for a specific module
export function clearProgress(module: ModuleType): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEY_PREFIX + module)
}

// Clear all progress
export function clearAllProgress(): void {
    if (typeof window === 'undefined') return
    const modules: ModuleType[] = ['basics', 'deepdive', 'signs']
    modules.forEach(module => {
        localStorage.removeItem(STORAGE_KEY_PREFIX + module)
    })
}

// Check if there's any saved progress for a module
export function hasProgress(module: ModuleType): boolean {
    return getProgress(module) !== null
}
