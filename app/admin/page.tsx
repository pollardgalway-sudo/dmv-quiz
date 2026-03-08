'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface CodeDetail {
    code: string
    status: string
    createdAt: string
    devices: { id: string; boundAt: string }[]
    devicesUsed: number
    devicesMax: number
}

interface OverviewData {
    totalCodes: number
    activeCodes: number
    totalDevices: number
    maxDevicesPerCode: number
}

export default function AdminPage() {
    const [password, setPassword] = useState('')
    const [isAuthed, setIsAuthed] = useState(false)
    const [overview, setOverview] = useState<OverviewData | null>(null)
    const [codes, setCodes] = useState<CodeDetail[]>([])
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [messageType, setMessageType] = useState<'success' | 'error'>('success')
    const [generateCount, setGenerateCount] = useState(5)
    const [newCodes, setNewCodes] = useState<string[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'disabled' | 'bound' | 'unbound'>('all')

    const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
        setMessage(msg)
        setMessageType(type)
        setTimeout(() => setMessage(''), 5000)
    }

    // 获取概览数据
    const fetchOverview = useCallback(async () => {
        try {
            const res = await fetch(`/api/activate?code=${password}`)
            const data = await res.json()
            if (data.success) {
                setOverview(data)
                setIsAuthed(true)
            } else {
                showMessage(data.error || '密码错误', 'error')
            }
        } catch {
            showMessage('获取状态失败', 'error')
        }
    }, [password])

    // 获取激活码列表
    const fetchCodes = useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/activate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'list', adminPassword: password })
            })
            const data = await res.json()
            if (data.success) {
                setCodes(data.codes)
            } else {
                showMessage(data.error || '获取列表失败', 'error')
            }
        } catch {
            showMessage('获取列表失败', 'error')
        }
        setLoading(false)
    }, [password])

    // 登录
    const handleLogin = async () => {
        setLoading(true)
        await fetchOverview()
        setLoading(false)
    }

    // 登录后加载
    const loadData = useCallback(async () => {
        setLoading(true)
        await Promise.all([fetchOverview(), fetchCodes()])
        setLoading(false)
    }, [fetchOverview, fetchCodes])

    // 生成激活码
    const handleGenerate = async () => {
        setLoading(true)
        setNewCodes([])
        try {
            const res = await fetch('/api/activate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'generate',
                    adminPassword: password,
                    count: generateCount,
                })
            })
            const data = await res.json()
            if (data.success) {
                setNewCodes(data.codes)
                showMessage(data.message)
                await loadData()
            } else {
                showMessage(data.error || '生成失败', 'error')
            }
        } catch {
            showMessage('生成失败', 'error')
        }
        setLoading(false)
    }

    // 解绑设备
    const handleUnbind = async (code: string, deviceId: string) => {
        if (!confirm(`确定要解绑设备 ${deviceId.slice(0, 10)}... 吗？`)) return

        setLoading(true)
        try {
            const res = await fetch('/api/activate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'unbind',
                    adminPassword: password,
                    targetCode: code,
                    targetDevice: deviceId,
                })
            })
            const data = await res.json()
            if (data.success) {
                showMessage('设备已解绑')
                await loadData()
            } else {
                showMessage(data.error || '解绑失败', 'error')
            }
        } catch {
            showMessage('解绑失败', 'error')
        }
        setLoading(false)
    }

    // 切换激活码状态
    const handleToggle = async (code: string) => {
        setLoading(true)
        try {
            const res = await fetch('/api/activate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'toggle',
                    adminPassword: password,
                    targetCode: code,
                })
            })
            const data = await res.json()
            if (data.success) {
                showMessage(data.message)
                await loadData()
            } else {
                showMessage(data.error || '操作失败', 'error')
            }
        } catch {
            showMessage('操作失败', 'error')
        }
        setLoading(false)
    }

    // 删除激活码
    const handleDelete = async (code: string) => {
        if (!confirm(`确定要删除激活码 ${code} 吗？该操作不可恢复！`)) return

        setLoading(true)
        try {
            const res = await fetch('/api/activate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'delete',
                    adminPassword: password,
                    targetCode: code,
                })
            })
            const data = await res.json()
            if (data.success) {
                showMessage('激活码已删除')
                await loadData()
            } else {
                showMessage(data.error || '删除失败', 'error')
            }
        } catch {
            showMessage('删除失败', 'error')
        }
        setLoading(false)
    }

    // 复制到剪贴板
    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text)
            showMessage('已复制到剪贴板')
        } catch {
            showMessage('复制失败', 'error')
        }
    }

    // 批量复制新生成的激活码
    const copyAllNewCodes = async () => {
        const text = newCodes.join('\n')
        await copyToClipboard(text)
    }

    // 过滤激活码
    const filteredCodes = codes.filter(c => {
        // 搜索过滤
        if (searchTerm) {
            const term = searchTerm.toUpperCase()
            const matchCode = c.code.includes(term)
            const matchDevice = c.devices.some(d => d.id.toUpperCase().includes(term))
            if (!matchCode && !matchDevice) return false
        }
        // 状态过滤
        if (filterStatus === 'active') return c.status === 'active'
        if (filterStatus === 'disabled') return c.status === 'disabled'
        if (filterStatus === 'bound') return c.devicesUsed > 0
        if (filterStatus === 'unbound') return c.devicesUsed === 0
        return true
    })

    // ===== 登录页面 =====
    if (!isAuthed) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)' }}>
                <Card className="w-full max-w-md border-slate-700 bg-slate-800/80 backdrop-blur-xl shadow-2xl">
                    <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                    <CardHeader className="text-center pt-8">
                        <div className="text-5xl mb-3">⚙️</div>
                        <CardTitle className="text-2xl text-white">激活码管理后台</CardTitle>
                        <p className="text-slate-400 text-sm mt-1">请输入管理员密码</p>
                    </CardHeader>
                    <CardContent className="space-y-4 pb-8">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                            placeholder="管理员密码"
                            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            autoFocus
                        />
                        {message && (
                            <p className={`text-sm text-center ${messageType === 'error' ? 'text-red-400' : 'text-green-400'}`}>
                                {message}
                            </p>
                        )}
                        <Button
                            onClick={handleLogin}
                            disabled={loading}
                            className="w-full h-11 text-white font-medium"
                            style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}
                        >
                            {loading ? '验证中...' : '登录'}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // 首次登录后自动加载数据
    if (codes.length === 0 && !loading) {
        loadData()
    }

    // ===== 管理后台 =====
    return (
        <div className="min-h-screen p-4 md:p-8" style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)' }}>
            <div className="max-w-6xl mx-auto space-y-6">

                {/* 标题 */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl md:text-3xl font-bold text-white">🔑 激活码管理后台</h1>
                    <Button
                        onClick={loadData}
                        disabled={loading}
                        variant="outline"
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                        {loading ? '加载中...' : '🔄 刷新'}
                    </Button>
                </div>

                {/* 消息提示 */}
                {message && (
                    <div className={`p-4 rounded-xl text-sm font-medium ${messageType === 'error'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                            : 'bg-green-500/20 text-green-300 border border-green-500/30'
                        }`}>
                        {messageType === 'error' ? '❌' : '✅'} {message}
                    </div>
                )}

                {/* 概览统计卡片 */}
                {overview && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card className="bg-slate-800/60 border-slate-700 backdrop-blur">
                            <CardContent className="pt-6 text-center">
                                <div className="text-3xl font-bold text-blue-400">{overview.totalCodes}</div>
                                <div className="text-slate-400 text-sm mt-1">激活码总数</div>
                            </CardContent>
                        </Card>
                        <Card className="bg-slate-800/60 border-slate-700 backdrop-blur">
                            <CardContent className="pt-6 text-center">
                                <div className="text-3xl font-bold text-green-400">{overview.activeCodes}</div>
                                <div className="text-slate-400 text-sm mt-1">有效激活码</div>
                            </CardContent>
                        </Card>
                        <Card className="bg-slate-800/60 border-slate-700 backdrop-blur">
                            <CardContent className="pt-6 text-center">
                                <div className="text-3xl font-bold text-purple-400">{overview.totalDevices}</div>
                                <div className="text-slate-400 text-sm mt-1">已绑定设备</div>
                            </CardContent>
                        </Card>
                        <Card className="bg-slate-800/60 border-slate-700 backdrop-blur">
                            <CardContent className="pt-6 text-center">
                                <div className="text-3xl font-bold text-orange-400">{overview.maxDevicesPerCode}</div>
                                <div className="text-slate-400 text-sm mt-1">每码设备上限</div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* 生成激活码 */}
                <Card className="bg-slate-800/60 border-slate-700 backdrop-blur">
                    <CardHeader>
                        <CardTitle className="text-white text-lg">🆕 生成激活码</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <label className="text-slate-300 text-sm whitespace-nowrap">数量：</label>
                            <input
                                type="number"
                                min={1}
                                max={100}
                                value={generateCount}
                                onChange={(e) => setGenerateCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                                className="w-24 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <Button
                                onClick={handleGenerate}
                                disabled={loading}
                                className="text-white font-medium"
                                style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}
                            >
                                {loading ? '生成中...' : `生成 ${generateCount} 个`}
                            </Button>
                        </div>

                        {/* 新生成的激活码展示 */}
                        {newCodes.length > 0 && (
                            <div className="mt-4 p-4 bg-slate-700/50 rounded-xl border border-slate-600">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-green-400 font-medium">✨ 新生成的激活码：</h3>
                                    <Button
                                        onClick={copyAllNewCodes}
                                        variant="outline"
                                        size="sm"
                                        className="border-slate-500 text-slate-300 hover:bg-slate-600 text-xs"
                                    >
                                        📋 复制全部
                                    </Button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {newCodes.map((c) => (
                                        <div
                                            key={c}
                                            className="flex items-center justify-between bg-slate-800/80 px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-700/80 transition-colors"
                                            onClick={() => copyToClipboard(c)}
                                        >
                                            <span className="font-mono text-green-300 text-sm">{c}</span>
                                            <span className="text-slate-500 text-xs">点击复制</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* 激活码列表 */}
                <Card className="bg-slate-800/60 border-slate-700 backdrop-blur">
                    <CardHeader>
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <CardTitle className="text-white text-lg">📋 激活码列表 ({filteredCodes.length})</CardTitle>
                            <div className="flex items-center gap-3 flex-wrap">
                                {/* 搜索 */}
                                <input
                                    type="text"
                                    placeholder="搜索激活码/设备ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-48 px-3 py-1.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {/* 过滤 */}
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                                    className="px-3 py-1.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">全部</option>
                                    <option value="active">有效</option>
                                    <option value="disabled">已禁用</option>
                                    <option value="bound">已绑定设备</option>
                                    <option value="unbound">未绑定设备</option>
                                </select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {filteredCodes.length === 0 ? (
                            <div className="text-center py-12 text-slate-400">
                                <p className="text-4xl mb-3">📭</p>
                                <p>暂无激活码，请先生成</p>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                                {filteredCodes.map((c) => (
                                    <div
                                        key={c.code}
                                        className={`p-4 rounded-xl border transition-all ${c.status === 'disabled'
                                                ? 'bg-red-900/10 border-red-800/30 opacity-60'
                                                : c.devicesUsed >= c.devicesMax
                                                    ? 'bg-amber-900/10 border-amber-800/30'
                                                    : 'bg-slate-700/30 border-slate-600/50 hover:border-slate-500'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between flex-wrap gap-2">
                                            {/* 激活码 */}
                                            <div className="flex items-center gap-3">
                                                <span
                                                    className="font-mono text-lg font-bold text-blue-300 cursor-pointer hover:text-blue-200 transition-colors"
                                                    onClick={() => copyToClipboard(c.code)}
                                                    title="点击复制"
                                                >
                                                    {c.code}
                                                </span>
                                                {/* 状态标签 */}
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.status === 'active'
                                                        ? 'bg-green-500/20 text-green-300'
                                                        : 'bg-red-500/20 text-red-300'
                                                    }`}>
                                                    {c.status === 'active' ? '有效' : '已禁用'}
                                                </span>
                                                {/* 设备数标签 */}
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.devicesUsed >= c.devicesMax
                                                        ? 'bg-amber-500/20 text-amber-300'
                                                        : c.devicesUsed > 0
                                                            ? 'bg-blue-500/20 text-blue-300'
                                                            : 'bg-slate-500/20 text-slate-400'
                                                    }`}>
                                                    📱 {c.devicesUsed}/{c.devicesMax}
                                                </span>
                                            </div>

                                            {/* 操作按钮 */}
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    onClick={() => handleToggle(c.code)}
                                                    variant="outline"
                                                    size="sm"
                                                    className={`text-xs border-slate-600 ${c.status === 'active'
                                                            ? 'text-amber-300 hover:bg-amber-900/30'
                                                            : 'text-green-300 hover:bg-green-900/30'
                                                        }`}
                                                    disabled={loading}
                                                >
                                                    {c.status === 'active' ? '禁用' : '启用'}
                                                </Button>
                                                <Button
                                                    onClick={() => handleDelete(c.code)}
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-xs border-slate-600 text-red-400 hover:bg-red-900/30"
                                                    disabled={loading}
                                                >
                                                    删除
                                                </Button>
                                            </div>
                                        </div>

                                        {/* 创建时间 */}
                                        <div className="mt-2 text-xs text-slate-500">
                                            创建于：{new Date(c.createdAt).toLocaleString('zh-CN')}
                                        </div>

                                        {/* 绑定设备列表 */}
                                        {c.devices.length > 0 && (
                                            <div className="mt-3 space-y-2">
                                                {c.devices.map((device) => (
                                                    <div
                                                        key={device.id}
                                                        className="flex items-center justify-between bg-slate-800/50 px-3 py-2 rounded-lg"
                                                    >
                                                        <div className="flex-1 min-w-0">
                                                            <span className="font-mono text-xs text-slate-300 break-all">
                                                                📱 {device.id}
                                                            </span>
                                                            <span className="text-xs text-slate-500 ml-2">
                                                                绑定于 {new Date(device.boundAt).toLocaleString('zh-CN')}
                                                            </span>
                                                        </div>
                                                        <Button
                                                            onClick={() => handleUnbind(c.code, device.id)}
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-xs text-red-400 hover:bg-red-900/30 ml-2 shrink-0"
                                                            disabled={loading}
                                                        >
                                                            解绑
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
