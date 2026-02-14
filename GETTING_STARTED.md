# 🚀 快速开始指南

欢迎使用加州DMV驾照考试刷题网站！这个指南将帮助你快速上手这个项目。

## ✅ 当前项目状态

已完成的基础设施：
- ✅ Next.js 14 项目框架
- ✅ Prisma ORM 配置
- ✅ PostgreSQL 数据库模型（8个表）
- ✅ 数据导入模板和脚本
- ✅ 项目文档

## 📋 接下来的步骤

### 第一步：设置数据库

你有两个选择：

#### 选项 A：本地数据库（推荐新手）

```bash
cd dmv-exam-app

# 启动 Prisma 本地 PostgreSQL
npx prisma dev
```

这会在本地启动一个 PostgreSQL 数据库，无需额外配置！

#### 选项 B：云端数据库（推荐生产环境）

1. 注册以下任一服务（都有免费套餐）：
   - [Supabase](https://supabase.com) - 推荐
   - [Railway](https://railway.app)
   - [Neon](https://neon.tech)

2. 创建数据库后，获取连接字符串（类似这样）：
   ```
   postgresql://user:password@hostname:5432/database
   ```

3. 更新 `.env` 文件中的 `DATABASE_URL`

### 第二步：运行数据库迁移

```bash
cd dmv-exam-app

# 创建数据库表
npx prisma migrate dev --name init

# 或者如果使用云端数据库
npx prisma migrate deploy
```

### 第三步：导入示例数据

```bash
# 安装 TypeScript 执行器
npm install -D tsx

# 导入示例数据
npx tsx scripts/seed.ts
```

这会导入：
- 3 道示例题目（涵盖不同类型）
- 8 个交通标志（涵盖4种标志类型）

### 第四步：启动开发服务器

```bash
npm run dev
```

然后访问 [http://localhost:3000](http://localhost:3000)

## 📚 下一步开发任务

项目的基础架构已经搭建完成，现在需要开发以下功能：

### 1. 用户认证系统 (NextAuth.js)
- [ ] 配置 NextAuth.js
- [ ] 创建登录/注册页面
- [ ] 实现邮箱密码登录
- [ ] 可选：添加 Google OAuth

### 2. 基础 UI 组件
- [ ] 安装 Shadcn/ui
- [ ] 创建 QuestionCard 组件（显示题目）
- [ ] 创建 SignCard 组件（显示标志）
- [ ] 创建 ProgressBar 组件
- [ ] 创建 Timer 组件

### 3. API 路由
- [ ] `GET /api/questions` - 获取题目列表
- [ ] `GET /api/questions/[id]` - 获取单个题目
- [ ] `POST /api/questions/answer` - 提交答案
- [ ] `GET /api/signs` - 获取标志列表
- [ ] `GET /api/stats` - 获取用户统计

### 4. 页面开发
- [ ] 首页 - 欢迎页面
- [ ] 练习页面 - 刷题模式
- [ ] 标志学习页面 - 交通标志图鉴
- [ ] 模拟考试页面
- [ ] 个人中心 - 统计和历史

## 🎯 优先级建议

**本周目标**：实现最小可用产品 (MVP)

1. **认证系统** (1-2天)
   - 简单的邮箱密码登录即可
   - 先不需要 OAuth

2. **题目练习功能** (2-3天)
   - 创建 API 获取题目
   - 实现答题界面
   - 记录答题结果

3. **基础 UI** (1-2天)
   - 安装 Shadcn/ui
   - 创建题目卡片组件
   - 实现答题反馈

一周后你就能有一个可以刷题的基础版本！

## 💡 开发提示

### Prisma 常用命令

```bash
# 查看数据库
npx prisma studio

# 重置数据库
npx prisma migrate reset

# 生成 Prisma Client
npx prisma generate

# 格式化 schema
npx prisma format
```

### 添加更多题目

1. 编辑 `data/templates/questions-template.json`
2. 添加新题目（记得包含3个选项）
3. 运行 `npx tsx scripts/seed.ts`

### 查看数据库

```bash
# 启动 Prisma Studio（可视化数据库管理）
npx prisma studio
```

访问 [http://localhost:5555](http://localhost:5555) 查看你的数据。

## 🤔 常见问题

### Q: 数据库连接失败？
A: 检查 `.env` 中的 `DATABASE_URL` 是否正确。如果使用本地数据库，确保运行了 `npx prisma dev`。

### Q: 如何清空数据库重新开始？
A: 运行 `npx prisma migrate reset`，这会删除所有数据并重新运行迁移。

### Q: 如何查看数据库中的数据？
A: 运行 `npx prisma studio`，在浏览器中查看和编辑数据。

### Q: TypeScript 报错？
A: 运行 `npx prisma generate` 重新生成 Prisma Client 类型。

## 📖 推荐阅读

- [Next.js 文档](https://nextjs.org/docs)
- [Prisma 文档](https://www.prisma.io/docs)
- [NextAuth.js 文档](https://next-auth.js.org)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [Shadcn/ui 组件](https://ui.shadcn.com)

## 🆘 需要帮助？

如果遇到问题：
1. 查看终端错误信息
2. 检查 `.env` 配置
3. 确认数据库连接正常
4. 查阅相关文档

祝你开发顺利！🎉
