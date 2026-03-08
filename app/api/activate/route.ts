import { NextRequest, NextResponse } from 'next/server'

// 强制动态渲染
export const dynamic = 'force-dynamic'

// ============ 配置区域 ============
const CONFIG = {
    MAX_DEVICES_PER_CODE: 2,        // 每个激活码最多绑定设备数
    ADMIN_PASSWORD: 'ADMIN2026',     // 管理员密码
    CODE_PREFIX: 'DMV',              // 激活码前缀
    CODE_LENGTH: 8,                  // 激活码随机部分长度
}
// ================================

// KV Keys
const CODES_INDEX_KEY = 'activation_codes_index'  // Set: 所有激活码列表

function getCodeKey(code: string) {
    return `activation:${code}`
}

// Vercel KV REST API 封装
async function kvRequest(command: string[]) {
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

// 生成随机激活码
function generateCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // 去掉容易混淆的 I/O/0/1
    let code = ''
    for (let i = 0; i < CONFIG.CODE_LENGTH; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    // 格式: DMV-XXXX-XXXX
    return `${CONFIG.CODE_PREFIX}-${code.slice(0, 4)}-${code.slice(4, 8)}`
}

// ===== 用户激活接口 =====
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { code, deviceId, action, adminPassword, count, targetCode, targetDevice } = body

        // ===== 管理员操作 =====
        if (action && adminPassword === CONFIG.ADMIN_PASSWORD) {
            return handleAdminAction(action, { count, targetCode, targetDevice })
        }

        // ===== 普通用户激活 =====
        if (!code || !deviceId) {
            return NextResponse.json(
                { success: false, error: '请输入激活码' },
                { status: 400 }
            )
        }

        const upperCode = code.toUpperCase().trim()

        // 检查 KV 是否可用
        const kvAvailable = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
        if (!kvAvailable) {
            return NextResponse.json({
                success: false,
                error: '服务暂不可用，请稍后重试'
            }, { status: 503 })
        }

        // 检查激活码是否存在
        const isMember = await kvRequest(['SISMEMBER', CODES_INDEX_KEY, upperCode])
        if (!isMember) {
            return NextResponse.json(
                { success: false, error: '激活码无效，请检查后重新输入' },
                { status: 401 }
            )
        }

        // 获取激活码详情
        const codeKey = getCodeKey(upperCode)
        const codeData = await kvRequest(['HGETALL', codeKey])

        if (!codeData) {
            return NextResponse.json(
                { success: false, error: '激活码数据异常，请联系管理员' },
                { status: 500 }
            )
        }

        // 解析 HGETALL 返回的数组为对象
        const codeInfo: Record<string, string> = {}
        if (Array.isArray(codeData)) {
            for (let i = 0; i < codeData.length; i += 2) {
                codeInfo[codeData[i]] = codeData[i + 1]
            }
        }

        // 检查激活码状态
        if (codeInfo.status === 'disabled') {
            return NextResponse.json(
                { success: false, error: '该激活码已被禁用，请联系管理员' },
                { status: 403 }
            )
        }

        // 检查设备是否已经绑定在该激活码下
        const boundDevices: string[] = []
        for (let i = 1; i <= CONFIG.MAX_DEVICES_PER_CODE; i++) {
            const dev = codeInfo[`device_${i}`]
            if (dev) {
                boundDevices.push(dev)
                if (dev === deviceId) {
                    return NextResponse.json({
                        success: true,
                        message: '设备已激活',
                        isExisting: true,
                        code: upperCode,
                    })
                }
            }
        }

        // 检查是否还有空位
        if (boundDevices.length >= CONFIG.MAX_DEVICES_PER_CODE) {
            return NextResponse.json({
                success: false,
                error: `该激活码已绑定 ${CONFIG.MAX_DEVICES_PER_CODE} 台设备，无法绑定更多设备。如需更换设备，请联系管理员解绑。`,
                code: 'DEVICE_LIMIT_REACHED',
                boundDeviceCount: boundDevices.length,
                maxDevices: CONFIG.MAX_DEVICES_PER_CODE,
            }, { status: 403 })
        }

        // 绑定新设备
        const slotIndex = boundDevices.length + 1
        const now = new Date().toISOString()
        await kvRequest(['HSET', codeKey, `device_${slotIndex}`, deviceId, `device_${slotIndex}_bound_at`, now])

        return NextResponse.json({
            success: true,
            message: '激活成功！',
            isExisting: false,
            code: upperCode,
            devicesUsed: slotIndex,
            devicesMax: CONFIG.MAX_DEVICES_PER_CODE,
        })

    } catch (error) {
        console.error('Activation error:', error)
        return NextResponse.json(
            { success: false, error: '服务器错误，请稍后重试' },
            { status: 500 }
        )
    }
}

