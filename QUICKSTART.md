# ⚡ 快速启动指南

这个指南帮助你在5分钟内启动项目。

## 📋 前提条件

确保你已安装：
- Node.js 18+
- npm 或 yarn

## 🚀 5分钟快速启动

### 步骤 1: 进入项目目录

```bash
cd dmv-exam-app
```

### 步骤 2: 启动数据库

使用 Prisma 本地数据库（最简单的方式）：

```bash
npx prisma dev
```

这会启动一个本地 PostgreSQL 数据库。保持这个终端窗口打开。

### 步骤 3: 打开新终端，运行数据库迁移

```bash
# 在新的终端窗口中
cd dmv-exam-app

# 运行数据库迁移
npx prisma migrate dev --name init
```

### 步骤 4: 导入示例数据

```bash
# 安装 tsx（如果还没安装）
npm install -D tsx

# 导入示例数据
npx tsx scripts/seed.ts
```

你应该看到：
```
🚦 开始导入交通标志数据...
  ✓ 已导入标志: Stop Sign
  ✓ 已导入标志: Yield Sign
  ...
📚 开始导入题目数据...
  ✓ 已导入题目: When you see a solid yellow line...
  ...
✨ 数据导入完成！
```

### 步骤 5: 启动开发服务器

```bash
npm run dev
```

### 步骤 6: 打开浏览器

访问 [http://localhost:3000](http://localhost:3000)

你应该看到一个漂亮的首页！

## 🧪 测试功能

### 1. 注册账号

1. 点击"开始刷题"或访问 [http://localhost:3000/register](http://localhost:3000/register)
2. 填写注册信息：
   - 姓名：任意
   - 邮箱：test@example.com（或任意邮箱）
   - 密码：至少6位
3. 点击"注册"

### 2. 登录

注册成功后会自动跳转到登录页，输入刚才的邮箱和密码登录。

### 3. 浏览 Dashboard

登录后你会看到主面板，包含：
- 📚 练习模式
- 🚦 交通标志
- 📝 模拟考试
- 等功能入口

### 4. 查看数据库

想查看数据库中的数据？运行：

```bash
npx prisma studio
```

访问 [http://localhost:5555](http://localhost:5555) 查看和编辑数据。

## 📊 当前功能状态

### ✅ 已完成
- [x] 用户注册/登录系统
- [x] 美观的UI界面
- [x] 数据库设计和迁移
- [x] 示例数据（3题 + 8个标志）
- [x] 基础页面结构

### 🚧 开发中
- [ ] 题目练习功能
- [ ] 交通标志学习
- [ ] 模拟考试系统
- [ ] 答题统计
- [ ] 错题集

## 🐛 常见问题

### Q: 数据库连接失败？
**A:** 确保 `npx prisma dev` 命令正在运行（在另一个终端窗口）。

### Q: 页面显示不正常？
**A:** 清除浏览器缓存，或用无痕模式访问。

### Q: npm install 报错？
**A:** 删除 `node_modules` 和 `package-lock.json`，重新运行 `npm install`。

### Q: 忘记密码了？
**A:**
1. 打开 Prisma Studio：`npx prisma studio`
2. 找到你的用户
3. 删除用户记录
4. 重新注册

## 🔄 重置项目

如果想从头开始：

```bash
# 重置数据库
npx prisma migrate reset

# 重新导入数据
npx tsx scripts/seed.ts

# 重启开发服务器
npm run dev
```

## 📝 下一步

现在基础框架已经搭建完成，下一步可以：

1. **添加更多题目** - 编辑 `data/templates/questions-template.json`
2. **开发练习功能** - 实现题目显示和答题逻辑
3. **开发标志学习** - 实现标志图鉴和学习功能
4. **实现统计功能** - 显示用户答题数据

详见 `GETTING_STARTED.md` 获取详细的开发指南。

## 🎉 成功了！

如果你看到了漂亮的界面并且能够注册登录，恭喜你！项目已经成功运行。

现在可以开始添加更多功能了。祝你开发顺利！
