import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function PracticePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">练习模式</h1>
        <p className="text-gray-600 mt-2">选择练习方式</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>随机练习</CardTitle>
            <CardDescription>
              从题库中随机抽取题目进行练习
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" disabled>
              开始随机练习
            </Button>
            <p className="text-sm text-gray-500 mt-2">功能开发中...</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>分类练习</CardTitle>
            <CardDescription>
              按照题目分类进行针对性练习
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full" variant="outline" disabled>
              交通规则
            </Button>
            <Button className="w-full" variant="outline" disabled>
              安全驾驶
            </Button>
            <Button className="w-full" variant="outline" disabled>
              特殊情况
            </Button>
            <p className="text-sm text-gray-500 mt-2">功能开发中...</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">提示</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800">
          <p>练习模式功能正在开发中。完成后你将能够：</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>随机练习题目</li>
            <li>按分类练习（交通规则、安全驾驶等）</li>
            <li>查看即时答案解析</li>
            <li>记录答题历史</li>
            <li>查看正确率统计</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