// ===== 管理员操作处理 =====
async function handleAdminAction(
    action: string,
    params: { count?: number; targetCode?: string; targetDevice?: string }
) {
    switch (action) {
        // 批量生成激活码
        case 'generate': {
            const count = Math.min(params.count || 1, 100) // 最多一次生成 100 个
            const codes: string[] = []

            for (let i = 0; i < count; i++) {
                let newCode: string
                let attempts = 0
                // 防止重复
                do {
                    newCode = generateCode()
                    attempts++
                } while (attempts < 10 && codes.includes(newCode))

                codes.push(newCode)
            }

            // 写入 KV
            for (const c of codes) {
                const codeKey = getCodeKey(c)
                const now = new Date().toISOString()
                await kvRequest(['HSET', codeKey, 'status', 'active', 'createdAt', now])
                await kvRequest(['SADD', CODES_INDEX_KEY, c])
            }

            return NextResponse.json({
                success: true,
                message: `成功生成 ${codes.length} 个激活码`,
                codes,
            })
        }

        // 查看所有激活码状态
        case 'list': {
            const allCodes = await kvRequest(['SMEMBERS', CODES_INDEX_KEY])
            if (!allCodes || !Array.isArray(allCodes)) {
                return NextResponse.json({ success: true, codes: [], total: 0 })
            }

            const codesDetail = []
            for (const c of allCodes as string[]) {
                const codeKey = getCodeKey(c)
                const data = await kvRequest(['HGETALL', codeKey])
                const info: Record<string, string> = {}
                if (Array.isArray(data)) {
                    for (let i = 0; i < data.length; i += 2) {
                        info[data[i]] = data[i + 1]
                    }
                }

                const devices: { id: string; boundAt: string }[] = []
                for (let i = 1; i <= CONFIG.MAX_DEVICES_PER_CODE; i++) {
                    if (info[`device_${i}`]) {
                        devices.push({
                            id: info[`device_${i}`],
                            boundAt: info[`device_${i}_bound_at`] || 'unknown',
                        })
                    }
                }

                codesDetail.push({
                    code: c,
                    status: info.status || 'unknown',
                    createdAt: info.createdAt || 'unknown',
                    devices,
                    devicesUsed: devices.length,
                    devicesMax: CONFIG.MAX_DEVICES_PER_CODE,
                })
            }

            // 按创建时间倒序
            codesDetail.sort((a, b) => b.createdAt.localeCompare(a.createdAt))

            return NextResponse.json({
                success: true,
                total: codesDetail.length,
                codes: codesDetail,
            })
        }

        // 解绑设备
        case 'unbind': {
            if (!params.targetCode || !params.targetDevice) {
                return NextResponse.json({ success: false, error: '缺少参数' }, { status: 400 })
            }

            const codeKey = getCodeKey(params.targetCode)
            const data = await kvRequest(['HGETALL', codeKey])
            if (!data) {
                return NextResponse.json({ success: false, error: '激活码不存在' }, { status: 404 })
            }

            const info: Record<string, string> = {}
            if (Array.isArray(data)) {
                for (let i = 0; i < data.length; i += 2) {
                    info[data[i]] = data[i + 1]
                }
            }

            // 找到并移除设备，然后重新排列
            const remainingDevices: { id: string; boundAt: string }[] = []
            let found = false
            for (let i = 1; i <= CONFIG.MAX_DEVICES_PER_CODE; i++) {
                const dev = info[`device_${i}`]
                if (dev === params.targetDevice) {
                    found = true
                } else if (dev) {
                    remainingDevices.push({
                        id: dev,
                        boundAt: info[`device_${i}_bound_at`] || '',
                    })
                }
            }

            if (!found) {
                return NextResponse.json({ success: false, error: '设备未找到' }, { status: 404 })
            }

            // 清除所有设备字段
            for (let i = 1; i <= CONFIG.MAX_DEVICES_PER_CODE; i++) {
                await kvRequest(['HDEL', codeKey, `device_${i}`, `device_${i}_bound_at`])
            }

            // 重新写入剩余设备
            for (let i = 0; i < remainingDevices.length; i++) {
                await kvRequest([
                    'HSET', codeKey,
                    `device_${i + 1}`, remainingDevices[i].id,
                    `device_${i + 1}_bound_at`, remainingDevices[i].boundAt,
                ])
            }

            return NextResponse.json({
                success: true,
                message: '设备已解绑',
                remainingDevices: remainingDevices.length,
            })
        }

        // 禁用/启用激活码
        case 'toggle': {
            if (!params.targetCode) {
                return NextResponse.json({ success: false, error: '缺少激活码' }, { status: 400 })
            }

            const codeKey = getCodeKey(params.targetCode)
            const currentStatus = await kvRequest(['HGET', codeKey, 'status'])
            const newStatus = currentStatus === 'disabled' ? 'active' : 'disabled'
            await kvRequest(['HSET', codeKey, 'status', newStatus])

            return NextResponse.json({
                success: true,
                message: `激活码已${newStatus === 'active' ? '启用' : '禁用'}`,
                newStatus,
            })
        }

        // 删除激活码
        case 'delete': {
            if (!params.targetCode) {
                return NextResponse.json({ success: false, error: '缺少激活码' }, { status: 400 })
            }

            const codeKey = getCodeKey(params.targetCode)
            await kvRequest(['DEL', codeKey])
            await kvRequest(['SREM', CODES_INDEX_KEY, params.targetCode])

            return NextResponse.json({
                success: true,
                message: '激活码已删除',
            })
        }

        default:
            return NextResponse.json({ success: false, error: '未知操作' }, { status: 400 })
    }
}

