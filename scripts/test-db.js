const { Client } = require('pg');

async function testConnection() {
    const connectionString = "postgres://postgres:postgres@localhost:51214/template1?sslmode=disable";
    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log("✅ 成功！底层 PostgreSQL 数据库可以连接。");
        const res = await client.query('SELECT current_database();');
        console.log("当前数据库:", res.rows[0].current_database);
        await client.end();
    } catch (err) {
        console.error("❌ 失败！无法连接到底层数据库:", err.message);
    }
}

testConnection();
