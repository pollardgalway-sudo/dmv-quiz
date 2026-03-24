// Wrong Questions Manager - localStorage based state management
// 错题本管理器 - 使用 localStorage 持久化存储

export interface WrongQuestion {
    questionId: number
    source: 'basics' | 'deepdive' | 'signs'
    timestamp: number
}

const STORAGE_KEY = 'dmv_wrong_questions'
const MIGRATION_KEY = 'dmv_wrong_questions_migrated_v2'

// Old ID → New ID mapping (from questions-deepdive.json to public/data/questions-all.json)
// Only deepdive has mismatched IDs; basics and signs IDs already match.
const OLD_TO_NEW_IDS: Record<string, Record<number, number>> = {
    deepdive: {6001:814,6002:815,6003:816,6004:817,6005:818,6006:819,6007:820,6008:821,6009:822,6010:823,6011:824,6012:825,6013:826,6014:827,6015:828,6016:829,6017:830,6018:831,6019:832,6020:833,6021:834,6022:832,6023:835,6024:836,6025:837,6026:838,6027:839,6028:840,6029:841,6030:842,6031:825,6032:843,6033:844,6034:845,6035:846,6036:847,6037:836,6038:848,6039:849,1:850,2:851,3:852,4:853,5:854,6:855,7:856,8:857,9:858,10:859,11:860,12:861,13:862,14:863,15:864,16:865,17:866,18:867,20:869,21:870,22:871,23:872,24:873,25:874,26:875,27:876,29:877,30:878,31:879,33:880,34:881,35:882,36:883,38:885,39:886,40:887,41:888,42:889,43:890,44:891,45:892,46:893,47:894,48:895,49:896,50:897,51:898,52:899,54:900,55:901,56:902,57:903,58:904,59:905,60:906,61:907,62:908,63:909,64:910,65:911,66:912,67:913,68:914,69:915,70:916,71:917,72:918,73:919,74:920,75:921,76:922,77:923,78:924,79:925,80:926,81:927,82:928,83:929,84:930,85:931,86:932,87:933,88:934,89:935,90:936,91:937,92:938,93:939,94:940,95:941,96:942,97:795,98:943,99:944,100:945,101:946,102:947,104:948,105:949,106:950,107:951,108:952,109:953,110:954,111:955,112:956,113:957,114:958,115:959,116:960,117:961,118:962,119:963,120:964,121:965,122:884,123:966,124:967,125:968,126:969,127:970,128:791,129:971,130:972,131:973,132:974,133:975,134:976,135:977,136:978,137:979},
}

// One-time migration: convert old IDs to new unified IDs
function migrateOldIds(): void {
    if (typeof window === 'undefined') return
    if (localStorage.getItem(MIGRATION_KEY)) return // Already migrated

    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (!stored) {
            localStorage.setItem(MIGRATION_KEY, '1')
            return
        }

        const questions: WrongQuestion[] = JSON.parse(stored)
        let changed = false

        const migrated = questions.map(q => {
            const map = OLD_TO_NEW_IDS[q.source]
            if (map && map[q.questionId] !== undefined) {
                changed = true
                return { ...q, questionId: map[q.questionId] }
            }
            return q
        })

        // Deduplicate (in case old and new IDs both existed)
        if (changed) {
            const seen = new Set<string>()
            const deduped = migrated.filter(q => {
                const key = `${q.source}-${q.questionId}`
                if (seen.has(key)) return false
                seen.add(key)
                return true
            })
            localStorage.setItem(STORAGE_KEY, JSON.stringify(deduped))
            console.log(`[错题本] Migrated ${questions.length} → ${deduped.length} wrong questions to new IDs`)
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
