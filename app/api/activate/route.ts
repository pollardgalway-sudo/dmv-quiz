import { NextRequest, NextResponse } from 'next/server'

// 强制动态渲染 - 不静态预渲染
export const dynamic = 'force-dynamic'

// ============ 配置区域 ============
const CONFIG = {
    ACTIVATION_CODE: 'DMV2026-CALI-PASS',
    MAX_DEVICES: 150,
    ADMIN_PASSWORD: 'ADMIN2026',
}
// ================================

const DEVICES_KEY = 'dmv_devices'

// 使用 Vercel KV REST API（避免包导入问题）
async function kvRequest(command: string[], method: 'GET' | 'POST' = 'POST') {
    const url = process.env.KV_REST_API_URL
    const token = process.env.KV_REST_API_TOKEN

    if (!url || !token) {
        return null
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(command),
        })
        const data = await response.json()
        return data.result
    } catch {
        return null
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { code, deviceId, action } = body

        // 管理员：查看状态
        if (action === 'status' && code === CONFIG.ADMIN_PASSWORD) {
            const devices = await kvRequest(['SMEMBERS', DEVICES_KEY])
            if (devices === null) {
                return NextResponse.json({ success: false, error: 'KV 未配置' })
            }
            return NextResponse.json({
                success: true,
                totalDevices: (devices as string[]).length,
                maxDevices: CONFIG.MAX_DEVICES,
                remaining: CONFIG.MAX_DEVICES - (devices as string[]).length
            })
        }

        // 管理员：重置设备列表
        if (action === 'reset' && code === CONFIG.ADMIN_PASSWORD) {
            const result = await kvRequest(['DEL', DEVICES_KEY])
            if (result === null) {
                return NextResponse.json({ success: false, error: 'KV 未配置' })
            }
            return NextResponse.json({ success: true, message: '设备列表已重置' })
        }

        // 验证激活码
        if (!code || code.toUpperCase() !== CONFIG.ACTIVATION_CODE) {
            return NextResponse.json({ success: false, error: '激活码错误' }, { status: 401 })
        }

        // 验证设备ID
        if (!deviceId) {
            return NextResponse.json({ success: false, error: '设备信息缺失' }, { status: 400 })
        }

        // 检查 KV 是否可用
        const kvAvailable = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN

        // 如果 KV 未配置，回退到仅验证激活码
        if (!kvAvailable) {
            return NextResponse.json({
                success: true,
                message: '激活成功',
                fallbackMode: true
            })
        }

        // 检查设备是否已绑定
        const isMember = await kvRequest(['SISMEMBER', DEVICES_KEY, deviceId])
        if (isMember === 1) {
            return NextResponse.json({
                success: true,
                message: '设备已激活',
                isExisting: true
            })
        }

        // 检查是否达到设备上限
        const deviceCount = await kvRequest(['SCARD', DEVICES_KEY]) || 0
        if ((deviceCount as number) >= CONFIG.MAX_DEVICES) {
            return NextResponse.json({
                success: false,
                error: '激活码已达使用上限，请联系客服',
                code: 'DEVICE_LIMIT_REACHED'
            }, { status: 403 })
        }

        // 添加新设备
        await kvRequest(['SADD', DEVICES_KEY, deviceId])

        return NextResponse.json({
            success: true,
            message: '激活成功',
            isExisting: false,
            devicesUsed: (deviceCount as number) + 1,
            devicesRemaining: CONFIG.MAX_DEVICES - (deviceCount as number) - 1
        })

    } catch (error) {
        console.error('Activation error:', error)
        return NextResponse.json({
            success: false,
            error: '服务器错误，请稍后重试'
        }, { status: 500 })
    }
}

export async function GET(req: NextRequest) {
    const url = new URL(req.url)
    const code = url.searchParams.get('code')

    if (code === CONFIG.ADMIN_PASSWORD) {
        const kvAvailable = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN

        if (!kvAvailable) {
            return NextResponse.json({
                success: false,
                error: 'KV 未配置',
                note: '请在 Vercel 控制台配置 KV 存储'
            })
        }

        const devices = await kvRequest(['SMEMBERS', DEVICES_KEY])
        if (devices === null) {
            return NextResponse.json({ success: false, error: 'KV 读取失败' })
        }

        return NextResponse.json({
            success: true,
            totalDevices: (devices as string[]).length,
            maxDevices: CONFIG.MAX_DEVICES,
            remaining: CONFIG.MAX_DEVICES - (devices as string[]).length,
            devices: devices
        })
    }

    return NextResponse.json({ error: '无权限' }, { status: 403 })
}
