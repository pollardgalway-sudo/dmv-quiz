'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminPage() {
    const [password, setPassword] = useState('')
    const [isAuthed, setIsAuthed] = useState(false)
    const [status, setStatus] = useState<{
        totalDevices: number
        maxDevices: number
        remaining: number
        devices?: string[]
    } | null>(null)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')

    const fetchStatus = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/activate?code=${password}`)
            const data = await res.json()
            if (data.success) {
                setStatus(data)
                setIsAuthed(true)
            } else {
                setMessage(data.error || '密码错误')
            }
        } catch {
            setMessage('获取状态失败')
        }
        setLoading(false)
    }

    const resetDevices = async () => {
        if (!confirm('确定要重置所有设备吗？这将清除所有已激活的设备！')) return

        setLoading(true)
        try {
            const res = await fetch('/api/activate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: password, action: 'reset' })
            })
            const data = await res.json()
            setMessage(data.message || '操作完成')
            fetchStatus()
        } catch {
            setMessage('重置失败')
        }
        setLoading(false)
    }

    if (!isAuthed) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>管理员登录</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="管理员密码"
                            className="w-full px-4 py-2 border rounded"
                        />
                        {message && <p className="text-red-500 text-sm">{message}</p>}
                        <Button onClick={fetchStatus} disabled={loading} className="w-full">
                            {loading ? '验证中...' : '登录'}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen p-8 bg-gray-100">
            <div className="max-w-4xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold">激活码管理后台</h1>

                {status && (
                    <div className="grid grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="pt-6 text-center">
                                <div className="text-4xl font-bold text-blue-600">{status.totalDevices}</div>
                                <div className="text-gray-500">已激活设备</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6 text-center">
                                <div className="text-4xl font-bold text-green-600">{status.remaining}</div>
                                <div className="text-gray-500">剩余名额</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6 text-center">
                                <div className="text-4xl font-bold text-gray-600">{status.maxDevices}</div>
                                <div className="text-gray-500">最大设备数</div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {message && (
                    <div className="bg-green-100 text-green-800 p-4 rounded">
                        {message}
                    </div>
                )}

                <div className="flex gap-4">
                    <Button onClick={fetchStatus} disabled={loading}>
                        刷新状态
                    </Button>
                    <Button onClick={resetDevices} disabled={loading} variant="destructive">
                        重置所有设备
                    </Button>
                </div>

                {status?.devices && status.devices.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>已激活设备列表</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {status.devices.map((device, index) => (
                                    <div key={device} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                        <span className="font-mono text-sm">{index + 1}. {device}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
