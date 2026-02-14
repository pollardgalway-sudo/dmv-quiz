const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connStr = "postgres://postgres:postgres@localhost:51214/postgres?sslmode=disable";
const client = new Client({ connectionString: connStr });

async function seed() {
    console.log('⚡️ 尝试超快速连接...');
    try {
        await client.connect();
        console.log('🔗 已连上。正在查表...');

        // 尝试手动建表
        await client.query('CREATE TABLE IF NOT EXISTS "questions" (id TEXT PRIMARY KEY, "questionText" TEXT, category TEXT, difficulty TEXT, explanation TEXT, "dmvManualReference" TEXT, "handbookVersion" TEXT)');
        await client.query('CREATE TABLE IF NOT EXISTS "options" (id TEXT PRIMARY KEY, "questionId" TEXT, "optionText" TEXT, "isCorrect" BOOLEAN, "order" TEXT)');

        console.log('🏗️ 表格已检查。开始清空数据...');
        await client.query('DELETE FROM options; DELETE FROM questions;');

        const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/questions-final-master.json'), 'utf8'));
        console.log(`📦 准备导入 ${data.length} 条数据...`);

        // 批量插入
        for (let i = 0; i < data.length; i++) {
            const q = data[i];
            const qId = `q${i}`;
            await client.query('INSERT INTO questions (id, "questionText", category, difficulty, explanation, "dmvManualReference", "handbookVersion") VALUES ($1, $2, $3, $4, $5, $6, $7)', [qId, q.questionTextZh || q.questionText, q.category, q.difficulty, q.explanationZh || q.explanation, q.dmvManualReference, q.handbookVersion]);

            for (let j = 0; j < q.options.length; j++) {
                const o = q.options[j];
                await client.query('INSERT INTO options (id, "questionId", "optionText", "isCorrect", "order") VALUES ($1, $2, $3, $4, $5)', [`o${i}_${j}`, qId, o.optionTextZh || o.optionText, o.isCorrect, o.order]);
            }
            if (i % 100 === 0) console.log(`  进度: ${i}/${data.length}`);
        }
        console.log('✅ 大功告成！');
    } catch (e) {
        console.log('❌ 报错了:', e.message);
    } finally {
        await client.end();
    }
}
seed();
