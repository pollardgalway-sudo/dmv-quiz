import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">欢迎回来！</h1>
        <p className="text-gray-600 mt-2">选择学习模式开始刷题</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Practice Mode */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📚 练习模式
            </CardTitle>
            <CardDescription>
              随机或按分类练习题目
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/practice">
              <Button className="w-full">开始练习</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Traffic Signs */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🚦 交通标志
            </CardTitle>
            <CardDescription>
              学习和测试交通标志
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/signs">
              <Button className="w-full">学习标志</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Mock Exam */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📝 模拟考试
            </CardTitle>
            <CardDescription>
              36题模拟真实考试
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/exam">
              <Button className="w-full">开始考试</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Review Wrong Questions */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🔄 错题复习
            </CardTitle>
            <CardDescription>
              复习之前做错的题目
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline" disabled>
              即将推出
            </Button>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📊 学习统计
            </CardTitle>
            <CardDescription>
              查看你的学习进度
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline" disabled>
              即将推出
            </Button>
          </CardContent>
        </Card>

        {/* Profile */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              👤 个人中心
            </CardTitle>
            <CardDescription>
              管理你的账户设置
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline" disabled>
              即将推出
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>总练习题数</CardDescription>
            <CardTitle className="text-3xl">0</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>正确率</CardDescription>
            <CardTitle className="text-3xl">0%</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>完成考试次数</CardDescription>
            <CardTitle className="text-3xl">0</CardTitle>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}
