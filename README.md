# 🚗 加州DMV驾照考试刷题网站

基于 **Next.js 14** + **PostgreSQL** + **Prisma** 构建的全栈DMV考试刷题应用。

## ✨ 功能特点

- 📚 **题库练习** - 300+题目，涵盖交通规则、安全驾驶、特殊情况
- 🚦 **交通标志学习** - 80+常见交通标志，支持卡片翻转学习
- 📝 **模拟考试** - 真实模拟36题考试环境，计时答题
- 📊 **数据统计** - 答题历史、正确率、错题集
- 🌏 **双语支持** - 中英文题目和解析
- 📖 **权威来源** - 所有题目基于2026版加州DMV官方手册

## 🛠️ 技术栈

- **前端**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **后端**: Next.js API Routes
- **数据库**: PostgreSQL
- **ORM**: Prisma
- **认证**: NextAuth.js
- **状态管理**: Zustand
- **表单**: React Hook Form + Zod

## 📦 安装

### 1. 克隆项目

```bash
git clone <your-repo-url>
cd dmv-exam-app
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制 `.env` 文件并配置：

```bash
# 数据库配置
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

# 或使用 Prisma 本地开发数据库
# DATABASE_URL="prisma+postgres://localhost:51213/..."

# NextAuth 配置
NEXTAUTH_SECRET="your-secret-key"  # 运行: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
```

### 4. 数据库设置

#### 选项 A：使用 Prisma 本地数据库（最简单）

```bash
# 启动本地 PostgreSQL
npx prisma dev

# 运行数据库迁移
npx prisma migrate dev --name init
```

#### 选项 B：使用云端数据库

支持的服务：
- [Supabase](https://supabase.com) - 免费 500MB
- [Railway](https://railway.app) - 免费 500MB
- [Neon](https://neon.tech) - 免费 3GB

获取数据库 URL 后，更新 `.env` 中的 `DATABASE_URL`，然后运行：

```bash
npx prisma migrate deploy
```

### 5. 导入示例数据

```bash
# 安装 tsx（TypeScript 执行器）
npm install -D tsx

# 运行种子脚本
npx tsx scripts/seed.ts
```

这将导入：
- 3 道示例题目
- 8 个交通标志

### 6. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

## 📁 项目结构

```
dmv-exam-app/
├── app/                      # Next.js App Router
│   ├── api/                 # API 路由
│   ├── (auth)/              # 认证页面
│   └── (dashboard)/         # 主应用页面
├── components/              # React 组件
├── lib/                     # 工具函数和配置
│   └── prisma.ts           # Prisma 客户端
├── prisma/
│   └── schema.prisma       # 数据库模型
├── data/
│   └── templates/          # 数据导入模板
│       ├── questions-template.json
│       └── traffic-signs-template.json
├── scripts/
│   └── seed.ts            # 数据导入脚本
└── public/
    └── images/            # 题目和标志图片
```

## 📚 数据库模型

### 核心表

- **User** - 用户账户
- **Question** - 题目（含3个选项）
- **Option** - 选项（A/B/C）
- **TrafficSign** - 交通标志
- **UserAnswer** - 答题记录
- **Exam** - 模拟考试
- **UserSignProgress** - 标志学习进度

详见 `prisma/schema.prisma`

## 🎯 开发路线图

### Phase 1: 基础架构 ✅
- [x] Next.js 项目初始化
- [x] Prisma 数据库配置
- [x] 数据模型设计
- [ ] NextAuth 认证系统
- [ ] 基础 UI 组件

### Phase 2: 核心功能
- [ ] 题目练习模式
- [ ] 交通标志学习
- [ ] 答题记录和统计
- [ ] 用户个人中心

### Phase 3: 高级功能
- [ ] 模拟考试系统
- [ ] 错题集复习
- [ ] 学习进度追踪
- [ ] 数据可视化

### Phase 4: 优化上线
- [ ] 性能优化
- [ ] SEO 优化
- [ ] 部署到 Vercel
- [ ] 扩充题库到 300+ 题

## 📖 添加题目

### 1. 编辑模板文件

编辑 `data/templates/questions-template.json`：

```json
{
  "questionText": "你的题目英文",
  "questionTextZh": "你的题目中文",
  "category": "traffic_rules",  // 或 safe_driving, special_situations
  "difficulty": "easy",          // 或 medium, hard
  "imageUrl": "/images/questions/your-image.jpg",  // 可选
  "explanation": "答案解析英文",
  "explanationZh": "答案解析中文",
  "dmvManualReference": "California Driver Handbook 2026, Page XX",
  "dmvManualUrl": "https://www.dmv.ca.gov/...",
  "handbookVersion": "2026",
  "options": [
    {
      "optionText": "选项 A",
      "optionTextZh": "选项 A 中文",
      "isCorrect": true,
      "order": "A"
    },
    // ... 选项 B 和 C
  ]
}
```

### 2. 重新导入数据

```bash
npx tsx scripts/seed.ts
```

## 🚀 部署

### 部署到 Vercel（推荐）

1. 推送代码到 GitHub
2. 访问 [vercel.com](https://vercel.com)
3. 导入项目
4. 配置环境变量
5. 部署

数据库推荐使用 Vercel Postgres 或 Supabase。

## 📄 许可证

MIT

## 🙏 致谢

- 题目和标志基于 [California DMV Official Handbook 2026](https://www.dmv.ca.gov/portal/handbook/california-driver-handbook/)
- 本项目仅用于学习目的，不保证所有信息的绝对准确性
- 请以官方 DMV 手册为准

---

**⚠️ 重要提示**:
- 使用前请仔细阅读 DMV 官方手册
- 本应用为辅助学习工具，实际考试请以 DMV 官方为准
