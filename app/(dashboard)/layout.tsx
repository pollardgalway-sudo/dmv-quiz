import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-xl font-bold text-gray-900">
                DMV考试
              </Link>
              <div className="hidden md:flex space-x-4">
                <Link href="/basics">
                  <Button variant="ghost">扫盲模式</Button>
                </Link>
                <Link href="/deepdive">
                  <Button variant="ghost">专项突破</Button>
                </Link>
                <Link href="/exam">
                  <Button variant="ghost">模拟考试</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
