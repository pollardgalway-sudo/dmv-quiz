const fs = require('fs');
const path = require('path');

async function sync() {
    console.log('🔄 正在执行深度同步 (包含全真模拟题库)...');

    try {
        const masterPath = path.join(__dirname, '../data/questions-final-master.json');
        const signsPath = path.join(__dirname, '../public/data/questions-signs.json');

        const allQuestions = JSON.parse(fs.readFileSync(masterPath, 'utf8'));
        const signsQuestions = fs.existsSync(signsPath) ? JSON.parse(fs.readFileSync(signsPath, 'utf8')) : [];

        console.log(`📊 发现主库题目: ${allQuestions.length} 道`);
        console.log(`📊 发现标志题目: ${signsQuestions.length} 道`);

        // 转换函数：将后端格式转为前端格式
        const transform = (q, i, source) => {
            let transformed;
            // 如果已经是前端格式
            if (q.question && q.question.en && !Array.isArray(q.options)) {
                transformed = {
                    ...q,
                    id: i + 1,
                    source: source
                };
            } else {
                // 否则按照主库格式处理
                const getAnsIndex = Array.isArray(q.options) ? q.options.findIndex(o => o.isCorrect === true) : -1;
                const ansLetter = getAnsIndex === 0 ? 'A' : getAnsIndex === 1 ? 'B' : 'C';

                transformed = {
                    id: i + 1,
                    category: q.category || 'General',
                    question: {
                        en: q.questionText || '',
                        'zh-Hans': q.questionTextZh || q.questionText || '',
                        'zh-Hant': q.questionTextZh || q.questionText || ''
                    },
                    options: {
                        A: {
                            en: q.options?.[0]?.optionText || '',
                            'zh-Hans': q.options?.[0]?.optionTextZh || '',
                            'zh-Hant': q.options?.[0]?.optionTextZh || ''
                        },
                        B: {
                            en: q.options?.[1]?.optionText || '',
                            'zh-Hans': q.options?.[1]?.optionTextZh || '',
                            'zh-Hant': q.options?.[1]?.optionTextZh || ''
                        },
                        C: {
                            en: q.options?.[2]?.optionText || '',
                            'zh-Hans': q.options?.[2]?.optionTextZh || '',
                            'zh-Hant': q.options?.[2]?.optionTextZh || ''
                        }
                    },
                    answer: ansLetter,
                    explanation: {
                        en: q.explanation || '',
                        'zh-Hans': q.explanationZh || q.explanation || '',
                        'zh-Hant': q.explanationZh || q.explanation || ''
                    },
                    dmv_ref: {
                        page: 'Cali',
                        section: q.category || 'General',
                        'analysis_zh-Hans': q.explanationZh || '',
                        'analysis_zh-Hant': q.explanationZh || ''
                    },
                    source: source
                };
            }
            return transformed;
        };

        // 1. 生成扫盲模式题目 (前 150)
        const basicsData = allQuestions.slice(0, 150).map((q, i) => transform(q, i, 'basics'));

        // 2. 生成专项突破题目 (剩下所有)
        const deepdiveData = allQuestions.slice(150).map((q, i) => transform(q, i + 150, 'deepdive'));

        // 3. 处理标志题目 (确保 source 正确)
        const signsData = signsQuestions.map(q => ({ ...q, source: 'signs' }));

        // 4. 合并所有题目到 questions-all (供全真模拟使用)
        const questionsAll = [...basicsData, ...deepdiveData, ...signsData];

        // 写入所有文件
        fs.writeFileSync(path.join(__dirname, '../public/data/questions-basics.json'), JSON.stringify(basicsData, null, 2));
        fs.writeFileSync(path.join(__dirname, '../public/data/questions-deepdive.json'), JSON.stringify(deepdiveData, null, 2));
        fs.writeFileSync(path.join(__dirname, '../public/data/questions-all.json'), JSON.stringify(questionsAll, null, 2));

        console.log('✅ 深度同步成功！');
        console.log(`   - 扫盲模式: ${basicsData.length} 题`);
        console.log(`   - 专项突破: ${deepdiveData.length} 题`);
        console.log(`   - 标志图库: ${signsData.length} 题`);
        console.log(`   - 全真模拟总库: ${questionsAll.length} 题 (已更新)`);
        console.log('\n💡 模拟测试现在会从全部 753 道新题中抽取了！');

    } catch (err) {
        console.error('❌ 同步失败:', err.message);
    }
}

sync();
