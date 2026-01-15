'use client'

import { useState, useEffect, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

// 在这里设置您的激活码
const ACTIVATION_CODE = 'DMV2026-CALI-PASS'

interface ActivationGateProps {
    children: ReactNode
}

export default function ActivationGate({ children }: ActivationGateProps) {
    const [isActivated, setIsActivated] = useState(false)
    const [code, setCode] = useState('')
    const [error, setError] = useState('')
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        // Check if already activated
        const activated = localStorage.getItem('dmv_activated')
        if (activated === 'true') {
            setIsActivated(true)
        }
    }, [])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (code.toUpperCase() === ACTIVATION_CODE) {
            localStorage.setItem('dmv_activated', 'true')
            setIsActivated(true)
            setError('')
        } else {
            setError('激活码错误，请重新输入')
        }
    }

    // Don't render anything until mounted to avoid hydration mismatch
    if (!mounted) {
        return (
            <div className="min-h-screen page-gradient flex items-center justify-center">
                <div className="text-center">
                    <div className="relative w-16 h-16 mx-auto mb-4">
                        <div className="absolute inset-0 rounded-full border-4 border-blue-200 dark:border-blue-900"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
                    </div>
                </div>
            </div>
        )
    }

    if (isActivated) {
        return <>{children}</>
    }

    return (
        <div className="min-h-screen page-gradient flex items-center justify-center p-4">
            {/* Decorative background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-float" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-br from-pink-400/20 to-orange-400/20 rounded-full blur-3xl animate-float delay-300" />
            </div>

            <Card className="w-full max-w-md premium-card relative z-10 animate-scale-in">
                <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

                <CardHeader className="text-center pt-8">
                    <div className="text-6xl mb-4">🔐</div>
                    <CardTitle className="text-2xl gradient-text">请输入激活码</CardTitle>
                    <CardDescription className="mt-2">
                        输入您的专属激活码以访问 DMV 考题练习系统
                    </CardDescription>
                </CardHeader>

                <CardContent className="pb-8">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="请输入激活码"
                                className="w-full px-4 py-3 text-center text-lg font-mono tracking-widest rounded-xl border-2 border-border bg-background/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                autoFocus
                            />
                        </div>

                        {error && (
                            <p className="text-red-500 text-sm text-center animate-scale-in">
                                ❌ {error}
                            </p>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-12 text-base font-medium"
                            style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}
                        >
                            验证激活码
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-muted-foreground">
                        <p>如需获取激活码，请联系管理员</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