// ===== GET: 管理员查看总览 =====
export async function GET(req: NextRequest) {
    const url = new URL(req.url)
    const adminPwd = url.searchParams.get('code')

    if (adminPwd !== CONFIG.ADMIN_PASSWORD) {
        return NextResponse.json({ error: '无权限' }, { status: 403 })
    }

    const kvAvailable = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
    if (!kvAvailable) {
        return NextResponse.json({
            success: false,
            error: 'KV 未配置',
            note: '请在 Vercel 控制台配置 KV 存储',
        })
    }

    const allCodes = await kvRequest(['SMEMBERS', CODES_INDEX_KEY])
    if (!allCodes || !Array.isArray(allCodes)) {
        return NextResponse.json({
            success: true,
            totalCodes: 0,
            activeCodes: 0,
            totalDevices: 0,
        })
    }

    let activeCodes = 0
    let totalDevices = 0

    for (const c of allCodes as string[]) {
        const codeKey = getCodeKey(c)
        const status = await kvRequest(['HGET', codeKey, 'status'])
        if (status === 'active') activeCodes++

        for (let i = 1; i <= CONFIG.MAX_DEVICES_PER_CODE; i++) {
            const dev = await kvRequest(['HGET', codeKey, `device_${i}`])
            if (dev) totalDevices++
        }
    }

    return NextResponse.json({
        success: true,
        totalCodes: (allCodes as string[]).length,
        activeCodes,
        totalDevices,
        maxDevicesPerCode: CONFIG.MAX_DEVICES_PER_CODE,
    })
}
